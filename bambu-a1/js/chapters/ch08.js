/* ch08 — Slicing: model → G-code. The slicer decides; the printer obeys.
   Sims: "slice-sandbox" (layer-height re-slicer with zoom + meters),
         "infill" (pattern + density cross-section with strength/material/time bars). */
(function () {
  "use strict";

  /* ---------------- slice-sandbox sim ---------------- */

  A1.registerSim({
    id: "slice-sandbox",
    title: "Slice sandbox — layer height vs detail",
    mount(api) {
      const cv = api.canvas(16 / 9);
      const MODEL_MM = 40; // vase height in millimetres
      let lh = 0.2;

      // vase half-width profile (0..~0.85), f = normalized height 0..1
      function prof(f) {
        const bulge = 0.62 * Math.exp(-Math.pow((f - 0.3) / 0.26, 2));
        const lip = 0.3 * Math.pow(Math.max(0, (f - 0.82) / 0.18), 2);
        return 0.22 + bulge + lip;
      }

      const sl = api.slider({
        label: "Layer height", min: 0.08, max: 0.28, step: 0.02, value: 0.2,
        format: function (v) { return v.toFixed(2) + " mm"; },
        onInput: function (v) { lh = v; api.once(draw); },
      });
      lh = sl.value;
      const ro = api.readout({ label: "" });

      function bar(ctx, p, x, y, w, label, val) {
        ctx.fillStyle = p.soft;
        ctx.font = "12px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText(label, x, y - 5);
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.border; ctx.lineWidth = 1;
        ctx.fillRect(x, y, w, 10);
        ctx.strokeRect(x, y, w, 10);
        ctx.fillStyle = p.accent;
        ctx.fillRect(x, y, Math.max(3, w * Math.min(1, val)), 10);
      }

      function draw() {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);

        // Nominal count for a constant-height teaching model. Real jobs can use a
        // different first layer, adaptive layers, and geometry-dependent top layers.
        const n = Math.ceil(MODEL_MM / lh);
        const Vh = H * 0.72;
        const y0 = H * 0.88;
        const unit = Math.min(W * 0.19, H * 0.45);
        const cx = W * 0.28;
        const pxl = Vh / n;

        // build plate
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1;
        ctx.fillRect(cx - unit * 1.05, y0 + 2, unit * 2.1, 6);
        ctx.strokeRect(cx - unit * 1.05, y0 + 2, unit * 2.1, 6);

        // sliced slabs (alternating alpha so layer bands read)
        for (let j = 0; j < n; j++) {
          const r = prof((j + 0.5) / n) * unit;
          const y = y0 - (j + 1) * pxl;
          ctx.save();
          ctx.globalAlpha = j % 2 === 0 ? 0.55 : 0.68;
          ctx.fillStyle = p.accent;
          ctx.fillRect(cx - r, y, 2 * r, pxl + 0.5);
          ctx.restore();
        }

        // ideal (pre-slice) outline, dashed
        ctx.save();
        ctx.strokeStyle = p.soft; ctx.globalAlpha = 0.75; ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        for (let f = 0; f <= 1.001; f += 0.02) {
          const x = cx - prof(Math.min(1, f)) * unit, y = y0 - Math.min(1, f) * Vh;
          if (f === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.beginPath();
        for (let f = 0; f <= 1.001; f += 0.02) {
          const x = cx + prof(Math.min(1, f)) * unit, y = y0 - Math.min(1, f) * Vh;
          if (f === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // zoom inset on the shoulder (where the staircase shows)
        const inset = { x: W * 0.56, y: H * 0.07, w: W * 0.38, h: H * 0.44 };
        const M = 5;
        const fc = 0.56;
        const Pc = { x: cx + prof(fc) * unit, y: y0 - fc * Vh };
        const mw = inset.w / M, mh = inset.h / M;

        // marker + connector
        ctx.save();
        ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
        ctx.strokeRect(Pc.x - mw / 2, Pc.y - mh / 2, mw, mh);
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(Pc.x + mw / 2, Pc.y);
        ctx.lineTo(inset.x, inset.y + inset.h / 2);
        ctx.stroke();
        ctx.restore();

        // inset contents (clipped)
        ctx.save();
        ctx.beginPath(); ctx.rect(inset.x, inset.y, inset.w, inset.h); ctx.clip();
        ctx.fillStyle = p.panel; ctx.fillRect(inset.x, inset.y, inset.w, inset.h);
        const icx = inset.x + inset.w / 2, icy = inset.y + inset.h / 2;
        for (let j = 0; j < n; j++) {
          const yTop = y0 - (j + 1) * pxl;
          const iy = icy + (yTop - Pc.y) * M;
          const ih = pxl * M;
          if (iy > inset.y + inset.h || iy + ih < inset.y) continue;
          const xR = cx + prof((j + 0.5) / n) * unit;
          const ixR = icx + (xR - Pc.x) * M;
          ctx.save();
          ctx.globalAlpha = j % 2 === 0 ? 0.55 : 0.68;
          ctx.fillStyle = p.accent;
          ctx.fillRect(inset.x, iy, Math.max(0, ixR - inset.x), ih + 0.5);
          ctx.restore();
        }
        ctx.save();
        ctx.strokeStyle = p.soft; ctx.globalAlpha = 0.8; ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        let first = true;
        for (let f = fc - 0.1; f <= fc + 0.1; f += 0.004) {
          const x = icx + (cx + prof(f) * unit - Pc.x) * M;
          const y = icy + (y0 - f * Vh - Pc.y) * M;
          if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1;
        ctx.strokeRect(inset.x, inset.y, inset.w, inset.h);
        ctx.fillStyle = p.soft;
        ctx.font = "12px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText("5× zoom on the surface", inset.x + 8, inset.y + 16);

        // meters
        const rel = 0.2 / lh; // print time vs the 0.20 mm preset
        bar(ctx, p, inset.x, H * 0.68, inset.w, "illustrative time trend (vs 0.20 mm: " + rel.toFixed(2) + "×)", rel / 2.5);
        bar(ctx, p, inset.x, H * 0.68 + 34, inset.w, "illustrative smoothness trend", 0.15 + 0.85 * (0.28 - lh) / 0.2);

        // caption
        ctx.fillStyle = p.muted;
        ctx.textAlign = "center";
        ctx.fillText("40 mm teaching vase · ≈" + n + " nominal layers @ " + lh.toFixed(2) + " mm", cx, y0 + 24);
        ctx.textAlign = "left";

        ro.setText("≈" + n + " nominal layers · illustrative " + rel.toFixed(2) + "× time trend versus 0.20 mm");
        cv.setAria(
          "Illustrative constant-height model of a 40 millimetre vase with approximately " + n + " nominal horizontal layers at " +
          lh.toFixed(2) + " millimetre layer height, with a zoom view showing the " +
          "staircase effect on its curved surface. The smoothness and time bars show direction only, not a slicer prediction."
        );
      }

      cv.onResize(function () { draw(); });
      api.once(draw);
    },
  });

  /* ---------------- infill sim ---------------- */

  A1.registerSim({
    id: "infill",
    title: "Infill — pattern and density",
    mount(api) {
      const cv = api.canvas(16 / 9);
      let pattern = "grid";
      let density = 15;

      const F = {
        grid:      { label: "Grid",      s: 0.88, t: 1.0 },
        gyroid:    { label: "Gyroid",    s: 0.92, t: 1.35 },
        triangles: { label: "Triangles", s: 1.0,  t: 1.1 },
        honeycomb: { label: "Honeycomb", s: 0.98, t: 1.5 },
      };

      api.select({
        label: "Pattern",
        options: [
          { value: "grid", label: "Grid" },
          { value: "gyroid", label: "Gyroid" },
          { value: "triangles", label: "Triangles" },
          { value: "honeycomb", label: "Honeycomb" },
        ],
        value: "grid",
        onChange: function (v) { pattern = v; api.once(draw); },
      });
      api.slider({
        label: "Density", min: 5, max: 60, step: 1, value: 15, unit: "%",
        onInput: function (v) { density = v; api.once(draw); },
      });
      const ro = api.readout({ label: "" });

      function bar(ctx, p, x, y, w, label, val) {
        ctx.fillStyle = p.soft;
        ctx.font = "12px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText(label, x, y - 5);
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.border; ctx.lineWidth = 1;
        ctx.fillRect(x, y, w, 11);
        ctx.strokeRect(x, y, w, 11);
        ctx.fillStyle = p.accent;
        ctx.fillRect(x, y, Math.max(3, w * Math.min(1, val)), 11);
      }

      function draw() {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);

        const S = Math.min(H * 0.78, W * 0.44);
        const sx = W * 0.06, sy = (H - S) / 2;
        const d = density / 100;

        // part shell: 2 wall loops
        ctx.strokeStyle = p.soft; ctx.lineWidth = 2.5;
        ctx.strokeRect(sx + 1.5, sy + 1.5, S - 3, S - 3);
        ctx.strokeRect(sx + 7, sy + 7, S - 14, S - 14);

        // infill, clipped to the interior
        const ix = sx + 12, iy = sy + 12, iw = S - 24, ih = S - 24;
        const ccx = ix + iw / 2, ccy = iy + ih / 2;
        const diag = S;
        const wEff = 3;

        ctx.save();
        ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
        ctx.strokeStyle = p.accent; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.95;

        function parallel(angle, spacing) {
          ctx.save();
          ctx.translate(ccx, ccy);
          ctx.rotate(angle);
          ctx.beginPath();
          for (let y = -diag; y <= diag; y += spacing) {
            ctx.moveTo(-diag, y); ctx.lineTo(diag, y);
          }
          ctx.stroke();
          ctx.restore();
        }

        if (pattern === "grid") {
          const s = Math.max(6, 2 * wEff / d);
          parallel(Math.PI / 4, s);
          parallel(-Math.PI / 4, s);
        } else if (pattern === "triangles") {
          const s = Math.max(6, 3 * wEff / d);
          parallel(0, s);
          parallel(Math.PI / 3, s);
          parallel(2 * Math.PI / 3, s);
        } else if (pattern === "gyroid") {
          const s = Math.max(7, 2.2 * wEff / d);
          let k = 0;
          for (let r0 = iy - s; r0 < iy + ih + s; r0 += s, k++) {
            ctx.beginPath();
            for (let x = ix; x <= ix + iw; x += 3) {
              const y = r0 + Math.sin((x - ix) * (Math.PI * 2) / (2.6 * s) + k * Math.PI) * s * 0.48;
              if (x === ix) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        } else { // honeycomb
          const a = Math.max(4.5, 1.155 * wEff / d);
          const vs = 1.5 * a, hs = Math.sqrt(3) * a;
          for (let r = 0, cy = iy - a; cy < iy + ih + a; cy += vs, r++) {
            const off = r % 2 === 1 ? hs / 2 : 0;
            for (let cxh = ix - a + off; cxh < ix + iw + a; cxh += hs) {
              ctx.beginPath();
              for (let k = 0; k < 6; k++) {
                const ang = Math.PI / 3 * k + Math.PI / 6;
                const vx = cxh + a * Math.cos(ang), vy = cy + a * Math.sin(ang);
                if (k === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
              }
              ctx.closePath();
              ctx.stroke();
            }
          }
        }
        ctx.restore();

        // labels around the square
        ctx.font = "12px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillStyle = p.soft;
        ctx.fillText("walls (2 loops)", sx, sy - 7);
        ctx.fillStyle = p.muted;
        ctx.fillText("one sliced layer, seen from above", sx, sy + S + 18);

        // relative meters (cartoon estimates)
        const bx = sx + S + 28;
        const bw = Math.max(90, W - bx - W * 0.05);
        const f = F[pattern];
        ctx.fillStyle = p.soft;
        ctx.fillText("relative (cartoon) at " + density + "%:", bx, sy + 12);
        bar(ctx, p, bx, sy + 44, bw, "strength", (d * f.s) / 0.6);
        bar(ctx, p, bx, sy + 96, bw, "material used", d / 0.6);
        // 15%-default tick on the material bar
        const tickX = bx + bw * (0.15 / 0.6);
        ctx.strokeStyle = p.text; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tickX, sy + 92); ctx.lineTo(tickX, sy + 111); ctx.stroke();
        ctx.fillStyle = p.muted;
        ctx.fillText("15% default", Math.min(tickX + 4, bx + bw - 70), sy + 124);
        bar(ctx, p, bx, sy + 152, bw, "print time", (d * f.t) / (0.6 * 1.5));

        ro.setText(f.label + " at " + density + "% — Bambu Studio's default is 15%");
        cv.setAria(
          "Cross-section of one printed layer: a square with two wall loops filled by a " +
          f.label + " infill pattern at " + density + " percent density, next to bars " +
          "comparing relative strength, material use, and print time."
        );
      }

      cv.onResize(function () { draw(); });
      api.once(draw);
    },
  });

  /* ---------------- chapter ---------------- */

  A1.registerChapter({
    n: 8,
    tier: "Advanced",
    title: "Slicing: model → G-code",
    claims: ["FW-008", "FW-010", "FW-011", "QNT-010", "QNT-013"],
    html:
      '<div class="note"><strong>Objective.</strong> Explain what slicing decides, change layer height and infill with an explicit illustrative model, and identify the file/storage path required for a real A1 job. <strong>Assumption:</strong> current Bambu Studio defaults vary by printer, filament, process preset, and software version.</div>' +
      "<h3>The printer is the hands; the slicer is the brain</h3>" +
      "<p>A 3D model file can be only a skin, not a plan. An <strong>STL</strong> describes a triangle mesh and carries no slicing settings. A <strong>3MF</strong> can also hold only geometry, but a Bambu Studio project or MakerWorld print-profile 3MF can additionally carry plate layout, orientation, colors, and process settings. The filename alone therefore does not prove that a 3MF is print-ready. How thick should the walls " +
      "be? What goes inside? In what order, at what temperature, with how much cooling? The A1 makes " +
      "none of those decisions. A program on your computer makes all of them and writes the printer a " +
      "to-do list. That program is the <code>slicer</code>, and it is where most of a print’s quality " +
      "is actually decided.</p>" +
      "<p>For the A1 the slicer is <strong>Bambu Studio</strong> — free, open-source, and the product of " +
      "a long lineage: Slic3r begat PrusaSlicer, PrusaSlicer begat Bambu Studio, and OrcaSlicer, the " +
      "community favorite, is a fork of Bambu Studio. Pick the A1 from a dropdown and Studio loads a " +
      "machine profile with geometry, nozzle data and internal motion references. The product page " +
      "publishes 500 mm/s maximum toolhead speed and a 10,000 mm/s² acceleration rating; the official " +
      '<a href="https://github.com/bambulab/BambuStudio/blob/v02.07.01.62/resources/profiles/BBL/machine/Bambu%20Lab%20A1%200.4%20nozzle.json" target="_blank" rel="noopener">Bambu Studio v2.7.1.62 A1 profile</a> ' +
      "separately encodes 12,000 mm/s² X, Y and extruding machine limits. These values serve different " +
      "purposes: neither is an ordinary print setting, a failure threshold or a promise that a sliced " +
      "model will sustain it. Use the process and filament profiles, then inspect the sliced Preview.</p>" +
      "<h3>What G-code actually looks like</h3>" +
      "<p>The slicer’s output is <code>G-code</code>: a plain-text file of commands, one per line, " +
      "executed top to bottom. Studio cuts the mesh into horizontal layers, plans every nozzle path " +
      "within each layer, and wraps it all in temperature, fan, and flow commands. A few real-looking lines:</p>" +
      "<table><thead><tr><th>Line</th><th>What it tells the printer</th></tr></thead><tbody>" +
      "<tr><td><code>M104 S220</code></td><td>set the nozzle target to 220 °C and continue without waiting</td></tr>" +
      "<tr><td><code>M140 S65</code></td><td>set the bed target to 65 °C and continue without waiting</td></tr>" +
      "<tr><td><code>M109 S220</code></td><td>set the nozzle target and wait for it before continuing</td></tr>" +
      "<tr><td><code>M190 S65</code></td><td>set the bed target and wait for it before continuing</td></tr>" +
      "<tr><td><code>G1 X120.4 Y88.2 E4.021 F3600</code></td><td>move to (120.4, 88.2), extruding along the way, at 60 mm/s</td></tr>" +
      "<tr><td><code>M106 S255</code></td><td>part-cooling fan to 100%</td></tr>" +
      "</tbody></table>" +
      "<p>That is the whole trick. Every wall, every zigzag of infill, every travel hop is ultimately a " +
      "<code>G1</code> move with coordinates, an extrusion amount, and a speed — hundreds of thousands " +
      "of them per print, obeyed in order. Slice the same model with different settings and you " +
      "effectively get a different print. The sandbox below shows the single most consequential knob:</p>" +
      '<p><strong>Predict before playing:</strong> if layer height halves, what happens to layer count and why does real print time not scale perfectly? The sandbox holds geometry, speed, and every other setting constant; its time bar is proportional intuition, not a slicer estimate.</p>' +
      '<div data-sim="slice-sandbox"></div>' +
      "<h3>The six settings a beginner actually touches</h3>" +
      "<p>Studio exposes hundreds of parameters, but its A1 presets are pre-tuned. Day to day you touch six:</p>" +
      "<ul>" +
      "<li><strong>Layer height</strong> — the thickness of each slice. 0.20 mm is the standard preset; " +
      "the stock 0.4 mm nozzle handles roughly 0.08–0.28 mm. Finer layers mean smoother curves, " +
      "but time scales with layer count: halve the height, roughly double the wait.</li>" +
      "<li><strong>Wall loops</strong> — concentric perimeters forming the shell. Default is 2 " +
      "(about 0.8 mm of plastic); going to 3–4 adds strength faster than extra infill does.</li>" +
      "<li><strong>Infill</strong> — the sparse scaffolding inside. Default is 15%: enough to hold up " +
      "the top surfaces and give everyday strength while keeping the interior mostly air. Patterns like " +
      "grid and gyroid trade speed against strength — the playground below shows how.</li>" +
      "<li><strong>Supports</strong> — printable scaffolding under overhangs that the chosen process cannot bridge cleanly. The familiar 45° rule is only a starting heuristic, and angle conventions differ. Material, cooling, layer height, line direction, bridge length, and the active support threshold all matter. Current Studio support defaults are profile- and version-dependent; inspect the active Process profile and sliced Preview rather than memorizing one angle or style.</li>" +
      "<li><strong>Brim</strong> — a single-layer collar around the part’s footprint. Cheap adhesion " +
      "insurance for tall or skinny parts; it peels off when the print is done.</li>" +
      "<li><strong>Speed and temperature</strong> — pre-tuned per filament. Pick a PLA profile and the " +
      "right nozzle and bed temperatures, cooling, and speed limits come with it.</li>" +
      "</ul>" +
      '<p><strong>Interpretation limit:</strong> the infill bars are qualitative cartoons, not mechanical-test data. Orientation, wall count, layer bonding, load direction, and geometry can dominate infill density.</p>' +
      '<div data-sim="infill"></div>' +
      '<p><strong>Transfer:</strong> slice one real part twice, change only one setting, then compare Studio\'s Preview, material estimate, and time estimate before deciding which version to print.</p>' +
      '<div class="note"><strong>Geometry is locked at slice time.</strong> The A1’s sensors ' +
      "(Chapters 4 and 6) measure bed position and can calibrate flow behavior, but no sensor can add a wall or grow a " +
      "support mid-print. When a print fails for a geometric reason, the fix is almost always back in " +
      "the slicer — re-slice, don’t re-tinker.</div>" +
      "<h3>The trip to the printer</h3>" +
      "<p>Sliced job in hand, Studio offers two roads. The default is <strong>Bambu cloud</strong>: the " +
      "file goes up to Bambu’s servers and down to the printer — which is what lets the Handy phone " +
      "app start and monitor prints from anywhere. The alternative is <strong>LAN-only mode</strong>: " +
      "the file travels straight from your computer to the printer and nothing leaves your network. " +
      "Either way the A1 listens on 2.4 GHz Wi-Fi only — there is no Ethernet port. Unlike a printer with internal job storage, " +
      "the A1 <strong>requires a working microSD card even for jobs sent from Studio or Handy</strong>; the card also enables direct offline transfer. " +
      "Keep it inserted, use a supported format/capacity, and follow the <a href=\"https://wiki.bambulab.com/en/a1/manual/faq\" target=\"_blank\" rel=\"noopener\">current A1 FAQ</a> if sends, recording, or history fail.</p>" +
      "<p>A third road skips your slicer window entirely: <strong>MakerWorld one-click printing</strong>. " +
      "A creator publishes model geometry together with a print-profile 3MF that can store orientation, arrangement, coloring, and process settings; you " +
      "tap print, the cloud slices it with those settings, and the job lands on your A1. It’s the " +
      "closest 3D printing gets to a paper printer’s Print button — every decision in this chapter " +
      "still got made, just by someone else.</p>" +
      '<div class="facts">' +
      '<div class="fact"><div class="v">0.20 mm</div><div class="k">standard layer height</div></div>' +
      '<div class="fact"><div class="v">0.08–0.28 mm</div><div class="k">range on the 0.4 mm nozzle</div></div>' +
      '<div class="fact"><div class="v">15%</div><div class="k">default sparse infill</div></div>' +
      '<div class="fact"><div class="v">2</div><div class="k">default wall loops</div></div>' +
      '<div class="fact"><div class="v">profile-dependent</div><div class="k">support type and style defaults</div></div>' +
      '<div class="fact"><div class="v">microSD required</div><div class="k">A1 has no internal job storage</div></div>' +
      '<div class="fact"><div class="v">3MF</div><div class="k">model + profile bundle format</div></div>' +
      "</div>" +
      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://wiki.bambulab.com/en/software/bambu-studio/how-to-set-slicing-parameters" target="_blank" rel="noopener">Bambu wiki: setting slicing parameters</a>' +
      '<a href="https://github.com/bambulab/BambuStudio/blob/master/resources/profiles/BBL/process/fdm_process_common.json" target="_blank" rel="noopener">Bambu Studio: live common process defaults</a>' +
      '<a href="https://github.com/bambulab/BambuStudio/blob/master/resources/profiles/BBL/machine/Bambu%20Lab%20A1%200.4%20nozzle%20template%20machine_start_gcode.json" target="_blank" rel="noopener">Bambu Studio: current A1 start G-code template</a>' +
      '<a href="https://github.com/SoftFever/OrcaSlicer" target="_blank" rel="noopener">OrcaSlicer on GitHub (the fork)</a>' +
      '<a href="https://wiki.bambulab.com/en/knowledge-sharing/enable-lan-mode" target="_blank" rel="noopener">Bambu wiki: LAN-only mode</a>' +
      '<a href="https://blog.bambulab.com/makerworld-one-step-printing/" target="_blank" rel="noopener">MakerWorld one-click printing</a>' +
      "</div>",
  });
})();
