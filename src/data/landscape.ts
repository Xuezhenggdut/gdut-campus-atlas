import routeData from './road-routes.json';
import type {Point} from './campus';
import {researchRowOffset} from './campus';
import {unprojectMap,projectMap} from './projection';
const ground=(points:Point[])=>points.map(unprojectMap);
export const landPolygons:Point[][]=[
 [[389,73],[655,234],[554,397],[471,398],[197,343],[181,267],[194,160],[269,106]],
 [[907,289],[1092,411],[1159,536],[1229,735],[897,705],[764,590],[698,487],[723,443]],
 [[201,405],[480,461],[611,542],[704,650],[900,735],[1208,858],[1255,1236],[1121,1269],[793,1234],[589,1138],[395,1058],[201,927],[300,737],[311,594],[181,516]],
 ground([[-145,340],[-92,483],[140,488],[335,484],[520,439],[540,342],[300,334],[30,335]])
];
// Banks follow the outside of the library's full stair/forecourt envelope.
// Ground coordinates remain schematic; these are not roof or label positions.
export const lakePolygons:Point[][]=[ground([[21,319],[27,297],[95,293],[111,260],[111,190],[137,172],[186,197],[180,236],[203,282],[180,324],[188,353],[182,371],[162,369],[140,358],[108,354],[78,365],[44,375],[20,366],[12,347]]),ground([[175,267],[196,229],[195,202],[140,181],[113,164],[100,145],[95,125],[97,110],[107,108],[114,114],[116,135],[129,164],[164,186],[222,205],[310,240],[310,350],[278,362],[246,383],[216,380],[197,374],[190,350],[214,305]])];
// The entrance drive lies west of the stair garden and lower paved square.
// This footprint is also used to keep generated vegetation off the forecourt.
export const adminForecourt:Point[]=ground([[345,342],[434,342],[434,426],[345,446]]);
// Satellite crop: a broad dry forecourt separates the west steps from the
// shortened waterway head. Keep this space free of procedural trees.
export const libraryWestForecourt:Point[]=ground([[102,65],[158,65],[158,139],[132,133],[123,116],[118,98],[102,94]]);
export const lakeIsland:Point[]=[[416,927],[451,908],[487,928],[535,928],[586,890],[615,899],[625,933],[598,956],[578,972],[552,979],[527,999],[485,987],[466,970],[418,974],[396,958]];
// Residential waterways traced from the supplied official map, in its image coordinates.
export const canalWestRoad:Point[]=[[551,420],[605,380],[675,335],[739,303],[821,265],[882,235]];
export const canalEastRoad:Point[]=[[650,495],[695,450],[750,395],[815,337],[884,312],[947,299]];
const bank=(points:Point[],offset:number)=>points.map(p=>{const [x,z]=projectMap(p);return unprojectMap([x+offset,z]);});
export const residentialPark:Point[]=[...bank(canalWestRoad,17),...bank(canalEastRoad,-17).reverse()];
landPolygons.push(residentialPark);
// Map crop confirms 南二路公园: a western channel, a northern pond and
// substantial dry parkland. u runs west to east, t runs south to north.
export function parkPoint(u:number,t:number):Point{
 const n=Math.min(4,Math.floor(t*5)),f=Math.min(1,t*5-n);
 const sample=(a:Point[],offset:number)=>{const p=projectMap(a[n]),q=projectMap(a[n+1]);return [p[0]+(q[0]-p[0])*f+offset,p[1]+(q[1]-p[1])*f] as Point;};
 const a=sample(canalWestRoad,17),b=sample(canalEastRoad,-17);
 return unprojectMap([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]);
}
const parkShape=(points:Point[])=>points.map(([u,t])=>parkPoint(u,t));
export const residentialCanal:Point[]=parkShape([[.03,0],[.23,0],[.30,.07],[.24,.17],[.22,.29],[.34,.41],[.44,.51],[.68,.55],[.65,.58],[.39,.56],[.34,.65],[.4,.74],[.86,.78],[.88,.92],[.99,1],[.45,1],[.25,.96],[.08,.86],[.12,.74],[.14,.63],[.14,.48],[.10,.36],[.02,.23]]);
export const parkPaths:Point[][]=[
 parkShape([[0,.06],[0,.30],[0,.55],[0,.75],[0,.96],[.38,1]]),
 parkShape([[.92,0],[.93,.2],[.94,.4],[.94,.6],[.94,.8],[1,.98]]),
 parkShape([[.02,.12],[.35,.12],[.55,.08],[.85,.12],[.91,.25],[.67,.34],[.45,.27],[.35,.12]]),
 parkShape([[.03,.46],[.36,.46],[.52,.53],[.83,.49],[.9,.4],[.67,.34]]),
 parkShape([[.52,.53],[.48,.65],[.68,.70],[.91,.66],[.94,.8]]),
 parkShape([[.02,.77],[.47,.785],[.71,.792],[.94,.8]]),
 ...[.18,.38,.62,.70].map(t=>parkShape([[.83,t],[.94,t]])),
];
export const westPeripheralWater:Point[]=[[409,79],[350,94],[296,117],[253,148],[218,183],[195,210],[191,231],[180,253],[186,277],[179,309],[184,333],[201,345],[225,344],[246,336],[261,343],[275,354],[303,358],[271,380],[177,365],[166,354],[164,322],[164,287],[169,250],[179,213],[193,179],[215,146],[250,119],[293,98],[350,78],[403,65]];
export const residentialWaters=[residentialCanal,westPeripheralWater];
export const roadGuides:{points:Point[];width:number;main?:boolean;name?:string}[]=[
 {points:[[133,368],[336,398],[523,457],[702,582],[889,696],[1117,740],[1233,755]],width:25,main:true,name:'大学城中环西路'},
 {points:[[369,24],[430,95],[552,177],[701,253],[904,271],[1099,397],[1172,531],[1238,778],[1264,1267]],width:24,main:true},
 {points:[[195,169],[157,251],[176,341]],width:19,main:true},
 {points:[[177,520],[279,638],[290,741],[241,840],[224,926],[433,1058],[601,1147],[812,1242],[1118,1300],[1267,1267]],width:24,main:true,name:'大学城外环西路'},
 {points:[[584,1108],[649,1048],[721,977],[796,913],[876,851]],width:17,name:'创新大道'},
 {points:[[335,788],[503,755],[643,724],[814,701]],width:15,name:'知行大道'},
 {points:[[739,1085],[828,1103],[938,1162],[1175,1251]],width:13,name:'环教南路'},
 {points:[[918,765],[998,866],[1108,926],[1182,984]],width:14,name:'知行大道'},
 {points:[[700,685],[763,624],[825,562],[884,502],[987,446]],width:13},
 {points:[[811,714],[883,652],[949,587],[1090,504]],width:11},
 {points:[[971,722],[1025,667],[1084,606],[1140,557]],width:11},
 {points:[[779,508],[904,587],[1082,710]],width:10},
 {points:[[797,400],[909,470],[1068,564],[1179,666]],width:10},
 {points:[[240,167],[359,239],[461,298],[557,355]],width:11},
 {points:[[308,128],[414,193],[516,251],[602,299]],width:10},
 {points:[[395,92],[302,193],[354,296],[401,364]],width:9},
 {points:[[233,330],[332,340],[443,402],[545,403]],width:11},
 {points:[[297,533],[382,550],[466,599],[532,677],[618,693]],width:10},
 {points:[[858,922],[953,978],[1024,1041],[1123,1113]],width:9},
 {points:[[970,867],[1002,928],[909,1038],[832,1117]],width:9},
];
export const promenades:Point[][]=[ground([[55,350],[72,351],[100,325],[126,328],[147,319],[149,295],[160,275],[161,230],[142,216],[130,222],[126,260],[113,285],[86,301],[55,304],[49,325],[55,350]]),ground([[80,170],[87,145],[87,120],[91,102],[102,94]])];
export function inside([x,y]:Point,poly:Point[]){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}

