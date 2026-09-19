import * as T from 'three';
import {Parts,pathMesh} from './geometry';
import type {Building} from '../data/campus';
import inscription from '../data/valley-inscription.json';
export function campusPlaza(b:Building,p:Parts,group:T.Group){
 const w=b.width,d=b.depth;
 if(b.id==='b-innovation-stone'){
  const base=new T.CylinderGeometry(1,1,.35,48);base.scale(w*.6,1,d*.65);p.add(base,'#85955f',[0,.3,0]);
  const shape=new T.Shape();shape.moveTo(-w*.5,0);shape.lineTo(-w*.47,3);shape.lineTo(-w*.36,7.6);shape.lineTo(-w*.19,8);shape.lineTo(w*.24,5.7);shape.lineTo(w*.48,2.7);shape.lineTo(w*.48,.8);shape.lineTo(w*.36,0);shape.closePath();
  p.add(new T.ExtrudeGeometry(shape,{depth:3,bevelEnabled:true,bevelThickness:.5,bevelSize:.6,bevelSegments:1}),'#b49865',[0,.5,-1.5]);
  [...'工大创谷'].forEach((ch,i)=>{
   const path=new T.ShapePath();for(const [op,...args] of inscription.glyphs[ch as keyof typeof inscription.glyphs]){const a=args as number[];if(op==='M')path.moveTo(a[0],a[1]);if(op==='L')path.lineTo(a[0],a[1]);if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);if(op==='Z')path.currentPath?.closePath();}
   const g=new T.ShapeGeometry(path.toShapes(false));g.scale(3.6/inscription.em,3.6/inscription.em,1);p.add(g,'#715635',[-8+i*4.2,2.5,2.03]);
  });return;
 }
 p.box(w,.4,d,0,.4,0,'#d9d4c4');
 if(b.id==='b-diligence-square'){
  // Lines lie on the paving; no raised cylinder or monument exists here.
  for(let i=1;i<=6;i++){
   const radius=5+i*6,points:[number,number][]=[];let run:[number,number][]=[];
   for(let j=0;j<=160;j++){
    const a=j*Math.PI*2/160,x=Math.cos(a)*radius,z=-d*.2+Math.sin(a)*radius;
    if(Math.abs(x)<w/2-.8&&Math.abs(z)<d/2-.8)run.push([x,z]);else if(run.length){if(run.length>1)group.add(pathMesh(run,.34,'#a9a394',.64));run=[];}
   }points.push(...run);if(points.length>1)group.add(pathMesh(points,.34,'#a9a394',.64));
  }
 }else for(let i=-2;i<=2;i++)p.box(w,.1,.4,0,.65,i*d/5,'#bebdaa');
}
