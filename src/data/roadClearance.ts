import {buildings,places,toWorld,type Point} from './campus';
import {roads} from './landscape';
import {pathMesh} from '../scene/geometry';
// Test the rendered road shoulder triangles, not only the centreline. Includes
// low sports surfaces; gate markers and plazas intentionally meet roads.
function overlap(a:Point[],b:Point[]){
 for(const poly of [a,b])for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],nx=q[1]-p[1],nz=p[0]-q[0];
  const aa=a.map(v=>v[0]*nx+v[1]*nz),bb=b.map(v=>v[0]*nx+v[1]*nz);
  if(Math.min(Math.max(...aa),Math.max(...bb))-Math.max(Math.min(...aa),Math.min(...bb))<=.01)return false;
 }return true;
}
export function roadSurfaceConflicts(){
 const footprints=buildings.filter(b=>!['lake','gate','plaza'].includes(b.kind)&&places.find(p=>p.id===b.placeIds[0])?.status==='built').map(b=>{
  const [x,z]=toWorld(b.position),c=Math.cos(b.rotation),s=Math.sin(b.rotation);
  const polygon=([[-1,-1],[1,-1],[1,1],[-1,1]] as Point[]).map(([u,v])=>[x+u*b.width/2*c+v*b.depth/2*s,z-u*b.width/2*s+v*b.depth/2*c] as Point);
  return {b,polygon};
 });
 const conflicts:{id:string;road:string;roadIndex:number;segment:number;points:Point[]}[]=[];
 roads.forEach((road,roadIndex)=>{
  const mesh=pathMesh(road.points.map(toWorld),road.width*.9+3,'#ffffff'),pos=mesh.geometry.getAttribute('position'),index=mesh.geometry.index!;
  for(const {b,polygon} of footprints){
   for(let i=0;i<index.count;i+=3){const tri=[0,1,2].map(j=>{const k=index.getX(i+j);return [pos.getX(k),pos.getZ(k)] as Point;});
    if(overlap(polygon,tri)){conflicts.push({id:b.id,road:road.name??'内部道路',roadIndex,segment:Math.floor(i/6),points:road.points.slice(Math.floor(i/6),Math.floor(i/6)+2)});break;}
   }
  }mesh.geometry.dispose();if(!Array.isArray(mesh.material))mesh.material.dispose();
 });return conflicts;
}

