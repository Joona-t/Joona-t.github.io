# Bugs & Iterations

## 2026-11-12: BUG: the verify gate could measure a server other than the tree it signs off

**Symptom:** `scripts/verify_site.py` defaulted to `http://localhost:8766`. On the Mac mini, 8766 is the fleet dashboard (bound on all interfaces), and a site server bound to 127.0.0.1 starts beside it without an error, so which server answered was luck. Pointed at a stale copy of the site (bb11076), the old gate measured that copy and wrote its 176 diagram problems against the checked-out commit. A stale copy that happened to be clean would have been a false pass.
**Root cause:** the gate trusted whatever answered on the port and never checked that the pages it measured were the tree it records in `.verify/<commit>.json`.
**Fix:** with no base URL the gate serves the checkout itself on a free port (nothing to start first). With a base URL it first compares the served home page and notebook byte for byte with the tree, and refuses (exit 2) if they differ. Reports now carry `served` and `identity`, and `merge_pr.sh` merges only on `identity: matched`, so older reports and other servers can't pass the gate.
**Proof:** old gate at :8766 crashed after a 30 s locator timeout; at the stale copy it reported the copy's problems as this commit's. The new gate refused both within a second, and passed when serving this checkout itself.

## 2026-11-12: BUG: Forge Notebook labels still crossed by lines; figures broke in wider reading fonts; the check passed them

**Symptom (Joona, screenshot):** in "The machine", the arrows from the vLLM server to both GPUs ran through "no NVLink: card to card over PCIe, 7.7 GB/s". Joona: the text should sit over the arrow with a small break in the line; the page is public and has to look professional.
**Root cause 1 (z-order):** the label had the halo from the earlier fix, but the two arrows were drawn after it, and a halo masks only what is painted before the text. The same held for the chart annotations: the dashed 95 °C limit ran through "llama.cpp", "eval stopped, logger off" and "CPU limit 95 °C"; the memory stems ran through "eval stopped, no checks"; gridlines and series lines ran through value labels in five charts.
**Root cause 2 (fonts):** figure text used the reader's font (`svg text{font-family:var(--text)}`), but every box and label position was measured in EB Garamond. In OpenDyslexic, Lexend or Comfortaa the labels overlapped each other, ran out of their boxes and out of the viewBox (21 to 105 of 126 combinations). Axis titles shared a row with tick labels; in OpenDyslexic the stat tiles made a phone scroll sideways.
**Root cause 3 (the instrument):** `check_svg_diagrams.py` asked whether a crossed label had a halo, not whether the line was painted over it; it tested crossings by bounding box, covered only the three hand-drawn diagrams, two themes, two widths and the default font. It reported 0 problems on the live page while the defect was visible.
**Fix:** one pass after every figure is drawn moves each svg's labels to the end (`labelsOnTop`), so every label paints above every line, band and box and its card-coloured halo cuts the break; all figure text carries the halo. Figures keep the fonts they were measured in (`--fig`, `--fig-display`); body text still follows the reader's choice. `frame()` gives an axis title its own row (top margin >= 30, bottom >= 42) and starts a tick that sits on the y axis at the axis. Annotations moved off the lines they described (temperature band labels above the plot, the gap label into the gap, the power peak label above the peak, the throughput values above their points). Tile values may wrap.
**Prevention (the instrument, v2):** the check samples each line's real path, fails a label that a line crosses when the line is painted after it or the label has no halo, fails overlapping labels and a page that scrolls sideways, and covers every svg figure in every theme and reading font from the page's own menu at 1280, 768 and 390 px (126 combinations). Live page before: 176 distinct problems (v1 reported 0); this commit: 0. Screenshots reviewed in cream, basalt, Gingham and Neon. `verify_site.py` runs it before every merge.
**Files:** forge-notebook/index.html, scripts/check_svg_diagrams.py

## 2026-11-12: ITER: Forge Notebook says, task by task, which model orchestrated and which one built

