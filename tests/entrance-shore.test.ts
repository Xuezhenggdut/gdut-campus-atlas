import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {roads,lakePolygons,lakeIsland,promenades,inside} from '../src/data/landscape';
import {buildings,toWorld,type Point} from '../src/data/campus';
import {unprojectMap} from '../src/data/projection';
import {pathMesh,disposeTree} from '../src/scene/geometry';
import {makeBuilding} from '../src/scene/models';
import {entrancePlazaTrees} from '../src/scene/southEntrance';

test('lake-bank road shoulders and lakeside walks stay on dry land',()=>{
 const paths=[...roads.filter(r=>['环教路','南门内外道路连接段','大学城外环西路'].includes(r.name??'')).map(r=>({points:r.points,width:r.width*.9+3})),...promenades.map(points=>({points,width:3.4}))];
 for(const path of paths){
  const mesh=pathMesh(path.points.map(toWorld),path.width,'#fff'),pos=mesh.geometry.getAttribute('position'),idx=mesh.geometry.index!;
  for(let i=0;i<idx.count;i+=3){
   const tri=[0,1,2].map(j=>[pos.getX(idx.getX(i+j)),pos.getZ(idx.getX(i+j))] as Point);
   const xs=tri.map(p=>p[0]),zs=tri.map(p=>p[1]);
   for(let x=Math.min(...xs);x<=Math.max(...xs);x+=1)for(let z=Math.min(...zs);z<=Math.max(...zs);z+=1){
    if(!inside([x,z],tri))continue;const uv=unprojectMap([x,z]);
    const southCanalCrossing=x>=285&&x<=325&&z>=455&&z<=485;
    assert(southCanalCrossing||(x>=275&&x<=320&&z>=358&&z<=393)||!lakePolygons.some(poly=>inside(uv,poly))||inside(uv,lakeIsland),`pavement overlaps water at ${x.toFixed(1)},${z.toFixed(1)}`);
   }
  }disposeTree(mesh);
 }
});

test('south entrance has three planted slopes, a level lower square and a clear western drive',()=>{
 const b=buildings.find(v=>v.id==='b-admin')!,g=makeBuilding(b);g.updateMatrixWorld(true);
 const [x,z]=toWorld(b.position),ray=new T.Raycaster();
 const hit=(dx:number,dz:number)=>{ray.set(new T.Vector3(x+dx,100,z+dz),new T.Vector3(0,-1,0));return ray.intersectObject(g,true)[0];};
 for(const dx of [97.5,122.5,147.5]){const h=hit(dx,60)!;assert(h);assert(['626b44','85924f'].includes(((h.object as T.Mesh).material as T.MeshStandardMaterial).color.getHexString()));}
 for(const dx of [90,120,155]){const h=hit(dx,95)!;assert(h);assert(h.point.y<1.6,'lower square must be level paving, not stairs or a mound');}
 assert.equal(hit(335-x,90),undefined,'stair flights must not occupy the entrance drive');
 disposeTree(g);
});

test('sparse entrance trees stay below the stairs and leave the stone and square routes open',()=>{
 assert.equal(entrancePlazaTrees.length,8);
 for(const t of entrancePlazaTrees){
  const front=121-(t.x-80)*20/88;
  assert(t.x-t.r>80&&t.x+t.r<168&&t.z-t.r>76&&t.z+t.r<front,'tree crown stays within lower plaza');
  assert(Math.hypot(t.x-147.5,t.z-75)>t.r+5,'tree must not cover the inscription rock');
 }
});

test('lawn-facing tall colonnade continues east, with auditorium and inscription rock on the right',()=>{
 const admin=buildings.find(v=>v.id==='b-admin')!,meeting=buildings.find(v=>v.id==='b-conference')!;
 const [mx,mz]=toWorld(meeting.position),[ax,az]=toWorld(admin.position);
 const engineering=buildings.find(v=>v.id==='b-engineering-1')!;
 assert(Math.abs(mx-meeting.width/2-(toWorld(engineering.position)[0]-engineering.width/2))<.01,'auditorium aligns with the western engineering edge');
 const ratio=meeting.width*meeting.depth/(engineering.width*engineering.depth);
 assert(ratio>.30&&ratio<.36,'auditorium footprint is about one third of engineering 1');
 assert(mx>ax+147.5&&mz+meeting.depth/2<az+35,'auditorium is east of the right lawn and behind the planted slopes');
 assert(mz+meeting.depth/2<az+76,'auditorium stays behind the lower square');
 const g=makeBuilding(admin);g.updateMatrixWorld(true);
 for(const wx of [364,392,413]){
  const ray=new T.Raycaster(new T.Vector3(wx,10,az+85),new T.Vector3(0,0,-1));
  const column=ray.intersectObject(g,true).find(h=>h.point.z<az+34&&h.point.z>az+25);
  assert(column,`missing tall column behind lawn near ${wx}`);
 }
 const rocks:T.Mesh[]=[];g.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)&&(o.material as T.MeshStandardMaterial).color.getHexString()==='b69876')rocks.push(o);});
 assert.equal(rocks.length,1);const box=new T.Box3().setFromObject(rocks[0]);
 assert(box.min.x>ax+135&&box.max.x<ax+160,'stone belongs at the right lawn, not the left stairs');
 disposeTree(g);
});

test('comprehensive and engineering 1 remain separate across clear ground passages',()=>{
 const a=buildings.find(v=>v.id==='b-comprehensive')!,b=buildings.find(v=>v.id==='b-engineering-1')!;
 const [ax,az]=toWorld(a.position),[bx,bz]=toWorld(b.position);
 assert(Math.abs(az-bz)<.01,'connected buildings must share the same row');
 const g=makeBuilding(a);g.updateMatrixWorld(true);
 const ray=new T.Raycaster();
 // Gallery decks must physically reach both bodies, including over each road.
 for(let x=ax+a.width/2+5;x<bx-b.width*.44;x+=2){
  ray.set(new T.Vector3(x,12,az+a.depth*.75*.33),new T.Vector3(0,-1,0));
  assert.equal(ray.intersectObject(g,true).length,0,`unwanted gallery at ${x}`);
 }
 // Sample both road widths at vehicle height, including the column rows.
 for(const [cx,width] of [[335,16],[397,11]])for(let x=cx-width/2;x<=cx+width/2;x+=.5){
  ray.set(new T.Vector3(x,3,az-25),new T.Vector3(0,0,1));ray.far=50;
  assert.equal(ray.intersectObject(g,true).length,0,`support obstructs road at ${x}`);
 }
 disposeTree(g);
});
