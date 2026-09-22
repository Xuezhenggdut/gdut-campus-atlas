import {roads} from '../src/data/landscape';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,places,toWorld} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';
import {makeConnections} from '../src/scene/connections';

test('built student dorm ground floor is traversable, with occupied rooms above',()=>{
 for(const id of ['b-east-dorm-9','b-west-dorm-5']){
  const b=buildings.find(b=>b.id===id)!;
  assert.equal(b.floors,7);
  const g=makeBuilding(b);
  g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
  // A passage between the column bays must pass through both outside walls.
  const low=new T.Raycaster(new T.Vector3(0,1.7,-b.depth),new T.Vector3(0,0,1),0,b.depth*2);
  assert.equal(low.intersectObject(g,true).length,0,id+' ground passage');
  const high=new T.Raycaster(new T.Vector3(0,b.height/7+1.7,-b.depth),new T.Vector3(0,0,1),0,b.depth*2);
  assert.ok(high.intersectObject(g,true).length>0,id+' occupied upper floor');
  disposeTree(g);
 }
 assert.equal(places.find(p=>p.id==='west-dorm-17')!.status,'planned');
});

test('east dorm wings connect above the open ground passage and share their original POI',()=>{
 const connections=makeConnections('east');connections.updateMatrixWorld(true);
 for(const n of [9,10,11]){
  const id=`east-dorm-${n}`,b=buildings.find(b=>b.id==='b-'+id)!,annex=buildings.find(b=>b.id==='b-'+id+'-east-wing')!;
  const mainEast=toWorld(b.position)[0]+b.width/2,annexWest=toWorld(annex.position)[0]-annex.width/2;
  const passageX=toWorld(roads.find(r=>r.name==='挑战路')!.points[0])[0];
  assert(mainEast<passageX-4.2&&annexWest>passageX+4.2);
  assert(Math.abs(toWorld(b.position)[1]-toWorld(annex.position)[1])<1e-8);
  assert.deepEqual(places.find(p=>p.id===id)!.buildingIds,[b.id,annex.id]);
  const x=(mainEast+annexWest)/2,z=toWorld(b.position)[1];
  const above=new T.Raycaster(new T.Vector3(x,b.height+3,z),new T.Vector3(0,-1,0));
  assert(above.intersectObject(connections,true).length>0,'upper floors must connect');
  const ground=new T.Raycaster(new T.Vector3(x,2,z-10),new T.Vector3(0,0,1),0,20);
  assert.equal(ground.intersectObject(connections,true).length,0,'ground passage must remain clear');
 }
 disposeTree(connections);
});

test('planning-calibrated residential blocks do not overlap one another',()=>{
 const blocks=buildings.filter(b=>places.find(p=>p.id===b.placeIds[0])?.area!=='academic'&&places.find(p=>p.id===b.placeIds[0])?.status==='built'&&b.kind!=='gate');
 for(let i=0;i<blocks.length;i++)for(let j=i+1;j<blocks.length;j++){
  const a=blocks[i],b=blocks[j],p=toWorld(a.position),q=toWorld(b.position);
  assert(Math.abs(p[0]-q[0])>=(a.width+b.width)/2||Math.abs(p[1]-q[1])>=(a.depth+b.depth)/2,`${a.id} overlaps ${b.id}`);
 }
});
