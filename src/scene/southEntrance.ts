import * as T from 'three';
import {Parts} from './geometry';
import {courtyardMass} from './courtyard';
import {buildings,toWorld,type Building} from '../data/campus';
import inscription from '../data/gate-inscription.json';
import {mullionedWindow} from './facadeDetails';
import {makeEntranceGardens} from './entranceGardens';

const stone='#c4bbaa',light='#ebe7dc',glass='#52696a',metal='#bac4be';
// Sparse plaza planting read from the user's overhead crop; these are local
// coordinates below the stair garden, not a procedural grove over the square.
export const entrancePlazaTrees=[{x:88,z:86,r:2.9},{x:85,z:99,r:2.5},{x:92,z:112,r:2.6},{x:122,z:86,r:3.1},{x:133,z:98,r:2.5},{x:158,z:81,r:3},{x:158,z:89,r:2.5},{x:162,z:98,r:2.4}];

// Aerial reference: two north-south rows on the upper forecourt, behind the
// stair lawns, flanking the light well. No poles continue into the eastern trees.
// makeBuilding adds 1 unit in Y, so 3.8 here meets the world-space 4.8 deck.
export const entranceFlags=[94,145].flatMap((x,row)=>
 Array.from({length:8},(_,i)=>({x,z:14+i*2.8,h:row===1&&i===3?27:19+(i%4)*1.8,y:3.8,national:row===1&&i===3,color:row===1&&i===3?'#cf3337':['#349ec1','#408963','#cf3337','#dfb43b'][(i+row)%4]})));
function makeEntranceFlags(p:Parts){
 for(const [i,f] of entranceFlags.entries()){
  p.cylinder(.95,1.5,f.x,f.y+.75,f.z,'#949b96',.48,4);
  p.cylinder(.11,f.h,f.x,f.y+f.h/2,f.z,'#b9c5c4',.075,8);
  p.cylinder(.18,.25,f.x,f.y+f.h+.12,f.z,'#d7d8c6',.18,8);
  const flag=new T.PlaneGeometry(3.4,2.0,8,3),pos=flag.getAttribute('position');
  for(let j=0;j<pos.count;j++){const t=(pos.getX(j)+1.7)/3.4;pos.setX(j,t*3.4);pos.setZ(j,Math.sin(t*Math.PI*2+i*.8)*.35*t);}
  flag.computeVertexNormals();const reverse=flag.clone(),index=reverse.index!;
  for(let j=0;j<index.count;j+=3){const a=index.getX(j);index.setX(j,index.getX(j+2));index.setX(j+2,a);}reverse.computeVertexNormals();
  p.add(flag,f.color,[f.x,f.y+f.h-1.3,f.z]);p.add(reverse,f.color,[f.x,f.y+f.h-1.3,f.z]);
  if(f.national){
   // Five stars follow the same cloth displacement and are visible on both faces.
   for(const [sx,sy,r] of [[.55,.46,.28],[1.08,.72,.095],[1.3,.43,.095],[1.3,.08,.095],[1.08,-.18,.095]]){
    const s=new T.Shape(),angle=r>.2?Math.PI/2:Math.atan2(.46-sy,.55-sx);
    for(let k=0;k<10;k++){const a=angle+k*Math.PI/5,rr=k%2?r*.382:r;const x=sx+Math.cos(a)*rr,y=sy+Math.sin(a)*rr;k?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();
    const g=new T.ShapeGeometry(s),a=g.getAttribute('position');
    for(let j=0;j<a.count;j++){const t=a.getX(j)/3.4;a.setZ(j,Math.sin(t*Math.PI*2+i*.8)*.35*t+.025);}g.computeVertexNormals();
    const back=g.clone(),ix=back.index!;for(let j=0;j<ix.count;j+=3){const n=ix.getX(j);ix.setX(j,ix.getX(j+2));ix.setX(j+2,n);}back.translate(0,0,-.05);back.computeVertexNormals();
    p.add(g,'#f0cf55',[f.x,f.y+f.h-1.3,f.z]);p.add(back,'#f0cf55',[f.x,f.y+f.h-1.3,f.z]);
   }
  }
 }
}

function waterfrontOfficeDeck(p:Parts,w:number,d:number,y:number){
 // A raised curved edge over the water. This is a thin supported deck, not
 // new terrain: the previously calibrated dry bank/road remains independent.
 const x=w/2+2,z=d/2+3.5,shape=new T.Shape();
 shape.moveTo(-x+4,-z);shape.lineTo(x,-z);shape.lineTo(x,z-3);
 shape.quadraticCurveTo(x,z+1,x-4,z+1);shape.lineTo(-w*.05,z+1);
 shape.bezierCurveTo(-w*.22,z+1,-w*.16,z+5,-w*.32,z+5);
 shape.bezierCurveTo(-x-3,z+5,-x,z-2,-x,z-5);
 shape.lineTo(-x,-z+4);shape.quadraticCurveTo(-x,-z,-x+4,-z);shape.closePath();
 const g=new T.ExtrudeGeometry(shape,{depth:.6,bevelEnabled:false,curveSegments:12});g.rotateX(Math.PI/2);p.add(g,light,[0,y,0]);
 const edge=shape.getPoints(12);for(let i=1;i<edge.length;i++)rail(p,[edge[i-1].x,y,edge[i-1].y],[edge[i].x,y,edge[i].y]);
 for(const sx of [-w*.42,0,w*.42])for(const sz of [-d*.48,d*.48])p.cylinder(.58,y-.6,sx,(y-.6)/2,sz,stone,.58,10);
}
type P3=[number,number,number];
function localPosition(origin:Building,target:Building):[number,number]{const a=toWorld(origin.position),b=toWorld(target.position),x=b[0]-a[0],z=b[1]-a[1],c=Math.cos(origin.rotation),s=Math.sin(origin.rotation);return [x*c-z*s,x*s+z*c];}
function rail(p:Parts,a:P3,b:P3,height=1.1){for(let i=0;i<3;i++)p.beam([a[0],a[1]+.3+i*.35,a[2]],[b[0],b[1]+.3+i*.35,b[2]],.09,light);const n=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/3.3);for(let i=0;i<=n;i++){const t=i/n;p.box(.1,height,.1,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+height/2,a[2]+(b[2]-a[2])*t,light);}}
function column(p:Parts,x:number,z:number,h:number){p.cylinder(.74,h,x,h/2,z,stone,.74,12);for(let j=1;j<18;j++)p.cylinder(.75,.045,x,j*h/18,z,'#b2ad9f',.75,12);p.box(1.5,.8,1.5,x,h-.1,z,metal);}
function lattice(p:Parts,x0:number,x1:number,z0:number,z1:number,y:number,opening?:{width:number;depth:number}){
 for(const z of [z0,z1]){p.box(x1-x0,.78,.6,(x0+x1)/2,y,z,metal);rail(p,[x0,y+.4,z],[x1,y+.4,z],1);}
 for(let x=x0;x<=x1+.05;x+=3.25){
  const spans=opening&&Math.abs(x)<opening.width/2?[[z0,-opening.depth/2],[opening.depth/2,z1]]:[[z0,z1]];
  for(const [a,b] of spans)p.box(.20,.42,b-a,x,y-.1,(a+b)/2,'#8c9e9c');
 }
 for(let z=z0+3.2;z<z1;z+=3.2){
  const spans=opening&&Math.abs(z)<opening.depth/2?[[x0,-opening.width/2],[opening.width/2,x1]]:[[x0,x1]];
  for(const [a,b] of spans)p.box(b-a,.18,.17,(a+b)/2,y+.06,z,'#cbd5ce');
 }
 if(opening)for(const s of [-1,1]){p.box(opening.width,.42,.3,0,y,s*opening.depth/2,metal);p.box(.3,.42,opening.depth,s*opening.width/2,y,0,metal);}
}

