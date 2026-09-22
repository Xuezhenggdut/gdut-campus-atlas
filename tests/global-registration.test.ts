import test from 'node:test';
import assert from 'node:assert/strict';
import {buildings,toWorld} from '../src/data/campus';
import {pdfToWorld} from '../src/data/planningFrame';
import {roads} from '../src/data/landscape';
test('residential districts and sports retain their distances in the complete planning page',()=>{
 // Source anchors independently expressed in full-page points, not local offsets.
 const samples=[['west-dorm-1',445+881/6,240+308/6],['east-dorm-4',695+706/6,225+656/6],['gym',633,391],['library',814,462],['south-track',750,514]] as const;
 for(const [id,x,y] of samples){const p=toWorld(buildings.find(b=>b.id==='b-'+id)!.position),q=pdfToWorld([x,y]);assert(Math.hypot(p[0]-q[0],p[1]-q[1])<1e-7,id);}
});
test('registered middle ring joins the public perimeter at both ends',()=>{
 const middle=roads.find(r=>r.name==='大学城中环西路')!.points.map(toWorld);
 for(const end of [middle[0],middle.at(-1)!])assert(roads.filter(r=>r.main&&r.name!=='大学城中环西路').some(r=>r.points.map(toWorld).some(p=>Math.hypot(p[0]-end[0],p[1]-end[1])<1e-7)));
});
