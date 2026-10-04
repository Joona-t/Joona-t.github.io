# research.md — lovespark.love visual upgrade (2026-10-04)

Branch: `feat/visual-upgrade-2026-10`. Read-only research by 4 scouts, 3 design proposals and 3 judges, all merged here.
Files: `index.html` (867 lines), `styles.css` (2,042 lines / 81 KB), `styles-retro.css` (885 lines), `script.js` (307 lines).
Anything not confirmed is marked **UNCERTAIN**.

---

## 1. Current state, top to bottom

| Region | Where | Notes |
|---|---|---|
| Head theme bootstrap | index.html:4 | Falls back to `candy`. `script.js:26` falls back to `'pink'`, so the two disagree |
| Google Fonts | index.html:14 | Loads Press Start 2P, DM Mono, Cinzel and Cormorant only |
| Theme pills | index.html:21-26 | `role=group` + `aria-pressed` is correct. The "kawaii" pill has `data-theme="pink"` |
| Fixed layers | index.html:29-43 | grain, 3 glow-blobs (dead), `#spiral-canvas` (nothing draws to it), sparkle-field, cursor-sparks |
| Hero | index.html:46-100 | heart video + 3 SVG rings + JS Dyson swarm; wordmark video (:69-73); h1; **12 links** (4 socials :79-85, 8 CTAs :89-96) |
| Suite `#tools` | index.html:103-694 | Generated between GALLERY markers (:110/:693) by `scripts/build-gallery.py` from `data/gallery.json`. 29 cards, all collapsed in `<details>`, and the Chrome group is a 2nd nesting level (:343) |
| Sneak Peeks `#gallery` | index.html:697-793 | Hand-written. Holds the only Sparky (:705). 4 accordions |
| Notice / Mission / Support / Contact | :796-857 | `<br><br>` text blocks; three near-identical boxes; Contact is a whole section for 1 mailto |
| Footer | :860-863 | Copyright + heart |

Subpages (`ai-signal/`, `openai-watch/`, `bambu-a1/`) don't load the root CSS, so this upgrade only affects `index.html`.

## 2. Defects (fix before adding any new motion)

