import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {unprojectMap} from '../src/data/projection';
import {roads,lakePolygons,lakeIsland,inside,libraryEastForecourt} from '../src/data/landscape';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';
const wet=(x:number,z:number)=>{const p=unprojectMap([x,z]);return lakePolygons.some(poly=>inside(p,poly))&&!inside(p,lakeIsland);};
test('waterway ends south of the library west forecourt, leaving a broad dry approach',()=>{
 for(let x=215;x<=244;x+=2)for(let z=42;z<=80;z+=2)assert.equal(wet(x,z),false,`${x},${z}`);
 assert.equal(wet(172,90),true);
});
test('library stairs and platform remain dry, and administration ground remains dry beside the open canal',()=>{
 for(let x=215;x<=320;x+=2)for(let z=45;z<=120;z+=2)assert.equal(wet(x,z),false,`library platform ${x},${z}`);
 for(const id of ['b-admin','b-comprehensive']){const [x,z]=toWorld(buildings.find(b=>b.id===id)!.position);assert.equal(wet(x,z),false,id);}
});
test('south canal reaches the outer ring without an exterior water stub',()=>{
 for(let z=350;z<470;z+=2)assert(wet(302,z));
 for(let z=484;z<=580;z+=4)for(let x=280;x<=350;x+=4)assert.equal(wet(x,z),false);
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
 const main=roads.find(r=>r.name==='创新大道')!,library=buildings.find(b=>b.id==='b-library')!,squareZ=toWorld(b.position)[1],line=main.points.map(toWorld);
 const i=line.slice(1).findIndex((q,i)=>line[i][1]<=squareZ&&q[1]>=squareZ),a=line[i],c=line[i+1],roadX=a[0]+(c[0]-a[0])*(squareZ-a[1])/(c[1]-a[1]);
 assert(toWorld(library.position)[0]+library.width/2+18<roadX-main.width/2);
 assert(toWorld(b.position)[0]-b.width/2>roadX+main.width/2);
 const frontage=roads.find(r=>r.name==='求是路')!,frontX=toWorld(frontage.points[0])[0];
 assert(toWorld(b.position)[0]-b.width/2>roadX+(main.width*.9+3)/2,'plaza clears the western road shoulder');
 assert(Math.max(...libraryEastForecourt.map(p=>toWorld(p)[0]))<roadX-(main.width*.9+3)/2,'library paving does not cover the avenue');
 assert(toWorld(b.position)[0]+b.width/2<frontX-(frontage.width*.9+3)/2,'plaza clears the eastern road shoulder');
 assert(squareZ<toWorld(library.position)[1],'circular plaza is slightly north of the library centre');
});
test('innovation inscription sits on teaching 5 frontage north of the library cross street',()=>{
 const stone=buildings.find(b=>b.id==='b-innovation-stone')!,teaching=buildings.find(b=>b.id==='b-teaching-5')!,library=buildings.find(b=>b.id==='b-library')!;
 const [sx,sz]=toWorld(stone.position),[tx,tz]=toWorld(teaching.position),[,lz]=toWorld(library.position);
 const cross=roads.find(r=>r.name==='知行大道')!,crossZ=toWorld(cross.points[1])[1];
 assert(sz-stone.depth/2>tz+teaching.depth/2,'inscription clears the teaching building');
 assert(sz+stone.depth/2<crossZ-(cross.width*.9+3)/2,'inscription stays north of the road shoulder');
 assert(Math.abs(sx-(tx+teaching.width/2))<.01,'inscription aligns with the shared teaching 5/3 entrance');
 assert(lz-library.depth/2>crossZ+cross.width/2,'library stands south of the cross street');
});
test('research lattice pairs face each other across the research street',()=>{
 for(const [a,b] of [['engineering-1','science'],['engineering-2','lab-1'],['engineering-3','lab-2'],['engineering-4','lab-3']]){
  const aa=toWorld(buildings.find(v=>v.id==='b-'+a)!.position),bb=toWorld(buildings.find(v=>v.id==='b-'+b)!.position);assert(Math.abs(aa[1]-bb[1])<.01);assert(bb[0]>aa[0]);
 }
});
