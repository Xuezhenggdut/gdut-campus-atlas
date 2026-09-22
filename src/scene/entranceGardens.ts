import * as T from 'three';
import {Parts} from './geometry';
import inscription from '../data/garden-inscription.json';
import emblem from '../data/garden-emblem.json';

// The new entrance photo corrects the former ramp: three box-shaped planting
// terraces with flat tops and vertical risers. Dimensions remain schematic.
const terraces=[{front:74,back:61.3,y:1.6,color:'#758f49'},{front:61.3,back:48.6,y:2.7,color:'#665446'},{front:48.6,back:36,y:3.8,color:'#9ba94f'}];
export const gardenHeight=(z:number)=>terraces.find(t=>z>=t.back)?.y??3.8;
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
  for(const tier of terraces){
   const depth=tier.front-tier.back,z=(tier.front+tier.back)/2;
   p.box(11,tier.y-.35,depth,x,(tier.y+.35)/2,z,tier.color);
   p.box(11.2,.22,depth,x,.46,z,'#b8ae8f');
  }
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
  plantedShape(p,path.toShapes(false),117.55+i*1.68,70.5,1.5/inscription.em,4.5/inscription.em);
 });
 // Trace the existing official emblem asset, preserving its negative spaces.
 const shapes=emblem.shapes.map(({outer,holes})=>{
  const shape=new T.Shape(outer.map(([x,y])=>new T.Vector2(x-emblem.size/2,emblem.size/2-y)));
  shape.holes=holes.map(points=>new T.Path(points.map(([x,y])=>new T.Vector2(x-emblem.size/2,emblem.size/2-y))));
  return shape;
 });
 plantedShape(p,shapes,97.5,67.6,8/emblem.size,8/emblem.size);
}
