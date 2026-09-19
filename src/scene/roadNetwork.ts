import * as T from 'three';
import {roads} from '../data/landscape';
import {toWorld} from '../data/campus';
import {Parts,pathMesh} from './geometry';

export function roadElevation(name:string|undefined,x:number){
 void name;void x;return .4;
}
function academicEastJunction(parts:Parts){
 const x=97,z=-50,blue='#1a9ac4',mark='#f3f0df',yellow='#d6ad43';
 // The supplied aerial shows blue cycle-priority aprons on all four corners.
 for(const sx of [-1,1])for(const sz of [-1,1]){
  parts.box(7.2,.035,5.2,x+sx*8.0,.47,z+sz*6.8,blue);
  parts.box(3.8,.04,1.1,x+sx*11.6,.49,z+sz*6.8,blue);
 }
 // Four zebra crossings sit just outside the turning area.
 for(const sz of [-1,1])for(let i=-4;i<=4;i++)parts.box(1.05,.04,3.9,x+i*1.55,.5,z+sz*10.2,mark);
 for(const sx of [-1,1])for(let i=-4;i<=4;i++)parts.box(3.9,.04,1.05,x+sx*11.3,.5,z+i*1.45,mark);
 // Short dashed yellow guides make the campus junction legible from above.
 for(const sz of [-1,1])for(let i=0;i<3;i++)parts.box(.18,.045,2.7,x,.51,z+sz*(14+i*4),yellow);
 for(const sx of [-1,1])for(let i=0;i<3;i++)parts.box(2.7,.045,.18,x+sx*(15+i*4),.51,z,yellow);
}
function signalizedJunction(parts:Parts,x:number,z:number){
 const pole='#68736d',head='#394843',red='#d35d4c',amber='#e0b34f',green='#63a36d';
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const px=x+sx*7,pz=z+sz*7;
  parts.cylinder(.12,4.2,px,2.1,pz,pole);
  parts.box(.42,1.35,.28,px,4.15,pz,head);
  parts.cylinder(.08,.04,px,4.52,pz-.15*sz,red, .08, 8);
  parts.cylinder(.08,.04,px,4.15,pz-.15*sz,amber, .08, 8);
  parts.cylinder(.08,.04,px,3.78,pz-.15*sz,green, .08, 8);
 }
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
 }
 academicEastJunction(parts);
 signalizedJunction(parts,-255,-95);
 signalizedJunction(parts,97,-93);
 group.add(parts.finish());group.name='roads-with-GDUT-overpass';return group;
}
