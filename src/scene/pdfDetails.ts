import * as T from 'three';
import {Parts} from './geometry';
import type {Building,Point} from '../data/campus';
import {teachingPlan} from '../data/teachingPlan';
import {plannedTeaching} from './plannedTeaching';
const white='#eeeede',glass='#74959a',roof='#d2d7cc';
function extrude(p:Parts,points:Point[],h:number,y:number,color:string){const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);p.add(g,color,[0,y,0]);}
function conferenceOutline(w:number,d:number):Point[]{
 const s=new T.Shape();s.moveTo(-w*.5,-d*.45);s.lineTo(w*.5,-d*.45);s.lineTo(w*.5,d*.12);
 s.bezierCurveTo(w*.49,d*.4,w*.36,d*.48,w*.23,d*.43);
 s.bezierCurveTo(w*.09,d*.39,w*.09,d*.31,-w*.05,d*.34);
 s.bezierCurveTo(-w*.29,d*.39,-w*.49,d*.32,-w*.5,d*.12);
 s.closePath();return s.getPoints(24).map(p=>[p.x,p.y]);
}
function curveWalls(p:Parts,points:Point[],h:number,y:number){for(let i=1;i<points.length;i++){const [x,z]=points[i-1],[xx,zz]=points[i],len=Math.hypot(xx-x,zz-z),rot=-Math.atan2(zz-z,xx-x);p.box(len+.05,h,.16,(x+xx)/2,y+h/2,(z+zz)/2,glass,rot);if(i%3===0)p.box(.16,h,.16,x,y+h/2,z,white);}}

