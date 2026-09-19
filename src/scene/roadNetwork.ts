import * as T from 'three';
import {roads} from '../data/landscape';
import {toWorld} from '../data/campus';
import {Parts,pathMesh} from './geometry';

// Schematic grade separation confirmed by the user's satellite annotation.
// The east-west public road passes ABOVE the north-south campus connection.
export function roadElevation(name:string|undefined,x:number){
 if(name!=='大学城中环西路')return .4;
 if(x<20||x>175)return .4;
 if(x<68)return .4+(x-20)/48*7.1;
 if(x>126)return .4+(175-x)/49*7.1;
 return 7.5;
}
export function makeRoadNetwork(){
 const group=new T.Group(),parts=new Parts();
 for(const road of roads){
  const points=road.points.map(toWorld),sampled:[number,number][]=[];
  points.forEach((a,i)=>{if(!i){sampled.push(a);return;}const b=points[i-1],n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/2);
   for(let j=1;j<=n;j++)sampled.push([b[0]+(a[0]-b[0])*j/n,b[1]+(a[1]-b[1])*j/n]);
  });
  // Flat-road miters use the original bends: dense samples next to a bend can
  // fold wide road triangles back over themselves. The overpass needs its ramp samples.
  const surfacePoints=road.name==='大学城中环西路'?sampled:points;
  for(const shoulder of [true,false]){
   const mesh=pathMesh(surfacePoints,road.width*.9+(shoulder?3:0),shoulder?'#d9d9c8':road.main?'#7e8c87':'#a0a497');
   const pos=mesh.geometry.getAttribute('position');for(let j=0;j<pos.count;j++)pos.setY(j,roadElevation(road.name,surfacePoints[Math.floor(j/2)][0])-(shoulder?.1:0));pos.needsUpdate=true;mesh.geometry.computeVertexNormals();group.add(mesh);
  }
  if(road.main)for(let j=2;j<sampled.length;j+=4){
   const a=sampled[j-1],b=sampled[j],x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,rot=-Math.atan2(b[1]-a[1],b[0]-a[0]);
   parts.box(3,.025,.18,x,roadElevation(road.name,x)+.025,z,'#e9e6ce',rot);
  }
  if(road.name==='大学城中环西路'){
   const section=sampled.filter(p=>p[0]>=22&&p[0]<=173);
   for(let i=1;i<section.length;i++){
    const a=section[i-1],b=section[i],ya=roadElevation(road.name,a[0]),yb=roadElevation(road.name,b[0]);
    for(const side of [-1,1]){const z=side*(road.width*.45+1);
     parts.beam([a[0],ya-.45,a[1]+z],[b[0],yb-.45,b[1]+z],.85,'#b8beb7');
     for(const y of [.35,.75,1.15])parts.beam([a[0],ya+y,a[1]+z],[b[0],yb+y,b[1]+z],.12,'#dce0d6');
     if(i%2===0)parts.box(.14,1.2,.14,b[0],yb+.6,b[1]+z,'#dce0d6');
    }
   }
   // Abutments outside the full width of the campus road at x=97.
   for(const x of [67,128])for(const z of [-103,-83])parts.box(1.4,6.3,1.4,x,3.15,z,'#b7bdb4');
  }
 }
 group.add(parts.finish());group.name='roads-with-GDUT-overpass';return group;
}