| # | Defect | Evidence |
|---|---|---|
| D1 | h1 is `display:none` in candy and kawaii, so screen readers get no h1 | styles.css:853-857 |
| D2 | Pacifico, Quicksand and M PLUS Rounded are declared but never loaded, so the fonts fall back to Brush Script / system-ui | styles.css:46,49 vs index.html:14; SKILL.md:77-79 |
| D3 | Reduced-motion rule has no `!important`, so the inline `animation` set by JS wins | styles.css:839-847 vs script.js:202,247 |
| D4 | Cursor trail: no reduced-motion or pointer gate, creates about 16 DOM nodes per second | script.js:222-269 |
| D5 | Smooth scroll ignores reduced motion (CSS and JS) | styles.css:61, script.js:274-282 |
| D6 | Hero videos (about 1.2 MB) autoplay with no poster or preload, and keep playing under reduced motion | index.html:55-58, 69-73 |
| D7 | Dyson swarm is **1,074 spans** (the comment says ~600). It is built in every theme and is over the "no heavy particles" budget | script.js:104-172 |
| D8 | Contrast failures. Kawaii: badge 2.90, count 2.44, card-link/kofi 2.39–2.99, active pill 2.99, sub-tagline 1.95. Retro: badge 2.58, card-link 2.11–3.69, sub-tagline 3.30. Candy: sub-tagline 3.12, 10px badge 3.73 | a11y scout table (endpoints only, UNCERTAIN for gradients) |
| D9 | No `<main>`, no skip link, no nav. Nested Chrome-group category headings are h3 but should be h4 | grep; index.html:343-692 |
| D10 | Sparky is squashed (400×266 rendered at 72×72 with no object-fit) and appears only in Sneak Peeks | index.html:705, styles.css:1041-1043 |
| D11 | Two 404 references: `assets/icon-ankh.png`, `assets/ankh-basalt.gif` | styles.css:1733, 1964 |
| D12 | `.win-btn-close` wobble only works with a mouse (it's a span with a click handler) | script.js:287 |
| D13 | Unbranded focus on `.card-link`, `.kofi-btn`, `.notice-link`, `.hero-social-link` (candy, kawaii, retro) | only basalt has a catch-all at styles.css:1938-1942 |
| D14 | Orphaned 4.8 MB: `images/adhd.png` (4.26 MB), `assets/hero-pink.mp4` (564 KB). **Delete only with Joona's OK** | ls |

## 3. CSS debt

- `.hero-cta` is written twice in full: the first block (styles.css:422-501) is dead, the KAWAII block (:1126-1217) wins, and basalt/retro re-skin it again.
- Candy `.hero-cta` uses **both** pseudo-elements (:1362, :1372). Candy `.win98-card` also uses **both** (`::before` grain, `::after` 42%-tall plus-lighter gloss, :1433-1455). New effects can't take these pseudo-elements.
- Patch pile at :1952-2042: `.ankh-glyph` is redefined 5 times; there are 3 stacked candy video blend rules, and the last one (`darken !important`, :2040-2042) is what hides the MP4 rectangle. **Keep exactly one.**
- Dead keyframes: blobDrift, sparkleFloat, sparkFade, starburstSpin, ankhEmber; retro twinkle-retro and sparkRise-retro (their classes are never set).
- 3 keyframes are injected from JS (script.js:209-216, 261-268, 297-307).
- 4 token naming schemes (base, `--ls-*`, `--bs-*`, retro) with no semantic layer. Spacing tokens `--gap-*` exist (:52-56) but are mostly unused; there are 7 content widths and 10 ad-hoc font sizes.
- `styles.css` has **no `@layer` today** (grep verified). Layered normal rules lose to every unlayered rule, so new rules must stay **unlayered** in this PR.
- `background-attachment: fixed` ×3 (:73, :1268, :1672), which causes scroll repaints and is janky on iOS.

## 4. Brand constraints (SKILL.md)

- **Motion ceiling, SKILL.md:136-139:** one heart, 3–4 sparkles, hover-lift, `:active` press; "never continuous background animation beyond that". So "alive" has to come from **motion that responds to the user** (scroll, hover, click, theme switch), not from extra loops.
- Global reduced-motion snippet: SKILL.md:142-146. Grain recipe: multiply at 0.04 (SKILL.md:128-131). **Keep the blend mode.**
- Font stack: OpenDyslexic / Atkinson Hyperlegible / system (SKILL.md:70). Quicksand is flagged as an anti-pattern.
- **Conflict:** SKILL.md:29 says kawaii is the default, but the live site defaults to candy (index.html:4). **Joona decides.**

## 5. SOTA techniques: support and fallback

| Technique | Support (Oct 2026) | Fallback | Use here |
|---|---|---|---|
| View Transitions, same-document | Chrome 111+, Safari 18+, Firefox 144+ (UNCERTAIN) | instant swap | theme "candy wipe" from the clicked pill |
| `animation-timeline: view()/scroll()` | Chrome 115+, Safari 26+; Firefox behind a flag (Interop 2026) | content visible, no reveal | card and section reveals, top progress bar |
| `::details-content` + `interpolate-size` | Chrome 129-131+ only | instant open | animated accordions |
| `linear()` spring easing | all major browsers | cubic-bezier | hover, pill, chevron springs |
| `@property` typed custom properties | all since Jul 2024 | static gradient | conic CTA ring |
| `@starting-style` | Chrome 117+, Safari 17.5+, Firefox 129+ | appears instantly | one-shot hero entrance |
| `color-mix(in oklch)`, `text-wrap: balance/pretty` | all (`pretty` is Chromium/Safari only) | no-op | per-theme tints, typography |
| Container size queries | all | — | card adapts to its own width |
| Scroll-state queries (`stuck`) | Chromium 133+ only | no shadow | "stuck" shadow on the sticky nav |
| Cross-document VT `@view-transition` | Chrome 126+, Safari 18.2+ | normal page load | one-liner on the subpages |
| Popover + anchor positioning | Baseline Jan 2026 | — | **not this pass** |

Sources: webkit.org/blog/17333, /17862, /17938, /17101, /17818; web.dev/blog/interop-2026, /web-platform-01-2026, /at-property-baseline, /baseline-entry-animations; hacks.mozilla.org/2026/02/launching-interop-2026; caniuse (interpolate-size, css-anchor-positioning, scroll-state); developer.mozilla.org (easing-function/linear); css-tricks.com/cross-document-view-transitions-part-1.

## 6. Must not regress

- The grain overlay (`pointer-events:none`, aria-hidden).
- Sparky with its alt text.
- Candy pairs: text 7–11:1, buttons ≥4.86, focus 5.12. Basalt pairs: all ≥5.
- The existing `:focus-visible` rings, and no `outline:none` anywhere.
- The pill ARIA pattern, the FOUC-free head script, and the storage-event cross-tab sync.
- Native `<details>`, which must keep working without JS.
- The GALLERY markers and the generator as the source of truth.
- Gallery images keep lazy/async loading and explicit width/height.
- 32px touch targets.
- No build step, no new third-party origins.
