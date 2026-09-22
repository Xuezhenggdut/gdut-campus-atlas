import * as T from 'three';
import {roads} from '../data/landscape';
import {toWorld} from '../data/campus';
import {Parts,pathMesh} from './geometry';
import {roadWidthAt} from '../data/roadWidths';

export const bridgeX=187;
const ring=roads.find(r=>r.name==='大学城中环西路')!.points.map(toWorld);
const segment=ring.slice(1).findIndex((b,i)=>ring[i][0]<=bridgeX&&b[0]>=bridgeX);
const a=ring[segment],b=ring[segment+1];
export const bridgeZ=a[1]+(b[1]-a[1])*(bridgeX-a[0])/(b[0]-a[0]);
export function roadElevation(name:string|undefined,x:number){
 x-=bridgeX-97;
 if(name!=='大学城中环西路'||x<20||x>175)return .4;
 if(x<68)return .4+(x-20)/48*7.1;
 if(x>126)return .4+(175-x)/49*7.1;
 return 7.5;
}
function academicEastJunction(parts:Parts){
 const [x,z]=toWorld(roads.find(r=>r.name==='教学区—东区北联络路')!.points[0]),blue='#1a9ac4',mark='#f3f0df',yellow='#d6ad43';
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
   const pos=mesh.geometry.getAttribute('position');for(let j=0;j<pos.count;j++){
    const [x,z]=surfacePoints[Math.floor(j/2)],width=roadWidthAt(road.name,x,z,road.width);
    const border=width<road.width?1.4+1.6*(width-6)/(road.width-6):3;
    const ratio=(width*.9+(shoulder?border:0))/(road.width*.9+(shoulder?3:0));
    pos.setX(j,x+(pos.getX(j)-x)*ratio);pos.setZ(j,z+(pos.getZ(j)-z)*ratio);
    pos.setY(j,roadElevation(road.name,x)-(shoulder?.1:0));
   }pos.needsUpdate=true;mesh.geometry.computeVertexNormals();group.add(mesh);
  }
  if(road.main)for(let j=2;j<sampled.length;j+=4){
   const a=sampled[j-1],b=sampled[j],x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,rot=-Math.atan2(b[1]-a[1],b[0]-a[0]);
   parts.box(3,.025,.18,x,roadElevation(road.name,x)+.025,z,'#e9e6ce',rot);
  }
 }
 academicEastJunction(parts);
 for(const dz of [-6,6])parts.beam([277,1.5,384+dz],[318,1.5,363+dz],.22,'#dce0d6');
 // Outer-ring crossing above the canal flowing south past the main entrance.
 for(const z of [458,482]){
  parts.beam([286,1.5,z],[327,1.5,z],.22,'#dce0d6');
  for(let x=286;x<=327;x+=4.1)parts.box(.18,1.1,.18,x,.95,z,'#dce0d6');
 }
 // 广工天桥: supports leave the complete Tiaozhan Road corridor open.
 for(const x of [bridgeX-30,bridgeX+31])for(const z of [bridgeZ-10,bridgeZ+10])parts.box(1.4,6.3,1.4,x,3.15,z,'#b7bdb4');
 for(const z of [bridgeZ-12,bridgeZ+12])parts.beam([bridgeX-29,7.8,z],[bridgeX+29,7.8,z],.25,'#dce0d6');
 group.add(parts.finish());group.name='roads-with-GDUT-overpass';return group;
}
