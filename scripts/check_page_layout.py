"""Layout check for HTML pages with their own theme and font pickers (the Bvby Ash page by default). Exit 1 on any problem.

For every theme button ([data-set-theme]) and every font option (#fontPick) at 2560, 1920, 1280, 1024, 768, 390 and 360 px
wide, it scrolls the
whole page (so lazy images load) and fails when:
  1. the page scrolls sideways (2026-11-22: the first Bvby Ash draft was 407 px wide on a 390 px phone);
  2. two pieces of text overlap (text on text);
  3. text spills out of its own box (scrollWidth past clientWidth) or off the screen;
  4. an image fails to load;
  5. an animated strip marked data-check-full="<item selector>" has an empty stretch at either end at any sampled moment
     (2026-11-22: the Claudio conga bar was only filled to ~1100 px; at 1920 px its right 795 px were empty).
Every theme and font is read from the page, so a new one is covered without editing this file.

Usage: python3 scripts/check_page_layout.py [path-under-repo, default bvby-ash/] [--shots DIR]
Needs Playwright (the framework Python 3.13 on the MacBook has it).
"""
import functools, http.server, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
argv = sys.argv[1:]
shots = argv[argv.index("--shots") + 1] if "--shots" in argv else None
args = [a for i, a in enumerate(argv) if not a.startswith("--") and (i == 0 or argv[i - 1] != "--shots")]
page_path = (args[0] if args else "bvby-ash/").lstrip("/")
WIDTHS = ((2560, 1200), (1920, 1080), (1280, 900), (1024, 768), (768, 1024), (390, 844), (360, 740))

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{httpd.server_address[1]}/{page_path}"

IMAGES = r"""async () => {  // every image must decode; a fresh load each, so a lazy or half-loaded one is not a false alarm
  const bad = [];
  await Promise.all([...document.images].map(async (img) => {
    const t = new Image(); t.src = img.currentSrc || img.src;
    try { await t.decode(); } catch (e) { bad.push(`image failed: ${img.getAttribute("src")}`); }
  }));
  return bad;
}"""

STRIPS = r"""() => [...document.querySelectorAll("[data-check-full]")].map((bar) => {
  const b = bar.getBoundingClientRect(), kids = [...bar.querySelectorAll(bar.dataset.checkFull)].map((e) => e.getBoundingClientRect());
  if (!kids.length) return [bar.className, Math.round(b.width)];
  const left = Math.min(...kids.map((r) => r.left)), right = Math.max(...kids.map((r) => r.right));
  return [bar.className, Math.round(Math.max(left - b.left, b.right - right))];
})"""

JS = r"""() => {
  const out = [], vw = document.documentElement.clientWidth;
  scrollTo(9999, scrollY); const sx = scrollX; scrollTo(0, scrollY);   // can the page actually be moved sideways?
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 1 || sx > 0) out.push(`sideways scroll: page is ${sw}px wide in a ${vw}px window`);
  const visible = (el) => { const s = getComputedStyle(el); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05; };
  // text leaves: elements with their own non-blank text node
  const leaves = [...document.body.querySelectorAll("*")].filter((el) =>
    !el.closest("svg, canvas, script, style, .skip-link, [aria-hidden='true']") && visible(el) &&
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const boxes = leaves.map((el) => {
    const r = document.createRange(); r.selectNodeContents(el);
    // a line's client rect is the font's whole ascent+descent box, which overlaps the next line under a tight
    // line-height without any ink touching; keep the glyph core (centre +- 0.42 em) for the text-on-text test
    const half = parseFloat(getComputedStyle(el).fontSize) * 0.42;
    const rects = [...r.getClientRects()].filter((q) => q.width > 1 && q.height > 1).map((q) => {
      const c = (q.top + q.bottom) / 2; return { left: q.left, right: q.right, top: c - half, bottom: c + half };
    });
    return { el, rects };
  });
  const name = (el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""} "${el.textContent.trim().slice(0, 28)}"`;
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i];
    for (const q of a.rects) if (q.left < -1 || q.right > vw + 1) { out.push(`off screen: ${name(a.el)}`); break; }
    const s = getComputedStyle(a.el);
    if (a.el.scrollWidth > a.el.clientWidth + 1 && a.el.clientWidth > 0 && s.display !== "inline" && s.overflowX !== "visible")
      out.push(`text spills out of its box: ${name(a.el)} (${a.el.scrollWidth} > ${a.el.clientWidth})`);
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const hit = a.rects.some((p) => b.rects.some((q) =>
        Math.min(p.right, q.right) - Math.max(p.left, q.left) > 2 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 2));
      if (hit) out.push(`text on text: ${name(a.el)} / ${name(b.el)}`);
    }
  }
  return out;
}"""

fails, combos = [], 0
with sync_playwright() as p:
    browser = p.chromium.launch()
    probe = browser.new_page(); probe.goto(URL)
    themes = probe.eval_on_selector_all("[data-set-theme]", "els => els.map(e => e.dataset.setTheme)") or [""]
    fonts = probe.eval_on_selector_all("#fontPick option", "els => els.map(e => e.value)") or [""]
    probe.close()
    for w, h in WIDTHS:
        page = browser.new_page(viewport={"width": w, "height": h}, reduced_motion="no-preference")  # motion on: the animated Claudios are what overflowed
        errors = []
        page.on("pageerror", lambda e: errors.append(f"page error: {e}"))
        page.goto(URL, wait_until="networkidle")
        for y in range(0, page.evaluate("document.body.scrollHeight") + h, h // 2):  # load lazy images
            page.evaluate(f"scrollTo(0, {y})"); page.wait_for_timeout(60)
        page.wait_for_load_state("networkidle"); page.evaluate("scrollTo(0, 0)")
        fails += [f"[{w}px] {m}" for m in page.evaluate(IMAGES)]
        for t in themes:
            if t: page.click(f"[data-set-theme='{t}']")
            for f in fonts:
                page.select_option("#fontPick", f); page.evaluate("document.fonts.ready"); page.wait_for_timeout(150)
                combos += 1
                widest, gaps = 0, {}
                for _ in range(10):  # animated art moves: sample about three seconds for the worst moment
                    widest = max(widest, page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth"))
                    for name, gap in page.evaluate(STRIPS): gaps[name] = max(gaps.get(name, 0), gap)
                    page.wait_for_timeout(300)
                for name, gap in gaps.items():
                    if gap > 120:  # more than one Claudio and its gap missing
                        fails.append(f"[{w}px · {t or 'default'} · {f or 'theme font'}] strip not full: .{name} has {gap}px empty at an end")
                if widest > 1: fails.append(f"[{w}px · {t or 'default'} · {f or 'theme font'}] sideways scroll: up to {widest}px wider than the window while animating")
                for msg in page.evaluate(JS):
                    fails.append(f"[{w}px · {t or 'default'} · {f or 'theme font'}] {msg}")
                if shots and f == "":
                    page.screenshot(path=f"{shots}/{page_path.strip('/').replace('/', '_') or 'home'}-{t}-{w}.png", full_page=True)
        fails += [f"[{w}px] {e}" for e in errors]
        page.close()
    browser.close()

for msg in fails: print("FAIL", msg)
print(f"{combos} combinations checked ({len(themes)} themes x {len(fonts)} fonts x {len(WIDTHS)} widths): {len(fails)} problems")
sys.exit(1 if fails else 0)
