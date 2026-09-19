import fs from 'node:fs';
import {roadSurfaceConflicts} from '../src/data/roadClearance';
const conflicts=roadSurfaceConflicts();
fs.writeFileSync('output/road-surface-audit.json',JSON.stringify({scope:'Rendered road shoulder triangles versus built body/court/field footprints; excludes gate markers and plaza surfaces, not all overhangs.',conflicts},null,2));
console.log(JSON.stringify(conflicts,null,2));
