/* ch03 — How it melts: extruder, hotend, flow ceiling, quick-swap nozzles */
(function () {
  "use strict";

  /* ============================================================
     SIM 1 — melt-flow (animated cutaway toolhead)
     ============================================================ */
  A1.registerSim({
    id: "melt-flow",
    title: "Profile flow cap: slow the path, keep the bead",
    mount(api) {
      const cv = api.canvas(16 / 10);
      let requestedSpeed = 300; // mm/s
      let layerH = 0.20;        // mm
      let profileCap = 20;      // mm³/s, selected filament-profile limit
      let applyProfileCap = true;
      let capacityScenario = "matched";
      const LINE_W = 0.42;      // mm, fixed example for a stock 0.4 mm nozzle
      const LOWER_CAPACITY_FACTOR = 0.75; // invented diagnostic scenario

      let gearA = 0, filOff = 0, bedOff = 0, fanA = 0, airOff = 0;

      api.slider({
        label: "Requested straight-line speed", min: 50, max: 500, step: 10, value: requestedSpeed,
        unit: "mm/s",
        onInput: (v) => { requestedSpeed = v; refresh(); draw(); },
      });
      api.slider({
        label: "Layer height", min: 0.08, max: 0.28, step: 0.01, value: layerH,
        format: (v) => v.toFixed(2) + " mm",
        onInput: (v) => { layerH = v; refresh(); draw(); },
      });
      api.slider({
        label: "Filament-profile flow limit", min: 4, max: 40, step: 1, value: profileCap,
        unit: "mm³/s",
        onInput: (v) => { profileCap = v; refresh(); draw(); },
      });
      api.toggle({
        label: "Apply selected profile cap", value: applyProfileCap,
        onChange: (v) => { applyProfileCap = v; refresh(); draw(); },
      });
      api.select({
        label: "Physical-capacity scenario",
        value: "matched",
        options: [
          { value: "matched", label: "Capacity ≥ selected limit (normal assumption)" },
          { value: "lower", label: "Illustrative capacity 25% lower (mis-set / changed setup)" },
        ],
        onChange: (v) => { capacityScenario = v; refresh(); draw(); },
      });
      const ro = api.readout({});

      function requestedDemand() { return requestedSpeed * layerH * LINE_W; }
      function trueCapacity() {
        return capacityScenario === "lower"
          ? profileCap * LOWER_CAPACITY_FACTOR
          : profileCap;
      }
      function effectiveSpeed() {
        if (!applyProfileCap) return requestedSpeed;
        return Math.min(requestedSpeed, profileCap / (layerH * LINE_W));
      }
      function model() {
        const req = requestedDemand();
        const speed = effectiveSpeed();
        const commanded = speed * layerH * LINE_W;
        const physical = trueCapacity();
        const delivered = Math.min(commanded, physical);
        return {
          requested: req,
          speed: speed,
          commanded: commanded,
          physical: physical,
          delivered: delivered,
          ratio: commanded > 0 ? delivered / commanded : 1,
        };
      }
      function refresh() {
        const m = model();
        const wasCapped = applyProfileCap && m.speed < requestedSpeed - 0.05;
        let state;
        if (m.ratio < 0.999) {
          const cause = !applyProfileCap && capacityScenario === "lower"
            ? "profile cap disabled and illustrative true capacity below the selected limit"
            : !applyProfileCap
              ? "profile cap disabled"
              : "selected limit is mis-set above the illustrative true capacity";
          state = '<span style="color:var(--danger);font-weight:600">fault scenario: ' +
            cause + " → bead receives " + Math.round(m.ratio * 100) + "% of commanded volume</span>";
        } else if (wasCapped) {
          state = '<span style="color:var(--accent)">cap ON → effective speed reduced; full bead under the matched-capacity assumption</span>';
        } else {
          state = '<span style="color:var(--accent)">command fits the active assumptions; full bead</span>';
        }
        ro.set(
          "requested <strong>" + requestedSpeed.toFixed(0) + " mm/s</strong> = " +
          "<strong>" + m.requested.toFixed(1) + " mm³/s</strong> at 0.42 mm × " +
          layerH.toFixed(2) + " mm · selected limit <strong>" + profileCap.toFixed(0) +
          " mm³/s</strong> · effective speed <strong>" + m.speed.toFixed(1) +
          " mm/s</strong> · " + state
        );
        cv.setAria(
          "Fixed-width straight-line flow model for a 0.4 millimeter nozzle and 0.42 millimeter line. " +
          "Requested speed " + requestedSpeed.toFixed(0) + " millimeters per second; effective speed " +
          m.speed.toFixed(1) + ". Selected profile limit " + profileCap.toFixed(0) +
          " cubic millimeters per second. " + (m.ratio < 0.999
            ? "An explicitly selected fault scenario shows under-extrusion because the cap is disabled or the true capacity is lower than the selected limit."
            : "The deposited bead stays full under the active capacity assumption.")
        );
      }

      function lbl(ctx, p, t, x, y, align) {
        ctx.fillStyle = p.muted;
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = align || "left";
        ctx.textBaseline = "middle";
        ctx.fillText(t, x, y);
      }

      function drawGear(ctx, p, x, y, r, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = p.soft;
        ctx.beginPath();
        for (let i = 0; i < 9; i++) {
          const ang = (i / 9) * Math.PI * 2;
          ctx.moveTo(Math.cos(ang) * r * 0.55, Math.sin(ang) * r * 0.55);
          ctx.lineTo(Math.cos(ang) * r * 0.92, Math.sin(ang) * r * 0.92);
        }
        ctx.stroke();
        ctx.fillStyle = p.accent;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      function drawFan(ctx, p, x, y, s, a) {
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong;
        ctx.lineWidth = 1.5;
        ctx.fillRect(x, y, s, s);
        ctx.strokeRect(x, y, s, s);
        ctx.save();
        ctx.translate(x + s / 2, y + s / 2);
        ctx.rotate(a);
        ctx.strokeStyle = p.soft;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.moveTo(0, 0);
          ctx.lineTo(s * 0.34, 0);
        }
        ctx.stroke();
        ctx.fillStyle = p.accent;
        ctx.beginPath(); ctx.arc(0, 0, s * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      function draw() {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);

        const cx = W * 0.42;
        const filW = Math.max(4, H * 0.018);
        const gearY = H * 0.20, gr = H * 0.075;
        const finT = H * 0.30, finB = H * 0.46, finW = W * 0.15;
        const brkT = finB, brkB = H * 0.52;
        const blkT = brkB, blkB = H * 0.65, blkW = W * 0.16;
        const nozB = H * 0.73;
        const beadH = Math.max(3, layerH * H * 0.14);
        const layerTop = nozB + beadH;
        const slabB = H * 0.92;

        const m = model();
        const ratio = m.ratio;
        const hot = "#ff8a3c";

        // printed layers slab + bed
        ctx.fillStyle = p.panel;
        ctx.fillRect(0, layerTop, W, slabB - layerTop);
        ctx.strokeStyle = p.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = layerTop + beadH; y < slabB - 2; y += Math.max(6, beadH)) {
          ctx.moveTo(0, y); ctx.lineTo(W, y);
        }
        ctx.stroke();
        // scrolling scallops on the top of the previous layer
        const P = 16, off = ((bedOff % P) + P) % P;
        ctx.strokeStyle = p.borderStrong;
        ctx.beginPath();
        for (let x = -off; x < W + P; x += P) ctx.arc(x, layerTop, P * 0.38, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = p.panel2;
        ctx.fillRect(0, slabB, W, H - slabB);
        ctx.strokeStyle = p.borderStrong;
        ctx.beginPath(); ctx.moveTo(0, slabB); ctx.lineTo(W, slabB); ctx.stroke();

        // fresh bead trail (bed moves left, so the trail is left of the nozzle)
        const cy = nozB + beadH / 2;
        const th = Math.max(2, beadH * (0.3 + 0.7 * ratio));
        const grad = ctx.createLinearGradient(cx, 0, cx - W * 0.4, 0);
        grad.addColorStop(0, hot);
        grad.addColorStop(1, p.accent);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, nozB - 1, cx, beadH + 2);
        ctx.clip();
        ctx.fillStyle = grad;
        if (ratio > 0.98) {
          ctx.fillRect(0, cy - th / 2, cx, th);
        } else {
          const per = 34, onW = per * Math.max(0.25, ratio * 0.85);
          const o2 = ((bedOff % per) + per) % per;
          for (let x = cx - o2 + per; x > -per; x -= per) ctx.fillRect(x - onW, cy - th / 2, onW, th);
        }
        ctx.restore();

        // heatsink fins
        ctx.fillStyle = p.panel2;
        const finN = 5, finStep = (finB - finT) / finN;
        for (let i = 0; i < finN; i++) ctx.fillRect(cx - finW / 2, finT + i * finStep, finW, finStep * 0.55);

        // heatbreak
        ctx.fillStyle = p.panel2;
        ctx.fillRect(cx - filW * 0.9, brkT, filW * 1.8, brkB - brkT);

        // heater block + glow
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong;
        ctx.fillRect(cx - blkW / 2, blkT, blkW, blkB - blkT);
        ctx.strokeRect(cx - blkW / 2, blkT, blkW, blkB - blkT);
        const tN = 0.55; // visual glow only; the model does not infer flow from temperature
        const gcy = (blkT + blkB) / 2;
        const rg = ctx.createRadialGradient(cx, gcy, 2, cx, gcy, blkW * 0.55);
        rg.addColorStop(0, "rgba(255,140,50," + (0.55 + 0.4 * tN).toFixed(2) + ")");
        rg.addColorStop(1, "rgba(255,140,50,0)");
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - blkW / 2, blkT, blkW, blkB - blkT);
        ctx.clip();
        ctx.fillStyle = rg;
        ctx.fillRect(cx - blkW / 2, blkT, blkW, blkB - blkT);
        ctx.restore();

        // nozzle taper
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong;
        ctx.beginPath();
        ctx.moveTo(cx - blkW * 0.22, blkB);
        ctx.lineTo(cx + blkW * 0.22, blkB);
        ctx.lineTo(cx + filW * 0.7, nozB);
        ctx.lineTo(cx - filW * 0.7, nozB);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // filament strand (cold accent above, molten below)
        const gs = ctx.createLinearGradient(0, 0, 0, nozB);
        gs.addColorStop(0, p.accent);
        gs.addColorStop(0.55, p.accent);
        gs.addColorStop(0.68, hot);
        gs.addColorStop(1, hot);
        ctx.strokeStyle = gs;
        ctx.lineWidth = filW;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx, H * 0.03);
        ctx.lineTo(cx, nozB - 1);
        ctx.stroke();
        // moving grip marks on the solid section only
        ctx.strokeStyle = p.bg;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = filW * 0.5;
        ctx.setLineDash([4, 12]);
        ctx.lineDashOffset = -filOff;
        ctx.beginPath();
        ctx.moveTo(cx, H * 0.03);
        ctx.lineTo(cx, blkT);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        // squish highlight at the nozzle exit
        ctx.fillStyle = "#ffb066";
        ctx.beginPath();
        ctx.ellipse(cx, cy, filW * 0.9, Math.max(1.5, th * 0.55), 0, 0, Math.PI * 2);
        ctx.fill();

        // drive gears (counter-rotating)
        drawGear(ctx, p, cx - (gr + filW * 0.6), gearY, gr, gearA);
        drawGear(ctx, p, cx + (gr + filW * 0.6), gearY, gr, -gearA);

        // hotend (heatsink) fan
        const hfs = H * 0.07;
        const hfx = cx - finW / 2 - hfs - 8, hfy = (finT + finB) / 2 - hfs / 2;
        drawFan(ctx, p, hfx, hfy, hfs, fanA);
        lbl(ctx, p, "hotend fan", hfx + hfs / 2, finT - 10, "center");

        // part-cooling fan + air stream
        const fs = H * 0.10;
        const fx = cx + W * 0.20, fy = H * 0.60;
        drawFan(ctx, p, fx, fy, fs, fanA * 1.25);
        lbl(ctx, p, "part-cooling fan", fx + fs / 2, fy - 12, "center");
        ctx.strokeStyle = p.soft;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 7]);
        ctx.lineDashOffset = -airOff;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          ctx.moveTo(fx - 4, fy + fs * (0.3 + i * 0.25));
          ctx.lineTo(cx + 20, cy - 3 + i * 3);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // labels
        lbl(ctx, p, "filament 1.75 mm", cx - filW - 8, H * 0.06, "right");
        lbl(ctx, p, "dual drive gears", cx + gr * 2 + filW + 12, gearY, "left");
        lbl(ctx, p, "heatsink · cold zone", cx + finW / 2 + 10, (finT + finB) / 2, "left");
        lbl(ctx, p, "melt zone", cx - blkW / 2 - 10, gcy, "right");
        lbl(ctx, p, "heated melt zone", cx + blkW / 2 + 10, gcy, "left");
        lbl(ctx, p, "nozzle", cx - blkW * 0.22 - 10, (blkB + nozB) / 2, "right");
        lbl(ctx, p, "printed layers", W * 0.03, (layerTop + slabB) / 2, "left");
      }

      cv.onResize(() => draw());
      refresh();

      api.raf((t, dt) => {
        const m = model();
        gearA += dt * (0.6 + m.delivered * 0.09);
        filOff += dt * (6 + m.delivered * 2.2);
        bedOff += dt * m.speed * 0.55;
        fanA += dt * (6 + m.speed * 0.02);
        airOff += dt * (24 + m.speed * 0.12);
        draw();
      });
    },
  });

  /* ============================================================
     SIM 2 — layers (static wall cross-section, api.once)
     ============================================================ */
  A1.registerSim({
    id: "layers",
    title: "Beads, layers & the detail-vs-path-work tradeoff",
    mount(api) {
      const cv = api.canvas(16 / 9);
      let noz = 0.4;
      let layerH = 0.2;

      api.select({
        label: "Nozzle Ø",
        options: [
          { value: "0.2", label: "0.2 mm (fine detail)" },
          { value: "0.4", label: "0.4 mm (stock)" },
          { value: "0.6", label: "0.6 mm" },
          { value: "0.8", label: "0.8 mm (draft)" },
        ],
        value: "0.4",
        onChange: (v) => { noz = parseFloat(v); refresh(); api.once(draw); },
      });
      api.slider({
        label: "Layer height", min: 0.04, max: 0.6, step: 0.02, value: layerH,
        format: (v) => v.toFixed(2) + " mm",
        onInput: (v) => { layerH = v; refresh(); api.once(draw); },
      });
      const ro = api.readout({});

      function lineW() { return noz * 1.05; }
      function bucket() {
        if (layerH <= 0.10) return "very fine layer steps";
        if (layerH <= 0.16) return "fine layer steps";
        if (layerH <= 0.24) return "moderate layer steps";
        return "coarse layer steps";
      }
      function refresh() {
        const layers = Math.ceil(50 / layerH);
        const work = (0.2 * 0.42) / (layerH * lineW());
        const workLabel = work > 1.5 ? "more path work than the stock example" :
          work < 0.75 ? "less path work than the stock example" : "similar path-work scale";
        const warn = layerH > 0.75 * noz
          ? ' · <span style="color:var(--danger);font-weight:600">above this playground\'s 75% caution guide — verify the real nozzle/profile</span>'
          : "";
        ro.set(
          "<strong>" + layers + " layers</strong> for a 5 cm part · " +
          "assumed line width " + lineW().toFixed(2) + " mm · " + workLabel + " · " + bucket() + warn
        );
      }

      function lbl(ctx, p, t, x, y, align) {
        ctx.fillStyle = p.muted;
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = align || "left";
        ctx.textBaseline = "middle";
        ctx.fillText(t, x, y);
      }

      function bar(ctx, p, x, y, w, label, frac, txt) {
        lbl(ctx, p, label, x, y - 12, "left");
        ctx.fillStyle = p.text;
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(txt, x + w, y - 12);
        ctx.fillStyle = p.border;
        ctx.fillRect(x, y, w, 6);
        const f = Math.max(0, Math.min(1, frac));
        ctx.fillStyle = p.accent;
        ctx.beginPath();
        ctx.arc(x + f * w, y + 3, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      function draw() {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);

        const lw = lineW();
        const pxPerMm = (H * 0.66) / 2.0;
        const baseY = H * 0.90;
        const cxW = W * 0.30;
        const bw = lw * pxPerMm;
        const bh = Math.max(2, layerH * pxPerMm);
        const overTall = layerH > 0.75 * noz;
        const beadW = overTall ? bw * 0.85 : bw;

        // ground line
        ctx.strokeStyle = p.borderStrong;
        ctx.beginPath(); ctx.moveTo(W * 0.06, baseY); ctx.lineTo(W * 0.5, baseY); ctx.stroke();

        // stacked beads
        let topCy = baseY;
        for (let i = 0; i < 64; i++) {
          const cy = baseY - bh / 2 - i * bh;
          if (cy - bh / 2 < H * 0.16) break;
          topCy = cy;
          ctx.globalAlpha = i % 2 ? 0.2 : 0.3;
          ctx.fillStyle = p.accent;
          ctx.beginPath();
          ctx.ellipse(cxW, cy, beadW / 2, bh / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = p.accent;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
          if (overTall && i > 0) {
            ctx.strokeStyle = p.danger;
            ctx.beginPath();
            ctx.moveTo(cxW - beadW * 0.3, cy + bh / 2);
            ctx.lineTo(cxW + beadW * 0.3, cy + bh / 2);
            ctx.stroke();
          }
        }

        // nozzle silhouette depositing the top bead
        const tipW = Math.max(2, noz * pxPerMm);
        const nY = topCy - bh / 2 - 4;
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.soft;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cxW - tipW / 2 - 12, nY - 22);
        ctx.lineTo(cxW + tipW / 2 + 12, nY - 22);
        ctx.lineTo(cxW + tipW / 2, nY);
        ctx.lineTo(cxW - tipW / 2, nY);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = p.panel2;
        ctx.fillRect(cxW - tipW / 2 - 12, nY - 34, tipW + 24, 12);
        ctx.strokeRect(cxW - tipW / 2 - 12, nY - 34, tipW + 24, 12);
        lbl(ctx, p, "Ø " + noz.toFixed(1) + " mm", cxW + tipW / 2 + 20, nY - 22, "left");

        // stair-step annotation
        const sx = cxW + beadW / 2 + 8;
        const sy = (baseY + Math.max(topCy, H * 0.3)) / 2;
        ctx.strokeStyle = p.muted;
        ctx.beginPath();
        ctx.moveTo(sx, sy - bh * 1.5);
        for (let i = 0; i < 3; i++) {
          ctx.arc(sx, sy - bh * 1.5 + bh * i + bh / 2, bh / 2, -Math.PI / 2, Math.PI / 2);
        }
        ctx.stroke();
        lbl(ctx, p, "stair-step surface", sx + bh / 2 + 6, sy, "left");

        // 1 mm scale bar
        ctx.strokeStyle = p.soft;
        ctx.beginPath();
        ctx.moveTo(W * 0.06, H * 0.955);
        ctx.lineTo(W * 0.06 + pxPerMm, H * 0.955);
        ctx.stroke();
        lbl(ctx, p, "1 mm", W * 0.06 + pxPerMm + 8, H * 0.955, "left");

        // tradeoff bars
        const bx = W * 0.56, bwid = W * 0.38;
        const smFrac = 1 - (layerH - 0.04) / (0.6 - 0.04);
        bar(ctx, p, bx, H * 0.26, bwid, "surface finish", smFrac, bucket());
        const work = (0.2 * 0.42) / (layerH * lw);
        const workFrac = Math.max(0, Math.min(1, (Math.log10(work) + 1) / 2));
        const workText = work > 1.5 ? "more" : work < 0.75 ? "less" : "similar";
        bar(ctx, p, bx, H * 0.46, bwid, "relative path-work proxy", workFrac, workText);
        lbl(ctx, p, "layers in a 5 cm part: " + Math.ceil(50 / layerH), bx, H * 0.62, "left");
        if (overTall) {
          ctx.fillStyle = p.danger;
          ctx.font = "12px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("outside this playground's 75% caution guide", bx, H * 0.72);
        }
      }

      cv.setAria(
        "Wall cross-section built from stacked oval beads. Changing nozzle diameter and " +
        "layer height changes visible layer steps and an illustrative path-work proxy; " +
        "this is not a print-time or strength estimator."
      );
      cv.onResize(() => draw());
      refresh();
      api.once(draw);
    },
  });

  /* ============================================================
     CHAPTER 3
     ============================================================ */
  A1.registerChapter({
    n: 3,
    tier: "Beginner",
    title: "How it melts",
    claims: ["CMP-005", "QNT-002", "QNT-003", "QNT-012", "SAF-001", "SAF-003"],
    html:
      '<div class="note"><strong>Objective.</strong> Trace filament from drive gears to deposited ' +
      "bead, calculate volumetric-flow demand, and decide whether a requested speed fits the active " +
      "filament profile without treating temperature as a universal flow-capacity dial.</div>" +
      "<p>Strip away the electronics and an FDM printer is a machine for doing one thing " +
      "millions of times in a row: push a plastic strand into a hot metal block and smear " +
      "the molten output exactly where it's told. This chapter follows that strand through " +
      "the A1's toolhead — from the gears that grip it to the fan that helps cool it — and " +
      "shows how volumetric flow becomes one major speed limit.</p>" +

      "<h3>Grip first, melt second</h3>" +
      "<p>The pushing is done by two hardened-steel drive gears that pinch the 1.75 mm " +
      "filament from both sides. On the A1 the whole extruder rides on the toolhead itself " +
      "— a <code>direct-drive</code> layout — and that matters for two reasons. The push " +
      "distance from gears to melt zone is short, which reduces path compliance when feed changes. " +
      "The constrained path also " +
      "reduces buckling risk for compatible flexible-filament profiles compared with pushing soft " +
      "material through a long Bowden tube. It does not make every TPU grade or feed path compatible.</p>" +

      '<div class="facts">' +
      '<div class="fact"><div class="v">300 °C</div><div class="k">all-metal hotend</div></div>' +
      '<div class="fact"><div class="v">profile-specific</div><div class="k">usable volumetric flow</div></div>' +
      '<div class="fact"><div class="v">0.2–0.8 mm</div><div class="k">quick-swap nozzles</div></div>' +
      '<div class="fact"><div class="v">1.75 mm</div><div class="k">filament diameter</div></div>' +
      "</div>" +

      "<h3>A one-way trip through the hotend</h3>" +
      "<p>Below the gears sits an all-metal hotend rated to 300 °C, and its layout is all " +
      "about controlling <code>where</code> melting happens. First a finned heatsink — the " +
      "cold zone — kept cool by a small hotend fan so the filament stays rigid and pushable. " +
      "Then a narrow heatbreak that chokes heat from creeping upward. Then the heater block, " +
      "where the strand finally melts, and the nozzle orifice that shapes it into a line. " +
      "If heat sneaks up past the heatbreak, filament softens too early and jams — which is " +
      "why the hotend fan runs whenever the block is hot.</p>" +

      "<p>At the tip, the nozzle squishes the molten bead onto the layer below — the stock " +
      "0.4 mm nozzle commonly uses a line near 0.42 mm in standard profiles — and the " +
      "part-cooling fan helps it solidify according to the material profile. Chapter 2 covers how " +
      "the bed and gantry move the nozzle around; here we only care about what comes out of it.</p>" +

      '<div class="note"><strong>Simulation assumptions.</strong> Flow demand is the geometric ' +
      "product of requested speed, layer height and a fixed 0.42&nbsp;mm line width for the stock " +
      "0.4&nbsp;mm nozzle. With the profile cap on and the capacity assumption matched, the model " +
      "reduces effective straight-line speed and keeps a full bead. Thinning appears only when you " +
      "explicitly disable that cap or choose the invented scenario where true capacity is 25% below " +
      "the selected limit. This does not model acceleration, variable-width paths, bridges, cooling, " +
      "other nozzles or actual hotend performance, and it cannot certify a print.</div>" +
      '<div data-sim="melt-flow"></div>' +

      "<h3 id=\"diagnose-under-extrusion\">The flow ceiling</h3>" +
      "<p>Melting takes time, so flow can become the limiting factor even when the motion system " +
      "could move faster. " +
      "The demand is simple arithmetic: <code>speed × layer height × line width</code>. At " +
      "200 mm/s with 0.2 mm layers and a 0.42 mm line you're asking for about 17 mm³/s of " +
      "molten plastic. The comparison value must come from the selected filament profile or " +
      "a controlled calibration. Bambu reports about 28&nbsp;mm³/s for one specific ABS-at-280&nbsp;°C " +
      "single-wall hotend test; that is a test result, not a universal limit for every filament, " +
      "temperature, nozzle and model. See the " +
      '<a href="https://bambulab.com/en/a1/tech-specs" target="_blank" rel="noopener">official A1 test conditions</a> and Bambu\'s ' +
      '<a href="https://wiki.bambulab.com/en/knowledge-sharing/volumetric-speed" target="_blank" rel="noopener">volumetric-speed guide</a>.</p>' +

      "<p>With a valid active profile, the slicer does not normally command a broken bead: it " +
      "reduces path speed so <code>speed × layer height × line width</code> stays within the selected " +
      "maximum volumetric speed. In this one-width model, the corresponding straight-line ceiling is " +
      "<code>profile limit ÷ (layer height × line width)</code>. That is not a whole-print speed " +
      "prediction; acceleration, geometry, cooling and other profile rules still apply. Thin, weak " +
      "or gappy lines become plausible when that cap is disabled, mis-set, or the real setup can melt " +
      "less than the selected value—for example after a material, nozzle or condition change.</p>" +

      "<h3>A quick-swap hotend—after it is safe to handle</h3>" +
      "<p>On most printers, changing a nozzle means unscrewing hot metal against a torque " +
      "spec and hoping nothing strips. The A1's signature answer: the whole nozzle-plus-" +
      "heatbreak assembly is held by a spring clip and a magnet, so no hot-nozzle wrenching is " +
      "needed. Toolless does not mean cool or safe to touch. Follow Bambu's " +
      '<a href="https://wiki.bambulab.com/en/a1/maintenance/basic-maintenance" target="_blank" rel="noopener">current service instructions</a> ' +
      "and complete only any unload or heating step that they explicitly require. Then " +
      "switch off and unplug before service, let the hotend fall below 60&nbsp;°C, and only then release it. " +
      "You swap the entire melt zone as one part. Four sizes exist — 0.2, 0.4 " +
      "(stock), 0.6 and 0.8 mm. Small nozzles buy fine detail at the cost of time; big ones " +
      "print fast, strong and coarse.</p>" +

      '<div class="warn"><strong>Stainless is not hardened.</strong> The stock 0.4 mm ' +
      "nozzle is stainless steel. Carbon-fiber, glass-fiber and glow-in-the-dark filaments " +
      "carry hard particles that sandblast a stainless orifice wider over time — hardened-" +
      "steel versions exist in 0.4/0.6/0.8 mm for abrasives (0.2 mm comes stainless-only). " +
      "Whether a composite suits the open A1 also depends on its base polymer: a PLA composite " +
      "and a nylon composite do not share the same chamber requirements. Check both the nozzle " +
      "and printer/material compatibility guidance; Chapter 10 covers that distinction.</div>" +

      '<div class="note"><strong>Layer-playground assumptions.</strong> It draws idealized oval beads, ' +
      "assumes line width is 105% of nozzle diameter, and uses 75% of nozzle diameter only as a visible " +
      "caution guide. Actual line width, layer limits, strength and time come from the chosen profile, " +
      "geometry and slicer—not this picture.</div>" +
      '<div data-sim="layers"></div>' +

      "<h3>What it knows about its filament</h3>" +
      "<p>Bambu's spec sheet lists three filament senses — runout, odometry and tangle. " +
      "Runout and tangle are humble hall-effect sensors on the printer: runout is a presence " +
      "switch — filament gone, print pauses — and tangle detection trips when feed resistance " +
      "climbs too high. Odometry lives in the AMS lite, which compares each drive motor's speed " +
      "against a small odometer wheel the filament turns to catch slip (Chapter 7 has the details). That's enough to stop the printer air-printing " +
      "an empty spool, and it can flag some feed problems — but none of these proves that every " +
      "requested bead reached the model. Optional sensor-based nozzle-clump detection can pause " +
      "some failures and is not failproof; a partial clog can still under-extrude quietly. The " +
      "eddy-current extrusion-force sensor is used during Flow Dynamics Calibration, not as a " +
      "guarantee that continuously inspects each deposited line. See the " +
      '<a href="https://wiki.bambulab.com/en/a1-mini/manual/nozzle-warp-detection" target="_blank" rel="noopener">official clump-detection limits</a>.</p>' +

      '<div class="note"><strong>Transfer check.</strong> A profile requests 250&nbsp;mm/s, ' +
      "0.24&nbsp;mm layers and a 0.48&nbsp;mm line. Calculate its 28.8&nbsp;mm³/s demand. If the " +
      "selected filament profile is limited to 18&nbsp;mm³/s, which number should the slicer obey—and " +
      "why would raising temperature in this playground be an invalid shortcut?</div>" +

      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://us.store.bambulab.com/products/extruder-unit-a1-series" target="_blank" rel="noopener">Bambu store — A1 extruder unit (dual hardened-steel gears)</a>' +
      '<a href="https://us.store.bambulab.com/products/bambu-hotend-a1-a2" target="_blank" rel="noopener">Bambu store — quick-swap hotend</a>' +
      '<a href="https://wiki.bambulab.com/en/filament-acc/acc/nozzles" target="_blank" rel="noopener">Bambu wiki — nozzle sizes &amp; materials</a>' +
      '<a href="https://wiki.bambulab.com/en/knowledge-sharing/volumetric-speed" target="_blank" rel="noopener">Bambu wiki — volumetric speed explained</a>' +
      "</div>",
  });
})();
