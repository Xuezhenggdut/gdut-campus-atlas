import * as T from 'three';
import {residentialPark,residentialCanal,parkPoint,parkPaths,inside} from '../data/landscape';
import {toWorld,type Point} from '../data/campus';
import {Parts,flatPolygon,pathMesh} from './geometry';

export function makeResidentialPark(){
 const g=new T.Group(),p=new Parts();g.name='南二路公园';
 g.add(flatPolygon(residentialPark.map(toWorld),'#adc697',.12));
 g.add(flatPolygon(residentialCanal.map(toWorld),'#87b8b8',.18));
 const walks=parkPaths.map(ps=>ps.map(toWorld));
 walks.forEach(ps=>g.add(pathMesh(ps,2.3,'#e1dbc7',.46)));
 // Small footbridges at the three mapped cross-park connections. Detailed
 // benches, lamps and planting are schematic landscaping, not surveyed assets.
 for(const t of [.12,.46,.77]){
  const a=toWorld(parkPoint(.02,t)),b=toWorld(parkPoint(t===.77?.94:.42,t===.77?.8:t));
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,rot=-Math.atan2(dz,dx);
  p.box(length,.35,3,x,.7,z,'#c7bea5',rot);
  for(const side of [-1,1]){const nx=-dz/length*1.4*side,nz=dx/length*1.4*side;
   for(const y of [1.2,1.7])p.beam([a[0]+nx,y,a[1]+nz],[b[0]+nx,y,b[1]+nz],.1,'#e6e7d9');
   const n=Math.ceil(length/3);for(let j=0;j<=n;j++)p.box(.12,1.1,.12,a[0]+dx*j/n+nx,1.18,a[1]+dz*j/n+nz,'#e6e7d9');
  }
 }
 const nearPath=(q:Point)=>walks.some(ps=>ps.some((a,i)=>{if(!i)return false;const b=ps[i-1],dx=a[0]-b[0],dz=a[1]-b[1],t=Math.max(0,Math.min(1,((q[0]-b[0])*dx+(q[1]-b[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(q[0]-b[0]-dx*t,q[1]-b[1]-dz*t)<3.7;}));
 const rests=[.18,.38,.62,.70].map(t=>toWorld(parkPoint(.83,t)));
 for(let j=0;j<24;j++)for(let i=0;i<5;i++){
  const uv=parkPoint(.10+i*.18+Math.sin(i*13+j*7)*.035,.025+j*.04+Math.cos(i*3+j*11)*.01),q=toWorld(uv);
  if(inside(uv,residentialCanal)||nearPath(q)||rests.some(r=>Math.hypot(q[0]-r[0],q[1]-r[1])<6))continue;
  const [x,z]=q,r=1.7+(i+j)%3*.3;p.cylinder(.2,2.8,x,1.4,z,'#8c9271',.18,6);
  p.add(new T.IcosahedronGeometry(r,1),['#819e6b','#6d9364','#98b67b'][(i+j)%3],[x,3.3,z]);
 }
 for(const [x,z] of rests){
  p.cylinder(4.2,.13,x,.4,z,'#d5ceb9',4.2,24);
  for(const side of [-1,1]){p.box(2.7,.18,.8,x+side*2.6,.95,z,'#a28a63');p.box(2.7,.7,.12,x+side*2.6,1.25,z+.4,'#a28a63');for(const dx of [-1,1])p.box(.12,.6,.6,x+side*2.6+dx, .62,z,'#77816f');}
  p.cylinder(.11,4,x+3.8,2,z+1,'#768779',.11,8);p.box(.9,.15,.7,x+3.8,4,z+1,'#ece5cd');
 }
 g.add(p.finish());return g;
}
