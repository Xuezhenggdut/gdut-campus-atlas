import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {Parts,disposeTree} from '../src/scene/geometry';
import {makeCulture} from '../src/scene/culture';
import {makeTeachingLinks,teachingLinkSpans} from '../src/scene/teachingLinks';
import {makeGym} from '../src/scene/sportsLandmarks';
import {poolHoles,poolWaterY} from '../src/scene/poolDetails';

const down=(g:T.Object3D,x:number,z:number,from=60)=>new T.Raycaster(new T.Vector3(x,from,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0]?.point.y;
test('culture approach rises through two lower flights, a level plaza and a separate entrance flight',()=>{
 const b=buildings.find(b=>b.id==='b-culture')!,p=new Parts();makeCulture(b,p);const g=p.finish();g.updateMatrixWorld(true);
 const x=-b.width*.36;
 assert(down(g,x,69)!<down(g,x,62)!);
 assert(Math.abs(down(g,x,58)!-down(g,x,59)!)<.01,'landing separates the two lower runs');
 assert(down(g,x,55)!<down(g,x,50)!);
 assert(Math.abs(down(g,x,34)!-down(g,x,47)!)<.01,'broad plaza is level');
 const front=-b.width*.25;
 assert(down(g,front,25,10)!>down(g,front,30,10)!,'the doorway has its own raised stair');
 disposeTree(g);
});
test('three teaching gallery levels meet the common floor datum while leaving roads clear below',()=>{
 const p=new Parts();makeTeachingLinks(p);const g=p.finish();g.updateMatrixWorld(true);
 for(const {x,z0,z1} of teachingLinkSpans()){
  assert(z1>z0);const z=(z0+z1)/2;
  const hits=new T.Raycaster(new T.Vector3(x,30,z),new T.Vector3(0,-1,0)).intersectObject(g,true);
  const levels=[...new Set(hits.map(h=>Number(h.point.y.toFixed(2))))];
  for(const floor of [6.65,11.9,17.15])assert(levels.some(y=>Math.abs(y-floor)<.01));
  for(const xx of [x-5,x-1.4,x,x+1.4,x+5])assert.equal(down(g,xx,z,5),undefined,'no gallery support in the ground passage');
  for(const xx of [x-5,x+5])assert(Math.abs(down(g,xx,z,9)!-6.65)<.01,'the lower level is a broad raised pedestrian platform');
 }
 disposeTree(g);
});
test('pool basins are below coping; the southern gallery and football ornament clear sports surfaces',()=>{
 const b=buildings.find(b=>b.id==='b-gym')!,track=buildings.find(b=>b.id==='b-central-track')!,basket=buildings.find(b=>b.id==='b-courts-south')!;
 const p=new Parts();makeGym(b,p);const g=p.finish();g.updateMatrixWorld(true);
 for(const q of poolHoles(b.width,b.depth)){
  assert(Math.abs(down(g,q.x+.45,q.z+.25)!-poolWaterY)<.06);
  assert(down(g,q.x-q.w/2-.32,q.z)!>poolWaterY+.5,'visible recessed pool wall');
 }
 const [gx,gz]=toWorld(b.position),[tx,tz]=toWorld(track.position),galleryZ=tz+track.width/2+6-gz;
 assert(Math.abs(down(g,tx-gx-11,galleryZ)!-7.2)<.01,'second open deck exists');
 const ornament=p.bins.get('#aa5251')!;
 // Parts.finish disposes source buffers but retains their immutable coordinates.
 for(const geometry of ornament){geometry.computeBoundingBox();const box=geometry.boundingBox!;
  assert(box.min.z+gz>tz+track.width/2,'ornament is outside the track');
  assert(box.max.z+gz<toWorld(basket.position)[1]-basket.depth/2,'ornament clears basketball courts');
 }
 disposeTree(g);
});
