import * as T from 'three';
import {buildings,toWorld} from '../data/campus';
import {Parts} from './geometry';

export const floodlitFieldIds=['b-central-track','b-south-track','b-library-football','b-cricket'];
export const floodlitCourtIds=['b-tennis','b-courts-west','b-courts-south','b-courts-library'];
export function sportsMastSites(){
 return [...floodlitFieldIds,...floodlitCourtIds].flatMap(id=>{
  const b=buildings.find(v=>v.id===id)!,[x,z]=toWorld(b.position),c=Math.cos(b.rotation),s=Math.sin(b.rotation);
  const court=floodlitCourtIds.includes(id),setback=court?3:5;
  return [[-1,-1],[-1,1],[1,-1],[1,1]].map(([sx,sz],i)=>{
   // The cricket oval is squeezed between two perimeter roads on the west;
   // place its masts beyond the curved end stands, not at the road corners.
   const u=sx*(id==='b-cricket'?b.width*.32:id==='b-tennis'?b.width*.20:id==='b-central-track'?b.width*.34:b.width/2+setback),v=sz*(b.depth/2+setback);
   return {id,index:i,x:x+u*c+v*s,z:z-u*s+v*c,height:court?18:id==='b-cricket'?36:31,court,target:new T.Vector3(x,1.7,z),active:i===0||i===3};
  });
 });
}

export function makeSportsLighting(){
 const g=new T.Group();g.name='sports-floodlighting';const p=new Parts(),emit=new Parts();
 for(const site of sportsMastSites()){
  const {x,z,height:h}=site,dx=site.target.x-x,dz=site.target.z-z,len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  p.cylinder(site.court?.29:.5,h,x,h/2+1,z,'#9aabb7',site.court?.18:.24,10);p.box(site.court?1:1.5,.55,site.court?1:1.5,x,1.1,z,'#85949b');
  // A six-projector crosshead faces inward. Its luminous lenses are tilted
  // downward with the housings; no floating bright patch at field level.
  const angle=Math.atan2(ux,uz),tilt=.48;
  for(const row of site.court?[0]:[-1,1])for(const col of site.court?[-.65,.65]:[-1,0,1]){
   const cx=x+uz*col*1.5,cz=z-ux*col*1.5,cy=h+row*.55;
   const q=new T.Quaternion().setFromEuler(new T.Euler(0,angle,0)).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),tilt));
   const rotation=new T.Euler().setFromQuaternion(q);
   p.add(new T.BoxGeometry(1.2,.85,.45),'#526270',[cx,cy,cz],[rotation.x,rotation.y,rotation.z]);
   const lens=new T.Vector3(0,0,.25).applyQuaternion(q);
   emit.add(new T.BoxGeometry(1.02,.67,.06),'#ecf4ff',[cx+lens.x,cy+lens.y,cz+lens.z],[rotation.x,rotation.y,rotation.z]);
  }
  p.beam([x-uz*2,h,z+ux*2],[x+uz*2,h,z-ux*2],.2,'#9aabb7');
  // Two opposite masts per field provide a broad overlapping wash. Remaining
  // heads share that schematic illumination; no additional shadow passes.
  if(site.active){
   const light=new T.SpotLight('#e7efff',idPower(site.id),site.court?135:190,site.court?1.04:.91,.68,2);
   light.name=`floodlight-${site.id}-${site.index}`;light.userData.fieldId=site.id;
   light.position.set(x,h,z);light.target.position.copy(site.target);
   g.add(light,light.target);
  }
 }
 const structures=p.finish();structures.name='sports-high-masts';g.add(structures);
 const heads=emit.finish();heads.name='sports-projector-lenses';heads.traverse(o=>{if(o instanceof T.Mesh){(o.material as T.Material).dispose();o.material=new T.MeshBasicMaterial({color:'#e5efff',toneMapped:false});o.castShadow=false;}});g.add(heads);return g;
}
function idPower(id:string){return floodlitCourtIds.includes(id)?(id==='b-courts-library'?5200:7800):id==='b-cricket'?17000:11500;}
