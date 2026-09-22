export type PlanPoint=[number,number];
export const planningScale=2.28;
/** Single full-page PDF datum. Positive Z follows PDF south; units are still
 * schematic, not metres. The engineering/platform tie is the retained anchor. */
export function pdfToWorld([x,y]:PlanPoint):PlanPoint{return [417.15+(x-878)*planningScale,277.8591549295774+(y-547.3)*planningScale];}
export function worldToPdf([x,z]:PlanPoint):PlanPoint{return [878+(x-417.15)/planningScale,547.3+(z-277.8591549295774)/planningScale];}
export const planFrames={
 east:{crop:[695,225],rasterScale:6,anchorPixel:[310,650],anchorWorld:[0,-163]},
 west:{crop:[445,240],rasterScale:6,anchorPixel:[880,430],anchorWorld:[-294,-176]},
 academic:{crop:[770,340],rasterScale:5,anchorPixel:[540,1036.5],anchorWorld:[417.15,277.8591549295774]},
 teaching:{crop:[770,340],rasterScale:5,anchorPixel:[0,402],anchorWorld:[113,18.62]},
} satisfies Record<string,{crop:PlanPoint;rasterScale:number;anchorPixel:PlanPoint;anchorWorld:PlanPoint}>;
export type PlanRegion=keyof typeof planFrames;
export function cropToPdf(region:PlanRegion,[x,y]:PlanPoint):PlanPoint{const f=planFrames[region];return [f.crop[0]+x/f.rasterScale,f.crop[1]+y/f.rasterScale];}
export function registrationDelta(region:PlanRegion):PlanPoint{
 const f=planFrames[region],target=pdfToWorld(cropToPdf(region,f.anchorPixel));
 return [target[0]-f.anchorWorld[0],target[1]-f.anchorWorld[1]];
}
// Keep legacy translations explicit until terrain, waterways, gates and roads
// migrate together. Moving only buildings would recreate boundary collisions.
export function registeredCropPoint(region:PlanRegion,p:PlanPoint):PlanPoint{
 const world=pdfToWorld(cropToPdf(region,p)),delta=registrationDelta(region);
 return [world[0]-delta[0],world[1]-delta[1]];
}
