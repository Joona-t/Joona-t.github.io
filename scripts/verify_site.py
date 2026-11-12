"""Pre-merge verification for lovespark.love (Joona 2026-11-12: "we should always have a verification step before
merging"). Run it on the branch, against a local server, before every merge; scripts/merge_pr.sh refuses to merge
without a passing run for the exact commit.

What it does, the way a visitor would:
  1. loads the home page and the Forge Notebook; any page error or console error fails;
  2. clicks every theme button in turn (the real switcher, View Transition wipe included) and, for each switch,
     records the longest frame gap and long tasks from click until the wipe finishes, plus whether the glyph field and
     the section titles are right for the theme afterwards;
  3. runs the diagram geometry check (scripts/check_svg_diagrams.py) on the notebook.
Fails when a switch has a frame gap over --max-gap ms (default 120) or a long task over --max-task ms (default 100),
or any theme ends in the wrong state. Writes .verify/<commit>.json with the numbers.

Usage: python3 scripts/verify_site.py [base-url] [--runs N] [--block path-substring ...]
  With no base-url it serves this checkout itself on a free port (nothing to start first). With a base-url it first
  checks that the URL serves this exact tree (home page and notebook byte for byte) and refuses otherwise: on the
  Mac mini :8766 is the fleet dashboard, so a gate pointed there would have measured the wrong server.
  --block lets you measure with a resource removed (e.g. --block glyph-field.js) to isolate a cost.
"""
import functools, http.server, json, statistics, subprocess, sys, threading, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
argv = sys.argv[1:]
def opt(name, default):
    return type(default)(argv[argv.index(name) + 1]) if name in argv else default
blocks = [argv[i + 1] for i, a in enumerate(argv) if a == "--block"]
pos = [a for i, a in enumerate(argv) if not a.startswith("--") and (i == 0 or not argv[i - 1].startswith("--"))]
if pos:
    BASE, SERVED = pos[0].rstrip("/"), "given"
else:  # serve this checkout on a free port, so no other server can answer in its place
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    BASE, SERVED = f"http://127.0.0.1:{httpd.server_address[1]}", "self"

def identity():
    """The URL must serve this tree: the home page and the notebook, byte for byte."""
    bad = []
    for path, f in (("/", "index.html"), ("/forge-notebook/", "forge-notebook/index.html")):
        try:
            got = urllib.request.urlopen(BASE + path, timeout=10).read()
        except Exception as e:
            bad.append(f"{BASE}{path}: {e}"); continue
        if got != (ROOT / f).read_bytes():
            bad.append(f"{BASE}{path} is not this tree's {f} ({len(got)} bytes served, {(ROOT / f).stat().st_size} on disk)")
    return bad
mismatch = identity()
if mismatch:
    for m in mismatch: print("REFUSED:", m)
    print("REFUSED: another server answers there. Run without a base URL (it serves this checkout itself) or point it at a server of this tree.")
    sys.exit(2)
RUNS, MAX_GAP, MAX_TASK = opt("--runs", 3), opt("--max-gap", 120.0), opt("--max-task", 100.0)
ORDER = ["basalt", "parchment", "bubblegum", "pink", "basalt"]          # every transition type: dark<->light<->motion
EXPECT = {"basalt": (True, True), "parchment": (True, True), "bubblegum": (False, False), "pink": (False, False)}

PROBE = """() => { window.__gaps = []; window.__tasks = []; let last = performance.now(), on = true;
  window.__stop = () => { on = false; };
  (function tick(t) { window.__gaps.push(t - last); last = t; if (on) requestAnimationFrame(tick); })(last);
  new PerformanceObserver(l => l.getEntries().forEach(e => window.__tasks.push(e.duration))).observe({type: 'longtask'}); }"""
STATE = """() => { const c = document.getElementById('glyphField');
  return {field: !!c && getComputedStyle(c).display !== 'none',
          ink: [...document.querySelectorAll('.section-title')].every(h => getComputedStyle(h).backgroundImage.includes('glyph-ink'))}; }"""

