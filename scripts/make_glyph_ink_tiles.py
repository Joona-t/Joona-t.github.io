"""Seamless glyph-ink tiles for the "charcoal" section titles (basalt + parchment).

The Forge Notebook's title is letterforms made of tiny dense hatch strokes. These tiles fill any heading with the same
texture through background-clip: text, so every major title gets it without per-title artwork (Joona 2026-11-12:
"all major titles to have the charcoal text"). Gaps between strokes are transparent, so the page ground shows through.

Writes assets/glyph-ink-basalt.png (beige ink) and assets/glyph-ink-parchment.png (charcoal ink), 320 px tiles meant
for background-size: 160px (2x for retina). Run with a Python that has Playwright.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "assets"
INKS = {"basalt": "#e6d6ad", "parchment": "#2b2219"}
HTML = """<!doctype html><canvas id=c width=320 height=320></canvas><script>
function draw(ink){
  const c=document.getElementById('c'), x=c.getContext('2d'); x.clearRect(0,0,320,320);
  const RAMP=['╷','┆','╎','¦','│','┃','║','|',':','!'];       // strokes, like the notebook's field and title
  let s=7; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; };   // seeded: the same tile every run
  x.font='bold 13px ui-monospace, Menlo, monospace'; x.textAlign='center'; x.textBaseline='middle'; x.fillStyle=ink;
  const CW=5, CH=10;                                            // 320 is a multiple of both: the tile is seamless
  for(let r=0;r<320/CH;r++) for(let k=0;k<320/CW;k++){
    if (rnd()<0.06) continue;                                   // a few gaps read as dry charcoal
    x.globalAlpha=0.7+0.3*rnd();
    x.fillText(RAMP[Math.floor(rnd()*RAMP.length)], k*CW+CW/2+(rnd()-0.5)*1.5, r*CH+CH/2+(rnd()-0.5)*2);
  }
}
</script>"""

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 320, "height": 320})
    pg.set_content(HTML)
    for name, ink in INKS.items():
        pg.evaluate(f"draw('{ink}')")
        pg.locator("#c").screenshot(path=str(OUT / f"glyph-ink-{name}.png"), omit_background=True)
    b.close()
print("tiles:", [str(OUT / f"glyph-ink-{n}.png") for n in INKS])
