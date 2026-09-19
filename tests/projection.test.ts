import test from 'node:test';
import assert from 'node:assert/strict';
import {projectMap,unprojectMap,mapProjection} from '../src/data/projection';
import {buildings,toWorld} from '../src/data/campus';
test('calibrated north remains north; campus grid axes become perpendicular',()=>{
 const {origin:[u,v],eastAxis:a,southAxis:b,northOnPage:n}=mapProjection;
 const east=projectMap([u+a[0]*100,v+a[1]*100]),south=projectMap([u+b[0]*100,v+b[1]*100]),north=projectMap([u+n[0]*100,v+n[1]*100]);
 assert.ok(Math.abs(east[0]*south[0]+east[1]*south[1])<1e-6);
 assert.ok(Math.abs(north[0])<1e-6&&north[1]<0);
 for(const p of [[749,855],[667,650],[1103,499],[300,178]] as [number,number][]){const q=unprojectMap(projectMap(p));assert.ok(Math.hypot(q[0]-p[0],q[1]-p[1])<1e-8);}
});
test('culture entrance faces its forecourt, with athletics behind',()=>{
 const b=buildings.find(b=>b.id==='b-culture')!,center=toWorld(b.position),road=toWorld([717,680]),track=toWorld([594,622]);
 const normal=[Math.sin(b.rotation),Math.cos(b.rotation)];
 assert.ok((road[0]-center[0])*normal[0]+(road[1]-center[1])*normal[1]>0);
 assert.ok((track[0]-center[0])*normal[0]+(track[1]-center[1])*normal[1]<0);
});
test('both athletics fields run perpendicular to the main gym axis',()=>{const gym=buildings.find(b=>b.id==='b-gym')!;for(const id of ['b-central-track','b-south-track']){const b=buildings.find(b=>b.id===id)!;assert.ok(Math.abs(Math.cos(b.rotation-gym.rotation))<1e-6);}});
test('independent football field stays north of south track and east of small courts without overlapping',()=>{
 const f=buildings.find(b=>b.id==='b-library-football')!,s=buildings.find(b=>b.id==='b-south-track')!,c=buildings.find(b=>b.id==='b-courts-library')!;
 const fp=toWorld(f.position),sp=toWorld(s.position),cp=toWorld(c.position);
 assert.ok(fp[1]+f.width/2<sp[1]-s.width/2);
 assert.ok(cp[0]+c.width/2<fp[0]-f.depth/2);
 assert.ok(Math.abs(fp[0]-sp[0])<1);
});
