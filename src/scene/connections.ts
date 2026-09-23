import * as T from 'three';
import {Parts} from './geometry';
import {entrancePodium} from './entrancePodium';
import {makeValleyPortal} from './teachingEntrance';
import {makeTeachingLinks} from './teachingLinks';
import {makeTeachingCourtyard} from './teachingCourtyard';
import {buildings,places,toWorld,type Area} from '../data/campus';

// Only links explicitly visible in the official drawing; not pedestrian routing data.
const rows=[['east',1,2,3],['east',4,5,6,7,8],['east',9,10],['east',12,13,14],['west',1,2,3,4],['west',5,6,7,8,9],['west',10,11,12],['west',13,14]] as const;
export function makeConnections(area?:Area){const p=new Parts();
 if(!area||area==='academic'){makeValleyPortal(p);makeTeachingCourtyard(p);}
 // East 9/10/11 are single connected dorm buildings. Keep the ground-level
 // passage open while carrying the occupied storeys into the eastern wing.
 if(!area||area==='east')for(const n of [9,10,11]){
  const a=buildings.find(b=>b.id===`b-east-dorm-${n}`)!,b=buildings.find(b=>b.id===`b-east-dorm-${n}-east-wing`)!;
  const [ax,z]=toWorld(a.position),[bx]=toWorld(b.position),x0=ax+a.width/2-1,x1=bx-b.width/2+1;
  const step=a.height/a.floors,depth=Math.min(a.depth,b.depth)*.3;
  for(let f=1;f<=a.floors;f++){
   const y=f*step;
   p.box(x1-x0,.34,depth,(x0+x1)/2,y,z,'#c4c6ba');
   for(const side of [-1,1]){
    for(let k=0;k<4;k++)p.box(x1-x0,.085,.085,(x0+x1)/2,y+.45+k*.28,z+side*depth/2,'#708d88');
    for(let x=x0;x<=x1;x+=2)p.box(.09,1.12,.09,x,y+.76,z+side*depth/2,'#e3e3d7');
   }
  }
 }
 for(const row of rows){if(area&&area!==row[0])continue;for(let i=2;i<row.length;i++){
  const a=buildings.find(b=>b.id===`b-${row[0]}-dorm-${row[i-1]}`)!,b=buildings.find(b=>b.id===`b-${row[0]}-dorm-${row[i]}`)!;
  const aa=toWorld(a.position),bb=toWorld(b.position),dx=bb[0]-aa[0],dz=bb[1]-aa[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  const start:[number,number,number]=[aa[0]+ux*a.depth*.46,a.height*.77+1,aa[1]+uz*a.depth*.46],end:[number,number,number]=[bb[0]-ux*b.depth*.46,b.height*.77+1,bb[1]-uz*b.depth*.46];
  const length=Math.hypot(end[0]-start[0],end[2]-start[2]),x=(start[0]+end[0])/2,z=(start[2]+end[2])/2,y=start[1],rot=-Math.atan2(dz,dx);
  p.box(length,.55,3.1,x,y,z,'#dde3d9',rot);
  for(const side of [-1,1]){const xx=x-uz*side*1.45,zz=z+ux*side*1.45;p.box(length,.14,.12,xx,y+1.4,zz,'#ecece2',rot);for(let j=0;j<=Math.ceil(length/2);j++){const t=j/Math.ceil(length/2)-.5;p.box(.12,1.4,.12,xx+ux*t*length,y+.7,zz+uz*t*length,'#ecece2');}}
 }}
 // Roof-height open grids, not solid pedestrian bridges: four pairs are
 // explicitly visible in the supplied official-map crops.
 if(!area||area==='academic')for(const [aid,bid] of [['engineering-1','science'],['engineering-2','lab-1'],['engineering-3','lab-2'],['engineering-4','lab-3']]){
  const a=buildings.find(b=>b.id==='b-'+aid)!,b=buildings.find(b=>b.id==='b-'+bid)!;
  const [ax,az]=toWorld(a.position),[bx,bz]=toWorld(b.position),x1=ax+a.width/2,x2=bx-b.width/2;
  const depth=Math.min(a.depth,b.depth)*.9,y1=a.height+1.65,y2=b.height+1.65;
  for(let i=0;i<=7;i++){
   const dz=-depth/2+i*depth/7;p.beam([x1,y1,az+dz],[x2,y2,bz+dz],.28,'#e8e8de');
  }
  const n=Math.max(2,Math.ceil((x2-x1)/3));
  for(let i=0;i<=n;i++){const t=i/n,x=x1+(x2-x1)*t,z=az+(bz-az)*t,y=y1+(y2-y1)*t;p.box(.28,.28,depth,x,y,z,'#e8e8de');}
  // End supports are placed at the building edges, leaving the road clear.
  for(const [x,z,y] of [[x1,az,y1],[x2,bz,y2]])for(const side of [-1,1])p.box(.65,y,.65,x,y/2,z+side*depth/2,'#e8e8de');
 }
 if(!area||area==='academic')makeTeachingLinks(p);
 // Multi-level open links between the technology blocks, distinct from the
 // roof-only research grids. Endpoints follow each body's edge.
 if(!area||area==='academic')for(const [aid,bid] of [['innovation-b','innovation-a'],['innovation-a','truth-a'],['truth-b','truth-a']]){
  const a=buildings.find(b=>b.id==='b-'+aid)!,b=buildings.find(b=>b.id==='b-'+bid)!;
  const [ax,az]=toWorld(a.position),[bx,bz]=toWorld(b.position),ns=Math.abs(bz-az)>Math.abs(bx-ax),x1=ns?ax:ax+a.width/2,x2=ns?bx:bx-b.width/2,z1=ns?az+a.depth/2:az,z2=ns?bz-b.depth/2:bz;
  if(!ns&&x2<=x1)continue;
  for(const y of [6,12,18,24]){
   const len=Math.hypot(x2-x1,z2-z1),rot=-Math.atan2(z2-z1,x2-x1),x=(x1+x2)/2,z=(z1+z2)/2;
   p.box(len,.4,3.3,x,y,z,'#eeeede',rot);
   for(const side of [-1,1]){const nx=-(z2-z1)/len*side*1.5,nz=(x2-x1)/len*side*1.5;
    for(const dy of [.35,.7,1.05])p.box(len,.1,.1,x+nx,y+dy,z+nz,'#b0bdb9',rot);
   }
  }
  for(const [x,z] of [[x1,z1],[x2,z2]])for(const side of [-1,1])p.box(.45,25,.45,x+(ns?side*1.5:0),12.5,z+(ns?0:side*1.5),'#eeeede');
 }
 if(!area||area==='academic')entrancePodium(p);
 const group=p.finish();group.name='PDF-confirmed-connections';return group;
}
