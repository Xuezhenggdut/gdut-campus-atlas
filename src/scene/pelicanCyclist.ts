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
export class PelicanCyclist{
 group=new T.Group();readonly rider=new T.Group();private wheels=[wheel(),wheel()];
 private legs:T.Mesh[]=[];private feet:T.Group[]=[];private crank=new T.Group();
 private elapsed=0;private readonly track=buildings.find(b=>b.id==='b-central-track')!;
 constructor(){
  this.group.name='central-track-pelican';this.rider.name='pelican-on-bicycle';
  const [x,z]=toWorld(this.track.position);this.group.position.set(x,1.8,z);this.group.rotation.y=this.track.rotation;
  this.group.add(this.rider);this.rider.scale.setScalar(1.15);
  const p=new Parts(),frame='#cf7055',cream='#fff5d9',orange='#e6a441';
  const rear:[number,number,number]=[0,.755,-1.25],front:[number,number,number]=[0,.755,1.25],hub:[number,number,number]=[0,.78,-.15],seat:[number,number,number]=[0,1.65,-.60],steer:[number,number,number]=[0,1.72,.94];
  for(const [a,b] of [[rear,seat],[seat,hub],[hub,rear],[hub,steer],[steer,seat],[steer,front]] as const)p.beam(a,b,.095,frame);
  p.beam(seat,[0,1.86,-.6],.075,'#bacbc5');p.box(.54,.13,.50,0,1.87,-.6,'#354650');
  p.beam(steer,[0,2.18,.91],.08,'#bacbc5');p.beam([-.57,2.18,.91],[.57,2.18,.91],.085,'#354650');
  // Plump white body, folded wings, a long neck and a unmistakable bill pouch.
  oval(p,0,2.47,-.45,.65,.78,.77,cream);
  oval(p,0,3.04,.05,.33,.72,.35,cream);oval(p,0,3.78,.28,.42,.42,.47,cream);
  oval(p,0,3.52,1.03,.29,.28,.74,'#edba63');
  oval(p,0,3.76,1.11,.28,.095,.87,orange);
  oval(p,0,2.24,-1.16,.24,.18,.45,'#e4e6db');
  for(const side of [-1,1]){
   oval(p,side*.54,2.48,-.55,.19,.54,.65,'#dce4dd');
   oval(p,side*.355,3.86,.44,.095,.115,.10,'#343f46');
   oval(p,side*.405,3.89,.48,.029,.035,.025,'#ffffff');
   p.beam([side*.49,2.76,-.03],[side*.51,2.18,.91],.17,cream);
  }
  this.rider.add(p.finish());
  this.wheels.forEach((w,i)=>{w.position.set(0,.755,i?1.25:-1.25);this.rider.add(w);});
  const cr=new Parts();cr.beam([-.35,0,0],[.35,0,0],.08,'#bacbc5');
  for(const side of [-1,1]){cr.beam([side*.35,0,0],[side*.35,0,side*.30],.07,'#bacbc5');}
  this.crank.add(cr.finish());this.crank.position.set(0,.78,-.15);this.rider.add(this.crank);
  const legMaterial=new T.MeshStandardMaterial({color:orange,roughness:.85});
  for(const side of [-1,1]){
   for(let i=0;i<2;i++){const leg=new T.Mesh(new T.CylinderGeometry(.065,.065,1,8),legMaterial);this.legs.push(leg);this.rider.add(leg);}
   const f=new Parts();oval(f,0,0,.10,.19,.065,.29,orange);f.box(.39,.07,.24,0,-.08,0,'#354650');const foot=f.finish();this.feet.push(foot);this.rider.add(foot);
  }
  // Static shadow maps cannot follow moving actors without ghost shadows.
  this.group.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=false;});
  this.paint();
 }
 step(delta:number,animate=true){if(!animate||!this.group.visible)return false;this.elapsed+=delta;this.paint();return true;}
 private paint(){
  const distance=this.elapsed*4.2,pose=cyclingPose(this.track.width,this.track.depth,distance);
  this.rider.position.set(pose.x,0,pose.z);this.rider.rotation.y=pose.yaw;
  const roll=distance/(.68*1.15),pedal=roll*.48;
  this.wheels.forEach(w=>w.rotation.x=roll);this.crank.rotation.x=pedal;
  for(let i=0;i<2;i++){
   const side=i?1:-1,a=pedal+(i?0:Math.PI),hip=new T.Vector3(side*.36,2.09,-.48);
   const foot=new T.Vector3(side*.38,.78-Math.sin(a)*.30,-.15+Math.cos(a)*.30);
   const knee=new T.Vector3(side*.40,(hip.y+foot.y)/2,foot.z+.35);
   for(let j=0;j<2;j++){const from=j?knee:hip,to=j?foot:knee,segment=this.legs[i*2+j],dir=to.clone().sub(from);segment.position.copy(from).add(to).multiplyScalar(.5);segment.scale.y=dir.length();segment.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());}
   this.feet[i].position.copy(foot);
  }
 }
}
