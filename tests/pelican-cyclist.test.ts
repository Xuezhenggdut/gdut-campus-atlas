import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings} from '../src/data/campus';
import {cyclingLap,cyclingPose,PelicanCyclist} from '../src/scene/pelicanCyclist';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';

test('pelican follows the stadium lane continuously at constant speed without crossing the grass',()=>{
 const b=buildings.find(b=>b.id==='b-central-track')!,lap=cyclingLap(b.width,b.depth),track=makeBuilding(b);
 track.position.set(0,0,0);track.rotation.set(0,0,0);track.updateMatrixWorld(true);
 const s=(b.width-b.depth)/2,r=b.depth/2-3.8;
 for(let i=0;i<500;i++){
  const distance=lap*i/500,a=cyclingPose(b.width,b.depth,distance),next=cyclingPose(b.width,b.depth,distance+.01);
  const radius=Math.hypot(Math.max(0,Math.abs(a.x)-s),a.z);
  assert(Math.abs(radius-r)<1e-7);
  assert(Math.abs(Math.hypot(next.x-a.x,next.z-a.z)-.01)<1e-6,'speed must not jump at section joins');
  assert((next.x-a.x)*Math.sin(a.yaw)+(next.z-a.z)*Math.cos(a.yaw)>.00999,'bike faces travel direction');
  // Wheel contacts and side clearance must stay on the red track surface.
  if(i%10===0)for(const dz of [-1.45,1.45]){
   const x=a.x+Math.sin(a.yaw)*dz,z=a.z+Math.cos(a.yaw)*dz;
   const hit=new T.Raycaster(new T.Vector3(x,.85,z),new T.Vector3(0,-1,0)).intersectObject(track,true)[0];
   assert(hit&&Math.abs(hit.point.y-.8)<.001,'wheel is over the track, not grass or an obstacle');
  }
 }
 const a=cyclingPose(b.width,b.depth,0),end=cyclingPose(b.width,b.depth,lap);
 assert.deepEqual(end,a);disposeTree(track);
});

test('pelican loops without disappearing and pauses its pose when animation is disabled',()=>{
 const b=buildings.find(b=>b.id==='b-central-track')!,actor=new PelicanCyclist(),start=actor.rider.position.clone();
 assert.equal(actor.step(1,false),false);assert(actor.rider.position.equals(start));
 actor.step(1);assert(actor.rider.position.distanceTo(start)>4);
 actor.step(cyclingLap(b.width,b.depth)/4.2-1);
 assert(actor.rider.position.distanceTo(start)<1e-6);
 actor.group.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(actor.group,true);
 assert(Math.abs(bounds.min.y-1.8)<.02,'tires meet track height');
 assert(bounds.max.y>6&&bounds.max.y<8,'bird remains a small mascot rather than a building');
 disposeTree(actor.group);
});
