import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';

test('library stairs retain a continuous thin flight with traversable space beneath all four approaches',()=>{
 const b=buildings.find(b=>b.id==='b-library')!,g=makeBuilding(b);
 g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
 for(const side of [0,1,2,3]){
  const angle=side*Math.PI/2,dep=(side%2?b.width:b.depth)/2;
  const centers=side%2?[0]:[-b.width*.29,b.width*.29];
  const point=(u:number,y:number,v:number)=>new T.Vector3(Math.cos(angle)*u+Math.sin(angle)*v,y,-Math.sin(angle)*u+Math.cos(angle)*v);
  for(const center of centers){
   const start=point(center-4,2.5,dep+6),direction=new T.Vector3(Math.cos(angle),0,-Math.sin(angle));
   assert.equal(new T.Raycaster(start,direction,0,8).intersectObject(g,true).length,0,'upper flight must not have a solid retaining wall');
   // Sample away from the handrail: there is a flight overhead but no fill below it.
   for(const v of [dep+5,dep+7,dep+11]){
    const pos=point(center+1,20,v),up=new T.Raycaster(point(center+1,2.3,v),new T.Vector3(0,1,0)).intersectObject(g,true)[0];
    const top=new T.Raycaster(pos,new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
    assert(up&&top);assert(up.point.y>2.8);assert(top.point.y-up.point.y<.7,'stair section is a thin waist slab and tread');
   }
   const landing=new T.Raycaster(point(center+1,9.5,dep+1),new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
   assert(landing&&Math.abs(landing.point.y-8.5)<.01,'flight joins a raised upper landing');
  }
 }
 disposeTree(g);
});
