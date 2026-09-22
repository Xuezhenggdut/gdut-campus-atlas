import {registrationDelta} from '../src/data/planningFrame';
import {projectMap,unprojectMap} from '../src/data/projection';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {roadSurfaceConflicts} from '../src/data/roadClearance';
import {buildings,places,toWorld} from '../src/data/campus';
import {residentialWaters,westPeripheralWater,inside,roads} from '../src/data/landscape';
import {Parts} from '../src/scene/geometry';
import {poolWaterY} from '../src/scene/poolDetails';
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
 const gym=buildings.find(b=>b.id==='b-gym')!,basket=buildings.find(b=>b.id==='b-courts-south')!;
 assert(boxes.every(box=>box.min.x>0&&box.min.z>gym.depth*.3),'pools belong southeast of the main hall');
 assert(toWorld(gym.position)[1]+Math.max(...boxes.map(box=>box.max.z))<toWorld(basket.position)[1]-basket.depth/2,'basketball courts clear the swimming pools');
 p.bins.forEach(gs=>gs.forEach(g=>g.dispose()));
});

test('sports groups match the satellite adjacency and north junction',()=>{
 const b=(id:string)=>buildings.find(b=>b.id==='b-'+id)!;
 const gym=toWorld(b('gym').position),track=toWorld(b('central-track').position),culture=toWorld(b('culture').position),teach=toWorld(b('teaching-6').position);
 const basket=b('courts-south'),volley=b('courts-west'),bp=toWorld(basket.position),vp=toWorld(volley.position);
 assert(gym[0]<track[0]&&track[0]<culture[0]&&culture[0]<teach[0]);
 assert(bp[1]-basket.depth/2>track[1]+b('central-track').width/2,'basketball stands south of the running track');
 assert(vp[0]+volley.width/2<bp[0]-basket.width/2,'volleyball stands west of basketball');
 const junction=toWorld(roads.find(r=>r.name==='教学区—东区北联络路')!.points[0]);
 assert(junction[0]>culture[0]&&junction[0]<teach[0]);
 assert(junction[1]<culture[1]-b('culture').width/2,'junction is north of the activity centre');
 assert(junction[1]<teach[1]-b('teaching-6').depth/2,'junction is north of teaching 6');
 for(const name of ['环教北路','挑战路'])assert(roads.find(r=>r.name===name)!.points.map(toWorld).some(p=>Math.hypot(p[0]-junction[0],p[1]-junction[1])<1e-7));
});

test('pool water remains open to the sky and the concourse reaches the stand rear',()=>{
 const b=buildings.find(b=>b.id==='b-gym')!,track=buildings.find(b=>b.id==='b-central-track')!;
 const p=new Parts();makeGym(b,p);const g=p.finish();g.updateMatrixWorld(true);
 const top=(x:number,z:number,height=40)=>new T.Raycaster(new T.Vector3(x,height,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0]?.point.y;
 for(const x of [b.width*.3,b.width*.63])assert(Math.abs(top(x+.45,b.depth*.62+.25)!-poolWaterY)<.06,'no roof or concourse covers pool water');
 const rear=toWorld(track.position)[0]-toWorld(b.position)[0]-track.depth/2-2.8-22*.86-1;
 for(let x=b.width*.78+.5;x<rear;x+=1){
  assert(Math.abs(top(x,0,6.5)!-3.375)<.01,'lower concourse has no gap before the grandstand');
  const upper=top(x,0,12)!;
  assert(upper>=10.09&&upper<=10.51,'upper platform continues into the slightly higher grandstand landing');
 }
 disposeTree(g);
});
test('west perimeter water is present; residential waterways do not cover building anchors',()=>{
 const q=projectMap([175,320]),d=registrationDelta('west');
 assert(inside(unprojectMap([q[0]+d[0],q[1]+d[1]]),westPeripheralWater));
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
