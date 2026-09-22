import * as T from 'three';
import {Parts} from './geometry';
import {openRail} from './facadeDetails';
import {gymUpperSlab} from './gymPlatform';
import glyphs from '../data/culture-motto.json';

const white='#ebece4',tile='#479aaa',line='#225766';
export const poolWaterY=2.78;
export function poolHoles(w:number,d:number){return [w*.30,w*.63].map(x=>({x,z:d*.62,w:w*.23,d:d*.54}));}

/** Cut both intersecting podium slabs, so recessed water is actually visible. */
export function poolDeck(p:Parts,w:number,d:number,sw:number,sd:number,x:number,z:number){
 let rects=[{x0:x-sw/2,x1:x+sw/2,z0:z-sd/2,z1:z+sd/2}];
 for(const hole of poolHoles(w,d)){
  const x0=hole.x-hole.w/2,x1=hole.x+hole.w/2,z0=hole.z-hole.d/2,z1=hole.z+hole.d/2;
  rects=rects.flatMap(r=>{
   const a=Math.max(r.x0,x0),b=Math.min(r.x1,x1),c=Math.max(r.z0,z0),e=Math.min(r.z1,z1);
   if(a>=b||c>=e)return [r];
   return [{x0:r.x0,x1:a,z0:r.z0,z1:r.z1},{x0:b,x1:r.x1,z0:r.z0,z1:r.z1},{x0:a,x1:b,z0:r.z0,z1:c},{x0:a,x1:b,z0:e,z1:r.z1}].filter(q=>q.x1>q.x0&&q.z1>q.z0);
  });
 }
 for(const r of rects)p.box(r.x1-r.x0,.75,r.z1-r.z0,(r.x0+r.x1)/2,3,(r.z0+r.z1)/2,white);
}

function inscription(p:Parts,text:string,x:number,y:number,z:number,facing:1|-1){
 [...text].forEach((ch,i)=>{
  const path=new T.ShapePath();
  for(const [op,...args] of glyphs.glyphs[ch as keyof typeof glyphs.glyphs]){const a=args as number[];if(op==='M')path.moveTo(a[0],a[1]);else if(op==='L')path.lineTo(a[0],a[1]);else if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);else if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);else if(op==='Z')path.currentPath?.closePath();}
  const g=new T.ShapeGeometry(path.toShapes(false));g.scale(.95/glyphs.em,.95/glyphs.em,1);g.computeBoundingBox();const b=g.boundingBox!;
  const xx=x+facing*(i-1.5)*5;
  p.box(1.25,1.25,.08,xx,y+.45,z,'#a25b51');
  p.add(g,white,[xx-facing*(b.min.x+b.max.x)/2,y-b.min.y,z+facing*.05],[0,facing===1?0:Math.PI,0]);
 });
}

