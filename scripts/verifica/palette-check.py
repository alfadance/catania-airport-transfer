# Cerca pixel saturi fuori dalle tinte della palette (arancione, blu navy), escluse le foto.
import sys, json, colorsys
from PIL import Image
img = Image.open(sys.argv[1]).convert('RGB'); W, H = img.size
rects = json.load(open(sys.argv[1] + '.imgs.json'))
mask = Image.new('1', (W, H), 0); from PIL import ImageDraw; d = ImageDraw.Draw(mask)
for x, y, w, h in rects:
    if w * h > 0: d.rectangle([x - 2, y - 2, x + w + 2, y + h + 2], fill=1)
px, mk = img.load(), mask.load(); bad = {}
for y in range(0, H, 2):
    for x in range(0, W, 2):
        if mk[x, y]: continue
        r, g, b = px[x, y]; hh, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255); hue = hh * 360
        if s < 0.25 or v < 0.12: continue           # neutri, grigi, quasi neri
        if 18 <= hue <= 42: continue                 # arancioni (#EE8211, #ff8f24 e antialias)
        if 195 <= hue <= 225: continue               # blu navy e sue sfumature
        k = (y // 200 * 200, round(hue / 20) * 20); bad.setdefault(k, [0, (r, g, b), (x, y)]); bad[k][0] += 1
tot = sum(v[0] for v in bad.values())
print(f'{sys.argv[1].split("/")[-1]}: {W}x{H}, pixel fuori palette (campione 1 su 4): {tot}')
for (band, hue), (n, rgb, xy) in sorted(bad.items(), key=lambda kv: -kv[1][0])[:12]:
    print(f'  y~{band:5d} tinta~{hue:3d}  n={n:5d}  es. rgb{rgb} a {xy}')
