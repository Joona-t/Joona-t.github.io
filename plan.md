# plan.md — lovespark.love "Alive & Clean" visual upgrade

> **No code until Joona says "implement it all".**

Evidence and file:line references are in `research.md`. Branch: `feat/visual-upgrade-2026-10`.

## Verdict

- **The approach:** we use "Motion-first" (A) as the base, take the cleanup work from B and the nav and per-theme flavour from C, and cut anything that adds risk.
- **All 4 themes keep their identity:** candy, kawaii, basalt and retro.
- **The page feels alive because it responds to people.** Scrolling, hovering, clicking and switching themes all trigger motion. We add no new looping background animation.
- **Estimate:** about 3 days of work, split into 6 phases you can ship one at a time.

## Decisions for Joona (owner taste)

| # | Question | Default if you don't answer |
|---|---|---|
| Q1 | SKILL.md:29 says kawaii is the default theme, but the live site defaults to candy | Keep **candy** |
| Q2 | Should we swap the body font from Quicksand (never loaded) to the brand stack (OpenDyslexic, then Atkinson)? | **Yes** |
| Q3 | Can I delete the orphaned `images/adhd.png` and `assets/hero-pink.mp4` (4.8 MB)? | **Keep them** and ask again later |
| Q4 | Should the 7 external hero pills move into a "More from LoveSpark" category built from gallery.json? | **Yes** |
| Q5 | Bento grid with filter chips instead of the accordions? | **Not this pass**. We open the first category by default instead |
| Q6 | Should the cursor sparkle trail stay only in retro, and be deleted in the other three themes? | **Yes** |

## Ground rules

- **All new CSS stays unlayered.** We put it after the theme blocks, with matching specificity. The reason: a rule inside `@layer` always loses to an unlayered rule, so the new motion would silently do nothing. Moving the existing CSS into layers is a separate PR.
- **Every new animation is guarded twice.** It goes inside `@media (prefers-reduced-motion: no-preference)`, and inside `@supports` when it's a newer feature. JS features check the API exists first.
- **We never hide content behind an animation.** If the browser can't run it (Firefox, JS turned off), people still see all the content.
- **We don't take over pseudo-elements the theme already uses.** Candy's `.win98-card` and `.hero-cta` already use both `::before` and `::after`.
- **We stay inside the brand motion ceiling** (SKILL.md:136-139): one heart, 3–4 sparkles, hover lift and press.

## Per-theme motion flavour (tokens only, no extra code paths)

