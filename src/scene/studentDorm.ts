import {Parts} from './geometry';
import {courtyardMass} from './courtyard';
import type {Building} from '../data/campus';
const slab='#c4c6ba',railColor='#708d88',light='#e3e3d7',glass='#617d80';
function rail(p:Parts,x0:number,x1:number,z:number,y:number){
 for(let k=0;k<4;k++)p.box(x1-x0,.085,.085,(x0+x1)/2,y+.25+k*.28,z,railColor);
 const n=Math.ceil((x1-x0)/3);for(let k=0;k<=n;k++)p.box(.09,1.12,.09,x0+k*(x1-x0)/n,y+.56,z,railColor);
}
export function studentDorm(b:Building,p:Parts){
 const {width:w,depth:d,height:h}=b,floors=b.floors,step=h/floors;
 // The 2024 approved plan explicitly identifies the built student dorms as
 // seven-storey buildings with an open ground floor. Planned west 17 is separate.
 const openGround=b.id!=='b-west-dorm-17',base=openGround?step:0;
 const interior={x:0,z:0,width:w*.62,depth:d*.28},wallVoid={x:0,z:0,width:w*.70,depth:d*.43};
 courtyardMass(p,w*.94,d*.83,[wallVoid],h-base,base,b.color);
 for(let f=0;f<=floors;f++){
  const y=f*step;
  courtyardMass(p,w+1.1,d+2.1,[interior],.34,y,slab);
  // Leave the pedestrian level open; the full-height columns below support it.
  if(openGround&&f===0)continue;
  for(const side of [-1,1]){
   rail(p,-w*.5,w*.5,side*(d/2+1),y+.2);
   rail(p,-interior.width/2,interior.width/2,side*interior.depth/2,y+.2);
   if(f<floors)for(let j=0;j<10;j++){
    const x=-w*.44+j*w*.88/9;
    p.box(w*.044,step*.48,.16,x,y+step*.53,side*(d*.415+.06),glass);
    p.box(.10,step*.49,.18,x,y+step*.53,side*(d*.415+.12),light);
    if(j%2===0)p.box(1.1,.6,.42,x+w*.035,y+step*.34,side*(d*.415+.32),'#b7beb3');
   }
   // Short-side horizontal guardrails, including the open rooftop terrace.
   for(let k=0;k<4;k++)p.box(.085,.085,d+2,side*w/2,y+.45+k*.28,0,railColor);
   for(let j=0;j<=4;j++)p.box(.09,1.12,.09,side*w/2,y+.76,-d/2+j*d/4,railColor);
  }
 }
 for(let j=0;j<=9;j++)for(const side of [-1,1])p.box(.43,h,.43,-w*.46+j*w*.92/9,h/2,side*(d/2+.62),light);
 // Courtyard end landings and exposed cross rails, visible from above/inside.
 for(let f=1;f<floors;f++){
  p.box(w*.10,.35,interior.depth,w*.255,f*step,0,slab);
  for(let k=0;k<4;k++)p.box(.085,.085,interior.depth,w*.205,f*step+.45+k*.28,0,railColor);
 }
 for(const x of [-w*.35,w*.35]){
  for(const dx of [-w*.07,w*.07])for(const z of [-d*.22,d*.22])p.box(.35,2.1,.35,x+dx,h+1.4,z,light);
  p.box(w*.18,.35,d*.5,x,h+2.6,0,slab);
  for(const z of [-d*.25,d*.25])rail(p,x-w*.09,x+w*.09,z,h+2.8);
 }
}
