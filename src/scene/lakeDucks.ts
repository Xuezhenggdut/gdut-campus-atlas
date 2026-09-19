import * as T from 'three';
import {Parts} from './geometry';

// Decorative groups on open water, away from the island and entrance platforms.
export function makeLakeDucks(){
 const flock=new T.Group();flock.name='tuanjie-lake-white-ducks';
 for(const [x,z,heading] of [[210,265,.4],[216,270,.7],[224,264,.2],[245,330,-1],[252,334,-.8],[259,329,-1.1]]){
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
