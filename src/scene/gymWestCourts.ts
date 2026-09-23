import {Parts} from './geometry';
import {basketballHoop} from './outdoorCourts';

const white='#ebece4';
export const gymCourtY=3.64;

/** Two recessed outdoor courts west of the hall, north volleyball / south basketball.
 * Keep a margin to the hall's roof overhang and the western circulation edge.
 * Dimensions are model proportions, not surveyed regulation court dimensions. */
export function gymWestCourts(w:number,d:number){
 return (['volleyball','basketball'] as const).map((kind,i)=>({
  kind,x:-w*.57,z:d*(i===0?-.38:-.01),w:w*.15,d:d*.29,
  x0:-w*.655,x1:-w*.485,z0:d*(i===0?-.38:-.01)-d*.16,z1:d*(i===0?-.38:-.01)+d*.16,
 }));
}

export function makeGymWestCourts(p:Parts,w:number,d:number){
 for(const c of gymWestCourts(w,d)){
  const y=gymCourtY+.04,cw=c.w*.78,cd=c.d*.84;
  p.box(c.x1-c.x0,.16,c.z1-c.z0,(c.x0+c.x1)/2,gymCourtY-.19,c.z,'#b9b7a8');
  p.box(c.w,.18,c.d,c.x,gymCourtY-.09,c.z,c.kind==='volleyball'?'#68858e':'#b96f55');
  for(const side of [-1,1]){
   p.box(cw,.04,.10,c.x,y,c.z+side*cd/2,white);
   p.box(.10,.04,cd,c.x+side*cw/2,y,c.z,white);
  }
  p.box(cw,.04,.10,c.x,y,c.z,white);
  if(c.kind==='volleyball'){
   for(const side of [-1,1]){
    p.box(cw,.04,.10,c.x,y,c.z+side*cd/6,white);
    p.cylinder(.075,2.5,c.x+side*(cw/2+.5),gymCourtY+1.25,c.z,'#477b70');
   }
   for(let row=0;row<=5;row++)p.box(cw+1,.025,.025,c.x,gymCourtY+1.55+row*.15,c.z,white);
   for(let x=c.x-cw/2-.5;x<=c.x+cw/2+.5;x+=.45)p.box(.025,.75,.025,x,gymCourtY+1.925,c.z,white);
  }else{
   const arc=(x:number,z:number,r:number,a0:number,a1:number)=>{
    for(let k=0;k<32;k++){
     const a=a0+(a1-a0)*k/32,b=a0+(a1-a0)*(k+1)/32;
     p.beam([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],.075,white);
    }
   };
   arc(c.x,c.z,cw*.16,0,Math.PI*2);
   for(const side of [-1,1]){
    const end=c.z+side*cd/2,free=end-side*cd*.2;
    p.box(cw*.4,.04,.10,c.x,y,free,white);
    for(const dx of [-cw*.2,cw*.2])p.box(.10,.04,cd*.2,c.x+dx,y,end-side*cd*.1,white);
    arc(c.x,free,cw*.2,side===1?Math.PI:0,side===1?Math.PI*2:Math.PI);
    arc(c.x,end-side*.65,cw*.43,side===1?Math.PI:0,side===1?Math.PI*2:Math.PI);
    basketballHoop(p,c.x,end,side,gymCourtY);
   }
  }
 }
}
