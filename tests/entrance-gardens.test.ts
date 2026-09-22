import test from 'node:test';
import assert from 'node:assert/strict';
import {Parts,disposeTree} from '../src/scene/geometry';
import {makeEntranceGardens,gardenHeight} from '../src/scene/entranceGardens';

test('hedge emblem and school name follow planted slopes without covering stair flights',()=>{
 const p=new Parts();makeEntranceGardens(p);
 const hedge=p.bins.get('#496436')!;assert(hedge.length>6);
 for(const g of hedge){const pos=g.getAttribute('position');for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
  assert((x>92&&x<103)||(x>117&&x<128),'hedges remain inside the left and middle lawns');
  assert(z>36&&z<74);
  const elevation=y-gardenHeight(z);assert(elevation>.03&&elevation<.26,'lettering stays rooted in the lawn slope');
 }}
 const g=p.finish();disposeTree(g);
});