// Refined centerlines keep the schematic corridors clear of building ground envelopes.
// Preserve the checked residential/external streets. Rebuild academic streets
// explicitly: shortest-path obstacle avoidance had created invented diagonals.
const retained=new Set([0,1]);
const route=(name:string,width:number,points:Point[])=>({name,width,points:ground(points)});
const rawRoads:typeof roadGuides=[...(routeData as typeof roadGuides).filter((_,i)=>retained.has(i)).map(r=>r===routeData[12]?{...r,points:r.points.map(([u,v])=>u===1064?[1069,572] as Point:[u,v] as Point)}:r),
 {name:'国医西路',width:19,main:true,points:[[411,53],[350,64],[288,84],[235,111],[196,149],[171,191],[151,237],[145,280],[148,323],[146,359]]},
 {name:'西区西门连接路',width:13,points:[[182,158],[196,169],[240,196],[268,213]]},
 {name:'国医东路',width:27,main:true,points:canalWestRoad},
 {name:'大学城广工二路',width:27,main:true,points:canalEastRoad},
 {name:'西区滨水路',width:8,points:[[216,183],[207,207],[207,228],[195,250],[195,281],[188,307],[192,329],[209,338],[235,334],[258,333],[277,342],[302,362]]},
 route('西区东西主路',9,[[-605,-190],[-510,-190],[-420,-190],[-330,-190],[-260,-197]]),
 route('西区宿舍中横路',8,[[-605,-233],[-510,-233],[-420,-233],[-330,-233],[-325,-237],[-260,-237]]),
 route('西区宿舍北横路',8,[[-592,-275],[-510,-275],[-420,-275],[-330,-275],[-260,-275]]),
 route('西区宿舍西纵路',8,[[-510,-310],[-510,-190]]),
 route('西区宿舍中纵路',8,[[-420,-275],[-420,-110]]),
 route('西区宿舍东纵路',9,[[-330,-354],[-330,-110]]),
 route('西区五六栋横路',7,[[-420,-151],[-330,-151]]),
 route('西三食堂南侧路',8,[[-420,-110],[-330,-110],[-294,-108],[-258,-122],[-252,-197]]),
 {...route('大学城外环西路',24,[[-530.169,20.742],[-501,42],[-485,86],[-453,114],[-395.859,120.160],[-246.901,164.178],[-171.521,240.009],[-130.845,343.709],[-78.789,470],[140,474],[335,470],[505,430],[738.451,272.911],[807.634,173.718]]),main:true},
 route('创新大道',14,[[335,-88],[335,367]]),
 route('南门内外道路连接段',14,[[335,367],[335,470]]),
 route('知行大道',12,[[25,45],[335,45],[435,45],[435,18],[559,18]]),
 route('知行大道（南1门段）',12,[[-360,130.8],[-300,140],[-200,140],[-100,140],[-35,140]]),
 // Supplied Amap crop: 环教北路 is the internal campus street running
 // parallel to (and south of) the public 大学城中环西路.
 route('环教北路',10,[[-260,-59.08235294117654],[-200,-66],[-130,-66],[-60,-66],[40,-66],[97,-50],[97,-29],[190,-29],[280,-29],[335,-29]]),
 route('教学区—东区北联络路',10,[[25,-50],[97,-50],[140,-50]]),
 // The gym/tennis connector meets 环教北路, not the external middle ring.
 route('体育馆—网球场连接路',9,[[-249,-156],[-255,-118],[-260,-66],[-260,18],[-260,50],[-260,82],[-260,140]]),
 route('求是路',9,[[397,45],[397,278]]),
 route('明德路',10,[[495,18],[495,350]]),
 route('博雅路',9,[[600,18],[600,278]]),
 ...[110,168,225,278].map((z,i)=>route(i===1?'研学二路':'科研楼组团横向道路',8,[[397,z+researchRowOffset],[495,z+researchRowOffset],[600,z+researchRowOffset]])),
 route('环教路',12,[[25,45],[-35,75],[-35,115],[-35,236],[-20,290],[-17,342],[-6,365],[14,382],[45,390],[80,380],[108,370],[137,373],[165,389],[191,397],[218,398],[249,402],[283,381],[310,367],[335,367]]),
 route('东侧环教路',12,[[495,350],[518,357],[540,357],[650,285],[690,255],[710,240],[700,165],[660,18],[564,18]]),
 route('挑战路',10,[[97,-226],[97,-140],[97,-93],[97,-50],[97,45]]),
 route('东苑西侧路',8,[[0,-352],[0,-140],[12,-132],[125,-132],[125,-350]]),
 route('东苑二路',8,[[125,-405],[125,-132]]),
 route('东苑一横路',8,[[0,-226],[235,-226]]),
 route('东苑三横路',8,[[125,-328],[210,-328]]),
 route('东区宿舍南侧路',8,[[-90,-140],[0,-140],[97,-140],[125,-140],[230,-140]]),
 route('东区宿舍横路',7,[[-85,-268],[0,-268]]),
 route('东区宿舍横路',7,[[125,-263],[235,-263]]),
 route('东区宿舍横路',7,[[125,-293],[235,-293]]),
 route('东区宿舍东西通道',8,[[-90,-268],[0,-268],[125,-268]]),
 route('教学楼组团横向道路',8,[[97,-29],[335,-29],[519,-29]]),
];