export function makePoolDetails(p:Parts,w:number,d:number){
 for(const pool of poolHoles(w,d)){
  const {x,z,w:pw,d:pd}=pool,y=poolWaterY;
  p.box(pw,.1,pd,x,y-.05,z,'#5e9eae');
  for(const side of [-1,1]){
   p.box(.32,1.1,pd+.64,x+side*(pw/2+.16),2.85,z,tile);
   p.box(.65,.15,pd+1.3,x+side*(pw/2+.32),3.45,z,white);
   p.box(pw,.32,.32,x,3.18,z+side*(pd/2+.16),tile);
   p.box(pw+.6,.15,.65,x,3.45,z+side*(pd/2+.32),white);
  }
  // Subtle tile grid, dark lane-bottom markings and T ends remain legible at close range.
  for(let xx=x-pw/2+.6;xx<x+pw/2;xx+=.6)p.box(.015,.012,pd,xx,y+.014,z,'#649fac');
  for(let zz=z-pd/2+.6;zz<z+pd/2;zz+=.6)p.box(pw,.012,.015,x,y+.014,zz,'#649fac');
  for(let lane=0;lane<8;lane++){
   const xx=x-pw/2+(lane+.5)*pw/8;
   p.box(.19,.018,pd-2.4,xx,y+.026,z,line);
   for(const side of [-1,1]){
    p.box(pw/8*.65,.02,.18,xx,y+.027,z+side*(pd/2-1.2),line);
    p.box(.34,.5,.42,xx,3.66,z+side*(pd/2+1.0),white);
    p.box(.8,.15,.76,xx,3.98,z+side*(pd/2+1.0),'#87c5ce');
   }
  }
  for(let lane=1;lane<8;lane++){
   const xx=x-pw/2+lane*pw/8;
   for(let j=0;j<36;j++)p.box(.075,.075,pd/36*.8,xx,y+.1,z-pd/2+(j+.5)*pd/36,j<5||j>30?'#c76765':lane===4?'#d9be58':j%2?'#637dba':'#d0d9cc');
  }
  // Stainless ladders hook over the rim and descend into the basin.
  for(const side of [-1,1]){
   const xx=x+side*(pw/2-.6),zz=z+pd/2-2;
   for(const dz of [-.38,.38]){
    p.beam([xx,2.4,zz+dz],[xx,4.2,zz+dz],.075,white);
    p.beam([xx,4.2,zz+dz],[xx+side*.8,4.2,zz+dz],.075,white);
    p.beam([xx+side*.8,4.2,zz+dz],[xx+side*.8,3.48,zz+dz],.075,white);
   }
   for(const yy of [2.55,2.95,3.35])p.box(.09,.07,.82,xx,yy,zz,white);
  }
 }
 // Two-storey open gallery along the hall side; water stays uncovered.
 const x0=w*.14,x1=w*.78,z=d*.29,back=z-4.6,front=z+.6;
 p.box(x1-x0,3.1,2.8,(x0+x1)/2,4.925,back+.8,'#d2d1c5');
 for(let x=x0+1;x<x1;x+=4.5){
  p.box(2.5,1.85,.10,x,4.8,back+2.25,'#3e7779');
  for(let j=-3;j<=3;j++)p.box(.05,1.9,.09,x+j*.33,4.8,back+2.32,white);
 }
 for(const y of [6.8,10.1]){
  if(y===10.1)gymUpperSlab(p,w,d,x0,x1,back,front,.32);
  else p.box(x1-x0,.32,front-back,(x0+x1)/2,y,(front+back)/2,white);
  const railY=y===10.1?y:y+.17;
  openRail(p,[x0,railY,front],[x1,railY,front],white);
 }
 for(let x=x0;x<=x1+.1;x+=(x1-x0)/10)p.box(.38,6.6,.38,x,6.675,front-.4,white);
 // The inscription belongs across the water, on the basketball-court side.
 // Its face points north into the pool; reverse placement as well as rotation
 // so the four characters remain readable from inside the swimming area.
 const opposite=d*.95;
 p.box(x1-x0,1.65,.34,(x0+x1)/2,6.175,opposite,white);
 inscription(p,'文明游泳',(x0+x1)/2,5.6,opposite-.22,-1);
 // Low blue spectator steps on the west side, with white horizontal rails.
 for(let row=0;row<5;row++)p.box(.85,.36,d*.47,x0-1-row*.86,3.55+row*.4,d*.63,'#486f84');
 openRail(p,[x0-5,5.3,d*.39],[x0-5,5.3,d*.87],white);
 // Slim floodlight masts occupy paving, including the strip between pools.
 for(const x of [x0-6.2,w*.465,x1+2])for(const zz of [d*.37,d*.87]){
  p.cylinder(.12,10,x,8.375,zz,white,.09,8);
  p.box(1.15,.12,.22,x,13.2,zz,white);
  for(const dx of [-.4,.4])p.box(.42,.38,.3,x+dx,13.48,zz,'#66777a');
 }
}

/** South perimeter visible above the basketball courts: two open levels. */
export function makeTrackGallery(p:Parts,tx:number,tz:number,trackWidth:number,trackDepth:number,w:number){
 const x0=w*.14,x1=tx+trackDepth/2+1,z=tz+trackWidth/2+6,depth=4.4;
 for(const y of [3.375,7.2]){
  p.box(x1-x0,.35,depth,(x0+x1)/2,y-.175,z,white);
  for(const side of [-1,1])openRail(p,[x0,y,z+side*depth/2],[x1,y,z+side*depth/2],white);
 }
 for(let x=x0;x<=x1;x+=7)for(const side of [-1,1])p.box(.45,7.2,.45,x,3.6,z+side*(depth/2-.3),'#d2d1c5');
 // Red-and-white end-wall ornament carrying a black-and-white football.
 const x=tx+trackDepth*.16,zz=z-depth/2-.9;
 const base=3.375;
 p.box(6.2,.3,2.6,x,base-.15,zz,white);
 for(const dx of [-2.5,2.5])p.box(.5,base,.5,x+dx,base/2,zz,white);
 p.box(5.8,.5,2.1,x,base+.25,zz,'#aa5251');
 for(const dx of [-2.5,2.5])p.box(.5,3.3,1.2,x+dx,base+1.9,zz,'#aa5251');
 p.box(5.8,.6,1.6,x,base+3.55,zz,'#aa5251');p.box(3.9,1.7,.2,x,base+2.2,zz+.62,white);
 p.cylinder(.6,.4,x,base+4,zz,white,.6,10);
 p.add(new T.SphereGeometry(1.25,20,14),white,[x,base+5.4,zz]);
 const ico=new T.IcosahedronGeometry(1,0).getAttribute('position'),seen=new Set<string>();
 for(let i=0;i<ico.count;i++){
  const n=new T.Vector3().fromBufferAttribute(ico,i).normalize(),key=n.toArray().map(v=>v.toFixed(3)).join(',');if(seen.has(key))continue;seen.add(key);
  const patch=new T.CircleGeometry(.35,5);patch.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),n));
  p.add(patch,'#3c4b4c',[x+n.x*1.26,base+5.4+n.y*1.26,zz+n.z*1.26]);
 }
}
