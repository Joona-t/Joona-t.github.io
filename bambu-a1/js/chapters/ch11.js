/* ch11 — Maintenance & mastery: the small routine that keeps the A1 printing
   like day one, the 2024 heatbed-cable episode as the record shows it, and
   what "mastery" actually looks like. Send-off chapter.
   Sim: "maintenance" — six grouped learning spots on a cartoon A1; the live
   official guide remains the complete schedule. */
(function () {
  "use strict";

  /* ---------------- maintenance sim ---------------- */

  A1.registerSim({
    id: "maintenance",
    title: "Six-point maintenance sampler",
    mount(api) {
      const cv = api.canvas(16 / 9);

      const SPOTS = [
        {
          key: "plate", label: "PEI plate",
          interval: "when contaminated or adhesion drops",
          how: "Wash with warm water and dish soap, rinse and dry fully. Handle by the edges; do not use acetone on textured PEI.",
        },
        {
          key: "zscrews", label: "X/Y rails + Z screws",
          interval: "oil X and Y monthly; grease Z every 3 months (current guide)",
          how: "Use lubricant oil on the X rail and Y rails; use grease on the Z lead screws. Never put grease on the X rail. Clean before relubricating.",
        },
        {
          key: "belts", label: "Belts",
          interval: "automatic — act when the printer asks",
          how: "The A1 checks its own belt tension during vibration calibration and raises an HMS alert if it drifts. No twanging by ear required.",
        },
        {
          key: "nozzle", label: "Nozzle",
          interval: "inspect/replace by material and usage; clean the hotend/heater monthly",
          how: "Before touching or removing the hotend: unload, let it cool below 60 °C, power off and unplug. Quick-release hardware removes wrench work, not burn or electrical risk.",
        },
        {
          key: "wiper", label: "Wiper + poop chute",
          interval: "inspect during purge cleanup; replace when worn or damaged",
          how: "With the printer cool, off, and still, remove loose purge debris only as the current maintenance or replacement procedure directs. Inspect the wiper and replace it when worn or torn.",
        },
        {
          key: "firmware", label: "Firmware",
          interval: "after reading the current release notes",
          how: "Use Settings > Firmware or an A1 package/method published by Bambu. LAN-only printing and firmware delivery are separate; never install an arbitrary file.",
        },
      ];

      const done = {};
      let hoverKey = null;

      function count() {
        let n = 0;
        for (let i = 0; i < SPOTS.length; i++) if (done[SPOTS[i].key]) n++;
        return n;
      }

      function layout() {
        const W = cv.W, H = cv.H;
        const colL = W * 0.20, colR = W * 0.80;
        const baseY = H * 0.78, baseH = H * 0.13;
        const beamY = H * 0.36, headX = W * 0.55;
        const bedW = W * 0.38, bedX = W * 0.5 - bedW / 2;
        return {
          W: W, H: H, colL: colL, colR: colR, colTop: H * 0.10, colW: 12,
          beamY: beamY, headX: headX,
          baseY: baseY, baseH: baseH, bedW: bedW, bedX: bedX,
          pos: {
            plate:    [W * 0.50, baseY - 16],
            zscrews:  [colL, H * 0.55],
            belts:    [W * 0.70, beamY + 4],
            nozzle:   [headX, beamY + 36],
            wiper:    [bedX - W * 0.045, baseY - 14],
            firmware: [W * 0.735, baseY + baseH * 0.5],
          },
        };
      }

      const ro = api.readout({ label: "0 / 6 learning spots sampled — use the full guide for real service." });

      api.button({
        label: "⟲ Reset checkup",
        onClick: function () {
          for (let i = 0; i < SPOTS.length; i++) delete done[SPOTS[i].key];
          hoverKey = null;
          cycleIdx = -1;
          ro.setText("0 / 6 learning spots sampled — use the full guide for real service.");
          api.once(draw);
        },
      });

      function spotAt(x, y) {
        const L = layout();
        for (let i = 0; i < SPOTS.length; i++) {
          const p = L.pos[SPOTS[i].key];
          const dx = x - p[0], dy = y - p[1];
          if (dx * dx + dy * dy < 20 * 20) return SPOTS[i];
        }
        return null;
      }

      function inspect(s) {
        done[s.key] = true;
        const n = count();
        ro.set(
          "<strong>" + n + " / 6</strong> · <strong>" + s.label + "</strong> — " +
          s.interval + ". " + s.how
        );
        cv.setAria(
          "Maintenance learning sampler: " + n + " of 6 grouped spots sampled. Just reviewed: " +
          s.label + ". " + s.how
        );
        api.once(draw);
      }

      /* keyboard path: cycle every checkup point without a pointer */
      let cycleIdx = -1;
      api.button({
        label: "Next spot →",
        onClick: function () {
          cycleIdx = (cycleIdx + 1) % SPOTS.length;
          inspect(SPOTS[cycleIdx]);
        },
      });

      function onClick(e) {
        const r = cv.canvas.getBoundingClientRect();
        const s = spotAt(e.clientX - r.left, e.clientY - r.top);
        if (!s) return;
        inspect(s);
      }

      function onMove(e) {
        const r = cv.canvas.getBoundingClientRect();
        const s = spotAt(e.clientX - r.left, e.clientY - r.top);
        const k = s ? s.key : null;
        if (k !== hoverKey) {
          hoverKey = k;
          cv.canvas.style.cursor = k ? "pointer" : "default";
          api.once(draw);
        }
      }

      cv.canvas.addEventListener("click", onClick);
      cv.canvas.addEventListener("pointermove", onMove);
      api.onCleanup(function () {
        cv.canvas.removeEventListener("click", onClick);
        cv.canvas.removeEventListener("pointermove", onMove);
      });

      function draw() {
        const p = api.pal();
        const ctx = cv.ctx, L = layout(), W = L.W, H = L.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);
        ctx.font = "12px system-ui, sans-serif";
        ctx.textBaseline = "middle";

        /* --- machine cartoon (front view) --- */
        ctx.fillStyle = p.panel2; ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1;
        // columns + top bar
        ctx.fillRect(L.colL - L.colW / 2, L.colTop, L.colW, L.baseY - L.colTop);
        ctx.strokeRect(L.colL - L.colW / 2, L.colTop, L.colW, L.baseY - L.colTop);
        ctx.fillRect(L.colR - L.colW / 2, L.colTop, L.colW, L.baseY - L.colTop);
        ctx.strokeRect(L.colR - L.colW / 2, L.colTop, L.colW, L.baseY - L.colTop);
        ctx.fillRect(L.colL - L.colW / 2, L.colTop, L.colR - L.colL + L.colW, 8);
        ctx.strokeRect(L.colL - L.colW / 2, L.colTop, L.colR - L.colL + L.colW, 8);
        // lead-screw thread hint inside left column
        ctx.save(); ctx.strokeStyle = p.border; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
        for (let y = L.colTop + 16; y < L.baseY - 8; y += 9) {
          ctx.beginPath();
          ctx.moveTo(L.colL - L.colW / 2 + 2, y + 4);
          ctx.lineTo(L.colL + L.colW / 2 - 2, y);
          ctx.stroke();
        }
        ctx.restore();
        // X beam + belt line
        ctx.fillStyle = p.panel2;
        ctx.fillRect(L.colL, L.beamY, L.colR - L.colL, 9);
        ctx.strokeRect(L.colL, L.beamY, L.colR - L.colL, 9);
        ctx.save(); ctx.strokeStyle = p.border; ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(L.colL + 8, L.beamY + 4.5); ctx.lineTo(L.colR - 8, L.beamY + 4.5);
        ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
        // toolhead + nozzle
        ctx.fillStyle = p.panel2; ctx.strokeStyle = p.borderStrong;
        ctx.fillRect(L.headX - 17, L.beamY - 8, 34, 22);
        ctx.strokeRect(L.headX - 17, L.beamY - 8, 34, 22);
        ctx.fillStyle = p.soft;
        ctx.beginPath();
        ctx.moveTo(L.headX - 6, L.beamY + 14);
        ctx.lineTo(L.headX + 6, L.beamY + 14);
        ctx.lineTo(L.headX, L.beamY + 30);
        ctx.closePath(); ctx.fill();
        // spool up top
        ctx.strokeStyle = p.border; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(W * 0.5, L.colTop - 2, 11, Math.PI, 0); ctx.stroke();
        ctx.lineWidth = 1;
        // base + screen
        ctx.fillStyle = p.panel; ctx.strokeStyle = p.borderStrong;
        ctx.fillRect(W * 0.12, L.baseY, W * 0.76, L.baseH);
        ctx.strokeRect(W * 0.12, L.baseY, W * 0.76, L.baseH);
        ctx.fillStyle = p.panel2;
        ctx.fillRect(W * 0.715, L.baseY + 6, W * 0.04, L.baseH - 12);
        ctx.strokeRect(W * 0.715, L.baseY + 6, W * 0.04, L.baseH - 12);
        // bed plate
        ctx.fillStyle = p.panel2;
        ctx.fillRect(L.bedX, L.baseY - 10, L.bedW, 10);
        ctx.strokeRect(L.bedX, L.baseY - 10, L.bedW, 10);
        ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = p.accent;
        ctx.fillRect(L.bedX, L.baseY - 10, L.bedW, 2); ctx.restore();
        // wiper tab + chute left of the bed
        ctx.fillStyle = p.border;
        ctx.fillRect(L.bedX - W * 0.055, L.baseY - 8, W * 0.028, 8);

        /* --- happiness meter (top left) --- */
        const n = count();
        const mx = W * 0.05, my = H * 0.09, mw = Math.min(W * 0.26, 190), mh = 10;
        ctx.fillStyle = p.panel; ctx.strokeStyle = p.borderStrong;
        ctx.fillRect(mx, my, mw, mh); ctx.strokeRect(mx, my, mw, mh);
        ctx.fillStyle = p.accent;
        ctx.fillRect(mx, my, mw * (n / 6), mh);
        ctx.fillStyle = p.muted; ctx.textAlign = "left";
        ctx.fillText("learning progress", mx, my - 10);
        ctx.fillStyle = p.soft;
        ctx.fillText(n + " / 6 concepts sampled", mx, my + mh + 12);
        // tiny face beside the meter, smile grows with n
        const fx = mx + mw + 22, fy = my + mh / 2;
        ctx.strokeStyle = n > 0 ? p.accent : p.muted; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(fx, fy, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath(); ctx.arc(fx - 4, fy - 3, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(fx + 4, fy - 3, 1.4, 0, Math.PI * 2); ctx.fill();
        const curve = (n / 6 - 0.5) * 8; // frown → smile
        ctx.beginPath();
        ctx.moveTo(fx - 5, fy + 4 - curve / 2);
        ctx.quadraticCurveTo(fx, fy + 4 + curve, fx + 5, fy + 4 - curve / 2);
        ctx.stroke();
        ctx.lineWidth = 1;

        /* --- hotspots --- */
        for (let i = 0; i < SPOTS.length; i++) {
          const s = SPOTS[i];
          const q = L.pos[s.key];
          const isDone = !!done[s.key];
          const isHover = hoverKey === s.key;
          ctx.save();
          if (isDone) {
            ctx.fillStyle = p.accent;
            ctx.beginPath(); ctx.arc(q[0], q[1], 11, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = p.accentText; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(q[0] - 4.5, q[1] + 0.5);
            ctx.lineTo(q[0] - 1.5, q[1] + 4);
            ctx.lineTo(q[0] + 5, q[1] - 4);
            ctx.stroke();
          } else {
            if (isHover) { ctx.shadowColor = p.accent; ctx.shadowBlur = 12; }
            ctx.fillStyle = p.panel;
            ctx.beginPath(); ctx.arc(q[0], q[1], isHover ? 12 : 10, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = p.accent; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(q[0], q[1], isHover ? 12 : 10, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = p.accent;
            ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
          // label — nudged per spot so nothing overlaps the machine
          ctx.fillStyle = isDone ? p.soft : p.muted;
          ctx.textAlign = "center";
          let lx = q[0], ly = q[1] + 24;
          if (s.key === "zscrews") { ctx.textAlign = "left"; lx = q[0] + 16; ly = q[1]; }
          if (s.key === "belts") { ly = q[1] - 22; }
          if (s.key === "firmware") { ly = q[1] + 26; }
          if (s.key === "wiper") { lx = q[0] - 4; ly = q[1] + 26; ctx.textAlign = "right"; }
          ctx.fillText(s.label, lx, ly);
        }

        ctx.textAlign = "right"; ctx.fillStyle = p.muted;
        ctx.fillText(n === 6 ? "all six sampled — now use the full guide ✓" : "click the dots to inspect", W - 10, 16);
        ctx.textAlign = "left";
      }

      cv.setAria(
        "Interactive maintenance learning sampler: a cartoon Bambu Lab A1 with six clickable grouped " +
        "checkup points — PEI plate, X and Y rails plus Z lead screws, belts, nozzle, wiper and poop chute, " +
        "and firmware. Clicking each shows its maintenance interval and a one-line how-to, " +
        "and fills a printer-happiness meter."
      );
      cv.onResize(function () { draw(); });
      api.once(draw);
    },
  });

  /* ---------------- chapter ---------------- */

  A1.registerChapter({
    n: 11,
    tier: "Advanced",
    title: "Maintenance & mastery",
    claims: ["FW-009", "MNT-001", "MNT-002", "MNT-003", "MNT-004", "MNT-005", "SAF-001", "SAF-002", "SAF-004"],
    html:
      '<div class="note"><strong>Objective.</strong> Perform the current X/Y/Z lubrication schedule without mixing oil and grease, service the hotend only after shutdown and cooldown, distinguish the 2024 callback from the formal recall, and know when to stop and contact support.</div>' +
      "<h3 id=\"diagnose-hotend-service\">The routine</h3>" +
      "<p>Automation does not clean or lubricate the machine. Start with the plate: when contamination or adhesion drops, wash it with warm water and dish soap, rinse, dry fully, and handle it by the edges. Do not use acetone on textured PEI.</p>" +
      "<p>The current <a href=\"https://wiki.bambulab.com/en/a1/maintenance/basic-maintenance\" target=\"_blank\" rel=\"noopener\">A1 maintenance guide</a> calls for <strong>lubricant oil on the X rail every month, lubricant oil on the Y rails every month, and grease on the Z lead screws every three months</strong>. Dusty/high-use conditions or an HMS prompt can justify earlier service. Clean the relevant surface before applying the specified lubricant.</p>" +
      '<div class="warn"><strong>Oil X and Y; grease Z.</strong> Bambu says never put grease on the X rail, but that does <em>not</em> mean leave X dry. Use lubricant oil on X. The current guide also calls for oil at specified X- and Y-idler pulley/shaft contact points. Apply it only where the illustrated procedure shows; do not coat a belt, belt teeth, pulley running surface, electronics, plate, or floor.</div>' +
      "<h3>Current-guide schedule snapshot</h3>" +
      "<table><thead><tr><th>Cadence</th><th>Current A1 guide groups</th><th>Owner action</th></tr></thead><tbody>" +
      "<tr><td>Weekly</td><td>Fans</td><td>Inspect fan condition/airflow and address debris, abnormal noise, or an HMS alert using the linked procedure.</td></tr>" +
      "<tr><td>Monthly</td><td>X and Y motion; hotend/heater area</td><td>Oil X and Y as specified; clean the hotend/heater area by the official cold-service procedure.</td></tr>" +
      "<tr><td>Every 3 months</td><td>Z lead screws; X/Y idler pulley bearing points</td><td>Clean and grease Z. Oil only the idler pulley/shaft contact points shown in the guide, using its access steps and a controlled drop; keep oil off the belts and pulley running surfaces.</td></tr>" +
      "<tr><td>Usage-, material-, or spool-dependent</td><td>Extruder/hotend, cutter, PTFE tubes and other wear parts</td><td>Inspect and replace at the live guide's current thresholds or when wear, feed errors, or damage justify it. Abrasive filament shortens relevant wear life.</td></tr>" +
      "</tbody></table>" +
      '<div class="note"><strong>Sampler, not checklist.</strong> The six interactive spots below group concepts for recall; they are not the complete maintenance schedule. Before servicing, reopen the live guide because thresholds, part revisions, and procedures can change.</div>' +
      "<p>Inspect the nozzle and PTFE path for wear, especially after abrasive filament. With the printer cool, off, and still, clear loose purge debris only by the current maintenance or wiper-replacement procedure; do not improvise a cleaning method. Replace a torn wiper. Treat HMS alerts as diagnostic evidence rather than guessing at belt tension or disassembling assemblies unnecessarily.</p>" +
      '<div class="warn"><strong>Service cold and de-energized.</strong> Before removing the hotend or silicone sock, unload filament, let the hotend cool below 60&nbsp;°C, switch the printer off, unplug it, and confirm motion has stopped. A quick-release hotend removes wrench work; it does not remove burn, pinch, or electrical hazards. Follow the exact official replacement guide for the installed hotend.</div>' +
      '<p><strong>Predict before playing:</strong> which checkup point uses grease, which two use oil, and which requires power isolation? Use “Next spot” to verify without relying on the drawing.</p>' +
      '<div data-sim="maintenance"></div>' +
      "<h3>Firmware is a moving part too</h3>" +
      "<p>Read release notes before changing firmware and keep Bambu Studio/Handy compatible with it. Use the printer's Settings &gt; Firmware route or an A1 offline package and procedure currently published by Bambu. <strong>LAN-only is a print-transport mode, not proof that Studio delivers firmware locally.</strong> Availability of offline packages can lag or vary, so do not copy arbitrary firmware files to the microSD card. Use the <a href=\"https://bambulab.com/en/support/firmware-download/a1\" target=\"_blank\" rel=\"noopener\">current A1 firmware download page</a> when an offline update is required.</p>" +
      "<h3>The 2024 heatbed-cable recall: a dated timeline</h3>" +
      "<p><strong>January 28, 2024:</strong> Bambu's early <a href=\"https://blog.bambulab.com/a1-heatbed-cable-callback/\" target=\"_blank\" rel=\"noopener\">callback notice</a> described inspecting the cable and a snap-on protector for apparently intact cables. <strong>February 4:</strong> Bambu's <a href=\"https://blog.bambulab.com/a1-recall-update/\" target=\"_blank\" rel=\"noopener\">recall update</a> superseded that narrower posture and told A1 owners to stop using affected-market printers while refund or revised-heatbed routes were arranged.</p>" +
      "<p><strong>June 13, 2024:</strong> the U.S. CPSC published the formal recall for about 12,800 A1 printers sold from <strong>December 2023 through January 2024</strong>. The notice identifies affected units by an <strong>A as the sixth serial-number character</strong> and directs consumers to stop use and contact Bambu Lab for a full refund or replacement of the heatbed/cable by a local electronics repair facility. It explicitly says consumers should not attempt the repair themselves. The A1 mini was not included. Read the <a href=\"https://www.cpsc.gov/Recalls/2024/Bambu-Lab-Recalls-A1-3D-Printers-Due-to-Electric-Shock-and-Fire-Hazards\" target=\"_blank\" rel=\"noopener\">CPSC recall notice</a> for the controlling U.S. remedy.</p>" +
      '<div class="warn"><strong>Current action.</strong> If the serial number, repair history, or cable condition is uncertain, stop using the printer, switch it off, unplug it, and contact Bambu Support or the original reseller with the serial number. Do not treat the early snap-on protector or historical vouchers as today\'s formal remedy. Bambu states that <a href="https://us.store.bambulab.com/products/A1/" target="_blank" rel="noopener">current retail A1 units use the revised heatbed cable</a>, but a second-hand machine still needs its history verified.</div>' +
      '<div class="facts">' +
      '<div class="fact"><div class="v">monthly</div><div class="k">oil X and Y rails</div></div>' +
      '<div class="fact"><div class="v">every 3 months</div><div class="k">grease Z lead screws</div></div>' +
      '<div class="fact"><div class="v">&lt;60 °C + unplugged</div><div class="k">before hotend service</div></div>' +
      '<div class="fact"><div class="v">sixth character: A</div><div class="k">CPSC affected serial identifier</div></div>' +
      "</div>" +
      "<h3>What mastery looks like</h3>" +
      "<p>It is not memorizing settings. It is observing the first layer, using the current maintenance source instead of folklore, separating a symptom from a cause, and stopping when a safety-critical condition exceeds user service. Re-run calibration after moving the printer or changing its physical setup; verify rather than assuming stored calibration still describes the new environment.</p>" +
      '<p><strong>Transfer:</strong> locate the X rail, Y rails, Z screws, power switch, plug, serial label, and Bambu Support route on your own machine. State the lubricant and interval for each axis aloud. If you cannot verify recall/repair history on a used A1, stop there and contact support.</p>' +
      "<p>Move, melt, calibrate, multi-color, slice, print — and now maintain safely. The machine earns reliability through measured automation; the owner earns it through observation, correct sources, and knowing when not to improvise.</p>" +
      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://wiki.bambulab.com/en/a1/maintenance/basic-maintenance" target="_blank" rel="noopener">Bambu wiki: A1 basic maintenance</a>' +
      '<a href="https://wiki.bambulab.com/en/general/lead-screws-lubrication" target="_blank" rel="noopener">Bambu wiki: lead-screw lubrication</a>' +
      '<a href="https://www.cpsc.gov/Recalls/2024/Bambu-Lab-Recalls-A1-3D-Printers-Due-to-Electric-Shock-and-Fire-Hazards" target="_blank" rel="noopener">CPSC: controlling U.S. recall notice</a>' +
      '<a href="https://blog.bambulab.com/a1-recall-update/" target="_blank" rel="noopener">Bambu: February 2024 recall update</a>' +
      "</div>",
  });
})();
