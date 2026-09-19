import * as T from 'three';
import {Parts} from './geometry';
export type CourtOpening={x:number;z:number;width:number;depth:number};
/** The same opening continues through walls, slabs and roof: no painted voids. */
export function courtyardMass(p:Parts,w:number,d:number,holes:CourtOpening[],height:number,y:number,color:string){
 const shape=new T.Shape();shape.moveTo(-w/2,-d/2);shape.lineTo(w/2,-d/2);shape.lineTo(w/2,d/2);shape.lineTo(-w/2,d/2);shape.closePath();
 for(const h of holes){const q=new T.Path(),x=h.x,z=-h.z,a=h.width/2,b=h.depth/2;q.moveTo(x-a,z-b);q.lineTo(x-a,z+b);q.lineTo(x+a,z+b);q.lineTo(x+a,z-b);q.closePath();shape.holes.push(q);}
 const g=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);p.add(g,color,[0,y,0]);
}
