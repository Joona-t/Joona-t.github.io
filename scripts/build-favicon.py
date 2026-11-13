#!/usr/bin/env python3
"""Draw lovespark.love's tab icon: the alchemical fire triangle with the eye 𓁿 and its beams inside.

Tab sizes (16, 32, 48) are the triangle and eye alone on a transparent background, with strokes
thickened so they survive at 16 px. The home-screen icons (180, 192, 512) put the same mark on a
dark basalt tile. The eye is placed at the largest size that stays clear of the triangle's stroke;
the script fails if it cannot, so the two never touch.

Writes favicon.ico, favicon-16.png, favicon-32.png, apple-touch-icon.png, icon-192.png and
icon-512.png at the repo root. Needs Pillow and macOS's Noto Sans Egyptian Hieroglyphs.

Run from the repo root: python3 scripts/build-favicon.py [--preview DIR]
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = "/System/Library/Fonts/Supplemental/NotoSansEgyptianHieroglyphs-Regular.ttf"
EYE = "\U0001307F"  # 𓁿
ROSE = (224, 90, 104)  # #e05a68: the T-Forge tinted rose, brightened for browser tabs
TILE = (22, 23, 26)  # basalt
S = 512  # drawing canvas; every size is downscaled from this


def triangle(side, stroke, cy_shift=0):
    h = side * 3 ** 0.5 / 2
    cx, cy = S / 2, S / 2 + cy_shift
    pts = [(cx, cy - h * 0.62), (cx - side / 2, cy + h * 0.38), (cx + side / 2, cy + h * 0.38)]
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).line(pts + [pts[0], pts[1]], fill=255, width=stroke, joint="curve")
    inside = Image.new("L", (S, S), 0)
    ImageDraw.Draw(inside).polygon(pts, fill=255)
    return mask, inside, cx, cy


def eye_mask(size, cx, cy, dy, weight):
    font = ImageFont.truetype(FONT, size)
    layer = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(layer)
    box = d.textbbox((0, 0), EYE, font=font)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text((cx - w / 2 - box[0], cy + dy - h / 2 - box[1]), EYE, font=font, fill=255)
    return layer.filter(ImageFilter.MaxFilter(weight))


def mark(side, stroke, weight, gap):
    """The triangle and the largest eye that fits inside it with `gap` px clearance."""
    tri, inside, cx, cy = triangle(side, stroke, cy_shift=20)
    allowed = ImageChops.subtract(inside, tri.filter(ImageFilter.MaxFilter(2 * gap + 1)))
    def fits(m):
        return ImageChops.subtract(m, allowed).getbbox() is None

    best = None
    for dy in range(-20, 71, 10):  # binary search the largest fitting size at each height
        lo, hi, found = 20, 460, None
        while lo <= hi:
            mid = (lo + hi) // 2
            m = eye_mask(mid, cx, cy, dy, weight)
            if fits(m):
                found, lo = (mid, m), mid + 1
            else:
                hi = mid - 1
        if found and (best is None or found[0] > best[0]):
            best = found
    if best is None:
        sys.exit("no eye size fits inside the triangle")
    return ImageChops.lighter(tri, best[1]), best[0]


def colourise(alpha, colour, bg=None):
    img = Image.new("RGBA", (S, S), (*colour, 0))
    img.putalpha(alpha)
    if bg is None:
        return img
    tile = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(tile).rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.22), fill=(*bg, 255))
    return Image.alpha_composite(tile, img)


def main():
    # Tab mark: fills the canvas, heavy strokes for 16-48 px. Home-screen mark: lighter, inset on a tile.
    tab, tab_eye = mark(side=490, stroke=48, weight=15, gap=22)
    home, home_eye = mark(side=350, stroke=26, weight=7, gap=17)
    print(f"tab eye {tab_eye}px, home eye {home_eye}px (both clear of the triangle)")

    tab_img = colourise(tab, ROSE)
    home_img = colourise(home, ROSE, bg=TILE)
    out = {
        "favicon-16.png": tab_img.resize((16, 16), Image.LANCZOS),
        "favicon-32.png": tab_img.resize((32, 32), Image.LANCZOS),
        "apple-touch-icon.png": home_img.resize((180, 180), Image.LANCZOS),
        "icon-192.png": home_img.resize((192, 192), Image.LANCZOS),
        "icon-512.png": home_img.resize((512, 512), Image.LANCZOS),
    }
    dest = Path(sys.argv[2]) if len(sys.argv) == 3 and sys.argv[1] == "--preview" else ROOT
    dest.mkdir(parents=True, exist_ok=True)
    for name, img in out.items():
        img.save(dest / name)
    tab_img.resize((48, 48), Image.LANCZOS).save(dest / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"wrote {', '.join(list(out) + ['favicon.ico'])} to {dest if dest != ROOT else 'the repo root'}")


if __name__ == "__main__":
    main()
