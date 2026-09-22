import {unprojectMap,projectMap} from './projection';
import type {Building,Place,Point} from './campus';
import {planningScale} from './planningCalibration';
import {teachingPlan,teachingPlanPoint} from './teachingPlan';
import {registeredCropPoint} from './planningFrame';
import {teachingFloorHeight} from './teachingLevels';

// Original PDF page clip (770,340)-(1048,595), rendered at 5x.
// The scale matches the residential tracing. The southern row and western
// engineering edge anchor this pass to the existing shared entrance platform.
export const academicPlanPoint=(p:Point):Point=>registeredCropPoint('academic',p);
export const academicBoxes=[
 // Retain the existing A/B place IDs within the two source building groups.
 ['innovation-b',248,110,325,168,8],['innovation-a',325,110,410,168,8],
 ['truth-a',450,123,578,168,8],['truth-b',450,80,578,120,8],
 ['engineering-1',540,1008,791,1065,7],['engineering-2',540,892,791,947,7],
 ['engineering-3',540,774,791,826,7],['engineering-4',540,652,791,710,7],
 ['lab-1',833,893,1033,946,6],['lab-2',833,773.5,1049,826.5,6],
 ['lab-3',833,651.5,1049,710.5,7],['lab-4',822,525,1049,584,7],
 ['science',833,1008,1024,1065,7],['conference',540,1124,650,1196,2],
 ['structure-lab',1095,597,1199,741,2],['virtue-a',1066,886,1195,946,6],
 ['virtue-b',1066,771,1195,827,6],['shuren',1258,767,1340,846,4],
] as const;
export function applyAcademicCalibration(buildings:Building[],places:Place[]){
 // The user's south-campus satellite crop shows the two office wings sharing
 // a western canal frontage, while the comprehensive wing stays on research row 1.
 const admin=buildings.find(b=>b.id==='b-admin')!,comprehensive=buildings.find(b=>b.id==='b-comprehensive')!;
 const [adminX]=projectMap(admin.position),[,comprehensiveZ]=projectMap(comprehensive.position);
 comprehensive.position=unprojectMap([adminX-admin.width/2+comprehensive.width/2,comprehensiveZ]);
 places.find(p=>p.id==='comprehensive')!.position=comprehensive.position;
 // User satellite reference: inscription is NORTH of the transverse road,
 // aligned with the open entrance between teaching 5 and 3.
 const stone=buildings.find(b=>b.id==='b-innovation-stone')!;
 Object.assign(stone,{position:unprojectMap([teachingPlanPoint([248,454])[0],20]),width:20,depth:5.5,height:3.5,
  footprint:[[-10,-2.75],[10,-2.75],[10,2.75],[-10,2.75]],heightBasis:'实景照片中的低矮宽扁景石及花坛，尺寸为比例拟合。'});
 places.find(p=>p.id==='innovation-stone')!.position=stone.position;
 // Satellite overrides the earlier mistaken parking-plot interpretation:
 // the circular plaza sits between the two avenues, east of the library.
 const square=buildings.find(b=>b.id==='b-diligence-square')!;
 square.position=unprojectMap([390,73]);
 square.width=30;square.depth=46;
 square.footprint=[[-15,-23],[15,-23],[15,23],[-15,23]];
 places.find(p=>p.id==='diligence-square')!.position=square.position;
 for(const [id,x0,y0,x1,y1,floors] of academicBoxes){
  const b=buildings.find(b=>b.id==='b-'+id)!,width=(x1-x0)*planningScale/5,depth=(y1-y0)*planningScale/5;
  Object.assign(b,{position:unprojectMap(academicPlanPoint([(x0+x1)/2,(y0+y1)/2])),width,depth,floors,
   footprint:[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]]});
  b.heightBasis='2024批准平面图核对楼层、占地轮廓；高度仍为外观估计，非实测标高。';
  for(const p of places.filter(p=>b.placeIds.includes(p.id))){p.position=b.position;
   if(!p.sourceIds.includes('planning-20241008'))p.sourceIds.push('planning-20241008');}
 }
 // Separate storey annotations on the two rows, rather than six equal-height
 // copies. Retain estimated heights until elevation evidence is available.
 for(const [id,floors] of [['teaching-1',5],['teaching-2',5],['teaching-3',4],['teaching-4',3],['teaching-5',4],['teaching-6',3]] as const){
  const b=buildings.find(b=>b.id==='b-'+id)!;b.floors=floors;b.height=floors*teachingFloorHeight;
  const [x0,y0,x1,y1]=teachingPlan[b.id].box,width=(x1-x0)*planningScale/5,depth=(y1-y0)*planningScale/5;
  Object.assign(b,{position:unprojectMap(teachingPlanPoint([(x0+x1)/2,(y0+y1)/2])),width,depth,
   footprint:[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]]});
  b.heightBasis='2024批准平面图楼层标注；采用统一示意层高使低层连廊对齐，非实测标高。';
  const p=places.find(p=>p.id===id)!;p.position=b.position;if(!p.sourceIds.includes('planning-20241008'))p.sourceIds.push('planning-20241008');
 }
}
