"""Layout check for one Sneak Peeks panel on lovespark.love, opened, in every theme at desktop, tablet and phone width.
Fails on: sideways page scroll; story or caption text outside the panel; text on text; an image that did not load or
overflows the viewport. Saves a screenshot per theme x width (whole panel, never cropped) for a human look.
    python3.13 scripts/check_gallery_panel.py [panel-id] [--out dir]      (serves this checkout itself)
Exit 1 on any problem.
"""
import functools, http.server, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith("--")]
PANEL = args[0] if args else "gal-kotoba-village"
OUT = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else ROOT / ".verify" / "panel"
OUT.mkdir(parents=True, exist_ok=True)
THEMES = ["basalt", "parchment", "bubblegum", "pink"]
WIDTHS = [("desktop", 1440, 900), ("tablet", 768, 1024), ("phone", 390, 844)]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


http.server.ThreadingHTTPServer.request_queue_size = 128   # default backlog 5 resets Chromium's parallel connections
httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{httpd.server_address[1]}/"

PROBE = """(id) => {
  const out = [], W = innerWidth, panel = document.getElementById(id);
  if (!panel) return ['panel #' + id + ' missing'];
  if (document.documentElement.scrollWidth > W + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth} in ${W})`);
  const body = panel.querySelector('.gallery-body').getBoundingClientRect();
  const lines = [];
  for (const e of panel.querySelectorAll('.gallery-story p, .gallery-caption, .category-title')) {
    const r = document.createRange(); r.selectNodeContents(e);
    const fs = parseFloat(getComputedStyle(e).fontSize);
    for (const q of r.getClientRects()) { if (!q.width) continue; const m = (q.top + q.bottom) / 2;
      lines.push({ e, l: q.left, r: q.right, t: m - fs * .5, b: m + fs * .5, txt: e.textContent.trim().slice(0, 30) }); }
    if (!e.classList.contains('category-title')) for (const q of r.getClientRects())
      if (q.width && (q.right > body.right + 1 || q.left < body.left - 1)) { out.push('text outside the panel: ' + JSON.stringify(e.textContent.trim().slice(0, 30))); break; }
  }
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const a = lines[i], b = lines[j]; if (a.e === b.e) continue;
    const w = Math.min(a.r, b.r) - Math.max(a.l, b.l), h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    if (w > 2 && h > 2) out.push(`text on text: ${JSON.stringify(a.txt)} / ${JSON.stringify(b.txt)}`);
  }
  for (const img of panel.querySelectorAll('img')) {
    const r = img.getBoundingClientRect();
    if (!img.complete || !img.naturalWidth) out.push('image not loaded: ' + img.getAttribute('src'));
    if (r.right > W + 1 || r.left < -1) out.push('image overflows the viewport: ' + img.getAttribute('src'));
  }
  for (const cap of panel.querySelectorAll('figcaption')) {   // caption must sit below its own image, not on it
    const img = cap.parentElement.querySelector('img').getBoundingClientRect(), c = cap.getBoundingClientRect();
    if (c.top < img.bottom - 1) out.push('caption overlaps its image: ' + JSON.stringify(cap.textContent.trim().slice(0, 30)));
  }
  return out; }"""

problems = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for wname, w, h in WIDTHS:
        pg = b.new_page(viewport={"width": w, "height": h})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(BASE); pg.wait_for_load_state("networkidle")
        for theme in THEMES:
            pg.click(f'.theme-pill[data-theme="{theme}"]'); pg.wait_for_timeout(900)
            pg.evaluate(f"(() => {{ const d = document.getElementById('{PANEL}'); d.open = true; d.querySelectorAll('img').forEach(i => {{ i.loading = 'eager'; }}); d.scrollIntoView(); }})()")
            for k in range(pg.locator(f"#{PANEL} img").count()):   # lazy images: bring each into view so it is fetched
                pg.locator(f"#{PANEL} img").nth(k).scroll_into_view_if_needed()
            ALL_OK = f"[...document.getElementById('{PANEL}').querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0)"
            try:
                pg.wait_for_function(ALL_OK, timeout=30000)
            except Exception:   # one retry of any broken image, then report
                pg.evaluate(f"document.getElementById('{PANEL}').querySelectorAll('img').forEach(i => {{ if (i.complete && !i.naturalWidth) i.src = i.getAttribute('src') + '?retry=1'; }})")
                try: pg.wait_for_function(ALL_OK, timeout=15000)
                except Exception: pass
                print(wname, theme, "images still loading:", pg.evaluate(f"[...document.getElementById('{PANEL}').querySelectorAll('img')].map(i => i.getAttribute('src').slice(-6) + ':' + i.complete + '/' + i.naturalWidth + '/' + i.loading)"))
            pg.evaluate(f"document.getElementById('{PANEL}').scrollIntoView()")
            pg.wait_for_timeout(300)
            bad = pg.evaluate(PROBE, PANEL) + [f"page error: {e}" for e in errs]
            problems += len(bad)
            pg.locator(f"#{PANEL}").screenshot(path=str(OUT / f"{wname}-{theme}.png"))
            print(f"{wname:7} {theme:9} {'OK' if not bad else 'FAIL: ' + '; '.join(bad[:6])}")
        pg.close()
    b.close()
httpd.shutdown()
print(f"PANEL_CHECK {PANEL}: {problems} problems over {len(THEMES) * len(WIDTHS)} theme x width combinations -> {OUT}")
sys.exit(1 if problems else 0)
