import * as T from 'three';
import {Parts} from './geometry';
import {makeGymPlatform,gymPlatformY,gymUpperSlab} from './gymPlatform';
import {buildings,toWorld,type Building} from '../data/campus';
import {openRail} from './facadeDetails';
import {poolDeck,makePoolDetails,makeTrackGallery} from './poolDetails';
import {grandstandLength} from './sportsLayout';

const white='#ebece4',slab='#c9ccbf',steel='#aebbb5';
type P3=[number,number,number];

// Explicit front/back triangles keep the thin shells visible from underneath.
function surface(p:Parts,vertices:number[],indices:number[],color:string,twoSided=false){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();p.add(g,color);
 if(twoSided){const back=new T.BufferGeometry();back.setAttribute('position',new T.Float32BufferAttribute(vertices,3));const reverse:number[]=[];for(let i=0;i<indices.length;i+=3)reverse.push(indices[i],indices[i+2],indices[i+1]);back.setIndex(reverse);back.computeVertexNormals();p.add(back,color);}
}
function line(p:Parts,points:P3[],width:number,color=white){for(let i=1;i<points.length;i++)p.beam(points[i-1],points[i],width,color);}
function ellipse(rx:number,rz:number,y:number,start=0,end=Math.PI*2,n=96):P3[]{return Array.from({length:n+1},(_,i)=>{const a=start+(end-start)*i/n;return [rx*Math.cos(a),y,rz*Math.sin(a)];});}
function deckCourt(p:Parts,x:number,z:number,w:number,d:number,color:string,y:number){
 p.box(w,.18,d,x,y,z,color);for(const sign of [-1,1]){p.box(w*.88,.07,.13,x,y+.12,z+sign*d*.42,white);p.box(.13,.07,d*.84,x+sign*w*.44,y+.12,z,white);}p.box(.12,.07,d*.84,x,y+.12,z,white);
 for(const side of [-1,1]){p.box(.15,.08,d*.45,x+side*w*.28,y+.12,z,white);p.box(w*.16,.08,.12,x+side*w*.36,y+.12,z+d*.23,white);p.box(w*.16,.08,.12,x+side*w*.36,y+.12,z-d*.23,white);}
}
const lettering:Record<string,string[]>={
 G:['01110','10001','10000','10111','10001','10001','01110'],
 D:['11110','10001','10001','10001','10001','10001','11110'],
 U:['10001','10001','10001','10001','10001','10001','01110'],
 T:['11111','00100','00100','00100','00100','00100','00100']
};

