import {Parts} from './geometry';
import {courtyardMass} from './courtyard';
import type {Building} from '../data/campus';
import {doglegStair,mullionedWindow} from './facadeDetails';
const slab='#c4c6ba',railColor='#53736d',light='#e3e3d7',glass='#617d80';
function rail(p:Parts,x0:number,x1:number,z:number,y:number,roof=false){
 const thickness=roof?.14:.10;
 for(let k=0;k<4;k++)p.box(x1-x0,thickness,thickness,(x0+x1)/2,y+.25+k*.28,z,railColor);
 const n=Math.ceil((x1-x0)/3);for(let k=0;k<=n;k++)p.box(.09,1.12,.09,x0+k*(x1-x0)/n,y+.56,z,railColor);
}
export function studentDorm(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b,floors=b.floors,step=h/floors;
 // Retain the existing warm/cool building groups: the warm type has the
 // orange slab fascia seen in the new photo, not orange infill walls alone.
 const fascia=['#d9a08c','#dca18d'].includes(b.color)?'#c58259':slab;
 // The 2024 approved plan explicitly identifies the built student dorms as
 // seven-storey buildings with an open ground floor. Planned west 17 is separate.
 const openGround=b.id!=='b-west-dorm-17',base=openGround?step:0;
 const interior={x:0,z:0,width:w*.62,depth:d*.28},wallVoid={x:0,z:0,width:w*.70,depth:d*.43};
 courtyardMass(p,w*.94,d*.83,[wallVoid],h-base,base,b.color);
 for(let f=0;f<=floors;f++){
  const y=f*step;
  courtyardMass(p,w+1.1,d+2.1,[interior],.42,y,fascia);
  // Leave the pedestrian level open; the full-height columns below support it.
  if(openGround&&f===0)continue;
  for(const side of [-1,1]){
   rail(p,-w*.5,w*.5,side*(d/2+1),y+.2,f===floors);
   rail(p,-interior.width/2,interior.width/2,side*interior.depth/2,y+.2);
   if(f<floors)for(let j=0;j<10;j++){
    const x=-w*.44+j*w*.88/9;
    mullionedWindow(p,x,y+step*.53,side*(d*.415+.08),w*.044,step*.48,side,false,glass);
    p.box(.75,.68,.44,x+w*.035,y+step*.37,side*(d*.415+.3),'#b7beb3');
    for(let k=0;k<3;k++)p.box(.56,.05,.035,x+w*.035,y+step*.37-.17+k*.17,side*(d*.415+.55),'#7c8a86');
   }
   // Short-side horizontal guardrails, including the open rooftop terrace.
   for(let k=0;k<4;k++)p.box(f===floors?.14:.10,f===floors?.14:.10,d+2,side*w/2,y+.45+k*.28,0,railColor);
   for(let j=0;j<=4;j++)p.box(.09,1.12,.09,side*w/2,y+.76,-d/2+j*d/4,railColor);
   if(f<floors)for(const z of [-d*.26,0,d*.26])mullionedWindow(p,side*(w*.47+.06),y+step*.53,z,d*.19,step*.48,side,true,glass);
  }
 }
 for(let j=0;j<=9;j++)for(const side of [-1,1])p.box(.43,h,.43,-w*.46+j*w*.92/9,h/2,side*(d/2+.62),light);
 // Internal open corridors have room doors and independent columns facing
 // the atrium. No walls or full floor plates span the central light well.
 for(let j=0;j<=6;j++)for(const side of [-1,1]){
  const x=-interior.width/2+j*interior.width/6;
  p.box(.35,h-base,.35,x,base+(h-base)/2,side*(interior.depth/2+.22),light);
  if(j<6)for(let f=openGround?1:0;f<floors;f++){
   const doorX=x+interior.width/12,y=f*step;
   p.box(.82,step*.67,.1,doorX,y+step*.335,side*(wallVoid.depth/2-.06),'#777d6e');
   p.box(.09,.13,.12,doorX+.25,y+step*.34,side*(wallVoid.depth/2-.12),'#c9cbb6');
  }
 }
 // Courtyard end landings and exposed cross rails, visible from above/inside.
 for(let f=1;f<floors;f++){
  p.box(w*.10,.35,interior.depth,w*.255,f*step,0,slab);
  for(let k=0;k<4;k++)p.box(.085,.085,interior.depth,w*.205,f*step+.45+k*.28,0,railColor);
 }
 // Flights sit beside the east end landings, leaving the atrium centre open.
 const stairWidth=Math.min(3.6,w*.12),stairX=w*.205-stairWidth/2-.2;
 doglegStair(p,stairX,0,stairWidth,Math.max(2,interior.depth-2.4),base,step,floors-(openGround?1:0),slab,railColor);
 // Photo: two raised stair-head canopies form a distinct second skyline,
 // with four horizontal bars on every side, not just a flat roof parapet.
 for(const x of [-w*.35,w*.35]){
  const rw=w*.22,rd=d*.56,top=h+3.75;
  for(const dx of [-rw*.4,rw*.4])for(const z of [-rd*.4,rd*.4])p.box(.48,3.4,.48,x+dx,h+1.98,z,light);
  p.box(rw,.42,rd,x,top,0,fascia);
  // Small recessed stair-head wall, leaving the porch visibly open.
  p.box(rw*.25,2.8,rd*.5,x+Math.sign(x)*rw*.23,h+1.75,0,b.color);
  for(const z of [-rd/2,rd/2])rail(p,x-rw/2,x+rw/2,z,top+.24,true);
  for(const side of [-1,1]){
   for(let k=0;k<4;k++)p.box(.14,.14,rd,x+side*rw/2,top+.49+k*.28,0,railColor);
   for(let j=0;j<=2;j++)p.box(.1,1.12,.1,x+side*rw/2,top+.8,-rd/2+j*rd/2,railColor);
  }
 }
}
