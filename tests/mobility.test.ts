import {bridgeX,bridgeZ} from '../src/scene/roadNetwork';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {CampusMobility,mobilityActors,mobilityRoute,routePose} from '../src/scene/campusMobility';
import {disposeTree} from '../src/scene/geometry';

test('cars follow both bridge ramps while Tiaozhan traffic remains below',()=>{
 const bridge=mobilityRoute('大学城中环西路',25,[[bridgeX-97,bridgeZ],[bridgeX+103,bridgeZ]]);
 for(const direction of [-1,1]){
  assert(Math.abs(routePose(bridge,97,direction,4.4).y-7.56)<.001);
  assert(Math.abs(routePose(bridge,10,direction,4.4).y-.46)<.001);
  assert(routePose(bridge,44,direction,4.4).pitch*direction<0);
  assert(routePose(bridge,150,direction,4.4).pitch*direction>0);
 }
 const below=mobilityRoute('挑战路',10,[[bridgeX,bridgeZ-107],[bridgeX,bridgeZ+138]]);
 assert(Math.abs(routePose(below,107,1,1.65).y-.46)<.001);
 const m=new CampusMobility(),mesh=m.group.getObjectByName('mobility-car')!.children[0] as T.InstancedMesh;
 for(const [i,a] of mobilityActors().cars.entries()){
  const matrix=new T.Matrix4();mesh.getMatrixAt(i,matrix);
  assert(Math.abs(matrix.elements[13]-routePose(a.route,a.offset,a.direction,a.lane).y)<.00001);
 }
 disposeTree(m.group);
});

test('motor traffic stays on public ring roads; campus population primarily cycles',()=>{
 const {cars,bikes,walkers}=mobilityActors();assert(cars.length>0&&walkers.length>0&&bikes.length>walkers.length);
 assert(cars.every(a=>['大学城外环西路','大学城中环西路'].includes(a.route.name)));assert([...bikes,...walkers].every(a=>!['大学城外环西路','大学城中环西路'].includes(a.route.name)));
 for(const a of [...cars,...bikes,...walkers]){assert(a.route.length>0);for(let t=0;t<100;t++){const p=routePose(a.route,a.offset+t*a.speed*a.direction,a.direction,a.lane);assert([p.x,p.z,p.yaw,p.scale].every(Number.isFinite));assert(p.scale>=0&&p.scale<=1);}}
});

test('two-way lanes are distinct and actors loop without drawing a jump across campus',()=>{
 const r=mobilityRoute('test',24,[[0,0],[0,0],[100,0],[100,100]]);
 const a=routePose(r,50,1,4),b=routePose(r,50,-1,4);assert.equal(a.z,-4);assert.equal(b.z,4);assert(Math.abs(a.yaw-b.yaw)>3);
 assert.equal(routePose(r,0,1,4).scale,0);assert.deepEqual(routePose(r,30,1,4),routePose(r,230,1,4));
});

test('mobility uses reusable instances and stops updating when disabled or motion is reduced',()=>{
 const m=new CampusMobility(),mesh=m.group.getObjectByName('mobility-bike')!.children[0] as T.InstancedMesh;assert(mesh.isInstancedMesh);
 const first=new T.Matrix4(),next=new T.Matrix4();mesh.getMatrixAt(4,first);assert.equal(m.step(.1,false),false);mesh.getMatrixAt(4,next);assert(first.equals(next));
 assert(m.step(.1));mesh.getMatrixAt(4,next);assert(!first.equals(next));m.setVisible(false);assert.equal(m.step(.1),false);assert(!m.group.visible);
 m.setNight(true);m.setNight(false);disposeTree(m.group);
});