function roofDetails(p:Parts,w:number,d:number,y:number){
 for(const [x,z] of [[-w*.27,-d*.2],[w*.18,-d*.17],[-w*.12,d*.22],[w*.3,d*.18]]){
  p.box(w*.14,.5,d*.15,x,y+.25,z,white);
  p.box(w*.10,.2,d*.11,x,y+.55,z,'#9bafb1');
  const rx=w*.07,rz=d*.075;
  for(const side of [-1,1])p.beam([x-rx,y+.6,z+side*rz],[x+rx,y+.6,z-side*rz],.13,white);
 }
 for(let i=0;i<3;i++){const x=-w*.22+i*w*.19,z=d*.02;p.box(w*.15,.22,d*.13,x,y+.25,z,white);for(let j=0;j<6;j++)p.box(w*.14,.12,.18,x,y+.46,z-d*.055+j*d*.022,'#b1c0bd');}
}
export function eastDiningOutline(w:number,d:number):Point[]{
 const s=new T.Shape();s.moveTo(-w*.5,-d*.48);s.lineTo(w*.25,-d*.48);
 s.bezierCurveTo(w*.43,-d*.36,w*.51,-d*.10,w*.5,d*.08);
 s.bezierCurveTo(w*.48,d*.35,w*.24,d*.50,0,d*.48);
 s.bezierCurveTo(-w*.23,d*.48,-w*.44,d*.31,-w*.5,d*.08);
 // The rear rectangular wing and the curved hall are separated by a visible
 // re-entrant corner; this is not a complete D-shaped / semicircular slab.
 s.lineTo(-w*.20,d*.08);s.lineTo(-w*.20,-d*.17);s.lineTo(-w*.5,-d*.17);
 s.closePath();return s.getPoints(22).map(v=>[v.x,v.y]);
}
export function detailedDining(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b;let outline:Point[]=[];
 if(b.id==='b-west-dining-3'){
  const shape=new T.Shape();shape.moveTo(-w/2,-d*.46);shape.lineTo(w/2,-d*.46);shape.lineTo(w/2,d*.12);
  shape.bezierCurveTo(w*.48,d*.42,w*.36,d*.48,w*.28,d*.33);
  shape.bezierCurveTo(w*.16,d*.2,w*.13,d*.49,0,d*.45);
  shape.bezierCurveTo(-w*.13,d*.49,-w*.16,d*.2,-w*.28,d*.33);
  shape.bezierCurveTo(-w*.44,d*.51,-w*.59,d*.32,-w/2,d*.13);shape.closePath();outline=shape.getPoints(14).map(v=>[v.x,v.y]);
 }else if(b.id==='b-east-dining-2'){
  outline=eastDiningOutline(w,d);
 }else if(b.id==='b-east-dining-1'){
  outline=[[-w*.5,-d*.48],[w*.26,-d*.48]];
  for(let i=0;i<=32;i++){const a=-Math.PI/2+i*Math.PI/32;outline.push([w*.26+Math.cos(a)*w*.24,Math.sin(a)*d*.48]);}
  outline.push([-w*.5,d*.48],outline[0]);
 }else outline=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]];
 const floorCount=b.id==='b-east-dining-2'?2:3,level=h/floorCount;
 const inset=outline.map(([x,z])=>[x*.9,z*.88] as Point);
 // Ground level remains open: only a compact stair/service core inside.
 p.box(w*.28,level-.3,d*.26,-w*.15,level/2,-d*.22,'#c6cbc5');
 for(let f=1;f<=floorCount;f++){
  const y=f*level;extrude(p,outline,.48,y,white);
  if(f<floorCount)curveWalls(p,inset,level-.55,y+.5);
 }
 const edges=outline.map((v,i)=>({v,next:outline[(i+1)%outline.length]}));
 let walked=0,nextColumn=0;
 for(const {v:[x,z],next:[xx,zz]} of edges){const len=Math.hypot(xx-x,zz-z);while(nextColumn<=walked+len){const t=len?(nextColumn-walked)/len:0;if(t>=0)p.cylinder(.32,h-.2,(x+(xx-x)*t)*.97,(h-.2)/2,(z+(zz-z)*t)*.97,white,.32,8);nextColumn+=4.8;}walked+=len;}
 if(b.id==='b-east-dining-1'){
  extrude(p,outline,.55,level,'#b95540');
  // Thin guardrails follow the curved balcony rather than a solid red wall.
  for(let i=1;i<outline.length;i++){const a=outline[i-1],q=outline[i];p.beam([a[0],level+1.25,a[1]],[q[0],level+1.25,q[1]],.10,white);}
  for(let i=0;i<=8;i++)p.box(w*.86,.22,.20,-w*.03,h+3,-d*.35+i*d*.088,white);
  for(let i=0;i<=8;i++)p.box(.20,.22,d*.75,-w*.46+i*w*.108,h+3,0,white);
  for(const x of [-w*.46,w*.4])for(const z of [-d*.35,d*.35])p.box(.27,3,.27,x,h+1.5,z,white);
  for(const z of [-d*.32,d*.32]){p.box(w*.17,.8,d*.09,w*.34,h+.9,z,'#bb5b45');p.box(w*.2,.25,d*.12,w*.34,h+1.5,z,white);}
 }else if(b.id==='b-east-dining-2'){
  for(const [x,z] of [[0,.29],[.28,.16],[.26,-.17],[-.08,.02]]){
   p.box(w*.12,.45,d*.13,x*w,h+.75,z*d,white);p.box(w*.09,.18,d*.10,x*w,h+1.05,z*d,'#9bafb1');
   for(const side of [-1,1])p.beam([x*w-w*.055,h+1.17,z*d+side*d*.06],[x*w+w*.055,h+1.17,z*d-side*d*.06],.13,white);
  }
  for(const [x,z] of [[-.28,-.33],[.04,-.12],[.14,.01]]){
   p.box(w*.15,.22,d*.12,x*w,h+.78,z*d,white);
   for(let j=0;j<7;j++)p.box(w*.14,.12,.16,x*w,h+.95,z*d-d*.05+j*d*.017,'#b1c0bd');
  }
 }else roofDetails(p,w,d,h+.55);
 for(let i=0;i<5;i++)p.box(w*.25,.28,1.2,-w*.2,.2+i*.25,-d*.53-i*.85,'#d7d9cf');
}