export function makeEntranceOffice(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b,coreW=w*.86,coreD=d*.75,base=3.2;
 const floors=b.id==='b-comprehensive'?7:5,step=(h-base)/floors;
 const holes=[{x:0,z:0,width:coreW*.55,depth:coreD*.38}];
 waterfrontOfficeDeck(p,w,d,base);
 courtyardMass(p,coreW,coreD,holes,h-base,base,'#d1cbb7');
 for(let f=0;f<floors;f++){
  const y=base+f*step,windowY=y+step*.52,windowH=Math.min(2.4,step*.65);
  for(const side of [-1,1]){
   for(let j=0;j<10;j++)mullionedWindow(p,-coreW/2+(j+.5)*coreW/10,windowY,side*(coreD/2+.08),coreW/10*.7,windowH,side,false,glass);
   for(let j=0;j<3;j++)mullionedWindow(p,side*(coreW/2+.08),windowY,-coreD/2+(j+.5)*coreD/3,coreD/3*.65,windowH,side,true,glass);
  }
  courtyardMass(p,coreW+5,coreD+5,holes,.45,y,light);
  for(const side of [-1,1]){
   rail(p,[-coreW/2-2.35,y+.25,side*(coreD/2+2.35)],[coreW/2+2.35,y+.25,side*(coreD/2+2.35)],1.05);
   rail(p,[side*(coreW/2+2.35),y+.25,-coreD/2-2.35],[side*(coreW/2+2.35),y+.25,coreD/2+2.35],1.05);
  }
  // Small shrubs are rooted in balcony planters, below the next storey's slab.
  if(f===3||f===4)for(const x of [-coreW*.32,coreW*.28]){
   const z=coreD/2+1.3;p.box(2,.55,.85,x,y+.52,z,'#adae95');
   const shrub=new T.IcosahedronGeometry(.7,0);shrub.scale(1.2,.8,.58);p.add(shrub,'#76946a',[x,y+1.1,z]);
  }
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
 const meeting=buildings.find(v=>v.id==='b-conference')!;
 const [meetingX,meetingZ]=toWorld(meeting.position),[,officeZ]=toWorld(b.position);
 // The satellite/entrance photo shows only the western half of the meeting
 // centre under the tall lattice. Its eastern half projects beyond the edge.
 const extension=(b.id==='b-admin'?meetingX:engineeringWest)-worldX;
 const frontRow=b.id==='b-admin'?Math.max(d*.62,meetingZ-officeZ+meeting.depth/2+2.5):d*.62;
 lattice(p,-w/2-1,extension,-d*.63,frontRow+.3,h+5.8,holes[0]);
 const supports=(b.id==='b-admin'?[w/2+14,extension-13,extension]:[310-worldX,352-worldX,374-worldX,engineeringWest-worldX]).filter(x=>Math.abs(toWorld(b.position)[0]+x-335)>10);
 for(const x of supports)for(const z of [-d*.62,frontRow]){
  column(p,x,z,h+5.1);
  p.beam([x,h+4.3,z],[x-5,h+5.5,z],.27,metal);
 }
 if(b.id==='b-admin'){
  // A forward roof strip continues to the right lawn edge, clear of the
  // neighbouring engineering block behind it. Tall columns remain on land.
  const front=Math.max(29,frontRow+1),west=350-worldX,east=extension;
  lattice(p,west,east,frontRow+.3,front,h+5.8);
  for(const x of [350,364,378,392,406,413,meetingX]){
   column(p,x-worldX,front-.4,h+5.1);
   p.beam([x-worldX,h+4.3,front-.4],[x-worldX-4,h+5.5,front-.4],.27,metal);
  }
 }
 if(b.id==='b-admin'){
  // Forecourt: three stair runs with level landings beside the clipped terraces.
  // Only the east side of the north-south entrance drive is the stair garden.
  // Keep the western office wing over water and the drive free of stair flights.
  const left=80,right=168,back=d*.64,front=76;
  p.box(right-left,.38,front-back,(left+right)/2,.23,(front+back)/2,'#cfcbbd');
  const flights=[{x:85,w:10},{x:110,w:10},{x:135,w:10},{x:160,w:10}];
  for(const flight of flights){
   let z=front-1,y=.55;const rise=(3.8-.55)/18;
   for(let run=0;run<3;run++){
    const z0=z,y0=y;
    for(let i=0;i<6;i++){y+=rise;p.box(flight.w,y-.42,1.81,flight.x,(y+.42)/2,z-.9,light);z-=1.8;}
    for(const side of [-1,1])rail(p,[flight.x+side*flight.w/2,y0+.08,z0],[flight.x+side*flight.w/2,y+.08,z]);
    if(run<2){p.box(flight.w,y-.42,3.6,flight.x,(y+.42)/2,z-1.8,light);for(const side of [-1,1])rail(p,[flight.x+side*flight.w/2,y+.08,z],[flight.x+side*flight.w/2,y+.08,z-3.6]);z-=3.6;}
   }
  }
  makeEntranceGardens(p);
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
  makeEntranceFlags(p);
  inscriptionRock(p,147.5,front-1);
 }
}

function inscriptionRock(p:Parts,x:number,z:number){
 const outline=new T.Shape();outline.moveTo(-3.5,0);outline.quadraticCurveTo(-5,1.4,-4.3,4.5);outline.quadraticCurveTo(-3.4,8,-2.4,11);outline.quadraticCurveTo(-1.7,14.1,-.7,16.8);outline.quadraticCurveTo(.2,15.9,1.3,13.8);outline.quadraticCurveTo(2,11.8,2.5,10.3);outline.quadraticCurveTo(4.5,7,4.9,4.5);outline.quadraticCurveTo(5.3,1.4,3.1,0);outline.closePath();
 const rock=new T.ExtrudeGeometry(outline,{depth:2.8,bevelEnabled:true,bevelThickness:.5,bevelSize:.45,bevelSegments:3,curveSegments:9,steps:1});p.add(rock,'#b69876',[x,.7,z-1.4]);
 [...'广东工业大学'].forEach((char,index)=>{
  const path=new T.ShapePath();const commands=inscription.glyphs[char as keyof typeof inscription.glyphs];
  for(const [op,...a] of commands){const n=a as number[];if(op==='M')path.moveTo(n[0],n[1]);else if(op==='L')path.lineTo(n[0],n[1]);else if(op==='Q')path.quadraticCurveTo(n[0],n[1],n[2],n[3]);else if(op==='C')path.bezierCurveTo(n[0],n[1],n[2],n[3],n[4],n[5]);else if(op==='Z')path.currentPath?.closePath();}
  const g=new T.ShapeGeometry(path.toShapes(false));g.scale(1.7/inscription.em,1.7/inscription.em,1);p.add(g,'#b83e32',[x-.82,13.9-index*1.9,z+1.93]);
 });
}

export function makeSouthGate(b:Building,p:Parts){
 // The named gate remains a stable entrance point; the high roof belongs to
 // the adjacent administrative ensemble, not an invented freestanding gate.
 for(const x of [-8,-6,6,8])p.cylinder(.27,1.25,x,.7,b.depth*.32,stone,.27,8);
 const admin=buildings.find(x=>x.id==='b-admin')!,[x,z]=localPosition(b,admin);
 p.box(3.7,.25,1.7,x+147.5,.5,z+75,'#b6b19f');
}

