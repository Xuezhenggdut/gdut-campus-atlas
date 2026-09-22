import * as T from 'three';
import {Parts} from './geometry';
import {openRail} from './facadeDetails';

export const gymPlatformY=10.1;
const white='#ebece4',cream='#d2d1c5';

/** Both overlapping upper slabs must share the stair openings. */
export function gymUpperSlab(p:Parts,w:number,d:number,x0:number,x1:number,z0:number,z1:number,thickness:number){
 let rects=[{x0,x1,z0,z1}];
 for(const x of [w*.19,w*.72]){
  rects=rects.flatMap(r=>{
   const a=Math.max(r.x0,x),b=Math.min(r.x1,x+6),c=Math.max(r.z0,d*.235-1.65),e=Math.min(r.z1,d*.235+1.65);
   if(a>=b||c>=e)return [r];
   return [{x0:r.x0,x1:a,z0:r.z0,z1:r.z1},{x0:b,x1:r.x1,z0:r.z0,z1:r.z1},{x0:a,x1:b,z0:r.z0,z1:c},{x0:a,x1:b,z0:e,z1:r.z1}].filter(q=>q.x1>q.x0&&q.z1>q.z0);
  });
 }
 for(const r of rects)p.box(r.x1-r.x0,thickness,r.z1-r.z0,(r.x0+r.x1)/2,gymPlatformY-thickness/2,(r.z0+r.z1)/2,white);
}

/** Pool-side photograph: rooms below, an open intermediate gallery, and a
 * broad upper platform. The platform is a slab on columns, not solid fill. */
export function makeGymPlatform(p:Parts,w:number,d:number){
 const x0=-w*.67,x1=w*.81,z0=-d*.685,z1=d*.29+.6,top=gymPlatformY;
 gymUpperSlab(p,w,d,x0,x1,z0,z1,.45);
 for(let x=x0+1;x<x1;x+=10)for(let z=z0+1;z<z1;z+=10)p.box(.48,top-.45,.48,x,(top-.45)/2,z,cream);
 // Recessed circulation galleries leave full-height open bays at the edges.
 for(const x of [x0+2,x1-2]){
  p.box(4,.32,z1-z0,x,6.8,(z0+z1)/2,white);
  openRail(p,[x,6.97,z0],[x,6.97,z1],white);
 }
 p.box(x1-x0,.32,4,(x0+x1)/2,6.8,z0+2,white);
 openRail(p,[x0,6.97,z0],[x1,6.97,z0],white);
 openRail(p,[x0,top,z0],[x1,top,z0],white);
 openRail(p,[x0,top,z0],[x0,top,z1],white);
 openRail(p,[x0,top,z1],[w*.14,top,z1],white);
 // The visible low caps have sloping sides and plinths. Their exact service
 // function is unconfirmed; retain their photographed shape rather than glass dots.
 const colors=['#b3aa87','#99aaa5','#c0b18c'];
 for(let i=0;i<5;i++)for(let j=0;j<4;j++){
  const x=w*.46+i*4.6,z=-d*.4+j*6.2,col=colors[(i+j)%3];
  p.box(2.4,.16,2.4,x,top+.08,z,col);
  p.add(new T.CylinderGeometry(.90,1.40,.8,4),col,[x,top+.56,z],[0,Math.PI/4,0]);
 }
 // A pair of open stair flights connects the pool-side gallery to the roof deck.
 for(const x of [w*.19,w*.72]){
  const z=d*.235,n=12,run=6.0,rise=top-6.96;
  for(let i=0;i<n;i++)p.box(run/n+.02,.23,3.1,x+(i+.5)*run/n,6.96+(i+1)*rise/n-.115,z,white);
  for(const side of [-1,1]){
   p.beam([x,6.8,z+side*1.1],[x+run,top-.23,z+side*1.1],.20,cream);
   openRail(p,[x,6.96,z+side*1.5],[x+run,top,z+side*1.5],white);
   openRail(p,[x,top,z+side*1.7],[x+run,top,z+side*1.7],white);
  }
  openRail(p,[x,top,z-1.7],[x,top,z+1.7],white);
 }
}
