import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings} from '../src/data/campus';
import {makeOutdoorCourts} from '../src/scene/outdoorCourts';
import {Parts,disposeTree} from '../src/scene/geometry';

test('basketball aisle planting and lights stay outside every playing surface',()=>{
 const b=buildings.find(v=>v.id==='b-courts-south')!,p=new Parts(),g=new T.Group();makeOutdoorCourts(b,p,g);
 const bounds=(color:string)=>(p.bins.get(color)??[]).map(geometry=>{geometry.computeBoundingBox();return geometry.boundingBox!;});
 const courts=bounds('#339dbb');assert.equal(courts.length,21);
 const fixtures=[...bounds('#b4b7a1'),...bounds('#477b70')];assert(fixtures.length>0);
 for(const a of fixtures){
  assert(a.min.x>=-b.width/2-.01&&a.max.x<=b.width/2+.01&&a.min.z>=-b.depth/2-.01&&a.max.z<=b.depth/2+.01,'fixtures stay within the existing sports plot');
  for(const c of courts)assert(a.max.x<c.min.x||a.min.x>c.max.x||a.max.z<c.min.z||a.min.z>c.max.z,'fixture obstructs a playing surface');
 }
 g.add(p.finish());disposeTree(g);
});