function grandstand(b:Building,p:Parts){
 const track=buildings.find(x=>x.id==='b-central-track')!;const a=toWorld(b.position),q=toWorld(track.position),c=Math.cos(b.rotation),s=Math.sin(b.rotation);
 const tx=(q[0]-a[0])*c-(q[1]-a[1])*s,tz=(q[0]-a[0])*s+(q[1]-a[1])*c;
 const len=grandstandLength(track.width),front=tx-track.depth/2-2.8,rows=22,run=.86,rise=.43,back=front-rows*run;
 // A supported raked terrace, with open concourse beneath and separate stairs.
 for(let k=0;k<=12;k++){const z=tz-len/2+k*len/12;p.box(.65,8.9,.7,back-1,4.45,z,slab);p.beam([front-1,1,z],[back-1,10,z],.65,slab);}
 p.box(3.4,.6,len+3,back-1,10.2,tz,white);
 p.box(4.8,2.3,len*.76,back-2,11.55,tz,'#45626a');
 for(let i=0;i<=18;i++)p.box(.25,2.5,.18,back+.5,11.55,tz-len*.38+i*len*.76/18,white);
 for(let row=0;row<rows;row++){
  const y=1.1+row*rise,x=front-row*run;
  p.box(run+.05,.36,len,x,y,tz,slab);
  for(let sector=0;sector<5;sector++){
   const center=tz+(2-sector)*len/5,sectorWidth=len/5-1.7,letter=['G','D','','U','T'][sector],color=['#387694','#527e63','#a95356','#527e63','#387694'][sector];
   const seats=28;
   for(let seat=0;seat<seats;seat++){
    const z=center+sectorWidth/2-(seat+.5)*sectorWidth/seats;
    const gy=Math.floor((rows-1-row-4)/2),gx=Math.floor((seat-4)/4);
    const glyph=letter&&gy>=0&&gy<7&&gx>=0&&gx<5&&lettering[letter][gy][gx]==='1';
    // White seats form GDUT on the actual stepped seating, not a floating label.
    p.box(.57,.18,sectorWidth/seats*.87,x-.03,y+.29,z,glyph?'#f4f1e7':color);
   }
  }
 }
 // Small central crest outline is schematic; no unverified fine seal artwork.
 const crest:P3[]=[];for(let i=0;i<=48;i++){const a=i*Math.PI/24,rr=10+Math.sin(a)*5;crest.push([front-rr*run,1.48+rr*rise,tz+Math.cos(a)*4.8]);}line(p,crest,.18);
 for(const f of [-.5,-.3,-.1,.1,.3,.5]){const z=tz+len*f;line(p,[[front,2.0,z],[back+1,11,z]],.13);for(let i=2;i<rows;i+=4)p.box(.12,1.1,.12,front-i*run,1.65+i*rise,z,white);}
 // Six tensile bays shelter the middle seating; blue end wings remain open.
 const cover=len*.76,bays=6,span=cover/bays;
 for(let bay=0;bay<bays;bay++){
  const center=tz-cover/2+(bay+.5)*span,verts:number[]=[],ix:number[]=[];
  for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){
   const u=i/8,v=j/8*2-1;
   const peak=Math.pow(1-u,1.1)*Math.pow(Math.max(0,1-v*v),.65);
   verts.push(back-8+u*13,12.8+(1-u)*.5+peak*8,center+v*span/2);
   if(i<8&&j<8){const k=i*9+j;ix.push(k,k+1,k+9,k+1,k+10,k+9);}
  }
  surface(p,verts,ix,white,true);
  p.cylinder(.23,24,back-8,12,center,steel,.18,8);
  p.beam([back-8,24,center],[back-8,13.3,center-span/2],.10,steel);
  p.beam([back-8,24,center],[back+5,12.8,center+span/2],.10,steel);
 }
 for(const side of [-1,1]){
  const z=tz+side*(len/2+2);for(let j=0;j<24;j++)p.box(.8,.38,4.2,front-j*.82,.8+j*.42,z,white);
  p.cylinder(.35,29,front-9,14.5,tz+side*(len/2+6),steel,.24,10);
  p.box(.6,3.5,4.6,front-9,28,tz+side*(len/2+6),steel);
  for(let i=0;i<3;i++)p.box(.22,.65,.7,front-8.55,27.1+i*.8,tz+side*(len/2+6),white);
 }
}

