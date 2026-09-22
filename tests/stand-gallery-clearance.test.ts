import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {Parts,disposeTree} from '../src/scene/geometry';
import {makeGym} from '../src/scene/sportsLandmarks';

test('the stand end and its stairs leave open ground before the southern gallery',()=>{
 const gym=buildings.find(b=>b.id==='b-gym')!,track=buildings.find(b=>b.id==='b-central-track')!;
 const [gx,gz]=toWorld(gym.position),[tx,tz]=toWorld(track.position);
 const front=tx-gx-track.depth/2-2.8,back=front-22*.86;
 const galleryNear=tz-gz+track.width/2+6-2.2;
 const p=new Parts();makeGym(gym,p);const g=p.finish();g.updateMatrixWorld(true);
 try{
  // The old seating crossed this entire strip; test the actual merged mesh,
  // across both the seat rows and the full run of the side stair.
  for(let x=back+1;x<=front;x+=1)for(const offset of [1,2,4]){
   const hits=new T.Raycaster(new T.Vector3(x,9,galleryNear-offset),new T.Vector3(0,-1,0)).intersectObject(g,true);
   assert.equal(hits.length,0,`clear ground between stand stairs and gallery at ${x}, ${offset}`);
  }
  for(const color of ['#387694','#527e63','#a95356'])for(const geometry of p.bins.get(color)??[]){
   geometry.computeBoundingBox();
   assert(geometry.boundingBox!.max.z<galleryNear-8,'seats stay behind the stair and open gap');
  }
 }finally{disposeTree(g);}
});
