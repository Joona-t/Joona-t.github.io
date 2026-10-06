/* ch10 — Materials & the open frame. The warping sim is deliberately
   qualitative: it compares mechanisms and does not predict success. */
(function () {
  "use strict";

  /* ---------------- warp sim ---------------- */

  A1.registerSim({
    id: "warp",
    title: "Why corners peel: the warping playground",
    mount(api) {
      const cv = api.canvas(16 / 9);

      /* Filament swatch colors are deliberate (allowed exception). */
      const MATS = {
        PLA:  { swatch: "#4caf6e", demo: 0.12, tendency: "lower",
                why: "Bambu rates PLA Ideal for the A1; geometry, plate preparation and profile still matter." },
        PETG: { swatch: "#3b9fd8", demo: 0.2, tendency: "lower",
                why: "Bambu rates PETG Ideal for the A1, with a suitable plate and filament profile." },
        TPU:  { swatch: "#f0a63c", demo: 0.08, tendency: "lower",
                why: "Bambu rates TPU Ideal for the printer, but feeder compatibility depends on the exact TPU SKU." },
        ABS:  { swatch: "#d95555", demo: 0.68, tendency: "greater",
                why: "Bambu marks ABS Not Recommended on A1; an open frame cannot hold a controlled warm chamber." },
        ASA:  { swatch: "#a86bd8", demo: 0.64, tendency: "greater",
                why: "Bambu marks ASA Not Recommended on A1; it has similar chamber and ventilation concerns to ABS." },
      };

      let mat = "PLA";
      let enclosure = false;
      let largePart = true;

      function illustratedLift() {
        const m = MATS[mat];
        return m.demo * (largePart ? 1 : 0.42) * (enclosure ? 0.35 : 1);
      }

      function tendencyLabel() {
        if (enclosure) return "enclosed-printer comparison";
        return MATS[mat].tendency + " tendency · open frame";
      }

      function draw() {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        const m = MATS[mat];
        const r = illustratedLift();

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);

        // ---- layout ----
        const bedW = W * 0.68, bedH = Math.max(10, H * 0.05);
        const bedX = (W - bedW) / 2;
        const bedTop = H * 0.78;
        const partW = bedW * 0.86, partH = H * 0.2;
        const partX = (W - partW) / 2;
        const maxLift = H * 0.17;
        const liftPx = r * maxLift;

        // ---- air environment ----
        if (enclosure) {
          const ex = W * 0.075, ey = H * 0.06, ew = W * 0.85, eh = bedTop + bedH + 10 - ey;
          ctx.save();
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = p.warn;
          ctx.fillRect(ex, ey, ew, eh);
          ctx.restore();
          ctx.save();
          ctx.strokeStyle = p.warn;
          ctx.setLineDash([7, 5]);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ex, ey, ew, eh);
          ctx.restore();
          ctx.font = "12px system-ui, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillStyle = p.warn;
          ctx.fillText("purpose-built enclosed-printer comparison", ex + 8, ey + 6);
          ctx.fillStyle = p.muted;
          ctx.fillText("not an A1 modification · warm, more stable air", ex + 8, ey + 22);
        } else {
          // cool drafts drifting across the open frame
          ctx.save();
          ctx.strokeStyle = p.muted;
          ctx.globalAlpha = 0.55;
          ctx.lineWidth = 1.5;
          for (let k = 0; k < 3; k++) {
            const y = H * (0.16 + 0.13 * k);
            ctx.beginPath();
            ctx.moveTo(W * 0.1, y);
            ctx.bezierCurveTo(W * 0.28, y - 9, W * 0.42, y + 9, W * 0.6, y);
            ctx.stroke();
            // arrowhead
            ctx.beginPath();
            ctx.moveTo(W * 0.6, y);
            ctx.lineTo(W * 0.6 - 7, y - 4);
            ctx.moveTo(W * 0.6, y);
            ctx.lineTo(W * 0.6 - 7, y + 4);
            ctx.stroke();
          }
          ctx.restore();
          ctx.font = "12px system-ui, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillStyle = p.muted;
          ctx.fillText("open frame — cool room air reaches every layer", W * 0.1, H * 0.06);
        }

        // ---- heated bed ----
        // heat glow above the bed, scaled by bed temperature
        const glowA = 0.16;
        const glowH = H * 0.1;
        const grad = ctx.createLinearGradient(0, bedTop - glowH, 0, bedTop);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        ctx.save();
        ctx.globalAlpha = glowA;
        grad.addColorStop(1, p.warn);
        ctx.fillStyle = grad;
        ctx.fillRect(bedX, bedTop - glowH, bedW, glowH);
        ctx.restore();

        ctx.fillStyle = p.panel2;
        ctx.strokeStyle = p.borderStrong;
        ctx.lineWidth = 1;
        ctx.fillRect(bedX, bedTop, bedW, bedH);
        ctx.strokeRect(bedX, bedTop, bedW, bedH);
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = p.accent;
        ctx.fillRect(bedX, bedTop, bedW, 2.5);
        ctx.restore();
        ctx.fillStyle = p.soft;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText("heated build plate — use the exact filament/plate profile", W / 2, bedTop + bedH / 2 + 1);

        // ---- the part: a big flat slab whose corners curl up ----
        // lift(u): 0 at center, liftPx at the extreme corners
        function lift(u) {
          return liftPx * Math.pow(Math.abs(u * 2 - 1), 2.3);
        }
        const STEPS = 60;
        function bottomY(u) { return bedTop - lift(u); }
        function topY(u) { return bedTop - partH - lift(u) * 0.8; }

        // gap shading under lifted corners
        if (liftPx > 1.5) {
          ctx.save();
          ctx.globalAlpha = 0.22;
          ctx.fillStyle = p.danger;
          for (const side of [0, 1]) {
            ctx.beginPath();
            ctx.moveTo(partX + side * partW, bedTop);
            for (let i = 0; i <= STEPS; i++) {
              const u = side === 0 ? (i / STEPS) * 0.5 : 1 - (i / STEPS) * 0.5;
              ctx.lineTo(partX + u * partW, bottomY(u));
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        // part body
        ctx.beginPath();
        for (let i = 0; i <= STEPS; i++) {
          const u = i / STEPS, x = partX + u * partW;
          if (i === 0) ctx.moveTo(x, bottomY(u)); else ctx.lineTo(x, bottomY(u));
        }
        for (let i = STEPS; i >= 0; i--) {
          const u = i / STEPS;
          ctx.lineTo(partX + u * partW, topY(u));
        }
        ctx.closePath();
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = m.swatch;
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = p.borderStrong;
        ctx.stroke();

        // layer lines following the curl
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = p.bg;
        ctx.lineWidth = 1;
        for (let L = 1; L < 6; L++) {
          const f = L / 6;
          ctx.beginPath();
          for (let i = 0; i <= STEPS; i++) {
            const u = i / STEPS, x = partX + u * partW;
            const y = bottomY(u) + (topY(u) - bottomY(u)) * f;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // shrink arrows: upper layers pulling inward, sized by shrink tendency
        const arrowLen = 14 + 30 * m.demo;
        const ay = topY(0.5) + partH * 0.22;
        ctx.save();
        ctx.strokeStyle = p.text;
        ctx.fillStyle = p.text;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 2;
        for (const dir of [1, -1]) {
          const x0 = W / 2 + dir * partW * 0.31;
          const x1 = x0 - dir * arrowLen;
          ctx.beginPath();
          ctx.moveTo(x0, ay);
          ctx.lineTo(x1, ay);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x1, ay);
          ctx.lineTo(x1 + dir * 6, ay - 4);
          ctx.lineTo(x1 + dir * 6, ay + 4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = p.soft;
        ctx.textAlign = "center";
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText("cooling layers shrink & pull inward", W / 2, ay - 12);

        // corner-lift callout
        if (liftPx > 3) {
          const cx2 = partX + partW;
          const cy2 = bottomY(1);
          ctx.save();
          ctx.strokeStyle = p.danger;
          ctx.fillStyle = p.danger;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx2 + 6, bedTop + 2);
          ctx.lineTo(cx2 + 6, cy2);
          ctx.stroke();
          ctx.textAlign = "left";
          ctx.fillText("corner lift", Math.min(cx2 + 10, W - 66), (bedTop + cy2) / 2);
          ctx.restore();
        }

        // material tag + swatch
        ctx.save();
        ctx.fillStyle = m.swatch;
        ctx.fillRect(W * 0.1, H * 0.88, 10, 10);
        ctx.strokeStyle = p.borderStrong;
        ctx.strokeRect(W * 0.1, H * 0.88, 10, 10);
        ctx.fillStyle = p.text;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "13px system-ui, sans-serif";
        ctx.fillText(mat + " — " + (largePart ? "large flat part" : "small low-infill part") + ", side view", W * 0.1 + 16, H * 0.88 + 5);
        ctx.restore();

        // verdict tag on canvas
        ctx.save();
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = "13px system-ui, sans-serif";
        ctx.fillStyle = m.tendency === "lower" ? p.accent : p.warn;
        ctx.fillText(tendencyLabel() + " · illustration", W * 0.9, H * 0.88 + 5);
        ctx.restore();

        cv.setAria(
          "Qualitative side-view illustration of a " + (largePart ? "large flat " : "small low-infill ") +
          mat + " part" + (enclosure ? " on a purpose-built enclosed-printer comparison" : " on the open-frame A1") +
          ". It demonstrates cooling stress and is not a prediction of print success."
        );

        updateReadout();
      }

      // readout text is assembled from author-written fragments only
      let ro;
      function updateReadout() {
        const m = MATS[mat];
        let txt = mat + ": " + m.why + " This is a qualitative mechanism demo, not a risk calculator.";
        if (enclosure) {
          txt += " This compares against a printer engineered with a chamber; it does not suggest enclosing the A1.";
        } else if (!largePart) {
          txt += " A small low-infill part may be easier than a large dense one, but Bambu's Not Recommended rating does not become a guarantee.";
        }
        ro.setText(txt);
      }

      api.select({
        label: "Material",
        options: [
          { value: "PLA", label: "PLA (ideal)" },
          { value: "PETG", label: "PETG (ideal)" },
          { value: "TPU", label: "TPU (ideal)" },
          { value: "ABS", label: "ABS (not recommended)" },
          { value: "ASA", label: "ASA (not recommended)" },
        ],
        value: mat,
        onChange: (val) => { mat = val; api.once(draw); },
      });
      api.toggle({
        label: "Large, flat, higher-infill geometry",
        value: true,
        onChange: (on) => { largePart = on; api.once(draw); },
      });
      api.toggle({
        label: "Compare a purpose-built enclosed printer (not a DIY A1 enclosure)",
        value: false,
        onChange: (on) => { enclosure = on; api.once(draw); },
      });
      ro = api.readout({ label: "" });

      cv.onResize(() => draw());
      api.once(draw);
    },
  });

  /* ---------------- chapter ---------------- */

  A1.registerChapter({
    n: 10,
    tier: "Advanced",
    title: "Materials & the open frame",
    claims: ["CMP-001", "CMP-002", "CMP-003", "CMP-005", "CMP-006", "QNT-005", "QNT-008", "QNT-012", "SAF-003"],
    html:
      '<div class="note"><strong>Objective.</strong> Use the live printer, feeder, nozzle, and filament-SKU compatibility data to choose a material; explain why geometry and chamber temperature affect warping; and separate an official <em>Not Recommended</em> rating from “physically impossible.”</div>' +
      "<h3 id=\"diagnose-warping\">Every print is a cooling problem</h3>" +
      "<p>Thermoplastics shrink as they cool. New layers contract against cooler layers below, storing stress. On a large flat part that stress concentrates at the corners; if it overcomes first-layer adhesion, a corner lifts. Material is only part of the story: footprint, wall thickness, infill, drafts, plate preparation, and the exact profile matter too.</p>" +
      "<p><strong>Predict before playing:</strong> compare a small low-infill part with a large dense plate. Then compare the open A1 with a purpose-built enclosed printer. The drawing is intentionally qualitative; it does not calculate success probability or a safe temperature.</p>" +
      '<div data-sim="warp"></div>' +
      "<h3>What a purpose-built enclosure changes</h3>" +
      "<p>A chamber-designed printer keeps air around the part warmer and more stable, reducing steep thermal gradients. The open-frame A1 cannot control chamber temperature: its 100&nbsp;°C bed warms the first layers but not the whole build volume.</p>" +
      '<div class="warn"><strong>Don’t box in the A1.</strong> Bambu advises against enclosing it because electronics and motors are designed for open-air cooling. The simulation compares a <em>different printer engineered with a chamber</em>, not a cover placed around an A1. Follow the exact filament/plate profile and Bambu\'s <a href="https://wiki.bambulab.com/en/filament-acc/filament/print-quality/warping-falling-off-collapsing" target="_blank" rel="noopener">warping troubleshooting sequence</a>; do not apply a universal temperature bump.</div>' +
      '<div class="facts">' +
      '<div class="fact"><div class="v">100 °C</div><div class="k">bed maximum, not a chamber</div></div>' +
      '<div class="fact"><div class="v">300 °C</div><div class="k">hotend maximum, not a material approval</div></div>' +
      '<div class="fact"><div class="v">open frame</div><div class="k">room air reaches the part</div></div>' +
      '<div class="fact"><div class="v">SKU-specific</div><div class="k">feeder and nozzle compatibility</div></div>' +
      "</div>" +
      "<h3>The official matrix, with its caveat</h3>" +
      "<p>Bambu's current A1 specification/FAQ rates PLA, PETG, TPU, and PVA <strong>Ideal</strong>; ABS, ASA, PC, PA, PET, and carbon/glass-fiber-reinforced filaments are <strong>Not Recommended</strong>. That is a support/reliability verdict, not a law of physics: the FAQ notes that some small, low-infill ABS/ASA/PC/PA parts may print, while large or high-infill parts have greater warping and layer-bonding risk. Use a chamber-designed printer when the material or result matters.</p>" +
      "<table><thead><tr><th>Material family</th><th>A1 verdict</th><th>Practical interpretation</th><th>Feed/nozzle check</th></tr></thead><tbody>" +
      "<tr><td>PLA / PETG</td><td>Ideal</td><td>Use the exact plate and filament profile</td><td>AMS lite generally supported</td></tr>" +
      "<tr><td>TPU</td><td>Ideal for printer</td><td>Flexible grades differ substantially</td><td>generic soft TPU external; TPU for AMS is a named exception</td></tr>" +
      "<tr><td>PVA / BVOH</td><td>PVA Ideal</td><td>Must be dry; support pairing is profile-specific</td><td>dry material can be AMS lite compatible; wet material is not</td></tr>" +
      "<tr><td>ABS / ASA</td><td>Not Recommended</td><td>Small low-infill parts may work; no guarantee</td><td>ventilation required; open-frame limitation remains</td></tr>" +
      "<tr><td>PC / PA / PET</td><td>Not Recommended</td><td>Material-specific heat, drying and chamber demands</td><td>check exact spool and printer profile</td></tr>" +
      "<tr><td>CF/GF/glow filled</td><td>Not Recommended</td><td>Base-polymer limits plus abrasion</td><td>verify exact SKU; only Bambu PLA-CF is mutually confirmed here</td></tr>" +
      "</tbody></table>" +
      '<div class="warn"><strong>Ventilate ABS and ASA.</strong> Bambu\'s <a href="https://us.store.bambulab.com/collections/all-filaments/products/abs-filament" target="_blank" rel="noopener">ABS</a> and <a href="https://eu.store.bambulab.com/en/collections/asa-abs/products/asa-aero" target="_blank" rel="noopener">ASA</a> product guidance warns that pungent, unpleasant odors may be released and calls for a well-ventilated location. An open frame is not fume control. Follow the exact spool\'s safety data sheet and do not run it in an occupied unventilated room.</div>' +
      "<h3>TPU, abrasives, and wet spools</h3>" +
      "<p>Generic TPU/TPE and TPU 95A belong on the external holder, but Bambu's stiffer <a href=\"https://us.store.bambulab.com/products/tpu-for-ams\" target=\"_blank\" rel=\"noopener\">TPU for AMS</a> is explicitly compatible with AMS lite. Dry PVA/BVOH is another supported exception, while wet PVA/BVOH is unsupported. Read the exact product page; a family name alone is not enough information.</p>" +
      "<p>Filled filaments add abrasion to the base polymer's thermal limits. Use the nozzle diameter and material specified by that filament's current guide, commonly hardened steel. Feeder compatibility remains separate. <a href=\"https://us.store.bambulab.com/products/pla-cf\" target=\"_blank\" rel=\"noopener\">Bambu PLA-CF</a> is the only fiber-filled AMS lite exception this tutorial currently treats as mutually confirmed by both its product page and the AMS lite matrix; do not generalize that result to other CF/GF or glow filaments. In particular, <a href=\"https://us.store.bambulab.com/en/products/paht-cf\" target=\"_blank\" rel=\"noopener\">PAHT-CF's product page</a> says AMS lite is not compatible and requires an enclosed printer even though the AMS lite matrix conflicts. Use the conservative result: no AMS lite and no open-frame A1 for PAHT-CF unless Bambu reconciles those pages.</p>" +
      "<p>AMS lite is open and does not actively dry filament. Hygroscopic PETG, TPU, PVA, and engineering filaments can absorb enough moisture to string, bubble, or weaken. Dry and store each spool according to its data sheet; do not compensate for wet filament with random slicer changes.</p>" +
      '<p><strong>Transfer:</strong> choose one spool you own and verify four separate rows before printing: A1 material verdict, nozzle material/diameter, AMS lite status, and drying/ventilation requirement. A green result in one row does not override a red result in another.</p>' +
      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://wiki.bambulab.com/en/a1/manual/faq" target="_blank" rel="noopener">Bambu wiki: A1 FAQ (material and enclosure guidance)</a>' +
      '<a href="https://wiki.bambulab.com/en/filament-acc/filament/print-quality/warping-falling-off-collapsing" target="_blank" rel="noopener">Bambu wiki: warping — causes &amp; fixes</a>' +
      '<a href="https://wiki.bambulab.com/en/general/filament-guide-material-table" target="_blank" rel="noopener">Bambu filament guide: per-material table</a>' +
      '<a href="https://us.store.bambulab.com/en/products/ams-lite" target="_blank" rel="noopener">Live AMS lite material table</a>' +
      "</div>",
  });
})();
