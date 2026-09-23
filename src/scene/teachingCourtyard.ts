import * as T from 'three';
import {buildings,toWorld} from '../data/campus';
import {Parts} from './geometry';
import {valleyPortal} from './teachingEntrance';

/** Reconstructed from the user's photo looking south through the courtyard
 * toward the library. Leave the transverse road and entrance bridge clear. */
export function teachingCourtyardRows(){
 return [6,5].map(n=>{
  const b=buildings.find(b=>b.id===`b-teaching-${n}`)!,z=toWorld(b.position)[1];
  return {z0:z-b.depth/2+.4,z1:z+b.depth/2-.4,
   canopyStart:z-b.depth/2+4,
   canopyEnd:n===5?valleyPortal.center[1]-valleyPortal.depth-2:z+b.depth/2-4};
 });
}

export function makeTeachingCourtyard(p:Parts){
 const [x]=valleyPortal.center,base=1.22,ivory='#eeeade',steel='#c5c8bb';
 for(const row of teachingCourtyardRows()){
  p.box(valleyPortal.width,.16,row.z1-row.z0,x,base-.08,(row.z0+row.z1)/2,'#c8c4b3');
  // Paving joints follow the centre aisle, with planting confined to low pots.
  for(let z=row.z0+1;z<row.z1;z+=2)p.box(valleyPortal.width,.012,.035,x,base+.012,z,'#aeb2a6');
  for(let dx=-12;dx<=12;dx+=2)p.box(.035,.012,row.z1-row.z0,x+dx,base+.012,(row.z0+row.z1)/2,'#aeb2a6');
  const count=Math.max(1,Math.floor((row.canopyEnd-row.canopyStart)/6)),pitch=(row.canopyEnd-row.canopyStart)/count;
  for(const side of [-1,1])for(let i=0;i<count;i++){
   const cx=x+side*7.5,z0=row.canopyStart+i*pitch,z1=z0+pitch-.45,r=3.6,eave=base+3.1,rise=1.05;
   const vertices:number[]=[],indices:number[]=[];
   for(let k=0;k<=16;k++){
    const a=k*Math.PI/16,xx=cx-r*Math.cos(a),yy=eave+rise*Math.sin(a);
    vertices.push(xx,yy,z0,xx,yy,z1);
    if(k<16){const j=k*2;indices.push(j,j+1,j+2,j+1,j+3,j+2,j+2,j+1,j,j+2,j+3,j+1);}
   }
   const roof=new T.BufferGeometry();roof.setAttribute('position',new T.Float32BufferAttribute(vertices,3));roof.setIndex(indices);roof.computeVertexNormals();p.add(roof,ivory);
   for(const z of [z0,z1]){
    for(const s of [-1,1])p.cylinder(.075,eave-base,cx+s*r,(eave+base)/2,z,steel,.075,8);
    for(let k=0;k<16;k++){
     const a=k*Math.PI/16,b=(k+1)*Math.PI/16;
     p.beam([cx-r*Math.cos(a),eave+rise*Math.sin(a),z],[cx-r*Math.cos(b),eave+rise*Math.sin(b),z],.10,steel);
    }
   }
   for(const s of [-1,1])p.beam([cx+s*r,eave,z0],[cx+s*r,eave,z1],.10,steel);
  }
  for(let z=row.canopyStart+5;z<row.canopyEnd-3;z+=17){
   p.cylinder(.85,.55,x,base+.275,z,'#a59b7c',.95,12);
   p.cylinder(.09,1.45,x,base+1.2,z,'#807661',.06,7);
   const crown=new T.IcosahedronGeometry(1.3,1);crown.scale(1,.48,1);p.add(crown,'#82936e',[x,base+2.15,z]);
  }
 }
}
