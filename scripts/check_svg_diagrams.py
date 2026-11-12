"""Geometry check for the hand-drawn SVG diagrams on a page (forge-notebook by default).

Fails when:
  1. a box (rect.box) partly overlaps another box: it must be fully inside or fully outside it
     (2026-11-12: "load test" ran onto the vLLM-mode frame's edge);
  2. a label (text) leaves the svg viewBox, or straddles a box edge without sitting inside the box;
  3. a label crosses a line but has no halo (paint-order stroke), so the line shows through the text
     (2026-11-12: "clients call in parallel, no lock" sat behind its arrows).

Usage: python3 scripts/check_svg_diagrams.py [url-or-file] [--theme basalt|cream]
Needs Playwright (the framework Python 3.13 on the MacBook has it). Exit 1 on any problem.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

argv = sys.argv[1:]
args = [a for i, a in enumerate(argv) if not a.startswith("--") and (i == 0 or argv[i - 1] != "--theme")]
target = args[0] if args else str(Path(__file__).resolve().parent.parent / "forge-notebook" / "index.html")
url = target if "://" in target else Path(target).resolve().as_uri()

JS = r"""() => {
  const out = [], EPS = 0.5, PAD = 6;   // a box inside another needs PAD px of margin from its edges
  const inside = (a, b) => a.x >= b.x - EPS && a.y >= b.y - EPS && a.x + a.w <= b.x + b.w + EPS && a.y + a.h <= b.y + b.h + EPS;
  const apart = (a, b) => a.x + a.w <= b.x + EPS || b.x + b.w <= a.x + EPS || a.y + a.h <= b.y + EPS || b.y + b.h <= a.y + EPS;
  const bb = e => { const r = e.getBBox(); return {x: r.x, y: r.y, w: r.width, h: r.height}; };
  document.querySelectorAll(".diagram svg").forEach((svg, si) => {
    const id = svg.parentElement.id || `svg${si}`;
    const vb = svg.viewBox.baseVal, view = {x: vb.x, y: vb.y, w: vb.width, h: vb.height};
    const boxes = [...svg.querySelectorAll("rect.box")].map(r => ({el: r, ...bb(r)}));
    for (let i = 0; i < boxes.length; i++) for (let j = 0; j < boxes.length; j++) {
      if (i >= j) continue;
      const a = boxes[i], b = boxes[j];
      const pad = r => ({x: r.x + PAD, y: r.y + PAD, w: r.w - 2 * PAD, h: r.h - 2 * PAD});
      if (!(inside(a, pad(b)) || inside(b, pad(a)) || apart(a, b)))
        out.push(`${id}: boxes overlap or touch at an edge: (${a.x},${a.y},${a.w}x${a.h}) and (${b.x},${b.y},${b.w}x${b.h})`);
    }
    const lines = [...svg.querySelectorAll("path.arrow, line")].map(bb);
    svg.querySelectorAll("text").forEach(t => {
      const r = bb(t), name = JSON.stringify(t.textContent.slice(0, 40));
      if (!inside(r, view)) out.push(`${id}: label ${name} leaves the viewBox`);
      boxes.forEach(b => { if (!inside(r, b) && !apart(r, b)) out.push(`${id}: label ${name} straddles a box edge`); });
      {   // every label: a line through it must be masked by a halo
        const crossed = lines.some(l => !apart(r, l));
        const cs = getComputedStyle(t);
        const halo = cs.paintOrder.startsWith("stroke") && parseFloat(cs.strokeWidth) >= 3 && cs.stroke !== "none";
        if (crossed && !halo) out.push(`${id}: label ${name} is crossed by a line with no halo`);
      }
    });
  });
  return out;
}"""

theme = "cream" if "--theme" in sys.argv and sys.argv[sys.argv.index("--theme") + 1] == "cream" else "basalt"
problems = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for vw in (1280, 390):                     # desktop and phone layouts
        pg = b.new_page(viewport={"width": vw, "height": 900})
        pg.goto(url, wait_until="networkidle")
        btn = pg.get_by_role("button", name=theme, exact=False)
        if btn.count(): btn.first.click(); pg.wait_for_timeout(300)
        problems += [f"[{vw}px] {m}" for m in pg.evaluate(JS)]
        pg.close()
    b.close()
for m in problems: print("FAIL", m)
print(f"{'FAIL' if problems else 'OK'}: {len(problems)} problem(s) in {url}")
sys.exit(1 if problems else 0)
