import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {Parts,disposeTree} from '../src/scene/geometry';
import {makeTeachingLinks} from '../src/scene/teachingLinks';
import {makeValleyPortal,valleyPortal} from '../src/scene/teachingEntrance';
import {makeTeachingCourtyard,teachingCourtyardRows} from '../src/scene/teachingCourtyard';

test('shared teaching courtyard stays broad and open through both rows toward the library',()=>{
 const g=new T.Group(),p=new Parts();
 for(const n of [3,4,5,6])g.add(makeBuilding(buildings.find(b=>b.id===`b-teaching-${n}`)!));
 makeTeachingLinks(p);makeValleyPortal(p);makeTeachingCourtyard(p);g.add(p.finish());g.updateMatrixWorld(true);
 const [x,front]=valleyPortal.center,rows=teachingCourtyardRows();
 // A centre sightline at gallery eye height reaches the south entrance.
 const view=new T.Raycaster(new T.Vector3(x,8,rows[0].z0+.5),new T.Vector3(0,0,1),0,front-rows[0].z0);
 assert.equal(view.intersectObject(g,true).length,0,'walls, storeys or rails must not seal the middle');
 // Sample across the whole former mass, including both shelter rows and the
 // cross-street gap. Low fabric shelters are allowed; building roofs are not.
 for(let z=rows[0].z0+1;z<front-valleyPortal.depth-1;z+=2.6)for(const dx of [-11.5,-7.5,-2,2,7.5,11.5]){
  const hit=new T.Raycaster(new T.Vector3(x+dx,50,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
  assert(!hit||hit.point.y<6,`central space obstructed at ${dx},${z}: ${hit?.point.y}`);
 }
 for(const row of rows){
  const z=row.canopyStart+1;
  for(const side of [-1,1]){
   const shelter=new T.Raycaster(new T.Vector3(x+side*7.5,30,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
   assert(shelter&&shelter.point.y>5&&shelter.point.y<6,'two low curved shelters flank the open aisle');
  }
 }
 // Galleries have a real recess behind their column/rail edge.
 for(const n of [3,4,5,6]){
  const b=buildings.find(b=>b.id===`b-teaching-${n}`)!,z=toWorld(b.position)[1],side=n>=5?-1:1;
  const ray=new T.Raycaster(new T.Vector3(x+side*15.5,8,z-2),new T.Vector3(0,0,1),0,4);
  assert.equal(ray.intersectObject(g,true).length,0,`teaching ${n} gallery must have walkable depth`);
 }
 disposeTree(g);
});