export function conference(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b,hh=h*.62,outline=conferenceOutline(w,d);
 extrude(p,outline,.45,.6,white);
 const inner=outline.map(([x,z])=>[x*.9,z*.88] as Point);
 extrude(p,inner,hh,.9,'#d4d6cd');
 let distance=0,nextColumn=0,nextWindow=1.5;
 for(let i=1;i<outline.length;i++){
  const a=outline[i-1],q=outline[i],len=Math.hypot(q[0]-a[0],q[1]-a[1]);
  while(nextColumn<=distance+len){const t=(nextColumn-distance)/len;if(t>=0)p.cylinder(.30,hh+1,a[0]+t*(q[0]-a[0]),(hh+1)/2,a[1]+t*(q[1]-a[1]),white,.3,8);nextColumn+=4.5;}
  while(nextWindow<=distance+len){const t=(nextWindow-distance)/len;if(t>=0)for(let row=0;row<4;row++)p.box(1.1,1.1,.14,(a[0]+t*(q[0]-a[0]))*.905,2.2+row*2.4,(a[1]+t*(q[1]-a[1]))*.885,'#89a7a6',-Math.atan2(q[1]-a[1],q[0]-a[0]));nextWindow+=2.8;}distance+=len;
 }
 extrude(p,outline,.7,hh+1,white);
 for(let i=0;i<5;i++){const x=-w*.29+i*w*.145,z=i===0?-d*.12:d*.13;p.box(w*.12,.38,d*.16,x,hh+1.85,z,'#f0eee5');for(let j=0;j<7;j++)p.box(w*.11,.13,.14,x,hh+2.08,z-d*.066+j*d*.022,'#b6c3bd');}
}

export function detailedTeaching(b:Building,p:Parts){const {width:w,depth:d,height:h}=b;const count=w>115?3:2,part=w/(count+.18*(count-1)),gap=part*.18;
 if(teachingPlan[b.id]){plannedTeaching(b,p);return;}
 for(let i=0;i<count;i++){const x=-w/2+part/2+i*(part+gap),col=i%2?'#d0ddd2':'#e6e3d0';
  // Actual open courtyard: four wings, not a solid block with a grey roof patch.
  const holeW=part*.38,holeD=d*.36,outerD=d*.82;
  for(const sign of [-1,1]){
   p.box((part-holeW)/2,h,outerD,x+sign*(part+holeW)/4,h/2,0,'#ece5d5');
   p.box(holeW,h,(outerD-holeD)/2,x,h/2,sign*(outerD+holeD)/4,'#ece5d5');
   p.box((part+.7-holeW)/2,.7,d*.94,x+sign*(part+.7+holeW)/4,h+.2,0,white);
   p.box(holeW,.7,(d*.94-holeD)/2,x,h+.2,sign*(d*.94+holeD)/4,white);
   p.box(holeW,.7,.22,x,h+.85,sign*holeD/2,white);
   p.box(.22,.7,holeD,x+sign*holeW/2,h+.85,0,white);
  }
  p.box(holeW,.2,holeD,x,.1,0,'#b5c5ad');
  for(let f=0;f<b.floors;f++){const y=1.4+f*(h-1)/b.floors;for(const side of [-1,1]){p.box((part+.25-holeW)/2,.65,d*.87,x+side*(part+.25+holeW)/4,y,0,'#82a28d');p.box(holeW,.65,(d*.87-holeD)/2,x,y,side*(d*.87+holeD)/4,'#82a28d');p.box(holeW*.78,1.9,.10,x,y+1.6,side*(holeD/2-.05),glass);}for(const sign of [-1,1])for(let j=0;j<Math.max(4,Math.round(part/4));j++){const n=Math.max(4,Math.round(part/4)),xx=x-part/2+(j+.5)*part/n;p.box(part/n*.78,2,.2,xx,y+1.65,sign*d*.418,glass);}}
  for(const xx of [x-part*.42,x+part*.42])for(const sign of [-1,1]){
   p.box(part*.065,h-1,.25,xx,h/2,sign*d*.435,'#9ebbc2');
   for(const side of [-1,1])p.box(.23,h+.7,.32,xx+side*part*.037,h/2,sign*d*.447,white);
   p.cylinder(.25,h+1,xx+part*.07,(h+1)/2,sign*d*.48,col,.25,8);
  }
  // Four small rooftop caps appear on each module in the official illustration.
  for(const xx of [x-part*.31,x+part*.31])for(const zz of [-d*.23,d*.23])p.box(part*.14,1.1,d*.2,xx,h+1.1,zz,white);
 }
 for(let i=0;i<count-1;i++){const x=-w/2+part+i*(part+gap)+gap/2;for(let f=1;f<b.floors;f++){p.box(gap+.7,.35,d*.25,x,f*h/b.floors,0,white);for(const sign of [-1,1])p.box(gap+.7,.7,.12,x,f*h/b.floors+.5,sign*d*.12,white);}
  for(const sign of [-1,1])p.box(gap+2,.55,.5,x,h+.35,sign*d*.32,white);
  for(let j=0;j<=3;j++)p.box(.38,.4,d*.64,x-gap/2+j*gap/3,h+.4,0,white);
 }
}

