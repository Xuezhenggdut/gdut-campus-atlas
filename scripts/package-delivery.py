from pathlib import Path
import json,base64,zipfile,struct,html
root=Path(__file__).resolve().parents[1]
out=root/'output'
for p in out.rglob('*.b64'):
    p.with_suffix('.jpg').write_bytes(base64.b64decode(p.read_text(encoding='utf-8')))
    p.unlink()
perf=json.loads((out/'performance.json').read_text(encoding='utf-8'))
landmark_perf=json.loads((out/'performance-landmarks.json').read_text(encoding='utf-8'))
data=json.loads((out/'campus-data.json').read_text(encoding='utf-8'))
layout=json.loads((out/'layout-audit.json').read_text(encoding='utf-8'))
dist_size=sum(p.stat().st_size for p in (root/'dist').rglob('*') if p.is_file())
models=[]
for p in (root/'models').glob('*.glb'):
    blob=p.read_bytes();magic,version,size=struct.unpack('<III',blob[:12]);assert magic==0x46546c67 and version==2 and size==len(blob)
    n,kind=struct.unpack('<II',blob[12:20]);doc=json.loads(blob[20:20+n]);models.append({'file':p.name,'bytes':size,'meshes':len(doc.get('meshes',[])),'nodes':len(doc.get('nodes',[])),'materials':len(doc.get('materials',[])),'gltf':doc['asset']['version']})
