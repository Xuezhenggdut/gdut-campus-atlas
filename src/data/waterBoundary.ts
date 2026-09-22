type Point=[number,number];
const cross=(a:Point,b:Point)=>a[0]*b[1]-a[1]*b[0];
const sub=(a:Point,b:Point):Point=>[a[0]-b[0],a[1]-b[1]];
const inside=(p:Point,poly:Point[])=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
 const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;
}return hit;};
/** Boundary union for the two intersecting, simple lake polygons. Split edges
 * at intersections and discard only portions inside the other water polygon.
 * This preserves existing schematic bank vertices; it does not survey a new bank. */
export function mergeWaterBoundary(input:Point[][]):Point[][]{
 const polygons=input.map(p=>{const area=p.reduce((s,a,i)=>s+cross(a,p[(i+1)%p.length]),0);return area<0?[...p].reverse():[...p];});
 const edges:{a:Point;b:Point}[]=[];
 for(let k=0;k<polygons.length;k++){
  const poly=polygons[k];for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length],v=sub(b,a),cuts=[0,1];
   for(let j=0;j<polygons.length;j++)if(j!==k)for(let n=0;n<polygons[j].length;n++){
    const c=polygons[j][n],d=polygons[j][(n+1)%polygons[j].length],w=sub(d,c),den=cross(v,w);
    if(Math.abs(den)<1e-10)continue;
    const t=cross(sub(c,a),w)/den,u=cross(sub(c,a),v)/den;
    if(t>1e-8&&t<1-1e-8&&u>=0&&u<=1)cuts.push(t);
   }
   cuts.sort((a,b)=>a-b);
   const sample=(t:number):Point=>[a[0]+v[0]*t,a[1]+v[1]*t];
   for(let n=1;n<cuts.length;n++)if(cuts[n]-cuts[n-1]>1e-8){
    const mid=sample((cuts[n]+cuts[n-1])/2);
    if(!polygons.some((p,j)=>j!==k&&inside(mid,p)))edges.push({a:sample(cuts[n-1]),b:sample(cuts[n])});
   }
  }
 }
 const same=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6,result:Point[][]=[];
 while(edges.length){const first=edges.shift()!,ring=[first.a];let last=first.b;
  while(!same(last,ring[0])){ring.push(last);const next=edges.findIndex(e=>same(e.a,last));
   if(next<0)throw new Error('Unclosed water boundary');last=edges.splice(next,1)[0].b;
  }result.push(ring);
 }
 return result;
}
