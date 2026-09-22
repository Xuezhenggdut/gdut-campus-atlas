import * as T from 'three';
import {Parts} from './geometry';

export const cultureSiteRise=4;
export function cultureTerraces(d:number){
 const start=d*.55,end=start+d*.64;
 // Most of the forecourt is level; both external stair flights are at its
 // lower end, separated by a landing, as confirmed by the frontal aerial.
 return [{z:start,y:5.25},{z:start+d*.64*.56,y:5.25},{z:start+d*.64*.75,y:2.85},{z:start+d*.64*.84,y:2.85},{z:end+5.6,y:.45}];
}
export function cultureGroundHeight(z:number,d:number){
 const points=cultureTerraces(d);
 for(let i=1;i<points.length;i++)if(z<=points[i].z){const a=points[i-1],b=points[i],t=Math.max(0,(z-a.z)/(b.z-a.z));return a.y+(b.y-a.y)*t;}
 return points.at(-1)!.y;
}
function mound(p:Parts,width:number,x:number,profile:{z:number;y:number}[],color:string,thickness?:number){
 const s=new T.Shape();s.moveTo(profile[0].z,profile[0].y);
 for(const v of profile.slice(1))s.lineTo(v.z,v.y);
 for(const v of [...profile].reverse())s.lineTo(v.z,thickness?v.y-thickness:0);
 s.closePath();const g=new T.ExtrudeGeometry(s,{depth:width,bevelEnabled:false});
 const a=g.getAttribute('position');for(let i=0;i<a.count;i++){const z=a.getX(i),y=a.getY(i),u=a.getZ(i);a.setXYZ(i,x+width/2-u,y,z);}g.computeVertexNormals();p.add(g,color);
}
export function makeCultureForecourt(p:Parts,w:number,d:number){
 const profile=cultureTerraces(d);
 p.box(w*.94,5.25,d*.31,0,5.25/2,d*.395,'#bdbdae');
 mound(p,w*.94,0,profile,'#bdbdae');
 // Two grass banks, separated by a level cross-walk, descend from the hall.
 mound(p,w*.41,-w*.03,[{z:profile[0].z+4,y:5.325},{z:profile[1].z-2,y:5.325}],'#8aab65',.075);
 mound(p,w*.41,-w*.03,profile.slice(1).map(v=>({z:v.z,y:v.y+.075})),'#8aab65',.075);
 for(const x of [-w*.36,w*.31]){
  for(let i=1;i<profile.length;i++){
   const a=profile[i-1],b=profile[i],n=a.y===b.y?1:Math.max(2,Math.ceil((a.y-b.y)/.24));
   for(let k=0;k<n;k++){
    const depth=(b.z-a.z)/n,z=a.z+(k+.5)*depth,top=a.y+(b.y-a.y)*k/n+.055;
    p.box(w*.21,top,depth+.025,x,top/2,z,'#e3e5dd');
   }
  }
 }
}
