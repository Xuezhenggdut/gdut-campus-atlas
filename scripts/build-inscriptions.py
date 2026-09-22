"""Extract just the inscription outlines used by the campus models (no font embedding)."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen

class OutlinePen(BasePen):
    def __init__(self, glyphs):
        super().__init__(glyphs)
        self.commands = []
    def point(self, op, *points):
        self.commands.append([op, *[round(n, 2) for point in points for n in point]])
    def _moveTo(self, point): self.point('M', point)
    def _lineTo(self, point): self.point('L', point)
    def _qCurveToOne(self, control, point): self.point('Q', control, point)
    def _curveToOne(self, a, b, point): self.point('C', a, b, point)
    def _closePath(self): self.commands.append(['Z'])
    def _endPath(self): pass

root = Path(__file__).resolve().parents[1]
for filename, fontname, text in [
    ('library-inscription.json', 'STKAITI.TTF', '圖書館'),
    ('gate-inscription.json', 'STXINGKA.TTF', '广东工业大学'),
    ('culture-motto.json', 'STXINGKA.TTF', '以美育人文化明游泳'),
]:
    font = TTFont(Path('C:/Windows/Fonts') / fontname)
    glyphset, cmap = font.getGlyphSet(), font.getBestCmap()
    outlines = {}
    for char in dict.fromkeys(text):
        pen = OutlinePen(glyphset)
        glyphset[cmap[ord(char)]].draw(pen)
        outlines[char] = pen.commands
    data = {'em': font['head'].unitsPerEm, 'glyphs': outlines}
    (root / 'src/data' / filename).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
