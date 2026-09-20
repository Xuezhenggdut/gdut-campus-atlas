import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {unprojectMap} from '../src/data/projection';
import {roads,lakePolygons,lakeIsland,inside} from '../src/data/landscape';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';
const wet=(x:number,z:number)=>{const p=unprojectMap([x,z]);return lakePolygons.some(poly=>inside(p,poly))&&!inside(p,lakeIsland);};
test('waterway ends south of the library west forecourt, leaving a broad dry approach',()=>{
 for(let x=102;x<=155;x+=2)for(let z=65;z<=100;z+=2)assert.equal(wet(x,z),false,`${x},${z}`);
 assert.equal(wet(105,125),true);
});
test('library stairs and platform remain dry, and administration ground remains dry beside the open canal',()=>{
 for(let x=135;x<=254;x+=2)for(let z=44;z<=165;z+=2)assert.equal(wet(x,z),false,`library platform ${x},${z}`);
 for(const id of ['b-admin','b-comprehensive']){const [x,z]=toWorld(buildings.find(b=>b.id===id)!.position);assert.equal(wet(x,z),false,id);}
});
test('south canal remains connected beyond the outer ring',()=>{
 for(let z=350;z<=490;z+=2)assert(wet(302,z));
 for(let t=0;t<=1;t+=.02)assert(wet(307+26*t,490+ 75*t));
});
test('inner lake road is one continuous line through the south entrance and separate from outer ring',()=>{
 const ring=roads.find(r=>r.name==='环教路')!,outer=roads.find(r=>r.name==='大学城外环西路')!;
 assert(ring&&outer);assert(ring.points.length>12);
 const link=roads.find(r=>r.name==='南门内外道路连接段')!,inner=toWorld(link.points[0]),outerEnd=toWorld(link.points[1]);
 assert(ring.points.some(p=>{const q=toWorld(p);return Math.hypot(q[0]-inner[0],q[1]-inner[1])<.01;}));
 assert(outer.points.some(p=>{const q=toWorld(p);return Math.hypot(q[0]-outerEnd[0],q[1]-outerEnd[1])<.01;}));
 assert(outerEnd[1]-inner[1]>45);
});
test('diligence square has only ground paving and sits east of the separating road',()=>{
 const b=buildings.find(b=>b.id==='b-diligence-square')!,g=makeBuilding(b);g.position.set(0,0,0);g.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(g);assert(box.max.y<1);disposeTree(g);
 const main=roads.find(r=>r.name==='创新大道')!,roadX=toWorld(main.points[0])[0],library=buildings.find(b=>b.id==='b-library')!;
 assert(toWorld(library.position)[0]+library.width/2+18<roadX-main.width/2);
 assert(toWorld(b.position)[0]-b.width/2>roadX+main.width/2);
});
test('research lattice pairs face each other across the research street',()=>{
 for(const [a,b] of [['engineering-1','science'],['engineering-2','lab-1'],['engineering-3','lab-2'],['engineering-4','lab-3']]){
  const aa=toWorld(buildings.find(v=>v.id==='b-'+a)!.position),bb=toWorld(buildings.find(v=>v.id==='b-'+b)!.position);assert(Math.abs(aa[1]-bb[1])<.01);assert(bb[0]>aa[0]);
 }
});
