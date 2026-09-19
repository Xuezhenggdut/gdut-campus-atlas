/** Oblique illustration -> schematic ground plane.
 * Two campus grid directions estimated from road/dorm rows in the official
 * PDF and cross-checked against the supplied plan. Not a geographic CRS.
 * The previous pure rotation left the two ground axes oblique in 3D. */
// 2026-09-19: north-up Amap 2D satellite check. Main teaching/dorm rows are
// approximately E-W; use the inverse campus grid north instead of the roughly
// picked illustration compass. This removes a 4.77-degree schematic yaw, not
// a surveyed bearing correction. Original estimate is retained for provenance.
export const mapProjection={origin:[650,665] as [number,number],scale:.9,eastAxis:[.85,.53],southAxis:[-.75,.66],northOnPage:[.75,-.66],illustrationNorthEstimate:[.8,-.6],orientationBasis:'2026-09-19 Amap north-up 2D satellite visual check; approximate campus grid, not surveyed'};
const {eastAxis:a,southAxis:b,northOnPage:n}=mapProjection;
const det=a[0]*b[1]-b[0]*a[1];
const nx=(b[1]*n[0]-b[0]*n[1])/det,nz=(-a[1]*n[0]+a[0]*n[1])/det;
export const campusYaw=Math.atan2(nx,-nz);
const c=Math.cos(campusYaw),s=Math.sin(campusYaw),k=mapProjection.scale/det;
export const mapToWorldMatrix=[k*(c*b[1]-s*a[1]),k*(-c*b[0]+s*a[0]),k*(-s*b[1]-c*a[1]),k*(s*b[0]+c*a[0])] as const;
export function projectMap([u,v]:[number,number]):[number,number]{const x=u-mapProjection.origin[0],y=v-mapProjection.origin[1],m=mapToWorldMatrix;return [m[0]*x+m[1]*y,m[2]*x+m[3]*y];}
export function unprojectMap([x,z]:[number,number]):[number,number]{const m=mapToWorldMatrix,d=m[0]*m[3]-m[1]*m[2];return [(m[3]*x-m[1]*z)/d+mapProjection.origin[0],(-m[2]*x+m[0]*z)/d+mapProjection.origin[1]];}
