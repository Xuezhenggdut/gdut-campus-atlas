import {studentDorm} from './studentDorm';
import {technologyBuilding,structureBuilding} from './technologyBuildings';
import {makeGym,makeCricket} from './sportsLandmarks';
import {makeEntranceOffice,makeSouthGate} from './southEntrance';
import {detailedDining,detailedTeaching,conference} from './pdfDetails';
import * as T from 'three';
import {makeCulture} from './culture';
import libraryInscription from '../data/library-inscription.json';
import {makeLibraryRoof} from './libraryRoof';
import {libraryStairs} from './libraryStairs';
import {makeOutdoorCourts} from './outdoorCourts';
import {researchBuilding} from './researchBuildings';
import {campusPlaza} from './campusPlazas';
import {Parts,flatPolygon,pathMesh} from './geometry';
import {type Building,toWorld} from '../data/campus';
const ivory='#eee9dc',glass='#45626a',concrete='#c7c9bb',roof='#dedfce',dark='#647879',wood='#a87555';
function windows(p:Parts,w:number,d:number,h:number,floors:number,color=glass){const nx=Math.max(3,Math.round(w/5)),nz=Math.max(2,Math.round(d/5));for(let f=0;f<floors;f++){const y=3+(h-4)*(f+.5)/floors;for(let i=0;i<nx;i++){const x=-w/2+(i+.5)*w/nx;p.box(w/nx*.55,1.6,.22,x,y,d/2+.15,color);p.box(w/nx*.55,1.6,.22,x,y,-d/2-.15,color);}for(let j=0;j<nz;j++){const z=-d/2+(j+.5)*d/nz;p.box(.22,1.6,d/nz*.55,w/2+.15,y,z,color);p.box(.22,1.6,d/nz*.55,-w/2-.15,y,z,color);}}}
// Photo review 2026-09-18: continuous neutral metal cladding with recessed
// balcony openings, rather than a field of projecting colored cubes.
// Rows below run from roof down. Opening placement remains an interpretation.
const libraryFaces=[
 ['001110011100','111110011100','111100111111','110011111001','111110011111','001111100111'],
 ['001111111111','110010011001','111110011111','110010011001','111110011111','001111111001'],
 ['111100111100','001100111111','111111001100','111001111111','001111100111','111100111100'],
 ['001111001111','111100001111','001111111100','111100111111','111111001100','001100111111']
];
function library(b:Building,p:Parts){const w=b.width,d=b.depth,h=b.height,base=10,body=h-base,step=body/6;
 p.box(w+19,1.1,d+19,0,.55,0,'#c6c4b8');
 p.box(w*.76,base-2,d*.72,0,base/2,0,'#4e6263');
 p.box(w*.90,body-1,d*.90,0,base+body/2,0,'#253c40');
 for(const x of [-w*.46,-w*.23,0,w*.23,w*.46])for(const z of [-d*.46,d*.46])p.box(1.25,base+2,1.25,x,(base+2)/2,z,'#e4e2d9');
 for(const z of [-d*.23,0,d*.23])for(const x of [-w*.46,w*.46])p.box(1.25,base+2,1.25,x,(base+2)/2,z,'#e4e2d9');
 // Corner shafts continue behind the cladding and remain exposed in the
 // stacked corner terrace openings, as in the side photograph.
 for(const x of [-w*.49,w*.49])for(const z of [-d*.49,d*.49])p.box(.8,h,.8,x,h/2,z,'#e4e2d9');
 const accents=['#d6a04c','#719783','#6a9fae','#dfdacf'];
 libraryFaces.forEach((rows,side)=>{const fw=side%2?d:w,dep=(side%2?w:d)/2,cw=fw/12,angle=side*Math.PI/2,front=side===1;
  const box=(width:number,height:number,depth:number,u:number,y:number,v:number,color:string)=>p.box(width,height,depth,Math.cos(angle)*u+Math.sin(angle)*v,y,-Math.sin(angle)*u+Math.cos(angle)*v,color,angle);
  rows.forEach((row,r)=>{const y=h-(r+.5)*step;
   for(let c=0;c<12;c++)if(row[c]==='1'){
    const u=-fw/2+(c+.5)*cw;
    // Daytime reference: a continuous square metal-panel grid, with subtle
    // reflective variation. Balcony voids are handled separately below.
    const shades=['#727d7d','#758181','#788383','#727d7d','#6f7c7e','#758181'];
    box(cw-.08,step-.08,.12,u,y,dep-.15,(c+r)%4?'#60777b':'#435d64');
    for(let j=0;j<3;j++)for(let k=0;k<3;k++){
     const x=u-cw/2+(j+.5)*cw/3,yy=y-step/2+(k+.5)*step/3;
     box(cw/3-.075,step/3-.075,.22,x,yy,dep+.12,shades[(c*11+j*3+k+r*5+side)%shades.length]);
    }
   }
   for(let c=0;c<12;){if(row[c]!=='0'){c++;continue;}const start=c;while(c<12&&row[c]==='0')c++;const count=c-start,u=-fw/2+(start+count/2)*cw,len=count*cw;
    box(len-.2,step-.3,.22,u,y,dep-3.5,'#354d50');
    for(let j=0;j<count*3;j++){
     const x=u-len/2+(j+.5)*len/(count*3);
     box(len/(count*3)*.72,.10,.12,x,y+step*.27,dep-3.34,'#99aaa5');
     box(.12,step-.4,.12,x,y,dep-3.30,'#647172');
    }
    box(len+.2,.4,4.2,u,y-step/2+.3,dep-1.1,'#c9c9c0');
    const central=front&&start===5&&count===2;const col=central?(['#d6a04c','#719783','#719783','#d6a04c','#dfdacf','#dfdacf'][r]):accents[(r+side)%accents.length];box(len,1.15,.25,u,y-step/2+1.05,dep+.7,col);
    for(let rail=0;rail<3;rail++)box(len,.11,.15,u,y-step/2+1.65+rail*.35,dep+.9,'#dedfd5');
   }
  });
  // Light rooftop railings; color appears at terraces and balcony bands.
  for(let r=0;r<7;r++)box(fw,.065,.12,0,h+.8+r*.32,dep,'#dedfd5');
  for(let i=0;i<=24;i++)box(.10,2.5,.12,-fw/2+i*fw/24,h+1.75,dep,'#dedfd5');
  // Glazed entrance beneath the raised upper body. Keep the stair platforms.
  const innerDep=side%2?w*.38:d*.36,span=fw*.70;
  for(let j=0;j<12;j++){
   const u=-span/2+(j+.5)*span/12;
   box(span/12-.18,7.2,.12,u,7.5,innerDep+.12,j%4?'#60777b':'#435d64');
   box(.12,8,.28,u-span/24,7.5,innerDep+.24,'#647172');
   box(span/12*.65,.12,.14,u,10.6,innerDep+.25,'#99aaa5');
  }
 });
 p.box(w,1,d,0,h,0,'#9b9d94');
 makeLibraryRoof(b,p);
 // Pale metal traditional calligraphic letters sit in front of the central white balcony rail.
 for(const [i,ch] of [...'圖書館'].entries()){
  const path=new T.ShapePath();
  for(const [op,...args] of libraryInscription.glyphs[ch as keyof typeof libraryInscription.glyphs]){
   const a=args as number[];
   if(op==='M')path.moveTo(a[0],a[1]);if(op==='L')path.lineTo(a[0],a[1]);
   if(op==='Q')path.quadraticCurveTo(a[0],a[1],a[2],a[3]);if(op==='C')path.bezierCurveTo(a[0],a[1],a[2],a[3],a[4],a[5]);if(op==='Z')path.currentPath?.closePath();
  }
  const letter=new T.ExtrudeGeometry(path.toShapes(false),{depth:libraryInscription.em*.045,bevelEnabled:false,curveSegments:5});letter.scale(3.2/libraryInscription.em,3.2/libraryInscription.em,3.2/libraryInscription.em);
  letter.computeBoundingBox();const bounds=letter.boundingBox!;
  const centre=(bounds.min.x+bounds.max.x)/2;
  p.add(letter,'#b7b291',[w/2+1.18,base+step+.35-bounds.min.y,3.2-i*3.2+centre],[0,Math.PI/2,0]);
  for(const dz of [-1.4,1.4])p.box(.07,3.25,.07,w/2+1.05,base+step+1.95,3.2-i*3.2+dz,'#dedfd5');
  for(const dy of [0,3.2])p.box(.07,.07,2.8,w/2+1.05,base+step+.35+dy,3.2-i*3.2,'#dedfd5');
 }
 // All visible approaches are raised flights with open space beneath.
 libraryStairs(p,w,d,1,[-d*.31,0,d*.31],d*.25);
 libraryStairs(p,w,d,0,[-w*.29,w*.29],w*.26);
 libraryStairs(p,w,d,3,[-d*.30,0,d*.30],d*.23);
 libraryStairs(p,w,d,2,[-w*.29,w*.29],w*.26);
}
function colonnade(p:Parts,w:number,d:number,h:number){for(let x=-w/2;x<=w/2+.1;x+=w/8){p.box(.85,h,.85,x,h/2,d/2+1.2,ivory);p.box(.85,h,.85,x,h/2,-d/2-1.2,ivory);}p.box(w+2,1.2,d+4,0,h,0,ivory);}
function academic(b:Building,p:Parts){if(/^b-(innovation|truth|virtue)-/.test(b.id)){technologyBuilding(b,p);return;}if(b.id==='b-structure-lab'){structureBuilding(b,p);return;}if(b.kind==='engineering'||/^b-lab-[1-4]$/.test(b.id)){researchBuilding(b,p);return;}const {width:w,depth:d,height:h}=b; const open=b.kind==='teaching';
 if(open){p.box(w*.94,h-5,d*.82,0,5+(h-5)/2,0,b.color);p.box(w*.88,3,d*.5,0,2.5,0,glass);colonnade(p,w,d,h+1);windows(p,w*.94,d*.82,h,b.floors);for(let f=1;f<b.floors;f++)p.box(w+1,.65,d+1,0,5+f*(h-5)/b.floors,0,ivory);}
 else{p.box(w,h,d,0,h/2,0,b.color);windows(p,w,d,h,b.floors);p.box(w+2,1.3,d+2,0,h,0,ivory);}
 for(const x of [-w*.35,w*.35]){p.box(3.4,h+3,d+2,x,(h+3)/2,0,ivory);p.box(2.3,h-2,.3,x,h/2,d/2+1.2,glass);}
 p.box(w*.28,1.1,d*.7,0,h+1.2,0,concrete);p.box(w*.2,1.3,6,0,4,d/2+2.5,ivory);
 if(b.kind==='teaching'){for(let i=0;i<3;i++)p.box(w*.15,2.8,d*.28,-w*.32+i*w*.32,h+2,0,roof);}
}
function teaching(b:Building,p:Parts){const {width:w,depth:d,height:h}=b;for(let i=0;i<3;i++){const x=(i-1)*w*.335;p.box(w*.29,h,d, x,h/2,0,ivory);for(let f=1;f<5;f++){p.box(w*.29,.7,d+1,x,f*h/5,0,'#87a38b');for(const sign of [-1,1])for(let j=0;j<4;j++)p.box(w*.045,1.7,.2,x+(j-1.5)*w*.062, f*h/5+1.7,sign*(d/2+.15),'#849a9d');}p.box(w*.3,.8,d+1,x,h+.5,0,roof);p.box(w*.08,1.2,d*.4,x,h+1.4,0,concrete);}
 for(const x of [-w*.17,w*.17])for(let f=1;f<5;f++)p.box(w*.12,.55,d*.33,x,f*h/5,0,ivory);
}
function dorm(b:Building,p:Parts){if(/^b-(east|west)-dorm-/.test(b.id)){studentDorm(b,p);return;}const {width:w,depth:d,height:h}=b;p.box(w,h,d,0,h/2,0,b.color);windows(p,w,d,h,b.floors);for(let i=1;i<b.floors;i++){p.box(w+1,.45,d+1,0,i*h/b.floors,0,ivory);p.box(w,1.2,.5,0,i*h/b.floors+1.3,d/2+1.2,ivory);}p.box(w+2,1.3,d+2,0,h,0,ivory);p.box(w*.22,2.8,d*.45,0,h+1.6,0,concrete);for(const x of [-w*.32,w*.32])p.box(1.3,h,d+1,x,h/2,0,ivory);}
function dining(b:Building,p:Parts){const {width:w,depth:d,height:h}=b;if(b.id==='b-east-dining-1'){p.box(w*.84,h,d*.85,0,h/2,0,b.color);windows(p,w*.84,d*.85,h,4);for(let f=0;f<=4;f++)p.box(w+3,1.3,d+3,0,2+f*(h-2)/4,0,ivory);p.box(w*.55,2.2,d*.5,0,h+2,0,roof);}else{p.box(w*.65,h,d*.7,0,h/2,0,ivory);for(const x of [-w*.27,w*.27]){p.cylinder(d*.39,h,x,h/2,0,b.color);p.cylinder(d*.41,1.2,x,h,0,ivory);for(let f=1;f<=3;f++)p.cylinder(d*.395,.6,x,h*f/3,0,concrete);}windows(p,w*.68,d*.7,h,3);p.box(w*.7,1.5,d*.25,0,h+1.6,0,roof);}}
function culture(b:Building,p:Parts){const {width:w,depth:d}=b;const h=b.height*.7;p.box(w*.72,h,d*.69,0,h/2,0,glass);for(const x of [-w*.36,w*.36]){p.box(w*.21,h*.9,d*.9,x,h*.45,0,ivory);p.box(w*.3,1.7,d*1.06,x,h+.4,0,roof);}colonnade(p,w*.87,d*.74,h);p.box(w*.66,1.2,d*.78,0,h+1,0,ivory);p.box(w*.53,4.2,d*.48,0,h+3, -d*.12,concrete);p.box(w*.56,1.1,d*.51,0,h+5.3,-d*.12,ivory);for(let i=0;i<8;i++)p.box(w*.74,.65,1.6,0,.6+i*.6,d*.65-i*1.4,ivory);}
function gate(b:Building,p:Parts){const {width:w,height:h}=b;if(b.id!=='b-south-gate'){for(const x of [-w*.4,w*.4])p.box(1.5,4,2.2,x,2,0,ivory);p.box(w,.4,1,0,1,0,concrete);return;}
 makeSouthGate(b,p);
}

