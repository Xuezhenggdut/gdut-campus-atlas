import {buildings,toWorld} from '../data/campus';
import {teachingFloorHeight} from '../data/teachingLevels';
import {Parts} from './geometry';
import {openRail} from './facadeDetails';
import {valleyPortal} from './teachingEntrance';
export const teachingPlatformWidth=12.4;

export function teachingLinkSpans(){
 return [[5,6],[3,4],[1,2]].flatMap(([front,rear])=>{
  const a=buildings.find(b=>b.id===`b-teaching-${front}`)!,b=buildings.find(b=>b.id===`b-teaching-${rear}`)!;
  const [ax,az]=toWorld(a.position),[bx,bz]=toWorld(b.position);
  const lo=Math.max(ax-a.width/2,bx-b.width/2),hi=Math.min(ax+a.width/2,bx+b.width/2);
  return [.22,.78].map((t,i)=>{
   const inner=(front===5&&i===1)||(front===3&&i===0),side=front===5?-1:1;
   return {x:inner?valleyPortal.center[0]+side*(valleyPortal.width/2+1.8):lo+(hi-lo)*t,
    z0:bz+b.depth/2-.7,z1:az-a.depth/2+.7,lowerWidth:inner?3.6:teachingPlatformWidth};
  });
 });
}
/** A broad lower pedestrian platform and two upper galleries, all elevated
 * over the existing cross street. Gaps between decks remain open courtyards.
 * The connecting edges share a common storey datum with the teaching blocks. */
export function makeTeachingLinks(p:Parts){
 const width=3.6,levels=[1,2,3].map(n=>1.19+n*teachingFloorHeight),top=levels[2];
 for(const {x,z0,z1,lowerWidth} of teachingLinkSpans()){
  for(const y of levels){
   const deckWidth=y===levels[0]?lowerWidth:width;
   p.box(deckWidth,.42,z1-z0,x,y,(z0+z1)/2,y===levels[0]?'#d8d8bd':'#748b71');
   for(const side of [-1,1])openRail(p,[x+side*deckWidth/2,y+.22,z0],[x+side*deckWidth/2,y+.22,z1],'#4e746b',4,.10);
  }
  // Supports stay at the building landings; no post stands in the road.
  for(const z of [z0+.4,z1-.4])for(const side of [-1,1])p.cylinder(.30,top-.5,x+side*(width/2-.25),(top+.5)/2,z,'#ded7bd',.30,10);
  for(const z of [z0+.4,z1-.4])for(const side of [-1,1])p.cylinder(.32,levels[0]-.5,x+side*(lowerWidth/2-.4),(levels[0]+.5)/2,z,'#ded7bd',.32,10);
 }
}
