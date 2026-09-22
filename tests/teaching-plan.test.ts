import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {teachingCourts} from '../src/data/teachingPlan';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';

test('teaching and engineering distances use the same complete PDF datum',()=>{
 const teaching=toWorld(buildings.find(b=>b.id==='b-teaching-1')!.position);
 const engineering=toWorld(buildings.find(b=>b.id==='b-engineering-1')!.position);
 // Centers in the same 5x source crop: teaching (724,397), engineering (665.5,1036.5).
 assert.ok(Math.abs(teaching[0]-engineering[0]-(724-665.5)*2.28/5)<1e-8);
 assert.ok(Math.abs(teaching[1]-engineering[1]-(397-1036.5)*2.28/5)<1e-8);
});

test('all traced teaching courtyards remain open through the roof and storeys',()=>{
 for(let n=1;n<=6;n++){
  const b=buildings.find(b=>b.id===`b-teaching-${n}`)!,g=makeBuilding(b);
  g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
  const courts=teachingCourts(b.id);assert(courts.length>=2);
  for(const c of courts)for(const dx of [-.2,0,.2]){
   const hits=new T.Raycaster(new T.Vector3(c.x+c.width*dx,100,c.z),new T.Vector3(0,-1,0)).intersectObject(g,true);
   assert(hits.length&&hits[0].point.y<1,`${b.id} blocked courtyard`);
  }
  const wall=new T.Raycaster(new T.Vector3(b.width*(n===5?-.49:.49),100,b.depth*.49),new T.Vector3(0,-1,0)).intersectObject(g,true);
  assert(wall.length&&wall[0].point.y>=b.height,'continuous perimeter must remain');disposeTree(g);
 }
});

test('front and rear teaching rows have a clear transverse corridor',()=>{
 for(const [front,rear] of [[1,2],[3,4],[5,6]]){
  const a=buildings.find(b=>b.id===`b-teaching-${front}`)!,b=buildings.find(b=>b.id===`b-teaching-${rear}`)!;
  const south=toWorld(a.position)[1]-a.depth/2,north=toWorld(b.position)[1]+b.depth/2;
  assert(south-north>15,'leave room for road shoulders and building edges');
 }
});
