"""Geometry check for every SVG figure (diagrams and charts) on a page (forge-notebook by default), in every theme, every reading
font and three widths. Run before every merge or publish; exit 1 on any problem.

Fails when:
  1. a box (rect.box) partly overlaps another box: it must be fully inside or fully outside it
     (2026-11-12: "load test" ran onto the vLLM-mode frame's edge);
  2. a label (text) leaves the svg viewBox, or straddles a box edge without sitting inside the box;
  3. a line's real path (not its bounding box) runs through a label and the line shows through the text: the label has
     no halo (paint-order stroke), or the line is painted after the label, so a halo cannot mask it
     (2026-11-12: "clients call in parallel, no lock" sat behind its arrows; then "no NVLink: card to card over PCIe"
     had two arrows drawn over it and v1 passed it, because it only asked whether a halo existed);
  4. two labels overlap each other;
  5. the page scrolls sideways.
Every theme and font is read from the page's own Font & Theme menu, so a new one is covered without editing this file.

Usage: python3 scripts/check_svg_diagrams.py [url-or-file] [--quick]      --quick: default theme and font only
Needs Playwright (the framework Python 3.13 on the MacBook has it).
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

argv = sys.argv[1:]
args = [a for a in argv if not a.startswith("--")]
target = args[0] if args else str(Path(__file__).resolve().parent.parent / "forge-notebook" / "index.html")
url = target if "://" in target else Path(target).resolve().as_uri()
WIDTHS = (1280, 768, 390)

JS = r"""() => {
  const out = [], EPS = 0.5, PAD = 6;   // a box inside another needs PAD px of margin from its edges
  const inside = (a, b) => a.x >= b.x - EPS && a.y >= b.y - EPS && a.x + a.w <= b.x + b.w + EPS && a.y + a.h <= b.y + b.h + EPS;
  const apart = (a, b) => a.x + a.w <= b.x + EPS || b.x + b.w <= a.x + EPS || a.y + a.h <= b.y + EPS || b.y + b.h <= a.y + EPS;
  const bb = e => { const r = e.getBBox(); return {x: r.x, y: r.y, w: r.width, h: r.height}; };
  const shrink = (r, d) => ({x: r.x + d, y: r.y + d, w: r.w - 2 * d, h: r.h - 2 * d});
  const has = (r, p) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
  // points along a line-like element in the svg's user space (its own transform applied)
  const points = el => {
    const ts = [], m = el.getCTM && el.getCTM(), sm = el.ownerSVGElement.getCTM();
    const toSvg = p => { if (!m || !sm) return p; const q = new DOMPoint(p.x, p.y).matrixTransform(m).matrixTransform(sm.inverse()); return {x: q.x, y: q.y}; };
    if (typeof el.getTotalLength === "function") {
      const L = el.getTotalLength();
      for (let s = 0; s <= L; s += 1.5) ts.push(toSvg(el.getPointAtLength(s)));
    }
    return ts;
  };
  // every drawn figure: the hand-drawn diagrams and the charts (any svg with a viewBox and text; icons have neither)
  [...document.querySelectorAll("svg")].filter(s => s.viewBox.baseVal && s.viewBox.baseVal.width && s.querySelector("text")).forEach((svg, si) => {
    const id = (svg.closest("[id]") || {}).id || `svg${si}`;
    const vb = svg.viewBox.baseVal, view = {x: vb.x, y: vb.y, w: vb.width, h: vb.height};
    const boxes = [...svg.querySelectorAll("rect.box")].map(r => ({el: r, ...bb(r)}));
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const pad = r => ({x: r.x + PAD, y: r.y + PAD, w: r.w - 2 * PAD, h: r.h - 2 * PAD});
      if (!(inside(a, pad(b)) || inside(b, pad(a)) || apart(a, b)))
        out.push(`${id}: boxes overlap or touch at an edge: (${a.x},${a.y},${a.w}x${a.h}) and (${b.x},${b.y},${b.w}x${b.h})`);
    }
    const strokes = [...svg.querySelectorAll("path, line, polyline")].filter(e => !e.closest("defs, marker, text"))
      .map(el => ({el, pts: points(el)}));
    const labels = [...svg.querySelectorAll("text")].filter(t => t.textContent.trim()).map(t => ({t, r: bb(t)}));
    labels.forEach(({t, r}, i) => {
      const name = JSON.stringify(t.textContent.trim().slice(0, 40));
      if (!inside(r, view)) out.push(`${id}: label ${name} leaves the viewBox`);
      boxes.forEach(b => { if (!inside(r, b) && !apart(r, b)) out.push(`${id}: label ${name} straddles a box edge`); });
      const core = shrink(r, 1), cs = getComputedStyle(t);
      const halo = cs.paintOrder.startsWith("stroke") && parseFloat(cs.strokeWidth) >= 3 && cs.stroke !== "none";
      strokes.forEach(({el, pts}) => {
        if (!pts.some(p => has(core, p))) return;
        const drawnAfter = !!(t.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
        if (!halo) out.push(`${id}: label ${name} is crossed by a line and has no halo`);
        else if (drawnAfter) out.push(`${id}: label ${name} has a line drawn over it (the line comes after the label, so its halo cannot mask it)`);
      });
      for (let j = i + 1; j < labels.length; j++) {
        const o = labels[j].r;
        const w = Math.min(r.x + r.w, o.x + o.w) - Math.max(r.x, o.x), h = Math.min(r.y + r.h, o.y + o.h) - Math.max(r.y, o.y);
        if (w > 1 && h > 1) out.push(`${id}: labels ${name} and ${JSON.stringify(labels[j].t.textContent.trim().slice(0, 40))} overlap`);
      }
    });
  });
  if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px wide in ${innerWidth}px)`);
  return [...new Set(out)];
}"""

MENU = r"""() => ({themes: [...document.querySelectorAll('#theme-menu button[data-theme]')].map(b => b.dataset.theme),
                 fonts: [...document.querySelectorAll('#theme-menu button[data-font]')].map(b => b.dataset.font)})"""
APPLY = r"""([theme, font]) => { const r = document.documentElement;
  if (theme) r.setAttribute('data-theme', theme); else r.removeAttribute('data-theme');
  if (font && font !== 'serif') r.setAttribute('data-font', font); else r.removeAttribute('data-font');
  return document.fonts.ready.then(() => true); }"""

problems, combos = {}, 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for vw in WIDTHS:
        pg = b.new_page(viewport={"width": vw, "height": 900})
        pg.goto(url, wait_until="networkidle")
        menu = pg.evaluate(MENU)
        themes = menu["themes"] or [""]
        fonts = menu["fonts"] or ["serif"]
        if "--quick" in argv:
            themes, fonts = themes[:1], fonts[:1]
        for th in themes:
            for fo in fonts:
                pg.evaluate(APPLY, [th, fo])
                pg.wait_for_timeout(120)
                combos += 1
                for m in pg.evaluate(JS):
                    problems.setdefault(m, []).append(f"{vw}px/{th or 'device'}/{fo}")
        pg.close()
    b.close()
for m, where in problems.items():
    print(f"FAIL {m}\n     in {len(where)} of {combos} combinations, e.g. {', '.join(where[:3])}")
print(f"{'FAIL' if problems else 'OK'}: {len(problems)} distinct problem(s) over {combos} theme x font x width combinations in {url}")
sys.exit(1 if problems else 0)