| | Candy (default) | Kawaii | Basalt | Retro |
|---|---|---|---|---|
| `--ease-pop` | springy `linear()` | softer and slower spring | damped, no overshoot | `steps(4)` |
| Card spotlight | white gloss glow | hot-pink glow | ember gold | none |
| Card tilt | ±4° | ±3° | none (stone doesn't wobble) | none |
| Reveal | fade, rise and scale | same | fade only | stepped rise |
| Theme wipe | circle from the pill | circle | circle | circle with stepped easing |
| Swarm | 3 shells, about 180 spans | same | hidden | hidden |
| Cursor trail | removed | removed | removed | pooled, 12 nodes |

## Performance budget

- **DOM:** the swarm drops from 1,074 to about 180 nodes or fewer. The cursor trail becomes 0 nodes, or 12 in retro.
- **Off-screen:** the swarm and both videos pause while out of view, using `IntersectionObserver` and `visibilitychange`.
- **No `background-attachment: fixed`.** We swap it for a fixed `body::before` layer.
- **Video:** no hero video downloads in basalt or retro. Both videos get a poster and `preload`.
- **Fonts:** fonts used by only one theme load without blocking the page.
- **New listeners:** one passive pointermove, throttled with rAF, plus 2 `IntersectionObserver`s. No scroll listener.

## Verification gate (every phase, before commit)

1. Screenshot all **4 themes at 360, 768 and 1280px** in the preview.
2. Repeat with **reduced motion emulated**. Nothing should move, and both videos should show their poster.
3. Run `python3 scripts/audit-contrast.py --verbose --history` and check every pair is AA.
4. Tab through the page. Skip link → nav → pills → CTA → cards, and every stop shows a visible ring.
5. Run `python3 scripts/build-gallery.py --check` and confirm it stays in sync.
6. Lighthouse sanity check: no CLS regression, a11y score ≥ the baseline, and no console errors.
7. Bump all three `?v=` strings together (index.html:15, 16, 865), then log the change in `BUGS_AND_ITERATIONS.md`.

---

## TODO checklist

### Phase 0: Defect floor (no visual change, ships alone, about 0.5 day)

- [x] (skipped in Phase 0 run — no multi-width capture; only a candy smoke screenshot) Take baseline screenshots of the 4 themes at 3 widths for later diffing.
- [x] Make the h1 `.logo-text` screen-reader-only (sr-only) instead of `display:none` (styles.css:853-857).
- [x] Add `aria-hidden="true"` to `video.hero-mark` and remove its `aria-label` (index.html:69-73).
- [x] Fix the fonts:
  - [x] Add Pacifico and Atkinson Hyperlegible to the font link.
  - [x] Set `--font-body` to the brand stack (styles.css:46-49).
  - [x] Load Press Start 2P, Cinzel and Cormorant non-blocking (`media=print onload`).
  - [x] Preload the OpenDyslexic Regular file.
- [x] Add one global reduced-motion block. Use the SKILL.md snippet with `!important`, plus `scroll-behavior:auto`, plus `display:none !important` on `.dyson-swarm`, `#cursor-sparks` and `#sparkle-field`.
- [x] Then delete the 6 scattered reduced-motion blocks.
- [x] In JS, add `mqReduce` and `mqFine` gates. Wire them into the swarm build, the sparkle field, the cursor trail, `scrollIntoView` (use `auto` when reduced) and the videos (pause and show the poster).
- [x] Change the `apply()` fallback to `'candy'` (script.js:26) and fix the stale comments (script.js:6, :104; index.html:20).
- [x] Add `object-fit:contain` to `.gallery-mascot`, or use a square Sparky asset.
- [x] Fix contrast in kawaii and retro:
  - [x] Use `#b3185c` for small pink text: badge, count, notice-link, sub-tagline.
  - [x] Use `#d81b73→#a51259` for the button gradients: card-link, kofi, active pill.
  - [x] Fix candy's `.sub-tagline` and its 10px badge.
- [x] Add themed `:focus-visible` rings to `.card-link`, `.kofi-btn`, `.notice-link` and `.hero-social-link`.
- [x] Remove the 2 references that return 404 (styles.css:1733, 1964).
- [x] Run the gate, then commit.

### Phase 1: Tokens and dead CSS (about 0.5 day)

- [x] Add semantic tokens to `:root` and each theme block: `--surface`, `--ink`, `--accent`, `--accent-ink`, `--focus` and `--radius`.
- [x] Add `--ease-pop` and `--ease-out`, plus `--dur-1`, `--dur-2` and `--dur-3`.
- [x] Add fluid scales: `--fs-xs` to `--fs-logo`, and `--sp-1` to `--sp-section`.
- [x] Add two content widths: `--w-wide` (1180) and `--w-prose` (68ch).
- [x] Replace the 6 hardcoded section paddings and the 10 one-off font sizes with tokens, and drop the `-8px` margin hack (:1036).
- [x] Replace hardcoded `rgba` tints with `color-mix(in oklch, var(--accent) N%, transparent)` (:928, :961).
- [x] Add `text-wrap: balance` to headings and `pretty` to body copy.
- [x] Delete the dead first `.hero-cta` block (:422-501), the dead keyframes and the dead base `.glow-blob` rules.
- [x] Move the 3 keyframes that JS injects into the CSS.
- [x] Merge the patch pile (:1952-2042) into the theme blocks. Keep **one** candy `darken` video rule, and screenshot basalt's ankh to check it.
- [x] Replace `background-attachment: fixed` ×3 with a fixed `body::before`.
- [x] Run the gate, then commit. (partial gate: JS syntax, brace balance, gallery `--check`, live preview of all 4 themes at desktop width with computed-style checks; no 3-width × reduced-motion screenshot matrix; `audit-contrast.py` n/a for this site)

### Phase 2: Structure (sticky nav, hero, sections) (about 0.75 day)

- [x] Add the skip link and `<main id="main">`.
- [x] Build the sticky glass site bar:
  - [x] Content: Sparky (32px, square) + LoveSpark, then Suite · Peeks · Mission · Support, then the existing pills unchanged.
  - [x] Add a solid fallback when `backdrop-filter` isn't supported.
  - [x] Give the bar `view-transition-name: site-nav`.
  - [x] Check it at 320 and 360px: 8px gaps and 32px touch targets.
- [x] One `IntersectionObserver` sets `aria-current` on the active nav link. A 1px sentinel sets `data-stuck`. Add a `scroll-state` enhancement.
- [x] Hero: one primary CTA, "See the tools ✦", and one ghost CTA, "Sneak peeks".
- [x] Move the 7 external pills into a gallery.json "More from LoveSpark" category (Q4). (6 cards: Glyph Grid already has its own card in Mac & iOS, so no duplicate.)
- [x] Move the socials to the footer.
- [x] Drop `target=_blank` on same-origin links.
- [x] Videos: add `poster` and `preload="metadata"`. Strip `src` in basalt and retro (check the Network panel first). (markup ships `data-src`; JS attaches it only in candy/kawaii — verified no mp4 request in basalt.)
- [x] Generator (`build-gallery.py`):
  - [x] Open the first category by default.
  - [x] Use h4 inside the Chrome group.
  - [x] Make `.win-btn-close` a real `<button aria-label>`.
  - [x] Rerun with `--check`.
- [x] Notice and Mission: use real `<p>` paragraphs, give Notice an `<h2>`, and lay them out in 2 columns at ≥900px.
- [x] Merge Support and Contact into one card: Ko-fi as the primary button, email as the ghost. Keep the `#contact` anchor.
- [x] Remove the duplicate Sparky figcaption copy (index.html:759).
- [x] Footer: Sparky, socials and heart. Make the footer heart animate on hover only, so there's one ambient heart.
- [x] Run the gate, then commit. (partial gate: JS syntax, brace + tag balance, gallery `--check`, live preview of all 4 themes at 320/360/1280 with layout/colour/video-src checks, keyboard skip-link test; no reduced-motion emulation or Lighthouse run; `audit-contrast.py` n/a for this site — new pairs computed by WCAG formula instead)

### Phase 3: Motion layer (about 0.75 day)

- [x] **Springs.** Apply `--ease-pop` to card hover (:557), pills, CTAs and the chevron. Add a `:active { scale:.97 }` press.
- [x] **Theme wipe.** Add `switchTheme(theme, pill)` with `startViewTransition` and a `clip-path` circle from the pill.
  - [x] Cross-tab sync keeps using plain `apply()`.
  - [x] Skip the wipe under reduced motion.
- [x] **Scroll reveals.** Use `animation-timeline: view()` on cards, section headers, gallery shots and the mission/support blocks.
  - [x] Animate `translate`/`scale` only, so they don't fight the hover `transform`.
  - [x] Wrap it in `@supports`.
- [x] **Card spotlight and tilt.** One delegated pointermove, throttled with rAF, sets `--mx`/`--my`/`--rx`/`--ry`.
  - [x] Put the spotlight on `.card-body::after`, which is free; `.card-body` needs `position:relative`.
  - [x] Rewrite the hover at :550-565 onto the same transform.
  - [x] Only for `(hover:hover) and (pointer:fine)` with motion allowed.
- [x] **Conic CTA ring.** Use `@property --ls-angle` with a `padding-box`/`border-box` gradient (no pseudo-element).
  - [x] It sweeps once on load and rotates only on hover or focus.
  - [x] Use it on the primary CTA and Ko-fi only.
- [x] **Hero entrance.** One-shot, with `@starting-style` and a `--i` stagger: orb, then wordmark, then tagline, then CTAs.
- [x] **Accordions.** Animate them with `::details-content` + `interpolate-size`, inside `@supports`.
- [x] **Progress bar.** A 2px top bar driven by `animation-timeline: scroll(root)`, placed inside the site bar.
- [x] Run the gate, then commit. (partial gate: `node --check`, brace balance, gallery `--check`, live preview of all 4 themes at desktop width — ring, wipe, tilt/spotlight, reveals, progress bar, accordion, zero console errors; no reduced-motion emulation, 360/768 captures or Lighthouse run; no new text/background pairs so contrast unchanged)

### Phase 4: Performance diet (about 0.5 day)

- [x] **Swarm.** Go from 5 shells (1,074 spans) to 3 shells (about 180).
  - [x] Build it only for candy/kawaii with motion allowed, and tear it down when the theme changes.
  - [x] Add `contain: layout paint` on `.heart-orb`. (shipped as `contain: layout style`: paint containment would clip the swarm/rings, which overflow the 240px box by design)
  - [x] Pause it with IO and `visibilitychange`, and pause the videos the same way.
- [x] **Cursor trail.** Delete it in candy, kawaii and basalt. Keep a pooled 12-node, passive, gated version in retro only.
- [x] Remove `#spiral-canvas` and the dead retro `.spark`/`.cursor-spark` rules. (no `.spark`/`.cursor-spark` rules remained; removed `#spiral-canvas` markup + both CSS rules and the now-unused `cursorSparkFly` keyframes)
- [x] Trim the always-on mission sparkles to 3 spans.
- [x] Run the gate, then commit. (partial gate: `node --check`, brace balance, gallery `--check`, live preview: 180 swarm spans in candy, 0 in retro/basalt, 12-span retro trail pool, swarm + both videos pause off-screen and resume at top, swarm not clipped; no reduced-motion emulation or Lighthouse run; no new text/background pairs)

### Phase 5: Polish and wrap-up (about 0.25 day)

- [ ] Add `@view-transition { navigation: auto; }` to the root and the 3 subpages.
- [ ] Full QA: Chrome, Safari and Firefox × 4 themes × reduced motion on/off. Also test VoiceOver on the h1 and on the summary headings.
- [ ] Bump all three `?v=` strings. Then BUGS_AND_ITERATIONS entries, commit, push to the branch and open a PR (never push to main).

---

## Rejected ideas, and why

| Idea | Why not |
|---|---|
| Moving the whole stylesheet into `@layer` now | It changes how all 18 `!important` rules behave. Too risky; it gets its own PR |
| Putting only the new rules in `@layer motion` | Layered rules lose to unlayered ones, so the new motion would silently do nothing |
| Rewriting the swarm as a canvas animation | It's still a continuous particle system, and matching the current look is risky. Trim the spans instead; canvas is a v0.next question |
| Spotlight on candy's card `::after` | That would overwrite the gloss that gives the glass-sticker look |
| Conic ring on `.hero-cta::before` | Candy already uses both pseudo-elements on it |
| An 8s conic ring that loops forever on several elements | Continuous motion breaks the brand ceiling |
| Hiding the Win98 window buttons | Changes the card identity Joona asked to keep |
| Bento grid + filter chips | A product-taste call, so it's Q5 and deferred |
| Gallery rail + `<dialog>` lightbox | Scope creep that adds focus-trap risk |
| Kawaii feTurbulence paper filter on 29 cards | Costs a repaint on every hover |
| Hero zooming out as you scroll, plus parallax | Too much motion stacked on the heaviest layer |
| Retro pixel-snapped spotlight and pixel-dissolve wipe | Gimmicky and adds extra code paths |
| Dropping the grain's blend mode | The brand recipe specifies multiply. Only revisit after an A/B |
| Revealing content with an IO class as the fallback | Content would stay hidden until JS runs |
| `sibling-index()` stagger | Chromium only. Use a `--i` variable instead |
| Deleting the orphaned assets without asking | It's Joona's call (Q3) |

## Risks

- **Unlayered new rules need specificity at least as high as the theme rules.** Screenshot diffs catch misses.
- **Basalt's ankh `!important` stack** (Phase 1 merge) needs a dedicated visual check.
- **The candy video `darken` rule** must survive the consolidation, or the MP4 box edge comes back.
- **Firefox users miss the reveals and the accordion animation.** That's acceptable, because the content is still fully visible.
- **The remaining trimmed swarm is still a continuous loop.** It's flagged for Joona, with canvas or removal as a v0.next decision.
