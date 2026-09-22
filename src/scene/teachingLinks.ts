import {buildings,toWorld} from '../data/campus';
import {teachingFloorHeight} from '../data/teachingLevels';
import {Parts} from './geometry';
import {openRail} from './facadeDetails';

export function teachingLinkSpans(){
 return [[5,6],[3,4],[1,2]].flatMap(([front,rear])=>{
  const a=buildings.find(b=>b.id===`b-teaching-${front}`)!,b=buildings.find(b=>b.id===`b-teaching-${rear}`)!;
  const [ax,az]=toWorld(a.position),[bx,bz]=toWorld(b.position);
  const lo=Math.max(ax-a.width/2,bx-b.width/2),hi=Math.min(ax+a.width/2,bx+b.width/2);
  return [.22,.78].map(t=>({x:lo+(hi-lo)*t,z0:bz+b.depth/2-.7,z1:az-a.depth/2+.7}));
 });
}
/** Three shallow gallery decks, open below over the existing cross street.
 * The connecting edges share a common storey datum with the teaching blocks. */
export function makeTeachingLinks(p:Parts){
 const width=3.6,levels=[1,2,3].map(n=>1.19+n*teachingFloorHeight),top=levels[2];
 for(const {x,z0,z1} of teachingLinkSpans()){
  for(const y of levels){
   p.box(width,.42,z1-z0,x,y,(z0+z1)/2,'#748b71');
   for(const side of [-1,1])openRail(p,[x+side*width/2,y+.22,z0],[x+side*width/2,y+.22,z1],'#4e746b',4,.10);
  }
  // Supports stay at the building landings; no post stands in the road.
  for(const z of [z0+.4,z1-.4])for(const side of [-1,1])p.cylinder(.30,top-.5,x+side*(width/2-.25),(top+.5)/2,z,'#ded7bd',.30,10);
 }
}
