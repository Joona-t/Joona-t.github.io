/* ch05 — Vibration compensation (ringing, resonance sweep, input shaping) */
(function () {
  "use strict";

  /* ============================================================
     Sim: "ringing" — a wall printed after a sharp corner.
     Resonance frequency controls ripple spacing and sweep timing;
     a separate qualitative excitation control changes display
     amplitude. Button runs an animated resonance sweep.
     ============================================================ */
  A1.registerSim({
    id: "ringing",
    title: "Ringing & input shaping",
    mount(api) {
      const cv = api.canvas(16 / 9);
      const SWEEP_T = 3.2; // s, animated sweep duration
      const HOLD_T = 1.8;  // s, hold on the detected peak
      const VISUAL_SHAPING_RESIDUAL = 0.10; // invented display contrast, not A1 performance
      const WALL_SPEED = 200; // mm/s, fixed illustration used only for ripple spacing
      const DECAY_MM = 32;    // invented fixed display decay; frequency does not alter amplitude

      const state = {
        excitation: 1, // normalized visual amplitude control
        freq: 40,      // Hz (selected example resonance)
        shaping: false,
        mode: "print", // "print" | "sweep"
        modeT: 0,
        t: 0,
      };

      /* Frequency changes spatial/temporal spacing only. Display amplitude is
         controlled independently; the shaping residual is explicitly invented. */
      function visualAmplitudeScale() {
        return state.excitation * (state.shaping ? VISUAL_SHAPING_RESIDUAL : 1);
      }

      /* ---------- controls ---------- */
      api.slider({
        label: "Corner excitation (illustrative)", min: 0.25, max: 1.5, step: 0.05, value: 1,
        format: function (v) { return Math.round(v * 100) + "%"; },
        onInput: function (v) { state.excitation = v; refresh(); },
      });
      api.slider({
        label: "Resonant frequency", min: 20, max: 60, step: 1, value: 40, unit: "Hz",
        onInput: function (v) { state.freq = v; refresh(); },
      });
      api.toggle({
        label: "Input shaping", value: false,
        onChange: function (on) { state.shaping = on; refresh(); },
      });
      api.button({ label: "Run illustrative resonance sweep", onClick: startSweep });
      const ro = api.readout({ label: "" });

      /* ---------- drawing ---------- */
      function draw(t) {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);
        if (state.mode === "sweep") drawSweep(t, p);
        else drawPrint(t, p);
      }

      function drawPrint(t, p) {
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        const bedY = H - 34;
        const xL = W * 0.16, xR = W * 0.90;
        const topY = H * 0.30;
        const pxPerMm = (xR - xL) / 130; // wall ≈ 130 mm long
        const vMm = WALL_SPEED;
        const decayMm = DECAY_MM;
        const ampPx = Math.min(H * 0.06, visualAmplitudeScale() * H * 0.035);

        // bed
        ctx.fillStyle = p.panel;
        ctx.fillRect(W * 0.08, bedY, W * 0.84, 10);
        ctx.strokeStyle = p.borderStrong;
        ctx.strokeRect(W * 0.08, bedY, W * 0.84, 10);
        ctx.fillStyle = p.muted;
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText("textured PEI bed", W * 0.08 + 4, H - 10);

        // wall body
        ctx.fillStyle = p.panel2;
        ctx.fillRect(xL, topY, xR - xL, bedY - topY);
        ctx.strokeStyle = p.border;
        ctx.strokeRect(xL, topY, xR - xL, bedY - topY);

        // ghosting bands: decaying sinusoid from the corner
        for (let x = xL + 2; x < xR - 2; x += 2) {
          const dxMm = (x - xL) / pxPerMm;
          const s = Math.sin(2 * Math.PI * dxMm * state.freq / vMm) * Math.exp(-dxMm / decayMm);
          const a = Math.min(0.55, Math.abs(s) * (ampPx / (H * 0.06)) * 0.55);
          if (a < 0.015) continue;
          ctx.globalAlpha = a;
          ctx.fillStyle = s > 0 ? p.accent : "#000"; // deliberate shadow tint for troughs
          ctx.fillRect(x - 1, topY + 2, 2, bedY - topY - 4);
        }
        ctx.globalAlpha = 1;

        // corner + direction labels
        ctx.fillStyle = p.soft;
        ctx.font = "11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("sharp corner", xL, topY - 26);
        ctx.fillText("↓", xL, topY - 12);
        ctx.fillStyle = p.muted;
        ctx.fillText("print direction →", W * 0.42, topY - 24);
        if (!state.shaping && ampPx > 3) {
          ctx.fillStyle = p.text;
          ctx.globalAlpha = 0.8;
          ctx.fillText("ghosting: echoes of the corner", xL + (xR - xL) * 0.32, bedY - 10);
          ctx.globalAlpha = 1;
        }
        ctx.textAlign = "left";

        // current top layer bead (wiggle = the vibration being printed in)
        const span = xR - xL;
        const u = ((t * 0.22) + 0.45) % 1.25;
        const printing = u < 1;
        const nx = printing ? xL + u * span : xR - ((u - 1) / 0.25) * span;
        const endX = printing ? nx : xR;
        ctx.strokeStyle = p.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = xL; x <= endX; x += 2) {
          const dxMm = (x - xL) / pxPerMm;
          const s = Math.sin(2 * Math.PI * dxMm * state.freq / vMm) * Math.exp(-dxMm / decayMm);
          const y = topY - 2 + s * ampPx * 0.6;
          if (x === xL) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.lineWidth = 1;

        // nozzle (wobbles hardest right after the corner)
        const dxMmN = Math.max(0, (nx - xL) / pxPerMm);
        const wob = printing
          ? Math.exp(-dxMmN / decayMm) * Math.sin(2 * Math.PI * state.freq * 0.15 * t) * ampPx * 0.5
          : 0;
        const ny = topY - 4 + wob;
        ctx.fillStyle = p.soft;
        ctx.fillRect(nx - 8, ny - 26, 16, 14);
        ctx.fillStyle = p.accent;
        ctx.beginPath();
        ctx.moveTo(nx - 6, ny - 12);
        ctx.lineTo(nx + 6, ny - 12);
        ctx.lineTo(nx, ny);
        ctx.closePath();
        ctx.fill();

        if (state.shaping) drawInset(p);
      }

      /* Inset: the planner splits one impulse into two half-impulses,
         half a period apart — the induced waves destructively cancel. */
      function drawInset(p) {
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        const iw = W * 0.40, ih = H * 0.36, ix = W - iw - 10, iy = 8;
        ctx.fillStyle = p.panel;
        ctx.fillRect(ix, iy, iw, ih);
        ctx.strokeStyle = p.borderStrong;
        ctx.strokeRect(ix, iy, iw, ih);
        ctx.fillStyle = p.soft;
        ctx.font = "11px system-ui, sans-serif";
        ctx.fillText("inside the planner: split the impulse", ix + 8, iy + 15);

        const px0 = ix + 18, px1 = ix + iw - 12;
        const yb = iy + ih * 0.66;
        const lam = (px1 - px0) / 3.1;
        const shift = lam / 2;
        const A = ih * 0.28;
        const dec = lam * 2.4;

        ctx.strokeStyle = p.border;
        ctx.beginPath(); ctx.moveTo(px0 - 8, yb); ctx.lineTo(px1, yb); ctx.stroke();

        // two half-impulses
        ctx.strokeStyle = p.accent;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px0, yb); ctx.lineTo(px0, yb - A); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px0 + shift, yb); ctx.lineTo(px0 + shift, yb - A); ctx.stroke();
        ctx.lineWidth = 1;

        // half-period marker
        ctx.strokeStyle = p.muted;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(px0, yb - A - 6); ctx.lineTo(px0 + shift, yb - A - 6); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = p.muted;
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText("½ period", px0 + shift / 2 - 18, yb - A - 10);

        // each impulse starts a decaying wave; their sum cancels
        function wavePath(from, color) {
          ctx.strokeStyle = color;
          ctx.beginPath();
          let started = false;
          for (let x = from; x <= px1; x += 2) {
            const v = 0.5 * Math.sin(2 * Math.PI * (x - from) / lam) * Math.exp(-(x - from) / dec);
            const y = yb - v * 2 * A;
            if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 0.45;
        wavePath(px0, p.warn);
        wavePath(px0 + shift, p.accent);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = p.text;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = px0; x <= px1; x += 2) {
          const v1 = 0.5 * Math.sin(2 * Math.PI * (x - px0) / lam) * Math.exp(-(x - px0) / dec);
          const v2 = x >= px0 + shift
            ? 0.5 * Math.sin(2 * Math.PI * (x - px0 - shift) / lam) * Math.exp(-(x - px0 - shift) / dec)
            : 0;
          const y = yb - (v1 + v2) * 2 * A;
          if (x === px0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.lineWidth = 1;

        ctx.fillStyle = p.soft;
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText("two half-moves, ½ period apart — the waves cancel", ix + 8, iy + ih - 8);
      }

      /* Sweep: the printer hums the motors through 10–70 Hz, the
         accelerometers record the response, the peak is the resonance. */
      function drawSweep(t, p) {
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        const prog = Math.min(1, state.modeT / SWEEP_T);
        const f0 = state.freq;
        const visualHalfWidthHz = 5; // invented, fixed so the control only shifts peak timing/location
        const mx = 48, mt = 40, mbot = 48;
        const pw = W - mx - 20, ph = H - mt - mbot;

        ctx.fillStyle = p.soft;
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText("resonance sweep — the printer measures itself", mx, 20);

        // axes
        ctx.strokeStyle = p.border;
        ctx.beginPath();
        ctx.moveTo(mx, mt); ctx.lineTo(mx, mt + ph); ctx.lineTo(mx + pw, mt + ph);
        ctx.stroke();
        ctx.fillStyle = p.muted;
        ctx.font = "11px system-ui, sans-serif";
        for (let f = 10; f <= 70; f += 10) {
          const x = mx + ((f - 10) / 60) * pw;
          ctx.fillText(String(f), x - 6, mt + ph + 16);
          ctx.strokeStyle = p.border;
          ctx.beginPath(); ctx.moveTo(x, mt + ph); ctx.lineTo(x, mt + ph + 4); ctx.stroke();
        }
        ctx.fillText("Hz", mx + pw - 6, mt + ph + 32);
        ctx.fillText("measured vibration", mx + 8, mt + 14);

        const R = function (f) {
          const x = (f - f0) / visualHalfWidthHz;
          return 1 / (1 + x * x);
        };
        const fCur = 10 + 60 * prog;

        // response trace so far
        ctx.strokeStyle = p.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let f = 10; f <= fCur; f += 0.4) {
          const x = mx + ((f - 10) / 60) * pw;
          const y = mt + ph - R(f) * (ph - 14);
          if (f === 10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.lineWidth = 1;

        if (prog < 1) {
          const x = mx + ((fCur - 10) / 60) * pw;
          ctx.strokeStyle = p.soft;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(x, mt); ctx.lineTo(x, mt + ph); ctx.stroke();
          ctx.setLineDash([]);
          // shaking toolhead glyph — jitter grows near resonance
          const jit = R(fCur) * 7 * Math.sin(t * 34);
          ctx.fillStyle = p.soft;
          ctx.fillRect(x - 7 + jit, mt + ph - 26, 14, 12);
          ctx.fillStyle = p.accent;
          ctx.beginPath();
          ctx.moveTo(x - 5 + jit, mt + ph - 14);
          ctx.lineTo(x + 5 + jit, mt + ph - 14);
          ctx.lineTo(x + jit, mt + ph - 6);
          ctx.closePath();
          ctx.fill();
        } else {
          const xd = mx + ((f0 - 10) / 60) * pw;
          ctx.strokeStyle = p.warn;
          ctx.setLineDash([5, 4]);
          ctx.beginPath(); ctx.moveTo(xd, mt); ctx.lineTo(xd, mt + ph); ctx.stroke();
          ctx.setLineDash([]);
          const lx = Math.min(xd + 8, mx + pw - 170);
          ctx.fillStyle = p.warn;
          ctx.font = "12px system-ui, sans-serif";
          ctx.fillText("resonance ≈ " + f0 + " Hz", lx, mt + 18);
          ctx.fillStyle = p.soft;
          ctx.font = "11px system-ui, sans-serif";
          ctx.fillText("example shaper timing follows this peak", lx, mt + 34);
        }
      }

      /* ---------- state & loop ---------- */
      let loop = null;

      function refresh() {
        const spacing = WALL_SPEED / state.freq;
        let txt = "example ripple spacing ≈ " + spacing.toFixed(1) +
          " mm at the fixed 200 mm/s display speed · illustrative excitation " +
          Math.round(state.excitation * 100) + "% · input shaping " +
          (state.shaping ? "ON" : "OFF");
        if (state.shaping) txt += " · display applies an invented 90% amplitude reduction";
        ro.setText(txt);
        cv.setAria(
          "Side view of an illustrative wall after a sharp corner. Selected resonance " +
          state.freq + " hertz changes ripple spacing to about " + spacing.toFixed(1) +
          " millimeters at the fixed display speed; it does not change amplitude. " +
          "Independent visual excitation is " + Math.round(state.excitation * 100) + " percent. " +
          (state.shaping
            ? "Input shaping is on; the cartoon uses an invented 90 percent amplitude reduction, not a measured A1 result."
            : "Input shaping is off; ripples fade using an invented fixed decay length.")
        );
        if (!loop || !loop.running) api.once(function () { draw(state.t); });
      }

      function startSweep() {
        state.mode = "sweep";
        state.modeT = 0;
        cv.setAria(
          "Illustrative resonance sweep from 10 to 70 hertz. The selected example response " +
          "peaks near " + state.freq + " hertz; the chart is not measured A1 data."
        );
        if (!loop || !loop.running) {
          // reduced motion / paused: render the finished sweep once, then rearm print mode
          state.modeT = SWEEP_T + 0.01;
          ro.setText("illustrative response peak marked near " + state.freq + " Hz");
          api.once(function () { draw(state.t); state.mode = "print"; refresh(); });
        } else {
          ro.setText("sweeping…");
        }
      }

      function frame(t, dt) {
        state.t = t;
        if (state.mode === "sweep") {
          state.modeT += dt;
          if (state.modeT <= SWEEP_T) {
            const fCur = 10 + 60 * Math.min(1, state.modeT / SWEEP_T);
            ro.setText("sweeping… " + fCur.toFixed(0) + " Hz");
          } else if (state.modeT <= SWEEP_T + HOLD_T) {
            ro.setText("illustrative response peak marked near " + state.freq + " Hz");
          } else {
            state.mode = "print";
            refresh();
          }
        }
        draw(t);
      }

      loop = api.raf(frame);
      refresh();
    },
  });

  /* ============================================================
     Chapter 5 — Vibration compensation
     Grounded in research.md §2 (motion/kinematics), §4
     (auto-calibration: accelerometers + sweep), §8 (input-shaping
     trade-offs, defaults).
     ============================================================ */
  A1.registerChapter({
    n: 5,
    tier: "Intermediate",
    title: "Vibration compensation",
    claims: ["QNT-010"],
    html:
      "<div class='note'><strong>Objective.</strong> Recognize ringing, separate it from layer " +
      "shifts or extrusion defects, and explain why a measured resonance profile lets input shaping " +
      "reduce—not physically remove—the machine's vibration.</div>" +
      "<h3 id=\"diagnose-ringing\">The ghost in the wall</h3>" +
      "<p>Print a wall fast on any 3D printer and look closely just past a sharp corner: you may see faint, evenly spaced ripples that fade with distance. The defect is called <code>ringing</code> — or ghosting, because every crisp edge seems to echo copies of itself down the wall.</p>" +
      "<p>Rapid starts, stops and direction changes can excite flexible parts of the printer. The A1's " +
      "moving bed adds Y-axis mass, while belts, frame, support surface, control commands and the model " +
      "all influence the response. Mechanically, the system has resonant modes: after an excitation it " +
      "can oscillate at a <code>resonant frequency</code> while the motion decays. If the nozzle keeps " +
      "printing during that response, the vibration can be written into the wall as repeated ripples.</p>" +
      "<p>At roughly constant wall speed, the spacing gives the physics away: ripple wavelength is print speed divided by resonant frequency. Ringing is often strongest just after a sharp direction change and fades as the vibration decays.</p>" +
      "<div class='facts'>" +
      "<div class='fact'><div class='v'>10,000 mm/s²</div><div class='k'>published A1 acceleration rating</div></div>" +
      "<div class='fact'><div class='v'>12,000 mm/s²</div><div class='k'>Studio v2.7.1.62 X/Y/extruding limits</div></div>" +
      "<div class='fact'><div class='v'>20,000 mm/s²</div><div class='k'>CoreXY P1/X1, for contrast</div></div>" +
      "<div class='fact'><div class='v'>2</div><div class='k'>accelerometers: toolhead (X) + heatbed (Y)</div></div>" +
      "<div class='fact'><div class='v'>500 mm/s</div><div class='k'>max speed — same as selected P1/X1 examples</div></div>" +
      "</div>" +
      "<h3>The old fix — and the measured one</h3>" +
      "<p>The classic mitigation is to reduce the excitation—for example by lowering acceleration in " +
      "an appropriate test—and compare the result. The A1's published 500 mm/s top speed matches the " +
      "selected P1/X1 examples while its product-page acceleration rating is half theirs. The official " +
      '<a href="https://github.com/bambulab/BambuStudio/blob/v02.07.01.62/resources/profiles/BBL/machine/Bambu%20Lab%20A1%200.4%20nozzle.json" target="_blank" rel="noopener">stable Bambu Studio v2.7.1.62 A1 profile</a> ' +
      "separately encodes 12,000 mm/s² X, Y and extruding machine limits. Neither reference is an " +
      "ordinary setting or a guarantee of sustainable clean motion. Moving bed mass is one relevant " +
      "difference, not enough by itself to prove the complete reason for any rating or profile limit.</p>" +
      "<p>The A1 reduces the artifact by measuring itself first. Two accelerometers ride the machine: one in the toolhead for the X axis, and one under the heatbed for Y — the axis that carries the most mass. At first boot, or on demand from calibration, the printer runs a <code>resonance sweep</code>: the motors hum through a range of frequencies while the accelerometers record how hard the machine actually shakes at each one. That buzzing crescendo you hear during calibration — the “shake dance” — is the sweep. The firmware uses the measured response to tune motion compensation for this machine in its current mechanical setup.</p>" +
      "<div class='note'><strong>Simulation assumptions.</strong> The controls show direction of effect, " +
      "not predicted millimetres of surface error. Resonance frequency changes only ripple spacing, " +
      "oscillation timing and the sweep-peak location; the separate excitation control changes visual " +
      "amplitude. The fixed decay length is invented, and turning shaping on applies an invented 90% " +
      "display reduction solely to make the contrast legible. The sweep curve also uses an invented " +
      "fixed-width peak; changing frequency only moves that peak. None of these display choices is " +
      "measured A1 performance. Real response depends on belts, model geometry, table, axis and firmware.</div>" +
      "<div class='note'><strong>Predict → observe → interpret.</strong> Hold excitation fixed and " +
      "predict what a higher frequency changes. Observe spacing—not amplitude—then toggle shaping and " +
      "interpret its dramatic reduction as an invented visual contrast, not an efficacy measurement.</div>" +
      "<div data-sim='ringing'></div>" +
      "<h3>Input shaping: cancel the wave, don't fight it</h3>" +
      "<p>Knowing the frequency, the motion planner applies <code>input shaping</code>. Instead of sending one sharp command, a shaper distributes the command in time. The simplest teaching example uses two half-strength impulses separated by half a vibration period, so their induced waves oppose one another. Real firmware may choose a more complex shaper. The goal is reduced ringing, with trade-offs such as a less abrupt motion response—not a promise of a perfectly smooth wall.</p>" +
      "<p>This is also why the calibration is specific to the machine's mechanical state. Belt tension, service work and support surface can change the measured response. After moving or servicing the printer, re-run calibration if Bambu's setup flow requests it or if ringing appears; do not assume a move always changes resonance by a predictable amount.</p>" +
      "<div class='warn'><strong>Not magic rigidity.</strong> Input shaping reduces modeled vibration; " +
      "it stiffens nothing. Loose belts, a wobbly table, or changed mechanics can still print ripples " +
      "and should be corrected rather than hidden. Bed leveling can be selected as a pre-print action, " +
      "while vibration compensation is normally run during setup or on demand. Leveling and flow " +
      "calibration have different triggers and are covered separately.</div>" +
      "<div class='note'><strong>Transfer check.</strong> If regularly spaced echoes begin just after " +
      "each sharp corner, name the likely artifact and one safe diagnostic. If the entire layer jumps " +
      "sideways instead, explain why input shaping is not the first fix.</div>" +
      "<div class='go-deeper'><div class='gd-title'>Go deeper</div>" +
      "<a href='https://wiki.bambulab.com/en/general/printer-calibration' target='_blank' rel='noopener'>Bambu Wiki: printer calibration</a>" +
      "<a href='https://wiki.bambulab.com/en/a1/manual/intro-a1' target='_blank' rel='noopener'>Bambu Wiki: A1 introduction (sensors &amp; calibration)</a>" +
      "<a href='https://wiki.bambulab.com/en/a1/maintenance/heatbed-sensor' target='_blank' rel='noopener'>Bambu Wiki: the A1 heatbed accelerometer</a>" +
      "<a href='https://github.com/OrcaSlicer/OrcaSlicer/wiki/printer_motion_ability' target='_blank' rel='noopener'>OrcaSlicer wiki: motion ability &amp; input-shaping trade-offs</a>" +
      "</div>",
  });
})();
