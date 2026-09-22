import {Parts} from './geometry';
type Point=[number,number,number];

/** Slim open railings, shared by corridors, landings and sloping stair flights. */
export function openRail(p:Parts,a:Point,b:Point,color:string,bars=3,thickness=.085){
 for(let k=0;k<bars;k++)p.beam([a[0],a[1]+.3+k*.3,a[2]],[b[0],b[1]+.3+k*.3,b[2]],thickness,color);
 const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/3));
 for(let k=0;k<=n;k++){const t=k/n;p.box(.09,1.12,.09,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+.56,a[2]+(b[2]-a[2])*t,color);}
}

/** A window sits on the recessed wall, behind the independent balcony rail. */
export function mullionedWindow(p:Parts,x:number,y:number,z:number,w:number,h:number,side:number,shortSide=false,glass='#74969a'){
 const frame='#404e4c';
 const box=(bw:number,bh:number,depth:number,u:number,v:number,out:number,c:string)=>shortSide?p.box(depth,bh,bw,x+side*out,y+v,z+u,c):p.box(bw,bh,depth,x+u,y+v,z+side*out,c);
 box(w,h,.13,0,0,0,glass);
 for(let i=0;i<=3;i++)box(.085,h+.12,.16,-w/2+i*w/3,0,.08,frame);
 for(const dy of [-h/2,0,h/2])box(w,.085,.16,0,dy,.08,frame);
}

/** Open dogleg flights: no enclosing box and no central wall across the void. */
export function doglegStair(p:Parts,x:number,z:number,width:number,length:number,base:number,step:number,floors:number,slab:string,rail:string){
 const flight=width*.39,offset=width*.25,n=10;
 for(let f=0;f<floors;f++){
  const y=base+f*step;
  for(const [half,dir] of [[0,1],[1,-1]]){
   const cx=x+(half===0?-offset:offset);
   for(let k=0;k<n;k++)p.box(flight,.18,length/n+.06,cx,y+half*step/2+(k+1)*step/(2*n),z+dir*(-length/2+(k+.5)*length/n),slab);
   for(const side of [-1,1])openRail(p,[cx+side*flight/2,y+half*step/2,z-dir*length/2],[cx+side*flight/2,y+(half+1)*step/2,z+dir*length/2],rail);
  }
  p.box(width,.24,1.2,x,y+step/2,z+length/2+.55,slab);
  p.box(width,.24,1.2,x,y+step,z-length/2-.55,slab);
 }
}
