import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {Parts,disposeTree} from '../src/scene/geometry';
import {entrancePodium,podiumWells} from '../src/scene/entrancePodium';
test('raised forecourt has open light wells and vehicle clearance below',()=>{
 const p=new Parts();entrancePodium(p);const g=p.finish();g.updateMatrixWorld(true);
 const ray=new T.Raycaster();
 ray.set(new T.Vector3(335,10,280),new T.Vector3(0,-1,0));
 assert(Math.abs(ray.intersectObject(g,true)[0].point.y-4.8)<.01);
 ray.set(new T.Vector3(389,10,362),new T.Vector3(0,-1,0));assert(Math.abs(ray.intersectObject(g,true)[0].point.y-4.8)<.01);
 assert.equal(podiumWells.length,5);
 for(const [x,z] of [[379,276],[388,301],[402,320],[373,323],[396,345]]){
  ray.set(new T.Vector3(x,5.5,z),new T.Vector3(0,-1,0));assert.equal(ray.intersectObject(g,true).length,0);
 }
 ray.set(new T.Vector3(335,2,260),new T.Vector3(0,0,1));ray.far=85;
 assert.equal(ray.intersectObject(g,true).length,0);disposeTree(g);
});
