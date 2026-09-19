import {Parts} from './geometry';
import {courtyardMass,type CourtOpening} from './courtyard';
import type {Building} from '../data/campus';
const wall='#e8e2d6',white='#eeeede',glass='#829c9f',sand='#be9e82';
export function technologyBuilding(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b,compact=b.id.startsWith('b-virtue'),atrium=b.id==='b-innovation-a';
 const holes:CourtOpening[]=atrium?[{x:0,z:-d*.04,width:w*.43,depth:d*.4}]:[];
 courtyardMass(p,w,d,holes,h,0,wall);
 const floors=compact?6:7,step=h/floors;
 for(let f=0;f<floors;f++){
  const y=1.1+f*step;
  for(const side of [-1,1]){
   if(compact){
    const n=8;for(let j=0;j<n;j++){
     const x=-w*.43+j*w*.86/(n-1);p.box(w*.063,1.35,.14,x,y+.6,side*(d/2+.08),glass);
     p.box(w*.068,.16,.38,x,y-.12,side*(d/2+.15),white);
    }
    for(let j=0;j<4;j++)p.box(.14,1.35,d*.11,side*(w/2+.08),y+.6,-d*.34+j*d*.225,glass);
    p.box(w,.17,.16,0,y-.3,side*(d/2+.1),'#b4c9c5');
   }else{
    p.box(w*.94,step*.43,.16,0,y+.6,side*(d/2+.09),glass);
    p.box(w+.4,.30,.44,0,y-.25,side*(d/2+.12),white);
    for(let j=0;j<=Math.round(w/3);j++)p.box(.10,step*.44,.2,-w*.47+j*w*.94/Math.round(w/3),y+.6,side*(d/2+.14),white);
    for(let j=0;j<4;j++)p.box(.16,step*.42,d*.13,side*(w/2+.08),y+.6,-d*.33+j*d*.22,glass);
   }
  }
  if(atrium)for(const side of [-1,1])p.box(w*.4,step*.4,.14,0,y+.6,-d*.04+side*(d*.2-.06),glass);
 }
 if(!compact)for(const x of [-w*.485,w*.485])p.box(.9,h,.65,x,h/2,d/2+.18,sand);
 courtyardMass(p,w+1.2,d+1.2,holes,.65,h,white);
 courtyardMass(p,w*.94,d*.91,holes,.16,h+.66,'#ccd0ca');
 for(const side of [-1,1]){p.box(w+1,.8,.24,0,h+1.03,side*(d/2+.4),white);p.box(.24,.8,d+1,side*(w/2+.4),h+1.03,0,white);}
 if(compact){
  p.box(w*.24,.8,d*.25,w*.20,h+1.2,-d*.15,white);
  for(let j=0;j<9;j++)p.box(w*.23,.12,.14,w*.20,h+1.65,-d*.265+j*d*.029,'#a9bcbc');
 }else for(const side of [-1,1]){
  const x=side*w*.34;p.box(w*.17,2.1,d*.55,x,h+1.5,-d*.03,wall);
  p.box(w*.18,.22,d*.57,x,h+2.65,-d*.03,white);
  p.box(w*.13,.12,d*.41,x,h+2.8,-d*.03,'#b8c6c7');
 }
 if(atrium)for(const side of [-1,1]){p.box(w*.44,.6,.24,0,h+1,-d*.04+side*d*.2,white);p.box(.24,.6,d*.4,side*w*.215,h+1,-d*.04,white);}
}

export function structureBuilding(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b;
 p.box(w*.8,h,d, -w*.1,h/2,0,'#c48848');
 p.box(w*.2,h*.8,d*.88,w*.4,h*.4,0,'#d8ded3');
 for(let f=0;f<5;f++)for(const side of [-1,1]){
  p.box(w,.5,.3,0,2+f*h/5,side*d/2,white);
  for(let j=0;j<8;j++)p.box(w*.05,2.1,.18,-w*.42+j*w*.12,3.6+f*h/5,side*(d/2+.05),glass);
 }
 for(let j=0;j<=5;j++)for(const side of [-1,1])p.box(.45,h,.45,-w*.5+j*w/5,h/2,side*(d/2+.4),white);
 p.box(w+1,.7,d+1,0,h+.3,0,white);
 for(const x of [-w*.22,w*.22]){p.box(w*.36,.12,d*.75,x,h+.75,0,'#c9ccca');p.box(.24,.5,d*.8,x+w*.18,h+1,0,white);}
 p.box(w*.17,.4,d*.18,w*.25,h+1,-d*.2,white);
}
