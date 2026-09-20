import * as T from 'three';
import {Parts} from './geometry';
import {courtyardMass} from './courtyard';
import {buildings,toWorld,type Building} from '../data/campus';
import inscription from '../data/gate-inscription.json';

const stone='#c4bbaa',light='#ebe7dc',glass='#52696a',metal='#bac4be';
// Sparse plaza planting read from the user's overhead crop; these are local
// coordinates below the stair garden, not a procedural grove over the square.
export const entrancePlazaTrees=[{x:88,z:86,r:2.9},{x:85,z:99,r:2.5},{x:92,z:112,r:2.6},{x:122,z:86,r:3.1},{x:133,z:98,r:2.5},{x:158,z:81,r:3},{x:158,z:89,r:2.5},{x:162,z:98,r:2.4}];
type P3=[number,number,number];
function localPosition(origin:Building,target:Building):[number,number]{const a=toWorld(origin.position),b=toWorld(target.position),x=b[0]-a[0],z=b[1]-a[1],c=Math.cos(origin.rotation),s=Math.sin(origin.rotation);return [x*c-z*s,x*s+z*c];}
function rail(p:Parts,a:P3,b:P3,height=1.1){for(let i=0;i<3;i++)p.beam([a[0],a[1]+.3+i*.35,a[2]],[b[0],b[1]+.3+i*.35,b[2]],.09,light);const n=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/3.3);for(let i=0;i<=n;i++){const t=i/n;p.box(.1,height,.1,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+height/2,a[2]+(b[2]-a[2])*t,light);}}
function column(p:Parts,x:number,z:number,h:number){p.cylinder(.64,h,x,h/2,z,stone,.64,12);for(let j=1;j<18;j++)p.cylinder(.65,.07,x,j*h/18,z,'#a9a799',.65,12);p.box(1.25,.8,1.25,x,h-.1,z,metal);}
function lattice(p:Parts,x0:number,x1:number,z0:number,z1:number,y:number){
 for(const z of [z0,z1]){p.box(x1-x0,.78,.6,(x0+x1)/2,y,z,metal);rail(p,[x0,y+.4,z],[x1,y+.4,z],1);}
 for(let x=x0;x<=x1+.05;x+=3.25)p.box(.20,.42,z1-z0,x,y-.1,(z0+z1)/2,'#8c9e9c');
 for(let z=z0+3.2;z<z1;z+=3.2)p.box(x1-x0,.18,.17,(x0+x1)/2,y+.06,z,'#cbd5ce');
}

