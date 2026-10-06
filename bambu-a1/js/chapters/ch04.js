/* ch04 — Auto bed leveling routines and software compensation */
(function () {
  "use strict";

  A1.registerSim({
    id: "bed-mesh",
    title: "Complete 7×7 routine: probe, then compensate",
    mount(api) {
      var cv = api.canvas(16 / 10);
      var N = 7;            // probe grid per side (7×7 = 49 taps)
      var LAYER = 0.2;      // illustrative target gap, mm; not a universal acceptance value
      var PER_TAP = 0.11;   // seconds per probe tap
      var PASS_T = 4.5;     // seconds per first-layer pass
      var GAP_BANDS = { contact: 0.05, low: 0.14, near: 0.27 }; // visual-only thresholds
      var GAP_SAMPLES = 201;

      var warp = { tx: 0.16, ty: -0.1, bowl: 0.12 }; // mm
      var probed = [];
      for (var q = 0; q < N * N; q++) probed.push(false);
      var meshValid = false;
      var stage = "idle";   // idle | probing | printing
      var probeK = 0, tapT = 0;
      var printS = 0, pauseT = 0;
      var comp = false;

      function hAt(u, v) {
        var du = u - 0.5, dv = v - 0.5;
        return warp.tx * du * 2 + warp.ty * dv * 2 +
               warp.bowl * (1 - (du * du + dv * dv) * 4);
      }
      function probeOrder(k) {
        var j = Math.floor(k / N);
        var i = k % N;
        if (j % 2 === 1) i = N - 1 - i;
        return { i: i, j: j };
      }
      function nozzZ(s) {
        if (comp && meshValid) return hAt(s, s) + LAYER;
        return hAt(0.5, 0.5) + LAYER; // flat pass, Z-offset taken at bed center
      }
      function beadClass(gap) {
        if (gap <= GAP_BANDS.contact) return "contact";
        if (gap < GAP_BANDS.low) return "low";
        if (gap <= GAP_BANDS.near) return "near";
        return "high";
      }
      function beadColor(cls, p) {
        if (cls === "near") return p.accent;
        if (cls === "high") return p.warn;
        return p.danger;
      }
      function cleanZero(v) { return Math.abs(v) < 0.0005 ? 0 : v; }
      function signedMm(v) {
        v = cleanZero(v);
        return (v > 0 ? "+" : "") + v.toFixed(2);
      }
      function surfaceRange() {
        var lo = Infinity, hi = -Infinity;
        for (var j = 0; j <= 40; j++) for (var i = 0; i <= 40; i++) {
          var h = hAt(i / 40, j / 40);
          if (h < lo) lo = h;
          if (h > hi) hi = h;
        }
        return { min: cleanZero(lo), max: cleanZero(hi) };
      }
      function gapStats() {
        var stats = { min: Infinity, max: -Infinity, contact: 0, low: 0, near: 0, high: 0 };
        for (var i = 0; i < GAP_SAMPLES; i++) {
          var s = i / (GAP_SAMPLES - 1);
          var gap = nozzZ(s) - hAt(s, s);
          if (gap < stats.min) stats.min = gap;
          if (gap > stats.max) stats.max = gap;
          stats[beadClass(gap)]++;
        }
        stats.min = cleanZero(stats.min);
        stats.max = cleanZero(stats.max);
        return stats;
      }

      var ro = api.readout({ label: "" });
      function setStatus() {
        var range = surfaceRange();
        var surface = "model surface " + signedMm(range.min) + " to " +
          signedMm(range.max) + " mm relative to its reference plane";
        var msg;
        if (stage === "probing") {
          msg = "Tapping point " + Math.min(probeK + 1, N * N) +
            " / 49 — building the height map; " + surface + ".";
        } else if (stage === "printing") {
          var gaps = gapStats();
          msg = (comp && meshValid ? "Compensation ON" : "Compensation OFF") +
            " — 201 sampled diagonal gaps: " + gaps.min.toFixed(2) + " to " +
            gaps.max.toFixed(2) + " mm; visual-only bands: " + gaps.contact +
            " very low, " + gaps.low + " low, " + gaps.near + " near the 0.20 mm example, " +
            gaps.high + " high. " + surface + ".";
        } else {
          msg = "No valid mesh; " + surface + ". Press “Run complete probe” to start the 49-tap example.";
        }
        ro.setText(msg);
        cv.setAria("Bed leveling playground. " + msg);
      }
      function invalidate() {
        meshValid = false;
        for (var k = 0; k < probed.length; k++) probed[k] = false;
        stage = "idle";
        setStatus();
      }

      api.slider({
        label: "Warp: tilt X", min: -0.3, max: 0.3, step: 0.01, value: warp.tx, unit: "mm",
        format: function (v) { return v.toFixed(2) + " mm"; },
        onInput: function (v) { warp.tx = v; invalidate(); },
      });
      api.slider({
        label: "Warp: tilt Y", min: -0.3, max: 0.3, step: 0.01, value: warp.ty, unit: "mm",
        format: function (v) { return v.toFixed(2) + " mm"; },
        onInput: function (v) { warp.ty = v; invalidate(); },
      });
      api.slider({
        label: "Warp: bowl / dome", min: -0.25, max: 0.25, step: 0.01, value: warp.bowl, unit: "mm",
        format: function (v) { return v.toFixed(2) + " mm"; },
        onInput: function (v) { warp.bowl = v; invalidate(); },
      });
      api.button({
        label: "Run complete probe (7×7)",
        onClick: function () {
          for (var k = 0; k < probed.length; k++) probed[k] = false;
          meshValid = false; probeK = 0; tapT = 0; stage = "probing";
          setStatus();
        },
      });
      api.toggle({
        label: "Compensation (ride the mesh)", value: comp,
        onChange: function (v) { comp = v; setStatus(); },
      });
      setStatus();

      function draw() {
        var p = api.pal();
        var W = cv.W, H = cv.H, ctx = cv.ctx;
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);

        /* ---------- top: oblique bed view ---------- */
        var bw = W * 0.44, sk = W * 0.16, bh = H * 0.24;
        var ox = (W - bw - sk) / 2, oy = H * 0.16;
        var zs = H * 0.09; // px per mm
        function P(u, v, z) {
          return { x: ox + u * bw + (1 - v) * sk, y: oy + v * bh - z * zs };
        }
        function heat(h) {
          var t = Math.min(1, Math.abs(h) / 0.45);
          // Diverging map preserves sign: blue is below the reference plane,
          // neutral is near zero, and red is above it.
          var neutral = [210, 218, 224];
          var end = h < 0 ? [59, 130, 246] : [239, 68, 68];
          var r = Math.round(neutral[0] + (end[0] - neutral[0]) * t);
          var g = Math.round(neutral[1] + (end[1] - neutral[1]) * t);
          var b = Math.round(neutral[2] + (end[2] - neutral[2]) * t);
          return "rgb(" + r + "," + g + "," + b + ")";
        }

        ctx.font = "12px system-ui, sans-serif";
        ctx.fillStyle = p.muted;
        ctx.fillText("textured PEI plate — 7×7 probe grid", 12, 18);
        ctx.textAlign = "right";
        ctx.fillText("blue = low · gray = reference · red = high", W - 12, 18);
        ctx.textAlign = "left";

        // heat cells appear as their four corner taps complete
        var i, j;
        ctx.globalAlpha = 0.55;
        for (j = 0; j < N - 1; j++) {
          for (i = 0; i < N - 1; i++) {
            if (!(probed[j * N + i] && probed[j * N + i + 1] &&
                  probed[(j + 1) * N + i] && probed[(j + 1) * N + i + 1])) continue;
            var u0 = i / (N - 1), u1 = (i + 1) / (N - 1);
            var v0 = j / (N - 1), v1 = (j + 1) / (N - 1);
            var hAvg = (hAt(u0, v0) + hAt(u1, v0) + hAt(u0, v1) + hAt(u1, v1)) / 4;
            var a1 = P(u0, v0, hAt(u0, v0)), b1 = P(u1, v0, hAt(u1, v0));
            var c1 = P(u1, v1, hAt(u1, v1)), d1 = P(u0, v1, hAt(u0, v1));
            ctx.fillStyle = heat(hAvg);
            ctx.beginPath();
            ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y);
            ctx.lineTo(c1.x, c1.y); ctx.lineTo(d1.x, d1.y);
            ctx.closePath(); ctx.fill();
          }
        }
        ctx.globalAlpha = 1;

        // warped wireframe (visible even before probing)
        ctx.strokeStyle = p.borderStrong;
        ctx.lineWidth = 1;
        var s, pt;
        for (j = 0; j < N; j++) {
          ctx.beginPath();
          for (i = 0; i < N; i++) {
            pt = P(i / (N - 1), j / (N - 1), hAt(i / (N - 1), j / (N - 1)));
            if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        }
        for (i = 0; i < N; i++) {
          ctx.beginPath();
          for (j = 0; j < N; j++) {
            pt = P(i / (N - 1), j / (N - 1), hAt(i / (N - 1), j / (N - 1)));
            if (j === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        }

        // slice indicator (the cross-section below runs along this diagonal)
        var d0 = P(0, 0, hAt(0, 0)), d2 = P(1, 1, hAt(1, 1));
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = p.muted;
        ctx.beginPath(); ctx.moveTo(d0.x, d0.y); ctx.lineTo(d2.x, d2.y); ctx.stroke();
        ctx.setLineDash([]);

        // probe dots
        for (j = 0; j < N; j++) {
          for (i = 0; i < N; i++) {
            var hh = hAt(i / (N - 1), j / (N - 1));
            pt = P(i / (N - 1), j / (N - 1), hh);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            if (probed[j * N + i]) { ctx.fillStyle = heat(hh); ctx.fill(); }
            else { ctx.strokeStyle = p.muted; ctx.stroke(); }
          }
        }

        // first-layer trace on the plate while printing
        if (stage === "printing" && printS > 0) {
          ctx.lineWidth = 3;
          var ds0 = 0.02;
          for (s = 0; s < printS; s += ds0) {
            var g0 = nozzZ(s) - hAt(s, s);
            var q0 = P(s, s, hAt(s, s) + 0.03);
            var q1 = P(Math.min(printS, s + ds0), Math.min(printS, s + ds0), hAt(s + ds0, s + ds0) + 0.03);
            ctx.strokeStyle = beadColor(beadClass(g0), p);
            ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
          }
          ctx.lineWidth = 1;
        }

        // toolhead
        var hx, hy;
        if (stage === "probing") {
          var o = probeOrder(Math.min(probeK, N * N - 1));
          var pu = o.i / (N - 1), pv = o.j / (N - 1);
          var dip = Math.sin(Math.min(1, tapT / PER_TAP) * Math.PI);
          var tp = P(pu, pv, hAt(pu, pv) + 0.7 * (1 - dip));
          hx = tp.x; hy = tp.y;
        } else if (stage === "printing") {
          var tp2 = P(printS, printS, nozzZ(printS));
          hx = tp2.x; hy = tp2.y;
        } else {
          var tp3 = P(0, 0, hAt(0, 0) + 0.7);
          hx = tp3.x; hy = tp3.y;
        }
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong;
        ctx.fillRect(hx - 9, hy - 26, 18, 13);
        ctx.strokeRect(hx - 9, hy - 26, 18, 13);
        ctx.fillStyle = p.soft;
        ctx.beginPath();
        ctx.moveTo(hx - 5, hy - 13); ctx.lineTo(hx + 5, hy - 13); ctx.lineTo(hx, hy);
        ctx.closePath(); ctx.fill();

        /* ---------- bottom: cross-section along the diagonal ---------- */
        var cy0 = H * 0.58, cyH = H * 0.4;
        var base = cy0 + cyH * 0.55;
        var ms = H * 0.16; // px per mm (Z exaggerated)
        var xL = 46, xR = W - 14;
        function X(s2) { return xL + s2 * (xR - xL); }

        ctx.strokeStyle = p.border;
        ctx.beginPath(); ctx.moveTo(0, cy0 - 6); ctx.lineTo(W, cy0 - 6); ctx.stroke();

        // plate body
        ctx.beginPath();
        ctx.moveTo(X(0), base - hAt(0, 0) * ms);
        for (s = 0; s <= 1.001; s += 0.02) ctx.lineTo(X(Math.min(1, s)), base - hAt(Math.min(1, s), Math.min(1, s)) * ms);
        ctx.lineTo(X(1), cy0 + cyH - 4);
        ctx.lineTo(X(0), cy0 + cyH - 4);
        ctx.closePath();
        ctx.fillStyle = p.panel2; ctx.fill();
        ctx.strokeStyle = p.borderStrong; ctx.stroke();

        // nozzle path (flat, or riding the mesh)
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = (comp && meshValid) ? p.accent : p.muted;
        ctx.beginPath();
        ctx.moveTo(X(0), base - nozzZ(0) * ms);
        for (s = 0; s <= 1.001; s += 0.02) ctx.lineTo(X(Math.min(1, s)), base - nozzZ(Math.min(1, s)) * ms);
        ctx.stroke();
        ctx.setLineDash([]);

        // deposited bead
        if (stage === "printing" && printS > 0) {
          var ds = 0.008;
          for (s = 0; s < printS; s += ds) {
            var gap = nozzZ(s) - hAt(s, s);
            var cls = beadClass(gap);
            var x0 = X(s), wpx = X(Math.min(printS, s + ds)) - x0 + 0.5;
            var sy = base - hAt(s, s) * ms;
            if (cls === "contact") {
              if (Math.floor(s / 0.012) % 2 === 0) {
                ctx.strokeStyle = p.danger;
                ctx.beginPath(); ctx.moveTo(x0, sy - 5); ctx.lineTo(x0 + 2, sy + 3); ctx.stroke();
              }
            } else if (cls === "high") {
              if (Math.floor(s / 0.028) % 2 === 0) {
                ctx.fillStyle = p.warn;
                ctx.fillRect(x0, sy - LAYER * ms, wpx, LAYER * ms);
              }
            } else {
              var th = Math.min(gap, LAYER) * ms;
              ctx.fillStyle = beadColor(cls, p);
              ctx.fillRect(x0, sy - th, wpx, th);
            }
          }
          // nozzle marker in the section
          var nx = X(printS), ny = base - nozzZ(printS) * ms;
          ctx.fillStyle = p.soft;
          ctx.beginPath();
          ctx.moveTo(nx - 5, ny - 12); ctx.lineTo(nx + 5, ny - 12); ctx.lineTo(nx, ny);
          ctx.closePath(); ctx.fill();
        }

        // legend + label
        ctx.font = "11px system-ui, sans-serif";
        var lx = W - 172, ly = cy0 + 8;
        var items = [
          [p.accent, "near 0.20 mm example"],
          [p.danger, "illustrative low-gap bands"],
          [p.warn, "illustrative high-gap band"],
        ];
        for (i = 0; i < items.length; i++) {
          ctx.fillStyle = items[i][0];
          ctx.fillRect(lx, ly + i * 15 - 6, 10, 7);
          ctx.fillStyle = p.soft;
          ctx.fillText(items[i][1], lx + 15, ly + i * 15 + 1);
        }
        ctx.fillStyle = p.muted;
        ctx.fillText("first layer — cross-section along the diagonal (Z exaggerated)", 12, cy0 + cyH - 8);
      }

      api.raf(function (t, dt) {
        if (stage === "probing") {
          tapT += dt;
          while (tapT >= PER_TAP && stage === "probing") {
            tapT -= PER_TAP;
            var o = probeOrder(probeK);
            probed[o.j * N + o.i] = true;
            probeK++;
            if (probeK >= N * N) {
              meshValid = true; stage = "printing"; printS = 0; pauseT = 0;
            }
            setStatus();
          }
        } else if (stage === "printing") {
          if (pauseT > 0) {
            pauseT -= dt;
            if (pauseT <= 0) printS = 0;
          } else {
            printS += dt / PASS_T;
            if (printS >= 1) { printS = 1; pauseT = 1; }
          }
        }
        draw();
      });
    },
  });

  A1.registerChapter({
    n: 4,
    tier: "Intermediate",
    title: "Auto bed leveling",
    claims: ["FW-001", "FW-002", "FW-003", "FW-005", "FW-006", "FW-007", "QNT-011"],
    html:
      '<div class="note"><strong>Objective.</strong> Distinguish partial pre-print leveling, the ' +
      "A1's complete 7×7 pre-print routine, and the separate 21×21 thorough calibration; then " +
      "explain how Z compensation preserves nozzle-to-bed distance without physically flattening the bed.</div>" +
      "<p>For a reliable first layer, the A1 has to solve a problem you cannot see: the build plate is not perfectly flat. Not badly — often only fractions of a millimetre across its 256&nbsp;mm width — but a typical first layer is itself only a fraction of a millimetre tall. A plate that counts as flat by everyday standards can still vary enough to matter at the nozzle.</p>" +

      '<div class="facts">' +
      '<div class="fact"><div class="v">partial</div><div class="k">pre-print, around model outline</div></div>' +
      '<div class="fact"><div class="v">7&times;7</div><div class="k">complete pre-print A1 routine</div></div>' +
      '<div class="fact"><div class="v">21&times;21</div><div class="k">separate thorough A1 calibration</div></div>' +
      '<div class="fact"><div class="v">illustrative</div><div class="k">playground timing and bed shape</div></div>' +
      "</div>" +

      "<h3>An illustrative 0.20&nbsp;mm target</h3>" +
      "<p>The playground below chooses a 0.20&nbsp;mm nozzle-to-surface gap as one teaching example, " +
      "not as a universal first-layer acceptance value. Real first-layer geometry comes from the " +
      "selected nozzle, plate, filament and process profile. Directionally, too much gap can leave a " +
      "round line with poor contact, while too little can over-squish or let the nozzle disturb material. " +
      "The actual deposited line—and the printer's current guidance—must decide whether a real first layer is acceptable.</p>" +
      "<p>The plate carries manufacturing tolerance, alignment can vary, and heating changes geometry. When bed leveling is selected for a job, the A1 measures the relevant surface instead of assuming it is ideal. Current firmware can use a partial routine around the sliced model outline; a complete pre-print routine and a separate thorough calibration are also available.</p>" +

      "<h3>The nozzle is the probe</h3>" +
      "<p>Classic bed leveling was a ritual: slide a sheet of paper under the nozzle, turn thumbwheels until the drag feels right, and repeat. The A1 instead taps the plate with its own nozzle and senses the resulting force through hardware inside the toolhead. There is no separate <em>probe tip beside the nozzle</em>; the nozzle is the contact point, while the eddy-current sensing hardware remains a distinct component. That avoids a probe-tip-to-nozzle offset in this measurement path and supports automatic Z-offset measurement. Before contact probing, the hot nozzle cleans on the <strong>heatbed nozzle wiper</strong> at the rear of the bed. That cleaning pad is separate from the gantry-end <strong>purge wiper</strong>, which handles purged filament.</p>" +

      '<div class="note"><strong>Naming.</strong> Bambu’s own documentation calls this an eddy-current sensor. Community guides and reviews often call it a load cell or strain gauge. The job is the same either way — sensing the force of nozzle-to-plate contact — and this site follows Bambu’s official term.</div>' +

      "<h3 id=\"diagnose-first-layer\">Three routines, not one interpolated ladder</h3>" +
      "<p>Current Bambu documentation separates three behaviors. A <strong>partial pre-print</strong> routine can probe around the model outline. A <strong>complete pre-print</strong> routine uses a 7&times;7 grid on the A1 (6&times;6 on the A1 mini). The Calibration page's separate <strong>thorough</strong> routine uses 21&times;21 on the A1 (18&times;18 on the mini). The official guide does not say that 7&times;7 measurements are converted into the 21&times;21 routine, so this tutorial does not either. Which pass runs depends on current firmware, Studio settings and the selected calibration action; timing varies. See Bambu's " +
      '<a href="https://wiki.bambulab.com/en/a1/troubleshooting/homing-leveling-failure" target="_blank" rel="noopener">current homing and leveling guide</a>.</p>' +

      "<h3>Correction in software — the bed is not flattened</h3>" +
      "<p>Here is the part that surprises people: after all that measuring, nothing gets physically leveled. The plate remains tilted or warped. Instead, the firmware adjusts Z motion against the measured surface so the nozzle-to-plate gap stays more consistent within the routine's correction range. The system compensates in motion, not by flattening metal; it cannot guarantee a perfect layer when the plate, nozzle or measurement is outside its assumptions.</p>" +
      "<p>That also defines the limits. Bambu provides diagnostics and a manual bed-tramming procedure for abnormal cases; this tutorial does not invent a universal millimetre range that software must accept. A successful model visualization is not proof that a real plate, nozzle or measurement is within the printer's limits. The A1 has no lidar first-layer inspection. Optional sensor-based nozzle-clump detection can pause some later failures and is not failproof; it does not validate the entire mesh or every first-layer line. Camera-related feature wording also varies across current Bambu documentation. Observe unfamiliar first layers and stop the print if adhesion or nozzle clearance looks wrong. See Bambu's " +
      '<a href="https://wiki.bambulab.com/en/a1-mini/manual/nozzle-warp-detection" target="_blank" rel="noopener">documented detection limits</a>.</p>' +

      '<div class="note"><strong>Simulation assumptions.</strong> This playground depicts the ' +
      "complete 7×7 A1 routine, compresses its timing, exaggerates Z shape, and grants the software a " +
      "perfectly interpolated surface between taps. Blue means below the reference plane and red means " +
      "above it. The 0.20&nbsp;mm target and color thresholds (≤0.05, 0.05–0.14, 0.14–0.27 and " +
      ">0.27&nbsp;mm) are invented visual teaching bands—not Bambu acceptance limits. The readout " +
      "reports the actual sampled minimum and maximum gap produced by this model, including the truthful " +
      "flat case. It teaches compensation, not the printer's exact internal mesh implementation.</div>" +
      "<p>Try it below: predict what an uncompensated diagonal will do, warp the virtual plate, press probe, then compare compensation off and on. Explain the result in terms of nozzle-to-plate gap rather than color alone.</p>" +

      '<div data-sim="bed-mesh"></div>' +

      '<div class="note"><strong>Transfer check.</strong> A tiny part is centered on an otherwise ' +
      "clean plate. Which routine might current firmware choose before that print? When would the " +
      "separate 21×21 thorough calibration be the better diagnostic action—and why is it not evidence " +
      "that every 7×7 pass becomes a 21×21 pass?</div>" +

      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://wiki.bambulab.com/en/a1/manual/intro-a1" target="_blank" rel="noopener">Bambu Wiki — A1 introduction (eddy-current sensor, 7&times;7 probing)</a>' +
      '<a href="https://wiki.bambulab.com/en/a1/troubleshooting/homing-leveling-failure" target="_blank" rel="noopener">Bambu Wiki — partial, complete and thorough leveling routines</a>' +
      '<a href="https://wiki.bambulab.com/en/a1/maintenance/manual-bed-tramming" target="_blank" rel="noopener">Bambu Wiki — manual bed tramming</a>' +
      "</div>",
  });
})();
