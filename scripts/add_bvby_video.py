"""Add a new video to the Bvby Ash page (bvby-ash/index.html): one command instead of hand-edited markup.

  python3 scripts/add_bvby_video.py card.json

card.json (paths are relative to the json file, or absolute):
  {"id": "JDVBe4fGZzw",                  the YouTube video id
   "title": "Afterimage",
   "date": "2026-11-24", "length": "3:19",
   "desc": "One or two sentences for the card.",
   "frame": "thumbnail-A.jpg", "frame_alt": "What the still shows.",
   "cover": "cover.jpg", "cover_alt": "What the cover shows.",        (optional: adds the cover to "Cover art")
   "retag_previous": "Brain"}             the tag the card that now says "New" gets instead

What it does:
  1. refuses if the video is not public on YouTube (asks YouTube's own oEmbed endpoint; no key needed);
  2. writes img/<slug>-frame.webp (1280 x 720) and img/<slug>-cover.webp (900 x 900) with Pillow;
  3. puts the new card first in the video grid with the tag "New" and moves that tag off the card that had it;
  4. puts the cover first under "Cover art";
  5. adds the title to the home page's "newest first" sentence.
Running it again for a video that is already on the page changes nothing (exit 0). It edits files only: the layout
check, the commit, the pull request and the merge are separate steps (scripts/verify_site.py, scripts/merge_pr.sh).
Needs Pillow (the framework Python 3.13 on the MacBook has it, as it has Playwright for the checks).
"""
import html
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE, HOME, IMG = ROOT / "bvby-ash/index.html", ROOT / "index.html", ROOT / "bvby-ash/img"


def public_on_youtube(vid):
    """YouTube's oEmbed endpoint answers 200 only for a video anyone can watch. (curl: the framework Python has no CA store.)"""
    code = subprocess.run(["curl", "-s", "-o", "/dev/null", "-m", "20", "-w", "%{http_code}",
                           f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"], capture_output=True, text=True).stdout.strip()
    return code == "200"


def webp(src, dst, w, h):
    """Scale to cover w x h, crop the middle, save as WebP."""
    from PIL import Image
    im = Image.open(src).convert("RGB")
    k = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    im.crop((x, y, x + w, y + h)).save(dst, "WEBP", quality=86, method=6)


def main(card_path):
    card_path = Path(card_path).resolve()
    c = json.loads(card_path.read_text())
    page = PAGE.read_text(encoding="utf-8")
    if f'data-yt="{c["id"]}"' in page:
        print(f'{c["title"]} ({c["id"]}) is already on the page: nothing to do'); return
    if not public_on_youtube(c["id"]):
        sys.exit(f'{c["id"]} is not public on YouTube yet: not adding it')
    rel = lambda p: p if Path(p).is_absolute() else card_path.parent / p
    slug = re.sub(r"[^a-z0-9]+", "-", c["title"].lower()).strip("-")
    esc = lambda t: html.escape(t, quote=True)
    day = datetime.strptime(c["date"], "%Y-%m-%d")
    stamp = f"{day.day} {day:%b %Y}"

    webp(rel(c["frame"]), IMG / f"{slug}-frame.webp", 1280, 720)
    had_new = page.count('<span class="tag">New</span>')
    if had_new:
        if not c.get("retag_previous"):
            sys.exit('a card already carries the "New" tag: give "retag_previous" (the tag it should get instead)')
        page = page.replace('<span class="tag">New</span>', f'<span class="tag">{esc(c["retag_previous"])}</span>')
    new_card = f'''        <article class="set-card">
          <button type="button" class="facade" data-yt="{c["id"]}" aria-label="Play {esc(c["title"])} (loads YouTube)">
            <img src="img/{slug}-frame.webp" width="1280" height="720" loading="lazy" decoding="async"
                 alt="{esc(c["frame_alt"])}">
            <span class="play" aria-hidden="true">▶</span>
          </button>
          <div class="set-body">
            <p class="set-meta"><span class="tag">New</span> {stamp} · {esc(c["length"])}</p>
            <h3>{esc(c["title"])}</h3>
            <p>{esc(c["desc"])}</p>
          </div>
        </article>

'''
    grid = '      <div class="set-grid">\n'
    assert page.count(grid) == 1, "the video grid was not found exactly once"
    page = page.replace(grid, grid + new_card)
    if c.get("cover"):
        webp(rel(c["cover"]), IMG / f"{slug}-cover.webp", 900, 900)
        art = '      <div class="art-grid">\n'
        assert page.count(art) == 1, "the cover grid was not found exactly once"
        page = page.replace(art, art + f'        <figure class="art-card"><img src="img/{slug}-cover.webp" width="900" height="900" loading="lazy" decoding="async" alt="{esc(c["cover_alt"])}"><figcaption>{esc(c["title"])} cover</figcaption></figure>\n')
    PAGE.write_text(page, encoding="utf-8")

    home = HOME.read_text(encoding="utf-8")
    lead = "newest first: "
    if home.count(lead) == 1 and c["title"] not in home.split(lead, 1)[1].split("</p>", 1)[0]:
        HOME.write_text(home.replace(lead, lead + esc(c["title"]) + ", "), encoding="utf-8")
    else:
        print("home page sentence not changed (not found once, or the title is already in it)")
    print(f'added {c["title"]} ({c["id"]}), {stamp}: img/{slug}-frame.webp' + (f', img/{slug}-cover.webp' if c.get("cover") else ""))


if __name__ == "__main__":
    main(sys.argv[1])
