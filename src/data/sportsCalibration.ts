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
 // Supplied ordinary-map crops correct the local court/road relationships.
 // Keep the north-south road straight: both tennis and volleyball are west
 // of it. The library courts form a stepped group beside the football pitch.
 for(const [id,x,z,w,d] of [
  ['courts-west',-250,37.775154929577525,60,36],
  ['courts-library',95.05,97.5,45,65],
 ] as const){
  const b=buildings.find(b=>b.id==='b-'+id)!;
  Object.assign(b,{position:unprojectMap([x,z]),width:w,depth:d,footprint:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]});
  for(const p of places.filter(p=>b.placeIds.includes(p.id)))p.position=b.position;
 }
 const gate=buildings.find(b=>b.id==='b-east-gate')!;
 gate.position=unprojectMap([689,33]);gate.rotation=Math.PI/2;
 for(const p of places.filter(p=>gate.placeIds.includes(p.id)))p.position=gate.position;
 // The legacy illustration coordinate put the northwest gate on a tennis
 // court. Anchor the schematic entrance to the road junction instead.
 const northwest=buildings.find(b=>b.id==='b-academic-nw')!;
 northwest.position=unprojectMap([-205,-138]);northwest.rotation=0;
 for(const p of places.filter(p=>northwest.placeIds.includes(p.id)))p.position=northwest.position;
}
