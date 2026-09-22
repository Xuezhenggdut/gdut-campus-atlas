import {bridgeX,bridgeZ} from '../src/scene/roadNetwork';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';
import {makeRoadNetwork} from '../src/scene/roadNetwork';
import {roads} from '../src/data/landscape';

test('research twin courtyards, innovation A atrium and student dorm court are actual openings',()=>{
 for(const id of ['b-engineering-2','b-lab-1','b-innovation-a','b-east-dorm-9']){
  const b=buildings.find(b=>b.id===id)!,g=makeBuilding(b);g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
  const xs=/engineering|lab/.test(id)?[-b.width*.235,b.width*.235]:[0];
  for(const x of xs){const ray=new T.Raycaster(new T.Vector3(x,100,0),new T.Vector3(0,-1,0));const hits=ray.intersectObject(g,true);assert(!hits.length||hits[0].point.y<2,id);}
  disposeTree(g);
 }
});
test('Tiaozhan Road passes under Guangong bridge while deleted west connections stay separated',()=>{
 const g=makeRoadNetwork();g.updateMatrixWorld(true);
 const ray=new T.Raycaster(new T.Vector3(bridgeX,100,bridgeZ),new T.Vector3(0,-1,0));const hits=ray.intersectObject(g,true);
 assert(hits.some(h=>h.point.y<.6));assert(hits.some(h=>h.point.y>7));
 const passage=roads.find(r=>r.name==='挑战路')!.points.map(toWorld);
 assert(passage[0][1]<-200&&passage.at(-1)![1]>bridgeZ+50);
 const forward=new T.Raycaster(new T.Vector3(bridgeX,3,bridgeZ-25),new T.Vector3(0,0,1),0,155);assert.equal(forward.intersectObject(g,true).length,0);
 // The gym connector remains south of the registered public road.
 const connector=roads.find(r=>r.name==='体育馆—网球场连接路')!;
 assert(connector.points.map(toWorld).every(p=>p[0]<bridgeX-100));
 disposeTree(g);
});
test('Zhixing west extension joins south-one gate and the football-side ring road',()=>{
 const road=roads.find(r=>r.name==='知行大道（南1门段）')!,p=road.points.map(toWorld),gate=toWorld(buildings.find(b=>b.id==='b-south-one-gate')!.position);
 assert(gate[0]>p[0][0]+30);
 assert(p.some(q=>Math.hypot(q[0]-gate[0],q[1]-gate[1])<.01));
 const end=p.at(-1)!,ring=roads.find(r=>r.name==='环教路')!.points.map(toWorld);
 const gap=Math.min(...ring.slice(1).map((b,i)=>{const a=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((end[0]-a[0])*dx+(end[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(end[0]-a[0]-t*dx,end[1]-a[1]-t*dz);}));
 assert(gap<1e-7,'source-confirmed junction must meet the current ring, not its old coordinates');
});

test('gym and tennis courts are separated by a continuous campus road',()=>{
 const road=roads.find(r=>r.name==='体育馆—网球场连接路'&&toWorld(r.points.at(-1)!)[1]>100)!;
 assert.ok(road);
 const points=road.points.map(toWorld);
 assert.ok(points.length>=2);
 assert.ok(points[0][1]<0&&points.at(-1)![1]>=139);
 const tennis=buildings.find(b=>b.id==='b-tennis')!,gym=buildings.find(b=>b.id==='b-gym')!;
 const tx=toWorld(tennis.position)[0],gx=toWorld(gym.position)[0],rx=points.at(-1)![0];
 assert.ok(tx<rx&&rx<gx,'road must run between tennis courts and gym');
 const south=roads.find(r=>r.name==='知行大道（南1门段）')!.points.map(toWorld);
 assert.ok(south.some(p=>Math.abs(p[1]-points.at(-1)![1])<1));
 const north=roads.find(r=>r.name==='环教北路')!.points.map(toWorld);
 assert.ok(north.some(p=>Math.hypot(p[0]-points[0][0],p[1]-points[0][1])<.01),'campus connector joins restored Huanjiao North Road');
 assert.ok(north.some(p=>Math.abs(p[0]-187)<.01),'north road continues to Tiaozhan Road');
});

test('east dorms and dining hall retain a green setback north of the public middle ring',()=>{
 const ring=roads.find(r=>r.name==='大学城中环西路')!;
 const line=ring.points.map(toWorld);
 const distance=(id:string)=>{
  const b=buildings.find(b=>b.id===id)!,p=toWorld(b.position);
  let d=Infinity;
  for(let i=1;i<line.length;i++){
   const a=line[i-1],q=line[i],dx=q[0]-a[0],dz=q[1]-a[1];
   const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));
   d=Math.min(d,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz));
  }
  return d-b.depth/2-ring.width/2;
 };
 assert.ok(distance('b-east-dining-2')>28);
 assert.ok(distance('b-east-dorm-9')>30);
});

