import {projectMap,unprojectMap,campusYaw,mapToWorldMatrix,mapProjection} from './projection';
export type Area = 'academic' | 'east' | 'west';
export type Category = 'study' | 'living' | 'dining' | 'sports' | 'service' | 'landscape';
export type Point = [number, number];
export type ModelKind = 'library' | 'gate' | 'gym' | 'culture' | 'teaching' | 'engineering' | 'lab' | 'dorm' | 'dining' | 'office' | 'hospital' | 'field' | 'court' | 'plaza' | 'lake';
export interface Place { id:string; name:string; aliases:string[]; area:Area; category:Category; position:Point; description:string; status:'built'|'planned'; sourceIds:string[]; buildingIds:string[]; landmark?:boolean; }
export interface Building { id:string; placeIds:string[]; position:Point; footprint:Point[]; width:number; depth:number; height:number; floors:number; kind:ModelKind; color:string; rotation:number; heightBasis:string; modelUrl?:string; }
export interface Source { id:string; title:string; url:string; date:string; usage:string; verification:string; }
export const areas:Record<Area,{name:string;letter:string;color:string;center:Point;distance:number}> = {
 academic:{name:'教学区',letter:'A',color:'#aa4e42',center:[740,890],distance:610},
 east:{name:'生活东区',letter:'B',color:'#c28b45',center:[940,535],distance:380},
 west:{name:'生活西区',letter:'C',color:'#397f80',center:[435,240],distance:370}
};
export const categories:Record<Category,{name:string;color:string}> = {study:{name:'教学科研',color:'#a75545'},living:{name:'住宿',color:'#698675'},dining:{name:'餐饮',color:'#be8b44'},sports:{name:'运动',color:'#638d97'},service:{name:'公共服务',color:'#7b748c'},landscape:{name:'景观',color:'#7c9864'}};
export const sources:Source[] = [
 {id:'amap-20260919',title:'高德地图 · 大学城校区普通图与二维卫星图现场核对',url:'https://www.amap.com/ssr/search',date:'2026-09-19',usage:'主轴北向、图书馆西侧独立足球场及邻接球场关系核对。',verification:'查阅日期不等于影像拍摄日期；屏幕目视比对，非测绘坐标；影像仅留本地研究，不作为网页贴图。'},
 {id:'map',title:'大学城校区地图示意图 · 用户提供的官方 PDF',url:'https://www.gdut.edu.cn/info/1715/23413.htm',date:'2026-01-07',usage:'位置、名称、区域及规划状态的主要依据；研究副本位于 research/，不随网页发布。',verification:'已逐区查看原图；示意坐标，非测绘数据。'},
 {id:'library',title:'大学城校区 · 图书馆日景',url:'https://photo.gdut.edu.cn/info/1294/1959.htm',date:'2020-05-27',usage:'外部体块、凹凸立面、入口与湖边环境参考。',verification:'多视角参考；非逐窗精确复原。'},
 {id:'aerial',title:'大学城校区 · 广工航拍（白天）',url:'https://photo.gdut.edu.cn/info/1294/1962.htm',date:'2020-05-27',usage:'楼群、道路及屋顶关系对照。',verification:'较早照片；建筑名称及规划状态以新版地图为准。'},
 {id:'engineering',title:'大学城校区 · 工学馆、实验楼建筑风光',url:'https://photo.gdut.edu.cn/info/1294/1835.htm',date:'2020-05-24',usage:'教学科研楼立面及连廊参考。',verification:'类型化简化，背面及实际高度未测绘。'},
 {id:'sports',title:'大学城校区 · 田径场风光',url:'https://photo.gdut.edu.cn/info/1294/1837.htm',date:'2020-05-24',usage:'体育馆、游泳池、球场参考。',verification:'设施轮廓概括；不表示实时开放状态。'},
 {id:'culture',title:'大学城校区 · 文化活动中心日景',url:'https://photo.gdut.edu.cn/info/1294/2584.htm',date:'2024-01-10',usage:'文化活动中心外形参考。',verification:'主体及层叠屋顶概括，非施工模型。'},
 {id:'gate',title:'大学城校区 · 正门风光',url:'https://photo.gdut.edu.cn/info/1294/1956.htm',date:'2020-05-27',usage:'南门入口构筑物参考。',verification:'已查看官方图库四张正门照片；行政入口框架及广场概括。'},
 {id:'recent',title:'大学城校区 · 校园风光 2026',url:'https://photo.gdut.edu.cn/info/1294/2688.htm',date:'2026-09-14',usage:'较新环境参考。',verification:'不据相册标题认定全部建筑状态。'},
 {id:'dining',title:'国资风采 · 大学城校区',url:'https://gzb.gdut.edu.cn/gzfc/dxcxq.htm',date:'日期见各条目',usage:'食堂及生活区类型参考。',verification:'该站访问受限；本版食堂仅据官方插画轮廓，外立面待补充核实。'}
];
export const places:Place[]=[]; export const buildings:Building[]=[];
// Coordinates refer to the 1280 px-wide official illustration, before its legend.
// The compass points north toward page upper-right. Ground position, not roof label.
export const toWorld=projectMap;
export const yaw = campusYaw;
export function mapFootprint(b:Building):Point[]{const [x,z]=toWorld(b.position),c=Math.cos(b.rotation),s=Math.sin(b.rotation);return b.footprint.map(([u,v])=>unprojectMap([x+u*c+v*s,z-u*s+v*c]));}
type Spec={id:string;name:string;x:number;y:number;w:number;d:number;h?:number;floors?:number;kind:ModelKind;area?:Area;cat?:Category;color?:string;aliases?:string[];description?:string;source?:string;landmark?:boolean;planned?:boolean;rotation?:number};
// Amap crop shows a broader green setback at the south edge of the east
// residential district. Pull only the buildings facing the ring road north;
// shifting the whole district would push its northern buildings into roads.
const eastSouthEdgeIds=new Set(['east-dining-2','east-dorm-4','east-dorm-9']);
const eastSouthEdgeOffset:Point=[10,-9];
function add(s:Spec){const bid='b-'+s.id; const position:Point=eastSouthEdgeIds.has(s.id)?[s.x+eastSouthEdgeOffset[0],s.y+eastSouthEdgeOffset[1]]:[s.x,s.y];const h=s.h??(s.floors??5)*3; const w=s.w*.9,d=s.d*.9;
 buildings.push({id:bid,placeIds:[s.id],position,footprint:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]],width:w,depth:d,height:h,floors:s.floors??Math.round(h/3),kind:s.kind,color:s.color??'#e7dfcb',rotation:s.rotation??yaw,heightBasis:'依官方插画及外观参考估计；示意高度，未测绘。'});
 places.push({id:s.id,name:s.name,aliases:s.aliases??[],area:s.area??'academic',category:s.cat??'study',position,description:s.description??`${s.name}位于${areas[s.area??'academic'].name}。位置与名称依据官方校园示意图；建筑以微缩方式呈现。`,status:s.planned?'planned':'built',sourceIds:[...new Set(['map',...(s.source?[s.source]:[])])],buildingIds:[bid],landmark:s.landmark});
}
add({id:'library',name:'图书馆',aliases:['工大魔方','大学城图书馆'],x:749,y:855,w:86,d:81,h:45,kind:'library',cat:'service',source:'library',landmark:true,description:'团结湖畔的「工大魔方」。方正体量与错落的凹凸外墙是它鲜明的建筑特征。此处还原外部轮廓与立面层次，可旋转观察不同方向。'});
// The map places the history museum label on the library complex: retain two POIs, one model.
places.push({id:'history-museum',name:'校史馆',aliases:[],area:'academic',category:'service',position:[737,843],description:'官方示意图将校史馆标注在图书馆组团。本版共用组团模型，未推断其独立楼体、楼层或入口。',status:'built',sourceIds:['map'],buildingIds:['b-library']});buildings[0].placeIds.push('history-museum');
add({id:'south-gate',name:'南门',aliases:['正门','大学城校区正门'],x:584,y:1108,w:87,d:15,h:15,kind:'gate',cat:'service',source:'gate',landmark:true,description:'大学城校区南门入口，连接大学城外环西路与校园主轴。行政楼与综合楼的连续高柱顶架、台阶绿坡及校名石共同构成入口组团。'});
add({id:'gym',name:'体育馆',x:493,y:570,w:110,d:78,h:26,kind:'gym',cat:'sports',source:'sports',landmark:true,description:'教学区西北侧的体育设施组团。包括主馆、两座相邻泳池、屋面开放球场及带 GDUT 座席字样的中心田径场看台；不提供实时开放信息。'});
add({id:'culture',name:'文化活动中心',x:667,y:650,w:66,d:50,h:14,rotation:yaw+Math.PI/2,kind:'culture',cat:'service',source:'culture',landmark:true,description:'中心田径场附近的文化活动中心。弧形玻璃前厅面向挑战路，体育场位于背后；主体依据官方地图和日景照片重建。'});
for(let i=1;i<=6;i++)add({id:`teaching-${i}`,name:`教学${['一','二','三','四','五','六'][i-1]}号楼`,aliases:[`教${i}`,`第${i}教学楼`,`${i}教`],x:[1053,1090,922,960,834,872][i-1],y:[914,877,828,790,778,740][i-1],w:i<3?170:97,d:24,h:21,kind:'teaching',source:'aerial',landmark:i===1,color:'#ebe4d1',description:'教学区教学楼组团的一部分。保留长条楼体、重复窗格及架空连廊的微缩特征，具体教室位置未纳入本版。'});
for(let i=1;i<=4;i++)add({id:`engineering-${i}`,name:`工学${['一','二','三','四'][i-1]}号馆`,aliases:[`工${i}`,`工学${i}号馆`],x:[801,866,907,942][i-1],y:[1073,1028,993,958][i-1],w:73,d:32,h:28,kind:'engineering',source:'engineering',landmark:i===1,color:i<3?'#c5d4d6':'#dca18b'});
for(let i=1;i<=4;i++)add({id:`lab-${i}`,name:`实验${['一','二','三','四'][i-1]}号楼`,aliases:[`实验${i}号楼`,`实${i}`],x:[970,1009,1051,1088][i-1],y:[1056,1025,994,964][i-1],w:66,d:25,h:22,kind:'lab',source:'engineering',color:'#c8d6c0'});
add({id:'science',name:'理学馆',x:862,y:1142,w:79,d:34,h:26,kind:'engineering',color:'#d6a09a',source:'engineering'});
add({id:'admin',name:'行政楼',x:630,y:1060,w:76,d:29,h:26,kind:'office',cat:'service',color:'#d5e1da',source:'gate'});
add({id:'comprehensive',name:'综合楼',x:661,y:1020,w:71,d:29,h:26,kind:'office',cat:'service',color:'#d5e1da',source:'gate'});
add({id:'conference',name:'会议中心',x:751,y:1097,w:62,d:51,h:20,kind:'culture',cat:'service'});
add({id:'structure-lab',name:'结构实验楼',x:1120,y:1091,w:48,d:40,h:27,kind:'lab',color:'#d5a165'});
for(const [id,name,x,y] of [['innovation-a','创新科技楼A座',1065,782],['innovation-b','创新科技楼B座',1002,753],['truth-a','求是科技楼A座',1150,828],['truth-b','求是科技楼B座',1115,799],['virtue-a','立德科技楼A座',1047,1166],['virtue-b','立德科技楼B座',1082,1133]] as const)add({id,name,x,y,w:id.startsWith('truth')?42:id==='innovation-a'?55:70,d:26,h:30,kind:'office',color:'#d5d9d8'});
add({id:'shuren',name:'树人科技楼',x:1150,y:1220,w:44,d:45,h:43,kind:'office',planned:true});
add({id:'lake',name:'团结湖',x:482,y:950,w:0,d:0,h:0,kind:'lake',cat:'landscape',description:'图书馆和行政建筑附近的团结湖。湖岸根据官方示意图概括，水色与树木为微缩景观表达。'});
add({id:'diligence-square',name:'勤奋广场',x:868,y:921,w:61,d:52,h:1,kind:'plaza',cat:'landscape'});
add({id:'gdut-square',name:'工大广场',x:651,y:1148,w:82,d:39,h:1,kind:'plaza',cat:'landscape'});
add({id:'central-track',name:'中心田径场',x:594,y:622,w:91,d:60,h:1,kind:'field',cat:'sports',source:'sports',rotation:yaw+Math.PI/2});
add({id:'south-track',name:'南侧田径场',x:509,y:872,w:106,d:65,h:1,kind:'field',cat:'sports',rotation:yaw+Math.PI/2,description:'官方地图绘有该田径场但未单独命名；「南侧田径场」是本版用于区分场地的描述标签。'});
add({id:'cricket',name:'板球场',x:234,y:464,w:129,d:92,h:14,kind:'field',cat:'sports',source:'sports'});
add({id:'tennis',name:'网球场',x:363,y:460,w:81,d:56,h:1,kind:'court',cat:'sports',source:'sports'});
add({id:'courts-west',name:'体育馆西侧球场',x:392,y:606,w:79,d:53,h:1,kind:'court',cat:'sports',description:'官方图示球场组团，名称为本版方位描述。'});
add({id:'courts-south',name:'教学区球场',x:464,y:666,w:109,d:56,h:1,kind:'court',cat:'sports',description:'官方图示室外球场组团，具体球场类型以现场为准。'});
add({id:'courts-library',name:'图书馆西侧球场',x:544,y:763,w:40,d:65,h:1,kind:'court',cat:'sports',source:'amap-20260919',description:'图书馆西侧、独立足球场以西的多片小型球场。根据高德二维卫星图校正组团范围；名称为本版方位描述，具体场地类型以现场为准。'});
add({id:'library-football',name:'图书馆西侧足球场',aliases:['图书馆足球场','北侧足球场'],x:592.33,y:798.67,w:94,d:53,h:1,rotation:yaw+Math.PI/2,kind:'field',cat:'sports',source:'amap-20260919',description:'位于图书馆以西、南侧田径场以北的独立矩形足球场，没有环形跑道。2026-09-19 对照高德普通地图及二维卫星影像补充；使用方位描述名称，尺寸和坐标仍为示意。'});
// Individual dorm blocks: page ground anchors manually checked against numbered official map.
const eastDorms:Point[]=[[1113,674],[1146,641],[1173,611],[931,652],[965,624],[995,596],[1025,569],[1055,540],[858,617],[891,589],[925,557],[798,472],[831,445],[864,416]];
eastDorms.forEach(([x,y],i)=>add({id:`east-dorm-${i+1}`,name:`东区学生宿舍${i+1}栋`,aliases:[`东${i+1}`,`东区${i+1}栋`],x,y,w:57,d:21,h:24,kind:'dorm',area:'east',cat:'living',color:[0,1,2,8,9,10].includes(i)?'#d9a08c':i>=11?'#c2d0b9':'#c6d7dc'}));
const westDorms:Point[]=[[556,331],[589,303],[622,275],[655,247],[400,344],[433,315],[466,287],[500,259],[537,231],[386,237],[425,208],[464,177],[300,178],[339,152],[376,127],[412,104],[375,380]];
westDorms.forEach(([x,y],i)=>add({id:`west-dorm-${i+1}`,name:`西区学生宿舍${i+1}栋`,aliases:[`西${i+1}`,`西区${i+1}栋`],x,y,w:56,d:21,h:24,kind:'dorm',area:'west',cat:'living',color:[4,5,6,7,8,12,13,14].includes(i)?'#dca18d':'#c8d9dc',planned:i===16}));
add({id:'east-dining-1',name:'东一食堂',aliases:['东一饭堂'],x:1103,y:499,w:43,d:43,h:21,kind:'dining',area:'east',cat:'dining',landmark:true,source:'dining',color:'#e0c5a6'});
add({id:'east-dining-2',name:'东二食堂',aliases:['东二饭堂'],x:720,y:524,w:71,d:48,h:15,kind:'dining',area:'east',cat:'dining',source:'dining'});
add({id:'west-dining-3',name:'西三食堂',aliases:['西三饭堂'],x:482,y:395,w:73,d:42,h:15,kind:'dining',area:'west',cat:'dining',landmark:true,source:'map',description:'生活西区靠近东门的食堂。弧形组合轮廓依据官方插画，立面和背面作类型化简化。'});
add({id:'west-dining-4',name:'西四食堂',aliases:['西四饭堂'],x:246,y:242,w:45,d:35,h:17,kind:'dining',area:'west',cat:'dining',source:'dining'});
for(const [i,x,y] of [[1,886,373],[2,921,342],[3,971,367]] as const)add({id:`east-teacher-${i}`,name:`东区教师宿舍${i}栋`,x,y,w:38,d:30,h:42,kind:'dorm',area:'east',cat:'living',color:'#c0d2da'});
add({id:'east-teacher-group',name:'东区教师宿舍组团',x:970,y:433,w:44,d:29,h:40,kind:'dorm',area:'east',cat:'living',color:'#c0d2da',description:'官方地图单独标注的教师宿舍组团，未显示独立楼栋编号。'});
add({id:'hospital',name:'医院',aliases:['校医院'],x:1041,y:450,w:41,d:27,h:15,kind:'hospital',area:'east',cat:'service'});
add({id:'east-service',name:'东区服务中心',x:1019,y:473,w:35,d:24,h:15,kind:'office',area:'east',cat:'service',description:'医院西南侧的独立服务建筑；依据官方 PDF 的两处轮廓分开建模，内部功能未核实。'});
places.push({id:'counselling',name:'心理健康教育中心',aliases:[],area:'east',category:'service',position:[925,557],description:'官方图中标注于东区宿舍组团附近，本版定位至该组团，不推断独立楼体及内部楼层。',status:'built',sourceIds:['map'],buildingIds:['b-east-dorm-11']});buildings.find(b=>b.id==='b-east-dorm-11')!.placeIds.push('counselling');
add({id:'doctoral-apartment',name:'博士后公寓',x:323,y:255,w:54,d:29,h:28,kind:'dorm',area:'west',cat:'living',color:'#c8d6d8'});
add({id:'west-teacher',name:'西区教师宿舍',x:300,y:278,w:26,d:21,h:18,kind:'dorm',area:'west',cat:'living'});
add({id:'expert-1',name:'专家公寓北组团',x:353,y:302,w:28,d:20,h:14,kind:'dorm',area:'west',cat:'living',aliases:['专家公寓'],description:'官方图中的专家公寓组团；北组团为本版区分位置的描述名称。'});
add({id:'expert-2',name:'专家公寓南组团',x:321,y:326,w:29,d:21,h:14,kind:'dorm',area:'west',cat:'living',aliases:['专家公寓'],description:'官方图中的专家公寓组团；南组团为本版区分位置的描述名称。'});
add({id:'senior-expert-1',name:'高级专家公寓西组团',x:228,y:285,w:26,d:20,h:11,kind:'dorm',area:'west',cat:'living',aliases:['高级专家公寓'],description:'官方图中的高级专家公寓；组团方位为本版描述标签。'});
add({id:'senior-expert-2',name:'高级专家公寓东组团',x:262,y:306,w:26,d:20,h:11,kind:'dorm',area:'west',cat:'living',aliases:['高级专家公寓'],description:'官方图中的高级专家公寓；组团方位为本版描述标签。'});
for(const [id,name,x,y,area] of [['east-gate','东门',1177,1003,'academic'],['academic-nw','教学区西北门',481,454,'academic'],['east-west-gate','东区西门',726,456,'east'],['east-east-gate','东区东门',1134,554,'east'],['west-east-gate','西区东门',572,369,'west'],['west-west-gate','西区西门',196,169,'west']] as const)add({id,name,x,y,w:22,d:6,h:6,kind:'gate',area,cat:'service'});
// Satellite/PDF joint check: align paired research buildings across the
// north-south research street. Keep source illustration coordinates reversible.
export const researchRowOffset=toWorld(buildings.find(b=>b.id==='b-comprehensive')!.position)[1]-312;
for(const [id,x,z] of [['courts-west',-201.4,93.4],['engineering-1',450,312],['engineering-2',450,256],['engineering-3',450,198],['engineering-4',450,138],['lab-1',550,256],['lab-2',550,198],['lab-3',550,138],['lab-4',550,82],['science',550,312],['structure-lab',640,120],['virtue-a',640,198],['virtue-b',640,158],['conference',460,360],['south-gate',335,386.4],['diligence-square',366,88]] as const){
 const b=buildings.find(b=>b.id==='b-'+id)!;
 const alignedZ=/^(engineering-|lab-)|^science$/.test(id)?z+researchRowOffset:z;
 b.position=unprojectMap([x,alignedZ]);
 for(const p of places.filter(p=>b.placeIds.includes(p.id))){p.position=b.position;if(!p.sourceIds.includes('amap-20260919'))p.sourceIds.push('amap-20260919');}
}
// The small auditorium occupies the western third of the engineering frontage.
const meeting=buildings.find(b=>b.id==='b-conference')!,engineeringOne=buildings.find(b=>b.id==='b-engineering-1')!;
meeting.width=26;meeting.depth=24;meeting.footprint=[[-13,-12],[13,-12],[13,12],[-13,12]];
meeting.position=unprojectMap([toWorld(engineeringOne.position)[0]-engineeringOne.width/2+meeting.width/2,toWorld(buildings.find(b=>b.id==='b-admin')!.position)[1]]);
places.find(p=>p.id==='conference')!.position=meeting.position;
const square=buildings.find(b=>b.id==='b-diligence-square')!;square.width=40;square.depth=80;square.footprint=[[-20,-40],[20,-40],[20,40],[-20,40]];
// The gate square is below the stair garden, east of the entrance drive.
const gateSquare=buildings.find(b=>b.id==='b-gdut-square')!;
Object.assign(gateSquare,{position:unprojectMap([389,420]),width:70,depth:18,footprint:[[-35,-9],[35,-9],[35,9],[-35,9]]});
places.find(p=>p.id==='gdut-square')!.position=gateSquare.position;
// Amap places the third dining hall well inside the west residential area,
// with a broad green setback from the academic northwest gate.
const westDiningThree=buildings.find(b=>b.id==='b-west-dining-3')!;
westDiningThree.position=unprojectMap([-300,-160]);
places.find(p=>p.id==='west-dining-3')!.position=westDiningThree.position;
// West dining 3 is a north-south block beside the east gate, south of dorm 1.
westDiningThree.position=unprojectMap([-294,-158]);
Object.assign(westDiningThree,{width:42,depth:50,footprint:[[-21,-25],[21,-25],[21,25],[-21,25]]});
places.find(p=>p.id==='west-dining-3')!.position=westDiningThree.position;
const valley=unprojectMap([238,23]);
// Supplied east-district plan: 9/10/11 west of Tiaozhan Road, 4–8 east;
// 12–14 and dining 2 form the western column around an open central lawn.
for(const [id,x,z] of [['east-dorm-9',65,-163],['east-dorm-10',65,-205],['east-dorm-11',65,-247],['east-dorm-4',165,-163],['east-dorm-5',165,-205],['east-dorm-6',165,-247],['east-dorm-7',165,-289],['east-dorm-8',165,-331],['east-dorm-12',-44,-247],['east-dorm-13',-44,-289],['east-dorm-14',-44,-331],['east-dining-2',-56,-199],['east-dining-1',180,-375]] as const){
 const b=buildings.find(b=>b.id==='b-'+id)!;b.position=unprojectMap([x,z]);
 for(const p of places.filter(p=>b.placeIds.includes(p.id)))p.position=b.position;
}
const diningOne=buildings.find(b=>b.id==='b-east-dining-1')!;
diningOne.position=unprojectMap([163.83098591549296,-357.92488262910797]);places.find(p=>p.id==='east-dining-1')!.position=diningOne.position;
for(const [id,z] of [['east-dorm-7',-278],['east-dorm-8',-308]] as const){const b=buildings.find(b=>b.id==='b-'+id)!;b.position=unprojectMap([165,z]);places.find(p=>p.id===id)!.position=b.position;}
// Type proportions from supplied map crops; height and footprint remain schematic.
for(const [id,w,d,h] of [['innovation-a',43,32,27],['truth-a',62,23.4,27],['truth-b',34,28,27],['virtue-a',36,27,23],['virtue-b',36,27,23]] as const){
 const b=buildings.find(b=>b.id==='b-'+id)!;Object.assign(b,{width:w,depth:d,height:h,floors:id.startsWith('virtue')?6:7,footprint:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]});
}
for(const [id,x,z] of [['innovation-a',354,-114],['truth-a',437,-108],['truth-b',425,-155]] as const){const b=buildings.find(b=>b.id==='b-'+id)!;b.position=unprojectMap([x,z]);places.find(p=>p.id===id)!.position=b.position;}
const southOne=unprojectMap([-360,130.8]);
add({id:'south-one-gate',name:'南1门',aliases:['南一门'],x:southOne[0],y:southOne[1],w:16,d:5,h:4,kind:'gate',cat:'service',source:'amap-20260919',description:'知行大道西端出入口。按用户提供高德地图补充道路连接；入口造型、位置和尺寸为示意。'});
add({id:'innovation-stone',name:'工大创谷景石',aliases:['工大创谷','创谷石'],x:valley[0],y:valley[1],w:29,d:9,h:8,kind:'plaza',cat:'landscape',description:'教学五号楼与三号楼前、图书馆北侧的工大创谷景石。根据用户提供的官方地图局部补充；石体和刻字为示意复原。'});
export const tourIds=['library','south-gate','gym','culture','engineering-1','teaching-1','east-dining-1','west-dining-3'];
export const sceneConfig={coordinateSystem:'official-illustration-oblique-corrected',projection:mapProjection,mapToWorldMatrix,north:'negative-Z',unit:'schematic',tourIds,defaultTarget:toWorld([651,650])};
export function normalizeQuery(q:string){const digits:Record<string,number>={'零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};return q.trim().toLowerCase().replace(/[\s号栋楼]/g,'').replace(/[零一二三四五六七八九十]+/g,n=>{if(n.includes('十')){const [a,b]=n.split('十');return String((a?digits[a]:1)*10+(b?digits[b]:0));}return [...n].map(c=>digits[c]).join('');});}
export function findPlaces(q:string,area:Area|'all'='all',category:Category|'all'='all',planned=false){const query=normalizeQuery(q);return places.filter(p=>(planned||p.status==='built')&&(area==='all'||p.area===area)&&(category==='all'||p.category===category)).map(p=>{const names=[p.name,...p.aliases].map(normalizeQuery);return {p,score:!query?0:names.includes(query)?3:names.some(n=>n.startsWith(query))?2:names.some(n=>n.includes(query))?1:-1};}).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||Number(!!b.p.landmark)-Number(!!a.p.landmark)).map(x=>x.p);}



