import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {parseLightMode} from '../src/scene/lighting';
import {applyNightEmission,makeNightLighting,roadLampSites} from '../src/scene/nightLighting';
import {buildings,toWorld} from '../src/data/campus';
import {sportsMastSites,floodlitFieldIds,floodlitCourtIds} from '../src/scene/sportsLighting';
import {roads,lakePolygons,residentialWaters,inside} from '../src/data/landscape';
import {unprojectMap} from '../src/data/projection';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';

test('night URLs restore and switching lighting restores non-emissive daytime glazing',()=>{
 assert.equal(parseLightMode('night'),'night');assert.equal(parseLightMode('unknown'),'day');
 const g=makeBuilding(buildings.find(b=>b.id==='b-east-dorm-1')!);let lit=0;
 for(let i=0;i<4;i++){
  applyNightEmission(g,true);g.traverse(o=>{if(o instanceof T.Mesh){const m=o.material as T.MeshStandardMaterial;if(m.emissiveIntensity>.1&&m.emissive.getHex()!==0){lit++;assert.equal(m.color.getHexString(),'617d80');}}});
  applyNightEmission(g,false);g.traverse(o=>{if(o instanceof T.Mesh)assert.equal((o.material as T.MeshStandardMaterial).emissive.getHex(),0);});
 }
 assert(lit>0);disposeTree(g);
 // Low-quality material conversions must remain switchable too.
 const m=new T.MeshLambertMaterial({color:'#74969a'}),mesh=new T.Mesh(new T.BoxGeometry(),m);
 applyNightEmission(mesh,true);assert(m.emissiveIntensity>0);applyNightEmission(mesh,false);assert.equal(m.emissive.getHex(),0);disposeTree(mesh);
});

test('night lights are a bounded reusable layer with soft pools and shadow-free spotlights',()=>{
 const g=makeNightLighting();assert.equal(g.visible,false);let lights=0;
 g.traverse(o=>{if(o instanceof T.Light){lights++;assert.equal(o.castShadow,false);}if(o instanceof T.Mesh)for(const n of o.geometry.getAttribute('position').array)assert(Number.isFinite(n));});
 assert.equal(lights,18);assert(g.getObjectByName('night-road-light-pools'));assert(g.getObjectByName('night-luminous-fixtures'));
 const sites=roadLampSites();assert(sites.length>50&&sites.length<500);assert.deepEqual(sites,roadLampSites());disposeTree(g);
});

test('library interior glazing lights through a separate unlit metal screen and resets by day',()=>{
 const g=makeBuilding(buildings.find(b=>b.id==='b-library')!);applyNightEmission(g,true);
 const mats=new Map<string,T.MeshStandardMaterial>();g.traverse(o=>{if(o instanceof T.Mesh){const m=o.material as T.MeshStandardMaterial;mats.set(m.color.getHexString(),m);}});
 for(const key of ['60777b','435d64','99aaa5','354d50'])assert((mats.get(key)?.emissiveIntensity??0)>0);
 assert.equal(mats.get('727d7d')!.emissive.getHex(),0,'metal screen must not become a luminous wall');
 assert(mats.get('60777b')!.emissiveIntensity>mats.get('435d64')!.emissiveIntensity,'interior bays retain brightness variation');
 applyNightEmission(g,false);for(const m of mats.values())assert.equal(m.emissive.getHex(),0);disposeTree(g);
});

test('high masts stand outside playing areas and opposing lights aim into each field',()=>{
 const sites=sportsMastSites();assert.equal(sites.length,32);
 // Every standalone court is covered, rather than only the four large fields.
 assert.deepEqual([...floodlitCourtIds].sort(),buildings.filter(b=>b.kind==='court').map(b=>b.id).sort());
 for(const id of [...floodlitFieldIds,...floodlitCourtIds]){
  const field=buildings.find(b=>b.id===id)!,[x,z]=toWorld(field.position),c=Math.cos(field.rotation),s=Math.sin(field.rotation);
  const masts=sites.filter(v=>v.id===id);assert.equal(masts.length,4);assert.equal(masts.filter(v=>v.active).length,2);
  for(const m of masts){
   const dx=m.x-x,dz=m.z-z;assert(Math.abs(dx*c-dz*s)>field.width/2||Math.abs(dx*s+dz*c)>field.depth/2);
   assert(m.court?m.height>=14&&m.height<25:m.height>=30);assert.equal(m.target.x,x);assert.equal(m.target.z,z);
   assert(![...lakePolygons,...residentialWaters].some(p=>inside(unprojectMap([m.x,m.z]),p)),'mast must stand on dry ground');
   for(const road of roads)for(let i=1;i<road.points.length;i++){
    const a=toWorld(road.points[i-1]),b=toWorld(road.points[i]),dx=b[0]-a[0],dz=b[1]-a[1];if(dx*dx+dz*dz<1e-8)continue;
    const t=Math.max(0,Math.min(1,((m.x-a[0])*dx+(m.z-a[1])*dz)/(dx*dx+dz*dz)));
    assert(Math.hypot(m.x-a[0]-t*dx,m.z-a[1]-t*dz)>road.width*.45+1.5,`${id} mast obstructs ${road.name}`);
   }
   for(const b of buildings.filter(v=>(v.height>4||v.kind==='court'||v.kind==='field')&&v.kind!=='gate')){
    const [bx,bz]=toWorld(b.position),cos=Math.cos(b.rotation),sin=Math.sin(b.rotation),u=m.x-bx,v=m.z-bz;
    assert(Math.abs(u*cos-v*sin)>b.width/2||Math.abs(u*sin+v*cos)>b.depth/2,`${id} mast intersects ${b.id}`);
   }
  }
 }
});
