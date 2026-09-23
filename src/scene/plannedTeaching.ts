import * as T from 'three';
import {toWorld,type Building} from '../data/campus';
import {teachingLinkSpans} from './teachingLinks';
import {teachingFloorHeight} from '../data/teachingLevels';
import {teachingCourts} from '../data/teachingPlan';
import signs from '../data/teaching-signs.json';
import {cutTeachingMass,teachingEntranceCut} from './teachingEntrance';
import {Parts} from './geometry';
import {doglegStair,mullionedWindow,openRail} from './facadeDetails';
const cream='#ded7bd',green='#748b71',rail='#4e746b';
export function teachingStairBay(b:Building){return {x:(['b-teaching-5','b-teaching-6'].includes(b.id)?-1:1)*(b.width/2-4.1),z:b.depth/2-5.1,width:8.2,depth:10.2};}
function roofSign(p:Parts,text:string,x:number,y:number,z:number){
 [...text].forEach((char,i)=>{
  const path=new T.ShapePath(),commands=signs.glyphs[char as keyof typeof signs.glyphs];
  for(const [op,...a] of commands){const n=a as number[];if(op==='M')path.moveTo(n[0],n[1]);else if(op==='L')path.lineTo(n[0],n[1]);else if(op==='Q')path.quadraticCurveTo(n[0],n[1],n[2],n[3]);else if(op==='C')path.bezierCurveTo(n[0],n[1],n[2],n[3],n[4],n[5]);else if(op==='Z')path.currentPath?.closePath();}
  const g=new T.ExtrudeGeometry(path.toShapes(false),{depth:40,bevelEnabled:false});g.scale(2.1/signs.em,2.1/signs.em,2.1/signs.em);p.add(g,'#d7be64',[x+i*2.15,y,z]);
 });
}
export function plannedTeaching(b:Building,p:Parts){
 const {width:w,depth:d,height:h,floors}=b,holes=teachingCourts(b.id),step=h/floors;
 const bay=teachingStairBay(b),stair=['b-teaching-1','b-teaching-5'].includes(b.id),cw=w-3.6,cd=d-3.6;
 const entry=teachingEntranceCut(b),stairHole={...bay,width:bay.width+.1,depth:bay.depth+.1};
 const cuts=[...holes,...(entry?[entry]:[])];
 const galleryDepth=3.2;
 const massCuts=[...holes,...(entry?[{...entry,width:entry.width+galleryDepth*2}]:[])];
 cutTeachingMass(p,cw,cd,[...massCuts,...(stair?[stairHole]:[])],h,0,cream);
 const inEntry=(x:number,z:number,margin=0)=>!!entry&&Math.abs(x-entry.x)<entry.width/2+margin&&z>entry.z-entry.depth/2-margin;
 const [worldX,worldZ]=toWorld(b.position),links=teachingLinkSpans();
 const teachingRail=(parts:Parts,a:[number,number,number],q:[number,number,number],color:string)=>{
  const thickness=a[1]>=h?.14:.1;
  // Leave walk-through openings where the connecting decks meet the gallery.
  if(a[2]===q[2]&&a[0]<q[0]&&Math.abs(Math.abs(a[2])-d/2)<.01&&a[1]<=3*teachingFloorHeight+.24){
   const gaps=links.filter(v=>Math.min(Math.abs(v.z0-worldZ-a[2]),Math.abs(v.z1-worldZ-a[2]))<1).map(v=>{const half=a[1]<teachingFloorHeight+.24?v.lowerWidth/2:1.85;return [v.x-worldX-half,v.x-worldX+half];}).sort((a,b)=>a[0]-b[0]);
   let start=a[0];for(const [lo,hi] of gaps){if(hi<=start||lo>=q[0])continue;if(lo>start)openRail(parts,[start,a[1],a[2]],[lo,a[1],a[2]],color,4,thickness);start=Math.max(start,hi);}
   if(start<q[0])openRail(parts,[start,a[1],a[2]],q,color,4,thickness);return;
  }
  openRail(parts,a,q,color,4,thickness);
 };
 const frontRail=(y:number,z:number)=>{
  if(!entry){teachingRail(p,[-w/2,y,z],[w/2,y,z],rail);return;}
  if(entry.x>0)teachingRail(p,[-w/2,y,z],[entry.x-entry.width/2,y,z],rail);
  else teachingRail(p,[entry.x+entry.width/2,y,z],[w/2,y,z],rail);
 };
 for(let f=0;f<=floors;f++){
  const y=f*step,openings=[...cuts,...(stair?[stairHole]:[])];
  cutTeachingMass(p,w+.6,d+.6,openings,.4,y,f===floors?'#d8d8bd':green);

  for(const side of [-1,1]){
   if(f>0){frontRail(y+.23,side*d/2);if(!entry||Math.sign(entry.x)!==side)teachingRail(p,[side*w/2,y+.23,-d/2],[side*w/2,y+.23,d/2],rail);}
   if(f===floors)continue;
   const nx=Math.max(5,Math.round(cw/5.6)),nz=Math.max(3,Math.round(cd/5.6));
   for(let j=0;j<nx;j++){const x=-cw/2+(j+.5)*cw/nx;if((side===1&&stair&&Math.abs(x-bay.x)<bay.width/2+2)||inEntry(x,side*d/2,2))continue;mullionedWindow(p,x,y+step*.54,side*(cd/2+.08),cw/nx*.72,Math.min(2.5,step*.6),side);}
   for(let j=0;j<nz;j++){const z=-cd/2+(j+.5)*cd/nz;if((stair&&side===Math.sign(bay.x)&&z>bay.z-bay.depth/2-2)||inEntry(side*w/2,z,2))continue;mullionedWindow(p,side*(cw/2+.08),y+step*.54,z,cd/nz*.7,Math.min(2.5,step*.6),side,true);}
   for(const c of holes){
    if(entry&&Math.abs(c.x-entry.x)<(c.width+entry.width)/2)continue;
    p.box(c.width*.8,step*.48,.12,c.x,y+step*.55,c.z+side*(c.depth/2+.04),'#74959a');
    if(f>0)teachingRail(p,[c.x-c.width/2,y+.2,c.z+side*c.depth/2],[c.x+c.width/2,y+.2,c.z+side*c.depth/2],rail);
   }
  }
 }
 // Recess the classroom wall behind a real gallery slab, square columns and
 // horizontal open rails facing the courtyard. No facade crosses the void.
 if(entry){
  const side=Math.sign(entry.x),edge=entry.x-side*entry.width/2,wall=edge-side*galleryDepth;
  const nz=Math.max(4,Math.ceil(d/6));
  for(let j=0;j<=nz;j++)p.box(.55,h,.55,edge-side*.28,h/2,-d/2+j*d/nz,cream);
  for(let f=0;f<=floors;f++){
   const y=f*step;
   if(f>0)teachingRail(p,[edge,y+.23,-d/2],[edge,y+.23,d/2],rail);
   if(f===floors)continue;
   for(let j=0;j<nz;j++)mullionedWindow(p,wall+side*.08,y+step*.54,-d/2+(j+.5)*d/nz,d/nz*.68,Math.min(2.5,step*.6),side,true);
  }
 }
 for(const c of holes){p.box(c.width,.16,c.depth,c.x,.08,c.z,'#b5c5ad');if(entry&&Math.abs(c.x-entry.x)<(c.width+entry.width)/2)continue;for(const side of [-1,1]){teachingRail(p,[c.x-c.width/2,h+.23,c.z+side*c.depth/2],[c.x+c.width/2,h+.23,c.z+side*c.depth/2],rail);teachingRail(p,[c.x+side*c.width/2,h+.23,c.z-c.depth/2],[c.x+side*c.width/2,h+.23,c.z+c.depth/2],rail);}}
 const nx=Math.max(6,Math.ceil(w/6));for(let j=0;j<=nx;j++)for(const side of [-1,1]){const x=-w/2+j*w/nx;if(!inEntry(x,side*d/2))p.box(.65,h,.65,x,h/2,side*(d/2-.4),cream);}
 for(let j=1;j<Math.ceil(d/6);j++)for(const side of [-1,1]){const z=-d/2+j*d/Math.ceil(d/6);if(!inEntry(side*w/2,z))p.box(.65,h,.65,side*(w/2-.4),h/2,z,cream);}
 if(stair){
  doglegStair(p,bay.x,bay.z,bay.width-1.1,6.8,0,step,floors,green,rail);
 }
 // Raised stair-head canopy and horizontal rails are visible on all six roofs.
 for(const dx of [-1,1])for(const dz of [-1,1])p.box(.75,stair?h+3:2.9,.75,bay.x+dx*(bay.width/2-.45),stair?(h+3)/2:h+1.75,bay.z+dz*(bay.depth/2-.45),cream);
 p.box(bay.width+.4,.4,bay.depth+.4,bay.x,h+3.2,bay.z,green);
 for(const side of [-1,1]){
  teachingRail(p,[bay.x-bay.width/2,h+3.4,bay.z+side*bay.depth/2],[bay.x+bay.width/2,h+3.4,bay.z+side*bay.depth/2],rail);
  teachingRail(p,[bay.x+side*bay.width/2,h+3.4,bay.z-bay.depth/2],[bay.x+side*bay.width/2,h+3.4,bay.z+bay.depth/2],rail);
 }
 roofSign(p,'教'+b.id.slice(-1),bay.x-2,h+2.6,d/2+.35);
}
