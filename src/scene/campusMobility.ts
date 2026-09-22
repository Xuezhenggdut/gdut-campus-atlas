import * as T from 'three';
import {roads} from '../data/landscape';
import {toWorld,type Point} from '../data/campus';
import {Parts} from './geometry';
import {roadElevation} from './roadNetwork';

export type MobilityRoute={name:string;width:number;points:Point[];distances:number[];length:number};
export function mobilityRoute(name:string,width:number,points:Point[]):MobilityRoute{
 const clean=points.filter((p,i)=>!i||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>.01),distances=[0];
 for(let i=1;i<clean.length;i++)distances.push(distances[i-1]+Math.hypot(clean[i][0]-clean[i-1][0],clean[i][1]-clean[i-1][1]));
 return {name,width,points:clean,distances,length:distances.at(-1)!};
}
export function routePose(route:MobilityRoute,distance:number,direction:number,lane:number){
 const d=((distance%route.length)+route.length)%route.length;
 let i=1;while(i<route.distances.length-1&&route.distances[i]<d)i++;
 const a=route.points[i-1],b=route.points[i],len=route.distances[i]-route.distances[i-1],t=(d-route.distances[i-1])/len,ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len;
 const x=a[0]+(b[0]-a[0])*t+uz*lane*direction,z=a[1]+(b[1]-a[1])*t-ux*lane*direction;
 const front=roadElevation(route.name,x+ux*direction*2.9),rear=roadElevation(route.name,x-ux*direction*2.9);
 return {x,z,y:roadElevation(route.name,x)+.06,pitch:-Math.atan2(front-rear,5.8),yaw:Math.atan2(ux*direction,uz*direction),scale:Math.min(1,d/5,(route.length-d)/5)};
}
const internalNames=new Set(['创新大道','知行大道','知行大道（南1门段）','环教北路','教学区—东区北联络路','体育馆—网球场连接路','教学区—东区桥下通道','求是路','明德路','博雅路','研学二路','科研楼组团横向道路','教学楼组团横向道路','教学楼组团东西通道','西区滨水路','环教路']);
export function mobilityRoutes(){return {
 external:roads.filter(r=>r.name==='大学城外环西路'||r.name==='大学城中环西路').map(r=>mobilityRoute(r.name!,r.width,r.points.map(toWorld))),
 internal:roads.filter(r=>internalNames.has(r.name??'')||r.name==='挑战路'||r.name?.startsWith('东苑')||r.name?.startsWith('东区宿舍')).map(r=>mobilityRoute(r.name!,r.width,r.points.map(toWorld))),
};}
type Actor={route:MobilityRoute;offset:number;speed:number;direction:number;lane:number};
function actorSpecs(routes:MobilityRoute[],count:number,speed:number,kind:'car'|'bike'|'walker'):Actor[]{
 return Array.from({length:count},(_,i)=>{const route=routes[i%routes.length];return {route,offset:route.length*((i*.61803398875+.09)%1),speed:speed*(.82+(i%7)*.055),direction:i%2?1:-1,lane:kind==='car'?4.4:kind==='bike'?1.65:route.width*.45+.35};});
}
export function mobilityActors(){const r=mobilityRoutes();return {cars:actorSpecs(r.external,26,11,'car'),bikes:actorSpecs(r.internal,90,4.6,'bike'),walkers:actorSpecs(r.internal,48,1.25,'walker')};}
function person(p:Parts,y:number,rider=false){
 p.box(.66,.8,.44,0,y+.8,rider?-.05:0,'#ffffff');p.cylinder(.24,.43,0,y+1.43,rider?.04:0,'#cfa98b',.23,8);
 p.box(.46,.13,.45,0,y+1.66,rider?.04:0,'#34333a');
 if(rider){for(const side of [-1,1]){p.beam([side*.28,y+1.04,.03],[side*.48,y+.72,.71],.16,'#cfa98b');p.beam([side*.2,y+.47,-.1],[side*.30,y+.02,.38],.19,'#344259');}}
 else for(const side of [-1,1]){p.beam([side*.19,y+.42,0],[side*.23,y-.28,side*.12],.20,'#344259');p.beam([side*.4,y+1,0],[side*.43,y+.4,side*.1],.16,'#cfa98b');}
 p.box(.50,.58,.20,0,y+.82,-.32,'#47566d');
}
function vehicle(kind:'car'|'bike'|'walker'){
 const p=new Parts();
 if(kind==='car'){
  p.box(2.5,.78,5.8,0,1,0,'#ffffff');p.box(2.1,.85,2.8,0,1.8,-.2,'#45576b');p.box(2.15,.16,2.6,0,2.28,-.2,'#ffffff');
  for(const x of [-1.22,1.22])for(const z of [-1.8,1.8])p.add(new T.CylinderGeometry(.52,.52,.25,10),'#242b37',[x,.63,z],[0,0,Math.PI/2]);
  for(const x of [-.83,.83]){p.box(.62,.23,.08,x,1.16,2.94,'#ffe7b0');p.box(.60,.22,.08,x,1.16,-2.94,'#de514e');}
 }else if(kind==='bike'){
  // Yellow step-through frame, black basket and wheel guards evoke the shared
  // Meituan bikes requested by the user; this is a schematic vehicle model.
  for(const z of [-1.08,1.08]){p.add(new T.TorusGeometry(.66,.095,5,14),'#283440',[0,.75,z],[0,Math.PI/2,0]);p.beam([0,.75,z],[0,1.46,z*.45],.09,'#ffc928');}
  p.beam([0,.78,0],[0,1.45,-.45],.14,'#ffc928');p.beam([0,.78,0],[0,1.63,.85],.14,'#ffc928');p.beam([0,1.45,-.45],[0,1.17,.54],.13,'#ffc928');
  p.box(.55,.16,.46,0,1.60,-.49,'#283440');p.beam([-.51,1.96,.85],[.51,1.96,.85],.10,'#283440');
  p.box(.72,.48,.57,0,1.71,1.20,'#ffc928');p.box(.59,.13,.45,0,1.97,1.20,'#354254');
  p.box(.13,1.1,.36,0,.91,-1.03,'#ffc928');person(p,1.13,true);
 }else person(p,.28);
 return p.finish();
}
type Batch={group:T.Group;meshes:T.InstancedMesh[];actors:Actor[]};
function batch(kind:'car'|'bike'|'walker',actors:Actor[]):Batch{
 const prototype=vehicle(kind),group=new T.Group(),meshes:T.InstancedMesh[]=[];group.name=`mobility-${kind}`;
 const palette=kind==='car'?['#d2d9e0','#809cab','#c3ad8a','#a24b49','#ede7db','#465263']:['#b47464','#90b3b9','#d4c2a2','#879f80','#e4dfd4','#6585b3'];
 for(const child of prototype.children){const src=child as T.Mesh,mesh=new T.InstancedMesh(src.geometry,src.material,actors.length);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=true;
  if((src.material as T.MeshStandardMaterial).color.getHexString()==='ffffff')actors.forEach((_,i)=>mesh.setColorAt(i,new T.Color(palette[i%palette.length])));
  meshes.push(mesh);group.add(mesh);
 }return {group,meshes,actors};
}
export class CampusMobility{
 group=new T.Group();private batches:Batch[];private elapsed=0;private accumulator=0;private matrix=new T.Matrix4();private rotation=new T.Quaternion();private pos=new T.Vector3();private scale=new T.Vector3();
 constructor(){const actors=mobilityActors();this.batches=[batch('car',actors.cars),batch('bike',actors.bikes),batch('walker',actors.walkers)];this.group.name='campus-mobility';this.group.add(...this.batches.map(b=>b.group));this.paint();}
 setVisible(visible:boolean){this.group.visible=visible;}
 setNight(night:boolean){this.group.traverse(o=>{if(o instanceof T.Mesh){const m=o.material as T.MeshStandardMaterial|T.MeshLambertMaterial;if(['ffe7b0','de514e'].includes(m.color.getHexString())){m.emissive.copy(m.color);m.emissiveIntensity=night?2:0;}}});}
 step(delta:number,animate=true){if(!this.group.visible||!animate)return false;this.accumulator+=delta;if(this.accumulator<1/24)return false;this.elapsed+=this.accumulator;this.accumulator=0;this.paint();return true;}
 private paint(){for(const b of this.batches){b.actors.forEach((a,i)=>{const p=routePose(a.route,a.offset+this.elapsed*a.speed*a.direction,a.direction,a.lane);this.pos.set(p.x,p.y,p.z);this.rotation.setFromEuler(new T.Euler(p.pitch,p.yaw,0,'YXZ'));this.scale.setScalar(p.scale);this.matrix.compose(this.pos,this.rotation,this.scale);for(const mesh of b.meshes)mesh.setMatrixAt(i,this.matrix);});for(const mesh of b.meshes)mesh.instanceMatrix.needsUpdate=true;}}
}
