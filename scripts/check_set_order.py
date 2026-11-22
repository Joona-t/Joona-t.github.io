"""Bvby Ash video cards must run newest first (Joona, 2026-11-22: "the 67 card should be at the bottom as it is the
oldest"). Reads the date in each set-card's set-meta line, in page order; exit 1 and name the cards out of order.
  python3 scripts/check_set_order.py [bvby-ash/index.html]"""
import re, sys
from datetime import datetime
p = sys.argv[1] if len(sys.argv) > 1 else "bvby-ash/index.html"
html = open(p, encoding="utf-8").read()
cards = re.findall(r'<article class="set-card">.*?<h3[^>]*>(.*?)</h3>.*?</article>', html, re.S) or []
metas = re.findall(r'<p class="set-meta">.*?(\d{1,2} [A-Z][a-z]{2} \d{4})', html)
dates = [datetime.strptime(m, "%d %b %Y") for m in metas]
bad = [f"{metas[i]} card above the newer {metas[i+1]} card" for i in range(len(dates) - 1) if dates[i] < dates[i + 1]]
print(f"{len(dates)} video cards, " + ("newest first: OK" if not bad else "OUT OF ORDER: " + "; ".join(bad)))
sys.exit(1 if bad else 0)
