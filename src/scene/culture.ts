import * as T from 'three';
import {Parts} from './geometry';
import inscription from '../data/culture-inscription.json';
import type {Building,Point} from '../data/campus';

const stone='#e3e5dd',white='#f1f0e6',glass='#416973',frame='#b4c6c3',roof='#c8cbc2';
function solid(p:Parts,points:Point[],height:number,y:number,color:string){
 const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:false,curveSegments:36});g.rotateX(-Math.PI/2);p.add(g,color,[0,y,0]);
}
function band(p:Parts,points:Point[],y:number,width:number,height:number,color:string){
 for(let i=1;i<points.length;i++){const [x,z]=points[i-1],[xx,zz]=points[i];p.box(Math.hypot(xx-x,zz-z)+.06,height,width,(x+xx)/2,y,(z+zz)/2,color,-Math.atan2(zz-z,xx-x));}
}
function rail(p:Parts,points:Point[],y:number){
 for(const h of [.2,.65,1.05])band(p,points,y+h,.09,.09,white);
 points.filter((_,i)=>i%3===0).forEach(([x,z])=>p.box(.1,1.1,.1,x,y+.55,z,white));
}

/** Front is local +Z. PDF forecourt faces 挑战路; culture-2/3/5 verify
 * the two curved glazed bays, long canopy, stepped auditorium and rooflights.
 * Dimensions are schematic proportions, not surveyed meters. */
