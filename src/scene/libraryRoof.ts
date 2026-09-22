import {Parts} from './geometry';
import type {Building} from '../data/campus';

/** Roof proportions inferred from the user's oblique aerial; the four square
 * heads and the central rectangular element are visible, but their uses and
 * measured dimensions are not established by the photograph. */
export function makeLibraryRoof(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b,deck=h+.5;
 const pale='#e1dfd2',rim='#eeeae0',shade='#898d83';
 const heads=[
  {x:-w*.22,z:-d*.22,color:'#719783'},
  {x:w*.22,z:-d*.22,color:'#d29355'},
  {x:-w*.22,z:d*.22,color:'#d29355'},
  {x:w*.22,z:d*.22,color:'#a8af68'},
 ];
 const hw=w*.145,hd=d*.145,headTop=deck+3.2;
 for(const head of heads){
  // A colored lower band and a pale upper cap, not four plain grey blocks.
  p.box(hw,1.05,hd,head.x,deck+.525,head.z,head.color);
  p.box(hw,1.9,hd,head.x,deck+2.0,head.z,pale);
  p.box(hw+.45,.25,hd+.45,head.x,headTop,head.z,rim);
  p.box(hw-.55,.07,hd-.55,head.x,headTop+.17,head.z,'#b4b7b0');
  for(const side of [-1,1])p.box(.13,2.95,.13,head.x+side*hw/2,deck+1.475,head.z+hd/2+.05,rim);
 }
 // Recessed central rectangle with a raised rim and shallow parallel slats.
 const cw=w*.235,cd=d*.19,cz=-d*.025;
 p.box(cw,.32,cd,0,deck+.2,cz,shade);
 for(const side of [-1,1]){
  p.box(cw+.6,1.2,.3,0,deck+.6,cz+side*(cd/2+.15),pale);
  p.box(.3,1.2,cd,side*(cw/2+.15),deck+.6,cz,pale);
 }
 for(let i=0;i<8;i++)p.box(cw-.6,.13,.20,0,deck+.6,cz-cd/2+(i+.5)*cd/8,'#b4b7b0');
 // The aerial shows an actual shallow lattice across the inner roof. Split
 // each beam around raised objects so no bar crosses through a roof head.
 const holes=[...heads.map(v=>({x:v.x,z:v.z,w:hw+.85,d:hd+.85})),{x:0,z:cz,w:cw+.9,d:cd+.9}];
 function spans(cuts:[number,number][],min:number,max:number){
  const result:[number,number][]=[];let start=min;
  for(const [a,z] of cuts.sort((a,b)=>a[0]-b[0])){if(a>start)result.push([start,Math.min(a,max)]);start=Math.max(start,z);}
  if(start<max)result.push([start,max]);return result.filter(([a,z])=>z>a);
 }
 const rx=w*.385,rz=d*.385,n=24;
 p.box(rx*2,.06,rz*2,0,deck+.06,0,'#92968b');
 for(let i=0;i<=n;i++){
  const x=-rx+i*2*rx/n,z=-rz+i*2*rz/n;
  const alongZ=holes.filter(v=>Math.abs(x-v.x)<v.w/2).map(v=>[v.z-v.d/2,v.z+v.d/2] as [number,number]);
  const alongX=holes.filter(v=>Math.abs(z-v.z)<v.d/2).map(v=>[v.x-v.w/2,v.x+v.w/2] as [number,number]);
  for(const [a,q] of spans(alongZ,-rz,rz))p.box(.16,.30,q-a,x,deck+.48,(a+q)/2,pale);
  for(const [a,q] of spans(alongX,-rx,rx))p.box(q-a,.22,.16,(a+q)/2,deck+.56,z,pale);
 }
 // Low colorful partitions wrap all four terraces. The walking strip
 // separates these open cells from the central lattice.
 const colors=['#d29355','#e4ded0','#6a9fae','#e4ded0','#a8af68','#e4ded0'];
 for(const axis of [0,1])for(const side of [-1,1]){
  const length=axis?d:w,depth=axis?w:d,slots=10,cell=length*.88/slots;
  const box=(bw:number,bh:number,bd:number,u:number,y:number,v:number,color:string)=>
   axis?p.box(bd,bh,bw,v,y,u,color):p.box(bw,bh,bd,u,y,v,color);
  for(let i=0;i<slots;i++){
   const u=-length*.44+(i+.5)*cell,color=colors[(i+axis*2+(side===1?1:0))%colors.length];
   box(.18,1.75,depth*.085,u-cell/2,deck+.875,side*depth*.438,rim);
   if(i%3!==1)box(cell*.82,1.35,.18,u,deck+.675,side*depth*.405,color);
  }
 }
}
