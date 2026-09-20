import * as T from 'three';
import {Parts} from './geometry';

// Decorative groups on open water, away from the island and entrance platforms.
export function makeLakeDucks(){
 const flock=new T.Group();flock.name='tuanjie-lake-white-ducks';
 for(const [x,z,heading] of [[210,265,.4],[216,270,.7],[210,280,.2],[218,340,-1],[224,346,-.8],[231,339,-1.1]]){
  const p=new Parts();
  const oval=(rx:number,ry:number,rz:number,px:number,py:number,pz:number,color:string)=>{
   const g=new T.SphereGeometry(1,12,8);g.scale(rx,ry,rz);p.add(g,color,[px,py,pz]);
  };
  oval(1.45,.72,.86,0,.7,0,'#fffdf5');
  oval(.83,.23,.58,-.12,1.2,.15,'#edece4');
  oval(.48,.64,.45,.94,1.33,0,'#fffdf5');
  oval(.55,.5,.48,1.12,1.85,0,'#fffdf5');
  oval(.44,.13,.27,1.7,1.75,0,'#e4a33e');
  for(const side of [-1,1])oval(.08,.08,.04,1.3,1.98,side*.43,'#293632');
  const duck=p.finish();duck.position.set(x,.14,z);duck.rotation.y=heading;flock.add(duck);
 }
 return flock;
}

// Small independent loops stay within the open-water patches.
export function swimLakeDucks(flock:T.Group,time:number){
 flock.children.forEach((duck,i)=>{
  const home=duck.userData.home??(duck.userData.home=duck.position.clone());
  const phase=time*.12+i*.8;
  duck.position.set(home.x+2*Math.sin(phase),.14+.06*Math.sin(time*1.3+i),home.z+1.4*(Math.cos(phase)-1));
  duck.rotation.y=Math.atan2(1.4*Math.sin(phase),2*Math.cos(phase));
 });
}

