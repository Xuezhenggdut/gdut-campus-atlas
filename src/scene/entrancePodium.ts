import * as T from 'three';
import {Parts} from './geometry';

// Five light-well outlines digitised from the shared-platform portion of the
// approved plan (PDF clip 856,533–883,587 at 10x), fitted between existing wings.
// X/Z are fitted independently to the existing wings; deck elevation is unchanged.
const wellTraces=[
 [[104,3],[151,10],[201,13],[210,30],[197,60],[212,79],[190,96],[184,130],[159,141],[132,115],[79,108],[58,91],[86,61],[94,19]],
 [[100,161],[139,164],[158,174],[196,174],[210,187],[207,204],[195,215],[170,214],[145,219],[121,215],[109,237],[85,241],[82,227],[94,205],[89,183]],
 [[131,254],[178,254],[213,250],[225,261],[216,280],[216,310],[226,330],[207,343],[175,346],[157,336],[156,302],[134,294],[122,277]],
 [[89,305],[110,303],[124,311],[119,324],[107,330],[97,320],[86,316]],
 [[169,401],[180,398],[195,414],[207,431],[208,443],[191,457],[178,473],[162,474],[151,460],[149,446],[135,436],[130,425],[141,416],[155,413]],
] as [number,number][][];
export const podiumWells=wellTraces.map(points=>{
 const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(335+x*.36,0,263+z*.19)),true,'centripetal');
 return curve.getPoints(96).slice(0,-1).map(p=>[p.x,p.z] as [number,number]);
});
const inWell=(x:number,z:number,points:[number,number][])=>{
 let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }return inside;
};
const nearWell=(x:number,z:number,margin=2)=>podiumWells.some(poly=>inWell(x,z,poly)||poly.some(p=>Math.hypot(x-p[0],z-p[1])<margin));

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
  for(const h of [.35,.7,1.05])p.beam([a[0],deck+h,a[1]],[b[0],deck+h,b[1]],.09,'#ecece3');
  p.box(.12,1.1,.12,a[0],deck+.55,a[1],'#ecece3');
 };
 for(const points of podiumWells)for(let i=0;i<points.length;i+=2)rail(points[i],points[(i+2)%points.length]);
 for(const z of [z0,z1])for(let x=x0;x<x1;x+=5)if(z===z0||x<340)rail([x,z],[Math.min(x+5,x1),z]);
 // Column rows avoid the north-south drive and the open courtyards.
 for(const x of [295,307,351,365,409])for(const z of [269,286,324,335]){
  if(nearWell(x,z))continue;
  p.cylinder(.42,deck-.55,x,(deck-.55)/2,z,'#c9c8bc',.42,10);
 }
 // Parking bays below the slab, leaving the through lane at x=335 open.
 for(const x of [300,354,403])for(let z=271;z<334;z+=8){
  if(nearWell(x,z,4))continue;
  for(const side of [-1,1])p.box(5,.025,.12,x,.22,z+side*2,'#eee9d7');
  if(z%3===0){p.box(3.7,1.1,1.8,x,.8,z,'#6f7c7b');p.box(1.9,.7,1.6,x,1.65,z,'#455b61');}
 }
 // The south landing meets the existing lawn-and-stair garden at z=363.
 for(const x of [349,389,430])p.cylinder(.42,deck-.55,x,(deck-.55)/2,356,'#c9c8bc',.42,10);
 // Only two deliberately placed trees, rooted on the lower courtyard floor.
 for(const [x,z] of [[384,279],[398,316]]){
  p.cylinder(1.5,.18,x,.18,z,'#8c9b72',1.5,16);
  p.cylinder(.24,8,x,4.2,z,'#82745e',.18,9);
  const crown=new T.IcosahedronGeometry(2.7,1);crown.scale(1,1.1,1);
  p.add(crown,'#78936a',[x,9,z]);
 }
}