function trackPoints(w:number,d:number){const pts:[number,number][]=[];const r=d/2,straight=Math.max(0,w/2-r);for(let i=0;i<=32;i++){const a=-Math.PI/2+i*Math.PI/32;pts.push([straight+Math.cos(a)*r,Math.sin(a)*r]);}for(let i=0;i<=32;i++){const a=Math.PI/2+i*Math.PI/32;pts.push([-straight+Math.cos(a)*r,Math.sin(a)*r]);}pts.push(pts[0]);return pts;}
function trackShape(w:number,d:number){const s=new T.Shape();trackPoints(w,d).forEach(([x,z],i)=>i?s.lineTo(x,z):s.moveTo(x,z));return s;}
function football(b:Building,p:Parts,group:T.Group){
 const {width:w,depth:d}=b;
 p.box(w,.45,d,0,.65,0,'#63835c');
 for(let i=0;i<10;i++)p.box(w/10,.06,d*.94,-w/2+(i+.5)*w/10,.9,0,i%2?'#769661':'#6b8e5e');
 const length=w*.9,breadth=d*.86;
 for(const z of [-breadth/2,breadth/2])p.box(length,.07,.2,0,1,z,ivory);
 for(const x of [-length/2,0,length/2])p.box(.2,.07,breadth,x,1,0,ivory);
 group.add(pathMesh(Array.from({length:49},(_,i)=>[Math.cos(i*Math.PI/24)*d*.14,Math.sin(i*Math.PI/24)*d*.14] as [number,number]),.18,ivory,1.05));
 for(const side of [-1,1]){
  for(const [inset,span] of [[w*.14,d*.52],[w*.05,d*.24]]){
   p.box(.18,.07,span,side*(length/2-inset),1,0,ivory);
   for(const z of [-span/2,span/2])p.box(inset,.07,.18,side*(length/2-inset/2),1,z,ivory);
  }
  for(const z of [-d*.08,d*.08])p.beam([side*length/2,1,z],[side*length/2,3.2,z],.16,ivory);
  p.box(.16,.16,d*.16,side*length/2,3.2,0,ivory);
 }
}
function sports(b:Building,p:Parts,group:T.Group){const {width:w,depth:d}=b;
 if(b.id==='b-courts-west'||b.id==='b-courts-south'){makeOutdoorCourts(b,p,group);return;}
 if(b.id==='b-library-football'){football(b,p,group);return;}
 if(b.id==='b-courts-library'){
  p.box(w,.5,d,0,.3,0,'#7c9599');
  for(let i=0;i<3;i++)for(let j=0;j<2;j++){
   const x=-w/2+(i+.5)*w/3,z=-d/2+(j+.5)*d/2,cw=w/3*.9,cd=d/2*.84;
   p.box(cw,.2,cd,x,.7,z,'#657e91');
   for(const sign of [-1,1]){p.box(cw,.08,.14,x,.86,z+sign*cd/2,ivory);p.box(.14,.08,cd,x+sign*cw/2,.86,z,ivory);}
   p.box(cw,.08,.14,x,.86,z,ivory);
   group.add(pathMesh(Array.from({length:33},(_,k)=>[x+Math.cos(k*Math.PI/16)*cw*.17,z+Math.sin(k*Math.PI/16)*cw*.17] as [number,number]),.13,ivory,.9));
   for(const sign of [-1,1]){
    const end=z+sign*cd/2;p.box(cw*.4,.08,.14,x,.86,end-sign*cd*.18,ivory);
    for(const side of [-1,1])p.box(.14,.08,cd*.18,x+side*cw*.2,.86,end-sign*cd*.09,ivory);
    p.box(.13,1.8,.13,x,1.4,end,ivory);p.box(cw*.18,.7,.12,x,2.4,end-sign*.2,ivory);
    group.add(pathMesh(Array.from({length:33},(_,k)=>{const a=k*Math.PI/32;return [x+Math.cos(a)*cw*.40,end-sign*Math.sin(a)*cw*.4] as [number,number];}),.13,ivory,.9));
   }
  }return;
 }
 if(b.kind==='field'){const isCricket=b.id==='b-cricket';const outer=isCricket?new T.Shape():trackShape(w,d);if(isCricket)outer.absellipse(0,0,w/2,d/2,0,Math.PI*2,false,0);p.add(new T.ShapeGeometry(outer,48),isCricket?'#7d9e64':'#b87965',[0,.8,0],[-Math.PI/2,0,0]);const inner=isCricket?new T.Shape():trackShape(w*.78,d*.68);if(isCricket)inner.absellipse(0,0,w*.39,d*.34,0,Math.PI*2,false,0);p.add(new T.ShapeGeometry(inner,48),'#83a373',[0,.95,0],[-Math.PI/2,0,0]);for(let i=0;i<8&&!isCricket;i++){const points=trackPoints(w-1.9-i*1.9,d-1.9-i*1.9);group.add(pathMesh(points,.25,'#eadccb',1.01));}p.box(w*.54,.1,.3,0,1.1,-d*.24,ivory);p.box(w*.54,.1,.3,0,1.1,d*.24,ivory);for(const x of [-w*.27,w*.27,0])p.box(.3,.1,d*.48,x,1.1,0,ivory);
 const circle=Array.from({length:49},(_,i)=>[Math.cos(i*Math.PI/24)*d*.11,Math.sin(i*Math.PI/24)*d*.11] as [number,number]);group.add(pathMesh(circle,.16,ivory,1.12));for(const side of [-1,1]){p.box(.18,.1,d*.27,side*w*.18,1.12,0,ivory);for(const z of [-d*.135,d*.135])p.box(w*.09,.1,.18,side*w*.225,1.12,z,ivory);p.beam([side*w*.27,1.15,-d*.06],[side*w*.27,3.2,-d*.06],.15,ivory);p.beam([side*w*.27,1.15,d*.06],[side*w*.27,3.2,d*.06],.15,ivory);p.box(.16,.16,d*.12,side*w*.27,3.2,0,ivory);}
 
 }else{p.box(w,.5,d,0,.3,0,'#8c9d8a');const cols=3,rows=2;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=-w/2+(i+.5)*w/cols,z=-d/2+(j+.5)*d/rows,cw=w/cols*.86,cd=d/rows*.86;p.box(cw,.3,cd,x,.7,z,b.id==='b-tennis'?'#8baf91':'#7298a1');for(const k of [-1,1]){p.box(cw,.1,.28,x,1,z+k*cd*.43,ivory);p.box(.28,.1,cd*.86,x+k*cw*.44,1,z,ivory);}p.box(.25,.1,cd*.86,x,1,z,ivory);}}
}
export function makeBuilding(b:Building,detailed=true){const group=new T.Group();group.name=b.id;group.userData={buildingId:b.id,placeIds:b.placeIds,heightBasis:b.heightBasis};const [x,z]=toWorld(b.position);group.position.set(x,1,z);group.rotation.y=b.rotation;
 if(b.kind==='lake')return group;
 const p=new Parts();if(!detailed&& !['field','court','plaza'].includes(b.kind)){p.box(b.width,b.height,b.depth,0,b.height/2,0,b.color);}else switch(b.kind){case 'library':library(b,p);break;case 'teaching':detailedTeaching(b,p);break;case 'office':if(['b-admin','b-comprehensive'].includes(b.id))makeEntranceOffice(b,p);else academic(b,p);break;case 'gate':gate(b,p);break;case 'gym':makeGym(b,p);break;case 'culture':if(b.id==='b-culture')makeCulture(b,p);else if(b.id==='b-conference')conference(b,p);else culture(b,p);break;case 'dorm':dorm(b,p);break;case 'dining':detailedDining(b,p);break;case 'field':case 'court':if(b.id==='b-cricket')makeCricket(b,p);else sports(b,p,group);break;case 'plaza':campusPlaza(b,p,group);break;default:academic(b,p);}
 group.add(p.finish());return group;
}



