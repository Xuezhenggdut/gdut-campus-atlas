import fs from 'node:fs';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {buildings,places,toWorld} from '../src/data/campus';
import {makeBuilding} from '../src/scene/models';
import {makeConnections} from '../src/scene/connections';
import {disposeTree} from '../src/scene/geometry';

// The procedural models have no raster textures. Node's Blob plus this small
// FileReader adapter lets the standard Three.js exporter run without a browser.
class BlobReader {
 result:ArrayBuffer|string|null=null;
 onloadend:(()=>void)|null=null;
 readAsArrayBuffer(blob:Blob){blob.arrayBuffer().then(data=>{this.result=data;this.onloadend?.();});}
 readAsDataURL(blob:Blob){blob.arrayBuffer().then(data=>{this.result=`data:${blob.type};base64,${Buffer.from(data).toString('base64')}`;this.onloadend?.();});}
}
Object.assign(globalThis,{FileReader:BlobReader});
const results=[];
fs.mkdirSync('models',{recursive:true});
for(const id of ['library','culture','south-gate','gym','cricket','campus']){
 let input:T.Object3D;
 if(id==='campus'){
  const g=new T.Group();g.name='GDUT-University-Town';
  buildings.filter(b=>places.find(p=>p.id===b.placeIds[0])?.status==='built').forEach(b=>g.add(makeBuilding(b)));
  g.add(makeConnections());input=g;
 }else if(id==='south-gate'){
  const g=new T.Group(),anchor=buildings.find(b=>b.id==='b-admin')!,origin=toWorld(anchor.position);g.name='GDUT-South-Entrance-Ensemble';
  for(const key of ['b-admin','b-comprehensive','b-engineering-1','b-conference','b-south-gate','b-gdut-square']){
   const child=makeBuilding(buildings.find(b=>b.id===key)!);child.position.x-=origin[0];child.position.z-=origin[1];g.add(child);
  }
  g.rotation.y=-anchor.rotation;input=g;
 }else{
  input=makeBuilding(buildings.find(b=>b.id==='b-'+id)!);input.position.set(0,0,0);input.rotation.set(0,0,0);
 }
 const data=await new GLTFExporter().parseAsync(input,{binary:true,onlyVisible:true}) as ArrayBuffer;
 disposeTree(input);
 const loaded=await new GLTFLoader().parseAsync(data,'');let meshes=0;
 loaded.scene.traverse(o=>{if(o instanceof T.Mesh){meshes++;const a=o.geometry.getAttribute('position');for(const n of a.array)if(!Number.isFinite(n))throw new Error(`Invalid vertex: ${id}`);}});
 if(!meshes)throw new Error(`Empty export: ${id}`);
 const box=new T.Box3().setFromObject(loaded.scene);disposeTree(loaded.scene);
 const file=`models/${id==='campus'?'gdut-campus':id}.glb`;fs.writeFileSync(file,Buffer.from(data));
 results.push({id,file,bytes:data.byteLength,meshes,bounds:{min:box.min.toArray(),max:box.max.toArray()},reloaded:true});
}
fs.writeFileSync('output/model-reload-latest.json',JSON.stringify({date:new Date().toISOString(),results},null,2));
console.log(results);
