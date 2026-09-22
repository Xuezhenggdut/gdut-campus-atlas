import type {Point} from './campus';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
// Fit the inherited bank outline to the newly registered library/sports edge.
// Keep the verified administration bank and southern bridge interfaces fixed.
// This is a constrained fit, not a claim that every bank vertex is surveyed.
export function registerLakePoint([x,z]:Point):Point{
 return [x+Math.min(70,Math.max(0,(218-x)*.6))*clamp((420-z)/100),z-45*clamp((300-z)/200)];
}
