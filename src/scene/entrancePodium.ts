import * as T from 'three';
import {Parts} from './geometry';

/** Two visible levels: shaded parking below a raised pedestrian forecourt.
 * Dimensions are schematic; the supplied photograph establishes the section. */
export function entrancePodium(p:Parts){
 const x0=289,x1=419,z0=263,z1=340,deck=4.8;
 const shape=new T.Shape();shape.moveTo(x0,-z0);shape.lineTo(x1,-z0);shape.lineTo(x1,-z1);shape.lineTo(434,-z1);shape.lineTo(434,-363);shape.lineTo(345,-363);shape.lineTo(345,-z1);shape.lineTo(x0,-z1);shape.closePath();
 const courts=[{x:371,z:290,rx:15,rz:12},{x:394,z:325,rx:16,rz:12},{x:369,z:344,rx:10,rz:8}];
 const edge=(c:typeof courts[number],a:number):[number,number]=>{const r=1+.20*Math.cos(3*a+.5);return [c.x+c.rx*r*Math.cos(a),c.z+c.rz*r*Math.sin(a)];};
 for(const c of courts){const hole=new T.Path();for(let i=0;i<=96;i++){const [x,z]=edge(c,-i*Math.PI/48);if(i)hole.lineTo(x,-z);else hole.moveTo(x,-z);}hole.closePath();shape.holes.push(hole);}
 const slab=new T.ExtrudeGeometry(shape,{depth:.55,bevelEnabled:false,curveSegments:32});slab.rotateX(-Math.PI/2);p.add(slab,'#d5d2c7',[0,deck-.55,0]);
 const rail=(a:[number,number],b:[number,number])=>{
  for(const h of [.35,.7,1.05])p.beam([a[0],deck+h,a[1]],[b[0],deck+h,b[1]],.09,'#ecece3');
  p.box(.12,1.1,.12,a[0],deck+.55,a[1],'#ecece3');
 };
 for(const c of courts)for(let i=0;i<48;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24;rail(edge(c,a),edge(c,b));}
 for(const z of [z0,z1])for(let x=x0;x<x1;x+=5)if(z===z0||x<340)rail([x,z],[Math.min(x+5,x1),z]);
 // Column rows avoid the north-south drive and the open courtyards.
 for(const x of [295,307,351,365,409])for(const z of [269,286,324,335]){
  if(courts.some(c=>((x-c.x)/c.rx)**2+((z-c.z)/c.rz)**2<1.5))continue;
  p.cylinder(.42,deck-.55,x,(deck-.55)/2,z,'#c9c8bc',.42,10);
 }
 // Parking bays below the slab, leaving the through lane at x=335 open.
 for(const x of [300,354,403])for(let z=271;z<334;z+=8){
  if(courts.some(c=>((x-c.x)/(c.rx+3))**2+((z-c.z)/(c.rz+3))**2<1))continue;
  for(const side of [-1,1])p.box(5,.025,.12,x,.22,z+side*2,'#eee9d7');
  if(z%3===0){p.box(3.7,1.1,1.8,x,.8,z,'#6f7c7b');p.box(1.9,.7,1.6,x,1.65,z,'#455b61');}
 }
 // The south landing meets the existing lawn-and-stair garden at z=363.
 for(const x of [349,389,430])p.cylinder(.42,deck-.55,x,(deck-.55)/2,356,'#c9c8bc',.42,10);
}
