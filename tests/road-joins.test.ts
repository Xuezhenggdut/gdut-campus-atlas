import test from 'node:test';
import assert from 'node:assert/strict';
import {roads} from '../src/data/landscape';
import {toWorld,type Point} from '../src/data/campus';
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
 ] as const){const road=roads.find(r=>r.name===from)!;assert(distance(toWorld(road.points.at(end)!),to)<1e-7,`${from} -> ${to}`);}
 for(const road of roads.filter(r=>r.name==='东区宿舍横路'))assert(distance(toWorld(road.points.at(-1)!),'东区宿舍东侧路')<1e-7);
});
