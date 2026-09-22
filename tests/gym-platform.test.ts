import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings} from '../src/data/campus';
import {Parts,disposeTree} from '../src/scene/geometry';
import {makeGym} from '../src/scene/sportsLandmarks';

test('gym upper terrace has an open gallery beneath and does not fill down to pool level',()=>{
 const b=buildings.find(b=>b.id==='b-gym')!,p=new Parts();makeGym(b,p);const g=p.finish();g.updateMatrixWorld(true);
 const x=b.width*.45,y=8.4;
 const passage=new T.Raycaster(new T.Vector3(x,y,-b.depth*.4),new T.Vector3(0,0,1),0,b.depth*.6).intersectObject(g,true);
 assert.equal(passage.length,0,'open gallery is not a solid plinth');
 const ceiling=new T.Raycaster(new T.Vector3(x,y,0),new T.Vector3(0,1,0)).intersectObject(g,true)[0];
 assert(ceiling&&Math.abs(ceiling.point.y-9.65)<.01,'continuous raised platform above the passage');
 for(const stairX of [b.width*.19,b.width*.72]){
  const opening=new T.Raycaster(new T.Vector3(stairX+1,10.3,b.depth*.235),new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
  assert(opening&&opening.point.y>7&&opening.point.y<8,'upper slabs leave real openings down to the stair treads');
  const exit=new T.Raycaster(new T.Vector3(stairX+5.25,10.3,b.depth*.235),new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
  assert(exit&&exit.point.y>9.7&&exit.point.y<9.9,'the adjoining concourse does not fill the last stair treads');
 }
 disposeTree(g);
});
