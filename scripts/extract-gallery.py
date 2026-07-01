#!/usr/bin/env python3
"""One-time / inverse tool: parse "The Suite" gallery out of index.html into
data/gallery.json. Run this to (re)seed the data file from hand-written HTML, or
to recover the data model if it ever drifts. The forward path is build-gallery.py.

Only the <section class="tools-section" id="tools"> gallery is parsed; the
image-based "Sneak Peeks" section below it is left alone.
"""
import json
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
DATA = ROOT / "data" / "gallery.json"

DEFAULT_LINK_LABEL = "Install ✦"
DEFAULT_SOON_LABEL = "Coming soon ♡"


def s(pattern, text):
    m = re.search(pattern, text, re.DOTALL)
    return m.group(1) if m else None


def parse_card(cls_full, inner):
    card = {}
    extra = cls_full[len("win98-card"):].strip()
    if extra:
        card["class"] = extra
    card["title"] = s(r'<span class="win-title">(.*?)</span>', inner)
    badge = s(r'<div class="card-badge">(.*?)</div>', inner)
    if badge is not None:
        card["badge"] = badge
    descs = re.findall(r'<p class="card-desc">(.*?)</p>', inner, re.DOTALL)
    card["desc"] = descs[0] if len(descs) == 1 else descs
    memorial = s(r'<p class="aaron-memorial">(.*?)</p>', inner)
    if memorial is not None:
        card["memorial"] = memorial
    a = re.search(
        r'<a href="(.*?)" target="_blank" rel="noopener" class="card-link">(.*?)</a>',
        inner, re.DOTALL,
    )
    if a:
        card["url"] = a.group(1)
        if a.group(2) != DEFAULT_LINK_LABEL:
            card["link_label"] = a.group(2)
    else:
        soon = s(r'<span class="card-link card-link--soon">(.*?)</span>', inner)
        if soon is not None and soon != DEFAULT_SOON_LABEL:
            card["soon_label"] = soon
    return card


def group_spans(region):
    """Character ranges (title, start, end) of each <details class="category
    category-group">, matched with depth counting so nested leaf categories are
    handled correctly."""
    spans = []
    stack = []
    for m in re.finditer(r'<details class="([^"]+)" id="[^"]+">|</details>', region):
        if m.group(0) == "</details>":
            if stack:
                is_group, title, start = stack.pop()
                if is_group:
                    spans.append((title, start, m.end()))
        else:
            classes = m.group(1)
            is_group = "category-group" in classes
            title = s(r'<h3 class="category-title">(.*?)</h3>', region[m.end():]) if is_group else None
            stack.append((is_group, title, m.start()))
    return spans


def main():
    html = HTML.read_text(encoding="utf-8")
    region = s(r'<section class="tools-section" id="tools">(.*?)</section>', html)
    if region is None:
        raise SystemExit("could not find tools-section in index.html")

    spans = group_spans(region)
    categories = []
    # Exact class="category" skips the group parents; each leaf has no nested
    # <details>, so the non-greedy body stops at the leaf's own close.
    for cm in re.finditer(
        r'<details class="category" id="([^"]+)">(.*?)</details>', region, re.DOTALL
    ):
        cid, body = cm.group(1), cm.group(2)
        title = s(r'<h3 class="category-title">(.*?)</h3>', body)
        cards = [
            parse_card(km.group(1), km.group(2))
            for km in re.finditer(
                r'      <div class="(win98-card[^"]*)">\n(.*?)\n      </div>',
                body, re.DOTALL,
            )
        ]
        cat = {"id": cid, "title": title, "cards": cards}
        grp = next((t for t, a, b in spans if a < cm.start() < b), None)
        if grp:
            cat["group"] = grp
        categories.append(cat)

    DATA.parent.mkdir(exist_ok=True)
    DATA.write_text(
        json.dumps({"categories": categories}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    n_cards = sum(len(c["cards"]) for c in categories)
    print(f"wrote {DATA.relative_to(ROOT)} — {len(categories)} categories, {n_cards} cards")


if __name__ == "__main__":
    main()
