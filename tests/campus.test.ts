import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {places,buildings,sources,findPlaces,toWorld,tourIds} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';
import {mapProjection} from '../src/data/projection';
test('all IDs unique; bidirectional building/source links resolve',()=>{
 for(const list of [places,buildings,sources])assert.equal(new Set(list.map(p=>p.id)).size,list.length);
 for(const p of places){assert(p.sourceIds.length);for(const id of p.sourceIds)assert(sources.some(s=>s.id===id),id);for(const id of p.buildingIds)assert(buildings.find(b=>b.id===id)?.placeIds.includes(p.id),p.id);}
 for(const b of buildings)for(const id of b.placeIds)assert(places.find(p=>p.id===id)?.buildingIds.includes(b.id),id);
 assert.deepEqual(places.find(p=>p.id==='history-museum')?.buildingIds,places.find(p=>p.id==='library')?.buildingIds);
});
test('every built place is searchable by its full name',()=>{for(const p of places.filter(p=>p.status==='built'))assert(findPlaces(p.name).some(r=>r.id===p.id),p.name);});
test('aliases, Chinese multi-digit numbers, exact matching and empty results',()=>{
 for(const [q,id] of [['工大魔方','library'],['教一','teaching-1'],['东十一','east-dorm-11'],['西十六','west-dorm-16'],['东1','east-dorm-1'],['西三饭堂','west-dining-3']])assert.equal(findPlaces(q)[0]?.id,id,q);
 assert.equal(findPlaces('不存在的一栋楼').length,0);
 assert.equal(findPlaces('西十七').length,0);assert.equal(findPlaces('西十七','all','all',true)[0]?.id,'west-dorm-17');
 assert(findPlaces('','east','living').every(p=>p.area==='east'&&p.category==='living'));
});
test('dorms remain individual POIs and tour follows the five requested landmarks in order',()=>{
 assert.equal(places.filter(p=>/^east-dorm-/.test(p.id)).length,14);assert.equal(places.filter(p=>/^west-dorm-/.test(p.id)).length,17);
 assert.deepEqual(tourIds,['library','south-gate','admin','gym','culture']);tourIds.forEach(id=>assert(places.some(p=>p.id===id&&p.landmark&&p.status==='built')));
 const n=mapProjection.northOnPage,a=toWorld([650,665]),b=toWorld([650+n[0]*100,665+n[1]*100]);assert(Math.abs(a[0]-b[0])<.0001);assert(b[1]<a[1]);
});
test('all generated models have finite, nonempty geometry; library has multiple distinct materials',()=>{
 for(const b of buildings){const model=makeBuilding(b);let vertices=0;const mats=new Set();model.traverse(o=>{if(!(o instanceof T.Mesh))return;const p=o.geometry.getAttribute('position');vertices+=p.count;for(const n of p.array)assert(Number.isFinite(n),b.id);mats.add((o.material as T.MeshStandardMaterial).color.getHex());});if(b.kind!=='lake')assert(vertices>0,b.id);if(b.kind==='library')assert(mats.size>=5);disposeTree(model);}
});
