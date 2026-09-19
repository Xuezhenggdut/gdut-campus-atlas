from pathlib import Path
import json,base64,html,math
root=Path(__file__).resolve().parents[1];out=root/'output/photo-audit'
for p in out.glob('*.b64'):
    p.with_suffix('.jpg').write_bytes(base64.b64decode(p.read_text()));p.unlink()
views=json.loads((out/'views.json').read_text(encoding='utf-8'))
notes={
'library-aerial':'已修正：下调主体高宽比，改为连续灰色面板与内凹开口，补充四处屋顶小体块、细栏杆与分段台阶。仍有差异：开口位置、屋顶小构件和坡地仅概括；周边楼距受示意底图影响。',
'library-reverse':'交叉检查另一侧：立面采用不同开口组合，避免四面复制。尚不能逐窗验证，也未还原所有屋顶设备。',
'library-ground':'地面视角检查白色支撑、架空底部和入口台阶；已减少向外突出的方格块。底部暗色空间、柱间距及台阶组合仍需更清晰近景核实。',
'library-lake':'湖面与图书馆建立了对应，但具体机位置信度较低。原片夕阳导致的金黄不作为材质固有色；湖岸曲率、栏杆、绿化遮挡仍有明显简化。',
'culture-front':'已重建活动中心弧形前厅、薄屋檐、白柱、礼堂体块、坡形采光带及分开的台阶，修正落点和朝向，使入口面向挑战路；内部与精确尺寸未还原。',
'sports-aerial':'已把白色膜棚移到体育馆与田径场之间，取消泳池外侧的重复尖棚；体育馆采用浅坡屋顶，跑道改为直道加半圆弯道。看台结构与泳池细部仍为概括。',
'gate-front':'已对应南门入口建筑组团，不将照片当成独立门楼。照片中的连续高柱框架与当前两栋框架模型仍有差异；未获得足够证据确定连接形式，列为待修正。'}

notes.update({
'gate-front':'已重建行政楼与综合楼向入口空间延伸的通透格架、高柱及柱身分节、楼层阳台、阶梯绿坡、旗杆和校名石。石上文字为本地字形示意，不是原石书法的复制；各构件尺寸仍为近似。',
'gate-aerial':'从斜俯视检查两条平行格架与建筑、广场的连接。照片用于外观，PDF 用于平面布置；不能从单张正面照片恢复精确跨度。',
'stadium-front':'看台分成蓝、绿、红、绿、蓝座席区；GDUT 由白色座席组成。补充阶梯通道、两端楼梯、六跨薄膜棚、支柱拉索、上层玻璃廊和照明杆。实际座位数、膜结构受力与中央校徽细纹未复原。',
'gym-plan':'正俯视可辨认 GDUT 座席；膜棚边缘已让出主要字样。主馆为折坡屋顶与玻璃带，旁侧保留两处开放球场、双泳池及平台构件。层高、泳道和屋面采光构件数量均为示意。',
'sports-aerial':'重做主馆、双泳池、开放球场、看台与膜棚的整体关系，保持看台朝向田径场。较早航拍中座席较浅，当前座席颜色依据用户提供的较清晰照片；该照片日期未核实。',
'cricket-aerial':'去除足球场线条，增加椭圆边界、草坪条带、中央板球球道，重建后侧橙色看台与高挑白色弧棚、前侧较低灰白弧壳。主要依据 PDF；背面与壳体剖面缺少近景实证。'
})

svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1340"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3Z" fill="#ad4435"/></marker></defs><image href="/__review/ref/map.png" width="1280" height="1946"/><rect y="1265" width="1280" height="75" fill="#faf9f0"/>']
for i,v in enumerate(views,1):
    b=v['building'];u,w=b['position'];cx,cy,cz=v['localCamera'];r=b['rotation'];dx=cx*math.cos(r)+cz*math.sin(r);dz=-cx*math.sin(r)+cz*math.cos(r)
    m=v.get('projectionMatrix',[.54,.72,-.72,.54]);det=m[0]*m[3]-m[1]*m[2];pu=u+(m[3]*dx-m[1]*dz)/det;pv=w+(-m[2]*dx+m[0]*dz)/det
    tx,_,tz=v.get('localTarget',[0,0,0]);tdx=tx*math.cos(r)+tz*math.sin(r);tdz=-tx*math.sin(r)+tz*math.cos(r);tu=u+(m[3]*tdx-m[1]*tdz)/det;tv=w+(-m[2]*tdx+m[0]*tdz)/det
    svg.append(f'<path d="M{pu:.1f},{pv:.1f} L{tu:.1f},{tv:.1f}" stroke="#ad4435" stroke-width="4" stroke-dasharray="7 5" marker-end="url(#arrow)"/><circle cx="{pu:.1f}" cy="{pv:.1f}" r="15" fill="#304b40"/><text x="{pu:.1f}" y="{pv+5:.1f}" fill="white" text-anchor="middle" font-size="14">{i}</text>')
