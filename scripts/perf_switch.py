"""A/B harness for theme-switch cost: is the working tree verifiably faster than a git commit?

Metric (lower is better): main-thread task time (Chrome's Performance.getMetrics TaskDuration) for one full theme cycle
basalt -> parchment -> bubblegum -> kawaii -> basalt, clicking the real switcher and waiting for each wipe to finish.
Also printed: the style / layout / script share, and the worst frame gap per cycle.

Both sides are served from one origin: requests for repo files come from `git show <base>:<path>` (side A) or from the
working tree (side B), so the only difference is the code. Samples alternate A, B, A, B so load and thermal drift hit
both. Verdict: ACCEPT when B's median is lower and a one-sided Mann-Whitney U test gives p < 0.05, and every theme
ends in the right state on both sides; otherwise REJECT.

Usage: python3 scripts/perf_switch.py [--base HEAD] [--n 12] [--profile]
"""
import json, math, mimetypes, statistics, subprocess, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
argv = sys.argv[1:]
BASE = argv[argv.index("--base") + 1] if "--base" in argv else "HEAD"
N = int(argv[argv.index("--n") + 1]) if "--n" in argv else 12
ORIGIN = "http://perf.local"
CYCLE = ["parchment", "bubblegum", "pink", "basalt"]           # starts from basalt (the default)
EXPECT = {"basalt": (True, True), "parchment": (True, True), "bubblegum": (False, False), "pink": (False, False)}
_git = {}

def file_for(side, path):
    rel = path.lstrip("/") or "index.html"
    if rel.endswith("/"): rel += "index.html"
    if side == "A":
        if rel not in _git:
            r = subprocess.run(["git", "-C", str(ROOT), "show", f"{BASE}:{rel}"], capture_output=True)
            _git[rel] = r.stdout if r.returncode == 0 else None
        return _git[rel]
    f = ROOT / rel
    return f.read_bytes() if f.is_file() else None

def serve(side):
    def handler(route):
        url = route.request.url
        if not url.startswith(ORIGIN):
            return route.continue_()
        path = url[len(ORIGIN):].split("?")[0].split("#")[0]
        body = file_for(side, path)
        if body is None:
            return route.fulfill(status=404, body="")
        ct = mimetypes.guess_type(path if "." in path.split("/")[-1] else "x.html")[0] or "application/octet-stream"
        route.fulfill(status=200, body=body, content_type=ct)
    return handler

PROBE = """() => { window.__g = []; let l = performance.now(), on = true; window.__stop = () => { on = false };
  (function f(t) { window.__g.push(t - l); l = t; if (on) requestAnimationFrame(f) })(l); }"""
STATE = """() => { const c = document.getElementById('glyphField');
  return [!!c && getComputedStyle(c).display !== 'none',
          [...document.querySelectorAll('.section-title')].every(h => getComputedStyle(h).backgroundImage.includes('glyph-ink'))]; }"""

def sample(browser, side):
    pg = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    pg.route("**/*", serve(side))
    pg.goto(ORIGIN + "/", wait_until="networkidle"); pg.wait_for_timeout(1500)
    cdp = pg.context.new_cdp_session(pg); cdp.send("Performance.enable")
    m0 = {m["name"]: m["value"] for m in cdp.send("Performance.getMetrics")["metrics"]}
    pg.evaluate(PROBE); bad = []
    for t in CYCLE:
        pg.locator(f'.theme-pill[data-theme="{t}"]').first.click()
        pg.wait_for_function("() => !document.documentElement.classList.contains('is-theme-wipe')", timeout=8000)
        pg.wait_for_timeout(250)
        st = tuple(pg.evaluate(STATE))
        if st != EXPECT[t]: bad.append(f"{t}: {st}")
    pg.evaluate("() => window.__stop()"); gap = max(pg.evaluate("() => window.__g.slice(1)"))
    m1 = {m["name"]: m["value"] for m in cdp.send("Performance.getMetrics")["metrics"]}
    pg.close()
    d = lambda k: (m1.get(k, 0) - m0.get(k, 0)) * 1000
    return {"task": d("TaskDuration"), "style": d("RecalcStyleDuration"), "layout": d("LayoutDuration"),
            "script": d("ScriptDuration"), "gap": gap, "bad": bad}

def mann_whitney_less(b, a):
    """One-sided p that B tends to be smaller than A (normal approximation, tie-corrected)."""
    allv = sorted([(v, 0) for v in a] + [(v, 1) for v in b]); ranks = [0.0] * len(allv); i = 0
    while i < len(allv):
        j = i
        while j + 1 < len(allv) and allv[j + 1][0] == allv[i][0]: j += 1
        for k in range(i, j + 1): ranks[k] = (i + j) / 2 + 1
        i = j + 1
    rb = sum(r for r, (_, s) in zip(ranks, allv) if s == 1)
    n1, n2 = len(b), len(a); u = rb - n1 * (n1 + 1) / 2
    mu = n1 * n2 / 2; sd = math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12)
    z = (u - mu + 0.5) / sd
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))

with sync_playwright() as p:
    b = p.chromium.launch()
    res = {"A": [], "B": []}
    for i in range(N):
        for side in (("A", "B") if i % 2 == 0 else ("B", "A")):
            res[side].append(sample(b, side))
    b.close()

def med(side, k): return statistics.median(r[k] for r in res[side])
a, bb = [r["task"] for r in res["A"]], [r["task"] for r in res["B"]]
pval = mann_whitney_less(bb, a)
bad = [x for s in res for r in res[s] for x in r["bad"]]
for s, name in (("A", f"base {BASE}"), ("B", "working tree")):
    v = sorted(r["task"] for r in res[s])
    print(f"{name:14s} task {med(s,'task'):7.1f} ms (range {v[0]:.0f}-{v[-1]:.0f}, n={len(v)})  style {med(s,'style'):6.1f}  "
          f"layout {med(s,'layout'):6.1f}  script {med(s,'script'):6.1f}  worst gap {med(s,'gap'):5.1f} ms")
delta = (med("B", "task") - med("A", "task")) / med("A", "task") * 100
ok = med("B", "task") < med("A", "task") and pval < 0.05 and not bad
print(f"delta {delta:+.1f}%  p={pval:.4f}  state errors: {bad or 'none'}")
print("ACCEPT" if ok else "REJECT")
out = ROOT / ".verify"; out.mkdir(exist_ok=True)
(out / "perf_last.json").write_text(json.dumps({"base": BASE, "n": N, "p": pval, "delta_pct": delta, "ok": ok, "res": res}, indent=1))
sys.exit(0 if ok else 1)
