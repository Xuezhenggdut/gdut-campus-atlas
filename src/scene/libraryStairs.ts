import * as T from 'three';
import {Parts} from './geometry';
import {openRail} from './facadeDetails';

/** Thin stepped flights and column-supported upper landings. The reference
 * shows open space beneath the stairs, not a retaining wall or filled mound. */
export function libraryStairs(p:Parts,w:number,d:number,side:number,centers:number[],span:number){
 const angle=side*Math.PI/2,dep=(side%2?w:d)/2;
 const point=(u:number,y:number,v:number):[number,number,number]=>[Math.cos(angle)*u+Math.sin(angle)*v,y,-Math.sin(angle)*u+Math.cos(angle)*v];
 const front=dep+17.8,back=dep+2.2,low=.7,high=8.5,n=24,tread=(front-back)/n,rise=(high-low)/n;
 const door=side%2?w*.38:d*.36;
 for(const center of centers){
  const shape=new T.Shape();shape.moveTo(front,low);
  for(let i=0;i<n;i++){const v=front-i*tread,y=low+(i+1)*rise;shape.lineTo(v,y);shape.lineTo(v-tread,y);}
  shape.lineTo(back,high-.32);shape.lineTo(front,low-.32);shape.closePath();
  const flight=new T.ExtrudeGeometry(shape,{depth:span,bevelEnabled:false}),a=flight.getAttribute('position');
  for(let i=0;i<a.count;i++)a.setXYZ(i,...point(center+span/2-a.getZ(i),a.getY(i),a.getX(i)));
  flight.computeVertexNormals();p.add(flight,'#d4d2c6');
  p.box(span,.35,back-door,...point(center,high-.175,(back+door)/2),'#d4d2c6',angle);
  // A pair of slender supports beneath each landing and at mid-flight.
  for(const v of [dep+.9,dep+9.35]){
   const underside=v<back?high-.35:low+(front-v)*(high-low)/(front-back)-.32;
   for(const sign of [-1,1])p.box(.42,underside-1.1,.42,...point(center+sign*span*.38,(underside+1.1)/2,v),'#e4e2d9');
  }
  for(const offset of side===1?[-.47,0,.47]:[-.47,.47]){
   const u=center+offset*span;
   openRail(p,point(u,low,front),point(u,high,back),'#eeeee4');
   openRail(p,point(u,high,back),point(u,high,door),'#eeeee4');
  }
 }
}
