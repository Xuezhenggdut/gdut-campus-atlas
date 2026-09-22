import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {buildings,places,toWorld,type Point} from '../data/campus';
import {roads,lakePolygons,residentialWaters,inside} from '../data/landscape';
import {unprojectMap} from '../data/projection';
import {Parts} from './geometry';
import {makeSportsLighting} from './sportsLighting';

// Existing glazing only: never make concrete, water or tree materials glow.
const glazing=new Set(['45626a','74969a','617d80','829c9f','74959a','416973','52696a','849a9d','89a7a6']);
const libraryIntensity:Record<string,number>={'60777b':.88,'435d64':.24,'99aaa5':2.1,'354d50':.36};
const libraryScreen=new Set(['727d7d','758181','788383','6f7c7e']);
export function applyNightEmission(root:T.Object3D,night:boolean){
 root.traverse(o=>{if(!(o instanceof T.Mesh))return;
  for(const m of Array.isArray(o.material)?o.material:[o.material])if((m instanceof T.MeshStandardMaterial||m instanceof T.MeshLambertMaterial)&&glazing.has(m.color.getHexString())){
   m.emissive.set(night?'#ffd09a':'#000000');m.emissiveIntensity=night?.85:0;
  }
  for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial||m instanceof T.MeshLambertMaterial){
   const strength=libraryIntensity[m.color.getHexString()];
   if(strength!==undefined){m.emissive.set(night?'#ffdbad':'#000000');m.emissiveIntensity=night?strength:0;}
   // The metal screen reads as a panel grid by day, with interior light
   // showing through its perforations at night; the screen itself is unlit.
   if(libraryScreen.has(m.color.getHexString())){
    if(m.transparent!==night)m.needsUpdate=true;
    m.transparent=night;m.opacity=night?.48:1;m.depthWrite=!night;
   }
  }
 });
}

export function roadLampSites(){
 const sites:{x:number;z:number;pool:Point}[]=[],occupied:Point[]=[];
 const solids=buildings.filter(b=>b.height>4&&b.kind!=='gate'&&places.find(p=>p.id===b.placeIds[0])?.status==='built');
 for(const road of roads){
  // The elevated middle-ring road has a separate deck and no ground lamps here.
  if(road.name==='大学城中环西路')continue;
  for(let i=1;i<road.points.length;i++){
   const a=toWorld(road.points[i-1]),b=toWorld(road.points[i]),len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<12)continue;
   const ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len;
   for(let t=12;t<len-5;t+=36){
    const side=(Math.floor(t/36)+i)%2?1:-1,offset=road.width*.45+1.8;
    const x=a[0]+ux*t-uz*offset*side,z=a[1]+uz*t+ux*offset*side,uv=unprojectMap([x,z]);
    if([...lakePolygons,...residentialWaters].some(p=>inside(uv,p))||occupied.some(p=>Math.hypot(p[0]-x,p[1]-z)<15))continue;
    if(solids.some(v=>{const [bx,bz]=toWorld(v.position),c=Math.cos(v.rotation),s=Math.sin(v.rotation),dx=x-bx,dz=z-bz;return Math.abs(dx*c-dz*s)<v.width/2+3&&Math.abs(dx*s+dz*c)<v.depth/2+3;}))continue;
    occupied.push([x,z]);sites.push({x,z,pool:[x+uz*side*3,z-ux*side*3]});
   }
  }
 }
 return sites;
}

// Soft additive pools use vertex falloff, shared geometry/materials and no
// per-lamp dynamic shadows. Landmark and high-mast lights illuminate surfaces.
export function makeNightLighting(){
 const group=new T.Group();group.name='night-lighting';const fixtures=new Parts(),bulbs=new Parts(),pools:T.BufferGeometry[]=[];
 function pool(x:number,z:number,r:number){
  const g=new T.CircleGeometry(r,24);g.rotateX(-Math.PI/2);g.translate(x,1.02,z);
  const colors=new Float32Array(g.getAttribute('position').count*3);colors.set([1,.61,.25],0);
  g.setAttribute('color',new T.BufferAttribute(colors,3));g.deleteAttribute('uv');pools.push(g.toNonIndexed());g.dispose();
 }
 for(const {x,z,pool:[px,pz]} of roadLampSites()){
  fixtures.box(.2,6.5,.2,x,3.7,z,'#455368');fixtures.box(1.5,.22,.65,x,7,z,'#455368');
  bulbs.box(1.35,.12,.56,x,6.84,z,'#ffe0a5');pool(px,pz,8.5);
 }
 for(const b of buildings.filter(v=>/^b-(east|west)-dorm-/.test(v.id)&&places.find(p=>p.id===v.placeIds[0])?.status==='built')){
  const [x,z]=toWorld(b.position),c=Math.cos(b.rotation),s=Math.sin(b.rotation);
  for(let f=1;f<b.floors;f++)for(const side of [-1,1])for(const u of [-b.width*.32,0,b.width*.32]){
   const v=side*(b.depth/2+.65);bulbs.box(b.width*.12,.14,.2,x+u*c+v*s,1+f*b.height/b.floors-.45,z-u*s+v*c,'#ffe0a5',b.rotation);
  }
 }
 const admin=buildings.find(b=>b.id==='b-admin')!,[ax,az]=toWorld(admin.position);
 for(const x of [350,364,378,392,406,413]){bulbs.box(.22,25,.22,x,14,az+28.6,'#ffe0a5');pool(x,az+35,5);}
 const housings=fixtures.finish();housings.name='night-lamp-housings';group.add(housings);
 const lit=bulbs.finish();lit.name='night-luminous-fixtures';lit.traverse(o=>{if(o instanceof T.Mesh){(o.material as T.Material).dispose();o.material=new T.MeshBasicMaterial({color:'#ffdaa0',toneMapped:false});o.castShadow=false;}});group.add(lit);
 if(pools.length){const geometry=mergeGeometries(pools);pools.forEach(g=>g.dispose());const ground=new T.Mesh(geometry,new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.43,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));ground.name='night-road-light-pools';group.add(ground);}
 const spot=(pos:Point,target:Point,y:number,ty:number,power:number)=>{const light=new T.SpotLight('#ffd49b',power,90,.65,.85,2);light.position.set(pos[0],y,pos[1]);light.target.position.set(target[0],ty,target[1]);group.add(light,light.target);};
 spot([ax+147.5,az+91],[ax+147.5,az+75],5,9,2200);
 spot([383,az+50],[383,az+28],7,19,3200);
 group.add(makeSportsLighting());
 group.visible=false;return group;
}