export function makeGym(b:Building,p:Parts){
 const w=b.width,d=b.depth;
 // Low podium with walkways, an inset hall, open roof courts and two pools.
 poolDeck(p,w,d,w*1.22,d*1.45,-w*.06,d*.04);
 for(let x=-w*.63;x<w*.55;x+=7.5)for(const z of [-d*.68,d*.72])p.box(.6,3,.6,x,1.5,z,slab);
 const cx=-w*.05,cz=-d*.24,hw=w*.75,hd=d*.75;
 // The hall rises above the open platform, with splayed horizontal fins.
 const bottom=gymPlatformY+.15,upper=18.8,bw=hw*.82,bd=hd*.82;
 const body=[cx-bw/2,bottom,cz-bd/2,cx-bw/2,bottom,cz+bd/2,cx+bw/2,bottom,cz+bd/2,cx+bw/2,bottom,cz-bd/2,cx-hw/2,upper,cz-hd/2,cx-hw/2,upper,cz+hd/2,cx+hw/2,upper,cz+hd/2,cx+hw/2,upper,cz-hd/2];
 surface(p,body,[0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7,4,5,6,4,6,7],'#45626a');
 for(let row=0;row<=10;row++){
  const t=row/10,ww=bw+(hw-bw)*t,dd=bd+(hd-bd)*t,y=bottom+(upper-bottom)*t;
  for(const side of [-1,1]){
   p.box(ww+.6,.20,.50,cx,y,cz+side*dd/2,white);
   p.box(.50,.20,dd+.6,cx+side*ww/2,y,cz,white);
  }
 }
 p.box(hw,.4,hd,cx,19.05,cz,white);
 for(const side of [-1,1]){
  openRail(p,[cx-hw/2,19.25,cz+side*hd/2],[cx+hw/2,19.25,cz+side*hd/2],white);
  openRail(p,[cx+side*hw/2,19.25,cz-hd/2],[cx+side*hw/2,19.25,cz+hd/2],white);
 }
 const rw=hw+7,rd=hd+6,low=20.3,high=22.1;
 const vs=[cx-rw/2,low,cz-rd/2,cx-rw/2,low,cz+rd/2,cx+rw/2,low,cz+rd/2,cx+rw/2,low,cz-rd/2,cx-rw*.25,high,cz-rd*.21,cx-rw*.25,high,cz+rd*.21,cx+rw*.25,high,cz+rd*.21,cx+rw*.25,high,cz-rd*.21];
 surface(p,vs,[0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7,4,5,6,4,6,7],'#9aadb0',true);
 for(let i=0;i<=8;i++){const f=i/8,xx=rw/2*(1-f*.5),zz=rd/2*(1-f*.58),yy=low+(high-low)*f+.08;line(p,[[cx-xx,yy,cz-zz],[cx-xx,yy,cz+zz],[cx+xx,yy,cz+zz],[cx+xx,yy,cz-zz],[cx-xx,yy,cz-zz]],.17,white);}
 // Separate blue and red open courts at the back/side of the raised deck.
 for(const [z,col] of [[-d*.37,'#68858e'],[-d*.02,'#b96f55']] as const){deckCourt(p,-w*.54,z,w*.20,d*.29,col,3.55);for(const x of [-w*.65,-w*.43])p.box(.16,2.8,.16,x,5,z,steel);}
 // East concourse links the hall to the west stand; pools occupy its southern side.
 p.box(w*.54,.75,d*.90,w*.54,3,-d*.18,white);
 poolDeck(p,w,d,w*.64,d*.66,w*.46,d*.62);
 makePoolDetails(p,w,d);
 makeGymPlatform(p,w,d);
 // Aerial: an open white frame encloses the two pool decks. No opaque
 // roof spans the water; the divider sits in the paved gap between pools.
 const poolX0=w*.14,poolX1=w*.78,poolZ0=d*.29,poolZ1=d*.95,frameY=7.2;
 for(const x of [poolX0,w*.465,poolX1]){
  p.box(.34,.4,poolZ1-poolZ0,x,frameY,(poolZ0+poolZ1)/2,white);
  for(const z of [poolZ0,poolZ1])p.box(.36,frameY-3.375,.36,x,(frameY+3.375)/2,z,white);
 }
 for(const z of [poolZ0,poolZ1]){
  p.box(poolX1-poolX0,.4,.34,(poolX0+poolX1)/2,frameY,z,white);
  openRail(p,[poolX0,3.4,z],[poolX1,3.4,z],white);
 }
 for(const x of [poolX0,poolX1])openRail(p,[x,3.4,poolZ0],[x,3.4,poolZ1],white);
 // Join the raised pool/hall concourse to the back of the west stand.
 // Derive the stand edge from its registered anchor rather than moving
 // either the running track or the independently traced basketball courts.
 const track=buildings.find(v=>v.id==='b-central-track')!,origin=toWorld(b.position),target=toWorld(track.position);
 const dx=target[0]-origin[0],dz=target[1]-origin[1],tx=dx*Math.cos(b.rotation)-dz*Math.sin(b.rotation);
 const standBack=tx-track.depth/2-2.8-22*.86;
 const deckX=w*.78,deckEnd=standBack-1,deckZ0=-d*.63,deckZ1=poolZ1;
 if(deckEnd>deckX){
  p.box(deckEnd-deckX,.75,deckZ1-deckZ0,(deckX+deckEnd)/2,3,(deckZ0+deckZ1)/2,white);
  gymUpperSlab(p,w,d,deckX,deckEnd,deckZ0,deckZ1,.45);
  // Upper deck links directly into the back of the stand. Columns preserve
  // the lower concourse rather than filling the whole platform down to grade.
  for(let x=deckX+1;x<deckEnd;x+=8)for(let z=deckZ0+1;z<deckZ1;z+=10)p.box(.48,gymPlatformY-3.825,.48,x,(gymPlatformY+2.925)/2,z,slab);
  for(const z of [deckZ0,deckZ1]){
   openRail(p,[deckX,gymPlatformY,z],[deckEnd,gymPlatformY,z],white);
   openRail(p,[deckX,3.4,z],[deckEnd,3.4,z],white);
   for(let x=deckX;x<deckEnd;x+=6)p.box(.5,2.625,.5,x,1.3125,z,slab);
  }
 }
 for(let i=0;i<8;i++)p.box(w*.58,.32,.72,-w*.07,.4+i*.38,d*.84-i*.75,white);
 grandstand(b,p);
 makeTrackGallery(p,tx,dx*Math.sin(b.rotation)+dz*Math.cos(b.rotation),track.width,track.depth,w);
}

