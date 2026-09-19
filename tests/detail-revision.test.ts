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
test('campus passage continues under the elevated bridge with unobstructed clearance',()=>{
 const g=makeRoadNetwork();g.updateMatrixWorld(true);
 const ray=new T.Raycaster(new T.Vector3(97,100,-92.885),new T.Vector3(0,-1,0));const hits=ray.intersectObject(g,true);
 assert(hits.some(h=>h.point.y>7&&h.point.y<8));assert(hits.some(h=>h.point.y<.5));
 const forward=new T.Raycaster(new T.Vector3(97,3,-120),new T.Vector3(0,0,1),0,155);assert.equal(forward.intersectObject(g,true).length,0);
 disposeTree(g);
});
test('Zhixing west extension joins south-one gate and the football-side ring road',()=>{
 const road=roads.find(r=>r.name==='知行大道（南1门段）')!,p=road.points.map(toWorld),gate=toWorld(buildings.find(b=>b.id==='b-south-one-gate')!.position);
 assert(Math.hypot(p[0][0]-gate[0],p[0][1]-gate[1])<.01);
 const end=p.at(-1)!;assert(Math.abs(end[0]+35)<.01);assert(end[1]>=115&&end[1]<=236);
});

test('gym and tennis courts are separated by a continuous campus road',()=>{
 const road=roads.find(r=>r.name==='体育馆—网球场连接路')!;
 assert.ok(road);
 const points=road.points.map(toWorld);
 assert.ok(points.length>=5);
 assert.ok(points[0][1]<-65&&points.at(-1)![1]>=139);
 const tennis=buildings.find(b=>b.id==='b-tennis')!,gym=buildings.find(b=>b.id==='b-gym')!;
 const tx=toWorld(tennis.position)[0],gx=toWorld(gym.position)[0],rx=points[2][0];
 assert.ok(tx<rx&&rx<gx,'road must run between tennis courts and gym');
 const south=roads.find(r=>r.name==='知行大道（南1门段）')!.points.map(toWorld);
 assert.ok(south.some(p=>Math.abs(p[1]-points.at(-1)![1])<1));
 const north=roads.find(r=>r.name==='环教北路')!.points.map(toWorld);
 assert.ok(north.some(p=>Math.hypot(p[0]-points[0][0],p[1]-points[0][1])<1));
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
