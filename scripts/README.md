# Gallery generator

"The Suite" gallery on lovespark.love is **data-driven**. The cards between the
`<!-- GALLERY:START -->` / `<!-- GALLERY:END -->` markers in `index.html` are
generated from [`data/gallery.json`](../data/gallery.json) — **don't hand-edit
them**. Category count badges are computed automatically from the number of
cards, so you never maintain them by hand.

## Add / change an extension panel

1. Edit `data/gallery.json`.
2. Run the generator from the repo root:

   ```bash
   python3 scripts/build-gallery.py
   ```

3. Commit `data/gallery.json` **and** `index.html` together.

That's it — a new CWS launch is a one-card edit instead of copy-pasting markup.

### A new published extension

Append a card object to the right category's `cards` array. Minimal live card:

```json
{
  "title": "LoveSpark Notes 📝",
  "badge": "Chrome Extension",
  "desc": "A beautiful, private notes app in every new tab. Categories, search, and themes — no account, every note stored locally.",
  "url": "https://chromewebstore.google.com/detail/cbekmfnggenafmgcmcnmaohdmaacppbm"
}
```

Strip any `?utm_source=...` from the CWS share link — use the bare
`/detail/<id>` form to match the other cards.

## Card fields

Every value is a **verbatim HTML fragment** — write `&amp;` for `&`, and you may
embed `<em>` / `<strong>`.

| field | required | notes |
|-------|----------|-------|
| `title` | yes | includes the trailing emoji, e.g. `"LoveSpark Notes 📝"` |
| `badge` | no | e.g. `"Chrome Extension"`. Omit for no badge row. |
| `desc` | yes | a string, or a list of strings → one `<p class="card-desc">` each |
| `url` | no | install/download link. Omit → a "coming soon" pill instead of a link |
| `link_label` | no | link text when `url` is set; default `"Install ✦"` (use `"Download ✦"` for apps) |
| `soon_label` | no | pill text when `url` is omitted; default `"Coming soon ♡"` |
| `memorial` | no | → `<p class="aaron-memorial">` (the Aaron card) |
| `class` | no | extra class on the card div, e.g. `"win98-card--aaron"` |

## Keep it honest

- `python3 scripts/build-gallery.py --check` — exits non-zero if `index.html` is
  out of sync with `data/gallery.json`. Good as a pre-commit hook / CI gate.
- `python3 scripts/extract-gallery.py` — inverse tool: re-seeds
  `data/gallery.json` from the hand-written HTML. Use it to recover the data
  model if it ever drifts; the forward path is `build-gallery.py`.

> Scope: only the `<section class="tools-section" id="tools">` gallery is
> generated. The image-based "Sneak Peeks" section below it is hand-maintained.
