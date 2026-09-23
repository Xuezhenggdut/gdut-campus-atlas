import * as T from 'three';
import {Parts} from './geometry';

// Five curved openings retain their traced topology, refitted to the user
// overhead and platform-level photos. The wider wells expose parking below,
// with palms rooted in the openings rather than round trees on the upper slab.
const wellTraces=[
 [[104,3],[151,10],[201,13],[210,30],[197,60],[212,79],[190,96],[184,130],[159,141],[132,115],[79,108],[58,91],[86,61],[94,19]],
 [[100,161],[139,164],[158,174],[196,174],[210,187],[207,204],[195,215],[170,214],[145,219],[121,215],[109,237],[85,241],[82,227],[94,205],[89,183]],
 [[131,254],[178,254],[213,250],[225,261],[216,280],[216,310],[226,330],[207,343],[175,346],[157,336],[156,302],[134,294],[122,277]],
 [[89,305],[110,303],[124,311],[119,324],[107,330],[97,320],[86,316]],
 [[169,401],[180,398],[195,414],[207,431],[208,443],[191,457],[178,473],[162,474],[151,460],[149,446],[135,436],[130,425],[141,416],[155,413]],
] as [number,number][][];
export const podiumWells=wellTraces.map((points,index)=>{
 const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(index===4?375.775+(305+x*.48-386)*.6:305+x*.48,0,264+z*.18)),true,'centripetal');
 return curve.getPoints(96).slice(0,-1).map(p=>[p.x,p.z] as [number,number]);
});
const inWell=(x:number,z:number,points:[number,number][])=>{
 let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }return inside;
};
export const nearPodiumWell=(x:number,z:number,margin=2)=>podiumWells.some(poly=>inWell(x,z,poly)||poly.some(p=>Math.hypot(x-p[0],z-p[1])<margin));

export const podiumPalms:[number,number][]=[];
export const podiumCars:[number,number][]=[];
for(const poly of podiumWells){
 const xs=poly.map(v=>v[0]),zs=poly.map(v=>v[1]);
 const loX=Math.min(...xs),hiX=Math.max(...xs),loZ=Math.min(...zs),hiZ=Math.max(...zs);
 const candidates:[number,number][]=[];
 for(let z=loZ+3;z<hiZ-2;z+=4)for(let x=loX+3;x<hiX-2;x+=4){
  if(x<345||!inWell(x,z,poly)||poly.some(q=>Math.hypot(q[0]-x,q[1]-z)<2.2))continue;
  candidates.push([x,z]);
 }
 for(const q of candidates){
  if(podiumPalms.every(p=>Math.hypot(p[0]-q[0],p[1]-q[1])>12))podiumPalms.push(q);
 }
 let carsInWell=0;
 for(const q of candidates){
  if(carsInWell>=4)break;
  if(podiumPalms.some(p=>Math.hypot(p[0]-q[0],p[1]-q[1])<4)||podiumCars.some(p=>Math.hypot(p[0]-q[0],p[1]-q[1])<6))continue;
  podiumCars.push(q);carsInWell++;
 }
}
function makePodiumPalm(p:Parts,x:number,z:number){
 p.cylinder(1.25,.18,x,.19,z,'#929b77',1.25,12);
 const h=8.6;
 p.cylinder(.23,h,x,h/2+.2,z,'#9a8c70',.16,10);
 for(let i=1;i<16;i++)p.cylinder(.235,.045,x,i*h/16+.2,z,'#817b65',.23,10);
 for(let i=0;i<10;i++){
  const angle=i*Math.PI/5,c=Math.cos(angle),s=Math.sin(angle),verts:number[]=[],ix:number[]=[];
  for(let k=0;k<=8;k++){
   const t=k/8,r=t*3.3,y=h+.4+1.2*Math.sin(t*Math.PI)-t*.6,width=.38*Math.sin(t*Math.PI);
   verts.push(x+c*r-s*width,y,z+s*r+c*width,x+c*r+s*width,y,z+s*r-c*width);
   if(k<8){const j=k*2;ix.push(j,j+2,j+1,j+1,j+2,j+3,j+1,j+2,j,j+3,j+2,j+1);}
  }
  const leaf=new T.BufferGeometry();leaf.setAttribute('position',new T.Float32BufferAttribute(verts,3));leaf.setIndex(ix);leaf.computeVertexNormals();p.add(leaf,i%2?'#64885e':'#78995e');
  p.beam([x,h+.4,z],[x+c*2.2,h+1,z+s*2.2],.055,'#81966b');
 }
}

