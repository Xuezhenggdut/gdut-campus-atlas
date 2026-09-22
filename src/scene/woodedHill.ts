import * as T from 'three';
import {buildings,toWorld,type Point} from '../data/campus';
import {inside,lakePolygons,lakeIsland,lakeBankRings,roads,promenades} from '../data/landscape';
import {unprojectMap} from '../data/projection';
import {Parts} from './geometry';

const banks=lakeBankRings.map(p=>p.map(toWorld));
const lanes=[...roads.map(r=>({p:r.points.map(toWorld),w:r.width*.45+4})),...promenades.map(p=>({p:p.map(toWorld),w:4}))];
const masses=buildings.filter(b=>!['lake','plaza','gate'].includes(b.kind)).map(b=>({...b,p:toWorld(b.position)}));
function distance(x:number,z:number,points:Point[],closed=false){
 let best=Infinity;for(let i=0;i<points.length-(closed?0:1);i++){
  const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
  best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));
 }return best;
}
const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
/** Low wooded rise visible west of the administration canal. Height is an
 * appearance estimate: the satellite establishes land cover, not elevations. */
export function woodedHillHeight(x:number,z:number){
 const r=((x-78)/102)**2+((z-283)/95)**2;if(r>=1)return 0;
 const uv=unprojectMap([x,z]);if(lakePolygons.some(p=>inside(uv,p))&&!inside(uv,lakeIsland))return 0;
 if(masses.some(b=>{const dx=x-b.p[0],dz=z-b.p[1],c=Math.cos(b.rotation),s=Math.sin(b.rotation);return Math.abs(dx*c-dz*s)<b.width/2+10&&Math.abs(dx*s+dz*c)<b.depth/2+10;}))return 0;
 const bank=Math.min(...banks.map(p=>distance(x,z,p,true)));
 const lane=Math.min(...lanes.map(p=>distance(x,z,p.p)-p.w));
 return 8.5*(1-r)**2*smooth((bank-5)/12)*smooth(lane/12);
}
export function makeWoodedHill(){
 const g=new T.PlaneGeometry(208,196,104,98);g.rotateX(-Math.PI/2);g.translate(78,0,283);
 const pos=g.getAttribute('position');for(let i=0;i<pos.count;i++)pos.setY(i,-.72+woodedHillHeight(pos.getX(i),pos.getZ(i)));
 g.computeVertexNormals();const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:'#a8bc91',roughness:1}));mesh.receiveShadow=true;
 return mesh;
}
export function makeAdministrationFootbridge(){
 const p=new Parts(),admin=buildings.find(b=>b.id==='b-admin')!,[x,z]=toWorld(admin.position);
 const start=181,end=x-admin.width*.43,zz=z+5.8,deck=4.1;
 p.box(end-start,.45,3.4,(start+end)/2,deck-.225,zz,'#d4d1c5');
 for(const side of [-1,1]){
  for(const h of [.35,.7,1.05])p.beam([start,deck+h,zz+side*1.6],[end,deck+h,zz+side*1.6],.08,'#e6e7dd');
  for(let xx=start;xx<=end;xx+=3.4)p.box(.1,1.1,.1,xx,deck+.55,zz+side*1.6,'#e6e7dd');
 }
 for(let i=0;i<10;i++)p.box(1.1,.41*(i+1),3.4,start-10+i, .205*(i+1),zz,'#d4d1c5');
 const group=p.finish();group.name='administration-west-footbridge';return group;
}
