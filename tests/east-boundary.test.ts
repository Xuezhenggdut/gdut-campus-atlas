import test from 'node:test';
import assert from 'node:assert/strict';
import {roads,landPolygons} from '../src/data/landscape';
import {buildings,toWorld} from '../src/data/campus';

test('the outer road beside east residences and engineering is one straight line',()=>{
 const outer=roads.find(r=>r.main&&!r.name)!.points.map(toWorld).slice(-3);
 const [a,,b]=outer,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
 assert(a[1]<-400&&b[1]>170,'line covers both residential and engineering frontages');
 for(const p of outer)assert(Math.abs((p[0]-a[0])*dz-(p[1]-a[1])*dx)/length<1e-7,'no district-registration kink');
 for(const i of [1,2])for(const p of landPolygons[i].map(toWorld))assert(((p[0]-a[0])*dz-(p[1]-a[1])*dx)/length<1e-7,'district ground does not jut across the new outer boundary');
 const middle=toWorld(roads.find(r=>r.name==='大学城中环西路')!.points.at(-1)!);
 assert(outer.some(p=>Math.hypot(p[0]-middle[0],p[1]-middle[1])<1e-7),'middle ring shares the new junction');
 const avenue=toWorld(roads.find(r=>r.name==='知行大道')!.points.at(-1)!);
 assert(Math.abs((avenue[0]-a[0])*dz-(avenue[1]-a[1])*dx)/length<1e-7,'straight avenue ends on the same outer road');
 const gate=toWorld(buildings.find(b=>b.id==='b-east-gate')!.position);
 assert(Math.abs(gate[1]-avenue[1])<1e-7&&avenue[0]-gate[0]>15&&avenue[0]-gate[0]<30,'east gate follows the corrected access');
});
