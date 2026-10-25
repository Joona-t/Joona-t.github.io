# Research — Gallery section for lovespark.love

_Date: 2026-06-14 · Feature: a "Gallery" section showing screenshots of unpublished (Coming Soon / Sparky Lab / TBA) projects, each project as a click-to-expand dropdown._

## Goal (from Joona)

Add a **Gallery** section to the live landing page. It contains screenshots of projects
**not yet published** — the ones currently flagged "Coming Soon" and Sparky Lab / TBA.
Each project is a **dropdown panel** (same idiom as the existing Suite panels); clicking a
project expands it to reveal that project's pictures. Joona's hypothesis: a vertical
**dropdown/accordion** beats a horizontal layout here. Confirmed correct — accordion scales
to many projects, matches the page's existing idiom, and needs zero new interaction JS.

## Where the page actually lives (canonical vs. duplicates)

- Live domain **`lovespark.love`** → `CNAME` → GitHub Pages repo **`Joona-t/Joona-t.github.io`**.
- **CANONICAL working copy (edit here):** `Claude x LoveSpark/Web Projects/Joona-t.github.io`
  — `HEAD == origin/main` (`6f81b00`), clean except a stray `.DS_Store`.
- **Stale duplicate — DO NOT EDIT:** `Web Projects/lovespark-live` (same remote, **3 commits behind**).
  Also `~/Joona-t.github.io` exists but is not a clean checkout. **Risk: editing the wrong copy.**
- `Web Projects/lovespark-love` (repo `Joona-t/lovespark-love`, last commit March, no CNAME) is an
  **abandoned earlier version** — ignore it. Its `extensions.json` is NOT used by the live page.

## Current page structure — `index.html` (~34 KB, all hardcoded HTML)

- `header.hero #top` — videos, heart-orb, CTA group (incl. `#tools` smooth-scroll anchor).
- `section.tools-section #tools` — **"The Suite"** → 9 `<details class="category">` panels:
  focus, reading, privacy, themes, knowledge, stem, mac-ios, **sparky-lab**, **coming-soon**
  (the last two hold the unpublished projects, lines ~549–637).
- `section.notice-section` → `section.mission-section #mission` → support / contact.
- **Everything is hardcoded HTML.** The page is NOT rendered from any JSON manifest.
  → Page convention = hardcoded markup. A JSON-driven gallery would fight the grain (premature abstraction for ~3 projects).

## The dropdown pattern to reuse (exact shape)

```html
<details class="category" id="cat-...">
  <summary class="category-header">
    <h3 class="category-title">🧪 Title</h3>
    <span class="category-count">N</span>
    <span class="category-rule" aria-hidden="true"></span>
    <span class="category-chevron" aria-hidden="true">▸</span>
  </summary>
  <div class="tools-grid"> …cards… </div>
</details>
```

- **Pure CSS, ZERO JavaScript** for open/close (`styles.css:867–953`).
  - Chevron rotates: `details.category[open] > summary .category-chevron` (`:931`).
  - Grid reveals: `details.category[open] > .tools-grid` (`:936`).
  - **Reduced-motion already handled** (`:952–953`).
  - Native `<details>` → keyboard + screen-reader accessible **for free**.
- `.tools-grid` (`styles.css:499`) → collapses to 1 column at ≤640px (`:792`).
- Cards = `.win98-card` (win98 titlebar + `.card-body`) — the brand's window-frame motif.

## `script.js` (300 lines) — relevant existing behavior

- Theme pills, orb rings, dyson swarm, cursor sparks (decorative).
- **Smooth-scroll for every `a[href^="#"]`** (`:267`) → a `#gallery` nav/CTA link scrolls for free.
- `.win-btn-close` collapses a card (`:280`).
- **No modal / lightbox exists.** Click-to-enlarge would be NEW JS (optional, ~30 lines).

## The unpublished projects (source of gallery content)

| Project | Badge | Status | Source dir | Screenshots on disk? |
|---|---|---|---|---|
| LoveSpark Dashboard 📊 | Chrome Extension | Coming Soon | `Apps & Tools/lovespark-dashboard`, `Extensions/infrastructure/lovespark-dashboard` | **None** (only `mascot.png`) |
| Sparky Reads · Web 🌐 | Web App | Coming Soon | (not found by that exact name) | **`~/Downloads/Sparky read.png` (1 file)** |
| Cozy Sleep 🌙 | Sparky Experiment | Sparky Lab / TBA | `iOS Apps/lovespark-cozy-sleep` | **None** |
| "More Coming Soon ✨" | — | placeholder | — | — (not a real project) |

## ⚠ CRITICAL finding — screenshots don't exist yet

- The live site holds **no project screenshots**: `images/` = only `adhd.png`; `assets/` = hero
  videos + OpenDyslexic fonts + paper grain.
- The only real screenshot found anywhere for these projects is **`~/Downloads/Sparky read.png`**.
- **Implication:** the gallery must ship as a **working shell**, not a finished showcase:
  1. Define a clean drop-in folder: `images/gallery/<project-slug>/`.
  2. Render gracefully with **0 images** per project → a styled "Screenshots coming soon ♡" placeholder.
  3. Joona adds screenshots incrementally; no code change needed beyond dropping files + one `<img>` line.
  - First real image available to seed: copy `~/Downloads/Sparky read.png` → `images/gallery/sparky-reads/`.

## Brand / rules touchpoints (must satisfy)

- **Rule #3** — Sparky mascot must appear in the UI → add a Sparky touch to the gallery section header.
- **Rule #4** — `--ls-bg-gradient` background on all LoveSpark UIs → inherited from `body`; gallery
  section stays transparent over it (verify token exists during impl).
- **Rule #12** — OpenDyslexic primary font → already loaded via `@font-face` from `assets/fonts`; inherited.
- **A11y (WCAG 2.1 AA):** descriptive `alt` per screenshot; `loading="lazy"` on images;
  focus-visible (inherited); reduced-motion (inherited for accordion, must add for any lightbox);
  caption contrast against the gradient; touch targets ≥32px.

## Open decisions (resolved in `plan.md`)

1. **Hardcoded HTML panels** (matches page) vs JSON-driven render → recommend **hardcoded**.
2. **Click-to-enlarge lightbox** → optional enhancement, not required by the brief.
3. **Section placement** → immediately **after `#tools`** (right after the Coming Soon panels),
   before the notice section — reads as "here's a visual preview of what's shipping next."
4. **Relationship to existing Coming Soon text panels** → gallery is the **visual companion**
   to them (minor text redundancy is acceptable and intentional).
