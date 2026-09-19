"""Save the inspected revision screenshots as delivery JPEGs and record QA scope."""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
shots = sorted((root / 'output/screenshots').glob('3[0-7]-*.png'))
for shot in shots:
    with Image.open(shot) as image:
        image.convert('RGB').save(shot.with_suffix('.jpg'), quality=91)

report = {
    'date': '2026-09-19',
    'browser': 'Codex in-app Chromium',
    'viewport': [922, 898],
    'screenshots': [str(s.relative_to(root)).replace('\\', '/') for s in shots],
    'visuallyChecked': [
        'Academic roads and lake bank in overhead view',
        'Library dry platform, intervening road and flat diligence square',
        'Administrative platforms over water',
        'Meeting centre curved low roof separate from adjacent high lattice columns',
        'Research buildings external columns and four cross-building open grids',
        'Distinct outlines and rooftop details of three dining halls',
        'Innovation Valley stone and visible Chinese lettering',
    ],
    'automatedTests': {'passed': 13, 'failed': 0},
    'build': 'passed',
    'modelReloads': 'six GLB files passed; see model-reload-latest.json',
    'capturedConsoleErrors': [],
    'performanceRetested': False,
    'limits': [
        'Positions, dimensions and heights remain schematic, not surveyed',
        'No new multi-angle dining hall photography was verified in this revision',
        'Road centreline/body audit excludes overhangs and full road widths',
        'No mobile hardware or new 60-second performance measurement',
    ],
}
(root / 'output/spatial-revision-qa.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(shots)} checked screenshots converted; QA scope recorded.')
