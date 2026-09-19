"""Refine schematic road corridors around building ground envelopes; no real navigation claim."""
import json, math, heapq
import numpy as np
from collections import deque
from pathlib import Path
data=json.loads(Path('output/campus-data.json').read_text(encoding='utf-8'))
raw=json.loads(Path('output/road-guides.json').read_text(encoding='utf-8'))
built={p['id'] for p in data['places'] if p['status']=='built'}
obs=[b for b in data['buildings'] if b['height']>4 and b['kind']!='gate' and b['placeIds'][0] in built]
step=4
m=data['sceneConfig']['mapToWorldMatrix']
grids={}
def reachable_grid(margin):
    if margin in grids:return grids[margin]
    xx,yy=np.meshgrid(np.arange(361)*step,np.arange(361)*step,indexing='ij');occupied=np.zeros((361,361),dtype=bool)
    for b in obs:
        dx=xx-b['position'][0];dy=yy-b['position'][1];wx=m[0]*dx+m[1]*dy;wz=m[2]*dx+m[3]*dy;c=math.cos(b['rotation']);s=math.sin(b['rotation'])
        occupied|=(np.abs(wx*c-wz*s)<b['width']/2+margin)&(np.abs(wx*s+wz*c)<b['depth']/2+margin)
    seen=np.zeros_like(occupied);todo=deque([(0,0)]);seen[0,0]=True
    while todo:
        x,y=todo.popleft()
        for nx,ny in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
            if 0<=nx<=360 and 0<=ny<=360 and not occupied[nx,ny] and not seen[nx,ny]:seen[nx,ny]=True;todo.append((nx,ny))
    grids[margin]=seen;return seen
def blocked(x,y,margin):
    for b in obs:
        dx=x-b['position'][0];dy=y-b['position'][1]
        wx=m[0]*dx+m[1]*dy;wz=m[2]*dx+m[3]*dy;c=math.cos(b['rotation']);s=math.sin(b['rotation'])
        if abs(wx*c-wz*s)<b['width']/2+margin and abs(wx*s+wz*c)<b['depth']/2+margin:return True
    return False
def route(a,b,margin):
    start=tuple(round(v/step) for v in a);end=tuple(round(v/step) for v in b)
    accessible=reachable_grid(margin)
    def bad(p):return not (0<=p[0]<=360 and 0<=p[1]<=360 and accessible[p[0],p[1]])
    def snap(p):
        if not bad(p):return p
        for radius in range(1,35):
            candidates=[(p[0]+dx,p[1]+dy) for dx in range(-radius,radius+1) for dy in [-radius,radius]]+[(p[0]+dx,p[1]+dy) for dy in range(-radius+1,radius) for dx in [-radius,radius]]
            candidates.sort(key=lambda q:math.dist(q,p))
            for q in candidates:
                if not bad(q):return q
        raise RuntimeError('No corridor endpoint')
    start=snap(start);end=snap(end)
    q=[(0,start)];g={start:0};prev={};limit=0;closed=set()
    while q:
        _,p=heapq.heappop(q)
        if p in closed:continue
        closed.add(p)
        if p==end:break
        limit+=1
        if limit>150000:raise RuntimeError('No path')
        for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]:
            n=(p[0]+dx,p[1]+dy)
            if bad(n) or (dx and dy and (bad((p[0]+dx,p[1])) or bad((p[0],p[1]+dy)))):continue
            # Favor the provided map corridor over unnecessary excursions.
            vx=end[0]-start[0];vy=end[1]-start[1];ll=max(1,vx*vx+vy*vy)
            t=max(0,min(1,((n[0]-start[0])*vx+(n[1]-start[1])*vy)/ll))
            dev=math.hypot(n[0]-start[0]-t*vx,n[1]-start[1]-t*vy)
            cost=g[p]+math.hypot(dx,dy)+dev*.045
            if cost<g.get(n,1e30):g[n]=cost;prev[n]=p;heapq.heappush(q,(cost+math.dist(n,end),n))
    pts=[end]
    while pts[-1]!=start:pts.append(prev[pts[-1]])
    pts.reverse()
    def clear(a,b):
        n=max(1,math.ceil(math.dist(a,b)*2))
        return all(not bad((round(a[0]+(b[0]-a[0])*t/n),round(a[1]+(b[1]-a[1])*t/n))) for t in range(n+1))
    result=[pts[0]];i=0
    while i<len(pts)-1:
        j=len(pts)-1
        while j>i+1 and not clear(pts[i],pts[j]):j-=1
        result.append(pts[j]);i=j
    return [[x*step,y*step] for x,y in result]

result=[]
for r in raw:
    pts=[]
    for a,b in zip(r['points'],r['points'][1:]):
        part=route(a,b,r['width']*.45+3)
        # Neighboring segments share the same snapped control point.
        pts.extend(part if not pts else part[1:])
    result.append({**r,'points':pts})
Path('src/data/road-routes.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
print('Refined',len(result),'schematic road corridors')
