import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {Parts,disposeTree} from '../src/scene/geometry';
import {doglegStair} from '../src/scene/facadeDetails';
import {entranceFlags} from '../src/scene/southEntrance';

test('dogleg flights climb continuously to the next landing and reverse direction',()=>{
 const p=new Parts();doglegStair(p,0,0,6,7,0,4,1,'#fff','#777');const g=p.finish();g.updateMatrixWorld(true);
 const floor=(x:number,z:number)=>new T.Raycaster(new T.Vector3(x,1.95,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0]?.point.y;
 assert((floor(-1.5,-2.8)??-1)<(floor(-1.5,1.4)??-1));
 const down=(x:number,z:number)=>new T.Raycaster(new T.Vector3(x,8,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0]?.point.y;
 assert((down(1.5,-2.8)??-1)>(down(1.5,2.8)??-1));
 assert((down(0,-4)??0)>4);disposeTree(g);
});

test('office roof openings and dorm atrium remain genuinely open above ground',()=>{
 for(const id of ['b-admin','b-comprehensive','b-east-dorm-9','b-west-dorm-5']){
  const b=buildings.find(v=>v.id===id)!,g=makeBuilding(b);g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
  for(const x of [-1,0,1]){
   const hits=new T.Raycaster(new T.Vector3(x,100,0),new T.Vector3(0,-1,0)).intersectObject(g,true);
   assert(!hits.length||hits[0].point.y<4,`${id} has a blocked light well at ${x}`);
  }disposeTree(g);
 }
});

test('national flag has its own taller pole on the upper forecourt landing',()=>{
 const national=entranceFlags.filter(f=>f.national);assert.equal(national.length,1);
 assert.equal(national[0].y+1,4.8);assert.equal(national[0].color,'#cf3337');
 assert(national[0].h>Math.max(...entranceFlags.filter(f=>!f.national).map(f=>f.h)));
});
