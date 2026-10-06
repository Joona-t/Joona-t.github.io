/* ============================================================
   sim.js — shared registry + sim framework
   Loaded FIRST. Chapters register via A1.registerChapter/registerSim.
   Sims receive an `api` with canvas + controls factories and a
   managed RAF loop that pauses off-screen and honors
   prefers-reduced-motion (static frame + explicit Play).
   ============================================================ */
(function () {
  "use strict";

  const A1 = (window.A1 = window.A1 || {});
  A1.chapters = A1.chapters || [];
  A1.sims = A1.sims || {};

  A1.registerChapter = function (c) { A1.chapters[c.n] = c; };
  A1.registerSim = function (s) { A1.sims[s.id] = s; };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let instanceId = 0;

  /* Pure routing helpers shared by app.js and the dependency-free tests.
     Navigation follows the chapters that actually loaded, so one missing
     script cannot strand every later chapter. */
  A1.routeModel = Object.freeze({
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
      const index = numbers.indexOf(n);
      const target = index + direction;
      return index >= 0 && target >= 0 && target < numbers.length ? numbers[target] : null;
    },
  });

  /* Theme-aware palette for canvases (re-read on theme flips). */
  A1.pal = function () {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    return {
      bg: v("--bg"), panel: v("--panel"), panel2: v("--panel-2"),
      border: v("--border"), borderStrong: v("--border-strong"),
      text: v("--text"), soft: v("--text-soft"), muted: v("--muted"),
      accent: v("--accent"), accentText: v("--accent-text"),
      warn: v("--warn"), danger: v("--danger"),
    };
  };

  /* ---------- Playground factory ---------- */

  A1.mountSim = function (host, sim) {
    const cleanups = [];
    const onCleanup = (fn) => cleanups.push(fn);
    const idPrefix = "sim-" + (++instanceId);

    // frame
    const root = document.createElement("div");
    root.className = "playground";
    root.setAttribute("role", "region");
    root.innerHTML =
      '<div class="pg-head"><span class="pg-dot"></span><h3></h3>' +
      '<span class="pg-tag">playground</span></div>' +
      '<div class="pg-canvas-wrap"></div>' +
      '<div class="pg-controls" aria-label="Playground controls"></div>' +
      '<div class="visually-hidden pg-announcer" role="status" aria-live="polite" aria-atomic="true"></div>';
    const simHeading = root.querySelector("h3");
    simHeading.id = idPrefix + "-title";
    simHeading.textContent = sim.title;
    root.setAttribute("aria-labelledby", simHeading.id);
    host.appendChild(root);

    const canvasWrap = root.querySelector(".pg-canvas-wrap");
    const controlsEl = root.querySelector(".pg-controls");
    const resultAnnouncer = root.querySelector(".pg-announcer");
    const interactiveControls = [];
    const readouts = [];
    let announcementTimer = 0;

    function syncAssociations() {
      const outputIds = readouts.map((output) => output.id).join(" ");
      const controlIds = interactiveControls.map((control) => control.id).filter(Boolean).join(" ");
      interactiveControls.forEach((control) => {
        if (outputIds) {
          control.setAttribute("aria-controls", outputIds);
          control.setAttribute("aria-describedby", outputIds);
        }
      });
      readouts.forEach((output) => {
        if (controlIds) output.setAttribute("for", controlIds);
      });
    }

    function registerControl(control) {
      if (!control.id) control.id = idPrefix + "-control-" + (interactiveControls.length + 1);
      interactiveControls.push(control);
      syncAssociations();
    }

    function announceResultSoon() {
      window.clearTimeout(announcementTimer);
      announcementTimer = window.setTimeout(() => {
        if (destroyed) return;
        const text = readouts.map((output) => output.textContent.trim()).filter(Boolean).join(". ");
        if (!text) return;
        // Clear first so repeated outcomes can be announced after a user action.
        resultAnnouncer.textContent = "";
        requestAnimationFrame(() => { if (!destroyed) resultAnnouncer.textContent = text; });
      }, 350);
    }
    onCleanup(() => window.clearTimeout(announcementTimer));

    let visible = true;
    let destroyed = false;
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1].isIntersecting; // newest record wins
        loops.forEach((l) => l._sync());
      },
      { rootMargin: "80px" }
    );
    io.observe(root);
    onCleanup(() => io.disconnect());

    const loops = [];

    /* ---- repaint plumbing: redraw paused/static sims after control
       changes, container resizes, and theme flips ---- */
    let lastOnce = null;   // static sims pass their draw here every time
    let onceId = 0;
    let repaintQueued = false;
    function repaint() {
      if (repaintQueued || destroyed) return;
      repaintQueued = true;
      requestAnimationFrame(() => {
        repaintQueued = false;
        if (destroyed) return;
        loops.forEach((l) => { if (!l.running) l._fn(l._t, 0); });
        if (lastOnce) lastOnce();
      });
    }

    /* ---- One motion contract for header, overlay, visibility, and live
       prefers-reduced-motion changes. "auto" follows the OS; an explicit
       user choice is respected until this playground is destroyed. ---- */
    let headBtn = null;
    let playOverlay = null;
    let motionChoice = "auto"; // auto | playing | paused

    function wantsMotion() {
      if (motionChoice === "playing") return true;
      if (motionChoice === "paused") return false;
      return !reducedMotion.matches;
    }

    function syncHeadBtn() {
      if (!headBtn) return;
      const on = wantsMotion();
      headBtn.textContent = on ? "⏸" : "▶";
      headBtn.setAttribute("aria-label", on ? "Pause animation" : "Play animation");
      headBtn.title = on ? "Pause animation" : "Play animation";
    }

    function syncPlayOverlay() {
      const shouldShow = reducedMotion.matches && motionChoice === "auto" && loops.length > 0;
      if (shouldShow && !playOverlay) {
        playOverlay = document.createElement("div");
        playOverlay.className = "pg-play-overlay";
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "▶ Play animation";
        button.addEventListener("click", () => setMotionChoice("playing"));
        playOverlay.appendChild(button);
        canvasWrap.appendChild(playOverlay);
      } else if (!shouldShow && playOverlay) {
        playOverlay.remove();
        playOverlay = null;
      }
    }

    function syncMotion() {
      loops.forEach((loop) => loop._sync());
      syncHeadBtn();
      syncPlayOverlay();
    }

    function setMotionChoice(choice) {
      motionChoice = choice;
      syncMotion();
      repaint();
    }

    function ensureHeadBtn() {
      if (headBtn) return;
      headBtn = document.createElement("button");
      headBtn.type = "button";
      headBtn.className = "pg-pause";
      const headEl = root.querySelector(".pg-head");
      headEl.insertBefore(headBtn, headEl.querySelector(".pg-tag"));
      headBtn.addEventListener("click", () => {
        setMotionChoice(wantsMotion() ? "paused" : "playing");
      });
    }

    const onReducedMotionChange = () => {
      syncMotion();
      repaint();
    };
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", onReducedMotionChange);
      onCleanup(() => reducedMotion.removeEventListener("change", onReducedMotionChange));
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(onReducedMotionChange);
      onCleanup(() => reducedMotion.removeListener(onReducedMotionChange));
    }

    const api = {
      root,
      controls: controlsEl,
      reduced: () => reducedMotion.matches,
      pal: A1.pal,
      onCleanup,

      /* Canvas sized to container width at devicePixelRatio.
         draw coords are CSS px; returns {canvas, ctx, W, H, onResize}. */
      canvas(aspect) {
        aspect = aspect || 16 / 9;
        const canvas = document.createElement("canvas");
        const description = document.createElement("p");
        const canvasNumber = canvasWrap.querySelectorAll("canvas").length + 1;
        description.id = idPrefix + "-canvas-description-" + canvasNumber;
        description.className = "visually-hidden";
        description.textContent = "Interactive visualization: " + sim.title + ". Adjust the controls to explore the result.";
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", sim.title);
        canvas.setAttribute("aria-describedby", description.id);
        canvasWrap.append(canvas, description);
        const out = { canvas, ctx: canvas.getContext("2d"), W: 0, H: 0, _cbs: [] };
        out.onResize = (cb) => out._cbs.push(cb);
        out.setAria = (text) => { description.textContent = text; };
        const fit = () => {
          const w = canvasWrap.clientWidth || 640;
          const h = Math.round(w / aspect);
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
          canvas.style.height = h + "px";
          out.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          out.W = w; out.H = h;
          out._cbs.forEach((cb) => cb(w, h));
          repaint(); // a resize blanks the bitmap — redraw even when paused
        };
        const ro = new ResizeObserver(fit);
        ro.observe(canvasWrap);
        onCleanup(() => ro.disconnect());
        fit();
        return out;
      },

      /* Managed animation loop. fn(t, dt) in seconds. */
      raf(fn) {
        const loop = {
          _id: 0, _last: 0, _t: 0,
          running: false,
          _step(ts) {
            if (!loop.running) return;
            const dt = Math.min(0.05, loop._last ? (ts - loop._last) / 1000 : 0.016);
            loop._last = ts;
            loop._t += dt;
            fn(loop._t, dt);
            loop._id = requestAnimationFrame(loop._step);
          },
          _sync() {
            const should = wantsMotion() && visible && !document.hidden;
            if (should && !loop.running) {
              loop.running = true; loop._last = 0;
              loop._id = requestAnimationFrame(loop._step);
            } else if (!should && loop.running) {
              loop.running = false;
              cancelAnimationFrame(loop._id);
            }
          },
          start() { setMotionChoice("playing"); },
          stop() { setMotionChoice("paused"); },
        };
        loop._fn = fn;
        loop._step = loop._step.bind(loop);
        loops.push(loop);
        ensureHeadBtn();
        syncMotion();

        const onVis = () => loop._sync();
        document.addEventListener("visibilitychange", onVis);
        onCleanup(() => {
          motionChoice = "paused";
          loop._sync();
          document.removeEventListener("visibilitychange", onVis);
        });

        if (reducedMotion.matches) {
          // Static first frame; the shared overlay and header offer opt-in.
          fn(0, 0);
        } else {
          loop._sync();
        }
        syncMotion();
        return loop;
      },

      /* one-shot redraw helper for control-driven statics.
         Coalesces rapid calls; remembers fn as the repaint hook. */
      once(fn) {
        lastOnce = fn;
        cancelAnimationFrame(onceId);
        onceId = requestAnimationFrame(() => { if (!destroyed) fn(); });
      },

      /* ---------- controls ---------- */

      slider(opts) {
        const wrap = document.createElement("div");
        wrap.className = "pg-ctl";
        const row = document.createElement("div");
        row.className = "pg-ctl-row";
        const lab = document.createElement("label");
        lab.textContent = opts.label;
        const val = document.createElement("output");
        val.className = "val";
        const input = document.createElement("input");
        input.type = "range";
        input.min = opts.min; input.max = opts.max;
        input.step = opts.step != null ? opts.step : 1;
        input.value = opts.value;
        const id = idPrefix + "-control-" + (interactiveControls.length + 1);
        input.id = id; lab.htmlFor = id;
        val.id = id + "-value";
        val.setAttribute("for", id);
        val.setAttribute("aria-live", "off");
        const fmt = opts.format || ((v) => v + (opts.unit ? " " + opts.unit : ""));
        const paint = () => {
          const formatted = fmt(parseFloat(input.value));
          val.textContent = formatted;
          input.setAttribute("aria-valuetext", formatted);
        };
        input.addEventListener("input", () => {
          paint();
          if (opts.onInput) opts.onInput(parseFloat(input.value));
          repaint();
          announceResultSoon();
        });
        paint();
        row.appendChild(lab); row.appendChild(val);
        wrap.appendChild(row); wrap.appendChild(input);
        controlsEl.appendChild(wrap);
        registerControl(input);
        return {
          el: wrap,
          get value() { return parseFloat(input.value); },
          set(v) { input.value = v; paint(); },
        };
      },

      toggle(opts) {
        const labWrap = document.createElement("label");
        labWrap.className = "pg-switch";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = idPrefix + "-control-" + (interactiveControls.length + 1);
        input.checked = !!opts.value;
        const track = document.createElement("span");
        track.className = "track";
        const txt = document.createElement("span");
        txt.className = "sw-lbl";
        txt.textContent = opts.label;
        labWrap.appendChild(input); labWrap.appendChild(track); labWrap.appendChild(txt);
        input.addEventListener("change", () => {
          if (opts.onChange) opts.onChange(input.checked);
          repaint();
          announceResultSoon();
        });
        const cell = document.createElement("div");
        cell.className = "pg-ctl";
        cell.style.justifyContent = "center";
        cell.appendChild(labWrap);
        controlsEl.appendChild(cell);
        registerControl(input);
        return { el: cell, get value() { return input.checked; }, set(v) { input.checked = !!v; } };
      },

      select(opts) {
        const wrap = document.createElement("div");
        wrap.className = "pg-ctl";
        const lab = document.createElement("label");
        lab.textContent = opts.label;
        const sel = document.createElement("select");
        const id = idPrefix + "-control-" + (interactiveControls.length + 1);
        sel.id = id; lab.htmlFor = id;
        opts.options.forEach((o) => {
          const op = document.createElement("option");
          op.value = o.value; op.textContent = o.label;
          sel.appendChild(op);
        });
        if (opts.value != null) sel.value = opts.value;
        sel.addEventListener("change", () => {
          if (opts.onChange) opts.onChange(sel.value);
          repaint();
          announceResultSoon();
        });
        wrap.appendChild(lab); wrap.appendChild(sel);
        controlsEl.appendChild(wrap);
        registerControl(sel);
        return { el: wrap, get value() { return sel.value; }, set(v) { sel.value = v; } };
      },

      button(opts) {
        const b = document.createElement("button");
        b.type = "button";
        b.id = idPrefix + "-control-" + (interactiveControls.length + 1);
        b.className = "pg-btn-ctl";
        b.textContent = opts.label;
        b.addEventListener("click", (e) => {
          opts.onClick(e);
          repaint();
          announceResultSoon();
        });
        const cell = document.createElement("div");
        cell.className = "pg-ctl";
        cell.style.justifyContent = "center";
        cell.appendChild(b);
        controlsEl.appendChild(cell);
        registerControl(b);
        return { el: b, setLabel(t) { b.textContent = t; } };
      },

      readout(opts) {
        const r = document.createElement("output");
        r.id = idPrefix + "-result-" + (readouts.length + 1);
        r.className = "pg-readout";
        // Continuous animations may update this every frame. Keep the visible
        // semantic output quiet; user actions are announced by pg-announcer.
        r.setAttribute("aria-live", "off");
        r.setAttribute("aria-atomic", "true");
        if (opts && opts.label) r.textContent = opts.label;
        controlsEl.appendChild(r);
        readouts.push(r);
        syncAssociations();
        return {
          el: r,
          set(html) { r.innerHTML = html; },
          setText(t) { r.textContent = t; },
        };
      },
    };

    let extra = null;
    try {
      extra = sim.mount(api) || null;
    } catch (err) {
      canvasWrap.innerHTML =
        '<p style="padding:18px;color:var(--danger);font-size:14px">This playground failed to load.</p>';
      console.error("[A1 sim:" + sim.id + "]", err);
    }

    return {
      repaint, // theme flips call this — sims re-read pal() and redraw in place
      destroy() {
        destroyed = true;
        cancelAnimationFrame(onceId);
        cleanups.forEach((fn) => { try { fn(); } catch (e) { /* noop */ } });
        if (extra && typeof extra.destroy === "function") { try { extra.destroy(); } catch (e) { /* noop */ } }
        root.remove();
      },
    };
  };
})();
