/* ch01 — Meet the A1: anatomy walk + family lineup.
   Facts trace to research.md §1 (identity/specs), §2 (motion), §3 (hotend),
   §4 (calibration/sensor), §7 (wiper/chute/camera), §9 (lineup). */
(function () {
  "use strict";

  /* ============================================================
     Sim 1 — a1-anatomy
     Static clickable cartoon: tap a numbered part (or cycle with
     the button) to highlight it and read its role + key spec.
     ============================================================ */
  A1.registerSim({
    id: "a1-anatomy",
    title: "Anatomy of the A1 — tap a numbered part",
    mount(api) {
      const cv = api.canvas(16 / 10);

      /* Design space 640x400, scaled to fit. marker: [x,y] dot;
         regions: [x0,y0,x1,y1] boxes (design coords) for hit + highlight. */
      const PARTS = [
        {
          short: "toolhead",
          name: "Toolhead",
          role: "The business end: hotend, part-cooling fan, and an eddy-current sensor hidden inside.",
          spec: "The nozzle itself touches the plate; there is no separate probe tip beside it. The sensor also measures extrusion force during flow calibration.",
          marker: [322, 112],
          regions: [[288, 124, 356, 200]],
        },
        {
          short: "quick-swap hotend",
          name: "Quick-swap hotend",
          role: "The nozzle-plus-melt-zone assembly releases via a spring clip, so you swap the unit rather than unscrewing a hot nozzle.",
          spec: "All-metal, 300 °C max. Follow the current official procedure; after any step that explicitly requires power or heat, switch off and unplug before service, then cool it below 60 °C.",
          marker: [360, 214],
          regions: [[304, 194, 340, 224]],
        },
        {
          short: "X gantry + rail",
          name: "X gantry & linear rail",
          role: "Carries the toolhead left–right on a linear rail, pulled by a belt and one stepper.",
          spec: "Top speed 500 mm/s — the same published rating as the selected P1S and X1 Carbon examples.",
          marker: [428, 160],
          regions: [[146, 146, 494, 176]],
        },
        {
          short: "Y bed (the slinger)",
          name: "Y bed — the “slinger”",
          role: "The entire heated bed rides a linear rail front-to-back: the printer moves your print.",
          spec: "The product-page acceleration rating is 10,000 mm/s²; the stable Bambu Studio v2.7.1.62 A1 profile separately encodes a 12,000 mm/s² Y-axis machine limit. Neither is an ordinary print setting or sustained-performance promise.",
          marker: [214, 312],
          regions: [[198, 266, 472, 326]],
        },
        {
          short: "dual Z lead screws",
          name: "Dual Z lead screws",
          role: "One motor spins both screws in sync through a synchronous belt; dual guide rods keep the gantry level.",
          spec: "Z lifts the whole X beam upward, one layer height at a time.",
          marker: [540, 210],
          regions: [[116, 86, 150, 328], [490, 86, 524, 328]],
        },
        {
          short: "textured PEI plate",
          name: "Textured PEI plate",
          role: "Magnetic spring-steel sheet with a textured polyetherimide (PEI) skin — the surface your print sticks to.",
          spec: "Heats to 100 °C. Let the plate and part cool before removal; release temperature varies by material and surface.",
          marker: [335, 286],
          regions: [[210, 272, 460, 302]],
        },
        {
          short: "heatbed nozzle wiper",
          name: "Heatbed nozzle wiper",
          role: "A wiping pad built into the rear of the heatbed cleans the hot nozzle before a print.",
          spec: "It helps clean the contact point before probing; it is not the separate gantry-end purge wiper.",
          marker: [448, 240],
          regions: [[426, 250, 468, 276]],
        },
        {
          short: "purge wiper",
          name: "Purge wiper",
          role: "A separate assembly at the gantry end gathers and dislodges purged filament during setup, pause/resume and filament changes.",
          spec: "It manages purge waste; it is not the heatbed nozzle-cleaning pad used before probing.",
          marker: [520, 184],
          regions: [[456, 170, 506, 204]],
        },
        {
          short: "touchscreen",
          name: "Touchscreen",
          role: "Drive the printer from the front panel.",
          spec: "3.5-inch, 320 × 240 IPS touch.",
          marker: [104, 346],
          regions: [[114, 328, 184, 364]],
        },
        {
          short: "camera",
          name: "Monitoring camera",
          role: "1080p camera for remote check-ins and timelapses; documented features can vary with firmware and region.",
          spec: "The A1 has no lidar first-layer inspection. Separate optional sensor-based nozzle-clump detection is limited and not failproof.",
          marker: [104, 240],
          regions: [[118, 226, 150, 256]],
        },
        {
          short: "AMS lite (optional)",
          name: "AMS lite (optional)",
          role: "Open four-spool color changer that can sit beside the printer or use a compatible top-mount setup.",
          spec: "Not the sealed AMS box of the P1/X1 machines.",
          marker: [234, 38],
          regions: [[248, 10, 400, 72]],
        },
      ];

      let sel = 0;
      let t = { s: 1, ox: 0, oy: 0 };

      function draw() {
        const pal = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        const s = Math.min(W / 660, H / 412);
        const ox = (W - 640 * s) / 2, oy = (H - 400 * s) / 2;
        t = { s: s, ox: ox, oy: oy };
        const X = (v) => ox + v * s;
        const Y = (v) => oy + v * s;
        const S = (v) => v * s;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = pal.bg;
        ctx.fillRect(0, 0, W, H);

        const rr = (x0, y0, x1, y1, r) => {
          const x = X(x0), y = Y(y0), w = S(x1 - x0), h = S(y1 - y0);
          const rad = Math.max(0, Math.min(S(r), w / 2, h / 2));
          ctx.beginPath();
          ctx.moveTo(x + rad, y);
          ctx.arcTo(x + w, y, x + w, y + h, rad);
          ctx.arcTo(x + w, y + h, x, y + h, rad);
          ctx.arcTo(x, y + h, x, y, rad);
          ctx.arcTo(x, y, x + w, y, rad);
          ctx.closePath();
        };
        const box = (x0, y0, x1, y1, r, fill, stroke) => {
          rr(x0, y0, x1, y1, r);
          if (fill) { ctx.fillStyle = fill; ctx.fill(); }
          if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, 1.4 * s); ctx.stroke(); }
        };
        const poly = (pts, fill, stroke) => {
          ctx.beginPath();
          ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
          for (let i = 1; i < pts.length; i++) ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
          ctx.closePath();
          if (fill) { ctx.fillStyle = fill; ctx.fill(); }
          if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, 1.4 * s); ctx.stroke(); }
        };
        const head = (tx, ty, fx, fy, color) => {
          const ax = X(tx), ay = Y(ty);
          const ang = Math.atan2(Y(ty) - Y(fy), X(tx) - X(fx));
          const L = Math.max(5, 7 * s);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - L * Math.cos(ang - 0.45), ay - L * Math.sin(ang - 0.45));
          ctx.lineTo(ax - L * Math.cos(ang + 0.45), ay - L * Math.sin(ang + 0.45));
          ctx.closePath();
          ctx.fill();
        };
        const arrow2 = (x0, y0, x1, y1, color) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(1, 1.4 * s);
          ctx.beginPath(); ctx.moveTo(X(x0), Y(y0)); ctx.lineTo(X(x1), Y(y1)); ctx.stroke();
          head(x0, y0, x1, y1, color);
          head(x1, y1, x0, y0, color);
        };

        const frameFill = pal.panel2, frameLine = pal.borderStrong;

        /* frame */
        box(100, 326, 540, 368, 8, frameFill, frameLine);   // base
        box(118, 88, 148, 326, 4, frameFill, frameLine);    // left tower
        box(492, 88, 522, 326, 4, frameFill, frameLine);    // right tower
        box(118, 70, 522, 88, 4, frameFill, frameLine);     // crossbar

        /* Z lead screws (threaded rods inside towers) */
        ctx.strokeStyle = pal.muted;
        ctx.lineWidth = Math.max(1, s);
        [133, 507].forEach((sx) => {
          ctx.beginPath(); ctx.moveTo(X(sx), Y(96)); ctx.lineTo(X(sx), Y(320)); ctx.stroke();
          for (let y = 100; y < 316; y += 12) {
            ctx.beginPath(); ctx.moveTo(X(sx - 5), Y(y)); ctx.lineTo(X(sx + 5), Y(y + 5)); ctx.stroke();
          }
        });

        /* X gantry beam + rail line */
        box(148, 150, 492, 172, 3, frameFill, frameLine);
        ctx.strokeStyle = pal.muted;
        ctx.lineWidth = Math.max(1, 1.2 * s);
        ctx.beginPath(); ctx.moveTo(X(154), Y(167)); ctx.lineTo(X(486), Y(167)); ctx.stroke();

        /* separate purge-wiper / waste-drop assembly at the gantry's end */
        poly([[462, 176], [494, 176], [502, 200], [470, 200]], frameFill, frameLine);

        /* bed (parallelogram to suggest Y depth) + support */
        poly([[230, 272], [470, 272], [440, 302], [200, 302]], frameFill, frameLine);
        box(280, 302, 360, 324, 3, frameFill, frameLine);

        /* textured PEI plate — deliberate gold material swatch */
        poly([[240, 276], [456, 276], [430, 298], [214, 298]], "#c9a24f", "#8a6d33");
        ctx.fillStyle = "#a8853c";
        [[260, 283], [300, 290], [340, 282], [380, 291], [412, 281], [290, 281],
         [330, 293], [370, 284], [250, 292], [420, 290]].forEach((pt) => {
          ctx.beginPath();
          ctx.arc(X(pt[0]), Y(pt[1]), Math.max(1, 1.3 * s), 0, Math.PI * 2);
          ctx.fill();
        });

        /* heatbed nozzle wiper (separate from the gantry-end purge wiper) */
        box(432, 256, 462, 272, 2, frameFill, frameLine);
        ctx.strokeStyle = pal.muted;
        for (let bx = 436; bx <= 458; bx += 5) {
          ctx.beginPath(); ctx.moveTo(X(bx), Y(258)); ctx.lineTo(X(bx), Y(268)); ctx.stroke();
        }

        /* toolhead */
        box(292, 128, 352, 196, 6, pal.panel, frameLine);
        ctx.strokeStyle = frameLine;
        ctx.lineWidth = Math.max(1, 1.4 * s);
        ctx.beginPath(); ctx.arc(X(322), Y(160), S(13), 0, Math.PI * 2); ctx.stroke(); // part-cooling fan
        for (let a = 0; a < 3; a++) {
          const ang = a * ((Math.PI * 2) / 3) + 0.5;
          ctx.beginPath();
          ctx.moveTo(X(322), Y(160));
          ctx.lineTo(X(322) + Math.cos(ang) * S(11), Y(160) + Math.sin(ang) * S(11));
          ctx.stroke();
        }
        box(302, 134, 318, 142, 2, pal.panel2, frameLine); // eddy-current sensor chip hint

        /* hotend + nozzle */
        box(308, 196, 336, 208, 2, pal.panel2, frameLine);
        poly([[314, 208], [330, 208], [322, 220]], pal.soft, frameLine);

        /* touchscreen (tilted, front-left of base) */
        poly([[126, 332], [180, 332], [172, 362], [118, 362]], pal.panel, frameLine);
        ctx.save();
        ctx.globalAlpha = 0.35;
        poly([[131, 336], [174, 336], [167, 358], [124, 358]], pal.accent, null);
        ctx.restore();

        /* camera on left tower */
        ctx.beginPath(); ctx.arc(X(133), Y(240), S(8), 0, Math.PI * 2);
        ctx.fillStyle = pal.panel; ctx.fill();
        ctx.strokeStyle = frameLine; ctx.stroke();
        ctx.beginPath(); ctx.arc(X(133), Y(240), S(3.5), 0, Math.PI * 2);
        ctx.fillStyle = pal.accent; ctx.fill();

        /* AMS lite: stand + 4 open spools (deliberate filament swatches) */
        box(262, 52, 378, 70, 3, frameFill, frameLine);
        const spoolCols = ["#d95f5f", "#d9a75f", "#5fb877", "#5f8bd9"];
        [272, 308, 344, 380].forEach((sx, i) => {
          ctx.beginPath(); ctx.arc(X(sx), Y(34), S(17), 0, Math.PI * 2);
          ctx.fillStyle = spoolCols[i]; ctx.fill();
          ctx.strokeStyle = frameLine; ctx.stroke();
          ctx.beginPath(); ctx.arc(X(sx), Y(34), S(5), 0, Math.PI * 2);
          ctx.fillStyle = pal.bg; ctx.fill();
          ctx.strokeStyle = frameLine; ctx.stroke();
        });

        /* motion arrows + axis letters */
        arrow2(184, 161, 224, 161, pal.muted);  // X
        arrow2(158, 230, 158, 274, pal.muted);  // Z
        arrow2(252, 318, 288, 286, pal.muted);  // Y (depth)
        ctx.fillStyle = pal.muted;
        ctx.font = "600 " + Math.max(10, Math.round(11 * s)) + "px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("X", X(204), Y(148));
        ctx.fillText("Z", X(170), Y(252));
        ctx.fillText("Y", X(258), Y(334));

        /* highlight selected part */
        const selP = PARTS[sel];
        ctx.save();
        selP.regions.forEach((rg) => {
          rr(rg[0], rg[1], rg[2], rg[3], 6);
          ctx.globalAlpha = 0.14; ctx.fillStyle = pal.accent; ctx.fill();
          ctx.globalAlpha = 1; ctx.strokeStyle = pal.accent;
          ctx.lineWidth = Math.max(1.5, 2 * s);
          ctx.stroke();
        });
        ctx.restore();

        /* numbered markers */
        const fMark = "bold " + Math.max(11, Math.round(11 * s)) + "px system-ui, sans-serif";
        PARTS.forEach((p, i) => {
          const mx = X(p.marker[0]), my = Y(p.marker[1]);
          const r = i === sel ? Math.max(10, 12 * s) : Math.max(8.5, 10.5 * s);
          ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2);
          ctx.fillStyle = i === sel ? pal.accent : pal.panel;
          ctx.fill();
          ctx.strokeStyle = i === sel ? pal.accent : pal.borderStrong;
          ctx.lineWidth = Math.max(1, 1.4 * s);
          ctx.stroke();
          ctx.fillStyle = i === sel ? pal.accentText : pal.soft;
          ctx.font = fMark;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(i + 1), mx, my + 0.5);
        });

        /* selected part label near its marker */
        const lab = String(sel + 1) + " · " + selP.short;
        ctx.font = "600 " + Math.max(11, Math.round(12.5 * s)) + "px system-ui, sans-serif";
        const mx = X(selP.marker[0]), my = Y(selP.marker[1]);
        const tw = ctx.measureText(lab).width;
        let lx = mx + Math.max(14, 16 * s);
        let align = "left";
        if (lx + tw > W - 6) { lx = mx - Math.max(14, 16 * s); align = "right"; }
        const pad = 4;
        const bx = align === "left" ? lx - pad : lx - tw - pad;
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = pal.panel;
        ctx.fillRect(bx, my - 10, tw + pad * 2, 20);
        ctx.globalAlpha = 1;
        ctx.fillStyle = pal.accentText;
        ctx.textAlign = align; ctx.textBaseline = "middle";
        ctx.fillText(lab, lx, my + 0.5);

        /* caption line */
        ctx.fillStyle = pal.muted;
        ctx.font = Math.max(10, Math.round(11 * s)) + "px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText("Bambu Lab A1 — front view (cartoon, not to scale)", 8, 16);
      }

      /* controls */
      api.button({
        label: "Next part →",
        onClick: () => { sel = (sel + 1) % PARTS.length; refresh(); },
      });
      const rout = api.readout({});

      function refresh() {
        const p = PARTS[sel];
        rout.set(
          "<strong>" + (sel + 1) + ". " + p.name + "</strong> — " +
          p.role + " <em>" + p.spec + "</em>"
        );
        cv.setAria(
          "A1 anatomy diagram. Part " + (sel + 1) + " of " + PARTS.length +
          " selected: " + p.name + ". " + p.role
        );
        api.once(draw);
      }

      function hitTest(px, py) {
        for (let i = 0; i < PARTS.length; i++) {
          const m = PARTS[i].marker;
          const mx = t.ox + m[0] * t.s, my = t.oy + m[1] * t.s;
          const r = Math.max(16, 14 * t.s);
          const dx = px - mx, dy = py - my;
          if (dx * dx + dy * dy <= r * r) return i;
        }
        let best = -1, bestArea = Infinity;
        for (let j = 0; j < PARTS.length; j++) {
          const regs = PARTS[j].regions;
          for (let k = 0; k < regs.length; k++) {
            const rg = regs[k];
            const x0 = t.ox + rg[0] * t.s, y0 = t.oy + rg[1] * t.s;
            const x1 = t.ox + rg[2] * t.s, y1 = t.oy + rg[3] * t.s;
            if (px >= x0 && px <= x1 && py >= y0 && py <= y1) {
              const area = (x1 - x0) * (y1 - y0);
              if (area < bestArea) { bestArea = area; best = j; }
            }
          }
        }
        return best;
      }

      const onPointer = (e) => {
        const rect = cv.canvas.getBoundingClientRect();
        const i = hitTest(e.clientX - rect.left, e.clientY - rect.top);
        if (i >= 0 && i !== sel) { sel = i; refresh(); }
      };
      cv.canvas.addEventListener("pointerdown", onPointer);
      cv.canvas.style.cursor = "pointer";
      api.onCleanup(() => cv.canvas.removeEventListener("pointerdown", onPointer));

      cv.onResize(() => api.once(draw));
      refresh();
    },
  });

  /* ============================================================
     Sim 2 — a1-lineup
     Selected comparison: A1 mini / A1 / P1S / X1C, with a
     readout diffing volume, bed temp, kinematics and max accel.
     ============================================================ */
  A1.registerSim({
    id: "a1-lineup",
    title: "Selected Bambu printers — compare layouts",
    mount(api) {
      const cv = api.canvas(16 / 10);

      const MACHINES = {
        mini: {
          label: "A1 mini",
          kind: "open",
          scale: 0.72,
          lidar: false,
          tag: "open bed-slinger · 180³ mm",
          caption:
            "<strong>A1 mini</strong> · 180 × 180 × 180 mm · bed 80 °C · " +
            "Cartesian bed-slinger · published 10,000 mm/s² acceleration rating<br>" +
            "<em>Give up:</em> build volume and bed heat. <em>Gain:</em> the same toolhead, " +
            "sensor and AMS lite tech in a smaller, cheaper frame with a 2.4-inch screen.",
        },
        a1: {
          label: "A1",
          kind: "open",
          scale: 1,
          lidar: false,
          tag: "open bed-slinger · 256³ mm",
          caption:
            "<strong>A1</strong> · 256 × 256 × 256 mm · bed 100 °C · " +
            "Cartesian bed-slinger · published 10,000 mm/s² acceleration rating; " +
            "Studio v2.7.1.62 profile: 12,000 mm/s² X/Y/extruding limits<br>" +
            "The machine this guide is about: open frame, 3.5-inch touchscreen, " +
            "quick-swap hotend, optional AMS lite (shown top-mounted).",
        },
        p1s: {
          label: "P1S",
          kind: "enclosed",
          scale: 1,
          lidar: false,
          tag: "enclosed CoreXY",
          caption:
            "<strong>P1S</strong> · 256 × 256 × 256 mm · bed 100 °C · " +
            "CoreXY, enclosed · 20,000 mm/s² max accel<br>" +
            "<em>Give up:</em> the open frame’s easy access and lower price. " +
            "<em>Gain:</em> an enclosed chamber better suited to ABS/ASA and double the acceleration — " +
            "the bed only moves down, so two motors fling a light toolhead.",
        },
        x1c: {
          label: "X1 Carbon",
          kind: "enclosed",
          scale: 1,
          lidar: true,
          tag: "enclosed CoreXY · micro-lidar",
          caption:
            "<strong>X1 Carbon</strong> · 256 × 256 × 256 mm · " +
            "CoreXY, enclosed · 20,000 mm/s² max accel<br>" +
            "<em>Gain over P1S:</em> micro-lidar first-layer inspection, a hardened-steel " +
            "nozzle for abrasive filaments, and a 5-inch screen.",
        },
      };
      let cur = "a1";

      function draw() {
        const pal = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        const s = Math.min(W / 660, H / 412);
        const ox = (W - 640 * s) / 2, oy = (H - 400 * s) / 2;
        const m = MACHINES[cur];
        const k = m.scale;
        /* scale around ground anchor (320, 356) */
        const X = (v) => ox + (320 + (v - 320) * k) * s;
        const Y = (v) => oy + (356 - (356 - v) * k) * s;
        const S = (v) => v * k * s;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = pal.bg;
        ctx.fillRect(0, 0, W, H);

        const rr = (x0, y0, x1, y1, r) => {
          const x = X(x0), y = Y(y0), w = S(x1 - x0), h = S(y1 - y0);
          const rad = Math.max(0, Math.min(S(r), w / 2, h / 2));
          ctx.beginPath();
          ctx.moveTo(x + rad, y);
          ctx.arcTo(x + w, y, x + w, y + h, rad);
          ctx.arcTo(x + w, y + h, x, y + h, rad);
          ctx.arcTo(x, y + h, x, y, rad);
          ctx.arcTo(x, y, x + w, y, rad);
          ctx.closePath();
        };
        const box = (x0, y0, x1, y1, r, fill, stroke) => {
          rr(x0, y0, x1, y1, r);
          if (fill) { ctx.fillStyle = fill; ctx.fill(); }
          if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, 1.4 * s); ctx.stroke(); }
        };
        const poly = (pts, fill, stroke) => {
          ctx.beginPath();
          ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
          for (let i = 1; i < pts.length; i++) ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
          ctx.closePath();
          if (fill) { ctx.fillStyle = fill; ctx.fill(); }
          if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, 1.4 * s); ctx.stroke(); }
        };

        const frameFill = pal.panel2, frameLine = pal.borderStrong;

        /* ground line (unscaled) */
        ctx.strokeStyle = pal.border;
        ctx.lineWidth = Math.max(1, 1.2 * s);
        ctx.beginPath();
        ctx.moveTo(ox + 80 * s, oy + 356 * s);
        ctx.lineTo(ox + 560 * s, oy + 356 * s);
        ctx.stroke();

        if (m.kind === "open") {
          /* open bed-slinger frame */
          box(150, 312, 490, 356, 8, frameFill, frameLine);   // base
          box(150, 120, 178, 312, 4, frameFill, frameLine);   // towers
          box(462, 120, 490, 312, 4, frameFill, frameLine);
          box(150, 102, 490, 120, 4, frameFill, frameLine);   // crossbar
          ctx.strokeStyle = pal.muted;
          ctx.lineWidth = Math.max(1, s);
          [164, 476].forEach((sx) => {
            ctx.beginPath(); ctx.moveTo(X(sx), Y(128)); ctx.lineTo(X(sx), Y(306)); ctx.stroke();
          });
          box(178, 176, 462, 196, 3, frameFill, frameLine);   // X gantry
          box(300, 158, 340, 220, 5, pal.panel, frameLine);   // toolhead
          poly([[314, 220], [326, 220], [320, 232]], pal.soft, frameLine);
          /* bed + gold plate */
          poly([[245, 268], [455, 268], [425, 296], [215, 296]], frameFill, frameLine);
          box(300, 296, 380, 312, 3, frameFill, frameLine);
          poly([[253, 272], [447, 272], [423, 292], [229, 292]], "#c9a24f", "#8a6d33");
          /* Y motion arrow */
          const ax0 = X(250), ay0 = Y(308), ax1 = X(282), ay1 = Y(280);
          ctx.strokeStyle = pal.muted;
          ctx.lineWidth = Math.max(1, 1.4 * s);
          ctx.beginPath(); ctx.moveTo(ax0, ay0); ctx.lineTo(ax1, ay1); ctx.stroke();
          const hd = (tx, ty, fx, fy) => {
            const ang = Math.atan2(ty - fy, tx - fx);
            const L = Math.max(5, 7 * s);
            ctx.fillStyle = pal.muted;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx - L * Math.cos(ang - 0.45), ty - L * Math.sin(ang - 0.45));
            ctx.lineTo(tx - L * Math.cos(ang + 0.45), ty - L * Math.sin(ang + 0.45));
            ctx.closePath();
            ctx.fill();
          };
          hd(ax0, ay0, ax1, ay1);
          hd(ax1, ay1, ax0, ay0);
        } else {
          /* enclosed CoreXY box */
          box(175, 96, 465, 356, 10, frameFill, frameLine);
          box(175, 88, 465, 104, 6, pal.panel, frameLine);    // lid
          ctx.save();
          ctx.globalAlpha = 0.08;
          box(205, 140, 435, 332, 6, pal.accent, null);        // window glass
          ctx.restore();
          box(205, 140, 435, 332, 6, null, pal.border);        // window frame
          box(437, 232, 444, 262, 2, pal.panel, frameLine);    // door handle
          box(220, 152, 420, 164, 2, pal.panel, frameLine);    // top XY gantry
          box(302, 164, 338, 198, 4, pal.panel, frameLine);    // toolhead
          poly([[312, 198], [328, 198], [320, 208]], pal.soft, frameLine);
          box(235, 300, 405, 310, 2, "#c9a24f", "#8a6d33");    // stationary bed
          /* bed-only-moves-down arrow */
          ctx.strokeStyle = pal.muted;
          ctx.lineWidth = Math.max(1, 1.4 * s);
          ctx.beginPath(); ctx.moveTo(X(418), Y(268)); ctx.lineTo(X(418), Y(298)); ctx.stroke();
          ctx.fillStyle = pal.muted;
          ctx.beginPath();
          ctx.moveTo(X(418), Y(302));
          ctx.lineTo(X(414), Y(294));
          ctx.lineTo(X(422), Y(294));
          ctx.closePath();
          ctx.fill();
          /* lidar dot — X1C only */
          if (m.lidar) {
            ctx.beginPath(); ctx.arc(X(346), Y(176), Math.max(3, S(4.5)), 0, Math.PI * 2);
            ctx.fillStyle = pal.warn;
            ctx.fill();
            ctx.fillStyle = pal.soft;
            ctx.font = Math.max(10, Math.round(11 * s)) + "px system-ui, sans-serif";
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("micro-lidar", X(354), Y(176));
          }
        }

        /* labels (unscaled overlay) */
        ctx.fillStyle = pal.text;
        ctx.font = "700 " + Math.max(13, Math.round(15 * s)) + "px system-ui, sans-serif";
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText(m.label, 12, 24);
        ctx.fillStyle = pal.soft;
        ctx.font = Math.max(11, Math.round(12 * s)) + "px system-ui, sans-serif";
        ctx.fillText(m.tag, 12, 42);
        ctx.fillStyle = pal.muted;
        ctx.textAlign = "center";
        ctx.fillText(
          m.kind === "open" ? "bed slings on Y" : "CoreXY · bed only moves down",
          W / 2, oy + 382 * s
        );
        ctx.textAlign = "right";
        ctx.fillText("cartoon, not to scale", W - 8, H - 8);
      }

      const sel = api.select({
        label: "Machine",
        value: "a1",
        options: [
          { value: "mini", label: "A1 mini" },
          { value: "a1", label: "A1" },
          { value: "p1s", label: "P1S" },
          { value: "x1c", label: "X1 Carbon" },
        ],
        onChange: (v) => { cur = v; update(); },
      });
      const rout = api.readout({});

      function update() {
        const m = MACHINES[cur];
        rout.set(m.caption);
        cv.setAria("Selected-printer comparison, not the complete current Bambu catalogue. Showing " + m.label + ": " + m.tag + ".");
        api.once(draw);
      }

      cv.onResize(() => api.once(draw));
      update();
      void sel;
    },
  });

  /* ============================================================
     Chapter
     ============================================================ */
  A1.registerChapter({
    n: 1,
    tier: "Beginner",
    title: "Meet the A1",
    claims: ["FW-005", "FW-006", "QNT-002", "QNT-007", "QNT-008", "QNT-009", "QNT-010", "QNT-012", "SAF-001", "SAF-002"],
    html:
      '<div class="note"><strong>Objective.</strong> Identify each moving axis and the parts that ' +
      "heat, move, sense and handle filament. Then use those boundaries to decide where hands and " +
      "loose objects must never be during a print.</div>" +
      "<h3>One machine, three motions</h3>" +
      "<p><dfn>Fused deposition modeling</dfn> (<abbr title=\"fused deposition modeling\">FDM</abbr>) " +
      "means melting a filament and depositing it as successive paths and layers. What makes a " +
      "printer <em>this</em> printer is how it moves. The Bambu Lab A1 uses <dfn>Cartesian motion</dfn>—" +
      "three perpendicular X, Y and Z axes—in an <dfn>i3-style layout</dfn>, the common open-frame " +
      "arrangement where the build plate moves on Y. In other words, it is a " +
      "<strong>bed-slinger</strong>. The toolhead slides left and right on X. The whole heated bed slides front to " +
      "back on Y, carrying your print with it (hence the name). And the X beam climbs upward on " +
      "Z, one layer height at a time. Nothing hides inside an enclosure: you can watch every part " +
      "do its job, which makes the motion mechanisms easy to observe—while also leaving hot and " +
      "moving parts exposed.</p>" +

      '<div class="facts">' +
      '<div class="fact"><div class="v">256³ mm</div><div class="k">build volume</div></div>' +
      '<div class="fact"><div class="v">500 mm/s</div><div class="k">max toolhead speed</div></div>' +
      '<div class="fact"><div class="v">10,000 mm/s²</div><div class="k">published acceleration rating</div></div>' +
      '<div class="fact"><div class="v">12,000 mm/s²</div><div class="k">Studio v2.7.1.62 X/Y/extruding limits</div></div>' +
      '<div class="fact"><div class="v">300 °C</div><div class="k">hotend max</div></div>' +
      '<div class="fact"><div class="v">100 °C</div><div class="k">bed max</div></div>' +
      '<div class="fact"><div class="v">≤48 dB</div><div class="k">claimed in Silent mode</div></div>' +
      "</div>" +
      '<div class="note"><strong>Acceleration references are not promises.</strong> The product ' +
      "page's 10,000 mm/s² rating and the official " +
      '<a href="https://github.com/bambulab/BambuStudio/blob/v02.07.01.62/resources/profiles/BBL/machine/Bambu%20Lab%20A1%200.4%20nozzle.json" target="_blank" rel="noopener">stable Studio profile’s 12,000 mm/s² internal X/Y/extruding limits</a> ' +
      "are different reference surfaces. Neither is an ordinary setting, hardware failure threshold, " +
      "or guarantee that a particular model will sustain that acceleration.</div>" +

      "<h3>Walk the machine</h3>" +
      "<p>Start at the <strong>toolhead</strong> — the business end. It carries the hotend, a " +
      "part-cooling fan that helps deposited plastic solidify at a profile-controlled rate, and, hidden " +
      "inside, an eddy-current sensor that lets the nozzle itself act as a measuring probe " +
      "(Chapter 4 covers how). The whole <strong>hotend</strong> — nozzle plus melt zone — " +
      "is quick-swap: a spring clip releases the assembly without a wrench. That describes the " +
      "fastener, not the safety condition. Follow the current official procedure. If it explicitly " +
      "requires power or heat for a named step, complete only that step as directed; then " +
      "switch off and unplug before service, and let the hotend cool below 60&nbsp;°C. See " +
      '<a href="https://wiki.bambulab.com/en/a1/maintenance/basic-maintenance" target="_blank" rel="noopener">Bambu’s current maintenance guide</a>.</p>' +
      "<p>Now the skeleton. The toolhead rides a linear rail across the <strong>X gantry</strong>, " +
      "pulled by a belt. The <strong>bed</strong> does the same trick on Y: the entire heated " +
      "platform slings back and forth beneath the nozzle. And the gantry climbs on <strong>dual Z " +
      "lead screws</strong> turned by a single motor through one synchronous belt, so the beam can " +
      "normally rise in sync; belt, binding or alignment faults can still require service.</p>" +
      "<p>On the bed sits a <strong>textured <dfn title=\"polyetherimide, a heat-resistant bed-surface polymer\">PEI</dfn> spring-steel plate</strong>: magnetic, heats to " +
      "100 °C, and flexes to pop finished parts free once it cools. Housekeeping happens " +
      "at two distinct stations. The <strong>heatbed nozzle wiper</strong> at the rear of the bed " +
      "cleans the hot nozzle before a print, including before contact probing. The separate " +
      "<strong>purge wiper</strong> at the gantry end gathers and dislodges waste filament during " +
      "setup, pause/resume and filament changes. Conflating the two hides why both are service parts.</p>" +
      "<p>Finally, the human layer: a <strong>3.5-inch touchscreen</strong> on the front, a " +
      "<strong>1080p camera</strong> for keeping an eye on prints, and — optionally — the " +
      "<strong>AMS lite</strong> beside the printer or on a compatible top mount: an open four-spool color changer feeding the " +
      "single nozzle. Chapter 7 covers how a color change actually works.</p>" +

      '<div class="note"><strong>Monitoring is not a guarantee.</strong> The A1 has no lidar ' +
      "first-layer inspection. Its camera supports remote check-ins and timelapses; Bambu's current " +
      "feature wording varies across firmware and regional documentation, so this guide does not " +
      "promise camera-based defect detection. Optional nozzle-clump detection uses printer sensor " +
      "data, can pause some failures, and is explicitly not failproof. Watch unfamiliar first layers " +
      "and verify adhesion yourself. See the " +
      '<a href="https://wiki.bambulab.com/en/a1-mini/manual/nozzle-warp-detection" target="_blank" rel="noopener">official detection guide</a>.</div>' +

      '<div data-sim="a1-anatomy"></div>' +

      "<h3>A selected comparison—not the current complete catalogue</h3>" +
      "<p>The playground compares four reference models so the kinematic trade-offs stay visible; " +
      "it is not a claim that Bambu's current range contains only these machines. The " +
      "<strong>A1 mini</strong> uses closely related toolhead " +
      "technology in a smaller frame: 180 mm cubes instead of 256, and a bed that tops out at " +
      "80 °C instead of 100. The <strong>P1S</strong> and <strong>X1 Carbon</strong> " +
      "use a different XY arrangement: CoreXY kinematics — the bed only descends while two " +
      "motors drive a light toolhead around the whole XY plane — inside an enclosed chamber. " +
      "Their published 20,000 mm/s² maximum acceleration is twice the A1's rating, and their enclosure is warmer and less draft-prone, " +
      "better suited to high-shrink filaments such as ABS. The X1 Carbon then adds the micro-lidar, a " +
      "hardened nozzle for abrasive filaments, and a 5-inch screen.</p>" +
      "<p>Across these four examples, the published 500 mm/s top-speed rating is the same while " +
      "the acceleration ratings differ. Moving mass is one important engineering contributor; motor, " +
      "frame, control, thermal and product-design limits also matter. Chapter 2 keeps that distinction explicit.</p>" +

      '<div class="note"><strong>Predict → observe → interpret.</strong> Before selecting a model, ' +
      "predict whether its bed or toolhead performs fast Y motion. Observe the diagram and ratings, " +
      "then interpret only the shown trade-offs—do not infer that this is Bambu's complete current range.</div>" +

      '<div data-sim="a1-lineup"></div>' +

      '<div class="note"><strong>Transfer check.</strong> If a cable hangs behind the printer, ' +
      "which axis can catch it? If the display says the nozzle is 80&nbsp;°C, is a toolless hotend " +
      "ready to remove? Explain both answers from the anatomy, not from memory.</div>" +

      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://bambulab.com/en/a1/tech-specs" target="_blank" rel="noopener">Official A1 tech specs</a>' +
      '<a href="https://wiki.bambulab.com/en/a1/manual/intro-a1" target="_blank" rel="noopener">Bambu Wiki: A1 introduction</a>' +
      '<a href="https://www.makerviking.com/articles/bambu-lab-printer-comparison-x1-carbon-p1s-a1" target="_blank" rel="noopener">A1 vs P1S vs X1 Carbon comparison</a>' +
      "</div>",
  });
})();
