import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {Parts,disposeTree} from '../src/scene/geometry';
import {makeEntranceGardens,gardenHeight} from '../src/scene/entranceGardens';

test('hedge emblem and school name sit on the front terrace without covering stair flights',()=>{
 const p=new Parts();makeEntranceGardens(p);
 const hedge=p.bins.get('#496436')!;assert(hedge.length>6);
 for(const g of hedge){const pos=g.getAttribute('position');for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
  assert((x>92&&x<103)||(x>117&&x<128),'hedges remain inside the left and middle lawns');
  assert(z>61.3&&z<74,'the glyph must not straddle a terrace riser');
  const elevation=y-gardenHeight(z);assert(elevation>.03&&elevation<.26,'lettering stays rooted in the terrace');
 }}
 const g=p.finish();disposeTree(g);
});

test('entrance planting has three flat steps with clear stair gaps',()=>{
 const p=new Parts();makeEntranceGardens(p);const g=p.finish();g.updateMatrixWorld(true);
 const down=(x:number,z:number)=>new T.Raycaster(new T.Vector3(x,10,z),new T.Vector3(0,-1,0)).intersectObject(g,true)[0]?.point.y;
 for(const [a,b,y] of [[62,72,1.6],[50,60,2.7],[38,47,3.8]])for(const z of [a,b])assert(Math.abs(down(147.5,z)!-y)<.01);
 for(const x of [85,110,135,160])assert.equal(down(x,55),undefined);
 disposeTree(g);
});
