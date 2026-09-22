import * as T from 'three';
import {Parts} from './geometry';
import glyphs from '../data/culture-motto.json';
import {openRail} from './facadeDetails';

export function makeCultureMottos(p:Parts,w:number,d:number){
 for(const [x,z,text] of [[w*.04,d*.39,'以美育人'],[w*.30,d*.34,'以文化人']] as const){
  const width=w*.16,depth=3.7,front=z+depth/2,back=z-depth/2,low=5.3,high=6.9;
  const s=new T.Shape();s.moveTo(back,5.25);s.lineTo(front,5.25);s.lineTo(front,low);s.lineTo(back,high);s.closePath();
  const g=new T.ExtrudeGeometry(s,{depth:width,bevelEnabled:false}),a=g.getAttribute('position');
  for(let i=0;i<a.count;i++){const zz=a.getX(i),yy=a.getY(i),u=a.getZ(i);a.setXYZ(i,x+width/2-u,yy,zz);}g.computeVertexNormals();p.add(g,'#6f8a58');
  for(const side of [-1,1])openRail(p,[x+side*width/2,low,front],[x+side*width/2,high,back],'#ebece4');
  openRail(p,[x-width/2,high,back],[x+width/2,high,back],'#ebece4');
  [...text].forEach((ch,i)=>{
   const path=new T.ShapePath();for(const [op,...args] of glyphs.glyphs[ch as keyof typeof glyphs.glyphs]){const a=args as number[];if(op==='M')path.moveTo(a[0],a[1]);else if(op==='L')path.lineTo(a[0],a[1]);else if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);else if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);else if(op==='Z')path.currentPath?.closePath();}
   const letter=new T.ExtrudeGeometry(path.toShapes(false),{depth:glyphs.em*.05,bevelEnabled:false,curveSegments:4});letter.scale(1.6/glyphs.em,1.6/glyphs.em,1.6/glyphs.em);letter.rotateX(-Math.atan(depth/(high-low)));
   letter.computeBoundingBox();const bounds=letter.boundingBox!;
   p.add(letter,'#f5f5ef',[x+(i-1.5)*1.95-(bounds.min.x+bounds.max.x)/2,low+.13-bounds.min.y,front-.25]);
  });
 }
}