function ellipseBand(p:Parts,rx:number,rz:number,a0:number,a1:number,r0:number,r1:number,y0:(t:number)=>number,y1:(t:number)=>number,color:string){
 const v:number[]=[],ix:number[]=[];const n=64;
 for(let i=0;i<=n;i++){const t=i/n,a=a0+(a1-a0)*t;v.push(rx*Math.cos(a)*r0,y0(t),rz*Math.sin(a)*r0,rx*Math.cos(a)*r1,y1(t),rz*Math.sin(a)*r1);if(i<n){const k=i*2;ix.push(k,k+1,k+2,k+1,k+3,k+2);}}
 surface(p,v,ix,color,true);
}
export function makeCricket(b:Building,p:Parts){
 const rx=b.width*.47,rz=b.depth*.46;
 const lawn=new T.Shape();lawn.absellipse(0,0,rx,rz,0,Math.PI*2,false,0);p.add(new T.ShapeGeometry(lawn,96),'#8ba25f',[0,.85,0],[-Math.PI/2,0,0]);
 // Mowing bands clipped to the oval; no football goals or penalty boxes.
 for(let band=0;band<12;band++){
  const lo=-rz+band*rz/6,hi=lo+rz/6,pts:[number,number][]=[];
  for(let k=0;k<=10;k++){const z=lo+(hi-lo)*k/10;pts.push([rx*Math.sqrt(Math.max(0,1-z*z/(rz*rz))),z]);}
  for(let k=10;k>=0;k--){const z=lo+(hi-lo)*k/10;pts.push([-rx*Math.sqrt(Math.max(0,1-z*z/(rz*rz))),z]);}
  const s=new T.Shape();pts.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();p.add(new T.ShapeGeometry(s),band%2?'#91a85e':'#7f9854',[0,.9,0],[-Math.PI/2,0,0]);
 }
 line(p,ellipse(rx*.975,rz*.975,1.08),.23);line(p,ellipse(rx*.36,rz*.39,1.08),.19);
 p.box(16,.09,2.9,0,1.03,0,'#bdad73');for(const side of [-1,1]){p.box(.15,.08,5.1,side*7.6,1.14,0,white);p.box(2.1,.08,.14,side*7.6,1.14,-1.8,white);p.box(2.1,.08,.14,side*7.6,1.14,1.8,white);for(const z of [-.23,0,.23])p.box(.08,.7,.08,side*7.4,1.45,z,white);}
 // Continuous low oval boundary with two different sculptural grandstands.
 ellipseBand(p,rx,rz,0,Math.PI*2,1.015,1.07,()=>.55,()=>1.8,slab);
 line(p,ellipse(rx*1.07,rz*1.07,1.9),.65,white);
 const start=Math.PI*1.09,end=Math.PI*1.92;
 for(let row=0;row<8;row++)ellipseBand(p,rx,rz,start+.025,end-.025,1.025+row*.016,1.04+row*.016,()=>1+row*.6,()=>1+row*.6,row%2?'#bd6438':'#c97a41');
 for(let i=0;i<=8;i++){const a=start+(end-start)*i/8;p.beam([rx*1.025*Math.cos(a),1,rz*1.025*Math.sin(a)],[rx*1.17*Math.cos(a),6.0,rz*1.17*Math.sin(a)],.7,'#dfc39d');}
 const height=(t:number)=>3+10*Math.pow(Math.sin(Math.PI*t),.9);
 ellipseBand(p,rx,rz,start-.14,end+.12,1.03,1.22,t=>height(t)-1.1,t=>height(t),white);
 // Back shell closes the outer edge, leaving the orange seating open in front.
 ellipseBand(p,rx,rz,start-.14,end+.12,1.22,1.225,()=>.4,t=>height(t),'#bec5bd');
 // Lower crescent on the opposite side: white lip and a broad grey outer face.
 const frontStart=.08*Math.PI,frontEnd=.92*Math.PI;
 ellipseBand(p,rx,rz,frontStart,frontEnd,1.025,1.18,t=>1.4+3.5*Math.sin(Math.PI*t),t=>1.6+6*Math.sin(Math.PI*t),white);
 ellipseBand(p,rx,rz,frontStart,frontEnd,1.18,1.185,()=>.35,t=>1.6+6*Math.sin(Math.PI*t),'#b9c1bc');
 for(const a of [start+.1,end-.1]){const x=rx*1.12*Math.cos(a),z=rz*1.12*Math.sin(a);p.cylinder(.32,6,x,3,z,white,.32,10);}
}