fails, report = [], {"base": BASE, "served": SERVED, "identity": "matched", "blocked": blocks, "switches": []}
with sync_playwright() as p:
    b = p.chromium.launch(args=["--enable-gpu-rasterization"])
    for run in range(RUNS):
        pg = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        errs = []
        pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))
        pg.on("console", lambda m: errs.append(f"console: {m.text}") if m.type == "error" else None)
        for s in blocks:
            pg.route(f"**/*{s}*", lambda r: r.abort())
        pg.goto(BASE + "/", wait_until="networkidle"); pg.wait_for_timeout(1500)
        for theme in ORDER:
            pill = pg.locator(f'.theme-pill[data-theme="{theme}"]').first
            pg.evaluate(PROBE)
            pill.click()
            pg.wait_for_function("() => !document.documentElement.classList.contains('is-theme-wipe')", timeout=5000)
            pg.wait_for_timeout(250)
            pg.evaluate("() => window.__stop()")
            gaps = pg.evaluate("() => window.__gaps.slice(1)"); tasks = pg.evaluate("() => window.__tasks")
            st = pg.evaluate(STATE)
            row = {"run": run, "to": theme, "max_gap_ms": round(max(gaps or [0]), 1),
                   "frames": len(gaps), "long_tasks_ms": [round(t) for t in tasks], **st}
            report["switches"].append(row)
            want = EXPECT[theme]
            if (st["field"], st["ink"]) != want:
                fails.append(f"run {run} -> {theme}: field={st['field']} ink={st['ink']}, expected {want}")
            if row["max_gap_ms"] > MAX_GAP: fails.append(f"run {run} -> {theme}: frame gap {row['max_gap_ms']} ms > {MAX_GAP}")
            if tasks and max(tasks) > MAX_TASK: fails.append(f"run {run} -> {theme}: long task {max(tasks):.0f} ms > {MAX_TASK}")
        pg.goto(BASE + "/forge-notebook/", wait_until="networkidle"); pg.wait_for_timeout(800)
        fails += [f"run {run}: {e}" for e in errs]
        pg.close()
    b.close()

if not blocks:
    d = subprocess.run([sys.executable, str(ROOT / "scripts/check_svg_diagrams.py"), BASE + "/forge-notebook/"],
                       capture_output=True, text=True)
    report["diagrams"] = d.stdout.strip().splitlines()[-1] if d.stdout.strip() else d.stderr[-200:]
    if d.returncode: fails.append("diagrams: " + report["diagrams"])

by = {}
for r in report["switches"]: by.setdefault(r["to"], []).append(r["max_gap_ms"])
for t, g in by.items():
    print(f"switch -> {t:9s} max frame gap median {statistics.median(g):6.1f} ms  (runs: {', '.join(f'{x:.0f}' for x in g)})")
allt = [t for r in report["switches"] for t in r["long_tasks_ms"]]
print(f"long tasks during switches: {len(allt)}, max {max(allt) if allt else 0} ms")
sha = subprocess.run(["git", "-C", str(ROOT), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
dirty = bool(subprocess.run(["git", "-C", str(ROOT), "status", "--porcelain", "--untracked-files=no"], capture_output=True, text=True).stdout.strip())
report.update(commit=sha, dirty=dirty, ok=not fails, fails=fails)
if not blocks:
    out = ROOT / ".verify"; out.mkdir(exist_ok=True); (out / f"{sha}.json").write_text(json.dumps(report, indent=1))
for f in fails: print("FAIL", f)
print(("VERIFY OK" if not fails else f"VERIFY FAIL ({len(fails)})") + f" for {sha[:7]}{' (dirty tree: not a merge pass)' if dirty else ''}")
sys.exit(0 if not fails and not dirty or blocks else 1)
