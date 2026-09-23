import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {roads} from '../src/data/landscape';
import {Parts,disposeTree} from '../src/scene/geometry';
import {makeGym} from '../src/scene/sportsLandmarks';
import {gymWestCourts,gymCourtY} from '../src/scene/gymWestCourts';

test('both west gym courts stay open to the sky, clear of roof, galleries and columns',()=>{
 const b=buildings.find(b=>b.id==='b-gym')!,p=new Parts();makeGym(b,p);
 const g=p.finish();g.updateMatrixWorld(true);
 const top=(x:number,z:number)=>new T.Raycaster(new T.Vector3(x,40,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0]?.point.y;
 const courts=gymWestCourts(b.width,b.depth);
 assert(courts[0].z1<courts[1].z0,'separate north and south courts');
 for(const c of courts){
  for(let x=c.x0+.35;x<c.x1-.35;x+=.55)for(let z=c.z0+.35;z<c.z1-.35;z+=.65){
   const y=top(x,z);
   assert(y!==undefined&&y>=gymCourtY-.12&&y<7.4,`${c.kind} blocked at ${x},${z}: ${y}`);
   const obstruction=new T.Raycaster(new T.Vector3(x,7.5,z),new T.Vector3(0,1,0)).intersectObject(g,true);
   assert.equal(obstruction.length,0,'no upper slab or gallery over the playing well');
  }
  assert(top(c.x,c.z0-.3)!>10,'upper platform remains along the court end');
 }
 const volleyball=top(courts[0].x,courts[0].z)!;
 assert(volleyball>gymCourtY+2&&volleyball<gymCourtY+2.5,'north court has a raised volleyball net');
 assert(top(courts[1].x,courts[1].z)!<gymCourtY+.1,'south court has no volleyball net across its centre');
 const road=roads.find(r=>r.name==='体育馆—网球场连接路')!;
 const roadEast=toWorld(road.points[0])[0]+(road.width*.9+3)/2;
 assert(toWorld(b.position)[0]+Math.min(...courts.map(c=>c.x0))>roadEast,'court wells do not move into the public road');
 disposeTree(g);
});
