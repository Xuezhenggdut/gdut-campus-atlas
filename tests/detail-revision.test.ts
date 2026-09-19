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