// Include a canopy-width margin so nearby procedural trees cannot clip the slab.
export const excludesPodiumTree=(x:number,z:number)=>
 (x>=281&&x<=427&&z>=255&&z<=348)||(x>=337&&x<=442&&z>=332&&z<=371);

/** Two visible levels: shaded parking below a raised pedestrian forecourt.
 * Dimensions are schematic; the supplied photograph establishes the section. */
export function entrancePodium(p:Parts){
 const x0=289,x1=419,z0=263,z1=340,deck=4.8;
 const shape=new T.Shape();shape.moveTo(x0,-z0);shape.lineTo(x1,-z0);shape.lineTo(x1,-z1);shape.lineTo(434,-z1);shape.lineTo(434,-363);shape.lineTo(345,-363);shape.lineTo(345,-z1);shape.lineTo(x0,-z1);shape.closePath();
 for(const points of podiumWells){const hole=new T.Path();points.forEach(([x,z],i)=>i?hole.lineTo(x,-z):hole.moveTo(x,-z));hole.closePath();shape.holes.push(hole);}
 const slab=new T.ExtrudeGeometry(shape,{depth:.55,bevelEnabled:false,curveSegments:32});slab.rotateX(-Math.PI/2);p.add(slab,'#d5d2c7',[0,deck-.55,0]);
 const rail=(a:[number,number],b:[number,number])=>{
  for(const h of [.25,.52,.79,1.06])p.beam([a[0],deck+h,a[1]],[b[0],deck+h,b[1]],.09,'#ecece3');
  p.box(.12,1.1,.12,a[0],deck+.55,a[1],'#ecece3');
 };
 for(const points of podiumWells)for(let i=0;i<points.length;i+=2)rail(points[i],points[(i+2)%points.length]);
 for(const z of [z0,z1])for(let x=x0;x<x1;x+=5)if(z===z0||x<340)rail([x,z],[Math.min(x+5,x1),z]);
 // Column rows avoid the north-south drive and the open courtyards.
 for(const x of [295,307,351,365,409])for(const z of [269,286,324,335]){
  if(nearPodiumWell(x,z))continue;
  p.cylinder(.42,deck-.55,x,(deck-.55)/2,z,'#c9c8bc',.42,10);
 }
 // A lower parking court is visible through the wells; preserve the through
 // lane at x=335 and keep all parked cars clear of columns and palm trunks.
 p.box(75,.12,88,381.5,.08,308,'#9ca9aa');
 for(const [i,car] of podiumCars.entries()){
  const [x,z]=car;
  for(const dx of [-1.6,1.6])p.box(.10,.025,5.4,x+dx,.18,z,'#dac787');
  p.box(3.2,.025,.10,x,.18,z-2.7,'#dac787');
  p.box(1.8,.65,3.7,x,.67,z,['#67787f','#bdbbb0','#ad5650','#dfc777'][i%4]);
  p.box(1.55,.50,1.85,x,1.245,z,'#455c63');
  for(const dz of [-1.3,1.3])for(const dx of [-.9,.9])p.box(.18,.38,.65,x+dx,.37,z+dz,'#505653');
 }
 // The south landing meets the existing lawn-and-stair garden at z=363.
 for(const x of [349,389,430])p.cylinder(.42,deck-.55,x,(deck-.55)/2,356,'#c9c8bc',.42,10);
 // Tall slender palms rise from the lower level through the open wells.
 for(const [x,z] of podiumPalms)makePodiumPalm(p,x,z);
}
