import test from 'node:test';
import assert from 'node:assert/strict';
import {roads} from '../src/data/landscape';
import {toWorld,type Point} from '../src/data/campus';
import {roadWidthAt} from '../src/data/roadWidths';
import {mobilityRoute,routePose} from '../src/scene/campusMobility';
function distance(p:Point,name:string){return Math.min(...roads.filter(r=>r.name===name).flatMap(r=>{const ps=r.points.map(toWorld);return ps.slice(1).map((b,i)=>{const a=ps[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);});}));}
test('source-confirmed academic and residential road ends meet their current junctions',()=>{
 for(const [from,end,to] of [
  ['求是路',0,'知行大道'],['求是路',-1,'科研楼组团横向道路'],
  ['东苑一横路',-1,'东区宿舍东侧路'],['东区宿舍东侧路',0,'东苑三横路'],
  ['东区宿舍东侧路',-1,'东区宿舍南侧路'],
  ['西区宿舍东纵路',-1,'西三食堂南侧路'],
  ['西区广场西侧路',0,'西区宿舍北横路'],['西区广场西侧路',-1,'西区东西主路'],
  ['西区宿舍中横路',-1,'西区广场西侧路'],['挑战路',0,'东苑一横路'],
  ['国医西路',-1,'大学城中环西路'],
  ['教学楼组团横向道路',-1,'知行大道'],
  ['教学区东北侧通道',0,'教学区—东区北联络路'],
  ['教学区东北侧通道',-1,'教学楼组团横向道路'],
  ['东侧环教路',-1,'研学二路'],
  ['西区十五栋北侧连接路',0,'西区宿舍北横路'],['西区十五栋北侧连接路',-1,'西区宿舍西纵路'],
 ] as const){const road=roads.find(r=>r.name===from)!;assert(distance(toWorld(road.points.at(end)!),to)<1e-7,`${from} -> ${to}`);}
 for(const road of roads.filter(r=>r.name==='东区宿舍横路'))assert(distance(toWorld(road.points.at(-1)!),'东区宿舍东侧路')<1e-7);
});

test('Qiushi remains a single straight avenue through all five research cross streets',()=>{
 const avenue=roads.find(r=>r.name==='求是路')!.points.map(toWorld);
 assert(avenue.every(p=>Math.abs(p[0]-avenue[0][0])<1e-7));
 const crosses=roads.filter(r=>r.name==='研学二路'||r.name==='科研楼组团横向道路');
 assert.equal(crosses.length,5);
 for(const cross of crosses)assert(distance(toWorld(cross.points[0]),'求是路')<1e-7);
});

test('sports fork shares an exact node and narrows without narrowing the southern lake road',()=>{
 const west=roads.find(r=>r.name==='知行大道（南1门段）')!,ring=roads.find(r=>r.name==='环教路')!;
 const end=toWorld(west.points.at(-1)!);
 assert(ring.points.map(toWorld).some(p=>Math.hypot(p[0]-end[0],p[1]-end[1])<1e-7));
 assert.equal(roadWidthAt(ring.name,...end,ring.width),6);
 assert.equal(roadWidthAt(ring.name,50,300,ring.width),ring.width);
 assert.equal(roadWidthAt(west.name,-280,130,west.width),west.width);
 const route=mobilityRoute(ring.name!,ring.width,[[0,130],[0,170]]);
 const walker=routePose(route,20,1,ring.width*.45+.35);
 assert(Math.abs(walker.x)<=3.05+1e-8,'walkers must follow the narrowed shoulder');
});

test('research avenue offsets meet transverse streets at right angles',()=>{
 for(const name of ['创新大道','求是路','明德路','博雅路','研学二路','科研楼组团横向道路']){
  for(const road of roads.filter(r=>r.name===name)){
   const line=road.points.map(toWorld);
   for(let i=1;i<line.length;i++)assert(Math.abs(line[i][0]-line[i-1][0])<1e-7||Math.abs(line[i][1]-line[i-1][1])<1e-7,`${name} cuts diagonally across its block`);
  }
 }
 const avenue=roads.find(r=>r.name==='创新大道')!.points.map(toWorld);
 const turn=avenue.find(p=>Math.abs(p[0]-335)<1e-7)!;
 assert(distance([410,turn[1]],'科研楼组团横向道路')<1e-7,'southern offset shares the research cross-street alignment');
});
