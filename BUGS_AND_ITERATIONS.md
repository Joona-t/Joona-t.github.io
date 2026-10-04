# Bugs & Iterations

## 2026-10-04: ITER — Visual upgrade Phase 1: tokens and dead CSS

**Change:** Token foundation + CSS debt cleanup from research.md §3, no redesign yet.
- **Tokens:** semantic layer `--surface/--ink/--accent/--accent-ink/--focus/--radius` in `:root` (kawaii) and each theme block (candy, basalt in styles.css; retro in styles-retro.css). Motion tokens `--ease-pop` (per theme: kawaii soft spring, candy springy `linear()`, basalt damped cubic-bezier, retro `steps(4)`), `--ease-out`, `--dur-1..3`. Fluid scales `--fs-xs..--fs-logo`, `--sp-1..--sp-section`; widths `--w-wide` (1180px) and `--w-prose` (68ch).
- **Applied:** 6 section paddings (tools, notice, mission, support, footer, gallery) and 12 one-off font sizes now use tokens; the 3 `1180px` widths use `--w-wide`, mission/notice use `--w-prose`. The `-8px` margin hack on `.gallery-intro` is gone (gallery `.section-header` gets a 24px bottom margin instead; retro keeps its 40px gap). Category hover tint and group rail use `color-mix(in oklch, var(--accent) N%, transparent)` with an rgba fallback first. `text-wrap: balance` on headings, `pretty` on body copy.
- **Dead CSS removed:** the first, fully shadowed `.hero-cta` block (Basalt Monolith skin that the kawaii block overrode); `.glow-blob-keep`, `.glow-blob-2/-3` base rules and `blobDrift` (base `.glow-blob-1` geometry folded into basalt's single ember pool); keyframes `sparkleFloat`, `sparkFade`, `starburstSpin`, `ankhEmber`; retro `.spark`, `.cursor-spark` and `sparkRise-retro` (classes never set; `twinkle-retro` kept because `.section-deco` and mission sparkles use it).
- **JS keyframes → CSS:** `sparkleTwinkle`, `cursorSparkFly`, `cardWobble` now live in styles.css; script.js no longer injects `<style>` tags.
- **Patch pile merged:** basalt `.ankh-glyph` was defined 5 times with stacked `!important`s → one rule with the final computed values (200px, cover, sepia relic frame, no animation, no `!important`); ember pool `::after` 300px. Basalt CTA rest/hover/focus/per-button embers consolidated into the basalt HERO CTA section. Basalt gold wordmark and soon-chip colour folded into their rules. Candy: 3 stacked video blend rules → exactly one `mix-blend-mode: darken` (no `!important`) + the wordmark feather mask. Candy a11y colours now close the candy block; kawaii CTA focus ring uses `--focus` (#7a1540).
- **No more `background-attachment: fixed` (×3):** page ground is a fixed `body::before` layer (z-index -1) repainted per theme; retro turns it off.
- Cache strings bumped to `2026-10-04-p1`.
**Verification:** `node --check script.js` OK; braces balanced (styles.css 371/371, styles-retro.css); `build-gallery.py --check` in sync (8 categories, 29 cards). Local preview (python http.server): all 4 themes render, basalt ankh computed 200×200 / sepia filter / animation none (visual check: framed cream relic, gold Cinzel wordmark), candy videos blend with no MP4 box, `body::before` fixed in candy/kawaii/basalt and `display:none` in retro, zero console errors. New `--accent-ink` pairs AA by WCAG formula (kawaii 6.35, candy 6.07, basalt 10.4, retro 5.09 on `--surface`). Not done: 3-width × reduced-motion screenshot matrix; `audit-contrast.py` targets the extension token sheet, not this site.
**Files:** styles.css, styles-retro.css, script.js, index.html, plan.md, BUGS_AND_ITERATIONS.md

## 2026-10-04: ITER — Visual upgrade Phase 0: defect floor (no visual redesign)

**Change:** Fixed the a11y/perf defect floor from research.md (D2, D3, D4, D8, D11) before any visual work.
- **a11y:** `<h1 class="logo-text">` is now visually hidden (sr-only) in candy/kawaii instead of `display:none`, so the page has a real h1; `video.hero-mark` is `aria-hidden` (dropped its `aria-label`).
- **Fonts:** body font = brand stack (OpenDyslexic → Atkinson Hyperlegible → system) instead of never-loaded Quicksand; Pacifico + Atkinson added to the critical font link; Press Start 2P / Cinzel / Cormorant load non-blocking (`media=print onload` + `<noscript>`); OpenDyslexic Regular preloaded.
- **Motion:** 6 scattered reduced-motion blocks replaced by ONE global block at the end of styles.css with `!important` (beats the inline `animation` script.js sets), `scroll-behavior:auto`, and hides `.dyson-swarm`/`#cursor-sparks`/`#sparkle-field`. JS gets `mqReduce`/`mqFine`: swarm + sparkle field not built under reduced motion; cursor trail needs fine pointer + motion allowed (passive listener); anchor scroll uses `auto` when reduced; hero videos pause and reset to poster (and resume if the preference flips back).
- **Theme fallback:** `apply()` falls back to `candy` (was `pink`); stale kawaii-default comments fixed (script.js, index.html).
- **Contrast:** kawaii small pink text → `#b3185c`, white-on-pink buttons (card-link, kofi, active pill) → `#d81b73→#a51259`; candy sub-tagline + badge → `#b3185c`; retro badge bg `#b3185c`, card-link/kofi gradient, sub-tagline → bubblegum (11.6:1 on the dark page). Retro fixes live at the end of styles-retro.css because that sheet loads last and wins equal-specificity ties. Aaron memorial card keeps its green retro button; `--soon` pills excluded.
- **Focus:** themed `:focus-visible` rings on `.card-link`, `.kofi-btn`, `.notice-link`, `.hero-social-link` (kawaii `#7a1540`, candy `--ls-focus`, retro hot-pink / `#b3185c` on cream cards; basalt keeps its ember rings).
- **Misc:** `.gallery-mascot` gets `object-fit:contain`; the two 404 refs removed (`assets/icon-ankh.png` → `hero-ankh.png`, `ankh-basalt.gif` declaration dropped). Cache strings bumped to `2026-10-04-p0`.
**Verification:** `node --check script.js` OK; CSS braces balanced (styles.css, styles-retro.css); `build-gallery.py --check` in sync (8 categories, 29 cards). Local preview: computed styles confirmed per theme (h1 1px sr-only in candy/kawaii, visible in retro/basalt; badge/sub-tagline/button colours as above; body font = OpenDyslexic stack), zero console errors. Contrast ratios computed by hand (WCAG formula); `audit-contrast.py` targets the extension token sheet, not this site, so not used. Baseline 4-theme × 3-width screenshots NOT taken.
**Files:** index.html, script.js, styles.css, styles-retro.css, plan.md, research.md, BUGS_AND_ITERATIONS.md

## 2026-09-02: Sparky Habits screenshot added to Sneak Peeks

**Change:** Added the supplied Sparky Habits dashboard screenshot as the third image in the `🧠 Sparky` Sneak Peeks gallery. Converted the 3016×1698, 3.6 MB source PNG to a 1600×900, 157 KB JPEG at quality 86, added descriptive alt text and a concise caption, and updated the visible gallery count from 2 to 3.
**Verification:** Confirmed the optimized image dimensions and file size locally; the rendered gallery and live deployment were checked after publishing.
**Files:** index.html, images/gallery/sparky/sparky-03.jpg (new)

## 2026-07-01: Love Kana "Sneak Peeks" image landed

**Change:** Screenshot arrived (`~/Documents/screenshots/Love Kana.png`, 1956×1424 PNG, 1.9 MB). Optimized to `images/gallery/love-kana/love-kana-01.jpg` via `sips -Z 1600 -s format jpeg -s formatOptions 86` → **1600×1165, 137 KB** (matches the other gallery shots' weight; a 1.9 MB PNG would've bloated the page). Re-added the deferred `🌸 Love Kana` gallery-project panel after `gal-tongue`, pointing at the JPG, with intrinsic dims set to avoid CLS.
**Verification:** Browser — image loads (`naturalWidth` 1600, renders 716×522 in-panel), panel opens between Tongue and Sparky, no current failed requests (earlier `.png` 404s were stale history from the placeholder path). Screenshot confirms the kana quiz shot displays.
**Files:** index.html, images/gallery/love-kana/love-kana-01.jpg (new)

## 2026-07-01: "The Suite" — apps lead, Chrome extensions behind one dropdown

**Change:** Joona is pivoting the site toward software/apps, so the browser extensions were tucked one click deep. Extended the data-driven gallery with an optional `"group"` field: consecutive categories sharing a group title get wrapped in a collapsible parent `<details class="category category-group">`. Tagged the 5 extension categories (Focus, Reading, Privacy, Themes, Open Knowledge) into `🧩 Chrome Extensions` and **reordered** so 🍎 Mac & iOS (7) · ⚛️ STEM (2) · 🧪 Sparky Lab (1) lead top-level, with the Chrome Extensions group (17) last. `build-gallery.py` gains `render_group` + `group_id` (title→`grp-chrome-extensions`), parent count = total child cards. `extract-gallery.py` made group-aware via depth-counted `group_spans` so the inverse round-trip stays lossless. New CSS (`.category-group`/`.group-body`) is theme-agnostic structural only — the group reuses `.category-*` classes so it themes for free; sub-categories indent with a soft left rail.
**Verification:** `build --check` in sync (8 categories, 27 cards). Round-trip test: `extract` → semantic-equal to canonical JSON (group assignments correct), restored. Browser (candy): top-level order = Mac & iOS/STEM/Sparky Lab/Chrome Extensions; group collapsed by default; click → reveals 5 sub-categories (6+2+5+3+1 = 17); click Focus → cards render in-grid, not clipped by padding overrides; zero console errors. Bumped `styles.css?v=` → `2026-07-01-extgroup`.
**Files:** data/gallery.json, index.html, styles.css, scripts/build-gallery.py, scripts/extract-gallery.py, scripts/README.md, BUGS_AND_ITERATIONS.md

## 2026-07-01: Dissolve ✨ Coming Soon; refile panels + add Love Kana

**Change:** The ✨ Coming Soon category was a scattered junk drawer. Removed it and refiled each panel by type: the 4 Mac & iOS App cards (Sparky, LoveSparkCards, Tongue, Sparky Reads) + the new **Love Kana 🌸** card + Sparky Reads · Web → 🍎 Mac & iOS; LoveSpark Dashboard (Chrome Extension) → 🧠 Focus & Neurodivergent; dropped the "More Coming Soon ✨" filler.
**Verification:** 9→8 categories, no dangling `#cat-coming-soon` refs, DOM confirms refiled counts.
**Deferred:** the **🌸 Love Kana** "Sneak Peeks" image panel was built then pulled from this push because its screenshot (`images/gallery/love-kana/love-kana-01.png`) isn't on disk yet — shipping it would show a broken image behind the collapsed panel. Re-add the panel (after `gal-tongue`) once the shot lands. The text Love Kana *card* in 🍎 Mac & iOS ships now (no image).
**Files:** data/gallery.json, index.html

## 2026-06-28: Data-driven gallery generator (kill hand-maintained cards)

**Change:** "The Suite" gallery cards were hand-copied HTML — each new CWS launch meant pasting a Win98-card block and manually bumping the category count (easy to desync). Made it data-driven: `data/gallery.json` holds 9 categories / 27 cards; `scripts/build-gallery.py` renders them between `<!-- GALLERY:START/END -->` markers in `index.html` and **computes each category count from len(cards)**. Schema covers every existing variant (badge optional, multi-paragraph `desc`, embedded `<em>`/`<strong>`, `memorial` line + `win98-card--aaron`, "coming soon" pills with custom labels, `Install ✦`/`Download ✦`). Added `scripts/extract-gallery.py` (inverse: HTML → JSON, used to seed the data file) and `--check` mode (exits non-zero on drift; pre-commit/CI gate). `scripts/README.md` documents the workflow.
**Verification:** Generator reproduces the prior gallery **byte-for-byte** — diff of regenerated `index.html` vs the pre-change file is ONLY the two marker comment lines. End-to-end test: adding a card made `--check` fail, `build` landed the card and auto-bumped the count 2→3, restoring the data reproduced the tree exactly. Browser: 9 categories render, declared count == actual cards for all, zero console errors.
**Files:** data/gallery.json (new), scripts/build-gallery.py (new), scripts/extract-gallery.py (new), scripts/README.md (new), index.html (markers only)

## 2026-06-28: Add LoveSpark Notes to The Suite gallery

**Change:** LoveSpark Notes shipped to the Chrome Web Store, so added its gallery panel to lovespark.love. New Win98 card under "🧠 Focus &amp; Neurodivergent" (best fit for a notes/productivity new-tab app), linking the clean CWS URL (`/detail/cbekmfnggenafmgcmcnmaohdmaacppbm`, `utm_source` stripped to match the other cards). Bumped that category count 4 → 5. Verified rendering in preview (card styled correctly, link resolves, no console errors).
**Files:** index.html

## 2026-06-26: Basalt theme — phantom 520px block pushed the hero down

**Problem:** Switching to the basalt theme showed a large empty dark band at the top; the ankh glyph + hero content appeared ~520px down (looked broken/unprofessional). Measured: `.hero` top = 520px in basalt vs 0 in other themes.
**Root cause:** `.glow-blob-1` (markup `class="glow-blob glow-blob-1"`) only ever gets `position: fixed` from the `.glow-blob-keep` class — which it does NOT have. In every other theme `.glow-blob` is `display:none`, so it never mattered. The basalt rule sets `.glow-blob-1` to `display: block` (an ember glow) but forgot `position`, so it computed to `position: static` → a 520×520 block in normal flow that shoved the whole hero down 520px.
**Fix:** In `html.theme-basalt .glow-blob-1`, added `position: fixed; border-radius: 50%; filter: blur(100px); z-index: 0;` so it renders as a fixed background glow (like a keep-blob) and takes zero layout space. Verified in-browser: glow-blob-1 position now `fixed`, hero top 0, ankh at y≈86 (visible immediately, no empty band). Bumped `styles.css?v=` → `2026-06-26-basaltfix` so returning visitors get the fix.
**Files:** styles.css, index.html (cache-bust), BUGS_AND_ITERATIONS.md

## 2026-06-25: The Suite — live-only product categories

**Change:** Moved the four unreleased "Coming soon ♡" cards out of 🍎 Mac & iOS (Sparky, LoveSparkCards, Tongue, Sparky Reads) into the ✨ Coming Soon category, so each product category now shows only live panels in its own bucket. Mac & iOS keeps only Glyph Grid Studio (the live "Download" card); its count drops 5 → 1, Coming Soon rises 3 → 7 (4 native apps prepended ahead of the existing Dashboard / Sparky Reads · Web / "More Coming Soon"). Privacy (Popup Blocker), STEM (Axion TBA), and Sparky Lab (Cozy Sleep) left untouched per scope decision — only the literal Mac & iOS coming-soon cards moved. Verified: declared counts match actual cards, DOM balanced (167/167 divs), rendered DOM + screenshot confirm the layout.
**Files:** index.html

## 2026-06-14: Sneak Peeks gallery — Tongue & Sparky only

**Change:** Added the "Sneak Peeks" gallery section (after The Suite) showing the two unpublished flagship apps with real screenshots — Tongue (kana drill) and Sparky (Command Center). Screenshots optimized via `sips -Z 1600 -s format jpeg -s formatOptions 86` → 229 KB / 369 KB (from 4.3 MB / 9.5 MB source PNGs). Only apps we have screenshots for are listed; placeholder panels for Cozy Sleep / Dashboard / Sparky Reads were removed for now and return when their shots exist.
**Files:** index.html, styles.css, images/gallery/{tongue,sparky}/*.jpg, images/sparky.png

## 2026-05-05: Theme switcher (kawaii ⇄ retro)

**Problem:** Joona wanted both site eras live — the current "bubble gum Y2K kawaii" hero plus the older dark-wine, ♡-glyph + CSS-rings hero — switchable from the UI to "showcase our taste". The pre-redesign aesthetic only existed in git history (commit `0891dce`, parent of `ad48db6`).
**Root cause:** Single live site = single aesthetic. No theming layer existed. Class names also collide between the two eras (`.heart-orb`, `.win98-card`, `.glow-blob`, etc., all share names but have completely different rules) so we couldn't just load both stylesheets flat.
**Fix:** Added second stylesheet `styles-retro.css`, mechanically generated by extracting the pre-redesign styles via `git show 0891dce:styles.css` and prefixing every selector with `html.theme-retro` (also renamed all keyframes with `-retro` suffix to prevent global-name collisions). Baked the v2 polish into the retro hero (heart pulse 2.4s → 3.5s with chained translate centering, scale 1.12 → 1.18; ringExpand 3s → 7s with delays 0/2.33/4.67; final scale 3.2 → 2.0) and added a scoped `prefers-reduced-motion` rule the old version never had. Renamed retro divs `.orb-ring` → `.orb-ring-css` to avoid collision with the new SVG `.orb-ring`. Added a fixed top-right pill switcher (`.theme-switcher`) with aria-pressed, keyboard focus, and visible state in both themes. Theme persists via `localStorage['lovespark-theme']`, syncs across tabs via the `storage` event, and a tiny inline script in `<head>` applies the class to `<html>` before stylesheets evaluate (no FOUC).
**Files:** index.html, styles.css, styles-retro.css (new), script.js, BUGS_AND_ITERATIONS.md

## 2026-05-05: Heart-orb cadence, centering, and pulse polish

**Problem:** Hero heart-orb was triggering motion-induced nausea. (1) `orbRadiate` ran 2.6s with stagger 0.85s — a new ring spawned every ~0.87s, faster than the previous version. (2) The heart video's internal pulse was visually drowned out by the rapid rings, and froze entirely if autoplay was blocked or the tab was throttled — heart looked dead. (3) `.orb-ring` had no centering rules (`position: absolute` with no `top`/`left`/`inset`/`transform`) so the 220×220 rings sat at the top-left of the 240×240 `.heart-orb`, ~10px off-centre on both axes — rings visibly missed the heart.
**Root cause:** Ring duration too short relative to stagger; rings missing centering anchor; no defensive CSS pulse on `.heart-mark` to survive autoplay being throttled.
**Fix:** Slowed `orbRadiate` to 7s with delays 0/2.33/4.67s (one ring every ~2.33s, 2.7× slower). Reduced final scale 2.4 → 2.0 to soften peripheral sweep. Centred rings with `inset: 0; margin: auto;` (doesn't touch `transform`, so the existing scale+rotate keyframes keep working). Added new `heartBeatGentle` keyframes (scale 1 → 1.035, 4.5s) to `.heart-mark` so the heart breathes via CSS even when the video is paused. Added `.heart-mark` to the existing `prefers-reduced-motion` selector list.
**Files:** styles.css, BUGS_AND_ITERATIONS.md

## : |2026-02-18|||Revert "Add background artwork asset"

**Problem:** |2026-02-18|||Revert "Add background artwork asset"
**Details:** This reverts commit b6346ae3add4fd672955a9645c68090d24276638.
**Files:** images/background-artwork.png
**Commit:** 0aa4cab

## : |2026-02-18|||Fix background as CSS-only layer with overlay and assets path

**Problem:** |2026-02-18|||Fix background as CSS-only layer with overlay and assets path
**Files:** assets/lovespark-bg.png,styles.css
**Commit:** 2749684

## : |2026-03-06|||Fix Games hero CTA: vibrant ocean blue gradient, white text, pink glow, moved above Zarathustra

**Problem:** |2026-03-06|||Fix Games hero CTA: vibrant ocean blue gradient, white text, pink glow, moved above Zarathustra
**Files:** index.html,styles.css
**Commit:** 6d43f8f

## : |2026-02-18|||Revert "Add side art around hero card and LoveSpark title icon"

**Problem:** |2026-02-18|||Revert "Add side art around hero card and LoveSpark title icon"
**Details:** This reverts commit da0abb9d437c0665aa60abdfc448e797f9d3ce2d.
**Files:** assets/hero-clouds.png,assets/hero-mushrooms.png,assets/lovespark-icon.png,index.html,styles.css
**Commit:** 88aa457

## : |2026-02-18|||Revert "Use artwork-only background without duplicate gradient layer"

**Problem:** |2026-02-18|||Revert "Use artwork-only background without duplicate gradient layer"
**Details:** This reverts commit ae261f57431e3ab938efddd23b05031cf0a3bc7e.
**Files:** styles.css
**Commit:** 8c198e4

## : |2026-02-18|||Revert "Reposition side art outside hero card and keep card clean"

**Problem:** |2026-02-18|||Revert "Reposition side art outside hero card and keep card clean"
**Details:** This reverts commit 317d367aa5c8a04798eac04ed07d07184e021122.
**Files:** styles.css
**Commit:** a5574fc

## : |2026-02-20|||fix: add ko-fi link (ko-fi.com/joonat)

**Problem:** |2026-02-20|||fix: add ko-fi link (ko-fi.com/joonat)
**Files:** index.html
**Commit:** aa7c2e8

## : |2026-02-18|||Revert "Add responsive background artwork layer and readability overlay"

**Problem:** |2026-02-18|||Revert "Add responsive background artwork layer and readability overlay"
**Details:** This reverts commit cb3df3036591d192b3404151bc2aa3180942447a.
**Files:** styles.css
**Commit:** cae4773

## : |2026-02-18|||Revert "Add layered decorative background composition on page wrapper"

**Problem:** |2026-02-18|||Revert "Add layered decorative background composition on page wrapper"
**Details:** This reverts commit fba2f247688ae4df0cfb6d56f40078be1f8aee0f.
**Files:** assets/bg-clouds-rainbow.svg,assets/bg-mushrooms.svg,assets/bg-sparkles.svg,styles.css
**Commit:** d11f440

## : |2026-02-18|||Revert "Fix background as CSS-only layer with overlay and assets path"

**Problem:** |2026-02-18|||Revert "Fix background as CSS-only layer with overlay and assets path"
**Details:** This reverts commit 2749684639c0c3ddbe56fb0113a6747925cf711c.
**Files:** assets/lovespark-bg.png,styles.css
**Commit:** d775085

<!-- Format:
## YYYY-MM-DD: Short Title

**Problem:** What went wrong or needed changing
**Root cause:** Why it happened
**Fix:** What was done to resolve it
-->
