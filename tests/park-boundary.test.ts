import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {parkPoint,residentialCanal,inside,roads} from '../src/data/landscape';
import {toWorld} from '../src/data/campus';
import {makeResidentialPark} from '../src/scene/residentialPark';
import {disposeTree} from '../src/scene/geometry';
test('residential park retains substantial dry land, a channel, paths and finite landscape geometry',()=>{
 let wet=0;for(let i=0;i<20;i++)for(let j=0;j<20;j++)if(inside(parkPoint((i+.5)/20,(j+.5)/20),residentialCanal))wet++;
 assert(wet/400>.15&&wet/400<.5);
 const g=makeResidentialPark();let n=0;g.traverse(o=>{if(o instanceof T.Mesh){n++;for(const v of o.geometry.getAttribute('position').array)assert(Number.isFinite(v));}});assert(n>10);disposeTree(g);
});
test('cricket perimeter road connects to the existing middle ring without a gap',()=>{
 const outer=roads.find(r=>r.name==='大学城外环西路')!,middle=roads.find(r=>r.name==='大学城中环西路')!;
 const a=toWorld(outer.points[0]),b=toWorld(middle.points[0]);assert(Math.hypot(a[0]-b[0],a[1]-b[1])<.01);
 assert(outer.points.map(toWorld).some(([x,z])=>x<-475&&z>50));
});
