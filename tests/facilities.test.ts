import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {roadSurfaceConflicts} from '../src/data/roadClearance';
import {buildings,places} from '../src/data/campus';
import {residentialWaters,westPeripheralWater,inside,roads} from '../src/data/landscape';
import {Parts} from '../src/scene/geometry';
import {makeGym} from '../src/scene/sportsLandmarks';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';

test('rendered road widths including shoulders clear buildings and low sports footprints',()=>{
 assert.deepEqual(roadSurfaceConflicts(),[]);
});
test('the two gym pools have parallel north-south long axes and are separated east-west',()=>{
 const p=new Parts();makeGym(buildings.find(b=>b.id==='b-gym')!,p);
 const pools=p.bins.get('#5e9eae')!;assert.equal(pools.length,2);
 const boxes=pools.map(g=>{g.computeBoundingBox();return g.boundingBox!;});
 for(const box of boxes){const size=box.getSize(new T.Vector3());assert(size.z>size.x*1.5);}
 assert(boxes[0].max.x<boxes[1].min.x);
 assert(Math.abs(boxes[0].min.z-boxes[1].min.z)<.01);
 p.bins.forEach(gs=>gs.forEach(g=>g.dispose()));
});
test('west perimeter water is present; residential waterways do not cover building anchors',()=>{
 assert(inside([175,320],westPeripheralWater));
 for(const b of buildings.filter(b=>places.find(p=>p.id===b.placeIds[0])?.status==='built'))assert(!residentialWaters.some(poly=>inside(b.position,poly)),b.id);
 for(const name of ['国医东路','大学城广工二路'])assert(roads.find(r=>r.name===name)!.width>=25);
});
test('teaching courtyard is open from rooftop to its ground surface',()=>{
 const b=buildings.find(b=>b.id==='b-teaching-5')!,g=makeBuilding(b);g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
 const part=b.width/2.18,x=-b.width/2+part/2;
 const ray=new T.Raycaster(new T.Vector3(x,100,0),new T.Vector3(0,-1,0));
 const hits=ray.intersectObject(g,true);assert(hits.length);assert(hits[0].point.y<2);
 disposeTree(g);
});
test('east dining two retains an open side notch between rear wing and curved hall',()=>{
 const b=buildings.find(b=>b.id==='b-east-dining-2')!,g=makeBuilding(b);g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
 const down=(x:number,z:number)=>new T.Raycaster(new T.Vector3(x,100,z),new T.Vector3(0,-1,0)).intersectObject(g,true);
 assert.equal(down(-b.width*.35,-b.depth*.04).length,0);
 assert(down(-b.width*.35,-b.depth*.35)[0].point.y>=b.height);
 assert(down(0,b.depth*.35)[0].point.y>=b.height);
 disposeTree(g);
});