(out/'model-validation.json').write_text(json.dumps(models,ensure_ascii=False,indent=2),encoding='utf-8')
report=f'''# 验收报告 · 广工大学城 3D 交互地图

更新日期：2026-09-19。结论：本地可运行的第一版已交付；数据、主要交互与文件输出通过检查。严格外观还原及 45 FPS 目标存在以下未达项，未标为全面通过。

## 运行与数据

| 项目 | 结果 | 证据/边界 |
|---|---|---|
| 构建 | 通过 | TypeScript 检查与 Vite 正式构建成功；Three.js 块约 560 KB 的构建体积提示属于提示，非失败 |
| 数据检查 | 通过 | 98 个地点，96 已建、2 规划；96 个建筑/设施；ID 唯一、关联与来源均可解析 |
| 搜索覆盖 | 通过 | 基线中 96 个已建地点全部可按全名找到；教一、东十一、工大魔方、编号、类别/区域筛选验证通过 |
| 宿舍与关联 | 通过 | 东 1–14、西 1–17 单独保留；西 17 默认规划；校史馆共用图书馆模型 |
| 地面关系 | 筛查通过 | {len(layout['overlaps'])} 个主体矩形重叠、{len(layout['wet'])} 个非预期主体中心落入湖面（行政楼/综合楼预期临水）、{len(layout['roadCrossings'])} 个道路中心线穿主体；见 layout-audit.json |
| 手工视觉复核 | 通过示意检查 | 三分区相邻关系、教学楼排列、图书馆邻湖和中央绿地、主要体育场地已对照；不是测绘精度验收 |
| 一键启动与停止 | 通过 | 现有 Node 启动本地服务；端口占用时选择 4175；健康检查与令牌停止接口验证 |
| 本地资源 | 通过 | 核心 HTML/JS/CSS/图标及模型生成代码全部本地，无远程字体/纹理/解码器 |

## 球场照明、人车流动与广场树木

四组独立球场补充双灯头高杆灯，连同大型运动场共 32 根灯柱、16 盏场地灯及两盏入口灯。外环新增 26 辆车；校园新增 90 位黄色共享单车骑行者和 48 位步行学生，支持图层关闭和网址恢复。南门下层广场补充三组共 8 棵示意树木。36 项测试、正式构建及六份 GLB 重载通过，浏览器检查无错误，截图 73–77。新树木纳入建筑导出，动态人车及夜灯层仅在网页中。未重测性能；开启人车动画时持续刷新，历史静止零重复绘制结果不适用。详见 `docs/球场照明人车流动与广场树木.md`。

## 图书馆内透光与操场高杆灯

依据新增图书馆实拍，将整块外墙板改为外层金属格栅、内侧窗面和楼层灯带，保留开口与楼板层次；四处主要运动场增加高杆灯头及场内投光。32 项检查、正式构建和六份 GLB 重载通过；灯柱避让道路、水面和建筑主体，浏览器检查夜景及日间对照，无控制台错误。截图 70–72，详见 `docs/图书馆内透光与操场高杆灯.md`。灯位为示意，未重测性能；GLB 包含图书馆新几何，不含夜景光源和高杆灯层。

## 夜间灯光模式

新增独立夜间模式、深蓝星空、暖色窗灯、宿舍走廊灯、道路光斑及正门景观打光，支持 `light=night` 刷新与分享恢复。30 项检查和正式构建通过；浏览器验证日夜切换、宿舍近景与 390×844 窄屏，截图 67–69。夜景灯位为氛围示意，未逐点核实真实校园亮灯情况；未重测性能，建筑 GLB 不含夜景灯光层。详见 `docs/夜间灯光模式.md`。

## 工学综合楼连接与会议中心比例

工学一号馆与综合楼校正至同一横排，以多层连廊和顶部格架接通；地面道路保留净空，科研组团与横向道路同步调整。会议中心占地缩至工学一号馆约 33%，左侧边缘对齐；南门组团导出纳入相连的工学一号馆。28 项检查、正式构建、六份 GLB 重载与道路筛查通过，浏览器俯视和斜视检查无控制台错误；截图 65–66 替代 61–62 的相关建筑关系。详见 `docs/工学综合楼连接与会议中心比例.md`。未重测性能。

## 柱廊、大讲堂、景石与晚霞标识

草坡正后方补齐高柱格架，大讲堂位于草坡最右侧，景石移至最右草坡前缘。网页使用广工图库官方横版标识、校徽红与校训，新增日间／黄昏之外的晚霞模式，支持 URL 刷新与分享恢复。27 项检查、正式构建、六份 GLB 重载及路面冲突筛查通过；截图 61–64，含窄屏检查。详见 `docs/柱廊大讲堂景石与晚霞标识.md`。未重测性能。

## 正门草坡、广场与湖岸道路修正

按用户补充的地图圈注和卫星图，收回上一版误扩到路两侧的南岸水面，校内道路改为沿岸干地通过。正门入口道路位于广场西侧，东侧四组阶梯间保留三块绿化坡，并增加连续下层铺装广场。移动旧工大广场铺装，避免覆盖入口道路。26 项检查、正式构建及六份 GLB 重载通过；新截图 58–60 替代截图 54 的入口关系。详见 `docs/正门草坡广场与湖岸道路修正.md`。本轮未重测性能。

## 内外道路与南二路公园修订

依据用户新增的高德截图，补齐板球场外围连接，分开团结湖南侧校内弯路与外部道路，并保留绿化隔离带。东西生活区之间改为绿地、水系、步道及小桥组成的南二路公园，补充示意休息点。24 项检查、正式构建及实际路面碰撞筛查通过，浏览器截图 54–57 留存。本轮在线高德读取超时，未完成新的在线核验；没有重测性能，GLB 的建筑导出范围不含公园与道路。详见 `docs/内外道路与南二路公园修订.md`。

## 东二食堂与图书馆西岸修订

根据新增插画和地图截图，将东二食堂改为矩形后翼、侧面凹口与弧形大厅的组合；缩短图书馆西侧水道北端，补足台阶前的干地空场并排除树木。22项检查、正式构建与六份GLB重载通过，浏览器截图52–53留存。详见 `docs/东二食堂与图书馆西岸修订.md`。

## 实拍细节、天桥与南1门道路修订

按照新增实拍和地图截图，细化学生宿舍内外横栏杆、科技楼差异与多层连廊、科研楼双内院和行政楼内院、文化活动中心屋顶与前庭。广工天桥现在跨越校园内部道路，桥下通道连接教学区和东区生活区；知行大道新增西段至南1门。20 项检查、正式构建、六份 GLB 重载通过。浏览器检查留存截图 43–51，具体范围见 `docs/照片细节与天桥道路修订.md`。尺寸和桥面高差均为示意，本轮未重测帧率。

## 球场、泳池、水道与教学楼后续复核

按新增截图修正球场与环教路重叠、双泳池长轴、生活区两岸宽路及西区外围水道；教学楼增加贯通内院和高位连接梁。17 项自动检查、正式构建及六份 GLB 重新加载通过。新增路面检查使用实际路宽与路肩三角形，并纳入低矮体育设施，结果为零冲突；之前仅中心线的检查不能覆盖这些问题。详见 docs/球场泳池水道与教学楼修订.md。本轮未重测性能。

## 道路湖岸与柱廊后续修订

按用户补充截图重建教学科研道路、环教路和湖岸；图书馆平台保持干地，行政楼/综合楼在水面上，勤奋广场删除柱体；细化三座食堂、工学馆外柱与跨楼格架、会议中心高低柱间距，并增加工大创谷景石。13 项自动检查、正式构建和六份 GLB 重载通过。浏览器近景检查与具体边界见 `docs/道路湖岸与柱廊修订.md`。此次没有重测帧率。

## 高德地图第一轮校准

2026-09-19 实际查看普通地图、二维卫星和倾斜三维视角，调整约 4.77° 的示意网格偏转，补充图书馆西侧独立足球场并校正邻接小球场。9 项自动检查和构建通过，六份 GLB 重新导出并加载验证。尚未完成逐栋卫星角点和楼间距校准，不宣称测绘精度；详见 `docs/高德地图第一轮校准.md`。本轮未重测性能，以下帧率为上一轮实测。

## 官方 PDF、手绘图及照片交叉复核

最新修订包含斜视网格校正、活动中心重建与正面方向修正、两处田径场长轴修正、医院/服务中心独立建模、教学楼和四座食堂轮廓细化及宿舍连廊。当时 8 项自动检查通过；当前地面检查结果见上表，行政楼/综合楼已改为临水建筑。朝向证据逐项记录在 `docs/PDF与平面图交叉复核.md`。未将缺乏证据的建筑正门标为已确认。

## 照片及视频参考修订

目前保留 13 组官方照片及用户图示近似视角、6 个建筑方位视角、环视及手动中断、前后地标切换、镜头分享和 PNG 画面保存。修正图书馆、文化中心及体育组团几何。南门连续格架、GDUT 座席与膜棚、双泳池和板球场两侧弧壳已按本轮补充图精修，详见 `docs/南门与体育设施精修.md`。详见 `docs/照片视角复核.md` 与 `docs/视频参考与新增功能.md`。

“浏览器与交互”及“历史性能基线”部分保留首版检查；本轮独立复核记录在 `output/landmark-refinement-qa.json`，最新 60 秒实测单列于后文。

## 浏览器与交互

环境：Windows / Chromium 153，WebGL 报告显卡 Intel UHD Graphics 630，1920×1080、DPR 1；启动为默认画质，采样结束时画质为 {perf["memoryAfter"]["quality"]}。运行时可按负载降级像素比与阴影。

已验证：搜索与列表选择共用状态、URL 地点恢复、未知 ID 总览、规划 ID 自动开启图层、分类/分区定位、日间/黄昏、总览/俯视/北向复位、射线拾取、8 地标游览、手动缩放中断游览、减少动画模式不创建镜头补间、空结果清除筛选。

异常注入：禁用 WebGL 后自动进入自绘二维地图且保留搜索和详情；精模模块返回 HTTP 503 后保留基础体块，并记录加载失败。24 次反复选择仅增加一个当前选择框，纹理数保持 1；未做长时间系统内存压力测试。

移动检查：390×844、768×1024 浏览器模拟，无页面横向溢出；手机信息卡与地点列表可收起。合成触摸 PointerEvent 验证相机旋转响应，因合成事件不具有真实指针捕获，测试中临时绕过了捕获。这是模拟检查，**没有手机真机帧率、多指手势与浏览器兼容性实测**。

离线检查：运行资源仅来自 127.0.0.1；完整加载后启用浏览器 Offline 模式，地点选择与光照切换正常。未关闭本机网络适配器进行物理断网冷启动；本地服务器与静态文件均无互联网依赖，外部资料链接需要网络。

## 本轮南门与体育精修的性能复测

Chromium 153 / Intel UHD Graphics 630 / 1920×1080 / DPR 1，60 秒标准地标游览：

- 实际采样 {landmark_perf['durationMs']/1000:.2f} 秒，平均帧节拍 {landmark_perf['meanFps']:.2f} FPS，P95 帧间隔 {landmark_perf['p95FrameMs']:.1f} ms；**本机未达到 ≥45 FPS 目标**。
- 画质从 {landmark_perf['memoryBefore']['quality']} 到 {landmark_perf['memoryAfter']['quality']}。静止时跳过无变化的画面绘制，保留全部建筑细节；低性能回退使用较简单的漫反射材质及树冠几何。
- 帧节拍包含导览中的停留。实际绘制 {landmark_perf.get('renderedFrameCount','未记录')} 帧，不能将这一平均值视为持续运动时每秒绘制的帧数。另有 4.5 秒连续旋转诊断约 29.97 FPS，只作为短时观测。
- 模型加载、光照、规划图层和镜头变化触发刷新；静止 1.5 秒内 0 次重复绘制，光照与图层切换刷新检查通过。

原始数据为 `output/performance-landmarks.json`；优化前记录保留在 `output/performance-landmarks-before.json`。

## 历史性能基线与当前文件体积

下表的帧率和加载时间为首版历史测量；文件体积为当前交付物。

| 指标 | 实测 | 目标结论 |
|---|---|---|
| 标准游览 | {perf['durationMs']/1000:.2f} 秒，{perf['frames']} 帧 | 记录完整采样 |
| 平均帧率 | {perf['meanFps']:.2f} FPS | **未达到 ≥45 FPS** |
| P95 帧间隔 | {perf['p95FrameMs']:.1f} ms | 同环境空白页约 30.29 FPS，可能存在刷新/采集上限；不据此宣称其他设备一定达到 45 |
| 超过 50 ms 的帧 | {perf['framesOver50ms']} | 此次采样范围内 |
| 基础场景构造 | {perf['memoryBefore']['readyMs']} ms | 这是构造阶段耗时，不冒充完整页面导航加载时间 |
| 导航至可操作 | 0.789 秒（本地观测） | 绕过 HTTP 缓存的本地加载观测；不是所有设备保证 |
| 完整网页运行文件 | {dist_size/1000000:.3f} MB | 小于首屏 15 MB、完整网页 50 MB 的体积目标 |
| 模型导出文件 | {sum(m['bytes'] for m in models)/1000000:.2f} MB | 不作为网页首屏资源加载 |

性能原始数据在 `output/performance.json`；资源与模型文件清单在 `output/asset-manifest.json` 和 `output/model-validation.json`。

## 模型验收边界

图书馆：已查阅至少三个不同外部视角；本轮实现灰色连续面板、四面不同的内凹开口、底部支撑、分段台阶及屋顶四处小体块。立面开口编码与屋顶仍为概括，**没有达到逐窗精确复原**。

其他七个重点对象均有单独模型和展示截图。南门、体育馆、文化活动中心、工学建筑有官方实景或航拍参考；教学一号楼主要据航拍和地图体量；东一/西三食堂尚缺已核实的多角度外部照片，仅按官方插画建模。因而“7 个对象均完整符合已核实实景外观”的严格要求**尚未全部达到**。

普通楼宇采用参数化类别模型；高度、背面、细部、树木与部分小路简化。道路经过建筑包络避让细化，不能用于真实步行路线规划。建筑包络筛查不检查每一处台阶/外挑屋檐。详见 `docs/素材与简化说明.md`。

## 交付清单

正式网页 `dist/`、源码与锁文件、START/STOP 启动入口、六份 GLB、参数化生成器、地点数据/TSV/ID 标注图、资料对应表、展示截图、维护说明与本报告。校园 GLB 导出的是已建建筑和设施，不包括地形、道路、水面和全校程序化树木；包含南门广场固定树木。GLB 导出时已用 GLTFLoader 重新加载验证，另检查二进制头、长度与 JSON 结构。

未包含公网部署、真实地理定位、室内空间和实时导航。
'''
(root/'docs'/'验收报告.md').write_text(report,encoding='utf-8')
shots=sorted((out/'screenshots').glob('*.jpg'))
gallery='<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>广工漫游 · 交付截图</title><style>body{font:16px "Microsoft YaHei",sans-serif;background:#f6f5ee;color:#30443b;max-width:1320px;margin:40px auto;padding:0 24px}img{width:100%;border-radius:12px}figure{margin:30px 0}figcaption{padding:10px 0;color:#667563}</style><h1>广工漫游 · 交付截图</h1><p>大学城校区 / 示意还原 / 更新 2026-09-19。73–77 为球场照明、黄色共享单车、外环日夜车流及南门广场树木；70–72 为图书馆内透光、操场高杆灯和日间对照；67–69 为正门夜景、宿舍灯光和手机夜间模式；65–66 为工学综合楼连接、会议中心缩小与左对齐，替代 61–62 的对应建筑关系；61–64 为柱廊、大讲堂、景石、广工标识及晚霞模式；58–60 为此前正门草坡、广场及沿岸道路更正，替代 54 的入口关系；54–57 为此前内外道路和南二路公园修订；52–53 为东二食堂和图书馆西岸修订；43–51 为实拍细节、天桥和南1门道路修订；38–42 为球场、泳池、水道和教学楼修订；30–37 为道路、湖岸、食堂与柱廊修订；29 号为高德第一轮校准；24–28 为南门与体育设施精修；20–23 为前次布局修订，更早截图保留为历史。</p>'
for p in shots:gallery+=f'<figure><img src="screenshots/{p.name}" loading="lazy"><figcaption>{html.escape(p.stem)}</figcaption></figure>'
(out/'截图总览.html').write_text(gallery,encoding='utf-8')
# Only user-provided map is bundled from research; official photo caches stay private/local.
target=root/'广工大学城3D地图-本地交付.zip'
include=['src','public','dist','models','docs','tests','scripts']
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for name in include:
        for p in (root/name).rglob('*'):
            if p.is_file() and '__pycache__' not in p.parts:z.write(p,p.relative_to(root))
    for name in ['README.md','package.json','package-lock.json','tsconfig.json','vite.config.ts','index.html','START-CAMPUS.cmd','STOP-CAMPUS.cmd','THIRD_PARTY_NOTICES.txt']:
        z.write(root/name,name)
    for p in out.iterdir():
        if p.is_file() and p.suffix in ['.json','.tsv','.svg','.html']:z.write(p,p.relative_to(root))
    for p in shots:z.write(p,p.relative_to(root))
    for p in (out/'pdf-audit').glob('*'):
        if p.suffix=='.json':z.write(p,p.relative_to(root))
    for p in (out/'photo-audit').glob('*'):
        if p.suffix in ['.jpg','.json']:z.write(p,p.relative_to(root))
    z.write(root/'research/official-campus-map.pdf','research/official-campus-map.pdf')
    z.write(root/'research/handdrawn-plan.png','research/handdrawn-plan.png')
print(json.dumps({'distBytes':dist_size,'models':models,'screenshots':len(shots),'zipBytes':target.stat().st_size},ensure_ascii=False,indent=2))


