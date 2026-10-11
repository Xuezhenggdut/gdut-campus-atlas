import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {CampusScene} from '../src/scene/CampusScene';
import {buildings,toWorld} from '../src/data/campus';
import {poolLightMastPositions} from '../src/scene/sportsLayout';
import {disposeTree} from '../src/scene/geometry';

test('generated tree crowns clear pool light masts, including the west south-end light',()=>{
 const vegetation=new T.Group();
 (CampusScene.prototype as unknown as {buildTrees:()=>void}).buildTrees.call({vegetation});
 const trees=vegetation.getObjectByName('campus-trees') as T.InstancedMesh;
 assert(trees.count>1300,'preserve the surrounding landscape');
 const b=buildings.find(v=>v.id==='b-gym')!,[gx,gz]=toWorld(b.position),c=Math.cos(b.rotation),s=Math.sin(b.rotation);
 const poles=poolLightMastPositions(b.width,b.depth).map(([x,z])=>[gx+x*c+z*s,gz-x*s+z*c]);
 const matrix=new T.Matrix4(),pos=new T.Vector3(),scale=new T.Vector3(),rotation=new T.Quaternion();
 for(let i=0;i<trees.count;i++){
  trees.getMatrixAt(i,matrix);matrix.decompose(pos,rotation,scale);
  assert(poles.every(([x,z])=>Math.hypot(pos.x-x,pos.z-z)>scale.x+.69),`crown ${i} intersects a pool light`);
 }
 disposeTree(vegetation);
});
