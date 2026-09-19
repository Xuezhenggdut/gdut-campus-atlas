import * as T from 'three';

export type LightMode='day'|'sunset'|'afterglow'|'night';
export function parseLightMode(value:string|null):LightMode{return value==='sunset'||value==='afterglow'||value==='night'?value:'day';}

export function makeNightSky(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=768;
 const c=canvas.getContext('2d')!,sky=c.createLinearGradient(0,0,0,768);
 sky.addColorStop(0,'#070f26');sky.addColorStop(.6,'#192b49');sky.addColorStop(1,'#40546b');c.fillStyle=sky;c.fillRect(0,0,1024,768);
 for(let i=0;i<80;i++){const x=(i*397+83)%1024,y=(i*173+37)%470;c.fillStyle=i%5?'#cbd9f46b':'#edf3ffc0';c.beginPath();c.arc(x,y,i%5?.65:1.1,0,Math.PI*2);c.fill();}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}

// One reusable procedural sky texture; no remote image or animation loop.
export function makeAfterglowSky(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=768;
 const c=canvas.getContext('2d')!,sky=c.createLinearGradient(0,0,0,768);
 sky.addColorStop(0,'#574676');sky.addColorStop(.32,'#a76d95');sky.addColorStop(.60,'#eb9c96');sky.addColorStop(.82,'#f8c19a');sky.addColorStop(1,'#bd879f');c.fillStyle=sky;c.fillRect(0,0,1024,768);
 const glow=c.createRadialGradient(815,330,3,815,330,290);glow.addColorStop(0,'#fff0cbd0');glow.addColorStop(.18,'#ffd4a270');glow.addColorStop(1,'#ffbca000');c.fillStyle=glow;c.fillRect(0,0,1024,768);
 for(let row=0;row<10;row++){
  const y=90+row*37;c.beginPath();c.moveTo(-50,y);
  for(let x=-50;x<=1100;x+=40)c.lineTo(x,y+Math.sin(x*.009+row)*9+Math.cos(x*.024+row*2)*3);
  for(let x=1100;x>=-50;x-=40)c.lineTo(x,y+8+Math.sin(x*.009+row)*11);
  c.closePath();c.fillStyle=row%2?'#f5b39c20':'#e7b4ca16';c.fill();
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
