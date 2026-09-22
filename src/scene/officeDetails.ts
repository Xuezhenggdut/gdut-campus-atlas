import * as T from 'three';
import {Parts} from './geometry';
import {openRail} from './facadeDetails';
import glyphs from '../data/office-inscription.json';

const white='#ebe7dc',stone='#c4bbaa';
export function officeFlowerBox(p:Parts,x:number,y:number,z:number,width:number,flower:boolean){
 p.box(width,.42,.66,x,y+.21,z,'#aaa58e');
 for(let i=0;i<Math.ceil(width/.85);i++){
  const xx=x-width/2+(i+.5)*width/Math.ceil(width/.85);
  const bush=new T.IcosahedronGeometry(.44,0);bush.scale(1.15,.65,.65);p.add(bush,'#688461',[xx,y+.51,z]);
  if(flower&&i%3!==1){const bloom=new T.IcosahedronGeometry(.22,0);bloom.scale(1.3,.65,.75);p.add(bloom,i%2?'#a55279':'#bb6887',[xx,y+.70,z+.12]);}
 }
}
export function officeSign(p:Parts,x:number,y:number,z:number){
 [...'行政楼'].forEach((ch,i)=>{
  const path=new T.ShapePath();for(const [op,...args] of glyphs.glyphs[ch as keyof typeof glyphs.glyphs]){const a=args as number[];if(op==='M')path.moveTo(a[0],a[1]);else if(op==='L')path.lineTo(a[0],a[1]);else if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);else if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);else if(op==='Z')path.currentPath?.closePath();}
  const g=new T.ExtrudeGeometry(path.toShapes(false),{depth:glyphs.em*.04,bevelEnabled:false});g.scale(.7/glyphs.em,.7/glyphs.em,.7/glyphs.em);g.computeBoundingBox();const bounds=g.boundingBox!;
  p.add(g,'#398ca5',[x+i*1.15-(bounds.min.x+bounds.max.x)/2,y-bounds.min.y,z]);
 });
}
export function officePlatformStair(p:Parts,coreW:number,coreD:number,upper:number){
 const x1=coreW/2+2.35,x0=x1+12.3,z=coreD*.15,width=6.2,low=3.8,n=19;
 for(let i=0;i<n;i++)p.box((x0-x1)/n+.035,.24,width,x0-(i+.5)*(x0-x1)/n,low+(i+1)*(upper-low)/n-.12,z,white);
 p.box(2.3,.35,width,x1-.8,upper-.175,z,white);
 for(const side of [-1,1]){
  p.beam([x0,low-.2,z+side*width*.36],[x1,upper-.3,z+side*width*.36],.30,stone);
  openRail(p,[x0,low,z+side*width/2],[x1,upper,z+side*width/2],white,4);
  openRail(p,[x1,upper,z+side*width/2],[x1-1.95,upper,z+side*width/2],white,4);
 }
 openRail(p,[x0,low,z],[x1,upper,z],white,4);
}
