import fs from 'node:fs';
import {planFrames,registrationDelta,pdfToWorld,worldToPdf,type PlanRegion} from '../src/data/planningFrame';
const rows=(Object.keys(planFrames) as PlanRegion[]).map(region=>({region,originalLocalTranslation:registrationDelta(region),requiredWholeRegionTranslation:[0,0],status:'building-datum-applied',unit:'schematic-world-units'}));
const sample:[number,number]=[878,547.3],back=worldToPdf(pdfToWorld(sample));
if(Math.hypot(back[0]-sample[0],back[1]-sample[1])>1e-8)throw new Error('PDF frame roundtrip failed');
fs.mkdirSync('output/pdf-comparison',{recursive:true});
fs.writeFileSync('output/pdf-comparison/registration-audit.json',JSON.stringify({status:'traced-districts-and-sports-use-shared-datum',note:'Traced building anchors use the full-page PDF datum. Auxiliary buildings and residential banks retain their translated local geometry. The lake uses a constrained fit preserving the administration bank and southern crossings, not a survey-accurate shoreline.',rows},null,2));
console.log(JSON.stringify(rows));