**Change:** Joona: "also mention if fable orchestrated but opus implemented be specific". The models section gets a table of the nine delegated tasks (chunked eval tools, the agent's vLLM backend, lock test gaps, A/B eval tooling, batches, idle check, clean stop, Primordial and Blitz Swarm on vLLM): who orchestrated and checked, who built, and what the check found, from the agents' briefs and the reviews that followed. It names where Fable wrote the code itself (the backend's core; the lock test after the Opus agent was stopped by a safety check) and what was done by one model alone.

## 2026-11-12: ITER: Forge Notebook names the models behind each task and their reasoning levels

**Change:** At Joona's request a new section, "The models and their reasoning levels", sits after "The machine". It has a chart of which Claude model worked in each session over the two days (Fable 5.2 or Opus 5.5, solid for high reasoning, pale for medium), a table of every session with its model, reasoning level, step count and what it oversaw, a table of the local Qwen builds and their thinking setting, and Joona's own words on how the work was split. Three timeline entries record his model switches (00:19, 02:29, 18:23), and the mistakes table gets the fan-socket advice from the Claude app.
**Data:** taken from the session transcripts, which record the model and effort of every step (a private ledger script on the Mac mini computes the windows; the page carries only lane names, times, model names and counts).
**Before the export:** the diagram label fix that 2f41dff and 0ad8d80 made on the site was ported into the notebook's source first, so this export keeps it (the stale-copy failure from 1427cff). The export differs from the live page only by the new section and a favicon.

## 2026-11-12: BUG: theme switches glitched; a stale copy undid the diagram fix; a verify gate before every merge

**Symptom (Joona):** switching themes on the home page glitched after #41 (glyph field). Separately the Forge Notebook diagram labels were back behind their arrows on the live site.
**Root cause 1 (glitch):** each theme click changes the `<html>` class 4 times (the wipe's `is-theme-wipe` added, theme swapped, helper removed). `assets/glyph-field.js` treated every one as a theme change and reallocated its full-screen canvas (2880x1800 at 2x) up to 3 times per switch, at the start and end of the View Transition wipe.
**Fix 1:** the field compares a theme key (visible | `--field-ink` | `--field-alpha`) and ignores helper classes; a real change re-tints by rebuilding the small sprite atlas into the same canvas; the canvas is reallocated only when its size changes. Reallocations per switch 3 -> 0; re-tint checked (parchment #5d3a23, basalt #e7dbaa). Interleaved A/B in headless Chromium (old vs new script, 8 page loads each, 16 switches into basalt/parchment each, load ~8 on 8 cores): worst frame gap per switch median 63.3 -> 50.2 ms, p75 75.6 -> 58.5 ms; long tasks during switches 2 (max 59 ms) -> 0. Separate (non-interleaved) runs were too noisy to compare while the Mac was busy (load 35-58), so only the interleaved numbers count.
**Root cause 2 (regression):** commit 1427cff (a text edit from another session) wrote the whole `forge-notebook/index.html` from a copy made before 2f41dff, silently undoing the label fix; it went live because nothing ran the diagram check before merging. Fix 2: 2f41dff re-applied (check: 12 problems -> 0).
**Why missed:** #41 was checked by setting theme classes from code, never by clicking the real switcher with its View Transition; no check ran before merges.
**Prevention (the gate):** `scripts/verify_site.py` clicks every real theme pill, measures each switch (frame gaps, long tasks), checks the field and titles per theme and runs `check_svg_diagrams.py`, writing `.verify/<commit>.json`; `scripts/merge_pr.sh` refuses to merge a PR without a clean passing run for its exact head commit. README "Before merging".
**Files:** assets/glyph-field.js, forge-notebook/index.html, scripts/verify_site.py, scripts/merge_pr.sh, .gitignore, README.md

## 2026-11-12: ITER: Forge Lab Notebook, theme button on the date line

**Change:** Joona asked to lift "Change Font & Theme" to the level of the eyebrow date line, keeping its position. The header is a bottom-aligned flex row, so the button sat level with the title; `.theme-picker` now aligns to the top with a -11 px nudge, which centres the 38 px button on the 15 px eyebrow line. Same edit in the notebook source on the Mac mini.
**Verification:** on the live page with the rule applied: button centre 36 px = eyebrow centre 36 px, right edge unchanged (1008 px).
**Files:** forge-notebook/index.html

## 2026-11-12: ITER: Forge Lab Notebook tab icon ✺

**Change:** Joona asked for ✺ as the notebook's browser-tab icon instead of the globe. One `<link rel="icon">` with an inline SVG of ✺ in the notebook's gold (#e6b04a), right after the `<title>`, in `forge-notebook/index.html`; the same line is in the notebook's source on the Mac mini, so the next export keeps it.
**Verification:** the icon renders as a gold ✺ at 16, 32 and 64 px; only `forge-notebook/` and this log changed; privacy and path greps empty.
**Files:** forge-notebook/index.html

## 2026-11-12: ITER: The Forge Notebook's glyph field and charcoal titles on the home page (basalt + parchment)

**Change:** At Joona's request the home page's basalt and parchment themes get (1) the Forge Notebook's animated glyph-field background: a fixed canvas of drifting hatch strokes above the page ground and below the content (`assets/glyph-field.js`, ported from the notebook; re-tints on this site's html-class themes and fully pauses while hidden), ink as in the notebook (basalt `#e6d6ad` at .11, parchment `#5e3a24` at .13); and (2) charcoal section titles: Agentic Repos, Sneak Peeks, The Suite and Mission are lettered in glyph ink via `background-clip: text` with a seamless stroke tile (`assets/glyph-ink-{basalt,parchment}.png`, generated by `scripts/make_glyph_ink_tiles.py`) over a translucent wash of the same ink. Bubblegum and kawaii are unchanged (Joona: leave them as is).
**Verification:** headless Chromium on the local site: basalt and parchment show the field (canvas drawing, 45k inked pixels in a 600x400 sample) and 4/4 titles in glyph ink; bubblegum and kawaii show no field and 4/4 plain titles; no page errors. Title rendered at 2x in both themes and viewed.
**Files:** index.html, styles.css, assets/glyph-field.js, assets/glyph-ink-basalt.png, assets/glyph-ink-parchment.png, scripts/make_glyph_ink_tiles.py

## 2026-11-12: ITER: Forge Notebook calls Joona by name

**Change:** Joona asked to be called by his name. The notebook said "the owner" in 12 places (his decisions, the front fans, the EXPO fix); each now says Joona, and the lesson paragraph says "Joona's instinct about his own machine". First name only.
**Files:** forge-notebook/index.html

## 2026-11-12: ITER: Forge Notebook gets the Korean themes and a reading-font menu

**Change:** Joona asked for the Korean themes and a font option as a dropdown like the other LoveSpark pages. The Cream/Basalt switch is replaced by the Raw Thought reader's "◐ Change Font & Theme" menu: Match my device, Cream, Basalt; the four Korean themes (Seoul Y2K, Gingham Sticker, Holo Mochi, Neon Usagi, colour tokens from the fleet dashboard) and six reading fonts (Serif, Sans, OpenDyslexic, Lexend, Comfortaa, Atkinson Hyperlegible). The charcoal title and the glyph field follow the theme (Neon Usagi uses the light-ink title). Choices are saved in the browser only. OpenDyslexic (SIL OFL) is embedded, subset to Latin and punctuation (19 KB); the other fonts come from Google Fonts.
**Bug found while checking:** at phone width the header wraps and the button moves to the left edge, but the menu was anchored to the button's right and opened off-screen (left edge at -195 px). Below 680 px it now opens rightwards from the button (24 to 280 px on a 375 px screen).
**Verification:** local preview: every theme renders with the right title art, every font loads (document.fonts.check true for all four web fonts), charts stay readable in Holo Mochi, Escape and outside clicks close the menu, no console errors, no sideways scroll at 375 px. Privacy and path greps clean.
**Files:** forge-notebook/index.html

## 2026-11-12: ITER: Forge Notebook tells the EXPO fix honestly

**Change:** Joona pointed out the notebook left out that the fix advice was wrong. The lead session told him to load BIOS defaults (F5) to reset the memory profile, assuming EXPO was on; it never checked (no sudo to read the memory speed). EXPO was off, and he turned it on by instinct, which is what made every memory check clean. Now in the timeline (a 12:36 "Wrong advice" entry and the 12:57 entry), the memory-fault section and the mistakes table.
**Verification:** privacy and path greps clean; page re-exported from the notebook source.
**Files:** forge-notebook/index.html

## 2026-11-12: BUG: Forge Notebook diagram labels sat behind their arrows; a box ran onto its frame

**Symptom (Joona, screenshot):** in "The two-mode GPU lock", the labels "clients call in parallel, no lock" and "each job runs under flock" were thin 13 px text with the arrows drawn straight through them, and the "load test" box sat on the vLLM-mode frame's right edge. The same class was in the other diagram: both "SSH" labels crossed by their arrows, and "no NVLink…" ran past the Forge frame.
**Root cause:** free labels are placed where arrows run, with nothing masking the line; the client boxes were laid out at `x = 40 + i*140`, so the third ended at x=440, the frame's own edge. Nothing checked diagram geometry.
**Fix:** every `.diagram svg text` gets a halo in the panel colour (`paint-order: stroke; stroke: var(--card); stroke-width: 7px`), so a line visibly stops at the text; free labels (`text.lbl`) are 14 px, weight 600, ink colour; client boxes at `x = 30 + i*135`; "no NVLink" centred in the Forge frame.
**Prevention (the instrument):** `scripts/check_svg_diagrams.py` (Playwright) fails on boxes that touch or cross another box's edge (6 px margin), labels outside the viewBox or straddling a box edge, and any label crossed by a line without a halo; desktop and phone layouts. On the old page it reports 12 problems including every one above; on the fixed page 0, in basalt and cream.
**Files:** forge-notebook/index.html, scripts/check_svg_diagrams.py

## 2026-11-12: ITER: Games button gets the scarab 𓆣 in the esoteric themes

**Change:** In basalt and parchment the Games button showed 🜂 (the ancient-glyph swap turns every ✦ into fire). At Joona's request it now shows 𓆣 (scarab, L001): the button's ✦ is pre-wrapped as `<span class="glyph-swap" data-ancient="𓆣">`, and the swap walker now skips text already inside a `.glyph-swap` so a pre-wrapped glyph is never wrapped twice. Bubblegum and kawaii keep ✦; the other 43 ✦ still become 🜂.
**Verification:** local preview: basalt and parchment render 𓆣 on Games (::before content), bubblegum and kawaii show ✦, one `.glyph-swap` on the button (no nesting), 43 other `data-ancient="🜂"` swaps unchanged; no console errors.
**Files:** index.html, script.js

## 2026-11-12: ITER: Basalt + parchment drop Sparky for the ankh

**Change:** At Joona's request, the basalt and parchment themes no longer show Sparky anywhere: the nav logo, gallery mascot and footer avatar are hidden there, and the theme's own ankh art (`assets/hero-ankh-beige.png` for basalt, `hero-ankh-ink.png` for parchment, the hero ankh assets) takes the nav logo (36 px) and footer (56 px) spots via `::before`. Bubblegum and kawaii keep Sparky. CSS only; supersedes the older "Sparky stays, toned to ink" rule for these two themes.
**Verification:** computed styles in all four themes (basalt/parchment: 3 Sparky images `display:none`, ankh `::before` present; bubblegum/kawaii: images shown, no `::before`); icons rendered at real size on each theme's ground to check legibility; nav seen in the local preview; no console errors.
**Files:** styles.css

## 2026-11-12: ITER: X / Twitter link back, plus a link row under the glyph line

**Change:** Restored `x.com/the_null_path` in the footer "Elsewhere" nav (GitHub ✦ X / Twitter ✦ Substack ✦ Goodreads) at Joona's request, and added the same four links as a `hero-socials` row directly under the lore glyph line, above the hero panels. Fourth toggle of the footer link (removed 10-24, restored 10-27, removed 11-01, restored now).
**Verification:** local preview (basalt theme) at 640 px and 1280 px: the row renders under the glyph divider and above the panels, one line at desktop width and wrapping cleanly when narrow; footer shows all four links; no console errors; `grep -c 'x.com/the_null_path' index.html` = 2.
**Files:** index.html

## 2026-11-12: ITER: The Forge Notebook at /forge-notebook/, with a hero button

**Change:** Joona asked for the Forge lab notebook on lovespark.love as a new button next to Forging. `/forge-notebook/` is a standalone export of the notebook (a dated timeline and every test from 2026-11-11 and 11-12 on the dual-GPU PC: vLLM tuning, the memory fault and the EXPO fix, the lock test, the 20-task eval), in Glyph Grid Studio's Cream and Basalt themes with its glyph-field background and a charcoal-sketch title (✺ The Forge Notebook, still plus a 4 s loop). A "✺ Forge Notebook" hero button sits right after "△ Forging" and reuses its ember colours. Nothing else on the home page changed.
**Privacy:** the page loads only its Google Fonts; no IPs, hostnames, usernames, emails or local paths (grepped before commit).
**Verification:** served locally and checked in the browser pane: the new button opens `/forge-notebook/`; the page renders in Cream and Basalt, the charcoal title loads, 375 px phone width with no sideways scroll.
**Files:** index.html, forge-notebook/ (new)

## 2026-11-12: ITER: Agentic Repos section, first above the Sneak Peeks

**Change:** Joona asked for an "Agentic Repos" section first, above the Sneak Peeks, with the Fleet Dashboard video embedded from YouTube (G_ldLkL11SY) so plays count for the channel, a one-line description and a GitHub button. Added `#agentic` with a Win98 card like the Suite's: badge "Open source · MIT", the line "A live dashboard for every machine you and your agents run on: GPUs, VRAM, temperatures and power on Mac, Linux and Windows. No installs, no accounts, everything stays local.", the video and a "GitHub ✦" link to Joona-t/lovespark-fleet-dashboard. A "Repos" link leads the nav bar.
**Privacy:** the video is a click-to-play facade (the promo's thumbnail A, `images/agentic/fleet-dashboard.jpg`, 86 KB): no request goes to YouTube until the visitor presses play, then the privacy-enhanced `youtube-nocookie.com` player loads with autoplay. A note under it says so.
**Verification:** served locally and checked in the browser pane: section order hiatus note → Agentic Repos → Sneak Peeks; 0 YouTube requests before the click, the nocookie iframe after it; Basalt and Bubblegum both styled; 375 px phone width with no sideways scroll (card 343 px); the nav marks "Repos" while the section is in view. The page parses with every tag balanced; script.js parses. Cache versions of styles.css and script.js bumped.
**Files:** index.html, styles.css, script.js, images/agentic/fleet-dashboard.jpg

## 2026-11-11: ITER: New mission statement

**Change:** Joona asked to update the mission: AI has put the tools to learn anything in everyone's hands, so LoveSpark's mission is now to teach non-technical people to use AI to learn what they are curious about, pursue their passions, accelerate their abilities and bring what they imagine to life; that knowledge should be free and accessible to everyone, and intelligence belongs to the people. The Mission section's three paragraphs are replaced with four in his words. Markup, classes and styles are unchanged.
**Verification:** The edited section parses with every tag closed; the change is text inside existing `.mission-text` paragraphs only. Not previewed in a browser (the local preview server could not be started this session).
**Also:** the "A note from the workshop" section now says this shelf is the beginning (built while first learning to build with AI and agents), is no longer actively updated, and that most current work is in private projects. Removed the Sparky convergence paragraph and the claim that "full source and the unrestricted builds" are on GitHub (now: many of these tools are open source there). Added a line that some tools may be outdated or covered by AI models now. Moved the workshop note above "The Suite" (Joona asked). It used to share a two-column `.about-grid` with the mission on desktop; the wrapper and its CSS are removed, so the note and the mission each use their own centred prose-width styles (the layout phones already had). The whole page still parses with every tag balanced.
**Files:** index.html, styles.css

## 2026-11-08: ITER: 3D Agentic Studio published at /3d-agentic-studio/

**Change:** Joona asked to publish the 3D Agentic Studio site. `/3d-agentic-studio/` is the built `dist/` of `Joona-t/3d-agentic-studio` at v0.8.3 (f732564), without `release/`: the print files are on that repo's v0.8.3 GitHub Release (175 assets, sizes checked against the local files). Nothing outside the new folder changed.
**Verification:** `build_site.py --check-links` with the release base: 24 outbound links alive, 174 release URLs in the pages and data all present on the release, page-weight budget ok, 37.6 MB. Live check: see the next entry or the source repo's log.
**Files:** 3d-agentic-studio/ (new)

## 2026-11-03: ITER: Sparky card corrected, SparkyBrain card and explainer page

**Change:** Joona asked to update the Sparky description and add SparkyBrain, with a technical explanation of the setup and why it is kept separate. The Sparky card said "Mac &amp; iOS App" and "bring your own AI"; the app is macOS-only (`project.yml` platform macOS) and chat runs through the Claude Code CLI by default, so the badge and text now say that. A new SparkyBrain card (Mac &amp; iOS panel) links to a new page, `/sparky-brain/`, which covers how each one stores, searches and serves data, the ledgers, why they were split, and what isn't built yet: the app doesn't read SparkyBrain, and SparkyBridge has no code. Every claim on the page was checked against the Sparky repo and the sparky-hub code and notes on the Mac mini. The page reuses `styles.css` and `script.js`, so all four themes work.
**Bug (contrast, found while checking):** In basalt, the default theme, every card title was `--bs-text` on the base 55% white pill (1.9:1); it now has a dark pill (10.5:1). Kawaii and bubblegum also had failures: category titles (3.44 and 2.96), "Coming soon" pills (4.49, and 4.35 in basalt), the footer copyright line (4.49), the Aaron memorial line (2.86 basalt, 4.45 bubblegum) and the kawaii ✕ (2.99 against 3:1). Each now has its own colour that passes. Root cause: base rules use kawaii tokens, and a theme override that sets only the text colour leaves the kawaii background or token underneath. A theme that has no override at all inherits the kawaii value.
**Verification:** Local preview at 320 px. An in-page audit composites each text node over its real background (against every gradient stop) in basalt, bubblegum, parchment and kawaii: 0 failures on `/sparky-brain/` and on the home gallery and footer. scrollWidth is 320 on the new page. The home page reports 328 because of the hero "dyson shell", which `body { overflow-x: hidden }` clips, and `scrollX` stays 0. `build-gallery.py --check` is in sync (9 categories, 36 cards).
**Files:** data/gallery.json, index.html, styles.css, sparky-brain/index.html

## 2026-11-01: ITER: Remove the X / Twitter link from the footer

**Change:** Dropped the `x.com/the_null_path` link and one adjacent `✦` separator from the footer "Elsewhere" nav at Joona's request. Footer now reads GitHub ✦ Substack ✦ Goodreads. Reverts the 2026-10-27 restore (third toggle of this link: removed 10-24, restored 10-27, removed again now).
**Verification:** `grep -n 'x.com/the_null_path\|X / Twitter' index.html` finds nothing; footer nav renders the three remaining links with no orphaned separator.
**Files:** index.html

## 2026-10-30: ITER: Papers Worth Reading panel

**Change:** New hero button "𓏞 Papers Worth Reading", right after Qwen Guide, linking to `https://lovespark.love/papers/`: a timeline archive of AI research papers by field (repo `papers`, Qwen guide template plus the Y2K Korean cursor themes). It is a plain `hero-cta`, so Qwen Guide stays the single gold primary.
**Verification:** Local preview in basalt at 1440 px: the button sits in row 1 after Qwen Guide (283×51 px) with no layout shift in the other rows. The target page only goes live once the `papers` repo is published with Pages; until then the link 404s, so don't merge before that.
**Files:** index.html

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
