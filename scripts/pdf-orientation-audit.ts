import fs from 'node:fs';
import {buildings,toWorld,places} from '../src/data/campus';
import {unprojectMap} from '../src/data/projection';
const out='output/pdf-audit';fs.mkdirSync(out,{recursive:true});
const knownFront:Record<string,string>={'b-culture':'弧形入口朝挑战路；中心田径场在背后。PDF 与图库 culture-2/3/5、手绘图交叉确认。','b-library':'方体保持校园主轴；入口分布在多个面，不将某一张照片视为四面的统一正立面。','b-gym':'泳池在主馆侧前方；膜棚位于主馆与中心田径场之间。','b-admin':'面向南门入口广场；连续高格架已细化，会议中心位于格架东侧，柱距为示意。','b-comprehensive':'与行政楼构成南门组团。'};
const rows=buildings.filter(b=>b.width).map(b=>{const [x,z]=toWorld(b.position),c=Math.cos(b.rotation),s=Math.sin(b.rotation);const footprint=([[-1,-1],[1,-1],[1,1],[-1,1]] as [number,number][]).map(([u,v])=>unprojectMap([x+u*b.width/2*c+v*b.depth/2*s,z-u*b.width/2*s+v*b.depth/2*c]));const end=unprojectMap([x+Math.sin(b.rotation)*25,z+Math.cos(b.rotation)*25]);return {id:b.id,name:places.find(p=>p.id===b.placeIds[0])?.name,groundAnchor:b.position,footprint,frontIndicator:end,rotation:b.rotation,orientationEvidence:knownFront[b.id]??'长轴按 PDF 校园网格校验；仅凭该图不能确认的正门方向未标为已核实。'};});
fs.writeFileSync(out+'/orientation-audit.json',JSON.stringify(rows,null,2));
const marks=rows.map(b=>`<g><title>${b.id} / ${b.name} / ${b.orientationEvidence}</title><polygon points="${b.footprint.map(p=>p.join(',')).join(' ')}" fill="${b.id==='b-culture'?'#ffb052':'#278897'}" fill-opacity=".18" stroke="${b.id==='b-culture'?'#b44828':'#16778c'}" stroke-width="1"/><circle cx="${b.groundAnchor[0]}" cy="${b.groundAnchor[1]}" r="2" fill="#b44828"/>${b.id==='b-culture'?`<path d="M${b.groundAnchor.join(',')} L${b.frontIndicator.join(',')}" stroke="#b44828" stroke-width="2.5" marker-end="url(#arrow)"/>`:''}</g>`).join('');
fs.writeFileSync(out+'/ground-overlay.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 35 1190 1260"><defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#b44828"/></marker></defs><image href="/__review/ref/map.png" width="1280" height="1946"/>${marks}</svg>`);
console.log({footprints:rows.length,culture:rows.find(b=>b.id==='b-culture')});

