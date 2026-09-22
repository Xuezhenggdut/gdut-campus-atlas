/** Nominal local width: preserve the named route while narrowing its park section. */
export function roadWidthAt(name:string|undefined,x:number,z:number,width:number){
 if(name==='环教路'&&z<50&&x>=105)return 6+(width-6)*Math.min(1,(x-105)/35);
 if(name==='环教路'&&z<221.6)return 6+(width-6)*Math.max(0,Math.min(1,(z-174)/47.6));
 if(name==='知行大道（南1门段）'&&x>-205)return width+(6-width)*Math.min(1,(x+205)/65);
 return width;
}
