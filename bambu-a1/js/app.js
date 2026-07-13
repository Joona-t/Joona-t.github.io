/* ============================================================
   app.js — resilient router, navigation drawer, pager, theme.
   Loaded last. Chapter content is developer-authored static HTML;
   URL input is resolved only against fixed view, slug, and number maps.
   ============================================================ */
(function () {
  "use strict";

  const A1 = (window.A1 = window.A1 || {});
  A1.chapters = A1.chapters || [];
  A1.sims = A1.sims || {};

  const TIERS = ["Beginner", "Intermediate", "Advanced"];
  const CHAPTER_SLUGS = Object.freeze({
    0: "preamble",
    1: "meet-the-a1",
    2: "motion-and-axes",
    3: "extrusion-and-hotend",
    4: "auto-bed-leveling",
    5: "vibration-compensation",
    6: "flow-dynamics",
    7: "ams-lite-color",
    8: "slicing-to-gcode",
    9: "first-print",
    10: "materials",
    11: "maintenance",
  });
  const TASK_PATHS = Object.freeze({
    "first-print": Object.freeze({
      title: "First print safely",
      summary: "Start with safe placement, then follow one complete print.",
      chapters: Object.freeze([0, 9]),
    }),
    understand: Object.freeze({
      title: "Understand how it works",
      summary: "Begin with the overview and continue through the machine chapter by chapter.",
      chapters: Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    }),
    diagnose: Object.freeze({
      title: "Diagnose a symptom",
      summary: "Start from what you can see, then jump to the relevant mechanism.",
      view: "symptoms",
      chapters: Object.freeze([4, 3, 5, 10, 7, 11]),
    }),
  });
  const SYMPTOMS = Object.freeze([
    Object.freeze({
      title: "First layer will not stick or the nozzle drags",
      n: 4,
      anchor: "diagnose-first-layer",
      detail: "Review leveling, plate variation, plate preparation, and profile selection.",
      checks: Object.freeze([
        "Cancel the job if the nozzle is scraping or the part has detached; wait for the plate and hotend to cool before touching them.",
        "Record any HMS message, then visually verify that the plate is seated and that the selected printer, nozzle, plate, filament, and process profiles match the hardware and spool.",
      ]),
      caveat: "Poor adhesion can come from contamination, material or profile choice, or part geometry; it does not by itself prove that auto bed leveling failed.",
      next: "Follow the official leveling flow and the plate-cleaning instructions for the exact plate before attempting another first layer.",
      stop: "Stop and contact Bambu Support if there is grinding or a collision, visible nozzle, plate, cable, or heatbed damage, an unresolved HMS error, or repeated failure after the official checks.",
      source: Object.freeze({ title: "Official homing and leveling guide", url: "https://wiki.bambulab.com/en/a1/troubleshooting/homing-leveling-failure" }),
    }),
    Object.freeze({
      title: "Thin lines, gaps, clicking, or under-extrusion",
      n: 3,
      anchor: "diagnose-under-extrusion",
      detail: "Compare the visible feed path and requested flow with the active profiles.",
      checks: Object.freeze([
        "Without reaching into the moving or hot toolhead, observe whether the spool turns freely, whether a PTFE tube is visibly kinked, and which exact HMS message appears.",
        "Verify the selected nozzle size, filament, and process profile; save the job and profile names before changing anything.",
      ]),
      caveat: "Similar marks can come from a tangle, wet or incompatible filament, a partial clog, feed-path resistance, an incorrect profile, or excessive requested flow.",
      next: "Cancel safely, use the screen's unload flow, let the printer cool, and follow Bambu's model-specific unclogging procedure rather than improvising a hot pull.",
      stop: "Stop and contact Bambu Support if filament cannot be unloaded by the documented flow, grinding continues, temperature is abnormal, a connector or tube is damaged, or clogs recur.",
      source: Object.freeze({ title: "Official A1/A1 mini nozzle unclogging procedure", url: "https://wiki.bambulab.com/en/a1-mini/troubleshooting/nozzle-clog" }),
    }),
    Object.freeze({
      title: "Repeating echoes after a sharp corner",
      n: 5,
      anchor: "diagnose-ringing",
      detail: "Identify ringing before changing speed, acceleration, belts, or calibration.",
      checks: Object.freeze([
        "Compare periodic echoes after corners with a true layer shift, and record the model orientation, material, and process profile.",
        "With the printer stable and its swept area clear, run only the calibration offered by the printer's current Calibration menu.",
      ]),
      caveat: "Model facets, a loose print or plate, extrusion variation, and layer shifts can resemble ringing; a photo alone may not identify the cause.",
      next: "Retest a small known model with a default profile after official printer calibration, changing one setting at a time.",
      stop: "Stop and contact Bambu Support for collisions, harsh mechanical noise, a visibly loose or damaged component, layer shifts that persist with defaults, or an unresolved HMS error.",
      source: Object.freeze({ title: "Official printer calibration guide", url: "https://wiki.bambulab.com/en/general/printer-calibration" }),
    }),
    Object.freeze({
      title: "Corners lift or a large part warps",
      n: 10,
      anchor: "diagnose-warping",
      detail: "Check the exact material guidance, geometry, drafts, plate preparation, and profiles.",
      checks: Object.freeze([
        "Cancel if the lifted part could meet the nozzle; otherwise record when and where lifting starts, then wait for the plate to cool before removal.",
        "Verify the selected plate and profiles, plate cleanliness, nearby drafts, part geometry, and the exact spool's storage and ventilation guidance.",
      ]),
      caveat: "A poor first layer, contamination, wet filament, or the wrong profile can resemble a material-limit problem. Enclosing an A1 is not a safe generic fix.",
      next: "Work through Bambu's warping causes one at a time, beginning with the exact material and plate instructions, and retest with a small low-risk part.",
      stop: "Stop and contact Bambu Support if the part contacts the nozzle, the heatbed reports an error, there is electrical odor or visible heat damage, or the documented material/profile checks do not resolve repeated severe warping.",
      source: Object.freeze({ title: "Official warping troubleshooting guide", url: "https://wiki.bambulab.com/en/filament-acc/filament/print-quality/warping-falling-off-collapsing" }),
    }),
    Object.freeze({
      title: "AMS lite will not load, retract, or change color",
      n: 7,
      anchor: "diagnose-ams-feed",
      detail: "Trace only the visible feed path and verify the exact material is compatible.",
      checks: Object.freeze([
        "Record the complete HMS message and affected slot; check for a visible spool tangle, incompatible spool or filament, and a kinked or badly routed PTFE tube.",
        "Keep hands clear while the feeder is moving, and do not disconnect a tube or pull filament while the system is under load.",
      ]),
      caveat: "A spool or profile mismatch can look like a feeder fault, and RFID identification does not prove that every calibration or compatibility choice is correct.",
      next: "Use only the on-screen Retry or Unload flow that matches the HMS message, then compare the installation and filament with the current AMS lite guide.",
      stop: "Stop and contact Bambu Support if grinding repeats, filament has broken somewhere inaccessible, a PTFE tube or cable is damaged, or the documented prompt would require unfamiliar disassembly.",
      source: Object.freeze({ title: "Official AMS lite introduction and setup guide", url: "https://wiki.bambulab.com/en/ams-lite/manual/intro-ams-lite" }),
    }),
    Object.freeze({
      title: "The hotend needs cleaning or replacement",
      n: 11,
      anchor: "diagnose-hotend-service",
      detail: "Use shutdown, cooldown, and the exact maintenance procedure before service.",
      checks: Object.freeze([
        "Record the symptom and HMS message, identify the exact service task, and inspect only for visible residue, leakage, or damage while keeping clear of moving and hot parts.",
        "Before handling the hotend, stop the printer, let it reach the procedure's safe temperature, switch it off, unplug it, and prevent an accidental restart.",
      ]),
      caveat: "Quick-swap describes the mounting design, not permission to touch a hot assembly; an apparent clog can also originate in the filament or feed path.",
      next: "Open the current task-specific Bambu procedure and follow its temperature, tool, and part instructions exactly; replace a part only when that procedure calls for it.",
      stop: "Stop and contact Bambu Support for uncertain connectors, damaged insulation, melted or leaking parts, unexpected heating, recall-status uncertainty, or any step not covered by the official procedure.",
      source: Object.freeze({ title: "Official A1 maintenance guide", url: "https://wiki.bambulab.com/en/a1/maintenance/basic-maintenance" }),
    }),
  ]);
  const GLOSSARY = Object.freeze([
    Object.freeze({ term: "AMS lite", definition: "An open four-spool feeder that time-shares the A1's single nozzle.", n: 7 }),
    Object.freeze({ term: "Auto bed leveling", definition: "Measuring plate-height variation so firmware can compensate nozzle Z position.", n: 4 }),
    Object.freeze({ term: "Bed-slinger", definition: "A layout where the build plate and printed part move on the Y axis.", n: 2 }),
    Object.freeze({ term: "Filament profile", definition: "The slicer's material-specific temperatures, cooling, flow limits, and related settings for the selected spool.", n: 8 }),
    Object.freeze({ term: "Flow Dynamics", definition: "Bambu's calibration and feed-forward control for compensating changing melt-pressure demand; it is not continuous closed-loop flow measurement.", n: 6 }),
    Object.freeze({ term: "G-code", definition: "The ordered machine instructions produced by a slicer for one print job.", n: 8 }),
    Object.freeze({ term: "HMS", definition: "Health Management System: the printer's coded diagnostic and maintenance messages. Record the complete message before troubleshooting.", n: 11 }),
    Object.freeze({ term: "Hotend", definition: "The heated assembly that melts filament and guides it through the nozzle.", n: 3 }),
    Object.freeze({ term: "Input shaping", definition: "Motion control that reshapes commands to reduce measured resonant vibration.", n: 5 }),
    Object.freeze({ term: "K factor", definition: "A flow-dynamics calibration value tied to a printer, filament, and method.", n: 6 }),
    Object.freeze({ term: "Layer height", definition: "The nominal vertical thickness of each deposited layer.", n: 8 }),
    Object.freeze({ term: "Partial, complete, and thorough leveling", definition: "Separate A1 bed-leveling routines: a model-area partial check, a complete pre-print grid, and a denser thorough calibration started from the Calibration page.", n: 4 }),
    Object.freeze({ term: "Pressure advance", definition: "Feed-forward extrusion control that anticipates changing melt-pressure demand.", n: 6 }),
    Object.freeze({ term: "Process profile", definition: "The slicer's print settings for a job, such as layer height, walls, infill, speed, supports, and quality choices.", n: 8 }),
    Object.freeze({ term: "PTFE tube", definition: "A low-friction guide tube that carries filament between a spool feeder and the toolhead.", n: 7 }),
    Object.freeze({ term: "RFID", definition: "Radio-frequency identification used by AMS lite to read supported Bambu spool information; it does not store every printer calibration value.", n: 7 }),
    Object.freeze({ term: "Slicer", definition: "Software that turns a model and profiles into toolpaths and G-code.", n: 8 }),
    Object.freeze({ term: "Volumetric flow", definition: "Plastic volume requested per second, commonly expressed in mm³/s.", n: 3 }),
  ]);
  const sidebar = document.getElementById("sidebar");
  const article = document.getElementById("chapter");
  const content = document.getElementById("content");
  const pagerTop = document.getElementById("pagerTop");
  const pagerBottom = document.getElementById("pagerBottom");
  const menuBtn = document.getElementById("menuBtn");
  const backdrop = document.getElementById("backdrop");
  const themeBtn = document.getElementById("themeBtn");
  const announcer = document.getElementById("announcer");
  const brand = document.querySelector(".brand");
  const topbarRight = document.querySelector(".topbar-right");
  const drawerMedia = window.matchMedia("(max-width: 900px)");

  const fallbackRouteModel = {
    normalizeChapters(list) {
      return (list || []).filter(Boolean).slice().sort((a, b) => a.n - b.n);
    },
    resolve(raw, numbers) {
      if (!numbers.length) return { valid: false, n: null, raw, reason: "empty" };
      if (raw == null) return { valid: true, n: numbers[0], raw: null, reason: null };
      if (!/^(0|[1-9]\d*)$/.test(raw)) return { valid: false, n: null, raw, reason: "invalid" };
      const n = Number(raw);
      return numbers.indexOf(n) >= 0
        ? { valid: true, n, raw, reason: null }
        : { valid: false, n: null, raw, reason: "missing" };
    },
    adjacent(numbers, n, direction) {
      const i = numbers.indexOf(n);
      const target = i + direction;
      return i >= 0 && target >= 0 && target < numbers.length ? numbers[target] : null;
    },
  };
  const fallbackGuideAvailabilityModel = Object.freeze({
    guard(route, numbers) {
      if (Array.isArray(numbers) && numbers.length) return route;
      return {
        kind: "unavailable",
        valid: false,
        n: null,
        raw: route && Object.prototype.hasOwnProperty.call(route, "raw") ? route.raw : null,
        reason: "empty",
      };
    },
  });
  const routeModel = A1.routeModel || fallbackRouteModel;
  const guideAvailabilityModel = A1.guideAvailabilityModel || fallbackGuideAvailabilityModel;
  A1.guideAvailabilityModel = guideAvailabilityModel;
  const chapters = routeModel.normalizeChapters(A1.chapters).map((chapter) =>
    Object.assign({}, chapter, { slug: CHAPTER_SLUGS[chapter.n] || "chapter-" + chapter.n })
  );
  const chapterByNumber = new Map(chapters.map((chapter) => [chapter.n, chapter]));
  const chapterBySlug = new Map(chapters.map((chapter) => [chapter.slug, chapter]));
  const chapterNumbers = chapters.map((chapter) => chapter.n);

  let activeSims = [];
  let current = null;
  let currentPathId = null;
  let currentAnchor = null;

  /* ---------- safe persistence + theme ---------- */
  function readStorage(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, value);
    } catch (error) {
      // Storage can be unavailable in private, embedded, or file:// contexts.
    }
  }

  function readStorageList(key) {
    const raw = readStorage(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
    } catch (error) {
      return [];
    }
  }

  function readStorageObject(key) {
    const raw = readStorage(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function pathPosition(pathId, n) {
    const path = TASK_PATHS[pathId];
    if (!path || !Array.isArray(path.chapters)) return null;
    const index = path.chapters.indexOf(n);
    return index >= 0 ? { index, step: index + 1, total: path.chapters.length } : null;
  }

  function symptomAnchorForChapter(n) {
    const symptom = SYMPTOMS.find((entry) => entry.n === n);
    return symptom ? symptom.anchor : null;
  }

  function safeAnchor(raw) {
    if (typeof raw !== "string" || !raw) return null;
    let anchor = raw.charAt(0) === "#" ? raw.slice(1) : raw;
    try { anchor = decodeURIComponent(anchor); } catch (error) { return null; }
    return /^[a-z][a-z0-9-]{0,79}$/.test(anchor) ? anchor : null;
  }

  function normalizeChapterContext(chapter, value) {
    const raw = value || {};
    const pathId = typeof raw.path === "string" && pathPosition(raw.path, chapter.n)
      ? raw.path
      : null;
    const position = pathId ? pathPosition(pathId, chapter.n) : null;
    let anchor = safeAnchor(raw.anchor);
    if (pathId === "diagnose" && anchor !== symptomAnchorForChapter(chapter.n)) anchor = null;
    return {
      pathId,
      step: position ? position.step : null,
      total: position ? position.total : null,
      anchor,
    };
  }

  const completed = new Set(readStorageList("a1-completed").filter((slug) => chapterBySlug.has(slug)));
  function readResumePosition() {
    const stored = readStorageObject("a1-last-position");
    const legacySlug = readStorage("a1-last-chapter");
    const slug = stored && typeof stored.chapter === "string" ? stored.chapter : legacySlug;
    const chapter = chapterBySlug.get(slug);
    if (!chapter) return null;
    const context = normalizeChapterContext(chapter, stored || {});
    return {
      chapter: chapter.slug,
      path: context.pathId,
      step: context.step,
      total: context.total,
      anchor: context.anchor,
    };
  }

  let lastPosition = readResumePosition();

  function chapterUrl(chapter, context) {
    const normalized = normalizeChapterContext(chapter, context);
    let url = "?chapter=" + encodeURIComponent(chapter.slug);
    if (normalized.pathId) url += "&path=" + encodeURIComponent(normalized.pathId);
    if (normalized.anchor) url += "#" + encodeURIComponent(normalized.anchor);
    return url;
  }

  function pathUrl(id) {
    return "?path=" + encodeURIComponent(id);
  }

  function viewUrl(id) {
    return "?view=" + encodeURIComponent(id);
  }

  function contextForPathTarget(pathId, n) {
    return {
      path: pathId,
      anchor: pathId === "diagnose" ? symptomAnchorForChapter(n) : null,
    };
  }

  function updateThemeButton() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeBtn.title = isDark ? "Switch to light theme" : "Switch to dark theme";
  }

  const savedTheme = readStorage("a1-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
  updateThemeButton();

  themeBtn.addEventListener("click", () => {
    const now = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", now);
    writeStorage("a1-theme", now);
    updateThemeButton();
    activeSims.forEach((sim) => { if (sim.repaint) sim.repaint(); });
  });

  /* ---------- sidebar ---------- */
  function appendSidebarLink(label, href, key, lead) {
    const link = document.createElement("a");
    link.className = "side-link";
    link.href = href;
    link.dataset.navKey = key;
    link.innerHTML = '<span class="n"></span><span class="t"></span><span class="side-done" aria-hidden="true"></span>';
    link.querySelector(".n").textContent = lead || "•";
    link.querySelector(".t").textContent = label;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeDrawer(false);
      navigateHref(href);
    });
    sidebar.appendChild(link);
    return link;
  }

  function buildSidebar() {
    sidebar.replaceChildren();

    const guideHeading = document.createElement("div");
    guideHeading.className = "side-tier";
    guideHeading.textContent = "Choose a route";
    sidebar.appendChild(guideHeading);
    appendSidebarLink("Start", viewUrl("start"), "view:start", "⌂");
    Object.keys(TASK_PATHS).forEach((id) => {
      appendSidebarLink(TASK_PATHS[id].title, pathUrl(id), "path:" + id, "→");
    });
    appendSidebarLink("Glossary", viewUrl("glossary"), "view:glossary", "A");

    const tierNote = document.createElement("p");
    tierNote.className = "side-tier-note";
    tierNote.textContent = "Chapter tiers describe explanation depth, not safety priority.";
    sidebar.appendChild(tierNote);

    TIERS.forEach((tier) => {
      const items = chapters.filter((chapter) => chapter.tier === tier);
      if (!items.length) return;

      const heading = document.createElement("div");
      heading.className = "side-tier";
      heading.textContent = tier;
      sidebar.appendChild(heading);

      items.forEach((chapter) => {
        const link = appendSidebarLink(
          chapter.title,
          chapterUrl(chapter),
          "chapter:" + chapter.slug,
          String(chapter.n)
        );
        link.dataset.chapterSlug = chapter.slug;
      });
    });

    const trust = document.createElement("section");
    trust.className = "trust-legend";
    trust.setAttribute("aria-label", "Source and model labels");
    trust.innerHTML =
      '<h2>How to read labels</h2>' +
      '<p><span class="source-label source-official">Official source</span> Current manufacturer or regulator guidance.</p>' +
      '<p><span class="source-label source-community">Community context</span> Useful experience, not controlling instructions.</p>' +
      '<p><span class="source-label source-illustrative">Illustrative model</span> A teaching aid, not a prediction or calibration tool.</p>';
    sidebar.appendChild(trust);
    refreshCompletionMarks();
  }

  function refreshCompletionMarks() {
    sidebar.querySelectorAll("[data-chapter-slug]").forEach((link) => {
      const done = completed.has(link.dataset.chapterSlug);
      link.classList.toggle("is-complete", done);
      link.querySelector(".side-done").textContent = done ? "✓" : "";
      if (done) link.setAttribute("aria-label", link.querySelector(".t").textContent + ", marked as read");
      else link.removeAttribute("aria-label");
    });
  }

  function markActive(key) {
    sidebar.querySelectorAll(".side-link").forEach((link) => {
      const isCurrent = link.dataset.navKey === key;
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  /* ---------- pager ---------- */
  function buildPager(element, n, pathId) {
    element.replaceChildren();
    const path = TASK_PATHS[pathId];
    const inPath = path && Array.isArray(path.chapters) && path.chapters.indexOf(n) >= 0;
    const sequence = inPath ? path.chapters : chapterNumbers;
    const position = sequence.indexOf(n);
    if (position < 0) return;

    const previousNumber = routeModel.adjacent(sequence, n, -1);
    const nextNumber = routeModel.adjacent(sequence, n, 1);
    const previousChapter = chapterByNumber.get(previousNumber);
    const nextChapter = chapterByNumber.get(nextNumber);

    const previous = previousChapter ? document.createElement("a") : document.createElement("span");
    previous.className = "pg-btn";
    previous.textContent = previousChapter ? "\u2190 " + previousChapter.title : "\u2190 Previous";
    if (previousChapter) {
      const previousContext = inPath ? contextForPathTarget(pathId, previousNumber) : null;
      previous.href = chapterUrl(previousChapter, previousContext);
      previous.setAttribute("aria-label", "Previous: " + previousChapter.title);
      previous.addEventListener("click", (event) => {
        event.preventDefault();
        go(previousNumber, previousContext);
      });
    } else {
      previous.classList.add("is-disabled");
      previous.setAttribute("aria-disabled", "true");
    }

    const progress = document.createElement("span");
    progress.className = "progress";
    const unit = inPath ? "Step" : "Chapter";
    progress.setAttribute("aria-label", unit + " " + (position + 1) + " of " + sequence.length);
    progress.innerHTML = '<span class="unit"></span> <span class="cur"></span> of <span class="total"></span>';
    progress.querySelector(".unit").textContent = unit;
    progress.querySelector(".cur").textContent = position + 1;
    progress.querySelector(".total").textContent = sequence.length;

    const next = nextChapter ? document.createElement("a") : document.createElement("span");
    next.className = "pg-btn";
    next.textContent = nextChapter ? nextChapter.title + " \u2192" : "Next \u2192";
    if (nextChapter) {
      const nextContext = inPath ? contextForPathTarget(pathId, nextNumber) : null;
      next.href = chapterUrl(nextChapter, nextContext);
      next.setAttribute("aria-label", "Next: " + nextChapter.title);
      next.addEventListener("click", (event) => {
        event.preventDefault();
        go(nextNumber, nextContext);
      });
    } else {
      next.classList.add("is-disabled");
      next.setAttribute("aria-disabled", "true");
    }

    element.append(previous, progress, next);
  }

  function prependPathContext(pathId, n) {
    const path = TASK_PATHS[pathId];
    const position = pathPosition(pathId, n);
    if (!path || !position) return;

    const context = document.createElement("nav");
    context.className = "path-context";
    context.setAttribute("aria-label", "Current route");
    const back = document.createElement("a");
    back.href = pathUrl(pathId);
    back.textContent = "\u2190 Back to " + path.title;
    back.addEventListener("click", (event) => {
      event.preventDefault();
      renderPath(pathId, { focusHeading: true, historyMode: "push" });
    });
    const step = document.createElement("span");
    step.textContent = "Step " + position.step + " of " + position.total;
    context.append(back, step);
    article.prepend(context);
  }

  /* ---------- rendering ---------- */
  function teardownSims() {
    activeSims.forEach((sim) => {
      try { sim.destroy(); } catch (error) { /* already gone */ }
    });
    activeSims = [];
  }

  function promoteSectionHeadings() {
    article.querySelectorAll("h3").forEach((oldHeading) => {
      const heading = document.createElement("h2");
      Array.from(oldHeading.attributes).forEach((attribute) => {
        heading.setAttribute(attribute.name, attribute.value);
      });
      while (oldHeading.firstChild) heading.appendChild(oldHeading.firstChild);
      oldHeading.replaceWith(heading);
    });
  }

  function focusHeadingIfRequested(shouldFocus) {
    if (!shouldFocus) return;
    const heading = article.querySelector("h1");
    if (!heading) return;
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }

  function findArticleId(id) {
    if (!id) return null;
    return Array.from(article.querySelectorAll("[id]")).find((element) => element.id === id) || null;
  }

  function focusChapterDestination(anchor, shouldFocusHeading) {
    const target = findArticleId(anchor);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.scrollIntoView({ block: "start", behavior: "auto" });
      target.focus({ preventScroll: true });
      return;
    }
    focusHeadingIfRequested(shouldFocusHeading);
  }

  function sourceClassForLink(link) {
    let url;
    try { url = new URL(link.getAttribute("href"), location.href); } catch (error) { return "community"; }
    const host = url.hostname.toLowerCase();
    const officialBambu = host === "bambulab.com" || host.endsWith(".bambulab.com");
    const officialRegulator = host === "cpsc.gov" || host.endsWith(".cpsc.gov");
    const officialRepository = host === "github.com" && /^\/bambulab\//i.test(url.pathname);
    return officialBambu || officialRegulator || officialRepository ? "official" : "community";
  }

  function labelGoDeeperLinks() {
    article.querySelectorAll(".go-deeper a").forEach((link) => {
      const kind = sourceClassForLink(link);
      const badge = document.createElement("span");
      badge.className = "source-label source-" + kind;
      badge.textContent = kind === "official" ? "Official source" : "Community context";
      link.append(" ", badge);
    });
  }

  function updateHistory(url, state, mode) {
    if (mode === "none") return;
    try {
      if (mode === "replace") history.replaceState(state, "", url);
      else history.pushState(state, "", url);
    } catch (error) {
      // Some local/embedded contexts restrict History API writes.
    }
  }

  function renderChapter(n, options) {
    const opts = options || {};
    const chapter = chapterByNumber.get(n);
    if (!chapter) {
      renderUnavailable({ valid: false, n: null, raw: String(n), reason: "missing" }, opts);
      return;
    }

    teardownSims();
    current = n;
    const chapterContext = normalizeChapterContext(chapter, {
      path: opts.pathId,
      anchor: opts.anchor,
    });
    currentPathId = chapterContext.pathId;
    currentAnchor = chapterContext.anchor;

    const heading =
      '<span class="tier-chip"></span>' +
      '<h1 class="chapter-title"><span class="ch-n">Chapter ' + n +
      ' \u2014</span> <span class="ch-t"></span></h1>' +
      '<div class="chapter-actions"><button type="button" class="complete-btn"></button></div>';
    article.innerHTML = heading + chapter.html;
    prependPathContext(currentPathId, n);
    article.querySelector(".tier-chip").textContent = chapter.tier;
    article.querySelector(".ch-t").textContent = chapter.title;
    const completeButton = article.querySelector(".complete-btn");
    function syncCompleteButton() {
      const done = completed.has(chapter.slug);
      completeButton.textContent = done ? "✓ Marked as read" : "Mark as read";
      completeButton.setAttribute("aria-pressed", done ? "true" : "false");
    }
    completeButton.addEventListener("click", () => {
      if (completed.has(chapter.slug)) completed.delete(chapter.slug);
      else completed.add(chapter.slug);
      writeStorage("a1-completed", JSON.stringify(Array.from(completed)));
      syncCompleteButton();
      refreshCompletionMarks();
      announcer.textContent = completed.has(chapter.slug)
        ? chapter.title + " marked as read. This records reading only, not competence."
        : chapter.title + " no longer marked as read.";
    });
    syncCompleteButton();
    promoteSectionHeadings();
    labelGoDeeperLinks();

    article.querySelectorAll("[data-sim]").forEach((slot) => {
      const simId = slot.getAttribute("data-sim");
      const sim = A1.sims[simId];
      if (sim && typeof A1.mountSim === "function") {
        activeSims.push(A1.mountSim(slot, sim));
      } else {
        const warning = document.createElement("p");
        warning.className = "warn";
        warning.textContent = "This playground is unavailable (" + simId + "). The rest of the chapter still works.";
        slot.replaceChildren(warning);
      }
    });

    buildPager(pagerTop, n, currentPathId);
    buildPager(pagerBottom, n, currentPathId);
    markActive("chapter:" + chapter.slug);

    const resumePosition = {
      chapter: chapter.slug,
      path: currentPathId,
      step: chapterContext.step,
      total: chapterContext.total,
      anchor: currentAnchor,
    };
    lastPosition = resumePosition;
    writeStorage("a1-last-chapter", chapter.slug);
    writeStorage("a1-last-position", JSON.stringify(resumePosition));

    document.title = "Ch " + n + ": " + chapter.title + " \u2014 How the Bambu Lab A1 Works";
    announcer.textContent = currentPathId
      ? TASK_PATHS[currentPathId].title + ", step " + chapterContext.step + " of " + chapterContext.total + ": " + chapter.title
      : "Chapter " + (chapterNumbers.indexOf(n) + 1) + " of " + chapterNumbers.length + ": " + chapter.title;
    if (!opts.keepScroll && !currentAnchor) window.scrollTo({ top: 0, behavior: "auto" });
    focusChapterDestination(currentAnchor, opts.focusHeading);
    updateHistory(
      chapterUrl(chapter, { path: currentPathId, anchor: currentAnchor }),
      { chapter: chapter.slug, path: currentPathId, step: chapterContext.step, anchor: currentAnchor },
      opts.historyMode || "none"
    );
  }

  function renderUnavailable(route, options) {
    const opts = options || {};
    teardownSims();
    current = null;
    currentPathId = null;
    currentAnchor = null;
    pagerTop.replaceChildren();
    pagerBottom.replaceChildren();
    markActive(null);
    article.replaceChildren();

    const heading = document.createElement("h1");
    heading.className = "chapter-title";
    heading.textContent = route.reason === "empty" ? "Guide unavailable" : "Chapter unavailable";
    article.appendChild(heading);

    const warning = document.createElement("div");
    warning.className = "warn";
    const message = document.createElement("p");
    if (route.reason === "empty") {
      message.textContent = "No chapter scripts loaded. Refresh the page or check that the site was uploaded completely.";
    } else if (route.reason === "missing") {
      message.textContent = "That chapter is not available. Its script may be missing, but the chapters below can still be opened.";
    } else {
      message.textContent = "The chapter address is not valid. Choose an available chapter below.";
    }
    warning.appendChild(message);
    if (route.reason === "empty") {
      const quickStart = document.createElement("p");
      const link = document.createElement("a");
      link.href = "https://cdn1.bambulab.com/documentation/quick-start-a75adcb1d5d5e/Quick%20Start%20Guide%20for%20A1.pdf";
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Open the official A1 Quick Start Guide";
      quickStart.append(link, document.createTextNode(" for current setup and safety instructions."));
      warning.appendChild(quickStart);
    }
    article.appendChild(warning);

    if (chapters.length) {
      const sectionHeading = document.createElement("h2");
      sectionHeading.textContent = "Available chapters";
      const list = document.createElement("ul");
      chapters.forEach((chapter) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = chapterUrl(chapter);
        link.textContent = "Chapter " + chapter.n + ": " + chapter.title;
        link.addEventListener("click", (event) => {
          event.preventDefault();
          go(chapter.n);
        });
        item.appendChild(link);
        list.appendChild(item);
      });
      article.append(sectionHeading, list);
    }

    document.title = (route.reason === "empty" ? "Guide unavailable" : "Chapter unavailable") +
      " \u2014 How the Bambu Lab A1 Works";
    announcer.textContent = heading.textContent + ". " + message.textContent;
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: "auto" });
    focusHeadingIfRequested(opts.focusHeading);
  }

  function beginStaticView(key) {
    teardownSims();
    current = null;
    currentPathId = null;
    currentAnchor = null;
    pagerTop.replaceChildren();
    pagerBottom.replaceChildren();
    article.replaceChildren();
    markActive(key);
  }

  function finishStaticView(title, message, url, state, options) {
    const opts = options || {};
    document.title = title + " \u2014 How the Bambu Lab A1 Works";
    announcer.textContent = message || title;
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: "auto" });
    focusHeadingIfRequested(opts.focusHeading);
    updateHistory(url, state, opts.historyMode || "none");
  }

  function appendChapterLink(parent, chapter, label, context) {
    if (!chapter) return false;
    const link = document.createElement("a");
    link.href = chapterUrl(chapter, context);
    link.textContent = label || ("Chapter " + chapter.n + ": " + chapter.title);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      go(chapter.n, context);
    });
    parent.appendChild(link);
    return true;
  }

  function appendUnavailableChapter(parent, n, message) {
    const notice = document.createElement("span");
    notice.className = "route-unavailable";
    notice.textContent = message || ("Chapter " + n + " is unavailable because its script did not load.");
    parent.appendChild(notice);
  }

  function renderStart(options) {
    beginStaticView("view:start");
    article.innerHTML =
      '<span class="tier-chip">Start here</span>' +
      '<h1 class="chapter-title">What do you need from the A1?</h1>' +
      '<p>Choose a task route. They point into the same sourced chapters, so there is no duplicate or conflicting tutorial.</p>' +
      '<div class="route-grid" aria-label="Guide routes"></div>' +
      '<div class="start-tools"><a href="?view=glossary">Browse the glossary</a></div>';

    const grid = article.querySelector(".route-grid");
    Object.keys(TASK_PATHS).forEach((id) => {
      const path = TASK_PATHS[id];
      const card = document.createElement("a");
      card.className = "route-card";
      card.href = pathUrl(id);
      card.innerHTML = '<strong></strong><span></span>';
      card.querySelector("strong").textContent = path.title;
      card.querySelector("span").textContent = path.summary;
      card.addEventListener("click", (event) => {
        event.preventDefault();
        renderPath(id, { focusHeading: true, historyMode: "push" });
      });
      grid.appendChild(card);
    });

    const glossaryLink = article.querySelector(".start-tools a");
    glossaryLink.addEventListener("click", (event) => {
      event.preventDefault();
      renderGlossary({ focusHeading: true, historyMode: "push" });
    });

    const resumeChapter = lastPosition && chapterBySlug.get(lastPosition.chapter);
    if (resumeChapter) {
      const resume = document.createElement("div");
      resume.className = "note resume-note";
      const resumeLabel = lastPosition.path
        ? "Continue " + TASK_PATHS[lastPosition.path].title + ", Step " + lastPosition.step + " of " + lastPosition.total + ": " + resumeChapter.title
        : "Continue with " + resumeChapter.title;
      resume.innerHTML = "<strong>Resume reading.</strong> ";
      appendChapterLink(resume, resumeChapter, resumeLabel, {
        path: lastPosition.path,
        anchor: lastPosition.anchor,
      });
      article.insertBefore(resume, grid);
    }

    finishStaticView(
      "Start",
      "Guide start. Choose First print safely, Understand how it works, or Diagnose a symptom.",
      viewUrl("start"),
      { view: "start" },
      options
    );
  }

  function renderPath(id, options) {
    const path = TASK_PATHS[id];
    if (!path) {
      renderUnavailable({ valid: false, reason: "invalid", raw: id }, options);
      return;
    }
    if (path.view === "symptoms") {
      renderSymptoms(options, "path:diagnose", pathUrl("diagnose"));
      return;
    }

    beginStaticView("path:" + id);
    const heading = document.createElement("h1");
    heading.className = "chapter-title";
    heading.textContent = path.title;
    const summary = document.createElement("p");
    summary.textContent = path.summary;
    if (id === "first-print") {
      const preflight = document.createElement("aside");
      preflight.className = "route-preflight warn";
      preflight.innerHTML =
        '<h2>Before Step 1</h2>' +
        '<p>Do not use this route as assembly instructions. Complete the <a href="https://cdn1.bambulab.com/documentation/quick-start-a75adcb1d5d5e/Quick%20Start%20Guide%20for%20A1.pdf" target="_blank" rel="noopener">official A1 setup</a>, then confirm:</p>' +
        '<ul>' +
        '<li>For a used A1, or any unit whose serial number or heatbed-cable repair history is uncertain, verify its recall and repair status before power-on using current regulator and manufacturer instructions. If the unit may be affected or remains uncertain, keep it off and unplugged and contact Bambu Support or the original reseller; in the U.S., follow the <a href="https://www.cpsc.gov/Recalls/2024/Bambu-Lab-Recalls-A1-3D-Printers-Due-to-Electric-Shock-and-Fire-Hazards" target="_blank" rel="noopener">current CPSC recall remedy</a>.</li>' +
        '<li>The bed has clear travel in every direction and the printer is in a stable, suitably ventilated location.</li>' +
        '<li>The selected printer, nozzle, plate, filament, and process profiles match the hardware and spool, and a supported writable microSD card is installed.</li>' +
        '<li>You can point to the touchscreen Stop control and will remain present to observe the first layer.</li>' +
        '</ul>';
      article.append(heading, summary, preflight);
    } else {
      article.append(heading, summary);
    }
    const list = document.createElement("ol");
    list.className = "route-steps";
    path.chapters.forEach((n) => {
      const chapter = chapterByNumber.get(n);
      const item = document.createElement("li");
      if (!chapter) {
        item.className = "route-step-unavailable";
        appendUnavailableChapter(
          item,
          n,
          "Required step unavailable: Chapter " + n + " did not load. Do not treat this route as complete."
        );
        list.appendChild(item);
        return;
      }
      appendChapterLink(item, chapter, null, contextForPathTarget(id, n));
      if (completed.has(chapter.slug)) {
        const done = document.createElement("span");
        done.className = "route-done";
        done.textContent = " marked as read";
        item.appendChild(done);
      }
      list.appendChild(item);
    });
    article.appendChild(list);
    const readingNote = document.createElement("p");
    readingNote.className = "route-reading-note";
    readingNote.textContent = "Marked as read records where you have read; it is not a skills assessment or safety certification.";
    article.appendChild(readingNote);
    finishStaticView(path.title, path.title + " route.", pathUrl(id), { path: id }, options);
  }

  function renderSymptoms(options, activeKey, historyUrl) {
    beginStaticView(activeKey || "view:symptoms");
    article.innerHTML =
      '<span class="tier-chip">Retrieval</span>' +
      '<h1 class="chapter-title">Diagnose a symptom</h1>' +
      '<p>Start from the visible symptom. These links explain mechanisms; current HMS messages and official troubleshooting steps still control a real repair.</p>';
    const list = document.createElement("div");
    list.className = "retrieval-list";
    SYMPTOMS.forEach((symptom) => {
      const item = document.createElement("section");
      item.className = "retrieval-item";
      const heading = document.createElement("h2");
      heading.textContent = symptom.title;
      const detail = document.createElement("p");
      detail.textContent = symptom.detail;

      const checksHeading = document.createElement("h3");
      checksHeading.textContent = "Safe observable checks";
      const checks = document.createElement("ul");
      checks.className = "symptom-checks";
      symptom.checks.forEach((check) => {
        const checkItem = document.createElement("li");
        checkItem.textContent = check;
        checks.appendChild(checkItem);
      });

      const caveat = document.createElement("p");
      caveat.innerHTML = "<strong>Alternative or caveat:</strong> ";
      caveat.appendChild(document.createTextNode(symptom.caveat));

      const next = document.createElement("p");
      next.innerHTML = "<strong>Safe next step:</strong> ";
      next.appendChild(document.createTextNode(symptom.next));

      const stop = document.createElement("p");
      stop.className = "symptom-stop";
      stop.innerHTML = "<strong>Stop and contact support:</strong> ";
      stop.appendChild(document.createTextNode(symptom.stop));

      const linkLine = document.createElement("p");
      const chapter = chapterByNumber.get(symptom.n);
      if (!appendChapterLink(
        linkLine,
        chapter,
        "Open the relevant section \u2192",
        { path: "diagnose", anchor: symptom.anchor }
      )) {
        appendUnavailableChapter(
          linkLine,
          symptom.n,
          "Relevant chapter unavailable: Chapter " + symptom.n + " did not load."
        );
      }
      const sourceLine = document.createElement("p");
      sourceLine.className = "symptom-source";
      const source = document.createElement("a");
      source.href = symptom.source.url;
      source.target = "_blank";
      source.rel = "noopener";
      source.textContent = symptom.source.title;
      const sourceLabel = document.createElement("span");
      sourceLabel.className = "source-label source-official";
      sourceLabel.textContent = "Official source";
      sourceLine.append(source, document.createTextNode(" "), sourceLabel);

      item.append(heading, detail, checksHeading, checks, caveat, next, stop, linkLine, sourceLine);
      list.appendChild(item);
    });
    article.appendChild(list);
    const url = historyUrl || viewUrl("symptoms");
    const state = activeKey === "path:diagnose" ? { path: "diagnose" } : { view: "symptoms" };
    finishStaticView("Diagnose a symptom", "Symptom index.", url, state, options);
  }

  function renderGlossary(options) {
    beginStaticView("view:glossary");
    article.innerHTML =
      '<span class="tier-chip">Retrieval</span>' +
      '<h1 class="chapter-title">Glossary</h1>' +
      '<p>Short definitions in the sense used by this guide. Follow a term to its explanatory chapter.</p>';
    const list = document.createElement("dl");
    list.className = "glossary-list";
    GLOSSARY.forEach((entry) => {
      const term = document.createElement("dt");
      term.textContent = entry.term;
      const definition = document.createElement("dd");
      definition.append(document.createTextNode(entry.definition + " "));
      const chapter = chapterByNumber.get(entry.n);
      if (!appendChapterLink(definition, chapter, "Learn more \u2192")) {
        appendUnavailableChapter(
          definition,
          entry.n,
          "Explanatory chapter unavailable: Chapter " + entry.n + " did not load."
        );
      }
      list.append(term, definition);
    });
    article.appendChild(list);
    finishStaticView("Glossary", "Glossary.", viewUrl("glossary"), { view: "glossary" }, options);
  }

  function go(n, context) {
    if (!chapterByNumber.has(n)) {
      renderUnavailable({ valid: false, n: null, raw: String(n), reason: "missing" }, {
        focusHeading: true,
      });
      return;
    }
    const chapter = chapterByNumber.get(n);
    const normalized = normalizeChapterContext(chapter, context);
    renderChapter(n, {
      focusHeading: true,
      historyMode: "push",
      pathId: normalized.pathId,
      anchor: normalized.anchor,
    });
  }

  function routeFromSearch(search, hash) {
    const params = new URLSearchParams(search == null ? location.search : search);
    if (params.has("chapter")) {
      const slug = params.get("chapter");
      const chapter = chapterBySlug.get(slug);
      if (!chapter) return { kind: "unavailable", valid: false, reason: "missing", raw: slug };
      const context = normalizeChapterContext(chapter, {
        path: params.get("path"),
        anchor: hash == null ? location.hash : hash,
      });
      return {
        kind: "chapter",
        n: chapter.n,
        pathId: context.pathId,
        anchor: context.anchor,
      };
    }
    if (params.has("ch")) {
      const legacy = routeModel.resolve(params.get("ch"), chapterNumbers);
      return legacy.valid
        ? { kind: "chapter", n: legacy.n, legacy: true }
        : Object.assign({ kind: "unavailable" }, legacy);
    }
    if (params.has("path")) {
      const id = params.get("path");
      return TASK_PATHS[id]
        ? { kind: "path", id }
        : { kind: "unavailable", valid: false, reason: "invalid", raw: id };
    }
    if (params.has("view")) {
      const id = params.get("view");
      return ["start", "glossary", "symptoms"].includes(id)
        ? { kind: "view", id }
        : { kind: "unavailable", valid: false, reason: "invalid", raw: id };
    }
    return { kind: "view", id: "start", defaultView: true };
  }

  function renderRoute(route, options) {
    route = guideAvailabilityModel.guard(route, chapterNumbers);
    if (route.kind === "chapter") {
      renderChapter(route.n, Object.assign({}, options, {
        pathId: route.pathId,
        anchor: route.anchor,
      }));
    }
    else if (route.kind === "path") renderPath(route.id, options);
    else if (route.kind === "view" && route.id === "glossary") renderGlossary(options);
    else if (route.kind === "view" && route.id === "symptoms") renderSymptoms(options);
    else if (route.kind === "view") renderStart(options);
    else renderUnavailable(route, options);
  }

  function navigateHref(href) {
    let url;
    try { url = new URL(href, location.href); } catch (error) { return; }
    renderRoute(routeFromSearch(url.search, url.hash), { focusHeading: true, historyMode: "push" });
  }

  window.addEventListener("popstate", () => {
    renderRoute(routeFromSearch(location.search, location.hash), { focusHeading: true, historyMode: "none" });
  });

  brand.href = viewUrl("start");
  brand.addEventListener("click", (event) => {
    event.preventDefault();
    closeDrawer(false);
    renderRoute({ kind: "view", id: "start" }, { focusHeading: true, historyMode: "push" });
  });

  /* ---------- mobile drawer ---------- */
  function setInert(element, blocked) {
    if (!element) return;
    element.inert = blocked;
    if (blocked) element.setAttribute("aria-hidden", "true");
    else element.removeAttribute("aria-hidden");
  }

  function blockBackground(blocked) {
    setInert(content, blocked);
    setInert(brand, blocked);
    setInert(topbarRight, blocked);
  }

  function syncDrawerState() {
    const mobile = drawerMedia.matches;
    const open = mobile && sidebar.classList.contains("open");

    if (!mobile) sidebar.classList.remove("open");
    setInert(sidebar, mobile && !open);
    blockBackground(open);
    backdrop.hidden = !open;
    document.body.classList.toggle("drawer-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close chapter menu" : "Open chapter menu");
  }

  function openDrawer() {
    if (!drawerMedia.matches) return;
    sidebar.classList.add("open");
    syncDrawerState();
    const target = sidebar.querySelector(".side-link[aria-current]") || sidebar.querySelector(".side-link");
    if (target) target.focus();
  }

  function closeDrawer(restoreFocus) {
    const restore = restoreFocus !== false;
    const wasOpen = sidebar.classList.contains("open");
    sidebar.classList.remove("open");
    syncDrawerState();
    if (wasOpen && restore && drawerMedia.matches) menuBtn.focus();
  }

  function trapDrawerFocus(event) {
    if (event.key !== "Tab" || !drawerMedia.matches || !sidebar.classList.contains("open")) return;
    const links = Array.from(sidebar.querySelectorAll(".side-link"));
    if (!links.length) {
      event.preventDefault();
      menuBtn.focus();
      return;
    }

    const first = links[0];
    const last = links[links.length - 1];
    const active = document.activeElement;
    if (!event.shiftKey && (active === last || active === menuBtn)) {
      event.preventDefault();
      (active === menuBtn ? first : menuBtn).focus();
    } else if (event.shiftKey && (active === first || active === menuBtn)) {
      event.preventDefault();
      (active === menuBtn ? last : menuBtn).focus();
    } else if (active !== menuBtn && !sidebar.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }

  menuBtn.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeDrawer(true);
    else openDrawer();
  });
  backdrop.addEventListener("click", () => closeDrawer(true));
  if (typeof drawerMedia.addEventListener === "function") {
    drawerMedia.addEventListener("change", () => {
      sidebar.classList.remove("open");
      syncDrawerState();
    });
  } else if (typeof drawerMedia.addListener === "function") {
    drawerMedia.addListener(() => {
      sidebar.classList.remove("open");
      syncDrawerState();
    });
  }

  /* ---------- keyboard shortcuts ---------- */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
      event.preventDefault();
      closeDrawer(true);
      return;
    }
    trapDrawerFocus(event);
    if (event.defaultPrevented || event.isComposing || event.repeat ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const target = event.target;
    if (target && typeof target.closest === "function" &&
        target.closest("input, select, textarea, button, a, [contenteditable]:not([contenteditable='false']), [role='slider'], [role='button']")) {
      return;
    }

    const sequence = currentPathId && TASK_PATHS[currentPathId] && TASK_PATHS[currentPathId].chapters
      ? TASK_PATHS[currentPathId].chapters
      : chapterNumbers;
    let targetChapter = null;
    if (event.key === "ArrowRight") targetChapter = routeModel.adjacent(sequence, current, 1);
    if (event.key === "ArrowLeft") targetChapter = routeModel.adjacent(sequence, current, -1);
    if (targetChapter != null) {
      event.preventDefault();
      go(targetChapter, currentPathId ? contextForPathTarget(currentPathId, targetChapter) : null);
    }
  });

  /* ---------- boot ---------- */
  buildSidebar();
  syncDrawerState();
  renderRoute(routeFromSearch(), { historyMode: "none" });
})();
