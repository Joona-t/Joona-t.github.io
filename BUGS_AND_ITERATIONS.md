# Bugs & Iterations

## 2026-10-30: ITER: Anthropic Watch published

**Change:** Anthropic Watch (repo `lovespark-anthropic-watch`, commit 590bc05) is now served at `/anthropic-watch/`. It's added as a hero button next to OpenAI Watch and as a card in the STEM and More panels (`data/gallery.json` → `scripts/build-gallery.py`). The tracker's "Verified daily" chip was false, since no daily job exists, so it now shows the real check date (Oct 4, 2026).
**Verification:** Local preview: the home page shows all three links, and STEM count is 5; `/anthropic-watch/` loads 13/13 requests 200 with 0 console errors and no horizontal scroll at 375 px; every deployed file is byte-identical to the tracker repo; the tracker's `validate.mjs` passes.
**Files:** anthropic-watch/ (14 files), data/gallery.json, index.html

## 2026-10-28: ITER: 3D Agentic Studio sneak peek

**Change:** New first Sneak Peeks panel, "🖨️ 3D Agentic Studio", at Joona's request: a screenshot of the studio's C.C. plaque viewer (Concept 11), captioned as a free guide to making 3D-printed art with an AI agent, in the workshop, with a fan-art note. No link: the studio is not published yet. Image `images/gallery/3d-agentic-studio/3d-agentic-studio-01.jpg` (1600×757, 132 KB, re-encoded from Joona's screenshot, no metadata), same markup as the other panels.
**Verification:** Local preview of the branch: panel first, image loads (1600 px natural); checked open in basalt, bubblegum, parchment and kawaii (🖨 renders as the existing brazier glyph in basalt/parchment); no horizontal overflow at 320 and 375 px. `scripts/build-gallery.py` reports no change. `ls-check .`: 7 pass, 0 fail.
**Files:** index.html, images/gallery/3d-agentic-studio/3d-agentic-studio-01.jpg

## 2026-10-27: ITER: X / Twitter link back in the footer

**Change:** Restored the `x.com/the_null_path` link (and its `✦` separator) after GitHub in the footer "Elsewhere" nav, at Joona's request. Reverts the 2026-10-24 removal.
**Verification:** `grep -n 'x.com/the_null_path' index.html` finds one footer link; the page loads with it rendered.
**Files:** index.html

## 2026-10-27: ITER: "See the tools" hero button removed

**Change:** At Joona's request the "See the tools" hero button is gone. The site bar's "Suite" link still jumps to `#tools`.
**Verification:** Local headless Chrome: the hero group lists 9 buttons, none "See the tools"; screenshot checked.
**Files:** index.html

## 2026-10-27: ITER: Destiny specks shrunk to pinpoints

**Change:** Joona: the Qwen Guide sparkle was still too large. Specks are now 0.5–1.1 px (were 0.8–1.9 px) with a 1 px glow (was 2 px).
**Verification:** Local preview, basalt: 40 specks, widths 0.51–1.06 px; screenshot shows pinpoint sparkle. `node --check` passes. Cache strings bumped to `2026-10-27-fine`.
**Files:** index.html, script.js, styles.css

## 2026-10-26: ITER: Destiny specks made subtle, a wordmark-style sparkle

**Change:** Joona: the gold dust flying off the Qwen Guide button was too much; it should sparkle subtly like the LoveSpark wordmark's specks. Now 40 tiny (0.8–1.9 px) pale-gold dots sit on the button face and a thin halo just past its edge, twinkle in place and creep only a few px outward before fading. Softer glow (`0 0 2px`).
**Verification:** Local preview, basalt: 40 specks; screenshot shows a fine shimmer on and around the button only, none reaching neighbouring buttons. `node --check` passes. Cache strings bumped to `2026-10-26-sparkle`.
**Files:** index.html, script.js, styles.css

## 2026-10-26: ITER: Destiny specks — gold dust radiates from the Qwen Guide button

**Change:** At Joona's request, 48 light-gold specks drift outward from the edges of the Qwen Guide button (`.hero-cta--primary`) and fade, looping, in every theme. Built in `script.js` (`initDestinySpecks`), animated by CSS keyframes only; not built under reduced motion and paused with the shared hero visibility gate. The button now has `overflow: visible; z-index: 2` so specks pass over neighbouring buttons; they never take clicks.
**Verification:** Local preview, basalt: 48 specks, absolutely positioned, `destinySpeck` animation running; screenshot shows dust spreading around the button; no console errors; `node --check` passes. Cache strings bumped to `2026-10-26-destiny`.
**Files:** index.html, script.js, styles.css

## 2026-10-26: ITER: Gold ring glow moves from "See the tools" to Qwen Guide

**Change:** At Joona's request the conic ring glow (`.hero-cta--primary`) moved off the "See the tools" hero button and onto the Qwen Guide button, which also gains an Eye of Horus 𓂀 after its label. HTML-only: the class moved, no CSS changed.
**Verification:** Local preview, basalt: only "Qwen Guide𓂀" computes a `conic-gradient` background; hero screenshot checked.
**Files:** index.html

## 2026-10-26: ITER: Sneak Peeks moved first, under the hero buttons

**Change:** At Joona's request the Sneak Peeks section (`#gallery`) now sits directly after the hero (buttons + hiatus note), before The Suite. The nav lists Peeks before Suite to match. Intro copy adds: some projects may stay fully private for personal use, but most will likely be published at some point.
**Verification:** Local preview: `main` children order is top → gallery → tools; section screenshot checked in basalt; `build-gallery.py --check` in sync (9 categories, 35 cards).
**Files:** index.html

## 2026-10-25: ITER: Tagline is now "Good Vibes Only"

**Change:** The hero tagline "Retro pink tools for a calmer, more beautiful internet." is now **Good Vibes Only 😎**, at Joona's request. In basalt and parchment the 😎 becomes **𓈗** (Egyptian hieroglyph N035A, water), through one new row in the `ancientGlyphs` table. The `<title>` and `og:description` keep the old line, since the request was for the visible header.
**Verification:** Local Chromium. Basalt and parchment hide the 😎 and draw 𓈗 (`::before` content); bubblegum and kawaii show 😎 (`.glyph-orig` inline). Basalt hero screenshot checked. `node --check` passes. Cache strings bumped to `2026-10-25-vibes`.
**Files:** index.html, script.js

## 2026-10-25: ITER + BUG: Glyph Grid Studio card says "Visit"; basalt card buttons lose the pink glow

**Change:** The Glyph Grid Studio card's button now reads "Visit" instead of "Download", because it links to the studio's site, not a file. Changed in `data/gallery.json` and rebuilt with `scripts/build-gallery.py`, which touched only that line.
**Bug:** In basalt, every card button showed a pink drop-glow under it. **Root cause:** the base `.card-link` 3D lip is `0 3px 0 var(--deep-mauve), 0 6px 14px var(--shadow-hot)` (kawaii pink), and basalt's card-link rule overrode colour, background and border but not `box-shadow`. **Fix:** basalt now casts a bronze lip with a soot shadow (`#5a3d12` + black), with matching hover and active states.
**Verification:** Local Chromium, basalt: the button text is "Visit 🜂" and the computed box-shadow is `rgb(90,61,18) 0 3px 0, rgba(0,0,0,.45) 0 6px 14px`. Screenshot checked. Cache strings bumped to `2026-10-25-visit`.
**Files:** data/gallery.json, index.html, styles.css

## 2026-10-25: ITER: Retro theme archived

**Change:** Joona archived the retro theme.
- The pill is gone, so the site offers basalt · bubblegum · parchment · kawaii.
- `styles-retro.css` moved to `archive/` (`git mv`, history kept) and is no longer loaded.
- The retro-only code is deleted: the sparkle field and the cursor spark trail (their JS modules and container divs), the starburst markup, and the Press Start 2P font request.
- `retro` is out of the switcher's class map and valid list, and the remaining retro checks in the motion and video gates are gone.
- A visitor who saved `'retro'` now opens on basalt, migrated in the head script.

`styles.css` still holds 34 `html.theme-retro` selectors, many sharing rule lists with basalt. They can't match any more, so they were left alone rather than split apart. Cache strings bumped to `2026-10-25-retro-archived`.
**Verification:** Local Chromium at 375px. A saved `'retro'` reloads as `theme-basalt` with storage rewritten. No retro stylesheet is loaded and `#sparkle-field` is gone. A real click on each pill switches theme (a scripted `.click()` while the pane is hidden waits on the View Transition's next frame, which is a harness artifact). scrollWidth = 375. No console errors. `node --check` passes.
**Files:** index.html, script.js, archive/styles-retro.css

## 2026-10-25: ITER: Basalt is the default theme; candy renamed to bubblegum

**Change:** A first visit now opens on basalt instead of candy. The candy theme is renamed bubblegum throughout: the class `theme-candy` → `theme-bubblegum` (115 selectors), the storage key `'candy'` → `'bubblegum'`, and the theme-name comments. Colour adjectives such as "candy pink" and the `--candy-mint` token stay. The pills now read basalt · bubblegum · parchment · kawaii · retro. A visitor who saved `'candy'` is migrated to `'bubblegum'` in the head script, so nobody loses their choice. Cache strings bumped to `2026-10-25-basalt-default`.
**Verification:** Local Chromium. With nothing saved, the page opens on `theme-basalt` with the basalt pill pressed. A saved `'candy'` reloads as `theme-bubblegum`, the stored value is rewritten, and the bubblegum gradient applies. Each theme loads only its own hero videos. scrollWidth = 375 in all five themes on a phone. No console errors. `node --check` passes.
**Files:** index.html, script.js, styles.css, styles-retro.css

## 2026-10-25: BUG + ITER: Basalt ankh glow off-centre; ancient glyphs replace the cute marks

**Problem 1:** In basalt, the ember glow sat 20px to the right of the ankh.
**Root cause:** The glow `.heart-orb::after` is 300px wide inside the 260px orb and was centred with `inset: 0; margin: auto`. When an absolutely positioned box is wider than its container, the browser can't satisfy both sides, so in left-to-right layout `margin-left` resolves to 0 and all 40px of overflow goes to the right. Vertically the margins came out −20/−20, so it was only off horizontally.
**Fix:** Centre it with `left: 50%; top: 50%; transform: translate(-50%, -50%)`. The `ankhPool` animation only changes opacity, so the transform is safe. No other element uses the `inset: 0` + `margin: auto` pattern (grep).

**Change 2:** Joona asked for basalt and parchment to be esoteric, cryptic and mythic, built on the fire-rising and forge motifs, with no flowers, stars or emoji. `script.js` `ancientGlyphs()` wraps each emoji, heart, flower and sparkle in `.glyph-swap[data-ancient]`, using one lookup table of 34 entries. CSS hides the original and draws the ancient glyph, in those two themes only. The swaps:
- ✦ → 🜂 (fire rising)
- ✿ → ⧫ (forge lozenge from the cipher)
- ♡ → 𓄣 (ib, the heart)
- the category and card emoji → Egyptian hieroglyphs, runes, and alchemical or planetary signs (for example 🍎 → djed 𓊽, 🛡 → algiz ᛉ, 🧪 → alembic 🝪)

The walk covers the whole page, so the generated gallery (`data/gallery.json`) needs no edits. Ornaments take the theme accent (ember or rubric) instead of the kawaii pastels and glows. Basalt's display font is now Cinzel instead of the Pacifico script. All three Sparky images are toned to the theme ink rather than pink; the mascot stays, as the suite rule requires. Cache strings bumped to `2026-10-25-glyphs`.
**Verification:** Local Chromium. The glow centre and the ankh centre are identical (512, 264). There are 120 swaps, and no pictographs are left in either theme apart from ✕ (window buttons), © and the already-ancient ☉ ☥ 𓂀. Kawaii, candy and retro still show the originals (`.glyph-orig` is inline, no `::before`). scrollWidth = 375 in all five themes. No console errors. `node --check` passes.
**Files:** index.html, script.js, styles.css

## 2026-10-25: ITER: Lore inscription in basalt and parchment

**Change:** Joona's lore is now carved under the taglines in the two esoteric themes: the sigil line (ヨーナ 𓇳 เมฆ 🜁 餓狼), the four-element verse (𓂀 veil, 🜃 ground, ✺ Architects, 🜂 fire) and the Imperial Aramaic cipher. It is set in Cormorant italic between hairline rules, with glyphs in ember (basalt) or oxblood rubric (parchment). The `.lore` aside is `display:none` in kawaii, candy and retro, and it joins the hero entrance stagger. Decorative glyphs and the cipher are `aria-hidden`, so screen readers get the verse text. Cache strings bumped to `2026-10-25-lore`.
**Verification:** Local Chromium at 1280px and 375px. Lore shows only in basalt and parchment (307px wide on a phone). scrollWidth = 375 in all five themes. The Aramaic glyphs render. No console errors.
**Files:** index.html, styles.css

## 2026-10-25: BUG + ITER: Basalt loses its beige panels; new esoteric Parchment theme

**Problem:** Joona found basalt's charcoal-on-cream wordmark panel (and its ember frame) off-putting on the dark stone.
**Root cause:** `hero-basalt.mp4` baked a cream paper ground into the video, and CSS framed it with a gold hairline and glow, so it read as a beige slab. The ankh relic had the same cream panel and frame.
**Fix (basalt):** The wordmark is re-graded from `hero-pastel.mp4` to beige glyphs (`#ece3cc`) on pure black, and shown with `mix-blend-mode: lighten`, so only the letters sit on the stone. The frame is gone. The ankh now uses `hero-ankh-beige.png`: the glyphs on a transparent ground, after the PNG's vignette is flattened with a blur-divide so it does not turn into a grey disc. `.hero` drops its `z-index` in basalt and parchment, because that stacking context made the video blend against nothing.
**New (parchment):** A fifth theme (`theme-parchment`, pill between basalt and retro). The whole page is aged parchment with charcoal ink. Joona asked for esoteric rather than cute, so Cinzel replaces the Pacifico script, corners are square, the accents are oxblood rubrication and sepia, the window buttons are hidden, and the mascot is sepia-toned. The hero has the ankh in iron-gall ink (`hero-ankh-ink.png`) and a charcoal wordmark (`hero-parchment.mp4`, multiplied onto the paper). The kawaii-only `html:not(...)` contrast rules now also exclude parchment. `gateVideos` loads only the active theme's own wordmark video.
**Also:** On phones the five pills wrap onto two rows, and `scroll-padding-top` is raised to 145px to clear the taller bar. Cache strings bumped to `2026-10-25-parchment`.
**Verification:** Local Chromium at 1280×1000 and 375×812. Basalt shows beige glyphs on the stone with no panel. Parchment shows ink straight on the paper. scrollWidth = 375 in all five themes. Each theme loads only its own videos (retro none). No console errors. `node --check script.js` passes. Parchment contrast: lowest pair 5.05:1 (`#6a6354` on the card), body ink 12.4:1.
**Files:** index.html, script.js, styles.css, assets/hero-{basalt,parchment}.{mp4,jpg}, assets/hero-ankh-{beige,ink}.png

## 2026-10-24: ITER — Remove the X / Twitter link from the footer

**Change:** Dropped the `x.com/the_null_path` link and its trailing `✦` separator from the footer "Elsewhere" nav at Joona's request. GitHub, Substack and Goodreads remain.
**Verification:** `grep -rn 'x.com'` finds no remaining X/Twitter links.
**Files:** index.html

## 2026-10-23: ITER — Remove the radiating rings from the hero heart

**Change:** The three wavy SVG rings (`.orb-ring`) that rippled outward from the heart on every breath are gone: markup, the `initWavyRings` path generator in `script.js`, and their CSS (`.orb-ring`, `orbRadiate`, the 480px size rule, and the basalt/retro hide rules). Joona asked for the heart to breathe without the lines. Retro's own CSS rings (`.orb-ring-css`) are untouched. Cache strings bumped to `2026-10-23-heart2`.
**Verification:** Local Chromium, kawaii — 0 `.orb-ring` elements, heart still on the 6s `heartBeatGentle` breath, no console errors. `node --check script.js` OK.
**Files:** index.html, script.js, styles.css, styles-retro.css

## 2026-10-23: BUG — Hero heart barely moved and its rhythm felt uneven

**Problem:** Joona wanted the kawaii/candy heart to expand more and breathe with a smoother rhythm.
**Root cause:** Two cycles fighting. `heart-pulse.mp4` loops every 6s (108 frames @ 18fps) and has its own internal pulse, while the CSS `heartBeatGentle` pulse and the `orbRadiate` rings ran on 4.5s. They drifted in and out of phase (realigning only every 18s), so the breath looked irregular. On top of that the CSS swell was only 1 → 1.035.
**Fix:** `heartBeatGentle` and `orbRadiate` are now 6s, matching the video loop exactly. Swell raised to 1.12 with a breath-shaped curve: swell to the peak by 40%, soft hold to 52%, long release. Cache strings bumped to `2026-10-23-heart`.
**Verification:** Local Chromium, kawaii theme — heart animation, ring animation and `video.duration` all 6s. Sampled scale at 0/1.2/2.4/3.12/3.6/4.8/6s: 1.00 / 1.06 / 1.12 / 1.11 / 1.10 / 1.04 / 1.00.
**Files:** styles.css, index.html

## 2026-10-19: ITER — Basalt wordmark: charcoal glyph letters on a cream glyph slab

**Change:** Basalt's gold Cinzel `<h1>` wordmark is replaced by a glyph-rendered "LoveSpark": charcoal ink on cream glyph paper, framed like the ankh relic above it (ember hairline, glow and drop shadow).
- **New asset:** `assets/hero-basalt.mp4` (723 KB) and the poster `hero-basalt.jpg`. Both come from `hero-pastel.mp4` via ffmpeg: crop to 960×240, grey, a luma curve (paper ≈234 → cream `#ece3cc`, ink 150–210 → charcoal `#232220`), then a vignette to match the ankh's aged paper. It keeps the kawaii wordmark's breathing loop.
- **Markup:** a second `<video class="hero-mark hero-mark--basalt">`, hidden by default and shown only in basalt.
- **JS:** `gateVideos` decides per video. Basalt loads only `.hero-mark--basalt`, kawaii and candy load everything except it, and retro loads nothing. A video unloads again when you switch away.
- **A11y:** the `<h1>` is now visually hidden in basalt (it stays in the accessibility tree), the same as in kawaii.
- Cache strings bumped to `2026-10-19-basalt`.
**Verification:** In local Chromium, basalt plays the new video with no src on the kawaii one, and switching to kawaii reverses that. At 375px, scrollWidth = innerWidth = 375 and the slab is 343px wide. No console errors. `node --check script.js` OK.
**Files:** index.html, script.js, styles.css, assets/hero-basalt.{mp4,jpg}

## 2026-10-16: "Taking a break" card under the hero buttons

**Change:** Added a card under the hero buttons saying Joona is stepping back from the listed software, including finished ones like Sparky and Sparky Reads, to focus on local models, hardware and eventually robotics. It says he'll update them from time to time. It reuses the existing `.notice-inner` card styles, plus a small `.hiatus-note` spacing rule.
**Verification:** Local preview in the candy theme showed the card centred under the Games button with readable spacing. Text bumped to 16px (title 22px) so it reads easily.
**Files:** index.html, styles.css

## 2026-10-15: Qwen Guide button renamed and re-pointed

**Change:** The second hero button is now "Qwen Guide" and links to `lovespark.love/qwen-guide/`. The guide grew from a fine-tuning guide into a three-part local Qwen guide (run, fine-tune, abliteration) and its repo was renamed from `qwen-fine-tuning-guide` to `qwen-guide`, which moved its Pages path.
**Files:** index.html

## 2026-10-15: Qwen Fine-Tuning Guide hero button

**Change:** Added a "Qwen Fine-Tuning Guide" hero button as the second button, right after "Aaron Swartz · Raw Thought". It links to `lovespark.love/qwen-fine-tuning-guide/`, the new public `Joona-t/qwen-fine-tuning-guide` repo served by GitHub Pages under the site's custom domain, like `raw-thought-reader`.
**Verification:** Local preview showed the button second in the group, styled like its neighbours, with no console errors.
**Note:** Open PR #9 (visual upgrade) replaces the whole hero button group and already conflicts with Raw Thought on main. If it merges, re-add both buttons.
**Files:** index.html

## 2026-10-04: BUG — Sticky bar not frosted; phone layout zoomed out

**Problem 1:** When scrolled, page text showed sharply through the new sticky site bar.
**Root cause:** `.site-bar` has `view-transition-name`, which makes it a *backdrop root*. The child `.site-bar-inner` therefore had its `backdrop-filter` blur only its parent's empty layer.
**Fix:** The glass (background, border, backdrop-filter) moved onto `.site-bar` itself, with opacity 74%→84%. The retro overrides were retargeted.
**Problem 2 (also on the live site):** At 375px the layout viewport was ~700px, so phones zoomed the whole page out.
**Root cause:** The Dyson swarm orbit spans overflow the hero horizontally.
**Fix:** `.hero { overflow-x: clip; }`. clip creates no scroll container, so sticky still works. Verified innerWidth 375 = scrollWidth 375.
**Files:** styles.css

## 2026-10-04: ITER — Visual upgrade Phase 5: polish and wrap-up

**Change:** Final phase of plan.md.
- **Cross-document view transitions:** `@view-transition { navigation: auto; }` added to the root `styles.css` and to all 3 subpage sheets (`ai-signal/style.css`, `openai-watch/styles.css`, `bambu-a1/css/site.css`). Each one sits inside `@media (prefers-reduced-motion: no-preference)`, so reduced-motion users get plain navigation. Same-origin links between root and subpages now crossfade in supporting browsers; other browsers ignore the rule. The Phase 3 `.is-theme-wipe` scoping keeps the theme wipe separate. `ai-signal/scripts/render.py` only writes HTML, so the style.css edit will not be overwritten.
- Cache strings bumped to `2026-10-04-p5` (styles.css, styles-retro.css, script.js).
- **Note:** `bambu-a1/` is a deployment mirror of `Joona-t/bambu-a1-explainer@720e455`. The one-rule addition makes it diverge from upstream, so port it there or re-apply it after the next sync. Its `?v=720e455` cache string was left alone.
**Verification:** `node --check script.js` OK. Braces balanced in all 4 edited sheets. In local Chromium the at-rule parses (`CSSViewTransitionRule` present, rule in the CSSOM), and the page loads with no console errors.
**Not done (left for Joona):** full QA across Chrome, Safari and Firefox × 4 themes × reduced motion, the VoiceOver pass on the h1 and summary headings, push and PR. The workflow rules say commit locally only and never push.
**Files:** styles.css, ai-signal/style.css, openai-watch/styles.css, bambu-a1/css/site.css, index.html, plan.md, BUGS_AND_ITERATIONS.md

## 2026-10-04: ITER — Phase 4 fix: drop `contain` from `.heart-orb`

**Problem:** Phase 4 added `contain: layout style` to `.heart-orb`. Layout containment makes the element a stacking context, which is an isolated blend group. The candy heart video's `mix-blend-mode: darken` then blended against the orb's transparent backdrop instead of the page gradient, so its pale MP4 panel could show again.
**Root cause:** Containment was added for performance without checking the blend dependency inside the orb.
**Fix:** Removed the `contain` line and left a comment explaining why. The saving was negligible for a fixed 240px box.

## 2026-10-04: ITER — Visual upgrade Phase 4: performance diet

**Change:** Continuous-motion budget cut, from plan.md Phase 4 (research.md D4, D7; motion ceiling SKILL.md:136-139).
- **Swarm:** 5 shells / 1,074 spans → 3 shells / 180 spans. Built only in candy/kawaii with motion allowed; torn down (DOM removed) on a switch to retro/basalt or when reduced motion turns on, rebuilt on the way back.
- **Hero visibility gate:** new shared `heroActivity` (one IntersectionObserver on `.hero` + `visibilitychange`). The swarm gets `.is-paused` (`animation-play-state: paused`) and both hero videos pause while the hero is off-screen or the tab is hidden, then resume.
- **`.heart-orb` containment:** `contain: layout style`, not the planned `layout paint` — paint containment clips to the 240px box and would cut off the swarm (r up to 480px) and the rings.
- **Cursor trail:** gone in candy, kawaii and basalt (CSS `display:none` + no listener). Retro keeps a pooled 12-span trail animated with WAAPI (no per-move create/remove), passive `pointermove` attached only while retro + motion allowed + fine hover pointer; re-gated on theme/media changes. `cursorSparkFly` keyframes removed.
- **Dead code:** `#spiral-canvas` markup and both CSS rules removed. No `.spark`/`.cursor-spark` rules were left to delete.
- **Mission sparkles:** 5 → 3 spans (✦ ♡ ✿); nth-child colours/delays remapped in kawaii, candy and retro.
- Cache strings bumped to `2026-10-04-p4`.
**Verification:** `node --check script.js` OK; braces balanced (styles.css 497/497, styles-retro.css 139/139); HTML tag balance unchanged from baseline; `build-gallery.py --check` in sync (9 categories, 35 cards). Local preview (Chromium): candy 180 swarm spans, retro/basalt 0; retro trail pool stays at 12 spans after 30 moves; basalt `#cursor-sparks` display none; scrolled down → swarm paused + both videos paused, back to top → both resume; swarm visually unclipped. No new colour pairs. Not done: reduced-motion emulation, Lighthouse, Safari/Firefox.
**Files:** script.js, styles.css, styles-retro.css, index.html, plan.md, BUGS_AND_ITERATIONS.md

## 2026-10-04: ITER — Visual upgrade Phase 3: motion layer

**Change:** Motion that answers people, from plan.md Phase 3 (research.md §4 motion ceiling, §5 support table). All new CSS is unlayered at the end of styles.css; per-theme flavour is tokens only (`--tilt-max`, `--spot`, `--lift-*`, `--reveal-*`, `--ring-*`, `--wipe-ease`).
- **Springs + press:** pills, hero CTAs, card links, Ko-fi share one transition list on `--ease-pop` (candy spring, kawaii soft spring, basalt damped, retro `steps(4)`); chevron springs on open; `:active { scale: .97 }` (individual `scale`, so it never fights `transform`).
- **Theme wipe:** `switchTheme(theme, pill)` runs `startViewTransition` and grows a `clip-path` circle on `::view-transition-new(root)` from the clicked pill (retro: `steps(8)`). Skipped without the API or under reduced motion; cross-tab `storage` sync still calls plain `apply()`. `.is-theme-wipe` scopes the `animation:none` so Phase 5 page transitions keep their crossfade, and drops the bar's `view-transition-name` so the bar is wiped with the page.
- **Scroll reveals:** `animation-timeline: view()` on cards, section headers, gallery shots, notice/mission/support blocks — opacity + `translate`/`scale` only, inside `@supports` + no-preference (basalt fade only, retro stepped rise). Firefox: content simply visible.
- **Card spotlight + tilt:** one passive, rAF-throttled `pointermove` sets `--mx/--my/--rx/--ry` on the hovered card (fine hover pointer + motion allowed only). Spotlight is `.card-body::after` (isolated, under the text); hover transform rewritten as one `perspective · translate(lift) · rotate · rotateX/Y(tilt)` chain. Candy ±4° white gloss, kawaii ±3° pink, basalt ember glow no tilt, retro neither.
- **Conic CTA ring:** `@property --ls-angle`; primary hero CTA + Ko-fi repaint their own fill on `padding-box` over a conic `border-box` (no pseudo-element). Sweeps once on load, rotates only on hover/focus; static ring under reduced motion.
- **Hero entrance:** `@starting-style` one-shot, `--i` stagger: orb → wordmark → tagline → CTAs (opacity + translate).
- **Accordions:** `::details-content` + `interpolate-size` block-size transition inside `@supports`; `overflow: clip` + clip margin so reveals and focus rings survive.
- **Progress bar:** 2px `.site-bar::after`, `animation-timeline: scroll(root)`.
- Cache strings bumped to `2026-10-04-p3`.
**Verification:** `node --check script.js` OK; styles.css braces 501/501; `build-gallery.py --check` in sync (9 categories, 35 cards). Local preview (Chromium): ring, wipe (class cleaned up after), tilt matrix + spotlight opacity on hover, reveal/progress animations attached, accordion open, all 4 themes, zero console errors. No new text/background colour pairs (ring is decorative border; button fills unchanged). Not done: reduced-motion emulation, 360/768 captures, Safari/Firefox, Lighthouse.
**Files:** styles.css, script.js, index.html, plan.md, BUGS_AND_ITERATIONS.md

## 2026-10-04: ITER — Visual upgrade Phase 2: structure (sticky nav, hero, sections)

**Change:** Page structure from plan.md Phase 2 (research.md D6, D9, D10, D12).
- **Landmarks:** skip link → `<main id="main">` (hero through support); footer stays outside. In-page link handler now moves focus to the target (tabindex -1 when needed) and updates the hash; sticky offset via `scroll-padding-top`.
- **Sticky glass site bar:** Sparky (new square `images/sparky-avatar.png`, 96px source shown at 32px) + LoveSpark, Suite · Peeks · Mission · Support, then the existing theme pills (only their fixed positioning removed). `color-mix` glass + backdrop blur, solid `--surface` fallback, `view-transition-name: site-nav`. One IntersectionObserver sets `aria-current` (colour + underline bar); a 1px sentinel sets `data-stuck` (shadow); `scroll-state(stuck: top)` does the same natively. Phones (<600px): pills on row 1, Sparky + links on row 2, wordmark visually hidden; 8px link gaps, 32px targets, no overflow at 320/360. Retro gets its own dark capsule + hot-pink current state because its `--surface` is the light card fill.
- **Retro sticky bug:** `overflow-x: hidden` on both `html` and `body` made body a scroll container, so the sticky bar scrolled away in retro → `overflow-x: clip` (hidden kept as fallback).
- **Hero:** one primary CTA "See the tools ✦" + one ghost CTA "Sneak peeks". The 7 external pills moved out: 6 become a generated "💫 More from LoveSpark" category in gallery.json (Glyph Grid already has a Mac & iOS card). Socials moved to the footer.
- **Videos:** `poster` + `preload="metadata"`, markup carries `data-src` only; JS attaches `src` in candy/kawaii and strips it on a switch to basalt/retro (Network verified: no mp4 request in basalt). Reduced motion keeps the poster.
- **Generator (`build-gallery.py`):** first top-level category renders `<details open>`; Chrome-group child titles are `h4`; `.win-btn-close` is a real `<button type="button" aria-label="Wobble this window">` (32px hit area, focus ring); same-origin URLs drop `target=_blank`.
- **Notice + Mission:** real `<p>` paragraphs (no `<br><br>`), Notice gets `<h2>` "A note from the workshop", both sit in `.about-grid` (2 columns ≥900px).
- **Support + Contact:** one card — Ko-fi primary, "✉ Say hi" mailto ghost carrying `id="contact"`.
- **Sneak Peeks:** Sparky figcaption no longer repeats the Suite card copy.
- **Footer:** Sparky, socials (32px targets), heart. Footer heart beats on footer hover only (no-preference), so the hero heart is the one ambient heart.
- Cache strings bumped to `2026-10-04-p2`.
**Verification:** `node --check script.js` OK; braces balanced (styles.css 444/444, styles-retro.css 142/142); HTML tag balance clean; `build-gallery.py --check` in sync (9 categories, 35 cards). Local preview: 4 themes × 320/360/1280 — bar 101px on phones / 63px desktop, no page overflow from the bar, theme switcher `position: static` in all themes, `aria-current` follows scroll, `data-stuck` toggles, skip link is first Tab stop and lands focus on `<main>`. New colour pairs (WCAG formula): kawaii accent-ink on bar 6.07, ink on bar 10.46, ghost on page 5.35; basalt 10.41; retro hot-pink on wine 7.43. Not done: reduced-motion emulation, Lighthouse.
**Known, not this phase:** nested Chrome-group titles overflow their summary at 320px (`white-space: nowrap`, pre-existing); hero `.hero-cta--glyph/null/zara/forging/games` modifier CSS is now unused (Phase 4/5 cleanup); "More" card copy for Null Path / Zarathustra / Forging is from their page meta or generic — Joona may want to rewrite it in gallery.json.
**Files:** index.html, styles.css, styles-retro.css, script.js, data/gallery.json, scripts/build-gallery.py, images/sparky-avatar.png, plan.md, BUGS_AND_ITERATIONS.md

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
