import {Parts} from './geometry';
import * as T from 'three';
import motto from '../data/valley-motto.json';
import {openRail} from './facadeDetails';
import {teachingPlanPoint} from '../data/teachingPlan';
import {teachingFloorHeight} from '../data/teachingLevels';
import type {Building} from '../data/campus';
import type {CourtOpening} from './courtyard';

export const valleyPortal={center:teachingPlanPoint([248,454]),width:28,depth:27};
export function teachingEntranceCut(b:Building):CourtOpening|undefined{
 if(!['b-teaching-5','b-teaching-6','b-teaching-3','b-teaching-4'].includes(b.id))return;
 // User's courtyard-to-library photograph supersedes the shallow entrance notch.
 // Both rows flank one broad, open-air north/south space, not a sealed central wing.
 return {x:(['b-teaching-5','b-teaching-6'].includes(b.id)?1:-1)*b.width/2,z:0,width:valleyPortal.width,depth:b.depth+2};
}
/** Union of rectangular courtyards and open facade notches. Keeping a cell only
 * when it is outside every opening avoids invalid overlapping Shape holes. */
export function cutTeachingMass(p:Parts,w:number,d:number,holes:CourtOpening[],h:number,y:number,color:string){
 const xs=[...new Set([-w/2,w/2,...holes.flatMap(c=>[Math.max(-w/2,Math.min(w/2,c.x-c.width/2)),Math.max(-w/2,Math.min(w/2,c.x+c.width/2))])])].sort((a,b)=>a-b);
 const zs=[...new Set([-d/2,d/2,...holes.flatMap(c=>[Math.max(-d/2,Math.min(d/2,c.z-c.depth/2)),Math.max(-d/2,Math.min(d/2,c.z+c.depth/2))])])].sort((a,b)=>a-b);
 for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){
  const x=(xs[i-1]+xs[i])/2,z=(zs[j-1]+zs[j])/2;
  if(holes.some(c=>Math.abs(x-c.x)<c.width/2&&Math.abs(z-c.z)<c.depth/2))continue;
  p.box(xs[i]-xs[i-1],h,zs[j]-zs[j-1],x,y+h/2,z,color);
 }
}

export function makeValleyPortal(p:Parts){
 const [x,front]=valleyPortal.center,back=front-valleyPortal.depth,cream='#ded7bd',green='#748b71',rail='#4e746b',roof=3*teachingFloorHeight+1,bridge=11.5;
 // The photographed bridge and roof frame cross an open entrance, rather
 // than an occupied classroom wall. All elevations include model ground +1.
 p.box(28,.65,3,x,bridge,front-1.5,green);
 // The lettering sits on the front fascia; local font outlines approximate
 // the photo's wording without treating a texture as structural geometry.
 for(const [text,left] of [['匠心铸魂',-8],['创新立业',3.8]] as const)[...text].forEach((char,i)=>{
  const path=new T.ShapePath();for(const [op,...args] of motto.glyphs[char as keyof typeof motto.glyphs]){const a=args as number[];if(op==='M')path.moveTo(a[0],a[1]);else if(op==='L')path.lineTo(a[0],a[1]);else if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);else if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);else if(op==='Z')path.currentPath?.closePath();}
  const g=new T.ShapeGeometry(path.toShapes(false));g.scale(.59/motto.em,.59/motto.em,1);p.add(g,'#a4523b',[x+left+i*1.25,bridge-.2,front+.015]);
 });
 for(const z of [front-.08,front-2.95])openRail(p,[x-14,bridge+.34,z],[x+14,bridge+.34,z],rail);
 for(const z of [front,back]){p.box(29,.8,.65,x,roof,z,green);openRail(p,[x-14.5,roof+.4,z],[x+14.5,roof+.4,z],rail);}
 for(const dx of [-14,-4.5,4.5,14])p.box(.65,.65,front-back,x+dx,roof,(front+back)/2,green);
 for(const dx of [-13,-4.5,4.5,13])for(const z of [front-2.7,back+1.2])p.cylinder(.48,roof-1,x+dx,(roof+1)/2,z,cream,.48,12);
 // Two short flights lead to side landings; the central ground passage stays open.
 for(const side of [-1,1]){
  const sx=x+side*10;
  for(let i=0;i<15;i++)p.box(5,.24,.65,sx,1+(i+1)*5.25/15,front+1.5-(i+.5)*.62,cream);
  for(const dx of [-2.5,2.5])openRail(p,[sx+dx,1,front+1.5],[sx+dx,6.25,front-7.8],rail);
  p.box(5,.35,3,sx,6.1,front-9.3,green);
 }
}
