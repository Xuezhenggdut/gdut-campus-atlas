import fs from 'node:fs';
import {places,buildings,sources,areas,categories,sceneConfig} from '../src/data/campus';
import {landPolygons,lakePolygons,lakeIsland,residentialWaters,roads,roadGuides} from '../src/data/landscape';
fs.mkdirSync('output',{recursive:true});
fs.writeFileSync('output/campus-data.json',JSON.stringify({places,buildings,sources,sceneConfig},null,2));
const clean=(v:unknown)=>String(v??'').replace(/[\t\r\n]/g,' ');
const rows=[['ID','名称','区域','类别','状态','别名','模型ID','来源ID','说明'],...places.map(p=>[p.id,p.name,areas[p.area].name,categories[p.category].name,p.status,p.aliases.join(' / '),p.buildingIds.join(','),p.sourceIds.join(','),p.description])];
fs.writeFileSync('output/地点清单.tsv','\uFEFF'+rows.map(r=>r.map(clean).join('\t')).join('\n'));
const xml=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const polys=(ps:number[][][])=>ps.map(p=>`<polygon points="${p.map(q=>q.join(',')).join(' ')}"/>`).join('');
const marks=places.map(p=>`<g><title>${xml(p.id+' / '+p.name)}</title><circle cx="${p.position[0]}" cy="${p.position[1]}" r="4" fill="${p.status==='planned'?'#9d7a44':'#9c4638'}"/><text x="${p.position[0]+7}" y="${p.position[1]}" font-size="9" fill="#20372e">${xml(p.id)}</text></g>`).join('');
fs.writeFileSync('output/地点ID标注图.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 0 1300 1380"><rect x="80" width="1300" height="1380" fill="#f4f3ec"/><g fill="#c2cdb3">${polys(landPolygons)}</g><g fill="#86b3b5">${polys([...lakePolygons,...residentialWaters])}</g><g fill="#c2cdb3">${polys([lakeIsland])}</g><g fill="none" stroke="#e7e4d7" stroke-width="10">${roads.map(r=>`<polyline points="${r.points.map(q=>q.join(',')).join(' ')}"/>`).join('')}</g>${marks}<text x="135" y="1340" font-family="sans-serif" font-size="18">GDUT · Stable place IDs · Schematic coordinates · North ↗</text></svg>`);
const manifest={generated:new Date().toISOString(),areas:Object.keys(areas).map(area=>({area,placeCount:places.filter(p=>p.area===area).length,buildingCount:buildings.filter(b=>places.find(p=>p.id===b.placeIds[0])?.area===area).length,generator:'src/scene/models.ts',loading:'基础体块立即生成，精模模块按区域逐步合并'})),exports:['models/library.glb','models/culture.glb','models/gdut-campus.glb','models/south-gate.glb','models/gym.glb','models/cricket.glb'].map(path=>({path,bytes:fs.existsSync(path)?fs.statSync(path).size:null,status:fs.existsSync(path)?'exported-reloaded-verified':'not-yet-exported'})),sources: sources.map(s=>({id:s.id,url:s.url,verification:s.verification})),counts:{places:places.length,built:places.filter(p=>p.status==='built').length,planned:places.filter(p=>p.status==='planned').length,buildings:buildings.length}};
fs.writeFileSync('output/asset-manifest.json',JSON.stringify(manifest,null,2));
console.log(manifest.counts);

fs.writeFileSync('output/road-guides.json',JSON.stringify(roadGuides));