export function makeEntranceOffice(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b,coreW=w*.86,coreD=d*.75,base=3.2;
 const holes=[{x:0,z:0,width:coreW*.55,depth:coreD*.38}];
 p.box(w+4,.7,d+7,0,base-.35,0,light);
 courtyardMass(p,coreW,coreD,holes,h-base,base,'#abaea2');
 for(let f=0;f<5;f++){
  const y=base+f*(h-base)/5;
  for(const side of [-1,1]){p.box(coreW,2.3,.22,0,y+1.8,side*(coreD/2+.12),glass);for(let j=0;j<18;j++)p.box(.15,2.5,.4,-coreW/2+j*coreW/17,y+1.8,side*(coreD/2+.15),light);}
  courtyardMass(p,coreW+3,coreD+3,holes,.45,y,light);
  for(const side of [-1,1])rail(p,[-coreW/2-1,y+.4,side*(coreD/2+1.35)],[coreW/2+1,y+.4,side*(coreD/2+1.35)],1.05);
 }
 courtyardMass(p,coreW+1,coreD+1,holes,.55,h+.1,'#aab5af');
 for(const side of [-1,1]){p.box(coreW*.55,.55,.25,0,h+.7,side*coreD*.19,light);p.box(.25,.55,coreD*.38,side*coreW*.275,h+.7,0,light);}
 for(let j=0;j<=8;j++)for(const z of [-d*.62,d*.62])column(p,-w/2+j*w/8,z,h+5.1);
 // The front colonnade stands behind the three lawn slopes. The auditorium
 // is at its eastern end, not the object directly facing the central stairs.
 // Only the roof lattice and columns connect to engineering 1; no gallery floors.
 const [worldX]=toWorld(b.position);
 const engineering=buildings.find(v=>v.id==='b-engineering-1')!;
 const engineeringWest=toWorld(engineering.position)[0]-engineering.width/2;
 const extension=(b.id==='b-admin'?408:engineeringWest)-worldX;
 lattice(p,-w/2-1,extension,-d*.63,d*.63,h+5.8);
 const supports=(b.id==='b-admin'?[w/2+14,extension-13,extension]:[310-worldX,352-worldX,374-worldX,engineeringWest-worldX]).filter(x=>Math.abs(toWorld(b.position)[0]+x-335)>10);
 for(const x of supports)for(const z of [-d*.62,d*.62]){
  column(p,x,z,h+5.1);
  p.beam([x,h+4.3,z],[x-5,h+5.5,z],.27,metal);
 }
 if(b.id==='b-admin'){
  // A forward roof strip continues to the right lawn edge, clear of the
  // neighbouring engineering block behind it. Tall columns remain on land.
  const front=29,west=350-worldX,east=414-worldX;
  lattice(p,west,east,d*.63,front,h+5.8);
  for(const x of [350,364,378,392,406,413]){
   column(p,x-worldX,front-.4,h+5.1);
   p.beam([x-worldX,h+4.3,front-.4],[x-worldX-4,h+5.5,front-.4],.27,metal);
  }
 }
 if(b.id==='b-admin'){
  // Forecourt: separated flights and planted sloping beds, as in the gate photo.
  // Only the east side of the north-south entrance drive is the stair garden.
  // Keep the western office wing over water and the drive free of stair flights.
  const left=80,right=168,back=d*.64,front=76;
  p.box(right-left,.38,front-back,(left+right)/2,.23,(front+back)/2,'#cfcbbd');
  const flights=[{x:85,w:10},{x:110,w:10},{x:135,w:10},{x:160,w:10}];
  for(const flight of flights){
   for(let i=0;i<18;i++)p.box(flight.w,.35,2.2,flight.x,.55+i*.23,front-2-i*2.2,light);
   for(const side of [-1,1])rail(p,[flight.x+side*flight.w/2,.65,front-1],[flight.x+side*flight.w/2,4.6,front-39]);
  }
  for(const [x,bw] of [[97.5,11],[122.5,11],[147.5,11]] as const){
   for(let row=0;row<9;row++)p.box(bw,.38,3.8,x,.52+row*.42,front-4-row*4.3,row%3===0?'#626b44':'#85924f');
   for(const side of [-1,1])rail(p,[x+side*bw/2,.8,front-5],[x+side*bw/2,4.5,front-37]);
  }
  // Broad, level lower square after the last stair. Its southern edge follows
  // the external road setback; no generated lawn or through-road crosses it.
  const lower=new T.Shape();lower.moveTo(80,-76);lower.lineTo(168,-76);lower.lineTo(168,-101);lower.lineTo(80,-121);lower.closePath();
  p.add(new T.ShapeGeometry(lower),'#d5d1c5',[0,.45,0],[-Math.PI/2,0,0]);
  for(const x of [85,110,135,160]){
   const end=121-(x-80)*20/88;
   p.box(.35,.025,end-77,x,.48,(end+77)/2,'#b6b7ae');
  }
  for(const z of [88,98])p.box(87,.025,.25,124,.48,z,'#babbb1');
  for(const [i,tree] of entrancePlazaTrees.entries()){
   p.box(2.5,.12,2.5,tree.x,.56,tree.z,'#969b87');
   p.cylinder(.22,4.8,tree.x,2.98,tree.z,'#827963',.16,7);
   const crown=new T.IcosahedronGeometry(tree.r,1);crown.scale(1,1.1,.9);
   p.add(crown,['#72916c','#809d72','#688868'][i%3],[tree.x,6.2,tree.z]);
  }
  for(let i=0;i<9;i++){
   const x=86+i*7;p.cylinder(.13,16,x,11.5,33,metal,.13,8);
   p.box(2.1,1.5,.07,x+1.15,18.9,33,['#aa3e39','#b18c3a','#618a87'][i%3]);
  }
  inscriptionRock(p,147.5,front-1);
 }
}

function inscriptionRock(p:Parts,x:number,z:number){
 const outline=new T.Shape();outline.moveTo(-3.5,0);outline.lineTo(-4.8,3);outline.lineTo(-3.6,7);outline.lineTo(-2.4,11);outline.lineTo(-1.2,15);outline.lineTo(.5,16.8);outline.lineTo(2,14);outline.lineTo(2.5,10.8);outline.lineTo(4.3,5);outline.lineTo(4.6,1.2);outline.lineTo(3.1,0);outline.closePath();
 const rock=new T.ExtrudeGeometry(outline,{depth:2.8,bevelEnabled:true,bevelThickness:.5,bevelSize:.45,bevelSegments:2,steps:1});p.add(rock,'#b69876',[x,.7,z-1.4]);
 [...'广东工业大学'].forEach((char,index)=>{
  const path=new T.ShapePath();const commands=inscription.glyphs[char as keyof typeof inscription.glyphs];
  for(const [op,...a] of commands){const n=a as number[];if(op==='M')path.moveTo(n[0],n[1]);else if(op==='L')path.lineTo(n[0],n[1]);else if(op==='Q')path.quadraticCurveTo(n[0],n[1],n[2],n[3]);else if(op==='C')path.bezierCurveTo(n[0],n[1],n[2],n[3],n[4],n[5]);else if(op==='Z')path.currentPath?.closePath();}
  const g=new T.ShapeGeometry(path.toShapes(false));g.scale(1.7/inscription.em,1.7/inscription.em,1);p.add(g,'#774936',[x-.82,13.9-index*1.9,z+1.93]);
 });
}

export function makeSouthGate(b:Building,p:Parts){
 // The named gate remains a stable entrance point; the high roof belongs to
 // the adjacent administrative ensemble, not an invented freestanding gate.
 for(const x of [-8,-6,6,8])p.cylinder(.27,1.25,x,.7,b.depth*.32,stone,.27,8);
 const admin=buildings.find(x=>x.id==='b-admin')!,[x,z]=localPosition(b,admin);
 p.box(3.7,.25,1.7,x+147.5,.5,z+75,'#b6b19f');
}

