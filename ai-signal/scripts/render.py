"""Render producer-independent editions into static HTML. No external dependencies."""
import json
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
def e(value): return escape(str(value), quote=True)
def link(url):
    assert urlsplit(url).scheme == 'https' and urlsplit(url).netloc, 'Source must be HTTPS'
    return e(url)

paths = sorted((ROOT / 'content').glob('*.json'), reverse=True)
assert paths, 'At least one verified edition is required'
for path in paths:
    d = json.loads(path.read_text())
    date.fromisoformat(d['date']); date.fromisoformat(d['verified'])
    assert path.stem == d['date']
    assert len(d['news']) <= 5 and len(d['papers']) <= 3
    stories=[]
    for i,n in enumerate(d['news'],1):
        date.fromisoformat(n['date'])
        stories.append(f'''<article class="story" id="item-{i}"><div class="story-head"><span class="number">{i:02}</span><span>{e(n['category'])}</span><time datetime="{e(n['date'])}">{e(n['date'])}</time></div><h2>{e(n['title'])}</h2><span class="status">{e(n['status'])}</span><p>{e(n['summary'])}</p><p class="implication">{e(n['implication'])}</p><p class="limit"><strong>Evidence & limits.</strong> {e(n['limitation'])}</p><a class="source" href="{link(n['url'])}">{e(n['sourceLabel'])} ↗</a></article>''')
    nav=''.join(f'<a href="#item-{i}">{i:02} / {e(n["category"])}</a>' for i,n in enumerate(d['news'],1))
    for i,p in enumerate(d['papers'],1):
        date.fromisoformat(p['date'])
        assert p['status'] in ('Preprint', 'Peer-reviewed'), 'Paper review status is required'
        paragraphs=''.join(f'<p><strong>{label}.</strong> {e(p[key])}</p>' for key,label in [('problem','Problem'),('contribution','Contribution'),('evidence','Evidence'),('limitation','Limitation')])
        stories.append(f'''<article class="story" id="paper-{i}"><div class="story-head"><span class="number">P{i:02}</span><span>Research paper</span><time datetime="{e(p['date'])}">{e(p['date'])}</time></div><h2>{e(p['title'])}</h2><span class="status">{e(p['status'])}</span>{paragraphs}<p class="implication">{e(p['implication'])}</p><a class="source" href="{link(p['url'])}">{e(p['sourceLabel'])} ↗</a></article>''')
        nav+=f'<a href="#paper-{i}">P{i:02} / {e(p["title"])}</a>'
    closing = f'<p class="closing">{e(d["closing"])}' if d.get('closing') else ''
    if closing and d.get('closingUrl'): closing += f' <a href="{link(d["closingUrl"])}">Read the source ↗</a>'
    if closing: closing += '</p>'
    archive=''.join(f'<a href="{p.stem}.html">{e(p.stem)}</a> ' for p in paths if p != path)
    html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="A concise AI report with primary sources, practical implications and clear evidence limits."><title>AI Signal · {e(d['date'])}</title><link rel="stylesheet" href="style.css"></head><body><a class="skip" href="#report">Skip to report</a><header class="bar"><div class="bar-inner"><a class="wordmark" href="./">AI<span>/</span>SIGNAL</a><span class="private">Daily AI report</span></div></header><main class="shell" id="report"><div class="edition"><span>{e(d['label'])}</span><time datetime="{e(d['date'])}">{date.fromisoformat(d['date']).strftime('%A, %d %B %Y')}</time></div><h1>The AI report.</h1><p class="intro">{e(d['takeaway'])}</p><div class="layout"><aside class="rail"><div class="eyebrow">In this edition</div><nav aria-label="Report contents">{nav}<a href="#coverage">Coverage notes</a></nav><p><strong>Sources checked</strong><br>{e(d['verified'])}</p><p><strong>Coverage</strong><br>{e(d['coverage'])}</p><p>{len(d['news'])} developments · {len(d['papers'])} {'paper' if len(d['papers']) == 1 else 'papers'}</p><p>Selected for substance.<br>Caps, never quotas.</p>{('<p>Past editions</p>'+archive) if archive else ''}</aside><div class="stories">{''.join(stories)}<section class="note" id="coverage"><h3>About this edition</h3><p>{e(d['coverageNote'])}</p><p>{e(d['paperNote'])}</p></section>{closing}<p class="coverage">This is a dated report, not a live feed. Daily site publishing has not yet been verified. </p></div></div><footer class="footer"><span>AI/SIGNAL · Independent, source-linked reading</span><span>Report date: {e(d['date'])}</span></footer></main></body></html>'''
    (ROOT/f'{d["date"]}.html').write_text(html)
    if path==paths[0]: (ROOT/'index.html').write_text(html)
print(f'Rendered {len(paths)} edition(s); current edition {paths[0].stem}')
