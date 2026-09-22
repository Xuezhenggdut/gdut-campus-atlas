import {Parts} from './geometry';
import {courtyardMass} from './courtyard';
import type {Building} from '../data/campus';
import {mullionedWindow,openRail} from './facadeDetails';
const white='#e8e8de',glass='#74969a';
export function researchBuilding(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b,lab=b.kind==='lab',color=lab?'#8bab99':b.id==='b-science'||['b-engineering-3','b-engineering-4'].includes(b.id)?'#b97662':'#82a6b5';
 const base=3.8,floors=Math.max(1,b.floors-1),step=(h-base)/floors;
 const holes=[-1,1].map(side=>({x:side*w*.235,z:0,width:w*.28,depth:d*.34}));
 courtyardMass(p,w*.91,d*.79,holes,h-base,base,color);
 // Recessed open ground floor, with continuous external columns in front.
 for(const x of [-w*.44,0,w*.44])p.box(w*.06,base-1,d*.44,x,base/2,0,glass);
 for(let f=0;f<=floors;f++){
  const y=base+f*step;courtyardMass(p,w*.95,d*.87,holes,.46,y,white);
  for(const side of [-1,1]){
   openRail(p,[-w*.475,y+.26,side*d*.435],[w*.475,y+.26,side*d*.435],white);
   openRail(p,[side*w*.475,y+.26,-d*.435],[side*w*.475,y+.26,d*.435],white);
   if(f<floors){
    for(let i=0;i<12;i++)mullionedWindow(p,-w*.445+(i+.5)*w*.89/12,y+step*.5,side*d*.4,w*.056,step*.59,side);
    // The lake-facing ends have recessed window bays behind the tall frame.
    for(let i=0;i<3;i++)mullionedWindow(p,side*(w*.455+.08),y+step*.5,-d*.26+i*d*.26,d*.2,step*.59,side,true);
   }
  }
 }
 const roof=h+.65;courtyardMass(p,w+1,d+1,holes,.72,h+.16,white);
 for(const hole of holes)for(const side of [-1,1]){
  p.box(hole.width,.55,.23,hole.x,h+1,side*hole.depth/2,white);
  p.box(.23,.55,hole.depth,hole.x+side*hole.width/2,h+1,0,white);
 }
 for(let i=0;i<=12;i++)for(const side of [-1,1])p.box(.76,roof,.76,-w/2+i*w/12,roof/2,side*(d/2+.8),white);
 for(let i=1;i<5;i++)for(const side of [-1,1])p.box(.85,roof,.85,side*(w/2+.5),roof/2,-d/2+i*d/5,white);
 // Roof level beams tie the full-height column rows together.
 for(const side of [-1,1])p.box(w+2,.5,.6,0,roof,side*(d/2+.8),white);
 for(const side of [-1,1])p.box(.6,.5,d+2,side*(w/2+.5),roof,0,white);
 // Open-ended lattice wing on the west side, visible in the official diagram.
 const wing=9;
 for(let i=0;i<=4;i++)p.box(wing,.3,.28,-w/2-wing/2,roof,-d/2+i*d/4,white);
 for(let i=0;i<=3;i++)p.box(.28,.3,d+1,-w/2-i*wing/3,roof,0,white);
 for(const z of [-d/2,d/2])p.box(.58,roof,.58,-w/2-wing,roof/2,z,white);
 for(const x of [-w*.42,0,w*.42]){
  p.box(w*.065,1.0,d*.22,x,h+1.08,0,color);
  for(let i=0;i<5;i++)p.box(w*.06,.16,.18,x,h+1.62,-d*.085+i*d*.04,white);
 }
}
