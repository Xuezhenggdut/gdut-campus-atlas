import fs from 'node:fs';
import {photoViews} from '../src/data/photoViews';
import {places,buildings} from '../src/data/campus';
import {mapToWorldMatrix} from '../src/data/projection';
fs.mkdirSync('output/photo-audit',{recursive:true});
const old='output/photo-audit/views.json',backup='output/photo-audit/before-views.json';
if(fs.existsSync(old)&&!fs.existsSync(backup))fs.copyFileSync(old,backup);
fs.writeFileSync(old,JSON.stringify(photoViews.map(v=>({...v,projectionMatrix:mapToWorldMatrix,building:buildings.find(b=>b.id===places.find(p=>p.id===v.placeId)?.buildingIds[0])})),null,2));
