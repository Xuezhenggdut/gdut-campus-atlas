import * as T from 'three';
import {buildings,toWorld} from '../data/campus';
import {Parts} from './geometry';

// Follow a capsule lane at constant speed, including both straight sections.
// An ellipse would cut across the grass near the straight/curve transitions.
export function cyclingLap(width:number,depth:number){return 2*(width-depth)+2*Math.PI*(depth/2-3.8);}
export function cyclingPose(width:number,depth:number,distance:number){
 const r=depth/2-3.8,s=(width-depth)/2,line=2*s,arc=Math.PI*r;
 let t=((distance%cyclingLap(width,depth))+cyclingLap(width,depth))%cyclingLap(width,depth);
 if(t<line)return {x:-s+t,z:-r,yaw:Math.PI/2};
 t-=line;
 if(t<arc){const a=-Math.PI/2+t/r;return {x:s+r*Math.cos(a),z:r*Math.sin(a),yaw:-a};}
 t-=arc;
 if(t<line)return {x:s-t,z:r,yaw:-Math.PI/2};
 const a=Math.PI/2+(t-line)/r;return {x:-s+r*Math.cos(a),z:r*Math.sin(a),yaw:-a};
}
function oval(p:Parts,x:number,y:number,z:number,sx:number,sy:number,sz:number,color:string){
 const g=new T.SphereGeometry(1,16,12);g.scale(sx,sy,sz);p.add(g,color,[x,y,z]);
}
function wheel(){
 const p=new Parts();
 p.add(new T.TorusGeometry(.68,.075,6,24),'#343a40',[0,0,0],[0,Math.PI/2,0]);
 p.add(new T.TorusGeometry(.58,.022,4,24),'#c5d4cf',[0,0,0],[0,Math.PI/2,0]);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;p.beam([0,0,0],[0,Math.sin(a)*.59,Math.cos(a)*.59],.025,'#c5d4cf');}
 p.add(new T.CylinderGeometry(.10,.10,.25,8),'#e9c86b',[0,0,0],[0,0,Math.PI/2]);
 return p.finish();
}
// Two fixed-length limb segments; the knee bends forward as the pedal moves.
export function pedalingLeg(side:number,angle:number,bob=0){
 const hip=new T.Vector3(side*.43,2.02+bob,-.52);
 const foot=new T.Vector3(side*.43,.78-Math.sin(angle)*.30,-.15+Math.cos(angle)*.30);
 const dy=foot.y-hip.y,dz=foot.z-hip.z,d=Math.hypot(dy,dz),length=.86;
 const bend=Math.sqrt(Math.max(0,length*length-d*d/4));
 const knee=new T.Vector3(side*.43,(hip.y+foot.y)/2+dz/d*bend,(hip.z+foot.z)/2-dy/d*bend);
 return {hip,knee,foot};
}
function curve(p:Parts,points:number[][],radius:number,color:string){
 const path=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v as [number,number,number])));
 p.add(new T.TubeGeometry(path,16,radius,8,false),color);
}
function webbedFoot(p:Parts,color:string){
 const shape=new T.Shape();shape.moveTo(-.07,-.12);shape.quadraticCurveTo(-.19,-.08,-.23,.30);
 shape.lineTo(-.09,.23);shape.lineTo(0,.34);shape.lineTo(.10,.23);shape.lineTo(.23,.30);shape.quadraticCurveTo(.18,-.08,.07,-.12);shape.closePath();
 const g=new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,steps:1});
 g.rotateX(Math.PI/2);p.add(g,color,[0,.035,0]);
 for(const x of [-.13,0,.13])p.beam([0,.041,-.03],[x,.041,.21],.015,'#ca913e');
}
export class PelicanCyclist{
 group=new T.Group();readonly rider=new T.Group();private wheels=[wheel(),wheel()];
 private legs:T.Mesh[]=[];private feet:T.Group[]=[];private crank=new T.Group();
 private bird=new T.Group();private head=new T.Group();private eyes:T.Group[]=[];private steering=new T.Group();
 private elapsed=0;private readonly track=buildings.find(b=>b.id==='b-central-track')!;
 constructor(){
  this.group.name='central-track-pelican';this.rider.name='pelican-on-bicycle';
  const [x,z]=toWorld(this.track.position);this.group.position.set(x,1.8,z);this.group.rotation.y=this.track.rotation;
  this.group.add(this.rider);this.rider.scale.setScalar(1.15);
  const p=new Parts(),frame='#cf7055',cream='#fff5d9',orange='#e6a441';
  const rear:[number,number,number]=[0,.755,-1.25],front:[number,number,number]=[0,.755,1.25],hub:[number,number,number]=[0,.78,-.15],seat:[number,number,number]=[0,1.65,-.60],steer:[number,number,number]=[0,1.72,.94];
  for(const [a,b] of [[rear,seat],[seat,hub],[hub,rear],[hub,steer],[steer,seat]] as const)p.beam(a,b,.095,frame);
  p.beam(seat,[0,1.86,-.6],.075,'#bacbc5');p.box(.54,.13,.50,0,1.87,-.6,'#354650');
  // Rear chain, mudguard and a steered front assembly give the bicycle depth.
  const chain=new T.CatmullRomCurve3([new T.Vector3(-.10,.89,-1.25),new T.Vector3(-.10,1.02,-.15),new T.Vector3(-.10,.54,-.15),new T.Vector3(-.10,.64,-1.25)],true);
  p.add(new T.TubeGeometry(chain,32,.022,5,true),'#566461');
  for(const side of [-1,1])p.beam([side*.12,.755,-1.25],[side*.12,1.65,-.60],.055,frame);
  this.rider.add(p.finish());
  const frontParts=new Parts();
  for(const side of [-1,1])frontParts.beam([side*.12,steer[1],steer[2]-1.25],[side*.12,front[1],0],.075,frame);
  frontParts.beam([0,1.72,-.31],[0,2.18,-.34],.08,'#bacbc5');
  curve(frontParts,[[-.55,2.14,-.22],[-.46,2.21,-.38],[.46,2.21,-.38],[.55,2.14,-.22]],.055,'#bacbc5');
  for(const side of [-1,1])frontParts.beam([side*.55,2.14,-.22],[side*.39,2.19,-.33],.09,'#354650');
  this.steering.position.z=1.25;this.steering.add(frontParts.finish());this.rider.add(this.steering);
  const body=new Parts();
  oval(body,0,2.40,-.51,.59,.66,.77,cream);
  oval(body,0,2.68,-.02,.34,.52,.39,cream);
  // The curved neck joins the breast to a smaller head; the long upper bill
  // tapers to a tip over a distinct hanging pouch instead of a duck-like beak.
  curve(body,[[0,2.55,.04],[0,3.03,-.04],[0,3.48,.12],[0,3.70,.32]],.23,cream);
  oval(body,0,2.18,-1.16,.24,.14,.44,'#dfe5dc');
  for(const side of [-1,1]){
   oval(body,side*.48,2.47,-.57,.18,.43,.59,'#e2e8df');
   curve(body,[[side*.48,2.67,-.33],[side*.64,2.37,.10],[side*.50,2.15,.96]],.13,'#e2e8df');
   for(let i=0;i<3;i++)curve(body,[[side*(.52+i*.028),2.44,-.63],[side*(.57+i*.025),2.28,-.26],[side*(.51+i*.02),2.18,.52+i*.12]],.033,'#cbd7d0');
  }
  this.bird.add(body.finish());this.rider.add(this.bird);
  const headParts=new Parts();this.head.position.set(0,3.68,.30);
  oval(headParts,0,0,0,.35,.34,.43,cream);
  oval(headParts,0,-.24,.77,.245,.235,.81,'#efc376');
  const bill=new T.ConeGeometry(1,1,4);bill.scale(.27,1.80,.070);bill.rotateX(Math.PI/2);headParts.add(bill,orange,[0,-.055,1.06]);
  curve(headParts,[[0,-.10,.27],[0,-.12,1.04],[0,-.055,1.91]],.018,'#b6803b');
  this.head.add(headParts.finish());this.bird.add(this.head);
  for(const side of [-1,1]){
   const eye=new Parts();oval(eye,0,0,0,.036,.065,.065,'#344044');oval(eye,side*.025,.021,.025,.015,.018,.018,'#ffffff');
   const g=eye.finish();g.position.set(side*.318,.085,.16);this.head.add(g);this.eyes.push(g);
  }
  this.wheels[0].position.set(0,.755,-1.25);this.rider.add(this.wheels[0]);
  this.wheels[1].position.set(0,.755,0);this.steering.add(this.wheels[1]);
  const cr=new Parts();cr.beam([-.35,0,0],[.35,0,0],.08,'#bacbc5');
  for(const side of [-1,1]){cr.beam([side*.35,0,0],[side*.35,0,side*.30],.07,'#bacbc5');}
  this.crank.add(cr.finish());this.crank.position.set(0,.78,-.15);this.rider.add(this.crank);
  const legMaterial=new T.MeshStandardMaterial({color:orange,roughness:.85});
  for(const side of [-1,1]){
   for(let i=0;i<2;i++){const leg=new T.Mesh(new T.CylinderGeometry(.065,.065,1,8),legMaterial);this.legs.push(leg);this.rider.add(leg);}
   const f=new Parts();webbedFoot(f,orange);f.box(.44,.07,.24,0,-.08,0,'#354650');const foot=f.finish();this.feet.push(foot);this.rider.add(foot);
  }
  // Static shadow maps cannot follow moving actors without ghost shadows.
  this.group.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=false;});
  this.paint();
 }
 step(delta:number,animate=true){if(!animate||!this.group.visible)return false;this.elapsed+=delta;this.paint();return true;}
 private paint(){
  const distance=this.elapsed*4.2,pose=cyclingPose(this.track.width,this.track.depth,distance);
  this.rider.position.set(pose.x,0,pose.z);this.rider.rotation.y=pose.yaw;
  const roll=distance/(.755*1.15),pedal=roll*.48,bob=.018*Math.sin(pedal*2);
  this.wheels.forEach(w=>w.rotation.x=roll);this.crank.rotation.x=pedal;
  const behind=cyclingPose(this.track.width,this.track.depth,distance-1.6),ahead=cyclingPose(this.track.width,this.track.depth,distance+1.6);
  const turn=Math.atan2(Math.sin(ahead.yaw-behind.yaw),Math.cos(ahead.yaw-behind.yaw));
  this.steering.rotation.y=turn*.9;this.bird.position.y=bob;this.head.rotation.x=.025*Math.sin(pedal);
  const blink=this.elapsed%5.3,open=blink<.16?Math.max(.12,Math.abs(blink-.08)/.08):1;
  this.eyes.forEach(e=>e.scale.y=open);
  for(let i=0;i<2;i++){
   const side=i?1:-1,a=pedal+(i?0:Math.PI),{hip,knee,foot}=pedalingLeg(side,a,bob);
   for(let j=0;j<2;j++){const from=j?knee:hip,to=j?foot:knee,segment=this.legs[i*2+j],dir=to.clone().sub(from);segment.position.copy(from).add(to).multiplyScalar(.5);segment.scale.y=dir.length();segment.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());}
   this.feet[i].position.copy(foot);
  }
 }
}
