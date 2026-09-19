"""Read official campus references. Photos remain research-only, outside web public/."""
import requests, pathlib, json, concurrent.futures
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from PIL import Image,ImageOps,ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
CACHE=ROOT/'research'/'cache';CACHE.mkdir(parents=True,exist_ok=True)
pages={
 'library':'https://photo.gdut.edu.cn/info/1294/1959.htm',
 'aerial':'https://photo.gdut.edu.cn/info/1294/1962.htm',
 'engineering':'https://photo.gdut.edu.cn/info/1294/1835.htm',
 'sports':'https://photo.gdut.edu.cn/info/1294/1837.htm',
 'culture':'https://photo.gdut.edu.cn/info/1294/2584.htm',
 'gate':'https://gzb.gdut.edu.cn/info/1123/1980.htm',
 'recent':'https://photo.gdut.edu.cn/info/1294/2688.htm',
 'west-dining':'https://gzb.gdut.edu.cn/gzfc/dxcxq.htm',
}
def inspect(pair):
 key,url=pair
 try:
  r=requests.get(url,timeout=25);r.raise_for_status();soup=BeautifulSoup(r.content,'html.parser')
  imgs=[]
  for im in soup.find_all('img'):
   src=im.get('src','')
   if '__local/' in src:
    u=urljoin(url,src)
    if u not in imgs:imgs.append(u)
  result={'id':key,'url':url,'title':soup.title.get_text() if soup.title else key,'images':imgs,'text':soup.get_text(' ',strip=True)}
  (CACHE/(key+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
  # A small representative set; the contact sheet records indexes back to original URLs.
  for i,u in enumerate(imgs[:8]):
   try:
    p=CACHE/f'{key}-{i}.jpg';rr=requests.get(u,timeout=20);rr.raise_for_status();p.write_bytes(rr.content)
   except Exception as e:print(key,i,str(e))
  return result
 except Exception as e:return {'id':key,'url':url,'error':str(e)}
results=list(concurrent.futures.ThreadPoolExecutor(4).map(inspect,pages.items()))
(ROOT/'research'/'source-index.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
for key in pages:
 files=sorted(CACHE.glob(key+'-*.jpg'))
 if not files:continue
 sheet=Image.new('RGB',(1200,230*((len(files)+3)//4)),'#f3f1ea');draw=ImageDraw.Draw(sheet)
 for i,p in enumerate(files):
  try:
   im=Image.open(p).convert('RGB');im.thumbnail((294,200));x=(i%4)*300;y=(i//4)*230;sheet.paste(im,(x,y));draw.text((x+5,y+203),p.stem,fill='black')
  except Exception:pass
 sheet.save(CACHE/(key+'-sheet.jpg'))
print(json.dumps([{'id':x['id'],'count':len(x.get('images',[])),'error':x.get('error')} for x in results]))
