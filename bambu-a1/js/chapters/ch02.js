/* ch02 — How it moves: bed-slinger kinematics, belts, and the Z drive */
(function () {
  "use strict";

  /* ---------- shared helpers ---------- */

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fmtN(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* point on a square perimeter of side S, param s in [0,4) */
  function pathPoint(s, S) {
    const k = Math.floor(s), f = s - k;
    if (k === 0) return [f * S, 0];
    if (k === 1) return [S, f * S];
    if (k === 2) return [S - f * S, S];
    return [0, S - f * S];
  }

  function dblArrow(ctx, x1, y1, x2, y2) {
    const a = Math.atan2(y2 - y1, x2 - x1), hs = 5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    [[x2, y2, a], [x1, y1, a + Math.PI]].forEach(function (e) {
      ctx.beginPath();
      ctx.moveTo(e[0], e[1]);
      ctx.lineTo(e[0] - hs * Math.cos(e[2] - 0.5), e[1] - hs * Math.sin(e[2] - 0.5));
      ctx.moveTo(e[0], e[1]);
      ctx.lineTo(e[0] - hs * Math.cos(e[2] + 0.5), e[1] - hs * Math.sin(e[2] + 0.5));
      ctx.stroke();
    });
  }

  /* deliberate filament color (not themed) */
  const FILAMENT = "#e8815d";

  /* ============================================================
     SIM 1 — kinematics: bed-slinger vs CoreXY, moving mass, judder
     ============================================================ */
  A1.registerSim({
    id: "kinematics",
    title: "Bed-slinger vs CoreXY — who carries the mass?",
    mount(api) {
      const cv = api.canvas(16 / 9);
      const PRODUCT_RATING_A1 = 10000;
      const STUDIO_PROFILE_LIMIT_A1 = 12000;
      const PRODUCT_RATING_XY = 20000;
      let coreXY = false;
      let accel = 10000;
      let u = 0, lastLeg = 0, shake = 0;

      api.toggle({
        label: "Show CoreXY (P1S / X1C) instead",
        value: false,
        onChange: function (v) { coreXY = v; },
      });
      api.slider({
        label: "Acceleration",
        min: 2000, max: 20000, step: 500, value: 10000,
        format: function (v) { return fmtN(v) + " mm/s²"; },
        onInput: function (v) { accel = v; },
      });
      const ro = api.readout({ label: "" });

      cv.setAria(
        "Animated top view comparing the A1 bed-slinger (bed slides on Y under a head that " +
        "only moves on X) with a CoreXY printer (static bed, light head moves in X and Y) " +
        "tracing the same square toolpath. A bar compares published product acceleration " +
        "ratings and, for the A1, the separate internal limit in Bambu Studio v2.7.1.62. " +
        "Shake beyond the product-rating marker is illustrative, not a measured failure boundary."
      );

      api.raf(function (t, dt) {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;

        /* --- advance the square toolpath --- */
        const rate = 0.35 + (accel / PRODUCT_RATING_XY) * 0.4; /* legs per second */
        u = (u + rate * dt) % 4;
        const leg = Math.floor(u);
        const productRating = coreXY ? PRODUCT_RATING_XY : PRODUCT_RATING_A1;
        const studioProfileLimit = coreXY ? null : STUDIO_PROFILE_LIMIT_A1;
        const massF = coreXY ? 0.3 : 1;
        const overRating = Math.max(0, (accel - productRating) / productRating);
        const overProfile = studioProfileLimit !== null && accel > studioProfileLimit;
        if (leg !== lastLeg) {
          lastLeg = leg;
          shake += massF * (0.4 * (accel / productRating) + overRating * 9);
        }
        if (overRating > 0) shake = Math.max(shake, overRating * 3 * massF);
        shake *= Math.exp(-3.2 * dt);

        /* --- paint --- */
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        const mx = W * 0.04, my = H * 0.10, mw = W * 0.58, mh = H * 0.80;
        const bw = mw * 0.52, bh = mh * 0.52;
        const S = Math.min(bw, bh) * 0.55;
        const padX = (bw - S) / 2, padY = (bh - S) / 2;
        const q = pathPoint(u, S);
        const px = q[0], py = q[1];

        const jx = (Math.random() * 2 - 1) * shake;
        const jy = (Math.random() * 2 - 1) * shake;

        ctx.save();
        ctx.translate(jx, jy);

        /* frame */
        ctx.strokeStyle = p.borderStrong;
        ctx.lineWidth = 2;
        roundRect(ctx, mx, my, mw, mh, 10);
        ctx.stroke();

        const bedX = mx + (mw - bw) / 2;
        let bedY, headX, headY;
        if (coreXY) {
          bedY = my + (mh - bh) / 2;
          headX = bedX + padX + px;
          headY = bedY + padY + py;
        } else {
          const ny = my + mh * 0.5;      /* nozzle line is fixed on a bed-slinger */
          bedY = ny - padY - py;         /* the bed slides so the part point is under it */
          headX = bedX + padX + px;
          headY = ny;
        }

        /* bed */
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.border;
        ctx.lineWidth = 1.5;
        roundRect(ctx, bedX, bedY, bw, bh, 6);
        ctx.fill(); ctx.stroke();

        /* part footprint + toolpath on the bed */
        const ox = bedX + padX, oy = bedY + padY;
        ctx.fillStyle = "rgba(232,129,93,0.16)";
        ctx.fillRect(ox, oy, S, S);
        ctx.strokeStyle = p.muted;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox, oy, S, S);

        /* freshly-printed trail */
        ctx.strokeStyle = FILAMENT;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        const TRAIL = 0.8, STEPS = 16;
        for (let i = 0; i <= STEPS; i++) {
          const uu = ((u - TRAIL + (TRAIL * i) / STEPS) % 4 + 4) % 4;
          const qq = pathPoint(uu, S);
          if (i === 0) ctx.moveTo(ox + qq[0], oy + qq[1]);
          else ctx.lineTo(ox + qq[0], oy + qq[1]);
        }
        ctx.stroke();

        /* X beam + head */
        ctx.fillStyle = p.panel;
        ctx.strokeStyle = p.border;
        roundRect(ctx, mx + 6, headY - 6, mw - 12, 12, 5);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = p.accent;
        roundRect(ctx, headX - 10, headY - 9, 20, 18, 4);
        ctx.fill();

        /* motion arrows + caption */
        ctx.strokeStyle = p.soft;
        ctx.fillStyle = p.soft;
        ctx.lineWidth = 1.5;
        if (coreXY) {
          dblArrow(ctx, headX - 30, headY - 22, headX + 30, headY - 22);
          dblArrow(ctx, headX + 34, headY - 18, headX + 34, headY + 18);
          ctx.fillText("bed parked — the light head does X + Y", mx + 8, my - 8);
        } else {
          dblArrow(ctx, bedX - 14, bedY + 8, bedX - 14, bedY + bh - 8);
          dblArrow(ctx, mx + mw - 74, headY - 16, mx + mw - 14, headY - 16);
          ctx.fillText("bed (and part) slide on Y — head only moves on X", mx + 8, my - 8);
        }

        ctx.restore(); /* end jitter */

        /* --- right panel: moving mass + acceleration references --- */
        const rx = W * 0.66, rw = W * 0.30;
        let ry = my + 4;
        ctx.fillStyle = p.text;
        ctx.fillText(coreXY ? "CoreXY (P1S / X1C)" : "A1 bed-slinger", rx, ry);
        ry += 18;

        ctx.fillStyle = p.soft;
        ctx.fillText("moving mass", rx, ry);
        ry += 6;
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.border;
        roundRect(ctx, rx, ry, rw, 12, 5);
        ctx.fill(); ctx.stroke();
        const massFrac = coreXY ? 0.16 : 0.85;
        ctx.fillStyle = massFrac > 0.5 ? p.warn : p.accent;
        roundRect(ctx, rx, ry, rw * massFrac, 12, 5);
        ctx.fill();
        ry += 26;
        ctx.fillStyle = p.muted;
        ctx.fillText(coreXY ? "toolhead only" : "bed + plate + part", rx, ry);
        ry += 24;

        ctx.fillStyle = p.soft;
        ctx.fillText("acceleration references (not a forecast)", rx, ry);
        ry += 6;
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.border;
        roundRect(ctx, rx, ry, rw, 12, 5);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = overProfile ? p.danger : (overRating > 0 ? p.warn : p.accent);
        roundRect(ctx, rx, ry, rw * (accel / PRODUCT_RATING_XY), 12, 5);
        ctx.fill();
        const ratingX = rx + rw * (productRating / PRODUCT_RATING_XY);
        ctx.strokeStyle = p.text;
        ctx.beginPath();
        ctx.moveTo(ratingX, ry - 3);
        ctx.lineTo(ratingX, ry + 15);
        ctx.stroke();
        if (studioProfileLimit !== null) {
          const profileX = rx + rw * (studioProfileLimit / PRODUCT_RATING_XY);
          ctx.strokeStyle = p.warn;
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.moveTo(profileX, ry - 3);
          ctx.lineTo(profileX, ry + 15);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ry += 26;
        ctx.fillStyle = p.muted;
        ctx.fillText("product rating: " + fmtN(productRating) + " mm/s²", rx, ry);
        if (studioProfileLimit !== null) {
          ry += 18;
          ctx.fillText("Studio profile limit: " + fmtN(studioProfileLimit) + " mm/s²", rx, ry);
        }
        ry += 20;

        ctx.font = "13px system-ui, -apple-system, sans-serif";
        if (overProfile) {
          ctx.fillStyle = p.danger;
          ctx.fillText("above both references; shake illustrative", rx, ry);
        } else if (overRating > 0) {
          ctx.fillStyle = p.warn;
          ctx.fillText("above product rating; shake illustrative", rx, ry);
        } else {
          ctx.fillStyle = p.soft;
          ctx.fillText("at or below published product rating", rx, ry);
        }

        if (coreXY) {
          ro.setText(
            "CoreXY published product rating 20,000 mm/s² · selected " + fmtN(accel) +
            " mm/s² — at or below that reference; sustainable behavior is not predicted."
          );
        } else {
          ro.setText(
            "A1 product rating 10,000 mm/s² · Studio v2.7.1.62 profile limit 12,000 mm/s²" +
            " · selected " + fmtN(accel) + " mm/s² — " +
            (overProfile
              ? "above both references; shake is illustrative, not a failure prediction."
              : overRating > 0
                ? "above the product rating but within the Studio profile reference; shake is illustrative."
                : "at or below both references; clean or sustained printing is not guaranteed.")
          );
        }
      });
    },
  });

  /* ============================================================
     SIM 2 — z-drive: one stepper, one belt, two lead screws
     ============================================================ */
  A1.registerSim({
    id: "z-drive",
    title: "One motor, two lead screws — the Z drive",
    mount(api) {
      const cv = api.canvas(16 / 9);
      const TOTAL = 10;
      let layerH = 0.20;                 /* mm */
      let zMm = 0.6, builtMm = 0.6, targetMm = 0.6;
      let layersDone = 0, phase = "idle", dwell = 0, spin = 0, prog = 0;

      api.slider({
        label: "Layer height",
        min: 0.08, max: 0.28, step: 0.04, value: 0.2,
        format: function (v) { return v.toFixed(2) + " mm"; },
        onInput: function (v) { layerH = v; },
      });
      api.button({
        label: "Print 10 layers",
        onClick: function () {
          zMm = 0; builtMm = 0; layersDone = 0; prog = 0;
          targetMm = layerH; phase = "lift";
        },
      });
      const ro = api.readout({ label: "" });

      cv.setAria(
        "Front view of the A1 Z axis: a single stepper motor drives a synchronous belt " +
        "loop that turns two lead screws in sync, stepping the X gantry up by exactly one " +
        "layer height after each printed layer."
      );

      api.raf(function (t, dt) {
        /* --- state machine --- */
        if (phase === "lift") {
          zMm = Math.min(targetMm, zMm + (layerH / 0.45) * dt);
          spin += dt * 12;               /* screws + belt turn only while lifting */
          if (zMm >= targetMm - 1e-6) { phase = "print"; dwell = 0.55; prog = 0; }
        } else if (phase === "print") {
          dwell -= dt;
          prog = 1 - Math.max(0, dwell) / 0.55;
          if (dwell <= 0) {
            builtMm = zMm; layersDone++;
            if (layersDone >= TOTAL) { phase = "done"; }
            else { targetMm = zMm + layerH; phase = "lift"; }
          }
        }

        /* --- paint --- */
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        const pxPerMm = (H * 0.42) / (0.28 * TOTAL);
        const baseTop = H * 0.80;
        const xL = W * 0.26, xR = W * 0.74;
        const rodL = xL - W * 0.05, rodR = xR + W * 0.05;
        const screwTopY = H * 0.10, screwW = 8;

        /* base */
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong;
        ctx.lineWidth = 2;
        roundRect(ctx, W * 0.10, baseTop, W * 0.80, H * 0.15, 8);
        ctx.fill(); ctx.stroke();

        /* bed slab */
        const bedTop = baseTop - 8;
        ctx.fillStyle = p.panel;
        ctx.strokeStyle = p.border;
        ctx.lineWidth = 1.5;
        roundRect(ctx, W * 0.36, bedTop, W * 0.28, 8, 3);
        ctx.fill(); ctx.stroke();

        /* guide rods */
        ctx.strokeStyle = p.border;
        ctx.lineWidth = 3;
        [rodL, rodR].forEach(function (rxr) {
          ctx.beginPath();
          ctx.moveTo(rxr, screwTopY);
          ctx.lineTo(rxr, baseTop);
          ctx.stroke();
        });

        /* lead screws — shared spin phase = mechanically in sync */
        [xL, xR].forEach(function (sx) {
          ctx.fillStyle = p.panel2;
          ctx.strokeStyle = p.borderStrong;
          ctx.lineWidth = 1.5;
          ctx.fillRect(sx - screwW / 2, screwTopY, screwW, baseTop - screwTopY);
          ctx.strokeRect(sx - screwW / 2, screwTopY, screwW, baseTop - screwTopY);
          ctx.save();
          ctx.beginPath();
          ctx.rect(sx - screwW / 2, screwTopY, screwW, baseTop - screwTopY);
          ctx.clip();
          ctx.strokeStyle = p.muted;
          ctx.lineWidth = 1;
          const sp = 6, off = (spin * 4) % sp;
          for (let y = screwTopY - sp + off; y < baseTop + sp; y += sp) {
            ctx.beginPath();
            ctx.moveTo(sx - screwW / 2, y + 3);
            ctx.lineTo(sx + screwW / 2, y - 3);
            ctx.stroke();
          }
          ctx.restore();
        });

        /* part (draw before the head so the nozzle sits on top) */
        const visMm = phase === "print" ? builtMm + prog * (zMm - builtMm) : builtMm;
        const partW = W * 0.16, partH = visMm * pxPerMm;
        if (partH > 0.5) {
          ctx.fillStyle = "rgba(232,129,93,0.85)";
          ctx.fillRect(W / 2 - partW / 2, bedTop - partH, partW, partH);
          const lh = layerH * pxPerMm;
          if (lh >= 3) {
            ctx.strokeStyle = "rgba(0,0,0,0.28)";
            ctx.lineWidth = 1;
            for (let y = bedTop - lh; y > bedTop - partH + 0.5; y -= lh) {
              ctx.beginPath();
              ctx.moveTo(W / 2 - partW / 2, y);
              ctx.lineTo(W / 2 + partW / 2, y);
              ctx.stroke();
            }
          }
        }

        /* gantry: beam + head + nozzle, riding the screws */
        const zPx = zMm * pxPerMm;
        const tipY = bedTop - zPx;
        const beamH = 14, headW = 34, headH = 20;
        const beamY = tipY - 10 - headH - beamH;

        ctx.fillStyle = p.panel;
        ctx.strokeStyle = p.borderStrong;
        ctx.lineWidth = 1.5;
        roundRect(ctx, rodL - 8, beamY, (rodR - rodL) + 16, beamH, 5);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = p.borderStrong;
        ctx.fillRect(xL - 8, beamY + 2, 16, beamH - 4);   /* lead-screw nuts */
        ctx.fillRect(xR - 8, beamY + 2, 16, beamH - 4);

        const wig = phase === "print" ? Math.sin(t * 13) * (W * 0.05) : 0;
        const hx = W / 2 + wig;
        ctx.fillStyle = p.accent;
        roundRect(ctx, hx - headW / 2, beamY + beamH, headW, headH, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(hx - 6, beamY + beamH + headH);
        ctx.lineTo(hx + 6, beamY + beamH + headH);
        ctx.lineTo(hx, tipY);
        ctx.closePath();
        ctx.fill();

        /* belt loop + pulleys + motor inside the base */
        const pulY = baseTop + H * 0.07;
        ctx.strokeStyle = p.accent;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 5]);
        ctx.lineDashOffset = -spin * 14;
        roundRect(ctx, xL - 9, pulY - 9, (xR - xL) + 18, 18, 9);
        ctx.stroke();
        ctx.setLineDash([]);

        [xL, xR].forEach(function (sx) {
          ctx.fillStyle = p.borderStrong;
          ctx.beginPath();
          ctx.arc(sx, pulY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = p.bg;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx, pulY);
          ctx.lineTo(sx + 5 * Math.cos(spin * 2), pulY + 5 * Math.sin(spin * 2));
          ctx.stroke();
        });

        const mYc = pulY + 9;
        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, mYc, 11, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = p.text;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(W / 2, mYc);
        ctx.lineTo(W / 2 + 9 * Math.cos(spin * 2), mYc + 9 * Math.sin(spin * 2));
        ctx.stroke();

        /* labels */
        ctx.fillStyle = p.soft;
        ctx.fillText("lead screw", xL + 10, H * 0.18);
        ctx.textAlign = "right";
        ctx.fillText("lead screw", xR - 10, H * 0.18);
        ctx.fillText("guide rod", rodL - 6, H * 0.32);
        ctx.fillText("heated bed", W * 0.35, bedTop + 7);
        ctx.textAlign = "left";
        ctx.fillText("guide rod", rodR + 6, H * 0.32);
        ctx.fillText("X gantry", rodL - 6, beamY - 6);
        ctx.fillText("Z stepper", W / 2 + 18, mYc + 4);
        ctx.textAlign = "center";
        ctx.fillText("one synchronous belt turns both screws", W / 2, pulY - 14);
        ctx.textAlign = "left";

        /* readout */
        if (phase === "idle") {
          ro.setText("Nozzle parked at Z = " + zMm.toFixed(2) + " mm — press “Print 10 layers”.");
        } else if (phase === "done") {
          ro.setText("Done: " + TOTAL + " layers, Z = " + zMm.toFixed(2) +
            " mm. In this idealized diagram, one belt commanded both screws together.");
        } else {
          ro.setText("Layer " + Math.min(TOTAL, layersDone + 1) + " / " + TOTAL +
            " · nozzle Z = " + zMm.toFixed(2) + " mm" +
            (phase === "lift" ? " · screws turning…" : " · printing…"));
        }
      });
    },
  });

  /* ============================================================
     CHAPTER 2
     ============================================================ */
  A1.registerChapter({
    n: 2,
    tier: "Beginner",
    title: "How it moves",
    claims: ["MNT-001", "MNT-002", "MNT-003", "QNT-007", "QNT-010", "SAF-002"],
    html:
      '<div class="note"><strong>Objective.</strong> Predict which mass moves for an X, Y or Z ' +
      "command, and explain why acceleration—not the headline top speed—usually exposes the A1's " +
      "bed-slinger trade-off.</div>" +
      "<h3>Three axes, one honest split</h3>" +
      "<p>Every FDM printer has the same geometry problem: the nozzle must be able to reach " +
      "any point inside the build volume — on the A1, a 256 mm cube. The A1 solves it the " +
      "classic Cartesian way, giving each direction its own dedicated mechanism. The toolhead " +
      "slides left and right along a linear rail on the X beam. The heated bed carries the part " +
      "forward and back on its own rail — that is Y, and it is why this layout gets called a " +
      "<code>bed-slinger</code>: the machine literally slings the bed, and your part with it, " +
      "back and forth. For Z, the whole X beam climbs upward, one layer at a time.</p>" +
      "<p>X and Y each get one stepper motor pulling a toothed synchronous belt along a genuine " +
      "linear rail, so each moving part is held rigidly and can only travel in the one direction " +
      "it owns. Z is the odd one out: two lead screws, one on each side of the gantry, raised by " +
      "a single motor — more on that below.</p>" +
      '<div class="facts">' +
      '<div class="fact"><div class="v">500 mm/s</div><div class="k">max toolhead speed</div></div>' +
      '<div class="fact"><div class="v">10,000 mm/s²</div><div class="k">published acceleration rating</div></div>' +
      '<div class="fact"><div class="v">12,000 mm/s²</div><div class="k">Studio v2.7.1.62 X/Y/extruding limits</div></div>' +
      '<div class="fact"><div class="v">2 screws · 1 motor</div><div class="k">Z drive</div></div>' +
      '<div class="fact"><div class="v">≤48 dB</div><div class="k">claimed in Silent mode</div></div>' +
      "</div>" +
      "<h3>Why the bed is the expensive axis</h3>" +
      "<p>Compare that with Bambu&rsquo;s own CoreXY machines, the P1S and X1C. There the bed only " +
      "creeps downward in Z; every fast move belongs to a lightweight toolhead. On the A1, every " +
      "Y move has to accelerate the bed, the build plate, and the part growing on top — a much " +
      "bigger moving mass. At the same commanded acceleration, more moving mass means more inertial " +
      "force; how much becomes vibration depends on the whole mechanical and control system. " +
      "Bambu's product page publishes a 10,000 mm/s² maximum-acceleration rating for the A1 and " +
      "20,000 mm/s² for the selected P1/X1 CoreXY examples. Separately, the official " +
      '<a href="https://github.com/bambulab/BambuStudio/blob/v02.07.01.62/resources/profiles/BBL/machine/Bambu%20Lab%20A1%200.4%20nozzle.json" target="_blank" rel="noopener">Bambu Studio v2.7.1.62 A1 profile</a> ' +
      "encodes 12,000 mm/s² X, Y and extruding machine limits. Those references serve different " +
      "purposes; neither is an ordinary print setting, a hardware failure threshold or a promise of " +
      "sustainable clean motion. Moving Y mass is relevant, but no one number proves the complete " +
      "cause; motors, frame, control targets, toolpath, profile and product positioning also matter.</p>" +
      '<div class="note"><strong>Short moves expose acceleration.</strong> The ' +
      "A1&rsquo;s 500 mm/s top speed is identical to the CoreXY P1S and X1C; the moving bed does not " +
      "change that published headline. Many short toolpath segments never reach top speed, so " +
      "acceleration can dominate their elapsed time. It does not dominate every job: volumetric " +
      "flow, cooling, geometry and slicer limits can become the controlling constraint.</div>" +
      '<div class="note"><strong>Simulation assumptions.</strong> The moving-mass bars are ' +
      "qualitative and shake above each published product rating is exaggerated. For the A1, the " +
      "solid marker is the 10,000 mm/s² product rating and the dashed marker is the separate " +
      "12,000 mm/s² Studio profile limit. This compares kinematics and reference values; it does " +
      "not predict surface quality, sustainable behavior or a hardware failure threshold.</div>" +
      "<p>Run the same square on both layouts, compare which mass moves, and treat the rating " +
      "markers as context rather than a promise that every model prints cleanly up to the line.</p>" +
      '<div data-sim="kinematics"></div>' +
      "<h3>Belts, steppers, and the quiet part</h3>" +
      "<p>All of this is driven by stepper motors — motors that rotate in small fixed increments, " +
      "which is how a printer positions an axis precisely without any sensor on the belt. Steppers " +
      "can hum and whine as they step. The A1 runs a motor-noise calibration and Bambu markets the " +
      "result as <strong>Active Motor Noise Cancellation</strong>; its public documentation does not " +
      "describe an acoustic counter-wave or microphone-based destructive-interference mechanism, so " +
      "this tutorial does not invent one. Together " +
      "with fan control, Bambu advertises operation at or below 48&nbsp;dB in <strong>Silent mode</strong>. " +
      "That is not a promise for ordinary full-speed printing; fans, motion, the model and the room " +
      "all change measured sound. See the " +
      '<a href="https://us.store.bambulab.com/products/a1" target="_blank" rel="noopener">current official A1 specification</a>.</p>' +
      "<p>Fast direction changes also excite the machine&rsquo;s natural resonances, which print as " +
      "ghostly ripples on walls — <code>ringing</code>. One line is all it gets here, because the " +
      "A1&rsquo;s accelerometer-based fix is Chapter 5&rsquo;s whole story.</p>" +
      "<h3>One motor, two lead screws</h3>" +
      "<p>The Z axis has a different job description. It barely moves during a print — a fraction " +
      "of a millimetre per layer — but it must lift the entire X gantry perfectly level, thousands " +
      "of times, without drifting. Lead screws suit that job: each turn advances the gantry a " +
      "small, precise amount, and it stays put between moves.</p>" +
      "<p>The failure mode to design out is tilt: if the left screw ever turns a little more than " +
      "the right one, the gantry sags to one side and every layer after that is skewed. Some designs " +
      "drive the two Z sides with separate motors and manage their synchronization electronically. " +
      "The A1 instead uses one Z stepper and a synchronous belt loop to turn both lead screws, so they " +
      "are mechanically chained together and normally remain synchronized. A loose belt, binding " +
      "or another mechanical fault can still produce misalignment. A pair of guide rods completes " +
      "the axis, keeping the beam from wobbling as it climbs.</p>" +
      "<p>Press print below and watch a layer change: the motor ticks, the belt shuffles, both " +
      "screws turn by the same amount, and the gantry steps up by exactly one layer height.</p>" +
      '<div data-sim="z-drive"></div>' +
      '<div class="note"><strong>Transfer check.</strong> A tall print starts wobbling only on ' +
      "front-to-back moves. Name the axis and the moving mass, then choose whether reducing top speed " +
      "or acceleration is the more direct first experiment.</div>" +
      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://bambulab.com/en/a1/tech-specs" target="_blank" rel="noopener">Official A1 tech specs</a>' +
      '<a href="https://wiki.bambulab.com/en/a1/maintenance/basic-maintenance" target="_blank" rel="noopener">Bambu wiki: A1 motion-system maintenance</a>' +
      '<a href="https://wiki.bambulab.com/en/a1/maintenance/a1-z-axis-leadscrew-kit-replacement-guides" target="_blank" rel="noopener">Bambu wiki: Z-axis lead-screw kit</a>' +
      '<a href="https://3dbite.com/corexy-vs-bed-slinger-3d-printer-comparison/" target="_blank" rel="noopener">CoreXY vs bed-slinger, compared</a>' +
      "</div>",
  });
})();
