import * as T from 'three';
import type {Building} from '../data/campus';
import {Parts,pathMesh} from './geometry';

function oval(w:number,d:number){
 const r=d/2,s=(w-d)/2,points:[number,number][]=[];
 for(const side of [1,-1])for(let i=0;i<=48;i++){const a=-Math.PI/2+(side===1?0:Math.PI)+i*Math.PI/48;points.push([side*s+r*Math.cos(a),r*Math.sin(a)]);}
 points.push(points[0]);return points;
}
function flat(p:Parts,points:[number,number][],color:string,y:number){
 const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();p.add(new T.ShapeGeometry(s),color,[0,y,0],[-Math.PI/2,0,0]);
}

/** Only the main stadium: faded natural grass, eight lanes and the observed
 * jumping equipment. Other campus football grounds keep their own surfaces. */
export function makeAthleticsTrack(b:Building,p:Parts,group:T.Group){
 const w=b.width,d=b.depth,straight=(w-d)/2;
 flat(p,oval(w+3,d+3),'#789b8f',.72);
 flat(p,oval(w,d),'#b77362',.8);
 p.box(w*.7,.10,d*.57,0,.90,0,'#aaa180');
 // Low-contrast patches suggest worn natural turf, not synthetic mowing bands.
 for(let i=0;i<8;i++)for(let j=0;j<4;j++){
  const x=-w*.35+(i+.5)*w*.7/8,z=-d*.285+(j+.5)*d*.57/4;
  const patch=new T.CircleGeometry(1,7);patch.scale(w*.7/20.5,d*.57/10.25,1);
  p.add(patch,['#a9a082','#afa688','#a7a183'][(i*3+j)%3],[x,.96,z],[-Math.PI/2,0,i*.7]);
 }
 for(let lane=0;lane<8;lane++){
  const inset=1.9*(lane+1),r=(d-inset)/2;
  group.add(pathMesh(oval(w-inset,d-inset),.13,'#eadccb',1.01));
  // Staggered starts on the bend; each line spans one lane only.
  const a=.18+lane*.055;
  p.beam([straight+(r-.82)*Math.cos(a),1.035,(r-.82)*Math.sin(a)],[straight+(r+.08)*Math.cos(a),1.035,(r+.08)*Math.sin(a)],.10,'#eadccb');
 }
 for(const x of [-w*.17,-w*.13])p.box(.10,.035,7.7,x,1.035,d/2-4.5,'#eadccb');
 // Light football markings and simple portable goal frames.
 const fw=w*.60,fd=d*.48,paint='#c9c3a6';
 for(const z of [-fd/2,fd/2])p.box(fw,.035,.12,0,1.015,z,paint);
 for(const x of [-fw/2,0,fw/2])p.box(.12,.035,fd,x,1.015,0,paint);
 group.add(pathMesh(Array.from({length:49},(_,i)=>[Math.cos(i*Math.PI/24)*d*.10,Math.sin(i*Math.PI/24)*d*.10] as [number,number]),.10,paint,1.03));
 for(const side of [-1,1]){
  const x=side*fw/2,goal=d*.14,goalY=3.1;
  for(const z of [-goal/2,goal/2]){
   p.beam([x,1,z],[x,goalY,z],.11,'#eeeade');
   p.beam([x,goalY,z],[x+side*1.2,1,z],.07,'#eeeade');
  }
  p.box(.11,.11,goal,x,goalY,0,'#eeeade');p.box(.08,.08,goal,x+side*1.2,1.04,0,'#eeeade');
  for(let j=1;j<7;j++)p.beam([x,goalY,-goal/2+j*goal/7],[x+side*1.2,1,-goal/2+j*goal/7],.025,'#d9dbcd');
  for(const z of [-d*.13,d*.13])p.box(w*.08,.025,.1,side*(fw/2-w*.04),1.025,z,paint);
  p.box(.1,.025,d*.26,side*(fw/2-w*.08),1.025,0,paint);
 }
 // Blue/red landing pad in the end apron, outside the rectangular grass.
 p.box(3.8,.30,2.2,w*.405,1.02,-d*.10,'#b75e5d');
 p.box(3.8,.32,2.2,w*.405,1.33,-d*.10,'#529ac5');
 const jumpX=-w*.39;
 for(const x of [jumpX-1.25,jumpX+1.25])p.box(.10,.025,d*.32,x,1.035,0,'#e6d8c7');
 for(const z of [-d*.16,d*.16])p.box(2.6,.025,.10,jumpX,1.035,z,'#e6d8c7');
 group.add(pathMesh(Array.from({length:33},(_,i)=>[-w*.37+Math.cos(i*Math.PI/16)*.8,d*.18+Math.sin(i*Math.PI/16)*.8] as [number,number]),.09,'#d9cdc0',1.04));
}
