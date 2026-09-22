import type {Point} from './campus';

// One straight outer-road datum for both the eastern residences and the
// engineering frontage. Retain the north/south perimeter tie points; the
// intermediate district registration must not introduce another bend.
export const eastBoundaryNorth:Point=[311.935352112676,-438.862779342723];
export const eastBoundarySouth:Point=[867.634,173.718];
export const eastMiddleJunctionZ=-205.03508397456642;
export function eastBoundaryAt(z:number):Point{
 const t=(z-eastBoundaryNorth[1])/(eastBoundarySouth[1]-eastBoundaryNorth[1]);
 return [eastBoundaryNorth[0]+t*(eastBoundarySouth[0]-eastBoundaryNorth[0]),z];
}

/** Trim the old district ground outline to the shared public-road boundary. */
export function clipToEastBoundary(polygon:Point[]):Point[]{
 const result:Point[]=[],distance=(p:Point)=>p[0]-eastBoundaryAt(p[1])[0];
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],da=distance(a),db=distance(b);
  if(da<=0)result.push(a);
  if((da<=0)!==(db<=0)){const t=da/(da-db);result.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
 }
 return result;
}
