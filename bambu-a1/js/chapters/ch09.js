/* ch09 — A full print: unbox-to-part narrative stitched from every prior chapter.
   Sims: "print-timeline" (schematic concept tour), "flex-plate"
   (Bambu Textured PEI Plate ≤35 °C removal-guidance teaching example). */
(function () {
  "use strict";

  /* ---------------- print-timeline sim ---------------- */

  A1.registerSim({
    id: "print-timeline",
    title: "Print-stage schematic — order varies",
    mount(api) {
      var cv = api.canvas(16 / 9);
      var skipCal = false;
      var completeLevel = false;
      var si = 0;        // stage index
      var sp = 0;        // progress within stage 0..1
      var holdT = 0;     // pause at the very end before looping
      var lastT = 0;
      var lastAria = -1;

      function buildStages() {
        var s = [
          { id: "wipe", label: "wipe", dur: 2.4,
            cap: "Nozzle wipes before contact probing; the exact start sequence comes from the selected profile and options." },
          { id: "probe", label: "level bed", dur: 3.6,
            cap: completeLevel
              ? "Complete pre-print leveling uses 7×7 physical locations on A1; this grid depicts all 49."
              : "Current software may probe only around the sliced model; this localized path is schematic and has no fixed 49-location count." },
        ];
        if (!skipCal) {
          s.push({ id: "flow", label: "flow cal", dur: 3.0,
            cap: "If selected before sending, automatic Flow Dynamics measures extrusion-force response and applies a temporary K to this print task; it does not save that K to a filament profile." });
        }
        s.push(
          { id: "purge", label: "prime", dur: 2.0,
            cap: "Profile start G-code may purge and prime before the model; exact lines and locations vary." },
          { id: "first", label: "first layer", dur: 3.6,
            cap: "Observe the first layer: continuous, attached lines with no nozzle dragging or loose strands." },
          { id: "layers", label: "layers", dur: 4.2,
            cap: "The part grows layer by layer. This animation compresses an unknown job duration and is not to scale." },
          { id: "cool", label: "cooldown", dur: 3.0,
            cap: "For the Bambu Textured PEI Plate, current guidance recommends removal at 35 °C or lower; other surfaces follow their exact current instructions." },
          { id: "flex", label: "remove", dur: 2.6,
            cap: "Bambu Textured PEI Plate teaching example: at 35 °C or lower, lift and gently flex; if it resists, stop, cool further, and do not force it." }
        );
        return s;
      }
      var stages = buildStages();

      api.button({ label: "⟲ Restart", onClick: function () {
        si = 0; sp = 0; holdT = 0;
        frame(lastT, 0);
      }});
      api.toggle({ label: "Omit optional flow-cal concept", value: false, onChange: function (v) {
        skipCal = v;
        stages = buildStages();
        si = 0; sp = 0; holdT = 0; lastAria = -1;
        frame(lastT, 0);
      }});
      api.toggle({ label: "Show complete 7×7 leveling", value: false, onChange: function (v) {
        completeLevel = v;
        stages = buildStages();
        si = 0; sp = 0; holdT = 0; lastAria = -1;
        frame(lastT, 0);
      }});
      var ro = api.readout({ label: "" });

      function wrapText(ctx, text, cx2, y, maxW, lh) {
        var words = text.split(" ");
        var line = "", lines = [];
        for (var i = 0; i < words.length; i++) {
          var test = line ? line + " " + words[i] : words[i];
          if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = words[i]; }
          else line = test;
        }
        if (line) lines.push(line);
        for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], cx2, y + j * lh);
        return lines.length;
      }

      function drawHead(ctx, p, x, tipY) {
        ctx.fillStyle = p.panel2; ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1;
        ctx.fillRect(x - 15, tipY - 32, 30, 17);
        ctx.strokeRect(x - 15, tipY - 32, 30, 17);
        ctx.fillStyle = p.border;
        ctx.fillRect(x - 7, tipY - 15, 14, 7);
        ctx.fillStyle = p.soft;
        ctx.beginPath();
        ctx.moveTo(x - 5, tipY - 8); ctx.lineTo(x + 5, tipY - 8); ctx.lineTo(x, tipY);
        ctx.closePath(); ctx.fill();
      }

      function update(dt) {
        if (si >= stages.length) {
          holdT += dt;
          if (holdT > 1.6) { si = 0; sp = 0; holdT = 0; }
          return;
        }
        sp += dt / stages[si].dur;
        while (sp >= 1) {
          sp -= 1; si += 1;
          if (si >= stages.length) { sp = 0; holdT = 0; break; }
        }
      }

      function draw(t) {
        var p = api.pal();
        var ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);

        var stIdx = Math.min(si, stages.length - 1);
        var st = stages[stIdx];
        var prog = si >= stages.length ? 1 : sp;

        // scene geometry
        var bedTop = H * 0.56;
        var bx = W * 0.28, bw = W * 0.42;
        var px0 = bx + bw * 0.25, pw = bw * 0.5;   // part footprint
        var brushX = bx + bw + 26;

        // heated-bed plate + base
        ctx.fillStyle = p.panel;
        ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1;
        ctx.fillRect(bx - 14, bedTop, bw + 28, 10);
        ctx.strokeRect(bx - 14, bedTop, bw + 28, 10);
        ctx.save(); ctx.globalAlpha = 0.4; ctx.fillStyle = p.accent;
        ctx.fillRect(bx - 14, bedTop, bw + 28, 2); ctx.restore();
        ctx.fillStyle = p.panel2;
        ctx.fillRect(bx - 30, bedTop + 10, bw + 60, 8);
        ctx.strokeRect(bx - 30, bedTop + 10, bw + 60, 8);

        // silicone brush / purge wiper at the side
        ctx.fillStyle = p.border;
        ctx.fillRect(brushX - 10, bedTop - 6, 20, 6);
        ctx.strokeStyle = p.muted; ctx.lineWidth = 1;
        for (var b = -8; b <= 8; b += 4) {
          ctx.beginPath(); ctx.moveTo(brushX + b, bedTop - 6); ctx.lineTo(brushX + b, bedTop - 1); ctx.stroke();
        }
        ctx.fillStyle = p.muted;
        ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("wiper", brushX, bedTop + 24);

        var headX = bx + bw / 2, tipY = bedTop - 26;
        var partLayers = 0;         // 0..16 for the growing part
        var LH = Math.max(4, H * 0.014);
        var stId = st.id;

        if (stId === "wipe") {
          headX = brushX + Math.sin(prog * Math.PI * 6) * 11;
          tipY = bedTop - 5;
          ctx.save(); ctx.strokeStyle = p.soft; ctx.globalAlpha = 0.5;
          ctx.beginPath(); ctx.arc(brushX, bedTop - 9, 14, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
          ctx.restore();
        } else if (stId === "probe") {
          if (completeLevel) {
            var completed = prog <= 0 ? 0 : Math.min(49, Math.ceil(prog * 49));
            var point = Math.min(48, Math.max(0, completed - 1));
            var row = Math.floor(point / 7);
            var rawCol = point % 7;
            var col = row % 2 ? 6 - rawCol : rawCol;
            var within = prog * 49 - Math.floor(prog * 49);
            headX = bx + ((col + 0.5) / 7) * bw;
            tipY = bedTop - 13 + Math.sin(Math.min(1, within) * Math.PI) * 13;

            var gridSize = Math.min(70, H * 0.22);
            var gridX = bx - 14, gridY = bedTop - gridSize - 50;
            ctx.strokeStyle = p.border;
            ctx.strokeRect(gridX, gridY, gridSize, gridSize);
            for (var gr = 0; gr < 7; gr++) {
              for (var gc = 0; gc < 7; gc++) {
                var orderCol = gr % 2 ? 6 - gc : gc;
                var order = gr * 7 + orderCol;
                ctx.beginPath();
                ctx.arc(gridX + ((gc + 0.5) / 7) * gridSize, gridY + ((gr + 0.5) / 7) * gridSize, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = order < completed ? p.accent : p.border;
                ctx.fill();
              }
            }
            ctx.fillStyle = p.soft; ctx.textAlign = "left";
            ctx.fillText("complete 7×7: " + completed + " / 49 locations", gridX + gridSize + 10, gridY + 8);
          } else {
            // A localized 3×3 drawing communicates area restriction only. Its
            // point count is deliberately not presented as the firmware's count.
            var partialCompleted = prog <= 0 ? 0 : Math.min(9, Math.ceil(prog * 9));
            var partialPoint = Math.min(8, Math.max(0, partialCompleted - 1));
            var partialRow = Math.floor(partialPoint / 3);
            var partialColRaw = partialPoint % 3;
            var partialCol = partialRow % 2 ? 2 - partialColRaw : partialColRaw;
            var partialWithin = prog * 9 - Math.floor(prog * 9);
            headX = px0 + ((partialCol + 0.5) / 3) * pw;
            tipY = bedTop - 13 + Math.sin(Math.min(1, partialWithin) * Math.PI) * 13;
            ctx.fillStyle = p.accent;
            for (var pd = 0; pd < partialCompleted; pd++) {
              var pRow = Math.floor(pd / 3);
              var pRawCol = pd % 3;
              var pCol = pRow % 2 ? 2 - pRawCol : pRawCol;
              ctx.beginPath();
              ctx.arc(px0 + ((pCol + 0.5) / 3) * pw, bedTop - 2 - pRow * 4, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = p.soft; ctx.textAlign = "left";
            ctx.fillText("partial leveling · localized schematic path", bx - 14, bedTop - 46);
          }
        } else if (stId === "flow") {
          headX = brushX; tipY = bedTop - 26;
          ctx.save(); ctx.strokeStyle = p.accent; ctx.lineWidth = 2;
          ctx.beginPath();
          for (var yy = 0; yy <= 20; yy += 2) {
            var wx = headX + Math.sin(yy * 0.7 + t * 6) * 3;
            if (yy === 0) ctx.moveTo(wx, tipY); else ctx.lineTo(wx, tipY + yy);
          }
          ctx.stroke(); ctx.restore();
          // force-ripple graph converging as K is found
          var gx = bx - 16, gw = bw * 0.42, gy = bedTop - 78;
          ctx.strokeStyle = p.border;
          ctx.strokeRect(gx, gy, gw, 30);
          ctx.save(); ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (var i2 = 0; i2 <= gw * prog; i2 += 2) {
            var amp = 10 * (1 - (i2 / gw) * 0.85);
            var gyv = gy + 15 + Math.sin(i2 * 0.25) * amp;
            if (i2 === 0) ctx.moveTo(gx, gyv); else ctx.lineTo(gx + i2, gyv);
          }
          ctx.stroke(); ctx.restore();
          ctx.fillStyle = p.muted; ctx.textAlign = "left";
          ctx.fillText("extrusion force", gx, gy - 6);
        } else if (stId === "purge") {
          headX = bx + bw * prog; tipY = bedTop - 8;
          ctx.save(); ctx.strokeStyle = p.accent; ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(bx + 2, bedTop - 2); ctx.lineTo(Math.max(bx + 3, headX), bedTop - 2); ctx.stroke();
          ctx.restore();
        } else if (stId === "first") {
          headX = px0 + pw * prog; tipY = bedTop - 6;
          ctx.save();
          ctx.shadowColor = p.accent; ctx.shadowBlur = 7;
          ctx.fillStyle = p.accent;
          ctx.fillRect(px0, bedTop - 5, Math.max(2, pw * prog), 5); // fat squished bead
          ctx.restore();
          ctx.fillStyle = p.muted; ctx.textAlign = "center";
          ctx.fillText("slow + squished", px0 + pw / 2, bedTop - 52);
        } else if (stId === "layers") {
          partLayers = Math.max(1, Math.floor(prog * 16));
          var frac = prog * 16 - Math.floor(prog * 16);
          var dir = Math.floor(prog * 16) % 2 === 0 ? frac : 1 - frac;
          headX = px0 + pw * dir;
          tipY = bedTop - 5 - partLayers * LH;
        } else if (stId === "cool" || stId === "flex") {
          partLayers = 16;
          headX = bx + bw + 60; tipY = bedTop - 60; // parked home
        }

        // the part
        if (stId === "first") partLayers = 0;
        if (partLayers > 0 && stId !== "flex") {
          var shrink = stId === "cool" ? 1 - 0.05 * prog : 1;
          var cxm = px0 + pw / 2;
          ctx.fillStyle = p.accent;
          for (var L = 0; L < partLayers; L++) {
            var lw = pw * (1 - (L / 16) * 0.3) * shrink;
            ctx.save(); ctx.globalAlpha = L % 2 === 0 ? 0.55 : 0.68;
            ctx.fillRect(cxm - lw / 2, bedTop - (L + 1) * LH - 1, lw, LH + 0.5);
            ctx.restore();
          }
          ctx.fillRect(px0 + (pw - pw * shrink) / 2, bedTop - 5, pw * shrink, 5);
        }

        if (stId === "cool") {
          // falling temperature gauge
          var temp = Math.round(60 - 25 * prog);
          var tgx = bx - 44, tgy = bedTop - 92, tgh = 80;
          ctx.strokeStyle = p.border; ctx.strokeRect(tgx, tgy, 10, tgh);
          var fillH = tgh * ((temp - 25) / 75);
          ctx.fillStyle = temp <= 35 ? p.accent : p.warn;
          ctx.fillRect(tgx + 1, tgy + tgh - fillH, 8, fillH);
          var my = tgy + tgh - tgh * ((35 - 25) / 75);
          ctx.strokeStyle = p.soft;
          ctx.beginPath(); ctx.moveTo(tgx - 4, my); ctx.lineTo(tgx + 14, my); ctx.stroke();
          ctx.fillStyle = p.soft; ctx.textAlign = "left";
          ctx.fillText(temp + " °C", tgx + 18, tgy + 8);
          ctx.fillStyle = p.muted;
          ctx.fillText("Bambu Textured PEI Plate: ≤35 °C", tgx + 18, my);
          // fading heat shimmer
          ctx.save(); ctx.strokeStyle = p.warn; ctx.globalAlpha = 0.35 * (1 - prog);
          for (var hsx = bx + 24; hsx < bx + bw; hsx += 46) {
            ctx.beginPath();
            for (var hy = 0; hy <= 22; hy += 2) {
              var wob = Math.sin(hy * 0.5 + t * 4 + hsx) * 3;
              if (hy === 0) ctx.moveTo(hsx + wob, bedTop - 8); else ctx.lineTo(hsx + wob, bedTop - 8 - hy);
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        if (stId === "flex") {
          // plate lifted and bent; part pops off past mid-stage
          var lift = Math.min(1, prog / 0.3);
          var bend = Math.sin(Math.min(1, prog / 0.7) * Math.PI) * 16;
          var py = bedTop - 30 * lift;
          ctx.strokeStyle = p.soft; ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(bx, py - bend * 0.9);
          ctx.quadraticCurveTo(bx + bw / 2, py + bend, bx + bw, py - bend * 0.9);
          ctx.stroke(); ctx.lineWidth = 1;
          var pcx = px0 + pw / 2, pcy = py - 4;
          if (prog > 0.5) {
            var q = (prog - 0.5) / 0.5;
            pcx += q * pw * 0.9;
            pcy -= Math.sin(q * Math.PI) * 46 - q * 22;
          }
          ctx.save();
          ctx.translate(pcx, pcy);
          if (prog > 0.5) ctx.rotate((prog - 0.5) * 1.2);
          ctx.fillStyle = p.accent; ctx.globalAlpha = 0.85;
          ctx.fillRect(-pw * 0.45, -16 * LH * 0.55, pw * 0.9, 16 * LH * 0.55);
          ctx.restore();
          if (prog > 0.92) {
            ctx.fillStyle = p.accentText; ctx.textAlign = "center";
            ctx.font = "13px system-ui, sans-serif";
            ctx.fillText("✓ Bambu Textured PEI Plate example: release", bx + bw / 2, py - 66);
            ctx.font = "11px system-ui, sans-serif";
          }
        }

        if (stId !== "cool" && stId !== "flex") drawHead(ctx, p, headX, tipY);
        else if (stId === "cool") drawHead(ctx, p, headX, tipY);

        // caption
        ctx.fillStyle = p.soft; ctx.textAlign = "center";
        ctx.font = "12px system-ui, sans-serif";
        wrapText(ctx, st.cap, W / 2, H - 58, W * 0.86, 15);

        // timeline bar
        var ty = H - 26, th = 12, tx0 = W * 0.05, tw = W * 0.9;
        var weights = [], wsum = 0;
        for (var w1 = 0; w1 < stages.length; w1++) { weights.push(1); wsum += 1; }
        var x = tx0;
        ctx.font = "12px system-ui, sans-serif";
        for (var s2 = 0; s2 < stages.length; s2++) {
          var segW = (weights[s2] / wsum) * tw;
          ctx.fillStyle = p.panel2;
          ctx.fillRect(x, ty, segW - 2, th);
          if (s2 < si || si >= stages.length) {
            ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = p.accent;
            ctx.fillRect(x, ty, segW - 2, th); ctx.restore();
          } else if (s2 === si) {
            ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = p.accent;
            ctx.fillRect(x, ty, (segW - 2) * sp, th); ctx.restore();
            ctx.strokeStyle = p.accent;
            ctx.strokeRect(x - 0.5, ty - 0.5, segW - 1, th + 1);
          }
          ctx.strokeStyle = p.border;
          ctx.strokeRect(x, ty, segW - 2, th);
          if (segW > 54) {
            ctx.fillStyle = s2 === stIdx ? p.text : p.muted;
            ctx.textAlign = "center";
            ctx.fillText(stages[s2].label, x + segW / 2 - 1, ty + th + 11);
          }
          x += segW;
        }

        // readout + aria
        var extra = skipCal
          ? " · optional flow calibration omitted"
          : " · optional flow calibration shown";
        ro.setText("concept " + Math.min(stIdx + 1, stages.length) + "/" + stages.length + ": " +
          st.label + " · pedagogical tour, not execution order or timing" + extra);
        if (lastAria !== stIdx) {
          lastAria = stIdx;
          cv.setAria("A1 print-stage schematic, concept " + (stIdx + 1) + " of " + stages.length +
            ". This is not an execution-order trace. " + st.cap);
        }
      }

      function frame(t, dt) { lastT = t; update(dt); draw(t); }
      cv.onResize(function () { frame(lastT, 0); });
      api.raf(frame);
    },
  });

  /* ---------------- flex-plate sim ---------------- */

  A1.registerSim({
    id: "flex-plate",
    title: "Bambu Textured PEI Plate removal at 35 °C or lower",
    mount(api) {
      var cv = api.canvas(16 / 9);
      var temp = 80;
      var anim = null;     // { t, aboveGuidance } while demonstrating removal
      var settled = null;  // "popped" | "stuck"
      var lastT = 0;
      var DUR = 3.0;

      var ro = api.readout({ label: "" });
      function scopeText() {
        return "For the Bambu Textured PEI Plate, current guidance recommends removal at 35 °C or lower. " +
          "Other plates, coatings, adhesives, and materials must follow their exact current instructions. " +
          "If the part resists, stop, cool further, and do not force it.";
      }
      function ruleText() {
        if (settled === "popped") {
          return "Teaching example at " + temp + " °C: the part releases with a gentle flex. " +
            "This binary illustration does not predict real adhesion. " + scopeText();
        }
        if (settled === "stuck") {
          return "Teaching example at " + temp + " °C: removal waits because the Bambu Textured PEI Plate " +
            "has not reached its recommended removal condition. This binary illustration does not predict real adhesion. " + scopeText();
        }
        return temp <= 35
          ? "Bambu Textured PEI Plate at " + temp + " °C — within its recommended removal condition. " + scopeText()
          : "Bambu Textured PEI Plate at " + temp + " °C — not yet within its recommended removal condition. " + scopeText();
      }

      api.slider({
        label: "Bambu Textured PEI Plate temperature", min: 25, max: 100, step: 1, value: 80, unit: "°C",
        onInput: function (v) { temp = v; anim = null; settled = null; ro.setText(ruleText()); },
      });
      api.button({ label: "Try the teaching example", onClick: function () {
        anim = { t: 0, aboveGuidance: temp > 35 };
        settled = null;
      }});
      ro.setText(ruleText());

      function draw(t) {
        var p = api.pal();
        var ctx = cv.ctx, W = cv.W, H = cv.H;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H);

        var baseY = H * 0.72;
        var bx = W * 0.3, bw = W * 0.42;
        var pw = bw * 0.34, ph = H * 0.2;
        var cxm = bx + bw / 2;

        // magnetic heatbed base
        ctx.fillStyle = p.panel; ctx.strokeStyle = p.borderStrong; ctx.lineWidth = 1;
        ctx.fillRect(bx - 20, baseY, bw + 40, 14);
        ctx.strokeRect(bx - 20, baseY, bw + 40, 14);
        ctx.fillStyle = p.muted;
        ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("heatbed (magnetic)", cxm, baseY + 30);

        // Thermometer marks the current Bambu Textured PEI removal guidance;
        // it does not predict adhesion or how any other build surface releases.
        var tgx = W * 0.1, tgy = H * 0.16, tgh = H * 0.52;
        ctx.strokeStyle = p.border; ctx.strokeRect(tgx, tgy, 12, tgh);
        var frac = (temp - 25) / 75;
        var col = temp <= 35 ? p.accent : (temp <= 60 ? p.warn : p.danger);
        ctx.fillStyle = col;
        ctx.fillRect(tgx + 1, tgy + tgh * (1 - frac), 10, tgh * frac);
        var my = tgy + tgh * (1 - (35 - 25) / 75);
        ctx.strokeStyle = p.soft;
        ctx.beginPath(); ctx.moveTo(tgx - 5, my); ctx.lineTo(tgx + 17, my); ctx.stroke();
        ctx.fillStyle = p.soft; ctx.textAlign = "left";
        ctx.fillText(temp + " °C", tgx + 20, tgy + tgh * (1 - frac));
        ctx.fillStyle = p.muted;
        ctx.fillText("Bambu Textured PEI Plate: recommended ≤35 °C", tgx + 20, my + 4);

        // heat shimmer while hot and idle
        var hotness = Math.max(0, (temp - 35) / 65);
        if (hotness > 0 && !anim) {
          ctx.save(); ctx.strokeStyle = p.warn; ctx.globalAlpha = 0.3 * hotness;
          for (var hsx = bx + 20; hsx < bx + bw; hsx += 42) {
            ctx.beginPath();
            for (var hy = 0; hy <= 26; hy += 2) {
              var wob = Math.sin(hy * 0.45 + t * 4 + hsx) * 3;
              if (hy === 0) ctx.moveTo(hsx + wob, baseY - 12); else ctx.lineTo(hsx + wob, baseY - 12 - hy);
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        // plate + part
        var lift = 0, bend = 0, done = false, q = 0;
        if (anim) {
          var at = anim.t;
          lift = Math.min(1, at / 0.6);
          if (at > 0.6) bend = Math.sin(Math.min(1, (at - 0.6) / 1.4) * Math.PI) * 18;
          if (at > DUR - 0.6) lift = Math.max(0, 1 - (at - (DUR - 0.6)) / 0.6);
          done = at >= DUR;
          q = anim.aboveGuidance ? 0 : Math.max(0, Math.min(1, (at - 1.3) / 1.0));
        } else if (settled) {
          done = true;
          q = settled === "popped" ? 1 : 0;
        }

        var py = baseY - 4 - lift * 44;
        ctx.strokeStyle = p.soft; ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(bx, py - bend * 0.9);
        ctx.quadraticCurveTo(cxm, py + bend, bx + bw, py - bend * 0.9);
        ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = p.muted; ctx.textAlign = "center";
        if (!anim && !settled) ctx.fillText("Bambu Textured PEI Plate", cxm, py + 18);

        var popped = (anim && !anim.aboveGuidance && q > 0) || settled === "popped";
        var heldForCooling = (anim && anim.aboveGuidance && anim.t > 1.3) || settled === "stuck";

        var pcx = cxm, pcy = py - 4, rot = 0;
        if (popped) {
          pcx = cxm + q * bw * 0.55;
          pcy = py - 4 - Math.sin(Math.min(1, q) * Math.PI) * 52 + q * (baseY - py + 2);
          rot = q * 0.9;
        }
        ctx.save();
        ctx.translate(pcx, pcy);
        ctx.rotate(rot);
        ctx.fillStyle = p.accent;
        ctx.globalAlpha = 0.88;
        ctx.beginPath();
        ctx.moveTo(-pw / 2, 0); ctx.lineTo(pw / 2, 0);
        ctx.lineTo(pw / 2 - pw * 0.1, -ph); ctx.lineTo(-pw / 2 + pw * 0.1, -ph);
        ctx.closePath(); ctx.fill();
        ctx.restore();

        if (done) {
          ctx.font = "13px system-ui, sans-serif"; ctx.textAlign = "center";
          if (popped) {
            ctx.fillStyle = p.accentText;
            ctx.fillText("✓ Bambu Textured PEI Plate example: release", cxm, H * 0.14);
          } else if (heldForCooling) {
            ctx.fillStyle = p.warn;
            ctx.fillText("Bambu Textured PEI Plate example: wait for ≤35 °C", cxm, H * 0.14);
          }
          ctx.font = "11px system-ui, sans-serif";
        }

        cv.setAria("Bambu Textured PEI Plate removal-guidance teaching example. " + ruleText());
      }

      function frame(t, dt) {
        lastT = t;
        if (anim) {
          anim.t += dt;
          if (anim.t >= DUR) {
            settled = anim.aboveGuidance ? "stuck" : "popped";
            anim = null;
            ro.setText(ruleText());
          }
        }
        draw(t);
      }
      cv.onResize(function () { frame(lastT, 0); });
      api.raf(frame);
    },
  });

  /* ---------------- chapter ---------------- */

  A1.registerChapter({
    n: 9,
    tier: "Advanced",
    title: "A full print",
    claims: ["FW-001", "FW-002", "FW-003", "FW-004", "FW-005", "FW-006", "FW-007", "FW-008", "FW-011", "QNT-006", "QNT-008", "SAF-002", "SAF-003", "SAF-004", "SAF-005"],
    html:
      '<div class="note"><strong>Objective.</strong> Complete a first print without skipping setup or safety checks, distinguish optional calibration routines, observe the first layer, and remove the cooled part safely. This is an operating overview; the <a href="https://cdn1.bambulab.com/documentation/quick-start-a75adcb1d5d5e/Quick%20Start%20Guide%20for%20A1.pdf" target="_blank" rel="noopener">current official A1 Quick Start Guide</a> controls assembly and commissioning. Combo owners should also use the AMS lite guide supplied for their exact package.</div>' +
      "<h3>From setup to removal</h3>" +
      "<p>Before power-on, finish every unpacking and assembly step in the guide: remove all shipping restraints, install and align the build plate, secure the spool/AMS lite and cable routing, and place the machine on a stable, level surface. Reserve clearance for the bed's <strong>full front-to-back travel</strong>; it can move suddenly and extends beyond the base.</p>" +
      '<div class="warn"><strong>First-print safety gate.</strong> The nozzle and bed can burn, the bed and toolhead can move without warning, and loose hair, sleeves, fingers, children, and pets do not belong in the motion envelope. Keep the printer on a stable nonflammable surface with material-appropriate ventilation, never reach under a moving/hot toolhead, and do not leave a new setup unattended until you have observed a sound first layer. For a used A1, or any unit whose serial number or heatbed-cable repair history is uncertain, verify recall and repair status before power-on using current regulator and manufacturer instructions. If it may be affected or remains uncertain, keep it off and unplugged and contact Bambu Support or the original reseller; in the U.S., follow the <a href="https://www.cpsc.gov/Recalls/2024/Bambu-Lab-Recalls-A1-3D-Printers-Due-to-Electric-Shock-and-Fire-Hazards" target="_blank" rel="noopener">current CPSC recall remedy</a>. If assembly, wiring, heatbed cable, smoke, sparking, or temperature behavior looks wrong: stop, switch off, unplug, and use Bambu Support.</div>' +
      "<p>Run the printer's on-screen initial calibration. Load filament with the touchscreen's <strong>Load</strong> workflow and the official external-spool or AMS guide; the machine controls heating and feed. Keep hands and tools away from the hot nozzle and wipe any purge only after it is safely separated and cool. Slice a small known model with the matching A1, plate, nozzle, and filament profiles. Keep a working microSD card inserted, because the A1 has no internal job storage even when a job is sent over the network.</p>" +
      "<h3>The opening ritual</h3>" +
      "<p>The start sequence depends on the selected profile, firmware, and send-dialog options. Nozzle wiping prepares contact probing. When bed leveling is selected, current Bambu Studio/firmware may perform <strong>partial leveling around the sliced model</strong>; a complete pre-print A1 pass is 7×7. The separate thorough calibration started from the Calibration page is 21×21. A 7×7 pass is not described by Bambu as measurements interpolated into that separate 21×21 routine. See the <a href=\"https://wiki.bambulab.com/en/a1/troubleshooting/homing-leveling-failure\" target=\"_blank\" rel=\"noopener\">official homing and leveling guide</a>.</p>" +
      "<p>If automatic Flow Dynamics Calibration is selected in the print-send workflow and supported by the installed firmware/profile, the printer measures extrusion-force response and applies the resulting <strong>temporary K value to that print task</strong>; that pre-print result is not saved into a filament profile. Separately, calibration run from the Calibration workflow can produce values that the user saves and assigns to filament slots or profiles. Neither mode is continuous closed-loop correction throughout every model move, and neither should be described as physically stored on an RFID spool.</p>" +
      "<p>The first layer is the make-or-break layer: it goes down slow and deliberately squished, " +
      "pressed into the selected plate so the rest of the print has something to hold onto. Watch for continuous attached lines, no loose curls, no nozzle dragging, and no material building up on the nozzle. Pause or stop if the first layer is not sound; automation is not permission to ignore it.</p>" +
      '<p><strong>Predict before playing:</strong> which concepts are always relevant, which are send-option/profile dependent, and which have a duration that depends on the model? The animation is a pedagogical tour, <strong>not an executable start-G-code order</strong>; firmware, profile, and selected options may omit, repeat, or order preparation operations differently. Equal bar widths and animation seconds are not real timings.</p>' +
      '<div data-sim="print-timeline"></div>' +
      '<div class="facts">' +
      '<div class="fact"><div class="v">partial or 7×7</div><div class="k">pre-print A1 bed leveling</div></div>' +
      '<div class="fact"><div class="v">21×21</div><div class="k">separate thorough calibration</div></div>' +
      '<div class="fact"><div class="v">observe it</div><div class="k">first layer remains a user check</div></div>' +
      '<div class="fact"><div class="v">not to scale</div><div class="k">timeline animation</div></div>' +
      '<div class="fact"><div class="v">≤35 °C</div><div class="k">Bambu Textured PEI Plate recommended removal condition</div></div>' +
      "</div>" +
      "<h3>While it prints</h3>" +
      "<p>Use the built-in camera in Bambu Studio or Bambu Handy for monitoring and timelapse where enabled. Frame rate, remote access, recording, and detection features vary by firmware, account, and region; verify what your installed version actually offers.</p>" +
      '<div class="note"><strong>Limited detection is not supervision.</strong> A1 has no lidar first-layer inspection. Current firmware can offer optional <a href="https://wiki.bambulab.com/en/a1-mini/manual/nozzle-warp-detection" target="_blank" rel="noopener">nozzle-clumping detection</a> based on extrusion-force sensing rather than the camera, but Bambu documents false positives and missed failures. Runout and recovery features also cannot make every failed print recoverable. Check the first layer and monitor high-consequence jobs yourself.</div>' +
      "<h3>The pop</h3>" +
      "<p>When the last layer finishes, the bed heater shuts off and the most under-rated step begins: " +
      "waiting. For the <strong>Bambu Textured PEI Plate</strong>, current guidance recommends waiting until the plate " +
      "reaches 35 °C or lower before lifting the magnetic spring-steel sheet and flexing it gently. Cooling can make " +
      "release easier, but it does not guarantee that a particular part will release. If the part resists, stop, cool " +
      "further, and do not force it. Other plates, coatings, adhesives, and materials must follow their exact current instructions.</p>" +
      '<div class="warn"><strong>Plate-specific example.</strong> For the Bambu Textured PEI Plate, 35 °C or lower is a recommended removal condition; it does not predict adhesion or how another build surface will release. If there is resistance, stop and cool further; do not force the part or plate. Follow the exact current instructions for every other plate, coating, adhesive, and material. Never clean the Bambu Textured PEI Plate with acetone because it can damage the surface.</div>' +
      '<div data-sim="flex-plate"></div>' +
      '<p><strong>Transfer:</strong> before your next print, point to the bed\'s swept area, the touchscreen Stop control, the rear power switch, the live first-layer view, and the correct cooled-part removal path. If you cannot identify all five, revisit the Quick Start Guide before pressing Print.</p>' +
      "<p>That's the whole arc: move, melt, calibrate, slice, print, pop. Run it once end-to-end and the " +
      "pre-print wiggling stops being mysterious — it is the selected profile and options preparing this job, " +
      "the right to say “it just prints.”</p>" +
      '<div class="go-deeper"><div class="gd-title">Go deeper</div>' +
      '<a href="https://wiki.bambulab.com/en/a1/manual/first-print-with-external-spool" target="_blank" rel="noopener">Bambu wiki: your first print (loading filament)</a>' +
      '<a href="https://wiki.bambulab.com/en/a1/manual/intro-a1" target="_blank" rel="noopener">Bambu wiki: A1 introduction</a>' +
      '<a href="https://github.com/bambulab/BambuStudio/blob/master/resources/profiles/BBL/machine/Bambu%20Lab%20A1%200.4%20nozzle%20template%20machine_start_gcode.json" target="_blank" rel="noopener">Bambu Studio: current A1 start G-code template</a>' +
      '<a href="https://wiki.bambulab.com/en/a1/troubleshooting/homing-leveling-failure" target="_blank" rel="noopener">Bambu wiki: current partial, complete and thorough leveling routines</a>' +
      '<a href="https://us.store.bambulab.com/products/bambu-textured-pei-plate" target="_blank" rel="noopener">Bambu Textured PEI Plate care — current ≤35 °C removal guidance</a>' +
      '<a href="https://www.tomshardware.com/3d-printing/bambu-lab-a1-review" target="_blank" rel="noopener">Tom’s Hardware: A1 review</a>' +
      "</div>",
  });
})();
