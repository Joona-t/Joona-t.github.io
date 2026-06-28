#!/usr/bin/env python3
"""Generate "The Suite" gallery in index.html from data/gallery.json.

The cards between the GALLERY:START / GALLERY:END markers in index.html are
GENERATED — do not hand-edit them. To add or change an extension panel, edit
data/gallery.json and run:

    python3 scripts/build-gallery.py

Use --check to verify index.html is already in sync (exit 1 if not) — handy for
a pre-commit hook or CI gate.

Per-card fields (every value is a VERBATIM HTML fragment — write &amp; for &,
and you may embed <em>/<strong>):
    title       (required)  e.g. "LoveSpark Notes 📝"
    badge       (optional)  e.g. "Chrome Extension"; omit -> no badge row
    desc        (required)  string, or list of strings -> one <p class="card-desc"> each
    memorial    (optional)  -> <p class="aaron-memorial"> (the Aaron card)
    url         (optional)  install/download link; omit -> a "coming soon" pill
    link_label  (optional)  link text when url is set; default "Install ✦"
    soon_label  (optional)  pill text when url is omitted; default "Coming soon ♡"
    class       (optional)  extra class on the card div, e.g. "win98-card--aaron"

Per-category: { "id": "cat-...", "title": "...", "cards": [ ... ] }
The category count badge is COMPUTED from len(cards) — never hand-maintain it.
"""
import json
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "gallery.json"
HTML = ROOT / "index.html"

START = '    <!-- GALLERY:START - generated from data/gallery.json by scripts/build-gallery.py - do not hand-edit between these markers -->'
END = '    <!-- GALLERY:END -->'

DEFAULT_LINK_LABEL = "Install ✦"
DEFAULT_SOON_LABEL = "Coming soon ♡"


def render_card(c):
    cls = "win98-card"
    if c.get("class"):
        cls += " " + c["class"]
    out = [
        f'      <div class="{cls}">',
        '        <div class="titlebar">',
        f'          <span class="win-title">{c["title"]}</span>',
        '          <div class="win-buttons">',
        '            <span class="win-btn" aria-hidden="true">─</span>',
        '            <span class="win-btn" aria-hidden="true">□</span>',
        '            <span class="win-btn win-btn-close" aria-hidden="true">✕</span>',
        '          </div>',
        '        </div>',
        '        <div class="card-body">',
    ]
    if c.get("badge"):
        out.append(f'          <div class="card-badge">{c["badge"]}</div>')
    desc = c["desc"]
    if isinstance(desc, str):
        desc = [desc]
    for d in desc:
        out.append(f'          <p class="card-desc">{d}</p>')
    if c.get("memorial"):
        out.append(f'          <p class="aaron-memorial">{c["memorial"]}</p>')
    if c.get("url"):
        label = c.get("link_label", DEFAULT_LINK_LABEL)
        out.append(
            f'          <a href="{c["url"]}" target="_blank" rel="noopener" class="card-link">{label}</a>'
        )
    else:
        label = c.get("soon_label", DEFAULT_SOON_LABEL)
        out.append(f'          <span class="card-link card-link--soon">{label}</span>')
    out += ['        </div>', '      </div>']
    return "\n".join(out)


def render_category(cat):
    cards = "\n\n".join(render_card(c) for c in cat["cards"])
    return (
        f'    <details class="category" id="{cat["id"]}">\n'
        f'    <summary class="category-header">\n'
        f'      <h3 class="category-title">{cat["title"]}</h3>\n'
        f'      <span class="category-count">{len(cat["cards"])}</span>\n'
        f'      <span class="category-rule" aria-hidden="true"></span>\n'
        f'      <span class="category-chevron" aria-hidden="true">▸</span>\n'
        f'    </summary>\n'
        f'\n'
        f'    <div class="tools-grid">\n'
        f'\n'
        f'{cards}\n'
        f'\n'
        f'    </div>\n'
        f'    </details>'
    )


def render_gallery(data):
    return "\n\n".join(render_category(cat) for cat in data["categories"])


def main():
    check = "--check" in sys.argv[1:]
    data = json.loads(DATA.read_text(encoding="utf-8"))
    html = HTML.read_text(encoding="utf-8")

    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.DOTALL)
    if not pattern.search(html):
        sys.exit(
            "ERROR: GALLERY:START / GALLERY:END markers not found in index.html. "
            "Add them around The Suite categories before running this script."
        )

    block = START + "\n" + render_gallery(data) + "\n" + END
    new_html = pattern.sub(lambda _m: block, html)

    n_cats = len(data["categories"])
    n_cards = sum(len(c["cards"]) for c in data["categories"])

    if check:
        if new_html != html:
            sys.exit(
                "OUT OF SYNC: index.html does not match data/gallery.json. "
                "Run: python3 scripts/build-gallery.py"
            )
        print(f"in sync — {n_cats} categories, {n_cards} cards")
        return

    if new_html == html:
        print(f"no change — {n_cats} categories, {n_cards} cards")
        return

    HTML.write_text(new_html, encoding="utf-8")
    print(f"wrote index.html — {n_cats} categories, {n_cards} cards")


if __name__ == "__main__":
    main()
