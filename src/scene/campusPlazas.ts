import * as T from 'three';
import {Parts,pathMesh} from './geometry';
import type {Building} from '../data/campus';
import inscription from '../data/valley-inscription.json';
export function campusPlaza(b:Building,p:Parts,group:T.Group){
 const w=b.width,d=b.depth;
 if(b.id==='b-innovation-stone'){
  const curb=new T.CylinderGeometry(1,1,.22,48);curb.scale(w*.5,1,d*.5);p.add(curb,'#c4b7a0',[0,.04,0]);
  const base=new T.CylinderGeometry(1,1,.16,48);base.scale(w*.48,1,d*.46);p.add(base,'#85955f',[0,.20,0]);
  const rw=w*.44,shape=new T.Shape();shape.moveTo(-rw*.48,.1);shape.quadraticCurveTo(-rw*.57,1.6,-rw*.42,2.7);shape.bezierCurveTo(-rw*.28,3.9,rw*.12,4.1,rw*.34,3.5);shape.quadraticCurveTo(rw*.52,2.6,rw*.5,.4);shape.lineTo(rw*.34,0);shape.lineTo(-rw*.35,0);shape.closePath();
  const rock=new T.ExtrudeGeometry(shape,{depth:1.8,bevelEnabled:true,bevelThickness:.22,bevelSize:.25,bevelSegments:2,curveSegments:10});rock.scale(1,.7,1);p.add(rock,'#c9ad77',[0,.28,-.9]);
  [...'工大创谷'].forEach((ch,i)=>{
   const path=new T.ShapePath();for(const [op,...args] of inscription.glyphs[ch as keyof typeof inscription.glyphs]){const a=args as number[];if(op==='M')path.moveTo(a[0],a[1]);if(op==='L')path.lineTo(a[0],a[1]);if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);if(op==='Z')path.currentPath?.closePath();}
   const g=new T.ShapeGeometry(path.toShapes(false));g.scale(1.55/inscription.em,1.55/inscription.em,1);p.add(g,'#bd4439',[-3.3+i*1.72,1.05,1.14]);
  });
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2,x=Math.cos(a)*w*.43,z=Math.sin(a)*d*.38;const shrub=new T.IcosahedronGeometry(.58,0);shrub.scale(1.1,.65,.8);p.add(shrub,i%3?'#8d9c65':'#a7ad73',[x,.57,z]);}
  return;
 }
 p.box(w,.4,d,0,.4,0,'#d9d4c4');
 if(b.id==='b-diligence-square'){
  // Lines lie on the paving; no raised cylinder or monument exists here.
  for(let i=1;i<=6;i++){
   const radius=(2+i*2)*Math.min(1,w/32),points:[number,number][]=[];let run:[number,number][]=[];
   for(let j=0;j<=160;j++){
    const a=j*Math.PI*2/160,x=Math.cos(a)*radius,z=-d*.15+Math.sin(a)*radius;
    if(Math.abs(x)<w/2-.8&&Math.abs(z)<d/2-.8)run.push([x,z]);else if(run.length){if(run.length>1)group.add(pathMesh(run,.34,'#a9a394',.64));run=[];}
   }points.push(...run);if(points.length>1)group.add(pathMesh(points,.34,'#a9a394',.64));
  }
 }else for(let i=-2;i<=2;i++)p.box(w,.1,.4,0,.65,i*d/5,'#bebdaa');
}
