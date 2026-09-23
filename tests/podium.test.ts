import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {Parts,disposeTree} from '../src/scene/geometry';
import {entrancePodium,podiumWells,podiumPalms,podiumCars} from '../src/scene/entrancePodium';
import {buildings,toWorld} from '../src/data/campus';
import {inside} from '../src/data/landscape';
import {makeBuilding} from '../src/scene/models';
import {entranceAxisX} from '../src/scene/southEntrance';

test('photographed podium wells expose lower parking while decks and the drive stay continuous',()=>{
 const p=new Parts();entrancePodium(p);const g=new T.Group();g.add(p.finish());
 for(const id of ['b-admin','b-comprehensive'])g.add(makeBuilding(buildings.find(b=>b.id===id)!));
 g.updateMatrixWorld(true);
 const down=(x:number,z:number,y=6,far=2)=>new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(0,-1,0),0,far).intersectObject(g,true);
 for(const [x,z] of [[320,300],[389,362]])assert(Math.abs(down(x,z)[0].point.y-4.8)<.01);
 assert.equal(podiumWells.length,5);
 for(const poly of podiumWells){
  let checked=0;
  for(let x=Math.min(...poly.map(p=>p[0]))+2;x<Math.max(...poly.map(p=>p[0]))-2;x+=2.5){
   for(let z=Math.min(...poly.map(p=>p[1]))+2;z<Math.max(...poly.map(p=>p[1]))-2;z+=2.5){
    if(!inside([x,z],poly)||poly.some(p=>Math.hypot(p[0]-x,p[1]-z)<1)||podiumPalms.some(p=>Math.hypot(p[0]-x,p[1]-z)<.5))continue;
    assert.equal(down(x,z,5.7,1.7).length,0,`slab/column blocks well at ${x},${z}`);checked++;
   }
  }
  assert(checked>0,'each opening is checked below its guardrail level');
 }
 assert(podiumPalms.length>=5&&podiumCars.length>=5);
 for(const [x,z] of [...podiumPalms,...podiumCars])assert(podiumWells.some(poly=>inside([x,z],poly)),'fixtures belong on the lower level inside a well');
 for(const [x,z] of podiumCars)assert(podiumPalms.every(p=>Math.hypot(p[0]-x,p[1]-z)>=4),'cars clear palm trunks');
 const lane=new T.Raycaster(new T.Vector3(335,2,260),new T.Vector3(0,0,1),0,85);
 assert.equal(lane.intersectObject(g,true).length,0);
 const a=buildings.find(b=>b.id==='b-admin')!,axis=toWorld(a.position)[0]+entranceAxisX;
 for(const id of ['b-admin','b-comprehensive']){
  const b=buildings.find(b=>b.id===id)!,z=toWorld(b.position)[1];
  for(const dx of [-16,0,16]){
   const h=down(axis+dx,z+3,50,50)[0];
   assert(!h||h.point.y<15,'central roof rectangle is open sky rather than a dense grid');
  }
 }
 disposeTree(g);
});
