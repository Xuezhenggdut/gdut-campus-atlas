import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {roads} from '../src/data/landscape';
import {roadWidthAt} from '../src/data/roadWidths';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';

test('Zhixing is straight through all research junctions to the east gate',()=>{
 const avenue=roads.find(r=>r.name==='知行大道')!.points.map(toWorld),z=avenue[0][1];
 assert(avenue.every(p=>Math.abs(p[1]-z)<1e-7));
 for(const name of ['求是路','明德路','博雅路']){
  const p=toWorld(roads.find(r=>r.name===name)!.points[0]);
  assert(Math.abs(p[1]-z)<1e-7&&p[0]>avenue[0][0]&&p[0]<avenue.at(-1)![0],`${name} meets the same straight avenue`);
 }
 const gate=toWorld(buildings.find(b=>b.id==='b-east-gate')!.position);
 assert(Math.abs(gate[1]-z)<1e-7&&gate[0]>653&&gate[0]<avenue.at(-1)![0]);
 const diagonal=roads.find(r=>r.name==='环教路')!.points.map(toWorld).slice(0,7);
 assert(Math.hypot(diagonal[0][0]-avenue[0][0],diagonal[0][1]-z)<1e-7);
 assert.equal(roadWidthAt('环教路',...diagonal[0],12),12,'diagonal widens smoothly to the avenue at the shared node');
 for(let i=1;i<diagonal.length;i++)assert(diagonal[i][0]<diagonal[i-1][0]&&diagonal[i][1]>diagonal[i-1][1],'continuous southwest diagonal, without the old right-angle dogleg');
});

test('the tennis-side street is straight with volleyball on its west side',()=>{
 const road=roads.find(r=>r.name==='体育馆—网球场连接路')!,points=road.points.map(toWorld),x=points[0][0];
 assert(points.every(p=>Math.abs(p[0]-x)<1e-7));
 for(const id of ['b-tennis','b-courts-west']){
  const b=buildings.find(b=>b.id===id)!;
  assert(toWorld(b.position)[0]+b.width/2<x-(road.width*.9+3)/2,'whole court clears the straight road shoulder');
 }
 const gate=buildings.find(b=>b.id==='b-academic-nw')!,tennis=buildings.find(b=>b.id==='b-tennis')!;
 const a=toWorld(gate.position),b=toWorld(tennis.position);
 assert(a[0]-gate.width/2>b[0]+tennis.width/2,'gate posts do not stand on tennis courts');
});

test('court geometry follows nine tennis courts and the stepped library court group',()=>{
 for(const id of ['b-tennis','b-courts-library']){
  const b=buildings.find(b=>b.id===id)!,g=makeBuilding(b);g.position.set(0,0,0);g.updateMatrixWorld(true);
  const top=(x:number,z:number)=>new T.Raycaster(new T.Vector3(x,8,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0]?.point.y;
  try{
   if(id==='b-tennis'){
    for(const x of [-b.width/3,0,b.width/3])for(const z of [-b.depth/3,0,b.depth/3])assert(top(x,z)!>1.6,'net across each of the nine courts');
   }else{
    assert.equal(top(-b.width*.375,-b.depth/3),undefined,'northwest corner stays open');
    assert.equal(top(-b.width*.375,b.depth/3),undefined,'southwest corner stays open');
    assert(top(-b.width*.375,0)!>.5,'middle row projects west');
   }
  }finally{disposeTree(g);}
 }
});