export function makeCulture(b:Building,p:Parts){
 const w=b.width,d=b.depth,h=b.height,plinth=2.8,canopy=h*.67,body=canopy-plinth;
 const profile=[[-.5,.14],[-.48,.29],[-.38,.38],[-.25,.42],[-.12,.39],[0,.28],[.13,.26],[.3,.34],[.43,.32],[.5,.17]];
 const spline=new T.CatmullRomCurve3(profile.map(([x,z])=>new T.Vector3(x*w,0,z*d)),false,'centripetal');
 const front:Point[]=spline.getPoints(72).map(v=>[v.x,v.z]);
 const outline:Point[]=[[-w*.5,-d*.46],[w*.5,-d*.46],...front.slice().reverse()];
 // Continuous curved glazed building with a raised approach, not three boxes.
 solid(p,outline,plinth,0,'#b6bfb7');solid(p,outline,body*.48,plinth,glass);
 const leftUpper:Point[]=[[-w*.5,-d*.46],[front[38][0],-d*.46],...front.slice(0,39).reverse()];
 solid(p,leftUpper,body*.52,plinth+body*.48,glass);
 p.box(w*.45,body*.52,d*.56,w*.275,plinth+body*.74,-d*.18,stone);
 const closed=[...outline,outline[0]];band(p,closed,plinth+.18,.3,.35,stone);
 // Rear and side walls are restrained; visible curved front is individually framed.
 p.box(w*.98,body,d*.12,0,plinth+body/2,-d*.40,'#cfd4c7');
 const mid=plinth+body*.48;
 // Recessed cream upper gallery behind the right-hand wavy balcony.
 p.box(w*.43,canopy-mid-.45,d*.20,w*.265,(mid+canopy)/2,-d*.02,stone);
 for(let i=0;i<9;i++)p.box(.18,body,.20,-w*.46+i*w*.115,plinth+body/2,d*.11,white);
 for(const y of [plinth+.6,mid,canopy-.35])band(p,front,y,.38,.35,white);
 front.filter((_,i)=>i%2===0).forEach(([x,z])=>p.box(.13,body,.17,x,plinth+body/2,z+.08,frame));
 for(const [a,c] of [[0,20],[43,72]]){const section=front.slice(a,c+1).map(([x,z])=>[x,z+1.3] as Point);band(p,section,mid+.1,2.1,.32,stone);rail(p,section,mid+.3);}
 // Tall white supports carry a single broad, thin canopy.
 const columns=[[-.49,.43],[-.32,.46],[-.12,.46],[.06,.43],[.26,.43],[.46,.43],[-.49,-.4],[.49,-.4]];
 columns.forEach(([x,z])=>p.cylinder(.35,canopy,x*w,canopy/2,z*d,white,.35,10));
 p.box(w*1.08,.5,d*1.06,0,canopy+.2,0,white);
 p.box(w*1.035,.16,d*1.015,0,canopy+.53,0,roof);
 const perimeter:Point[]=[[-w*.53,-d*.52],[w*.53,-d*.52],[w*.53,d*.52],[-w*.53,d*.52],[-w*.53,-d*.52]];
 rail(p,perimeter,canopy+.55);
 // Auditorium on the left of the frontal photograph, rounded toward the forecourt.
 const ax=-w*.18,aw=w*.46,ad=d*.67,round:Point[]=[];
 round.push([ax-aw/2,-ad/2],[ax+aw/2,-ad/2],[ax+aw/2,ad*.18]);
 for(let i=0;i<=28;i++){const a=i*Math.PI/28;round.push([ax+Math.cos(a)*aw/2,ad*.18+Math.sin(a)*ad*.25]);}
 solid(p,round,h*.18,canopy+.55,'#d0d5d0');solid(p,round,.18,canopy+h*.18+.56,'#b9bfb8');
 p.box(aw,h*.17,d*.28,ax,canopy+h*.18+.65+h*.085,-d*.29,stone);
 p.box(aw+.2,.2,d*.28+.2,ax,h+.75,-d*.29,roof);
 for(const x of [ax-aw*.43,ax+aw*.43])p.box(.55,.75,.15,x,h-.2,ad*.08,'#50676c');
 // Long sloping glass rooflight beside the auditorium. Slope is toward rear.
 const sx=w*.15,sw=w*.16,z0=-d*.45,z1=d*.42,low=canopy+.6,high=canopy+h*.2;
 const verts=[sx-sw/2,high,z0,sx+sw/2,high,z0,sx+sw/2,low,z1,sx-sw/2,low,z1,sx-sw/2,low,z0,sx+sw/2,low,z0];
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex([0,3,2,0,2,1,0,4,3,1,2,5,0,1,5,0,5,4]);g.computeVertexNormals();p.add(g,'#769ba2');
 for(let j=0;j<=16;j++){const t=j/16,z=z0+(z1-z0)*t,y=high+(low-high)*t;p.box(sw+.2,.11,.13,sx,y+.05,z,frame);}
 for(const x of [sx-sw/2,sx,sx+sw/2])p.beam([x,high,z0],[x,low,z1],.13,frame);
 // Small service roof and side lighting panels visible in the aerial image.
 p.box(w*.09,1.25,d*.10,-w*.015,canopy+1.18,d*.20,stone);
 p.box(w*.092,.15,d*.103,-w*.015,canopy+1.86,d*.20,roof);
 // Curved entry steps follow the first glazed bay; the right bay has its own flight.
 for(let j=0;j<9;j++){const t=j/9,y=1.3+j*(plinth-1.2)/9;const section=front.slice(2,38).map(([x,z])=>[x,z+(1-t)*5.5+.25] as Point);band(p,section,y,1,.19,stone);}
 for(let j=0;j<9;j++)p.box(w*.24,.19,.7,w*.34,1.3+j*(plinth-1.2)/9,d*.35+5.5-j*.6,stone);
 // The formal approach contains a rectangular lawn and two paved walks.
 const frontZ=d*.55,foreD=d*.64;p.box(w*.94,1.25,foreD,0,.625,frontZ+foreD/2,'#d3d6cb');
 p.box(w*.41,.09,foreD*.74,-w*.03,1.31,frontZ+foreD*.54,'#8aab65');
 for(const x of [-w*.36,w*.31]){p.box(w*.21,.10,foreD,x,1.34,frontZ+foreD/2,stone);for(const dx of [-.07,.07])p.box(.28,.03,foreD,x+dx*w,1.41,frontZ+foreD/2,'#9ca69b');}
 for(const x of [-w*.36,w*.31])for(let j=0;j<8;j++)p.box(w*.22,1.2-j*.14,.85,x,(1.2-j*.14)/2,frontZ+foreD+j*.7,stone);
 // Letters occupy the central lawn above the approach stairs; their tops
 // lean back toward the building (local -Z), as in the entrance photograph.
 const letterSize=w*.053,spacing=letterSize*1.2;
 Object.values(inscription.glyphs).forEach((commands,i)=>{
  const path=new T.ShapePath();
  for(const [op,...args] of commands){const a=args as number[];if(op==='M')path.moveTo(a[0],a[1]);if(op==='L')path.lineTo(a[0],a[1]);if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);if(op==='Z')path.currentPath?.closePath();}
  const g=new T.ExtrudeGeometry(path.toShapes(false),{depth:inscription.em*.14,bevelEnabled:false,curveSegments:5});
  g.scale(letterSize/inscription.em,letterSize/inscription.em,letterSize/inscription.em);
  g.rotateX(-Math.PI/9);
  g.computeBoundingBox();const bounds=g.boundingBox!;
  const centerX=(bounds.min.x+bounds.max.x)/2;
  p.add(g,'#f5f5ef',[-w*.03+(i-2.5)*spacing-centerX,1.355-bounds.min.y,frontZ+foreD*.40]);
 });
 // Roof drainage/parapet seams retain detail without photo textures.
 for(let j=0;j<6;j++)p.box(w*.31,.025,.1,w*.33,canopy+.63,-d*.4+j*d*.15,'#b0b8ad');
}
