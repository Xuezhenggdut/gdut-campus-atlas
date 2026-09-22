import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildings,toWorld} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {disposeTree} from '../src/scene/geometry';
import {woodedHillHeight,makeAdministrationFootbridge} from '../src/scene/woodedHill';
import {entranceFlags} from '../src/scene/southEntrance';

test('the meeting centre is half covered by the high lattice with columns outside its body',()=>{
 const admin=buildings.find(b=>b.id==='b-admin')!,meeting=buildings.find(b=>b.id==='b-conference')!;
 const [mx,mz]=toWorld(meeting.position),g=makeBuilding(admin);g.updateMatrixWorld(true);
 let edge=-Infinity;
 g.traverse(o=>{if(!(o instanceof T.Mesh))return;const p=o.geometry.getAttribute('position');
  for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
   if(v.y>admin.height+5&&Math.abs(v.z-mz)<meeting.depth/2)edge=Math.max(edge,v.x);
  }
 });
 const covered=(edge-(mx-meeting.width/2))/meeting.width;
 assert(covered>.45&&covered<.56,`roof covers ${covered} of the meeting width`);
 for(let x=mx-meeting.width/2+1;x<mx+meeting.width/2-1;x+=2){
  const ray=new T.Raycaster(new T.Vector3(x,10,mz-meeting.depth*.44),new T.Vector3(0,0,1),0,meeting.depth*.85);
  assert.equal(ray.intersectObject(g,true).length,0,'tall columns must not cut into the meeting room');
 }disposeTree(g);
});

test('library eastern entrance has three broad stairs separated by open gaps',()=>{
 const b=buildings.find(b=>b.id==='b-library')!,g=makeBuilding(b);g.updateMatrixWorld(true);const [x,z]=toWorld(b.position);
 const hit=(u:number)=>new T.Raycaster(new T.Vector3(x+b.width/2+10,20,z-u),new T.Vector3(0,-1,0)).intersectObject(g,true)[0];
 for(const u of [-b.depth*.31,0,b.depth*.31])assert((hit(u)?.point.y??0)>3);
 for(const u of [-b.depth*.155,b.depth*.155])assert((hit(u)?.point.y??0)<3);
 disposeTree(g);
});

test('wooded rise stays west of the canal and the footbridge reaches the office platform',()=>{
 let peak=0;for(let x=0;x<=180;x+=10)for(let z=200;z<=370;z+=10)peak=Math.max(peak,woodedHillHeight(x,z));
 assert(peak>4&&peak<9);
 for(const [x,z] of [[210,331],[300,420],[335,320],[125,200]])assert.equal(woodedHillHeight(x,z),0);
 const g=makeAdministrationFootbridge();g.updateMatrixWorld(true);const b=buildings.find(b=>b.id==='b-admin')!,[x,z]=toWorld(b.position);
 const ray=new T.Raycaster(new T.Vector3(x-b.width*.43-.1,10,z+5.8),new T.Vector3(0,-1,0));
 assert(Math.abs(ray.intersectObject(g,true)[0].point.y-4.1)<.01);disposeTree(g);
});

test('entrance flag rows use the upper landing and ground beside the stair garden',()=>{
 assert(entranceFlags.length>=20);
 assert(entranceFlags.filter(f=>f.z===33).every(f=>f.y===4.8&&f.x<168));
 assert(entranceFlags.filter(f=>f.z>33).every(f=>f.y===.5&&f.x>168));
});
