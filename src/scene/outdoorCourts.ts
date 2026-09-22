import * as T from 'three';
import type {Building} from '../data/campus';
import {Parts,pathMesh} from './geometry';

/** Layout from the sports PDF and supplied satellite crops; markings schematic. */
export function makeOutdoorCourts(b:Building,p:Parts,g:T.Group){
 const basketball=b.id==='b-courts-south',cols=basketball?7:3,rows=basketball?3:2;
 const w=b.width,d=b.depth,gap=basketball?7:0,slot=(w-gap)/cols;
 p.box(w,.25,d,0,.35,0,'#b7bdb0');
 for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
  const x=-w/2+(i+.5)*slot+(basketball&&i>=3?gap:0);
  const offset=basketball?(i<3?-3:3):0,cellD=(d-8)/rows;
  const z=-d/2+4+(j+.5)*cellD+offset,cw=slot*.73,cd=cellD*.82,y=.72;
  p.box(slot-1,.15,cellD-1,x,.55,z,basketball?'#75869d':'#6997aa');
  for(const side of [-1,1]){
   p.box(cw,.06,.13,x,y,z+side*cd/2,'#ebece4');
   p.box(.13,.06,cd,x+side*cw/2,y,z,'#ebece4');
  }
  p.box(cw,.06,.13,x,y,z,'#ebece4');
  if(basketball){
   g.add(pathMesh(Array.from({length:33},(_,k)=>[x+Math.cos(k*Math.PI/16)*cw*.16,z+Math.sin(k*Math.PI/16)*cw*.16]),.12,'#ebece4',y));
   for(const side of [-1,1]){
    const end=z+side*cd/2;
    p.box(cw*.4,.06,.13,x,y,end-side*cd*.18,'#ebece4');
    for(const edge of [-1,1])p.box(.13,.06,cd*.18,x+edge*cw*.2,y,end-side*cd*.09,'#ebece4');
    p.box(.15,2.6,.15,x,1.8,end+side*.5,'#e1e5df');
    p.box(cw*.2,.8,.13,x,3.1,end,'#ebece4');
   }
  }else{
   for(const side of [-1,1]){
    p.box(cw,.06,.13,x,y,z+side*cd/6,'#ebece4');
    p.box(.13,2.4,.13,x+side*(cw/2+.5),1.8,z,'#ebece4');
   }
   for(let k=0;k<5;k++)p.box(cw+1,.035,.035,x,2+k*.15,z,'#cfd7d0');
  }
 }
}