test('academic and research road grid retains its named hierarchy',()=>{
 for(const name of ['环教北路','创新大道','知行大道','求是路','明德路','博雅路','研学二路'])assert.ok(roads.some(r=>r.name===name),name);
 const vertical=['创新大道','求是路','明德路','博雅路'].map(name=>roads.find(r=>r.name===name)!.points.map(toWorld));
 assert.ok(vertical.slice(2).every(p=>Math.abs(p[0][0]-p.at(-1)![0])<1));
 assert.ok(vertical[1].every(p=>p[0]>=405-.01&&p[0]<=410+.01),'Qiushi follows the engineering frontage and retained south interface');
 // The migrated teaching avenue bends back to the retained south entrance.
 assert.ok(Math.abs(vertical[0].at(-1)![0]-335)<.01);
 assert.ok(Math.abs(vertical[0].at(-1)![1]-367)<.01);
 const xs=vertical.map(p=>p[0][0]);assert.deepEqual([...xs].sort((a,b)=>a-b),xs);
});

test('academic-east junction includes four blue cycle aprons and zebra markings',()=>{
 const g=makeRoadNetwork();
 let blue=0,white=0;
 g.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh)return;const mat=m.material as T.MeshStandardMaterial;if(mat.color?.getHexString()==='1a9ac4')blue++;if(mat.color?.getHexString()==='f3f0df')white++;});
 assert.ok(blue>=1);assert.ok(white>=1);disposeTree(g);
});

test('academic-east junction is set back from the public middle ring',()=>{
 const link=roads.find(r=>r.name==='教学区—东区北联络路')!,p=link.points.map(toWorld),junction=p.find(q=>Math.abs(q[0]-187)<1)!;
 const ring=roads.find(r=>r.name==='大学城中环西路')!.points.map(toWorld);
 let d=Infinity;
 for(let i=1;i<ring.length;i++){
  const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((junction[0]-a[0])*dx+(junction[1]-a[1])*dz)/(dx*dx+dz*dz)));
  d=Math.min(d,Math.hypot(junction[0]-a[0]-t*dx,junction[1]-a[1]-t*dz));
 }
 assert.ok(d>35,`junction setback ${d}`);
});

test('west third dining hall retains a broad setback from the academic northwest gate',()=>{
 const dining=buildings.find(b=>b.id==='b-west-dining-3')!,gate=buildings.find(b=>b.id==='b-academic-nw')!;
 const a=toWorld(dining.position),b=toWorld(gate.position);
 assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])>80);
 assert.ok(a[1]<b[1]-60);
});

test('non-connecting internal road surfaces stop clear of public ring roads',()=>{
 const segmentDistance=(a:[number,number],b:[number,number],c:[number,number],d:[number,number])=>{
  const ux=b[0]-a[0],uz=b[1]-a[1],vx=d[0]-c[0],vz=d[1]-c[1],wx=a[0]-c[0],wz=a[1]-c[1];
  const A=ux*ux+uz*uz,B=ux*vx+uz*vz,C=vx*vx+vz*vz,D=ux*wx+uz*wz,E=vx*wx+vz*wz,den=A*C-B*B;
  let s=den?Math.max(0,Math.min(1,(B*E-C*D)/den)):0,t=Math.max(0,Math.min(1,(B*s+E)/(C||1)));
  s=Math.max(0,Math.min(1,(B*t-D)/(A||1)));
  return Math.hypot(a[0]+s*ux-c[0]-t*vx,a[1]+s*uz-c[1]-t*vz);
 };
 // Include the unnamed eastern/northern perimeter road, previously omitted.
 const publicRoads=roads.filter(r=>r.main);
 for(const name of ['环教北路','东侧环教路']){
  const road=roads.find(r=>r.name===name)!,a=road.points.map(toWorld);let gap=Infinity;
  for(const outer of publicRoads){const b=outer.points.map(toWorld);for(let i=0;i<a.length-1;i++)for(let j=0;j<b.length-1;j++)gap=Math.min(gap,segmentDistance(a[i],a[i+1],b[j],b[j+1]));}
  assert.ok(gap>(road.width+25)/2+2,`${name}: ${gap}`);
 }
});

test('mistaken duplicate access roads are absent',()=>{
 assert.equal(roads.some(r=>r.name==='西三食堂—中环西路连接路'||r.name==='体育馆—中环西路连接路'),false);
});