svg.append('<text x="35" y="1305" font-size="22" fill="#304b40">推测的示意机位与朝向 · 非真实 GPS / 非测绘定位</text></svg>');(out/'map.svg').write_text(''.join(svg),encoding='utf-8')
doc=['<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>广工 · 照片视角复核</title><style>body{margin:0;background:#f5f5ed;color:#31483a;font:15px/1.8 "Microsoft YaHei",sans-serif}main{max-width:1440px;margin:50px auto;padding:0 28px}h1{font-size:34px}small,.muted{color:#75816f}a{color:#8c493a}section{padding:25px;background:#fffef9;border:1px solid #e0e5d6;border-radius:14px;margin:30px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0}img{width:100%;height:390px;object-fit:contain;background:#e9ede1;border-radius:8px}figcaption{font-size:12px;margin-top:8px}summary{cursor:pointer}.map{height:auto;max-height:750px}button{font:inherit;padding:8px 14px;background:#e8eddf;border:0;border-radius:7px;cursor:pointer}@media(max-width:760px){.pair{grid-template-columns:1fr}main{padding:0 15px}img{height:auto}}</style><main><small>GDUT / PHOTO ALIGNMENT REVIEW / 2026-09-19</small><h1>让照片与校园模型面对面</h1><p>13 组照片与图示对照，覆盖图书馆、文化活动中心、体育组团、南门组团和板球场。最新修订重点为南门连续格架、GDUT 座席及板球场弧形壳体。先用地标相邻关系推断拍摄方向，再检查模型轮廓与立面。以下是人工拟合的近似机位，不是摄影测量重建；不能把对照图视为全部通过。低机位附近减少了随机示意树木，以便检查建筑立面。</p><p>官网原片仅在本地查阅，未放入公开网页运行资源。<a href="/">返回校园地图 →</a></p><details><summary>查看官方鸟瞰图与用户提供的手绘平面图</summary><div class="pair"><figure><a href="ref/map.png" target="_blank"><img src="ref/map.png" alt="官方 PDF 鸟瞰图"></a><figcaption>官方 PDF：名称、轮廓和建筑群关系</figcaption></figure><figure><a href="ref/handdrawn-plan.png" target="_blank"><img src="ref/handdrawn-plan.png" alt="用户提供的手绘平面图"></a><figcaption>手绘图：横纵排列和道路连接；年份不明，不据此更新名称</figcaption></figure></div><p>两图结合用于校正原先纯旋转布置所保留的斜视变形；不是 GIS 配准。活动中心弧形入口朝挑战路、两处田径场长轴方向已修正。<a href="ground.svg" target="_blank">查看全部建筑地面包络与活动中心正面箭头</a></p></details><details><summary>查看底图上的推测机位与拍摄方向</summary><img class="map" src="map.svg" alt="十三组示意机位及视线方向"/></details>']
for i,v in enumerate(views,1):
    ident=v['id'];esc=html.escape
    note=notes.get(ident,'活动中心依据 PDF 与六张实景重建，入口朝挑战路，体育场在背后；镜头位置和细部尺寸仍是近似。')
    before=ident if (out/(ident+'-before.jpg')).exists() else ('gate-v2' if ident.startswith('gate') else 'cricket-v2' if ident.startswith('cricket') else 'sports-v2' if ident.startswith(('stadium','gym')) else 'culture-front')
    doc.append(f'<section id="{ident}"><small>VIEW {i:02d} / {esc(v["placeId"])}</small><h2>{esc(v["title"])}</h2><div class="pair"><figure><img src="ref/{v["image"]}.jpg" alt="参考照片或图示" loading="lazy"><figcaption>参考照片或图示 · <a href="{v["source"]}" target="_blank" rel="noreferrer">打开原始参考</a></figcaption></figure><figure><img src="render/{ident}-after.jpg" alt="修正后的模型近似视角" loading="lazy"><figcaption>修正后的模型 · <a href="/?place={v["placeId"]}&photo={ident}">在三维地图中打开此视角 →</a></figcaption></figure></div><p>{esc(note)}</p><p class="muted">定位证据：{esc(v["evidence"])}<br>置信度：{esc(v["confidence"])}</p><details><summary>查看修正前模型</summary><p>修正前用于观察几何变化；部分参考机位随后重新拟合，前后截图并非严格同像素对齐。原参数保存在 before-views.json，最新参数在 views.json。</p><img src="render/{before}-before.jpg" alt="修正前的示意模型" loading="lazy"></details></section>')
doc.append('<p>仍待补充：南门精确尺度及原石书法、板球场壳体背面、体育看台校徽细纹、工学一号馆的单栋确认、食堂多角度外观和湖岸地形。照片不足的结构没有标为已核实。</p></main></html>')
(root/'research/photo-view-review.html').write_text(''.join(doc),encoding='utf-8')
print('Photo review generated: 13 views')
