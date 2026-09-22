// Shared end clearance: the perimeter gallery is outside both the seating
// and its side stair. Dimensions are photo-fitted, not a measured survey.
export const trackGalleryDepth=4.4;
export const trackGalleryOffset=6;
export const grandstandEndGap=5;
export const grandstandSideStairOuter=4.1;
export function grandstandLength(trackWidth:number){
 return 2*(trackWidth/2+trackGalleryOffset-trackGalleryDepth/2-grandstandEndGap-grandstandSideStairOuter);
}
