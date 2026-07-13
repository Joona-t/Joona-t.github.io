/* ch06 — Flow & pressure advance.
   Sim: "pressure-advance" — top view of a toolhead tracing a square while a
   normalized first-order teaching model lags the motion command; a qualitative
   compensation slider shifts the drive signal earlier. It demonstrates under-
   and over-compensation without claiming a transferable K value. */
(function () {
  "use strict";

  /* ---------------- pressure-advance sim ---------------- */

  A1.registerSim({
    id: "pressure-advance",
    title: "Trace a corner: tune normalized compensation",
    mount(api) {
      const cv = api.canvas(16 / 9);

      /* ---- model constants ---- */
      const MODEL_SIDE_MM = 200;
      const PERIMETER_MM = MODEL_SIDE_MM * 4;
      const TAU_S = 0.18;       // invented normalized-response lag, seconds
      const NB = 480;           // normalized bead bins around the perimeter
      const NOMINAL_WIDTH = 1;  // model-space width ratio, never display pixels
      const HN = 260;           // strip-chart samples

      /* ---- state ---- */
      let compensation = 0;
      let speedMM = 180;
      let sidePx = 200, cxq = 0, cyq = 0;
      let sMM = 0, response = 0.3, Fprev = 0.3, travelledMM = 0;
      let visualSMM = 0;
      const bins = new Float32Array(NB); bins.fill(NOMINAL_WIDTH);
      const histF = new Float32Array(HN);
      const histD = new Float32Array(HN);
      const histR = new Float32Array(HN);
      let hi = 0;

      function layout() {
        sidePx = Math.min(cv.W * 0.40, cv.H * 0.60);
        cxq = cv.W * 0.27;
        cyq = cv.H * 0.47;
      }
      layout();

      function posAt(svMM) {
        const u = ((svMM % PERIMETER_MM) + PERIMETER_MM) % PERIMETER_MM;
        const e = Math.floor(u / MODEL_SIDE_MM);
        const f = ((u - e * MODEL_SIDE_MM) / MODEL_SIDE_MM) * sidePx;
        const h = sidePx / 2;
        if (e === 0) return { x: cxq - h + f, y: cyq - h };
        if (e === 1) return { x: cxq + h, y: cyq - h + f };
        if (e === 2) return { x: cxq + h - f, y: cyq + h };
        return { x: cxq - h, y: cyq + h - f };
      }

      function velocityAt(svMM) {
        const u = ((svMM % PERIMETER_MM) + PERIMETER_MM) % PERIMETER_MM;
        const f = u % MODEL_SIDE_MM;
        const d = Math.min(f, MODEL_SIDE_MM - f); // physical mm to nearest corner
        const g = Math.min(1, d / (MODEL_SIDE_MM * 0.22));
        return speedMM * (0.14 + 0.86 * g);
      }

      function step(dt) {
        if (dt <= 0) return;
        const v = velocityAt(sMM);                // physical model velocity, mm/s
        const moved = v * dt;
        sMM = (sMM + moved) % PERIMETER_MM;
        travelledMM += moved;
        const F = v / speedMM;                    // normalized requested flow, 0..1
        const dF = (F - Fprev) / dt;
        Fprev = F;
        const Ka = compensation * TAU_S;          // normalized teaching control
        const D = Math.max(0, Math.min(2.5, F + Ka * dF));
        const blend = 1 - Math.exp(-dt / TAU_S);
        response += (D - response) * blend;        // normalized response, not pressure units
        const widthRatio = Math.max(0.3, Math.min(2.2, response / Math.max(F, 0.14)));
        const b0 = Math.floor((sMM / PERIMETER_MM) * NB);
        const cover = Math.max(1, Math.ceil((moved / PERIMETER_MM) * NB) + 1);
        for (let k = 0; k <= cover; k++) bins[(b0 - k + NB) % NB] = widthRatio;
        histF[hi % HN] = F;
        histD[hi % HN] = Math.min(1.6, D);
        histR[hi % HN] = Math.min(1.6, response);
        hi++;
      }

      function resetModel() {
        sMM = 0;
        travelledMM = 0;
        const initial = velocityAt(0) / speedMM;
        response = initial;
        Fprev = initial;
        bins.fill(NOMINAL_WIDTH);
        histF.fill(initial);
        histD.fill(initial);
        histR.fill(initial);
        hi = 0;
      }

      /* Deterministically traverse at least two complete physical perimeters so
         every bin and chart sample belongs to the current controls. */
      function convergeAllBins() {
        resetModel();
        let guard = 0;
        while (travelledMM < PERIMETER_MM * 2 && guard < 20000) {
          step(1 / 120);
          guard++;
        }
      }

      const ro = api.readout({ label: "measured model output" });

      function resetForControls() {
        convergeAllBins();
        visualSMM = 0;
        updateAccessibleSummary();
        draw();
      }

      const slComp = api.slider({
        label: "Illustrative compensation", min: 0, max: 1.8, step: 0.05, value: 0,
        format: (v) => Math.round(v * 100) + "%",
        onInput: (v) => { compensation = v; resetForControls(); },
      });
      compensation = slComp.value;
      const slV = api.slider({
        label: "Print speed", min: 50, max: 300, step: 10, value: 180, unit: "mm/s",
        onInput: (v) => { speedMM = v; resetForControls(); },
      });
      speedMM = slV.value;

      function measuredSummary() {
        let mx = 0, mn = 1e9;
        for (let i = 0; i < NB; i++) { if (bins[i] > mx) mx = bins[i]; if (bins[i] < mn) mn = bins[i]; }
        const spread = mx - mn;
        return "normalized width: min " + mn.toFixed(2) +
          " · max " + mx.toFixed(2) +
          " · variation " + spread.toFixed(2);
      }

      function updateAccessibleSummary() {
        cv.setAria(
          "Normalized first-order extrusion-response model on a 200 millimeter square path. " +
          "Print speed is " + speedMM + " millimeters per second and illustrative compensation is " +
          Math.round(compensation * 100) + " percent. Geometry and dynamics use model millimeters " +
          "and seconds, so resizing the canvas changes only drawing coordinates. Measured model output: " +
          measuredSummary() +
          ". This is not a transferable K-value or pressure measurement."
        );
      }

      function draw() {
        const p = api.pal();
        const ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);
        ctx.font = "12px system-ui, sans-serif";
        ctx.textBaseline = "middle";

        /* guide path */
        const h = sidePx / 2;
        ctx.strokeStyle = p.border; ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.strokeRect(cxq - h, cyq - h, sidePx, sidePx);
        ctx.setLineDash([]);

        /* deposited bead — one dot per bin, colored by defect */
        const nominalPx = Math.max(3, Math.min(6, sidePx * 0.025));
        for (let i = 0; i < NB; i++) {
          const ratio = bins[i];
          const pt = posAt(((i + 0.5) / NB) * PERIMETER_MM);
          ctx.fillStyle = ratio > 1.2 ? p.warn : (ratio < 0.8 ? p.danger : p.accent);
          ctx.globalAlpha = ratio < 0.8 ? 0.55 : 0.85;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, nominalPx * ratio, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        /* Decorative toolhead cursor. Its animation is intentionally separate
           from the fixed-step evidence model behind the bead and readout. */
        const hp = posAt(visualSMM);
        ctx.save();
        ctx.shadowColor = p.accent; ctx.shadowBlur = 10;
        ctx.fillStyle = p.text;
        ctx.beginPath(); ctx.arc(hp.x, hp.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = p.bg; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hp.x, hp.y, 6, 0, Math.PI * 2); ctx.stroke();

        /* square labels */
        ctx.fillStyle = p.muted; ctx.textAlign = "center";
        ctx.fillText("top view — one square perimeter", cxq, cyq + h + 24);
        ctx.fillStyle = p.soft;
        ctx.fillText("corner", cxq + h + 4, cyq - h - 12);
        ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cxq + h + 4, cyq - h - 6); ctx.lineTo(cxq + h, cyq - h - 1);
        ctx.stroke();

        /* ---- inset strip chart ---- */
        const gx = W * 0.56, gw = W - 16 - gx;
        const gy = H * 0.12, gh = H * 0.52;
        ctx.fillStyle = p.panel;
        ctx.strokeStyle = p.border;
        ctx.fillRect(gx, gy, gw, gh); ctx.strokeRect(gx, gy, gw, gh);
        const yOf = (v) => gy + gh - 6 - (v / 1.7) * (gh - 12);

        /* nominal-flow guide line at 1.0 */
        ctx.strokeStyle = p.border; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(gx + 2, yOf(1)); ctx.lineTo(gx + gw - 2, yOf(1)); ctx.stroke();
        ctx.setLineDash([]);

        function trace(arr, color, dash) {
          ctx.strokeStyle = color; ctx.lineWidth = 1.6;
          if (dash) ctx.setLineDash(dash);
          ctx.beginPath();
          for (let j = 0; j < HN; j++) {
            const idx = ((hi - HN + j) % HN + HN) % HN;
            const x = gx + 3 + (j / (HN - 1)) * (gw - 6);
            const y = yOf(arr[idx]);
            if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
        trace(histF, p.muted, [5, 3]);
        trace(histD, p.soft, [2, 3]);
        trace(histR, p.accent, null);

        /* legend */
        ctx.textAlign = "left";
        let ly = gy + gh + 16;
        const leg = [
          ["normalized requested flow", p.muted],
          ["normalized feed-forward drive", p.soft],
          ["normalized extrusion response", p.accent],
        ];
        for (let i = 0; i < leg.length; i++) {
          ctx.strokeStyle = leg[i][1]; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(gx, ly); ctx.lineTo(gx + 16, ly); ctx.stroke();
          ctx.fillStyle = leg[i][1];
          ctx.fillText(leg[i][0], gx + 22, ly);
          ly += 16;
        }
        ctx.fillStyle = p.soft; ctx.textAlign = "right";
        ctx.fillText("each dip = the head slowing for a corner", gx + gw, gy - 8);
        ctx.textAlign = "left";

        ro.setText(measuredSummary());
      }

      cv.onResize(() => { layout(); draw(); });
      convergeAllBins();
      updateAccessibleSummary();
      draw();
      api.raf(function (t, dt) {
        /* Frame timing may move this cursor by different sub-pixel amounts, but
           must never mutate bins, chart history, readout or canvas description. */
        visualSMM = (visualSMM + velocityAt(visualSMM) * Math.min(dt, 0.05)) % PERIMETER_MM;
        draw();
      });
    },
  });

  /* ---------------- chapter ---------------- */

  A1.registerChapter({
    n: 6,
    tier: "Intermediate",
    title: "Flow & pressure advance",
    claims: ["FW-004", "FW-007", "QNT-004"],
    html:
      '<div class="note"><strong>Objective.</strong> Explain why extrusion lags changing motion, ' +
      "distinguish calibration-time measurement from print-time feed-forward compensation, and avoid " +
      "copying a K value across printers, calibration modes or filament assignments. Distinguish " +
      "the send-print check's temporary result from reusable results created in the separate " +
      "Calibration workflow.</div>" +
      "<h3>Molten plastic is a spring</h3>" +
      "<p>So far this guide has treated extrusion as instant: gear turns, plastic comes out. " +
      "It isn't. Between the drive gear and the nozzle tip sits a column of molten plastic, " +
      "and molten plastic behaves like a spring: when the extruder pushes, it first compresses " +
      "and pressurizes the melt, and only that pressure forces plastic out of the tiny orifice. " +
      "Extrusion depends on the melt's pressure response, which takes time to build and bleed off, " +
      "so output tends to lag rapid changes in the requested flow.</p>" +
      "<p>At steady speed the transient effect is less visible because pressure can settle. The lag " +
      "matters most when speed changes, and prints contain many such changes — " +
      "every corner, every start and stop of a line, every infill zig-zag.</p>" +
      "<h3>The corner problem</h3>" +
      "<p>Watch an uncorrected square corner. The toolhead decelerates into it, and the extruder " +
      "gear slows in lockstep with the motion — but the pressurized melt doesn't care. It keeps " +
      "pushing plastic out at the old rate, so extra material piles up exactly where the head is " +
      "slowest: the corner bulges outward. Then the head accelerates away, the gear speeds back up, " +
      "but the pressure has bled down and can't rebuild instantly — the line restarting out of the " +
      "corner can come out thin and gappy. Without suitable compensation, that pattern can repeat " +
      "at corners throughout the part.</p>" +
      "<h3>Pressure advance: send the command early</h3>" +
      "<p>The fix is feed-forward, captured in a single number called the <code>K value</code>: " +
      "the motion planner adjusts the extruder command in proportion to how quickly requested flow " +
      "is changing. It pushes ahead of rising demand and eases before falling demand. Too little " +
      "compensation leaves bulges and thin exits; too much can pinch entries. K scales that correction, " +
      "but its numeric meaning depends on printer, firmware and calibration method.</p>" +
      '<div class="note"><strong>Simulation assumptions.</strong> This is a normalized, first-order ' +
      "teaching model on a 200&nbsp;mm-per-side square. Path position and dynamics are calculated in " +
      "model millimetres and seconds; canvas pixels are used only for drawing, so resizing cannot " +
      "change the result. Its 0.18&nbsp;s response lag and 100% balancing point are invented by " +
      "construction. The chart reports normalized requested flow, feed-forward drive and extrusion " +
      "response—not pressure or flow in physical units. Every control change resets and traverses two " +
      "complete perimeters so all bead bins reflect the new setting, including with reduced motion. " +
      "It is not K, does not reproduce Bambu firmware, and must not be copied into a printer.</div>" +
      '<div class="note"><strong>Predict → observe → interpret.</strong> Predict the corner pattern at ' +
      "0%, 100% and 180% illustrative compensation. Observe the normalized response and bead, then " +
      "explain why the middle result validates only this invented model—not a printer K value.</div>" +
      '<div data-sim="pressure-advance"></div>' +
      "<h3>One measurement name, two result lifetimes</h3>" +
      "<p>Bambu calls the process <strong>Flow Dynamics Calibration</strong>. During the A1's automatic " +
      "measurement, the toolhead's eddy-current extrusion-force sensor measures the response while " +
      "filament is extruded under changing conditions, and the printer derives a K result. In the " +
      "<strong>send-print dialog</strong>, enabling automatic Flow Dynamics Calibration creates a " +
      "temporary K for that print; it is not saved as a reusable calibration result. The separate " +
      "<strong>Calibration workflow</strong> is where automatic or manual results can be saved and " +
      "assigned for later use. See Bambu's " +
      '<a href="https://wiki.bambulab.com/en/software/bambu-studio/calibration_pa" target="_blank" rel="noopener">current Flow Dynamics Calibration guide</a>.</p>' +
      "<p>Reusable automatic results from the separate Calibration workflow can be saved on the printer " +
      "and assigned to an AMS or external-spool slot; follow the current interface for manual-result " +
      "saving and assignment. During an ordinary print, compensation follows requested flow using the " +
      "temporary send-print result or the currently assigned reusable result. The official workflow " +
      "does not describe a continuous nozzle-pressure feedback loop inspecting every deposited line. " +
      "RFID can identify supported Bambu filament, but the calibration value is not stored physically " +
      "on the spool and does not automatically travel with that spool to every printer. Confirm the " +
      "active slot or profile after changing material, nozzle, printer or calibration mode.</p>" +
      '<div class="warn"><strong>No universal K range.</strong> Bambu documents roughly 10% run-to-run ' +
      "variation as normal and warns that automatic and manual calibration values are not directly " +
      "equivalent. Use a result produced for the current printer/filament setup and assigned through " +
      "the current Studio or printer workflow; do not grade it against a forum range.</div>" +
      '<div class="note"><strong>Calibration triggers and result lifetimes are separate.</strong> ' +
      "Bed leveling, vibration compensation and Flow Dynamics Calibration are distinct actions. The " +
      "send-print Flow Dynamics option measures a temporary K for that job; the dedicated Calibration " +
      "workflow can create a saved, assignable result. Which actions run depends on current firmware, " +
      "printer state and UI selections. Verify the current interface instead of assuming that “full " +
      "auto calibration” means every system measures and saves again for every job.</div>" +
      "<p>One honest ceiling to remember: pressure advance shapes flow, it doesn't create more of " +
      "it. Bambu's approximately 28&nbsp;mm³/s A1 hotend figure comes from one ABS-at-280&nbsp;°C " +
      "single-wall test, not a universal filament limit. The selected filament profile's maximum " +
      "volumetric speed—or a controlled calibration—is the relevant cap for a real job. Demand more " +
      "than that setup can melt and no K value will rescue the print. See the " +
      '<a href="https://bambulab.com/en/a1/tech-specs" target="_blank" rel="noopener">official A1 test conditions</a> and Bambu\'s ' +
      '<a href="https://wiki.bambulab.com/en/knowledge-sharing/volumetric-speed" target="_blank" rel="noopener">volumetric-speed guide</a>.</p>' +
      '<div class="facts">' +
      '<div class="fact"><div class="v">calibration-time</div><div class="k">extrusion-force measurement</div></div>' +
      '<div class="fact"><div class="v">one print</div><div class="k">send-dialog result lifetime</div></div>' +
      '<div class="fact"><div class="v">saved / assigned</div><div class="k">separate Calibration workflow</div></div>' +
      '<div class="fact"><div class="v">~10%</div><div class="k">documented normal repeat variation</div></div>' +
      '<div class="fact"><div class="v">not equivalent</div><div class="k">automatic vs manual values</div></div>' +
      "</div>" +
      '<div class="note"><strong>Transfer check.</strong> First you enable Flow Dynamics in the ' +
      "send-print dialog; later you run the separate Calibration workflow and save its result. Which K " +
      "expires with the print, which can be assigned again, and why does an RFID tag prove neither " +
      "assignment?</div>" +
      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://wiki.bambulab.com/en/software/bambu-studio/calibration_pa" target="_blank" rel="noopener">Bambu wiki: Flow Dynamics Calibration</a>' +
      '<a href="https://wiki.bambulab.com/en/knowledge-sharing/flowrate-calibration-by-microlidar" target="_blank" rel="noopener">How the X1 does it with lidar</a>' +
      '<a href="https://wiki.bambulab.com/en/knowledge-sharing/volumetric-speed" target="_blank" rel="noopener">Bambu wiki: volumetric speed</a>' +
      "</div>",
  });
})();
