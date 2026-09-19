from pathlib import Path
from PIL import Image
import html
root=Path(__file__).resolve().parents[1];cache=root/'research/cache'
im=Image.open(cache/'map.png')
crops={'south-gate':(520,978,802,1180),'gym':(399,470,601,613),'culture':(599,591,741,689),'engineering-1':(719,1011,880,1119),'teaching-1':(947,816,1185,964),'east-dining-1':(1060,422,1144,521),'west-dining-3':(421,350,560,420)}
for name,box in crops.items():im.crop(box).resize((720,round((box[3]-box[1])*720/(box[2]-box[0])))).save(cache/f'reference-{name}.jpg')
rows=[('图书馆：地面外观','library-0.jpg','06-library.jpg','外部体量、开口与底部构造；模型视角为近似，非照片匹配重建。'),('图书馆：湖侧','library-6.jpg','14-library-lakeside.jpg','凹凸立面、湖畔支撑；不可見侧面及面板位置概括。'),('图书馆：高位斜视','library-5.jpg','15-library-reverse.jpg','主体比例、围合屋顶、台阶；屋面细部简化。')]
ids=['south-gate','gym','culture','engineering-1','teaching-1','east-dining-1','west-dining-3']
for i,name in enumerate(ids):rows.append((name,f'reference-{name}.jpg',f'{i+7:02d}-{name}.jpg','左侧为用户提供的官方插画裁切；右侧为参数化微缩模型。食堂尚缺多角度实景证据。' if 'dining' in name else '左侧为主底图体量及位置对照；实景参考来源见素材说明。'))
text='<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>建模参考对照</title><style>body{font:16px "Microsoft YaHei",sans-serif;max-width:1440px;margin:32px auto;background:#f6f4ed;color:#334638}section{margin:36px 0}.pair{display:grid;grid-template-columns:1fr 1.4fr;gap:20px;align-items:center}img{width:100%}p{color:#687664}</style><h1>大学城校区 · 模型参考对照</h1><p>本文件包含官网照片的本地研究引用，不包含在网页发布包中。不是逐窗或测绘精度验收。实景与模型取景角度并非完全一致。</p>'
for label,ref,shot,note in rows:text+=f'<section><h2>{html.escape(label)}</h2><div class="pair"><img src="cache/{ref}"><img src="../output/screenshots/{shot}"></div><p>{html.escape(note)}</p></section>'
(root/'research/参考对照.html').write_text(text,encoding='utf-8')
print('Created local research comparison for 3 library views and 7 landmarks.')
