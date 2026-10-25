# Plan — Gallery section for lovespark.love

_Companion to `research.md`. No code until Joona says **"implement it all."**_

## Summary

Add a new **`#gallery`** section to `index.html`, placed right after **The Suite** (`#tools`),
that previews **unpublished projects** with screenshots. Each project is a **click-to-expand
dropdown** built from the page's existing pure-CSS `<details class="category">` pattern
(zero new interaction JS). The section ships as a **working shell**: folders + graceful
"coming soon" placeholders are in place now, and screenshots drop in over time with no code change.

## Approach (and why)

- **Reuse `<details class="category">` verbatim** for each project dropdown. It's native, pure-CSS,
  keyboard- + screen-reader-accessible, and already honors reduced-motion. This is exactly the
  "same way as the panels" Joona asked for, with the least new code (Carmack: match the grain, no new abstraction).
- **Hardcoded HTML, not a JSON manifest.** The whole page is hardcoded; 3 projects don't justify a
  render layer. (Alternative noted below if the gallery grows large.)
- **Image-specific CSS only** (`.gallery-grid`, `.gallery-shot`, `.gallery-empty`) layered on top of
  the reused `.category` chrome — so the dropdown stays byte-identical to the Suite panels.
- **Graceful empty state** is a first-class requirement, because screenshots mostly don't exist yet
  (only `~/Downloads/Sparky read.png`). A project with 0 shots shows "Screenshots coming soon ♡".

## Layout sketch

```
section#gallery
  .section-header  → ✦  Sneak Peeks  ✦   (+ subtle Sparky per rule #3)
  small subtitle   → "Screenshots from projects still in the workshop ♡"

  details.category.gallery-project        ← LoveSpark Dashboard 📊   · count
    summary.category-header (title/count/rule/chevron ▸)
    .gallery-grid
      .gallery-empty → "Screenshots coming soon ♡"     (0 shots yet)

  details.category.gallery-project        ← Sparky Reads · Web 🌐    · 1
    .gallery-grid
      figure.gallery-shot → <img loading="lazy" alt="…"> + <figcaption>

  details.category.gallery-project        ← Cozy Sleep 🌙           · count
    .gallery-grid → .gallery-empty
```

- `.gallery-grid`: 2 columns desktop → 1 column ≤640px (mirrors `.tools-grid` responsiveness).
- `.gallery-shot`: framed screenshot (recommend the **win98 window frame** for brand cohesion —
  caption in the titlebar, image in the body), `loading="lazy"`, descriptive `alt`.
- Optional **lightbox**: click a shot → full-screen overlay to view detail (see Phase D).

## File touch list

| File | Change |
|---|---|
| `index.html` | New `<section id="gallery">` after line ~638 (`</section>` of tools-section), before notice (~641). Optional `#gallery` hero CTA. |
| `styles.css` | Add gallery CSS near the `.category` block (~865–953). Optional lightbox CSS. |
| `script.js` | **Only if lightbox** — ~30–40 lines for open/close/Esc/focus-trap. Otherwise untouched. |
| `images/gallery/<slug>/` | New folders: `lovespark-dashboard/`, `sparky-reads/`, `cozy-sleep/` (+ seed Sparky Reads shot). |
| `BUGS_AND_ITERATIONS.md` | Log the feature add. |

## Todo checklist (granular)

**Phase A — Scaffolding (folders/assets)**
- [ ] Create `images/gallery/{lovespark-dashboard,sparky-reads,cozy-sleep}/` (each with `.gitkeep`).
- [ ] Seed `images/gallery/sparky-reads/sparky-reads-01.png` ← copy of `~/Downloads/Sparky read.png`.

**Phase B — HTML (`index.html`)**
- [ ] Insert `<section class="gallery-section" id="gallery">` between tools-section and notice-section.
- [ ] Section header: deco + title "Sneak Peeks" + subtitle + Sparky touch (rule #3).
- [ ] `<details class="category gallery-project">` × 3 (Dashboard / Sparky Reads / Cozy Sleep); `category-count` = # shots; chevron `▸`.
- [ ] Each body: `.gallery-grid` with seeded `figure.gallery-shot` where images exist, else `.gallery-empty` placeholder.

**Phase C — CSS (`styles.css`)**
- [ ] `.gallery-section` spacing to match sibling sections; transparent over `--ls-bg-gradient`.
- [ ] `.gallery-grid` (2-col → 1-col ≤640px), `.gallery-shot` + `img`, `figcaption`, `.gallery-empty`.
- [ ] Confirm captions hit WCAG AA contrast on the gradient.

**Phase D — Lightbox (OPTIONAL, recommended)**
- [ ] `.lightbox` overlay markup + handlers in `script.js`: open on shot click, close on ✕ / Esc / backdrop; `role="dialog"` `aria-modal`; focus trap; `prefers-reduced-motion` guard.

**Phase E — Hero CTA (OPTIONAL, recommended)**
- [ ] Add `<a href="#gallery" class="hero-cta">Sneak peeks ✦</a>` to `.hero-cta-group` (smooth-scroll is free).

**Phase F — Verify + ship**
- [ ] `preview_start`; open `#gallery`; expand each panel; confirm seeded + empty states; test 320/360px width; reduced-motion; keyboard (Tab→Enter on summary; Esc closes lightbox); screenshot proof.
- [ ] Update `BUGS_AND_ITERATIONS.md`.
- [ ] Commit on a feature branch (no `Co-Authored-By`, per rule #6), push (per automation rule #15). _Not_ committing to `main` directly.
- [ ] No `manifest.json` version bump — this is a website, not an extension (rule #9 is extension-scoped).

## Decisions to confirm (annotate inline)

1. **Section title** — recommend **"Sneak Peeks"** (subtitle "Screenshots from projects still in the workshop ♡"). Alt: plain "Gallery" / "In the Workshop".
2. **Sparky mascot in header** — recommend a **subtle Sparky** to satisfy rule #3. Note: the live page currently uses the heart/orb aesthetic, not the wolf — flagging the slight aesthetic mismatch for your call.
3. **Project list** — Dashboard, Sparky Reads, Cozy Sleep (+ add more later). Confirm or adjust (e.g. include other TBA work).
4. **Lightbox (Phase D)** — recommend **include now**; screenshots reward zoom. Defer if you want it minimal.
5. **Hero CTA (Phase E)** — recommend **include**. Skip if the CTA row is getting crowded.
6. **Screenshot frame** — recommend **win98 window frame** (on-brand). Alt: light pink-bordered figure.

## Alternatives considered (rejected)

- **JSON-driven (`gallery.json` + render JS)** — rejected: page is hardcoded; premature abstraction for 3 projects. Revisit if gallery exceeds ~8 projects or updates frequently.
- **Horizontal carousel / filmstrip** — rejected per Joona's call; worse for a11y and scaling.
- **Inline screenshots inside existing Coming Soon panels** — rejected: brief asks for a distinct gallery *section*.

---

### ⛔ DO NOT IMPLEMENT YET
Annotate this plan (decisions 1–6 especially). When you're happy, say **"implement it all"** and I'll execute Phases A–F, verify in-browser, log, and push on a branch.
