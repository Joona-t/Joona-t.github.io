/* ch07 — Multi-color: AMS lite. One nozzle, four spools, honest waste math.
   Sims: "ams-swap" (animated swap sequence) + "flush-cost" (unit conversion
   from Bambu Studio's flushing-volume output; it does not invent a purge value). */
(function () {
  "use strict";

  /* Shared filament swatches (deliberate filament colors, not theme colors). */
  var FIL = [
    { key: "red",   name: "Red",   hex: "#d64545" },
    { key: "white", name: "White", hex: "#f2efe9" },
    { key: "green", name: "Green", hex: "#3fb765" },
    { key: "black", name: "Black", hex: "#26262b" },
  ];

  /* ---------------- sim 1: ams-swap (animated) ---------------- */

  A1.registerSim({
    id: "ams-swap",
    title: "Four spools, one nozzle: the swap",
    mount(api) {
      var cv = api.canvas(16 / 10);
      cv.setAria(
        "Schematic of the AMS lite: four open spools feed per-port drive gears " +
        "into PTFE tubes that merge at a four-port hub, then one tube runs to the " +
        "single toolhead. Pressing a color button plays the color-change sequence: " +
        "retract, cut, pull back to hub, load the next spool, purge, with waste " +
        "blobs dropping into a bin. The animation is a sequence diagram, not a " +
        "measurement of purge volume or swap time."
      );

      var STAGES = ["retract", "cut", "pullback", "load", "purge"];
      var DUR = { retract: 0.9, cut: 0.6, pullback: 1.4, load: 1.4, purge: 2.2 };
      var CAPTION = {
        print:    "printing — press a color to swap",
        retract:  "1 · retract — filament pulled out of the melt zone",
        cut:      "2 · cut — the toolhead cutter snips the filament",
        pullback: "3 · pull back — drive gear reels it back to the hub (spool back-rotates to keep tension)",
        load:     "4 · load — the next port feeds fresh filament to the toolhead",
        purge:    "5 · purge — old melt flushed out until the new color runs clean",
      };

      var active = 2;        // loaded spool index (start on green)
      var target = 2;
      var stage = "print";
      var st = 0;            // seconds in current stage
      var headX = 0;         // 0 = over part, 1 = over purge chute
      var hubToNoz = 1;      // fill of shared hub→nozzle line, 0..1
      var spin = [0, 0, 0, 0];
      var completedSwaps = 0;
      var poops = [];        // falling blobs
      var bin = [];          // settled blob colors
      var poopTimer = 0;
      var segs = [];         // printed part stripes {c, h}
      var segH = 0;
      var beadT = 0;

      FIL.forEach(function (c, i) {
        var b = api.button({
          label: "Switch to " + c.name,
          onClick: function () {
            if (i === active || stage !== "print") return;
            target = i; stage = "retract"; st = 0;
          },
        });
        b.el.style.borderLeft = "4px solid " + c.hex;
      });
      var ro = api.readout({ label: "" });

      function report() {
        ro.setText(
          "Loaded: " + FIL[active].name +
          (stage !== "print" ? " → " + FIL[target].name : "") +
          " · completed swaps: " + completedSwaps +
          " · purge amount comes from the sliced job"
        );
      }
      report();

      function step(dt) {
        st += dt;
        if (stage === "print") {
          spin[active] += dt * 1.6;
          beadT += dt;
          if (beadT > 0.5 && segH < 46) {
            beadT = 0; segs.push({ c: FIL[active].hex, h: 3 }); segH += 3;
          }
          headX = Math.max(0, headX - dt * 1.4);
        } else if (stage === "retract") {
          headX = Math.min(1, headX + dt * 1.4);
          if (st >= DUR.retract) { stage = "cut"; st = 0; }
        } else if (stage === "cut") {
          if (st >= DUR.cut) { stage = "pullback"; st = 0; }
        } else if (stage === "pullback") {
          hubToNoz = Math.max(0, 1 - st / DUR.pullback);
          spin[active] -= dt * 2.2; // schematic back-rotation to maintain tension
          if (st >= DUR.pullback) { stage = "load"; st = 0; }
        } else if (stage === "load") {
          hubToNoz = Math.min(1, st / DUR.load);
          spin[target] += dt * 2.2;
          if (st >= DUR.load) { stage = "purge"; st = 0; poopTimer = 0; }
        } else if (stage === "purge") {
          poopTimer -= dt;
          if (poopTimer <= 0) {
            poopTimer = 0.32;
            var mix = Math.min(1, st / DUR.purge);
            poops.push({ x: 0, y: 0, vy: 40, born: true, mix: mix });
          }
          if (st >= DUR.purge) {
            active = target; completedSwaps += 1; stage = "print"; st = 0;
          }
        }
        // poop physics (positions are offsets from nozzle/bin, resolved in draw)
        poops.forEach(function (p) { p.vy += 700 * dt; p.y += p.vy * dt; });
        report();
      }

      function lerpHex(a, b, t) {
        function ch(h, i) { return parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); }
        var r = Math.round(ch(a, 0) + (ch(b, 0) - ch(a, 0)) * t);
        var g = Math.round(ch(a, 1) + (ch(b, 1) - ch(a, 1)) * t);
        var bl = Math.round(ch(a, 2) + (ch(b, 2) - ch(a, 2)) * t);
        return "rgb(" + r + "," + g + "," + bl + ")";
      }

      function tubePoint(gx, gy, hx, hy, t) {
        // quadratic bezier gear → hub with a gentle sag
        var cx = (gx + hx) / 2, cy = (gy + hy) / 2 + 26;
        var u = 1 - t;
        return [
          u * u * gx + 2 * u * t * cx + t * t * hx,
          u * u * gy + 2 * u * t * cy + t * t * hy,
        ];
      }

      function draw() {
        var p = api.pal();
        var ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);
        ctx.font = "12px system-ui, sans-serif";

        var bedY = H * 0.88;
        var hubX = W * 0.55, hubY = H * 0.56;
        var partX = W * 0.36;
        var chuteX = W * 0.72;
        var thX = partX + (chuteX - partX) * headX;
        var thY = H * 0.70;
        var binX = W * 0.84, binW = Math.min(70, W * 0.1), binH = 44;

        // stage pipeline caption (top)
        var px = 12;
        ctx.textBaseline = "top";
        STAGES.forEach(function (s, i) {
          var on = stage === s;
          ctx.fillStyle = on ? p.accent : p.muted;
          ctx.font = (on ? "bold " : "") + "12px system-ui, sans-serif";
          var t = s + (i < STAGES.length - 1 ? "  →  " : "");
          ctx.fillText(t, px, 10);
          px += ctx.measureText(t).width;
        });
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillStyle = p.soft;
        ctx.fillText(CAPTION[stage], 12, 28);

        // AMS lite label
        ctx.fillStyle = p.muted;
        ctx.fillText("AMS lite — open spool tree (no enclosure)", 12, H * 0.075);

        // spools + gears + tubes
        for (var i = 0; i < 4; i++) {
          var sx = W * (0.12 + i * 0.14), sy = H * 0.22;
          var r = Math.min(W * 0.045, H * 0.085);
          var gx = sx, gy = sy + r + 16;
          var inX = hubX - 21 + i * 14, inY = hubY - 12;

          // tube (empty sheath)
          ctx.strokeStyle = p.border; ctx.lineWidth = 5; ctx.beginPath();
          for (var t0 = 0; t0 <= 1.001; t0 += 0.1) {
            var pt = tubePoint(gx, gy + 8, inX, inY, Math.min(1, t0));
            if (t0 === 0) ctx.moveTo(pt[0], pt[1]); else ctx.lineTo(pt[0], pt[1]);
          }
          ctx.stroke();
          // filament inside tube: every port parked at the hub, ready
          ctx.strokeStyle = FIL[i].hex; ctx.lineWidth = 2.5; ctx.beginPath();
          for (var t1 = 0; t1 <= 1.001; t1 += 0.1) {
            var pt1 = tubePoint(gx, gy + 8, inX, inY, Math.min(1, t1));
            if (t1 === 0) ctx.moveTo(pt1[0], pt1[1]); else ctx.lineTo(pt1[0], pt1[1]);
          }
          ctx.stroke();

          // spool: rim + colored filament + rotating spokes
          ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = FIL[i].hex; ctx.fill();
          ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.arc(sx, sy, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = p.panel; ctx.fill(); ctx.stroke();
          ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 2;
          for (var k = 0; k < 3; k++) {
            var a = spin[i] + (k * Math.PI * 2) / 3;
            ctx.beginPath();
            ctx.moveTo(sx + Math.cos(a) * r * 0.4, sy + Math.sin(a) * r * 0.4);
            ctx.lineTo(sx + Math.cos(a) * r * 0.15, sy + Math.sin(a) * r * 0.15);
            ctx.stroke();
          }
          // drive gear
          ctx.fillStyle = (i === active || (stage !== "print" && i === target)) ? p.accent : p.panel2;
          ctx.strokeStyle = p.borderStrong;
          ctx.beginPath(); ctx.arc(gx, gy, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          for (var k2 = 0; k2 < 8; k2++) {
            var a2 = spin[i] * 2 + (k2 * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(gx + Math.cos(a2) * 7, gy + Math.sin(a2) * 7);
            ctx.lineTo(gx + Math.cos(a2) * 10, gy + Math.sin(a2) * 10);
            ctx.stroke();
          }
        }

        // hub
        ctx.fillStyle = p.panel2; ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1.5;
        ctx.fillRect(hubX - 28, hubY - 12, 56, 24);
        ctx.strokeRect(hubX - 28, hubY - 12, 56, 24);
        ctx.fillStyle = p.muted; ctx.textAlign = "left";
        ctx.fillText("4-port hub", hubX + 34, hubY - 8);

        // shared tube hub → toolhead
        ctx.strokeStyle = p.border; ctx.lineWidth = 5; ctx.beginPath();
        ctx.moveTo(hubX, hubY + 12);
        ctx.quadraticCurveTo(hubX, (hubY + thY) / 2, thX, thY - 16);
        ctx.stroke();
        if (hubToNoz > 0.02) {
          var fillCol = (stage === "load") ? FIL[target].hex : FIL[active].hex;
          ctx.strokeStyle = fillCol; ctx.lineWidth = 2.5;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(hubX, hubY + 12);
          ctx.quadraticCurveTo(hubX, (hubY + thY) / 2, thX, thY - 16);
          ctx.setLineDash([200 * hubToNoz, 999]);
          ctx.stroke();
          ctx.restore();
        }

        // toolhead + nozzle
        ctx.fillStyle = p.panel; ctx.strokeStyle = p.borderStrong;
        ctx.fillRect(thX - 16, thY - 16, 32, 26);
        ctx.strokeRect(thX - 16, thY - 16, 32, 26);
        ctx.beginPath();
        ctx.moveTo(thX - 6, thY + 10); ctx.lineTo(thX + 6, thY + 10); ctx.lineTo(thX, thY + 20);
        ctx.closePath();
        ctx.fillStyle = p.borderStrong; ctx.fill();
        // cutter flash
        if (stage === "cut") {
          var cp = Math.sin((st / DUR.cut) * Math.PI);
          ctx.strokeStyle = p.warn; ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(thX - 22 + cp * 20, thY - 22);
          ctx.lineTo(thX - 10 + cp * 20, thY - 8);
          ctx.stroke();
          ctx.fillStyle = p.warn;
          ctx.fillText("snip", thX + 20, thY - 24);
        }
        ctx.fillStyle = p.muted;
        ctx.fillText("cutter + nozzle", thX + 20, thY - 8);

        // bed
        ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(W * 0.1, bedY); ctx.lineTo(W * 0.78, bedY); ctx.stroke();
        ctx.fillStyle = p.muted; ctx.fillText("bed", W * 0.1, bedY + 6);

        // printed part (color stripes)
        var yAcc = bedY;
        segs.forEach(function (s) {
          yAcc -= s.h;
          ctx.fillStyle = s.c;
          ctx.fillRect(partX - 26, yAcc, 52, s.h);
        });
        ctx.strokeStyle = p.border; ctx.lineWidth = 1;
        if (segH > 0) ctx.strokeRect(partX - 26, bedY - segH, 52, segH);

        // purge chute + bin
        ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(chuteX + 6, bedY - 4); ctx.lineTo(binX - binW / 2 + 6, bedY + 18);
        ctx.stroke();
        ctx.fillStyle = p.muted; ctx.fillText("chute", chuteX + 10, bedY - 20);
        ctx.beginPath();
        ctx.moveTo(binX - binW / 2, bedY + 14); ctx.lineTo(binX - binW / 2, bedY + 14 + binH);
        ctx.lineTo(binX + binW / 2, bedY + 14 + binH); ctx.lineTo(binX + binW / 2, bedY + 14);
        ctx.stroke();
        // settled poops
        bin.slice(-24).forEach(function (c, idx) {
          var col = idx % 6, row = Math.floor(idx / 6);
          ctx.beginPath();
          ctx.arc(binX - binW / 2 + 9 + col * 10, bedY + 8 + binH - row * 9, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = c; ctx.fill();
          ctx.strokeStyle = p.border; ctx.lineWidth = 1; ctx.stroke();
        });
        ctx.fillStyle = p.muted;
        ctx.textAlign = "center";
        ctx.fillText("waste bin (“poops”)", binX, bedY + 22 + binH);
        ctx.textAlign = "left";

        // falling poops: resolve from nozzle, settle into bin list
        for (var pi = poops.length - 1; pi >= 0; pi--) {
          var pp = poops[pi];
          var pxx = thX + (binX - thX) * Math.min(1, pp.y / (bedY + 14 + binH - thY));
          var pyy = thY + 20 + pp.y;
          if (pyy >= bedY + 10 + binH) {
            bin.push(lerpHex(FIL[active].hex, FIL[target].hex, pp.mix));
            poops.splice(pi, 1);
            continue;
          }
          ctx.beginPath(); ctx.arc(pxx, pyy, 5, 0, Math.PI * 2);
          ctx.fillStyle = lerpHex(FIL[active].hex, FIL[target].hex, pp.mix);
          ctx.fill();
          ctx.strokeStyle = p.border; ctx.lineWidth = 1; ctx.stroke();
        }

        // Honest status: the animation does not infer a mass from color names.
        ctx.fillStyle = p.text;
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("sequence only · " + completedSwaps + " swap(s)", W - 12, 10);
        ctx.textAlign = "left";
        ctx.font = "12px system-ui, sans-serif";
      }

      api.raf(function (t, dt) {
        if (dt > 0) step(dt);
        draw();
      });
    },
  });

  /* ---------------- sim 2: flush-cost (static, control-driven) ---------------- */

  A1.registerSim({
    id: "flush-cost",
    title: "What a color change costs",
    mount(api) {
      var cv = api.canvas(16 / 12);
      cv.setAria(
        "Unit-conversion chart. Enter the flushing volume reported by Bambu Studio, " +
        "the number of that transition, and the filament density. The tool converts " +
        "cubic millimetres to grams; it does not predict a flushing volume."
      );

      var fromIdx = 3, toIdx = 1, changes = 12;
      var volumeMm3 = 280, density = 1.24;
      var opts = FIL.map(function (c, i) { return { value: String(i), label: c.name }; });

      function asNumberInput(control) {
        var input = control.el.querySelector("input");
        input.type = "number";
        input.inputMode = "decimal";
        input.style.width = "100%";
        input.style.minHeight = "44px";
        input.style.boxSizing = "border-box";
        input.style.padding = "4px 10px";
        input.style.border = "1px solid var(--border)";
        input.style.borderRadius = "var(--radius-sm)";
        input.style.background = "var(--panel-2)";
        input.style.color = "var(--text)";
        input.style.font = "14px var(--sans)";
        return control;
      }

      function massText(grams) {
        var magnitude = Math.abs(grams);
        if (magnitude === 0) return "0 g";
        if (magnitude < 0.01) return grams.toFixed(4) + " g";
        if (magnitude < 1) return grams.toFixed(3) + " g";
        if (magnitude < 100) return grams.toFixed(2) + " g";
        return grams.toFixed(1) + " g";
      }

      api.select({
        label: "From color", options: opts, value: "3",
        onChange: function (v) { fromIdx = parseInt(v, 10); api.once(draw); },
      });
      api.select({
        label: "To color", options: opts, value: "1",
        onChange: function (v) { toIdx = parseInt(v, 10); api.once(draw); },
      });
      asNumberInput(api.slider({
        label: "Occurrences of this transition", min: 1, max: 10000, step: 1, value: 12, unit: "swaps",
        onInput: function (v) { if (Number.isFinite(v) && v >= 1 && v <= 10000) changes = v; api.once(draw); },
      }));
      asNumberInput(api.slider({
        label: "Studio flushing volume (copy from sliced job)", min: 0, max: 5000, step: 1,
        value: 280, unit: "mm³/change",
        onInput: function (v) { if (Number.isFinite(v) && v >= 0 && v <= 5000) volumeMm3 = v; api.once(draw); },
      }));
      asNumberInput(api.slider({
        label: "Filament density (copy from data sheet)", min: 0.5, max: 3, step: 0.001,
        value: 1.24,
        format: function (v) { return v.toFixed(3) + " g/cm³"; },
        onInput: function (v) { if (Number.isFinite(v) && v >= 0.5 && v <= 3) density = v; api.once(draw); },
      }));
      var ro = api.readout({ label: "" });

      function bar(ctx, p, x, y, w, h, frac, color) {
        ctx.fillStyle = p.panel2; ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = p.border; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.min(1, frac), h);
      }

      function draw() {
        var p = api.pal();
        var ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);
        ctx.font = "12px system-ui, sans-serif";
        ctx.textBaseline = "top";

        // 1 cm³ = 1000 mm³. This is a unit conversion, not a purge model.
        var per = (volumeMm3 / 1000) * density;
        var totalVolume = volumeMm3 * changes;
        var total = (totalVolume / 1000) * density;

        // swatch pair
        var sw = 34, sx = 16, sy = 14;
        ctx.fillStyle = FIL[fromIdx].hex; ctx.fillRect(sx, sy, sw, sw);
        ctx.strokeStyle = p.borderStrong; ctx.strokeRect(sx, sy, sw, sw);
        ctx.fillStyle = p.text;
        ctx.fillText("→", sx + sw + 10, sy + 10);
        ctx.fillStyle = FIL[toIdx].hex; ctx.fillRect(sx + sw + 30, sy, sw, sw);
        ctx.strokeStyle = p.borderStrong; ctx.strokeRect(sx + sw + 30, sy, sw, sw);
        ctx.fillStyle = p.soft;
        ctx.fillText(FIL[fromIdx].name + " → " + FIL[toIdx].name, sx + sw * 2 + 44, sy + 2);
        ctx.fillStyle = p.muted;
        ctx.fillText(
          "pair only; volume is your input",
          sx + sw * 2 + 44, sy + 18
        );

        var bx = 16, bw = W - 32, bh = 20;

        // Per-change bar uses an expanding reference so manually entered values stay visible.
        var y1 = sy + sw + 22;
        var volumeScale = Math.max(1000, Math.ceil(volumeMm3 / 1000) * 1000);
        ctx.fillStyle = p.soft;
        ctx.fillText(volumeMm3 + " mm³ × " + density.toFixed(3) + " g/cm³ = " + massText(per) + "/change", bx, y1 - 2);
        bar(ctx, p, bx, y1 + 14, bw, bh, volumeMm3 / volumeScale, p.accent);
        ctx.fillStyle = p.muted;
        ctx.textAlign = "right"; ctx.fillText("visual scale: " + volumeScale + " mm³", bx + bw, y1 - 2); ctx.textAlign = "left";

        // Total volume; normalize to the current input range, not a fake spool scale.
        var y2 = y1 + 14 + bh + 26;
        ctx.fillStyle = p.soft;
        ctx.fillText(
          "this transition × " + changes + " = " + totalVolume + " mm³ = " + massText(total),
          bx, y2 - 2
        );
        ctx.fillStyle = p.muted;
        ctx.textAlign = "right"; ctx.fillText("same pair repeated", bx + bw, y2 - 2); ctx.textAlign = "left";
        bar(ctx, p, bx, y2 + 14, bw, bh, changes / Math.max(100, Math.ceil(changes / 100) * 100), p.warn);

        // captions
        var y3 = H - 52;
        ctx.fillStyle = p.muted;
        ctx.fillText("Studio decides the flushing volume and may route eligible flush into infill/support.", bx, y3);
        ctx.fillText("That routing changes where plastic goes; this tool does not guess net model savings.", bx, y3 + 15);
        ctx.fillText("Formula: grams = mm³ ÷ 1000 × g/cm³.", bx, y3 + 32);

        ro.setText(
          volumeMm3 + " mm³/change × " + changes + " × " + density.toFixed(3) +
          " g/cm³ = " + massText(total) + " for this repeated transition. " +
          "Volume must come from the sliced job."
        );
      }

      cv.onResize(function () { draw(); });
      api.once(draw);
    },
  });

  /* ---------------- chapter ---------------- */

  A1.registerChapter({
    n: 7,
    tier: "Intermediate",
    title: "Multi-color: AMS lite",
    claims: ["CMP-001", "CMP-002", "CMP-003", "CMP-004", "CMP-006", "QNT-001"],
    html:
      '<div class="note"><strong>Objective.</strong> Explain one AMS lite color change, estimate mass only from a sliced job\'s flushing volume, and choose a feed path that is compatible with the exact filament. <strong>Assumption:</strong> current A1-series firmware and Bambu Studio; compatibility can change by material SKU and region.</div>' +
      "<h3>One nozzle, four spools</h3>" +
      "<p>The A1 has exactly one hotend, so “multi-color” can't mean four nozzles. It means <strong>time-sharing</strong>: only one filament occupies the melt zone at a time, and the printer physically swaps filaments whenever the color changes. The machine that does the swapping is the <strong>AMS lite</strong> — an open, motorized spool tree that sits beside (or on top of) the printer and holds up to four spools.</p>" +
      "<div class=\"warn\"><strong>Open, not sealed.</strong> AMS lite is open to room air: it is not a drybox and has no active drying. The original AMS, AMS 2 Pro, and AMS HT are different products. Official A1 compatibility and accessory pages currently differ by region, so this tutorial intentionally makes <strong>no global claim</strong> that an enclosed AMS works with the A1. Use only the exact combination documented for your printer, firmware, accessories, and region; do not infer compatibility from the connector shape.</div>" +
      "<div class=\"facts\">" +
      "<div class=\"fact\"><div class=\"v\">4</div><div class=\"k\">spools per AMS lite (max)</div></div>" +
      "<div class=\"fact\"><div class=\"v\">tensioned</div><div class=\"k\">holder takes up slack during retract</div></div>" +
      "<div class=\"fact\"><div class=\"v\">2 short + 2 long</div><div class=\"k\">route exactly as the supplied guide shows</div></div>" +
      "<div class=\"fact\"><div class=\"v\">mm³</div><div class=\"k\">Studio reports flushing volume</div></div>" +
      "</div>" +
      "<h3 id=\"diagnose-ams-feed\">The hardware, port by port</h3>" +
      "<p>Each of the four ports has its own motorized drive gear, and each gear watches its filament with <strong>slip-detecting odometry</strong>: the motor has a speed sensor, the passing filament turns a small odometer wheel, and the firmware compares the two. If the motor spins but the filament doesn't move, it's slipping or has run out.</p>" +
      "<p>The spool holders are spring-loaded rotary claws that grip the spool by its center hole. During retraction the holder takes up limited slack to help keep the filament controlled; this schematic does not claim a universal rotation angle. Bambu spools also carry <strong>RFID tags</strong> the AMS lite reads to identify supported filament information. Verify the loaded profile rather than assuming RFID stores every calibration value.</p>" +
      "<p>From the gears, each filament runs through its own PTFE tube into the toolhead hub. Use the two shorter and two longer tubes in the ports and routing shown by the <a href=\"https://cdn1.bambulab.com/documentation/quick-start-b5f1a684f77/A1%20Combo%20Quick%20Start_V0%28EN%29.pdf\" target=\"_blank\" rel=\"noopener\">current A1 Combo Quick Start Guide</a>. Bambu's official listings are not globally consistent about the longer replacement-tube SKU, so this tutorial intentionally does not give one universal cut length. Avoid kinks, snags, and tension through the bed's full travel.</p>" +
      "<h3>Anatomy of a color change</h3>" +
      "<p>Because there's one hotend, every color change is a full swap: finish the segment, <strong>retract</strong>, the toolhead cutter <strong>snips</strong> the filament, the drive gear <strong>reels the old color back</strong> to the hub, the next port <strong>loads</strong> fresh filament, and the nozzle <strong>flushes</strong> the old melt until the new color runs clean. (Chapter 3 covers what's happening inside that melt zone.) Most flushing is expelled through the purge chute; eligible flush can instead be routed into model infill or supports. A <strong>prime tower is separate</strong>: it is printed to re-establish stable nozzle pressure and flow around tool changes, not simply as a bin for all flushed material.</p>" +
      '<p><strong>Predict before playing:</strong> which transition will usually need more flushing, black to white or white to black? Then run both. Interpret the animation as an order of operations only; its speed and blob count are not measurements.</p>' +
      "<div data-sim=\"ams-swap\"></div>" +
      "<h3>The honest waste math</h3>" +
      "<p>Purging exists because the melt zone holds a small reservoir of the old color that has to be flushed before the new one runs true. Bambu Studio auto-computes the flush volume for every color pair, and the direction matters: <strong>dark → light is the expensive direction</strong>, because a trace of black is obvious in white while a trace of white vanishes in black. Waste scales with the number of change events — on a swap-heavy print it can rival or even exceed the weight of the model itself.</p>" +
      "<p>Do not use a grams-per-color rule of thumb. Open the sliced plate's flushing-volumes matrix and Preview: Studio's value is in cubic millimetres for each transition, and the actual job also depends on transition count, prime tower, and eligible purge-to-infill/support. The converter below performs only the defensible unit conversion, <code>grams = mm³ ÷ 1000 × density in g/cm³</code>. Bambu's <a href=\"https://wiki.bambulab.com/en/software/bambu-studio/reduce-wasting-during-filament-change\" target=\"_blank\" rel=\"noopener\">official waste-reduction guide</a> is the authority for the current controls.</p>" +
      "<div data-sim=\"flush-cost\"></div>" +
      '<p><strong>Transfer:</strong> slice one of your own multicolor models, copy one pair\'s flushing volume and the spool density into the converter, then reduce one color transition per layer and compare Preview again.</p>' +
      "<div class=\"note\"><strong>Current compatibility, not a blanket ban.</strong> A1 accepts one AMS lite for four slots. For AMS lite, dry PVA/BVOH and <a href=\"https://us.store.bambulab.com/products/pla-cf\" target=\"_blank\" rel=\"noopener\">Bambu PLA-CF</a> are mutually listed as supported by their current U.S. product pages, while wet PVA/BVOH, generic soft TPU/TPE, TPU 95A, and many brittle/abrasive CF/GF or glow filaments are unsupported or not recommended. The special <a href=\"https://us.store.bambulab.com/products/tpu-for-ams\" target=\"_blank\" rel=\"noopener\">TPU for AMS</a> is a named exception. <strong>Do not load PAHT-CF through AMS lite:</strong> its product page says AMS lite is not compatible even though the current AMS lite matrix conflicts; the conservative intersection withholds support. Check the exact spool against the live <a href=\"https://us.store.bambulab.com/en/products/ams-lite\" target=\"_blank\" rel=\"noopener\">AMS lite compatibility table</a> and its own product page. Feeder compatibility does not make an open-frame material suitable for the printer.</div>" +
      "<div class=\"go-deeper\"><div class=\"gd-title\">Go deeper</div>" +
      "<a href=\"https://wiki.bambulab.com/en/ams-lite/manual/intro-ams-lite\" target=\"_blank\" rel=\"noopener\">AMS lite intro (Bambu wiki)</a>" +
      "<a href=\"https://3dpros.com/printer-content/ams-lite-hands-on\" target=\"_blank\" rel=\"noopener\">AMS lite hands-on teardown</a>" +
      "<a href=\"https://wiki.bambulab.com/en/software/bambu-studio/reduce-wasting-during-filament-change\" target=\"_blank\" rel=\"noopener\">Reducing flush waste (Bambu Studio)</a>" +
      "<a href=\"https://wiki.bambulab.com/en/a1/manual/ams-connection-guide\" target=\"_blank\" rel=\"noopener\">A1 AMS connection guide</a>" +
      "</div>",
  });
})();
