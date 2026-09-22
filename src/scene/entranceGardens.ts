import * as T from 'three';
import {Parts} from './geometry';
import inscription from '../data/garden-inscription.json';
import emblem from '../data/garden-emblem.json';

// The planting slopes toward the lower square; all lettering follows its
// surface rather than standing vertically as a sign. Dimensions are schematic.
export const gardenHeight=(z:number)=>.72+(74-z)*(5-.72)/38;
const hedge='#496436';
function plantedShape(p:Parts,shapes:T.Shape[],cx:number,cz:number,sx:number,sz:number){
 const g=new T.ExtrudeGeometry(shapes,{depth:.22,bevelEnabled:false,curveSegments:4});
 const a=g.getAttribute('position');
 for(let i=0;i<a.count;i++){
  const x=cx+a.getX(i)*sx,z=cz-a.getY(i)*sz,h=a.getZ(i);
  a.setXYZ(i,x,gardenHeight(z)+.035+h,z);
 }
 g.computeVertexNormals();p.add(g,hedge);
}
export function makeEntranceGardens(p:Parts){
 for(const x of [97.5,122.5,147.5]){
  const section=new T.Shape();section.moveTo(36,.35);section.lineTo(74,.35);
  section.lineTo(74,gardenHeight(74));section.lineTo(36,gardenHeight(36));section.closePath();
  const g=new T.ExtrudeGeometry(section,{depth:11,bevelEnabled:false});
  const a=g.getAttribute('position');for(let i=0;i<a.count;i++){
   const z=a.getX(i),y=a.getY(i),u=a.getZ(i);a.setXYZ(i,x+5.5-u,y,z);
  }g.computeVertexNormals();p.add(g,'#85924f');
 }
 // User clarification: the six characters belong to the MIDDLE lawn.
 [...'广东工业大学'].forEach((char,i)=>{
  const path=new T.ShapePath();
  for(const [op,...args] of inscription.glyphs[char as keyof typeof inscription.glyphs]){
   const a=args as number[];
   if(op==='M')path.moveTo(a[0],a[1]);else if(op==='L')path.lineTo(a[0],a[1]);
   else if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);
   else if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);
   else if(op==='Z')path.currentPath?.closePath();
  }
  plantedShape(p,path.toShapes(false),117.55+i*1.68,63,1.5/inscription.em,4.5/inscription.em);
 });
 // Trace the existing official emblem asset, preserving its negative spaces.
 const shapes=emblem.shapes.map(({outer,holes})=>{
  const shape=new T.Shape(outer.map(([x,y])=>new T.Vector2(x-emblem.size/2,emblem.size/2-y)));
  shape.holes=holes.map(points=>new T.Path(points.map(([x,y])=>new T.Vector2(x-emblem.size/2,emblem.size/2-y))));
  return shape;
 });
 plantedShape(p,shapes,97.5,58.5,8/emblem.size,14/emblem.size);
}
