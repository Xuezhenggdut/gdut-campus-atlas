import type {Point} from './campus';
import {planningScale} from './planningCalibration';
import {cropToPdf,pdfToWorld} from './planningFrame';
// Original PDF clip (770,340)-(1048,595), 5x raster; courtyard rectangles
// sit inside the continuous teaching wings, rather than repeated tiny blocks.
export const teachingPlan:Record<string,{box:[number,number,number,number];courts:[number,number,number,number][]}>={
 'b-teaching-1':{box:[555,362,893,432],courts:[[594,383,663,409],[679,383,744,409],[765,383,826,410]]},
 'b-teaching-2':{box:[555,220,824,290],courts:[[602,245,663,270],[676,245,733,270],[749,238,793,274]]},
 'b-teaching-3':{box:[248,350,428,454],courts:[[257,383,306,418],[321,383,378,418]]},
 'b-teaching-4':{box:[248,205,428,313],courts:[[257,237,310,274],[321,237,378,274]]},
 'b-teaching-5':{box:[93,350,248,454],courts:[[109,382,199,417],[216,385,232,410]]},
 'b-teaching-6':{box:[93,205,248,313],courts:[[115,237,195,275],[211,246,239,275]]},
};
// Teaching and research now share the full-page datum: no local translation.
export const teachingPlanPoint=(p:Point):Point=>pdfToWorld(cropToPdf('teaching',p));
export function teachingCourts(id:string){const p=teachingPlan[id];if(!p)return [];
 const [x0,y0,x1,y1]=p.box,k=planningScale/5;
 return p.courts.map(([a,b,c,d])=>({x:((a+c-x0-x1)/2)*k,z:((b+d-y0-y1)/2)*k,width:(c-a)*k,depth:(d-b)*k}));
}
