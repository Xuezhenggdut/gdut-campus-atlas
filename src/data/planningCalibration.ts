import {unprojectMap} from './projection';
import type {Building,Place,Point} from './campus';
import {planningScale,cropToPdf,pdfToWorld,registrationDelta} from './planningFrame';
import {projectMap} from './projection';
export {planningScale} from './planningFrame';

// Digitised from page 1 of 9930141.pdf, not from the perspective illustration.
// Both 6x detail crops use the same ground scale (2.28 world units / PDF point).
// All crop points now share the full-page datum; auxiliary footprints retain
// their local relationships through the matching district translation.
type Region='east'|'west';
export function planningPoint(region:Region,[x,y]:Point):Point{
 return pdfToWorld(cropToPdf(region,[x,y]));
}
// Crop coordinates: east PDF clip (695,225)-(870,340), west (445,240)-(610,350).
// Numbering follows the current campus map; the 2024 east 13/12/11/14 labels
// correspond to current east 14/13/12/11, so they must not rename the POIs.
const eastBoxes=[
 [1,820,552,989,589],[2,817,470,1003,508],[3,814,386,950,424],
 [4,623,637,789,675],[5,623,553,789,589],[6,623,470,789,509],
 [7,623,386,789,424],[8,623,301,789,339],
 [9,328,637,574,675],[10,328,554,574,590],[11,328,468,575,507],
 [12,47,389,282,429],[13,48,306,282,344],[14,66,216,283,255],
];
const westBoxes=[
 [1,811,286,951,330],[2,818,205,974,246],[3,815,121,975,160],[4,818,32,989,74],
 [5,578,449,775,490],[6,578,382,775,425],[7,578,291,775,334],
 [8,578,205,775,247],[9,578,121,775,161],
 [10,300,292,460,335],[11,300,205,460,245],[12,300,123,460,161],
 [13,88,292,260,334],[14,87,205,260,247],[15,117,122,256,161],[16,174,34,256,78],
];
export const calibratedDorms=[...eastBoxes.map(box=>({region:'east' as const,box})),...westBoxes.map(box=>({region:'west' as const,box}))];
export function applyPlanningCalibration(buildings:Building[],places:Place[]){
 // Move every auxiliary building and gate with its district before replacing
 // traced footprints. Shared dorm POIs are then reset by their traced bodies.
 for(const b of buildings){const area=places.find(p=>b.placeIds.includes(p.id))?.area;
  if(area!=='east'&&area!=='west')continue;
  const p=projectMap(b.position),d=registrationDelta(area);b.position=unprojectMap([p[0]+d[0],p[1]+d[1]]);
  for(const place of places.filter(p=>b.placeIds.includes(p.id)))place.position=b.position;
 }
 for(const {region,box:[n,x0,y0,outerX1,y1]} of calibratedDorms){
  const b=buildings.find(b=>b.id===`b-${region}-dorm-${n}`)!;
  const split=region==='east'&&[9,10,11].includes(n),x1=split?483:outerX1;
  const w=(x1-x0)*planningScale/6,d=(y1-y0)*planningScale/6;
  Object.assign(b,{position:unprojectMap(planningPoint(region,[(x0+x1)/2,(y0+y1)/2])),width:w,depth:d,
   footprint:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]});
  for(const p of places.filter(p=>b.placeIds.includes(p.id))){p.position=b.position;
   if(!p.sourceIds.includes('planning-20241008'))p.sourceIds.push('planning-20241008');}
  if(split){
   const aw=(outerX1-509)*planningScale/6;
   // A rendering component of the same continuous building, not a separate annex.
   // Its elevated connecting floors are generated in makeConnections.
   const annex:Building={...b,id:b.id+'-east-wing',position:unprojectMap(planningPoint(region,[(509+outerX1)/2,(y0+y1)/2])),
    width:aw,footprint:[[-aw/2,-d/2],[aw/2,-d/2],[aw/2,d/2],[-aw/2,d/2]]};
   buildings.push(annex);for(const p of places.filter(p=>b.placeIds.includes(p.id)))p.buildingIds.push(annex.id);
  }
 }
 // Adjacent buildings must move with the same drawing, not remain on the old
 // manually inferred road edge after the dormitory grid changes.
 for(const [id,x0,y0,x1,y1] of [
  ['west-dining-3',821,388,946,553],['doctoral-apartment',230,396,481,445],
  ['expert-1',439,517,485,569],['west-dining-4',85,383,177,475],
 ] as const){const b=buildings.find(b=>b.id==='b-'+id)!;
  const w=(x1-x0)*planningScale/6,d=(y1-y0)*planningScale/6;
  Object.assign(b,{position:unprojectMap(planningPoint('west',[(x0+x1)/2,(y0+y1)/2])),width:w,depth:d,
   footprint:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]});
  const p=places.find(p=>p.id===id)!;p.position=b.position;p.sourceIds.push('planning-20241008');
 }
}
const road=(region:Region,name:string,width:number,points:Point[])=>({name,width,points:points.map(p=>unprojectMap(planningPoint(region,p)))});
export const planningResidentialRoads=[
 road('east','东苑西侧路',7,[[310,118],[310,690]]),
 road('east','东苑二路',7,[[600,278],[600,681],[581,690],[310,690]]),
 road('east','东苑一横路',7,[[310,536],[801.5,536]]),
 road('east','东苑三横路',7,[[310,278],[801.5,278],[813,258]]),
 road('east','东区宿舍东西通道',7,[[18,448],[310,448],[600,448]]),
 road('east','东区宿舍南侧路',7,[[40,690],[310,690],[581,690],[801.5,690],[1000,623]]),
 road('east','东区宿舍东侧路',7,[[801.5,278],[801.5,690]]),
 road('east','东区宿舍横路',6,[[600,363],[801.5,363]]),
 road('east','东区宿舍横路',6,[[600,619],[801.5,619]]),
 road('west','西区东西主路',8,[[70,355],[480,355],[790,355],[970,355]]),
 road('west','西区宿舍中横路',7,[[70,266],[280,266],[480,266]]),
 road('west','西区广场西侧路',7,[[480,182],[480,266],[480,355]]),
 road('west','西区宿舍北横路',7,[[94,182],[970,182]]),
 road('west','西区宿舍西纵路',7,[[270,164],[280,182],[280,355]]),
 road('west','西区宿舍中纵路',7,[[565,182],[565,650]]),
 road('west','西区宿舍东纵路',7,[[790,30],[790,510],[790,570]]),
 road('west','西区五六栋横路',6,[[565,437],[790,437]]),
 road('west','西三食堂南侧路',7,[[565,570],[790,570],[970,570],[985,355]]),
 // Trace only the visible loop around dorm 15. The northern service-centre
 // precinct has a different building fit and must not get an invented through-road.
 {name:'西区十五栋北侧连接路',width:6,points:([[460.6666666667,270.3333333333],[460.6666666667,260],[464,257],[469,256],[484,256],[490,258],[491.6666666667,270.3333333333]] as Point[]).map(p=>unprojectMap(pdfToWorld(p)))},
];
