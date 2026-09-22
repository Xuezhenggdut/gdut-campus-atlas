import type {Building} from '../data/campus';
import {teachingCourts} from '../data/teachingPlan';
import {courtyardMass} from './courtyard';
import {Parts} from './geometry';

export function plannedTeaching(b:Building,p:Parts){
 const {width:w,depth:d,height:h,floors}=b,holes=teachingCourts(b.id),step=h/floors;
 courtyardMass(p,w,d,holes,h,0,'#ece5d5');
 for(let f=0;f<=floors;f++){
  const y=f*step;courtyardMass(p,w+.6,d+.6,holes,.38,y,f===floors?'#eeeede':'#82a28d');
  if(f===floors)continue;
  for(const side of [-1,1]){
   const nx=Math.max(5,Math.round(w/4)),nz=Math.max(3,Math.round(d/4));
   for(let j=0;j<nx;j++)p.box(w/nx*.72,Math.min(2.2,step*.55),.15,-w/2+(j+.5)*w/nx,y+step*.56,side*(d/2+.08),'#74959a');
   for(let j=0;j<nz;j++)p.box(.15,Math.min(2.2,step*.55),d/nz*.72,side*(w/2+.08),y+step*.56,-d/2+(j+.5)*d/nz,'#74959a');
   for(const c of holes){
    p.box(c.width*.85,Math.min(2,step*.5),.12,c.x,y+step*.56,c.z+side*(c.depth/2+.07),'#74959a');
    p.box(.12,Math.min(2,step*.5),c.depth*.8,c.x+side*(c.width/2+.07),y+step*.56,c.z,'#74959a');
   }
  }
 }
 for(const c of holes){
  p.box(c.width,.16,c.depth,c.x,.08,c.z,'#b5c5ad');
  for(const side of [-1,1]){
   p.box(c.width,.7,.2,c.x,h+.6,c.z+side*c.depth/2,'#eeeede');
   p.box(.2,.7,c.depth,c.x+side*c.width/2,h+.6,c.z,'#eeeede');
  }
 }
 for(const side of [-1,1]){
  p.box(w,.7,.2,0,h+.6,side*d/2,'#eeeede');p.box(.2,.7,d,side*w/2,h+.6,0,'#eeeede');
  for(let x=-w/2;x<=w/2;x+=6)p.box(.24,h,.2,x,h/2,side*(d/2+.19),'#eeeede');
 }
}