// Remove the annotated middle-ring frontage spurs, including their junctions.
// Clip only this frontage; preserve the residential streets farther inside.
const middleRing=rawRoads[0].points.map(projectMap);
function ringDistance(p:Point){
 return Math.min(...middleRing.slice(1).map((b,i)=>{
  const a=middleRing[i],dx=b[0]-a[0],dz=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
 }));
}
export const roads:typeof roadGuides=rawRoads.flatMap((road,index)=>{
 if(road.name==='国医东路'||road.name==='大学城广工二路'){
  const p=projectMap(road.points[0]);let nearest:Point=middleRing[0],distance=Infinity;
  for(let i=1;i<middleRing.length;i++){
   const a=middleRing[i-1],b=middleRing[i],dx=b[0]-a[0],dz=b[1]-a[1];
   const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));
   const q:Point=[a[0]+t*dx,a[1]+t*dz],d=Math.hypot(q[0]-p[0],q[1]-p[1]);
   if(d<distance){distance=d;nearest=q;}
  }
  return [{...road,points:[unprojectMap(nearest),...road.points]}];
 }
 const selected=road.name==='体育馆—网球场连接路';
 if(!selected)return [road];
 const clearance=(road.width*.9+3)/2+(25*.9+3)/2+14;
 const chunks:Point[][]=[];let chunk:Point[]=[];
 const flush=()=>{if(chunk.length>1)chunks.push(chunk);chunk=[];};
 const line=road.points.map(projectMap);
 for(let i=1;i<line.length;i++){
  const a=line[i-1],b=line[i],count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));
  for(let j=i===1?0:1;j<=count;j++){
   const p:Point=[a[0]+(b[0]-a[0])*j/count,a[1]+(b[1]-a[1])*j/count];
   if(ringDistance(p)<clearance){flush();continue;}
   // Keep bends but collapse collinear samples to avoid dense miter geometry.
   if(chunk.length>=2){const u=chunk[chunk.length-2],v=chunk[chunk.length-1];
    if(Math.abs((v[0]-u[0])*(p[1]-v[1])-(v[1]-u[1])*(p[0]-v[0]))<1e-7)chunk.pop();
   }
   chunk.push(p);
  }
 }
 flush();return chunks.map(points=>({...road,points:ground(points)}));
});







