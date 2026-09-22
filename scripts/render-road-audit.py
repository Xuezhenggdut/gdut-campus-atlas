"""Render source plan and numbered road overlays for a manual road audit."""
import json
import sys
from pathlib import Path
import fitz

out = Path('output/road-audit23')
stage = sys.argv[1] if len(sys.argv) > 1 else 'before'
roads = json.loads((out / f'{stage}.json').read_text(encoding='utf-8'))
zones = {
    'west': (433, 237, 616, 352),
    'east': (692, 227, 889, 352),
    'sports': (555, 355, 785, 491),
    'teaching': (765, 337, 981, 446),
    'research': (838, 436, 1083, 607),
    'lake': (690, 438, 867, 626),
}
doc = fitz.open('research/planning-campus-9930141.pdf')
page = doc[0]
for name, box in zones.items():
    page.get_pixmap(matrix=fitz.Matrix(5,5), clip=fitz.Rect(box), alpha=False).save(out / f'{name}-source.png')
for road in roads:
    pts = [fitz.Point(p) for p in road['pdf']]
    page.draw_polyline(pts, color=(.0,.35,1), width=.75, stroke_opacity=.9, overlay=True)
    # Put a label at the middle of each road, keeping source lines visible.
    p = pts[len(pts)//2]
    page.insert_text(p, road['id'], fontsize=3.4, color=(.75,0,.3), overlay=True)
for name, box in zones.items():
    page.get_pixmap(matrix=fitz.Matrix(5,5), clip=fitz.Rect(box), alpha=False).save(out / f'{name}-{stage}-overlay.png')
print('Rendered six source / overlay pairs')
