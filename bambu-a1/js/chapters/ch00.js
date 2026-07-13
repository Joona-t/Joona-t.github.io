/* ch00 — Preamble: what this site is, who it's for, the A1 in one breath.
   Sim: "hero-print" — cozy side-view A1 printing a Benchy-ish boat layer by layer. */
(function () {
  "use strict";

  /* ---------------- hero-print sim ---------------- */

  A1.registerSim({
    id: "hero-print",
    title: "The A1, mid-print",
    mount(api) {
      const cv = api.canvas(16 / 9);
      cv.setAria(
        "Cartoon of a Bambu Lab A1 printing a small boat layer by layer: " +
        "the heated bed slides side to side while the toolhead lays a bright " +
        "green filament bead and the part grows upward."
      );

      const N = 48; // total layers
      let speed = 1;
      let li = 0;       // current layer index
      let prog = 0;     // progress within current layer, 0..1
      let done = false;
      let doneT = 0;
      let lastT = 0;

      // Reduced motion: first (static) frame shows a half-built part mid-print.
      if (api.reduced()) { li = Math.floor(N * 0.55); prog = 0.5; }

      // Benchy-ish silhouette: for layer fraction f (0..1), horizontal span in
      // part-half-width units. Bow points right, chimney at the stern (left).
      function spanFor(f) {
        if (f < 0.38) {               // hull, flaring upward, bow curves out
          const t = f / 0.38;
          return [-(0.62 + 0.3 * t), 0.55 + 0.45 * Math.sqrt(t)];
        }
        if (f < 0.46) return [-0.92, 0.98];          // deck
        if (f < 0.66) return [-0.72, 0.1];           // cabin
        if (f < 0.76) {                              // roof, tapering
          const t = (f - 0.66) / 0.10;
          return [-0.68 + 0.22 * t, 0.06 - 0.18 * t];
        }
        return [-0.5, -0.28];                        // chimney
      }

      const sl = api.slider({
        label: "Print speed", min: 0.5, max: 3, step: 0.1, value: 1, unit: "×",
        onInput: (v) => { speed = v; },
      });
      speed = sl.value;
      api.button({ label: "⟲ Restart print", onClick: () => {
        li = 0; prog = 0; done = false; doneT = 0;
        frame(lastT, 0); // repaint even when the loop is paused
      }});
      const ro = api.readout({ label: "layer 1 / " + N });

      function update(dt) {
        if (done) {
          doneT += dt;
          if (doneT > 2.4) { li = 0; prog = 0; done = false; }
          return;
        }
        const hw = Math.min(cv.W * 0.13, 92);
        const sp = spanFor(li / (N - 1));
        const spanW = Math.max(30, (sp[1] - sp[0]) * hw);
        prog += (240 * speed * dt) / spanW;
        while (prog >= 1) {
          prog -= 1; li += 1;
          if (li >= N) { li = N; done = true; doneT = 0; prog = 0; break; }
        }
      }

      function draw(t) {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);

        // geometry
        const cx = W * 0.5;
        const hw = Math.min(W * 0.13, 92);
        const ph = H * 0.42;
        const layerH = ph / N;
        const baseH = Math.max(16, H * 0.055);
        const baseY = H - baseH - 6;
        const bedH = 10, bedW = hw * 2.7;
        const bedTop = baseY - 4 - bedH;
        const shimmy = done ? 0 : Math.sin(t * 2.4) * 3;
        const colL = W * 0.12, colR = W * 0.88, colW = 10;
        const colTop = H * 0.07;

        // spool (top right) + frame columns + top bar
        const spX = W * 0.8, spY = H * 0.15;
        ctx.strokeStyle = p.border; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(spX, spY, 13, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = p.accent;
        ctx.beginPath(); ctx.arc(spX, spY, 3, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1;
        ctx.fillRect(colL - colW / 2, colTop, colW, baseY - colTop);
        ctx.strokeRect(colL - colW / 2, colTop, colW, baseY - colTop);
        ctx.fillRect(colR - colW / 2, colTop, colW, baseY - colTop);
        ctx.strokeRect(colR - colW / 2, colTop, colW, baseY - colTop);
        ctx.fillRect(colL - colW / 2, colTop, colR - colL + colW, 8);
        ctx.strokeRect(colL - colW / 2, colTop, colR - colL + colW, 8);

        // nozzle tip height tracks the current layer
        const layersUp = done ? N : Math.min(li, N - 1) + 1;
        const tipY = bedTop - layersUp * layerH;
        const beamY = Math.max(colTop + 14, tipY - 34);

        // toolhead X position
        let headX;
        if (done) {
          headX = colR - 34;
        } else {
          const sp = spanFor(li / (N - 1));
          const x0 = cx + sp[0] * hw, x1 = cx + sp[1] * hw;
          const from = li % 2 === 0 ? x0 : x1;
          const to = li % 2 === 0 ? x1 : x0;
          headX = from + (to - from) * prog + shimmy;
        }

        // X beam
        ctx.fillStyle = p.panel2;
        ctx.fillRect(colL, beamY, colR - colL, 8);
        ctx.strokeRect(colL, beamY, colR - colL, 8);

        // filament from spool to carriage
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(spX, spY + 13);
        ctx.bezierCurveTo(spX, spY + 60, headX + 30, beamY - 46, headX, beamY - 4);
        ctx.stroke();
        ctx.restore();

        // base + Y rail + touchscreen
        ctx.fillStyle = p.panel;
        ctx.fillRect(W * 0.08, baseY, W * 0.84, baseH);
        ctx.strokeRect(W * 0.08, baseY, W * 0.84, baseH);
        ctx.fillStyle = p.border;
        ctx.fillRect(cx - bedW / 2 - 26, baseY - 4, bedW + 52, 4);
        ctx.fillStyle = p.panel2;
        ctx.fillRect(W * 0.73, baseY + 3, 22, Math.max(10, baseH - 8));
        ctx.fillStyle = p.accent;
        ctx.beginPath(); ctx.arc(W * 0.73 + 11, baseY + 3 + Math.max(10, baseH - 8) / 2, 2, 0, Math.PI * 2); ctx.fill();

        // heated bed (slides on Y — shimmy + motion dashes)
        const bedX = cx - bedW / 2 + shimmy;
        ctx.fillStyle = p.panel2;
        ctx.fillRect(bedX, bedTop, bedW, bedH);
        ctx.strokeRect(bedX, bedTop, bedW, bedH);
        ctx.fillStyle = p.accent;
        ctx.save(); ctx.globalAlpha = 0.35;
        ctx.fillRect(bedX, bedTop, bedW, 2);
        ctx.restore();
        if (!done) {
          const pulse = 0.35 + 0.5 * Math.abs(Math.cos(t * 2.4));
          ctx.save(); ctx.strokeStyle = p.muted; ctx.lineWidth = 2;
          for (let k = 0; k < 3; k++) {
            ctx.globalAlpha = pulse * (0.5 - k * 0.14);
            ctx.beginPath();
            ctx.moveTo(bedX - 10 - k * 9, bedTop + bedH / 2);
            ctx.lineTo(bedX - 4 - k * 9, bedTop + bedH / 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        // ghost of layers still to come
        ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = p.text;
        for (let j = li; j < N; j++) {
          const s = spanFor(j / (N - 1));
          ctx.fillRect(cx + s[0] * hw + shimmy, bedTop - (j + 1) * layerH, (s[1] - s[0]) * hw, layerH);
        }
        ctx.restore();

        // printed layers (cooled)
        ctx.fillStyle = p.accent;
        for (let j = 0; j < Math.min(li, N); j++) {
          const s = spanFor(j / (N - 1));
          ctx.save(); ctx.globalAlpha = j % 2 === 0 ? 0.55 : 0.66;
          ctx.fillRect(cx + s[0] * hw + shimmy, bedTop - (j + 1) * layerH, (s[1] - s[0]) * hw, layerH + 0.5);
          ctx.restore();
        }

        // current layer: fresh bright bead behind the nozzle
        if (!done && li < N) {
          const s = spanFor(li / (N - 1));
          const x0 = cx + s[0] * hw + shimmy, x1 = cx + s[1] * hw + shimmy;
          const a = li % 2 === 0 ? x0 : headX;
          const b = li % 2 === 0 ? headX : x1;
          ctx.save();
          ctx.shadowColor = p.accent; ctx.shadowBlur = 8;
          ctx.fillStyle = p.accent;
          ctx.fillRect(Math.min(a, b), tipY, Math.max(2, Math.abs(b - a)), layerH + 0.5);
          ctx.restore();
        }

        // toolhead: carriage, heat block, nozzle cone, melt dot
        ctx.fillStyle = p.panel2; ctx.strokeStyle = p.borderStrong;
        ctx.fillRect(headX - 16, beamY - 6, 32, 18);
        ctx.strokeRect(headX - 16, beamY - 6, 32, 18);
        ctx.fillStyle = p.border;
        ctx.fillRect(headX - 8, beamY + 12, 16, 9);
        ctx.fillStyle = p.soft;
        ctx.beginPath();
        ctx.moveTo(headX - 5, beamY + 21);
        ctx.lineTo(headX + 5, beamY + 21);
        ctx.lineTo(headX, tipY - 1);
        ctx.closePath(); ctx.fill();
        if (!done) {
          ctx.save();
          ctx.shadowColor = p.accent; ctx.shadowBlur = 10;
          ctx.fillStyle = p.accent;
          ctx.beginPath(); ctx.arc(headX, tipY, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }

        // labels
        ctx.font = "12px system-ui, sans-serif"; ctx.textBaseline = "middle";
        ctx.fillStyle = p.muted;
        ctx.textAlign = "left";
        ctx.fillText("toolhead — X axis", colL + 8, beamY - 10);
        ctx.fillText("heated bed — slides on Y", W * 0.08 + 4, baseY + baseH / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = p.soft;
        ctx.fillText("layer " + Math.min(li + 1, N) + " / " + N, W - 10, 16);
        if (done) {
          ctx.textAlign = "center"; ctx.fillStyle = p.accentText;
          ctx.font = "13px system-ui, sans-serif";
          ctx.fillText("print complete ✓", cx, H * 0.1);
        }
        ctx.textAlign = "left";

        ro.setText(done ? "layer " + N + " / " + N + " — complete" : "layer " + Math.min(li + 1, N) + " / " + N);
      }

      function frame(t, dt) { lastT = t; update(dt); draw(t); }
      cv.onResize(() => frame(lastT, 0));
      api.raf(frame);
    },
  });

  /* ---------------- chapter ---------------- */

  A1.registerChapter({
    n: 0,
    tier: "Beginner",
    title: "Preamble",
    claims: ["FW-004", "FW-007", "QNT-007", "QNT-008", "QNT-010", "QNT-012", "SAF-002"],
    html:
      "<h3>What this is</h3>" +
      "<p>This is an interactive guide to how one specific, wildly popular 3D printer actually works. " +
      "Not printers in general — one machine, the Bambu Lab A1, taken apart subsystem by subsystem " +
      "until nothing about it feels like magic.</p>" +
      "<p>It's written for two readers at once. If you've never touched a 3D printer, start here; key " +
      "specialist terms are introduced as we go. If you already own an A1 and want to genuinely master it — " +
      "to know what the printer is doing during those minutes of pre-print wiggling, and why — the later " +
      "tiers go deep without hand-waving.</p>" +
      '<div class="note"><strong>Objective.</strong> By the end of this preamble, you should be able to ' +
      "name the A1's three moving axes, choose a safe place to run it, and know which jobs still require " +
      "your attention rather than automation.</div>" +
      "<h3>Before the first print: make the space safe</h3>" +
      '<div class="warn"><strong>This guide is not the setup manual.</strong> Follow the ' +
      '<a href="https://cdn1.bambulab.com/documentation/quick-start-a75adcb1d5d5e/Quick%20Start%20Guide%20for%20A1.pdf" target="_blank" rel="noopener">official A1 Quick Start Guide</a> ' +
      "to remove every shipping restraint and complete setup. Put the printer on a stable surface with " +
      "clearance for the bed's full front-to-back travel; keep hands, hair, cables, children and pets out " +
      "of that swept area. The nozzle can reach 300&nbsp;°C and the bed 100&nbsp;°C. Follow Bambu's " +
      '<a href="https://wiki.bambulab.com/en/a1/maintenance/basic-maintenance" target="_blank" rel="noopener">current maintenance procedure</a>. ' +
      "If that procedure explicitly requires power or heat for a named step, complete only that step " +
      "as directed. Then switch off and unplug before service, and let hotend parts cool below " +
      "60&nbsp;°C before routine handling. " +
      "Use ventilation appropriate to the filament and never leave an unfamiliar first layer unattended.</div>" +
      '<div class="note"><strong>Predict → observe → interpret.</strong> Before moving the speed ' +
      "control, predict what will change. Observe the layer counter, toolhead and bed, then explain " +
      "why this animation multiplier changes elapsed time but does not claim a safe printer setting.</div>" +
      '<div data-sim="hero-print"></div>' +
      "<h3>How to use this site</h3>" +
      "<p>There are 12 chapters in three tiers: <code>Beginner</code> (what the machine is and how it moves), " +
      "<code>Intermediate</code> (the sensors, calibration, and multi-color tricks that make it feel automatic), " +
      "and <code>Advanced</code> (slicing internals, the full print pipeline, materials, and maintenance). " +
      "The sidebar tracks where you are, and your keyboard's arrow keys flip between chapters.</p>" +
      "<p>Every chapter has at least one playground like the one above — a small hands-on simulation. " +
      "Drag the sliders. The fastest way to build intuition for a machine is to poke at it in a sandbox " +
      "where breaking things is free.</p>" +
      '<div class="facts">' +
      '<div class="fact"><div class="v">256³ mm</div><div class="k">build volume</div></div>' +
      '<div class="fact"><div class="v">500 mm/s</div><div class="k">max toolhead speed</div></div>' +
      '<div class="fact"><div class="v">300 °C</div><div class="k">all-metal hotend</div></div>' +
      '<div class="fact"><div class="v">100 °C</div><div class="k">textured <dfn title="polyetherimide, a heat-resistant bed-surface polymer">PEI</dfn> bed</div></div>' +
      '<div class="fact"><div class="v">≤48 dB</div><div class="k">claimed in Silent mode</div></div>' +
      '<div class="fact"><div class="v">4 spools</div><div class="k">AMS lite multi-color</div></div>' +
      "</div>" +
      "<h3>The A1 in one breath</h3>" +
      "<p>The A1 is an open-frame <code>bed-slinger</code>: the heated bed carries your part back " +
      "and forth on one axis while the toolhead sweeps left–right above it, and the whole gantry climbs " +
      "as the layers stack. It prints a 256 mm cube, moves its toolhead at up to 500 mm/s, melts filament " +
      "at up to 300 °C, and heats its build plate to 100 °C.</p>" +
      "<p>What made it a phenomenon isn't any of those numbers. It's that Bambu replaced the hobby's " +
      "traditional ritual of manual tuning — paper under the nozzle, test cubes, squinting at ripples in " +
      "walls — with sensors and guided automatic calibration routines: the nozzle itself taps the bed to map its surface, " +
      "accelerometers measure how the frame shakes so the firmware can reduce ringing, and an " +
      "eddy-current extrusion-force sensor helps calibrate plastic flow. A result created in the dedicated " +
      "Calibration workflow can be saved and assigned to a filament slot or profile; the pre-print " +
      "send-dialog result is temporary. Neither result is a live pressure reading carried " +
      "inside an RFID spool. Chapters 4, 5 and 6 cover the boundaries of each system.</p>" +
      '<div class="note"><strong>Honest scoping.</strong> The A1 is Bambu’s entry-level machine, and this ' +
      "guide never pretends otherwise. It has no lidar first-layer inspection and no enclosed chamber. " +
      "Optional firmware sensor-based nozzle-clump detection can pause some failures, but Bambu says it " +
      "is not failproof; it does not replace watching the first layer. Its open frame is best matched to " +
      "materials such as PLA, PETG and suitable TPU profiles, while Bambu marks higher-shrink engineering " +
      "materials as not recommended. See the " +
      '<a href="https://wiki.bambulab.com/en/a1-mini/manual/nozzle-warp-detection" target="_blank" rel="noopener">official clump-detection limits</a>.</div>' +
      "<h3>Where we're going</h3>" +
      "<p>The arc of the twelve chapters follows the machine's own logic: first how it <strong>moves</strong> " +
      "(motors, belts, and rails), then how it <strong>melts</strong> (the hotend and extruder), then how it " +
      "<strong>calibrates</strong> itself (the sensor suite above), then how one nozzle prints four colors " +
      "(the AMS lite), then how a model on your screen becomes motion commands (<strong>slicing</strong>), and " +
      "finally the full journey of a real <strong>print</strong> — from tapping the touchscreen to popping " +
      "the part off the plate — plus the materials knowledge and maintenance habits that separate owners " +
      "from <strong>masters</strong>.</p>" +
      '<div class="note"><strong>Transfer check.</strong> Before continuing, point out the bed’s swept ' +
      "area in the animation and name two things that must stay outside it. Then identify the two hot " +
      "surfaces you must let cool before touching.</div>" +
      "<p>Move, melt, calibrate, multi-color, slice, print, master. Arrow-key to the right when you're ready.</p>" +
      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://bambulab.com/en/a1/tech-specs" target="_blank" rel="noopener">Official A1 tech specs</a>' +
      '<a href="https://wiki.bambulab.com/en/a1/manual/intro-a1" target="_blank" rel="noopener">Bambu wiki: A1 introduction</a>' +
      '<a href="https://3dpros.com/printers/bambu-lab-a1" target="_blank" rel="noopener">3DPros: A1 spec deep-dive</a>' +
      "</div>",
  });
})();
