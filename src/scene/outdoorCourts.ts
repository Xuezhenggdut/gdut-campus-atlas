import * as T from 'three';
import type {Building} from '../data/campus';
import {Parts,pathMesh} from './geometry';

const blue='#339dbb',surround='#70a99e',lineColor='#ebece4',pole='#477b70';
export function basketballHoop(p:Parts,x:number,end:number,side:number,y:number){
 const foot=end+side*1.15,board=end-side*.25,ring=end-side*.68;
 p.box(.85,.16,.85,x,y-.01,foot,'#c6c9bc');
 const curve=new T.CatmullRomCurve3([
  new T.Vector3(x,y,foot),new T.Vector3(x,y+1.85,foot),
  new T.Vector3(x,y+2.65,foot-side*.15),new T.Vector3(x,y+2.95,board+side*.25),
  new T.Vector3(x,y+2.95,board),
 ]);
 p.add(new T.TubeGeometry(curve,12,.14,6,false),'#198eaf');
 // A pale glass backboard with a thin white perimeter and shooting square.
 p.box(1.7,1,.08,x,y+3.03,board,'#a5c7c4');
 for(const dx of [-.85,.85])p.box(.055,1,.12,x+dx,y+3.03,board,lineColor);
 for(const dy of [-.5,.5])p.box(1.7,.055,.12,x,y+3.03+dy,board,lineColor);
 for(const dx of [-.29,.29])p.box(.04,.4,.13,x+dx,y+2.96,board-side*.02,lineColor);
 for(const dy of [-.2,.2])p.box(.62,.04,.13,x,y+2.96+dy,board-side*.02,lineColor);
 const torus=new T.TorusGeometry(.24,.04,5,16);torus.rotateX(Math.PI/2);p.add(torus,'#c26f44',[x,y+2.68,ring]);
 for(let k=0;k<8;k++){const a=k*Math.PI/4;p.beam([x+Math.cos(a)*.24,y+2.66,ring+Math.sin(a)*.24],[x+Math.cos(a)*.15,y+2.23,ring+Math.sin(a)*.15],.025,lineColor);}
}
function courtLamp(p:Parts,x:number,z:number){
 p.cylinder(.12,8.7,x,4.83,z,pole,.085,7);
 p.box(1.7,.12,.14,x,9.14,z,pole);
 for(const side of [-1,1]){p.box(.72,.22,.42,x+side*.65,9.18,z,'#ad9d83');p.box(.59,.04,.34,x+side*.65,9.055,z,'#e2d9ae');}
}
function courtTree(p:Parts,x:number,z:number){
 p.box(1.7,.18,1.7,x,.63,z,'#b4b7a1');
 p.box(1.45,.45,1.45,x,.87,z,'#a5af55');
 p.cylinder(.12,3.6,x,2.61,z,'#847b55',.075,6);
 for(const [dx,dy,dz,r] of [[0,0,0,1.0],[-.55,.4,.2,.7],[.48,.6,-.2,.65]]){
  const crown=new T.IcosahedronGeometry(r,1);crown.scale(.9,1.15,.9);p.add(crown,'#8caa66',[x+dx,4.4+dy,z+dz]);
 }
}

/** Layout from the sports PDF and supplied satellite crops; markings schematic. */
export function makeOutdoorCourts(b:Building,p:Parts,g:T.Group){
 const basketball=b.id==='b-courts-south',cols=basketball?7:3,rows=basketball?3:2;
 const w=b.width,d=b.depth,gap=basketball?7:0,slot=(w-gap)/cols;
 p.box(w,.25,d,0,.35,0,basketball?surround:'#b7bdb0');
 for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
  const x=-w/2+(i+.5)*slot+(basketball&&i>=3?gap:0);
  const offset=basketball?(i<3?-3:3):0,cellD=(d-8)/rows;
  const z=-d/2+4+(j+.5)*cellD+offset,cw=slot*.73,cd=cellD*.82,y=.72;
  p.box(basketball?cw+1:slot-1,.15,basketball?cd+1:cellD-1,x,.55,z,basketball?blue:'#6997aa');
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
    const r=cw*.42;
    g.add(pathMesh(Array.from({length:25},(_,k)=>{const a=k*Math.PI/24;return [x+Math.cos(a)*r,end-side*(1+Math.sin(a)*r)] as [number,number];}),.10,lineColor,y));
    for(const edge of [-1,1])p.box(.10,.06,1,x+edge*r,y,end-side*.5,lineColor);
    const freeZ=end-side*cd*.18;
    g.add(pathMesh(Array.from({length:17},(_,k)=>{const a=k*Math.PI/16;return [x+Math.cos(a)*cw*.2,freeZ-side*Math.sin(a)*cw*.2] as [number,number];}),.10,lineColor,y));
    basketballHoop(p,x,end,side,y);
   }
  }else{
   for(const side of [-1,1]){
    p.box(cw,.06,.13,x,y,z+side*cd/6,'#ebece4');
    p.box(.13,2.4,.13,x+side*(cw/2+.5),1.8,z,'#ebece4');
   }
   for(let k=0;k<5;k++)p.box(cw+1,.035,.035,x,2+k*.15,z,'#cfd7d0');
  }
 }
 if(basketball){
  // Fixtures occupy the aisles BETWEEN the registered court columns.
  for(let i=0;i<cols-1;i++){
   const a=-w/2+(i+.5)*slot+(i>=3?gap:0),q=-w/2+(i+1.5)*slot+(i+1>=3?gap:0),x=(a+q)/2;
   for(let j=0;j<rows;j++){
    const cellD=(d-8)/rows,z=-d/2+4+(j+.5)*cellD+(i<2?-3:i>=3?3:0);
    courtLamp(p,x,z-3.3);courtTree(p,x,z+3.3);
    if((i+j)%2===0){p.box(1.8,.15,.55,x,.98,z+5.1,'#c9c9b9');for(const dx of [-.65,.65])p.box(.2,.45,.4,x+dx,.69,z+5.1,'#a3aca0');}
   }
  }
  // Fine open perimeter fence; central approach stays open on both ends.
  for(const side of [-1,1]){
   for(let z=-d/2+.15;z<=d/2-.15;z+=4)p.box(.10,2.8,.10,side*(w/2-.15),1.88,z,pole);
   for(const y of [1.1,2.0,3.2])p.box(.055,.055,d,side*(w/2-.15),y,0,pole);
   const gapX=-w/2+3*slot+gap/2;
   for(const [lo,hi] of [[-w/2+.15,gapX-3],[gapX+3,w/2-.15]]){
    for(let x=lo;x<=hi;x+=4)p.box(.10,2.8,.10,x,1.88,side*(d/2-.15),pole);
    for(const y of [1.1,2,3.2])p.box(hi-lo,.055,.055,(lo+hi)/2,y,side*(d/2-.15),pole);
   }
  }
 }
}
