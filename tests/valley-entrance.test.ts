import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {Parts,disposeTree} from '../src/scene/geometry';
import {makeValleyPortal,valleyPortal} from '../src/scene/teachingEntrance';

test('valley portal has an open ground passage, elevated bridge and open roof slots',()=>{
 const g=new T.Group(),p=new Parts();makeValleyPortal(p);g.add(p.finish());
 for(const id of ['b-teaching-5','b-teaching-3'])g.add(makeBuilding(buildings.find(b=>b.id===id)!));
 g.updateMatrixWorld(true);const [x,z]=valleyPortal.center;
 for(const dx of [-2,0,2]){
  const hits=new T.Raycaster(new T.Vector3(x+dx,2,z+2),new T.Vector3(0,0,-1),0,24).intersectObject(g,true);
  assert.equal(hits.length,0,'ground entrance must not be filled by classroom walls or slabs');
 }
 const bridge=new T.Raycaster(new T.Vector3(x,30,z-1.5),new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
 assert(bridge.point.y>11&&bridge.point.y<12);
 for(const dx of [-9,0,9]){
  const hit=new T.Raycaster(new T.Vector3(x+dx,30,z-12),new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
  assert(!hit||hit.point.y<2,'three slots must remain open');
 }disposeTree(g);
});

test('valley stone is low and broad, with red text, centred on the shared entrance',()=>{
 const b=buildings.find(b=>b.id==='b-innovation-stone')!,g=makeBuilding(b);g.updateMatrixWorld(true);
 assert(Math.abs(toWorld(b.position)[0]-valleyPortal.center[0])<1e-8);
 let rock:T.Mesh|undefined,red=false;
 g.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)){const c=(o.material as T.MeshStandardMaterial).color.getHexString();if(c==='c9ad77')rock=o;if(c==='bd4439')red=true;}});
 assert(rock&&red);const size=new T.Box3().setFromObject(rock).getSize(new T.Vector3());
 assert(size.y<3.5&&size.x/size.y>2.7&&size.x<valleyPortal.width*.36);
 disposeTree(g);
});
