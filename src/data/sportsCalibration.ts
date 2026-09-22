import type {Building,Place} from './campus';
import {pdfToWorld} from './planningFrame';
import {unprojectMap} from './projection';
// Full-page PDF points, taken from the sports and water detail crops. Widths
// are simplified ground envelopes, not survey measurements or roof extents.
export const sportsAnchors=[
 ['gym',633,391,82,74],['central-track',692,397,110,55],
 ['culture',737,392,65,55],['cricket',542,417,117,117],
 ['tennis',591,385,36,76],['courts-west',617,442,60,36],
 ['courts-south',673,443,166,76],['south-track',750,514,122,64],
 ['library-football',758,466,74,46],['courts-library',739,469,30,70],
 ['library',814,462,55,55],
] as const;
export function applySportsCalibration(buildings:Building[],places:Place[]){
 for(const [id,x,y,width,depth] of sportsAnchors){
  const b=buildings.find(b=>b.id==='b-'+id)!;
  Object.assign(b,{position:unprojectMap(pdfToWorld([x,y])),width,depth,
   footprint:[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]]});
  // The earlier footprint reduction retained the old 45-unit height. Restore
  // the lower, broad mass seen in the user's front and aerial photographs.
  if(id==='library'){b.height=34;b.heightBasis='正面及航拍照片比例校准；高度为沙盘单位，非实测标高。';}
  for(const p of places.filter(p=>b.placeIds.includes(p.id))){p.position=b.position;if(!p.sourceIds.includes('planning-20241008'))p.sourceIds.push('planning-20241008');}
 }
}
