import test from 'node:test';
import assert from 'node:assert/strict';
import {inside,lakeBankRings,lakeSourcePolygons} from '../src/data/landscape';
import {toWorld} from '../src/data/campus';
test('merged banks preserve the water footprint without internal shore seams',()=>{
 const merged=lakeBankRings.map(p=>p.map(toWorld));
 const contains=(v:[number,number])=>merged.filter(p=>inside(v,p)).length%2===1;
 assert.equal(merged.filter(p=>p.reduce((s,a,i)=>s+a[0]*p[(i+1)%p.length][1]-a[1]*p[(i+1)%p.length][0],0)>0).length,1,'lake and outflow share one outer boundary');
 for(let x=10.37;x<350;x+=3.7)for(let z=100.23;z<575;z+=3.9){
  assert.equal(contains([x,z]),lakeSourcePolygons.some(p=>inside([x,z],p)),`water changed at ${x},${z}`);
 }
 for(const poly of merged)for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);assert(len>1e-6);
  const left:[number,number]=[(a[0]+b[0])/2-dz/len*.01,(a[1]+b[1])/2+dx/len*.01];
  const right:[number,number]=[(a[0]+b[0])/2+dz/len*.01,(a[1]+b[1])/2-dx/len*.01];
  assert.notEqual(contains(left),contains(right),'a bank must separate land and water');
 }
});
