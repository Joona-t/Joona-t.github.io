/* Anthropic Watch: model archive, frontier, family lines, compare.
   Reads window.ANTHROPIC_MODELS (models.js) and window.ANTHROPIC_BENCH (benchmarks.js).
   All data strings pass through esc() before reaching innerHTML. */
(function () {
  "use strict";

  var M = window.ANTHROPIC_MODELS;
  var B = window.ANTHROPIC_BENCH || { launches: [], caveats: [] };
  if (!M) { return; }

  var models = M.models.slice().sort(function (a, b) { return a.released < b.released ? -1 : a.released > b.released ? 1 : 0; });
  var byId = {};
  models.forEach(function (m, i) { m.order = i; byId[m.id] = m; });

  // Family colours: validated categorical slots (dataviz validator, light surface #fff3f8,
  // all checks pass; contrast WARN is relieved by direct labels + table views).
  var LINES = ["Haiku", "Sonnet", "Opus", "Fable", "Mythos", "Claude", "Instant"];
  var COLOR = { Haiku: "#2a78d6", Sonnet: "#eb6834", Opus: "#1baf7a", Fable: "#eda100", Mythos: "#4a3aa7", Claude: "#008300", Instant: "#008300" };
  var LINE_LABEL = { Claude: "Claude 1–2", Instant: "Instant" };

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var fmtDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  function toDate(s) { return new Date(s + "T00:00:00Z"); }
  function day(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || "") ? fmtDay.format(toDate(s)) : esc(s || ""); }
  var UNK = '<span class="unk" title="Not confirmed on an official Anthropic page">?</span>';
  function money(v) { return v == null ? UNK : "$" + (v < 1 ? v.toFixed(2) : (v % 1 ? v.toFixed(2) : String(v))); }
  function price(m) { return m.inP == null ? UNK : money(m.inP) + " / " + money(m.outP); }
  function tokens(v) {
    if (v == null) { return UNK; }
    if (v >= 1000000) { return (v / 1000000) + "M"; }
    return Math.round(v / 1000) + "K";
  }
  function host(url) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; } }
  function daysBetween(a, b) { return Math.round((toDate(b) - toDate(a)) / 86400000); }
  function pct(v, unit) { return v == null ? "—" : (Math.round(v * 10) / 10) + (unit === "Elo" ? "" : "%"); }
  function sign(v) { return v > 0 ? "+" : v < 0 ? "−" : "±"; }
  function lineChip(line) {
    return '<span class="line-chip" style="--line:' + COLOR[line] + '"><i aria-hidden="true"></i>' + esc(LINE_LABEL[line] || line) + "</span>";
  }
  var STATUS = {
    active: ["Active", "st-active", "●"], legacy: ["Legacy", "st-legacy", "◐"],
    deprecated: ["Deprecated", "st-deprecated", "◔"], retired: ["Retired", "st-retired", "○"]
  };
  function statusBadge(m) {
    var s = STATUS[m.status] || [m.status, "", ""];
    return '<span class="st ' + s[1] + '"><span aria-hidden="true">' + s[2] + "</span> " + s[0] + "</span>";
  }
  function accessBadge(m) {
    if (m.access === "preview") { return '<span class="acc">Research preview</span>'; }
    if (m.access === "limited") { return '<span class="acc">Verified orgs only</span>'; }
    return "";
  }
  function sources(m) {
    return m.src.map(function (u) { return '<a href="' + esc(u) + '" target="_blank" rel="noreferrer">' + esc(host(u)) + "</a>"; }).join(" · ");
  }

  // Score of model `id` on benchmark `b`: prefer its own launch table, else the earliest table reporting it.
  function scoreOf(id, b) {
    var own = null, first = null;
    B.launches.forEach(function (L) {
      L.rows.forEach(function (r) {
        if (r.b === b && r.s[id] != null) {
          var hit = { v: r.s[id], c: r.c, launch: L, unit: r.unit };
          if (L.model === id) { own = hit; }
          if (!first) { first = hit; }
        }
      });
    });
    return own || first;
  }

  // ---------- tooltip ----------
  var tip = document.createElement("div");
  tip.className = "viz-tip";
  tip.setAttribute("role", "status");
  tip.hidden = true;
  document.body.appendChild(tip);
  function showTip(target) {
    var text = target.getAttribute("data-tip");
    if (!text) { return; }
    tip.textContent = text;
    tip.hidden = false;
    var r = target.getBoundingClientRect();
    var x = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2));
    var y = r.top - tip.offsetHeight - 10;
    if (y < 8) { y = r.bottom + 10; }
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  function hideTip() { tip.hidden = true; }
  document.addEventListener("mouseover", function (e) { var t = e.target.closest("[data-tip]"); if (t) { showTip(t); } });
  document.addEventListener("mouseout", function (e) { if (e.target.closest("[data-tip]")) { hideTip(); } });
  document.addEventListener("focusin", function (e) { var t = e.target.closest("[data-tip]"); if (t) { showTip(t); } else { hideTip(); } });
  window.addEventListener("scroll", hideTip, { passive: true });

  // ---------- chart (one y-axis, time x-axis, direct labels) ----------
  var T0 = toDate("2023-01-01").getTime();
  var T1 = toDate("2027-01-01").getTime();
  function timeChart(opts) {
    var W = 720, H = opts.height || 260, padL = 52, padR = 92, padT = 16, padB = 30;
    var iw = W - padL - padR, ih = H - padT - padB;
    var log = !!opts.log;
    var y0 = opts.yMin, y1 = opts.yMax;
    function X(d) { return padL + (toDate(d).getTime() - T0) / (T1 - T0) * iw; }
    function Y(v) {
      var t = log ? (Math.log(v) - Math.log(y0)) / (Math.log(y1) - Math.log(y0)) : (v - y0) / (y1 - y0);
      return padT + ih - t * ih;
    }
    var out = '<svg class="viz" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.label) + '">';
    // grid + y ticks
    opts.yTicks.forEach(function (t) {
      out += '<line class="grid" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/>';
      out += '<text class="tick" x="' + (padL - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + esc(opts.yFmt(t)) + "</text>";
    });
    [2023, 2024, 2025, 2026].forEach(function (yr) {
      var x = X(yr + "-01-01");
      out += '<line class="grid grid-x" x1="' + x + '" x2="' + x + '" y1="' + padT + '" y2="' + (padT + ih) + '"/>';
      out += '<text class="tick" x="' + (x + 4) + '" y="' + (H - 10) + '">' + yr + "</text>";
    });
    out += '<line class="axis" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + (padT + ih) + '" y2="' + (padT + ih) + '"/>';
    var labels = [];
    opts.series.forEach(function (s) {
      var pts = s.points.filter(function (p) { return p.y != null; });
      if (!pts.length) { return; }
      if (pts.length > 1) {
        var d = "";
        pts.forEach(function (p, i) {
          var x = X(p.x), y = Y(p.y);
          if (i === 0) { d += "M" + x + " " + y; }
          else if (s.step) { d += "H" + x + "V" + y; }
          else { d += "L" + x + " " + y; }
        });
        out += '<path class="series-line' + (s.dashed ? " dashed" : "") + '" d="' + d + '" style="stroke:' + s.color + '"/>';
      }
      if (!s.noDots) pts.forEach(function (p) {
        out += '<circle class="pt" tabindex="0" cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="' + (p.big ? 6 : 4.5) + '" style="fill:' + (p.color || s.color) + '" data-tip="' + esc(p.tip) + '"><title>' + esc(p.tip) + "</title></circle>";
      });
      var last = pts[pts.length - 1];
      if (s.label !== false) { labels.push({ y: Y(last.y), x: X(last.x), text: s.name, color: s.color }); }
    });
    // direct labels at the right edge, nudged apart
    labels.sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < labels.length; i++) { if (labels[i].y - labels[i - 1].y < 14) { labels[i].y = labels[i - 1].y + 14; } }
    labels.forEach(function (l) {
      out += '<line class="leader" x1="' + l.x + '" x2="' + (W - padR + 6) + '" y1="' + l.y + '" y2="' + l.y + '" style="stroke:' + l.color + '"/>';
      out += '<text class="dlabel" x="' + (W - padR + 10) + '" y="' + (l.y + 4) + '">' + esc(l.text) + "</text>";
    });
    out += "</svg>";
    return out;
  }
  function legend(lines) {
    return '<ul class="viz-legend" aria-label="Legend">' + lines.map(function (l) {
      return '<li><i style="background:' + COLOR[l] + '" aria-hidden="true"></i>' + esc(LINE_LABEL[l] || l) + "</li>";
    }).join("") + "</ul>";
  }
  function figure(title, chart, caption, extra) {
    return '<figure class="viz-fig window"><figcaption class="viz-title">' + esc(title) + "</figcaption>" + chart + (extra || "") +
      (caption ? '<p class="viz-cap">' + caption + "</p>" : "") + "</figure>";
  }

  // ---------- ARCHIVE ----------
  var archiveState = { line: "all", status: "all", q: "" };
  function renderArchive() {
    var root = document.getElementById("archiveRoot");
    var years = {};
    var active = models.filter(function (m) { return m.status === "active"; }).length;
    var first = models[0], last = models[models.length - 1];
    var linesPresent = LINES.filter(function (l) { return models.some(function (m) { return m.line === l; }); });

    // timeline lanes
    var lanes = ["Fable", "Mythos", "Opus", "Sonnet", "Haiku", "Instant", "Claude"];
    var W = 720, laneH = 30, padL = 92, padR = 16, top = 10, H = top + lanes.length * laneH + 34;
    var iw = W - padL - padR;
    function X(d) { return padL + (toDate(d).getTime() - T0) / (T1 - T0) * iw; }
    var tl = '<svg class="viz timeline" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Timeline of every Claude release from 2023 to 2026, one lane per family">';
    [2023, 2024, 2025, 2026].forEach(function (yr) {
      var x = X(yr + "-01-01");
      tl += '<line class="grid grid-x" x1="' + x + '" x2="' + x + '" y1="' + top + '" y2="' + (H - 24) + '"/><text class="tick" x="' + (x + 4) + '" y="' + (H - 8) + '">' + yr + "</text>";
    });
    lanes.forEach(function (lane, i) {
      var y = top + i * laneH + laneH / 2;
      tl += '<line class="lane" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '"/>';
      tl += '<text class="lane-label" x="' + (padL - 10) + '" y="' + (y + 4) + '" text-anchor="end">' + esc(LINE_LABEL[lane] || lane) + "</text>";
      models.filter(function (m) { return m.line === lane; }).forEach(function (m) {
        var t = m.name + " · " + day(m.released) + (m.inP != null ? " · $" + m.inP + " / $" + m.outP : "");
        tl += '<a href="#model-' + esc(m.id) + '" data-model-jump="' + esc(m.id) + '" aria-label="' + esc(m.name) + '"><circle class="pt' + (m.frontier ? " pt-frontier" : "") + '" cx="' + X(m.released) + '" cy="' + y + '" r="' + (m.frontier ? 7 : 5.5) + '" style="fill:' + COLOR[lane] + '" data-tip="' + esc(t) + '"><title>' + esc(t) + "</title></circle></a>";
      });
    });
    tl += "</svg>";

    var html = "";
    html += '<dl class="facts">' +
      "<div><dt>Models archived</dt><dd>" + models.length + "</dd></div>" +
      "<div><dt>First</dt><dd>" + esc(first.name) + " · " + day(first.released) + "</dd></div>" +
      "<div><dt>Latest</dt><dd>" + esc(last.name) + " · " + day(last.released) + "</dd></div>" +
      "<div><dt>Active today</dt><dd>" + active + "</dd></div></dl>";
    html += figure("Every release on one timeline", tl, "Bigger rings mark frontier releases: the most capable generally available Claude at the time. Click a dot to jump to its card.", legend(linesPresent));

    html += '<div class="arch-controls window" role="group" aria-label="Filter the archive">' +
      '<div class="chip-row" id="archLineChips">' +
      ['all'].concat(linesPresent.filter(function (l) { return l !== "Instant"; })).map(function (l) {
        return '<button type="button" class="chip" data-line="' + l + '" aria-pressed="' + (archiveState.line === l) + '">' + (l === "all" ? "All" : esc(l === "Claude" ? "Claude 1–2 + Instant" : l)) + "</button>";
      }).join("") + "</div>" +
      '<div class="arch-row"><label class="sel">Status <select id="archStatus"><option value="all">Any</option><option value="active">Active</option><option value="legacy">Legacy</option><option value="deprecated">Deprecated</option><option value="retired">Retired</option></select></label>' +
      '<label class="visually-hidden" for="archSearch">Search models</label><input id="archSearch" type="search" placeholder="Search: 4.5, adaptive, 1M…" autocomplete="off"></div>' +
      '<p class="arch-count" id="archCount" aria-live="polite"></p></div>';
    html += '<div id="archList"></div>';
    html += '<details class="table-view"><summary>Table view: all models</summary><div class="table-wrap"><table><thead><tr><th scope="col">Model</th><th scope="col">Released</th><th scope="col">Price in / out</th><th scope="col">Context</th><th scope="col">Max out</th><th scope="col">Thinking</th><th scope="col">Cutoff</th><th scope="col">Status</th></tr></thead><tbody>' +
      models.map(function (m) {
        return '<tr><th scope="row">' + esc(m.name) + "</th><td>" + day(m.released) + "</td><td>" + price(m) + "</td><td>" + tokens(m.ctx) + "</td><td>" + tokens(m.out) + "</td><td>" + (m.thinking ? esc(m.thinking) : UNK) + "</td><td>" + (m.cutoff ? esc(m.cutoff) : UNK) + "</td><td>" + statusBadge(m) + "</td></tr>";
      }).join("") + "</tbody></table></div></details>";
    root.innerHTML = html;

    var list = document.getElementById("archList");
    function draw() {
      var q = archiveState.q.toLowerCase();
      var shown = models.filter(function (m) {
        if (archiveState.line !== "all") {
          if (archiveState.line === "Claude" ? (m.line !== "Claude" && m.line !== "Instant") : m.line !== archiveState.line) { return false; }
        }
        if (archiveState.status !== "all" && m.status !== archiveState.status) { return false; }
        if (q) {
          var hay = [m.name, m.ids.join(" "), m.headline, m.thinking, m.line, m.gen].join(" ").toLowerCase();
          if (q.split(/\s+/).some(function (w) { return hay.indexOf(w) === -1; })) { return false; }
        }
        return true;
      }).reverse();
      document.getElementById("archCount").textContent = shown.length + " of " + models.length + " models";
      var groups = {};
      shown.forEach(function (m) { var y = m.released.slice(0, 4); (groups[y] = groups[y] || []).push(m); });
      list.innerHTML = Object.keys(groups).sort().reverse().map(function (y) {
        return '<h2 class="year-head">' + y + '</h2><ol class="model-cards">' + groups[y].map(card).join("") + "</ol>";
      }).join("") || '<p class="empty">No models match. Try a broader search.</p>';
    }
    function card(m) {
      return '<li class="model-card window" id="model-' + esc(m.id) + '" style="--line:' + COLOR[m.line] + '">' +
        '<div class="mc-head"><h3>' + esc(m.name) + "</h3>" + lineChip(m.line) + statusBadge(m) + accessBadge(m) + (m.frontier ? '<span class="frontier-tag">★ frontier</span>' : "") + "</div>" +
        '<p class="mc-headline">' + esc(m.headline) + "</p>" +
        '<dl class="mc-grid">' +
        "<div><dt>Released</dt><dd>" + day(m.released) + "</dd></div>" +
        "<div><dt>Price in / out</dt><dd>" + price(m) + (m.priceNote ? ' <small>' + esc(m.priceNote) + "</small>" : "") + "</dd></div>" +
        "<div><dt>Context</dt><dd>" + tokens(m.ctx) + "</dd></div>" +
        "<div><dt>Max output</dt><dd>" + tokens(m.out) + "</dd></div>" +
        "<div><dt>Thinking</dt><dd>" + (m.thinking ? esc(m.thinking) : UNK) + "</dd></div>" +
        "<div><dt>Knowledge cutoff</dt><dd>" + (m.cutoff ? esc(m.cutoff) : UNK) + "</dd></div>" +
        "<div><dt>Input → output</dt><dd>" + (m.io ? esc(m.io) : UNK) + "</dd></div>" +
        "<div><dt>Lifecycle</dt><dd>" + (m.deprecated ? "Deprecated " + day(m.deprecated) + "; " : "") + (m.status === "retired" ? "retired " + day(m.retires) : "retires " + day(m.retires)) + "</dd></div>" +
        "</dl>" +
        '<p class="mc-ids">API ' + m.ids.map(function (x) { return "<code>" + esc(x) + "</code>"; }).join(" ") + "</p>" +
        '<p class="mc-src">Sources: ' + sources(m) + "</p></li>";
    }
    root.querySelector("#archLineChips").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-line]");
      if (!b) { return; }
      archiveState.line = b.getAttribute("data-line");
      Array.prototype.forEach.call(this.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      draw();
    });
    root.querySelector("#archStatus").addEventListener("change", function () { archiveState.status = this.value; draw(); });
    var t = 0;
    root.querySelector("#archSearch").addEventListener("input", function () {
      var v = this.value;
      clearTimeout(t);
      t = setTimeout(function () { archiveState.q = v.trim(); draw(); }, 120);
    });
    root.addEventListener("click", function (e) {
      var a = e.target.closest("[data-model-jump]");
      if (!a) { return; }
      e.preventDefault();
      archiveState = { line: "all", status: "all", q: "" };
      root.querySelector("#archSearch").value = "";
      root.querySelector("#archStatus").value = "all";
      Array.prototype.forEach.call(root.querySelectorAll("#archLineChips button"), function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-line") === "all")); });
      draw();
      var node = document.getElementById("model-" + a.getAttribute("data-model-jump"));
      if (node) { node.scrollIntoView({ block: "center" }); node.classList.add("flash"); setTimeout(function () { node.classList.remove("flash"); }, 1600); }
    });
    draw();
  }

  // ---------- FRONTIER ----------
  var TREND_BENCHES = [
    { b: "SWE-bench Verified", note: "Oct 2024 → Jun 2026, then retired. Scaffolds differ: 3.7 used an extra planning tool, Sonnet 4.5 a 200K thinking budget, 2026 runs max effort." },
    { b: "SWE-bench Pro", note: "The harder successor. Opus 4.6's 53.4 comes from later tables; every other point is from the model's own launch." },
    { b: "GPQA Diamond", note: "Claude 3 and 3.5 without thinking; Claude 3.7 onward with extended or adaptive thinking. Saturated near 94% by mid-2026." },
    { b: "Humanity's Last Exam (no tools)", note: "Max effort. Sonnet 4.6 was later re-graded; the own-launch score is shown." },
    { b: "OSWorld-Verified", note: "From Opus 4.8 on, a zoom-tool fix and 128K tokens per turn raised scores. The original 2024 OSWorld and the 2026 OSWorld 2.x are different tests." },
    { b: "ARC-AGI-2", note: "Verified set where stated. 13.6% (Sonnet 4.5) to 90.4% (Opus 5) in ten months." }
  ];
  function trendChart(bench) {
    var pts = [];
    models.forEach(function (m) {
      var s = scoreOf(m.id, bench.b);
      if (s) { pts.push({ m: m, v: s.v, c: s.c, from: s.launch }); }
    });
    if (pts.length < 2) { return ""; }
    // "Best so far" counts only generally available models; gated previews stay as dots.
    var best = -Infinity, frontierPts = [];
    pts.forEach(function (p) { if (p.m.access === "ga" && p.v > best) { best = p.v; frontierPts.push(p); } });
    var lo = Math.max(0, Math.floor((Math.min.apply(null, pts.map(function (p) { return p.v; })) - 8) / 10) * 10);
    var hi = Math.min(100, Math.ceil((Math.max.apply(null, pts.map(function (p) { return p.v; })) + 4) / 10) * 10);
    var ticks = [];
    for (var t = lo; t <= hi; t += (hi - lo > 40 ? 20 : 10)) { ticks.push(t); }
    var series = [];
    LINES.forEach(function (l) {
      var mine = pts.filter(function (p) { return p.m.line === l; });
      if (mine.length) {
        series.push({ name: l, color: COLOR[l], label: false, dashed: true, points: mine.map(function (p) {
          return { x: p.m.released, y: p.v, big: frontierPts.indexOf(p) !== -1, tip: p.m.name + ": " + pct(p.v) + " (" + p.c + ")" + (p.m.access !== "ga" ? " · gated, not on the best-so-far line" : "") };
        }) });
      }
    });
    series.unshift({ name: "Best so far", color: "#7a1f4d", step: true, label: true, noDots: true,
      points: frontierPts.map(function (p) { return { x: p.m.released, y: p.v }; }) });
    var lines = LINES.filter(function (l) { return pts.some(function (p) { return p.m.line === l; }); });
    var table = '<details class="table-view"><summary>Table view</summary><div class="table-wrap"><table><thead><tr><th scope="col">Model</th><th scope="col">Score</th><th scope="col">Conditions</th><th scope="col">Reported in</th></tr></thead><tbody>' +
      pts.map(function (p) { return '<tr><th scope="row">' + esc(p.m.name) + "</th><td>" + pct(p.v) + "</td><td>" + esc(p.c) + '</td><td><a href="' + esc(p.from.src) + '" target="_blank" rel="noreferrer">' + esc(byId[p.from.model] ? byId[p.from.model].name : p.from.model) + " launch</a></td></tr>"; }).join("") +
      "</tbody></table></div></details>";
    return figure(bench.b + ": every Claude, and the best so far",
      timeChart({ label: bench.b + " scores for each Claude model over time with a step line of the best score so far", series: series, yMin: lo, yMax: hi, yTicks: ticks, yFmt: function (v) { return v + "%"; } }),
      esc(bench.note) + " Dashed lines join each family's models; the solid step line is the best score any generally available Claude had reached by that date (bigger dots set a new best).",
      legend(lines) + table);
  }

  function rival(r, mine) {
    if (!r.o) { return "—"; }
    var bestK = null;
    Object.keys(r.o).forEach(function (k) { if (bestK === null || r.o[k] > r.o[bestK]) { bestK = k; } });
    var v = r.o[bestK];
    var lead = mine - v;
    return esc(bestK) + " " + pct(v, r.unit) + ' <small class="' + (lead >= 0 ? "lead" : "trail") + '">' + (lead >= 0 ? "Claude leads " : "Claude trails ") + Math.abs(Math.round(lead * 10) / 10) + "</small>";
  }

  function renderFrontier() {
    var root = document.getElementById("frontierRoot");
    var F = models.filter(function (m) { return m.frontier; });
    var html = "";
    html += '<p>A <strong>frontier</strong> release here means the most capable generally available Claude at the time it shipped, judged by its own launch table. Gated previews (Mythos) are left out. The line isn\'t always an Opus: Claude 3.5 Sonnet and Sonnet 4.5 each beat the Opus of their day, and in 2026 Opus 5.5 overtook the higher Fable tier.</p>';
    html += '<ol class="frontier-strip" aria-label="Frontier releases in order">' + F.map(function (m) {
      return '<li style="--line:' + COLOR[m.line] + '"><span class="fs-date">' + esc(m.released.slice(0, 7)) + "</span><strong>" + esc(/^Claude \d/.test(m.name) ? m.name : m.name.replace("Claude ", "")) + "</strong></li>";
    }).join("") + "</ol>";

    var priced = F.filter(function (m) { return m.inP != null; });
    html += figure("What the frontier cost: input price per million tokens",
      timeChart({ label: "Input price of each frontier Claude model over time", log: true, yMin: 1, yMax: 20, yTicks: [1, 2, 5, 10, 20], yFmt: function (v) { return "$" + v; },
        series: [{ name: "Frontier input $", color: "#7a1f4d", step: true, points: priced.map(function (m) { return { x: m.released, y: m.inP, tip: m.name + ": $" + m.inP + " in / $" + m.outP + " out", color: COLOR[m.line], big: true }; }) }] }),
      "Log scale. Claude 1 and 2 prices aren't on any current official page, so the line starts at Claude 3 Opus. The frontier price fell from $15 to $3 with 3.5 Sonnet, rose back to $15 with Opus 4, dropped to $5 with Opus 4.5, rose to $10 with the new Fable tier, then fell to $4 when Opus 5.5 overtook it.", legend(LINES.filter(function (l) { return priced.some(function (m) { return m.line === l; }); })));

    var ctxd = F.filter(function (m) { return m.ctx != null; });
    html += figure("How much the frontier could read: context window",
      timeChart({ label: "Context window of frontier Claude models over time", log: true, yMin: 50000, yMax: 2000000, yTicks: [100000, 200000, 500000, 1000000], yFmt: function (v) { return tokens(v); },
        series: [{ name: "Context", color: "#7a1f4d", step: true, points: ctxd.map(function (m) { return { x: m.released, y: m.ctx, tip: m.name + ": " + tokens(m.ctx) + " tokens", color: COLOR[m.line], big: true }; }) }] }),
      "Log scale. 100K with Claude 2, 200K from Claude 2.1, 1M from Opus 4.6. Some 2024–25 frontier models have no context figure on a current official page, so they're skipped rather than guessed.", "");

    TREND_BENCHES.forEach(function (tb) { html += trendChart(tb); });

    html += '<h2 id="steps">Each step, against the one before</h2><p>Every comparison below comes from the <em>new</em> model\'s own launch table, so both numbers were measured the same way.</p><ol class="step-list">';
    F.forEach(function (m, i) {
      var prev = F[i - 1];
      var L = B.launches.filter(function (x) { return x.model === m.id; })[0];
      html += '<li class="step-card window" style="--line:' + COLOR[m.line] + '"><div class="mc-head"><h3>' + esc(m.name) + "</h3>" + lineChip(m.line) + '<span class="step-date">' + day(m.released) + "</span></div>";
      html += '<p class="mc-headline">' + esc(m.headline) + "</p>";
      if (prev) {
        var facts = [];
        facts.push(daysBetween(prev.released, m.released) + " days after " + esc(prev.name));
        if (m.inP != null && prev.inP != null && m.inP !== prev.inP) {
          facts.push("input price " + money(prev.inP) + " → " + money(m.inP) + " (" + (m.inP < prev.inP ? "−" : "+") + Math.round(Math.abs(m.inP - prev.inP) / prev.inP * 100) + "%)");
        } else if (m.inP != null && prev.inP != null) { facts.push("same price (" + money(m.inP) + " in)"); }
        if (m.ctx != null && prev.ctx != null && m.ctx !== prev.ctx) { facts.push("context " + tokens(prev.ctx) + " → " + tokens(m.ctx)); }
        if (m.thinking && prev.thinking && m.thinking !== prev.thinking) { facts.push("thinking: " + esc(prev.thinking) + " → " + esc(m.thinking)); }
        html += '<p class="step-facts">' + facts.join(" · ") + "</p>";
      }
      if (L && L.rows.length) {
        var hasRivals = L.rows.some(function (r) { return r.o; });
        html += '<div class="table-wrap"><table class="delta-table"><thead><tr><th scope="col">Benchmark</th><th scope="col">' + esc(m.name) + '</th><th scope="col">Compared with</th><th scope="col">Change</th>' + (hasRivals ? '<th scope="col">Best rival in table</th>' : "") + "</tr></thead><tbody>";
        L.rows.forEach(function (r) {
          var mine = r.s[m.id];
          if (mine == null) { return; }
          // compare with the previous frontier model if the table has it, else the best older Claude in the table
          var refId = prev && r.s[prev.id] != null ? prev.id : null;
          if (!refId) {
            var bestV = -Infinity;
            Object.keys(r.s).forEach(function (k) { if (k !== m.id && byId[k] && byId[k].released < m.released && r.s[k] > bestV) { bestV = r.s[k]; refId = k; } });
          }
          var ref = refId ? r.s[refId] : null;
          var dlt = ref != null ? mine - ref : null;
          html += '<tr><th scope="row">' + esc(r.b) + '<small>' + esc(r.m) + (r.c ? " · " + esc(r.c) : "") + "</small></th><td><strong>" + pct(mine, r.unit) + "</strong></td><td>" + (refId ? esc(byId[refId].name) + " " + pct(ref, r.unit) : "—") + "</td><td>" +
            (dlt != null ? '<span class="delta ' + (dlt >= 0 ? "up" : "down") + '"><span aria-hidden="true">' + (dlt >= 0 ? "▲" : "▼") + "</span> " + sign(dlt) + Math.abs(Math.round(dlt * 10) / 10) + (r.unit === "Elo" ? "" : " pts") + "</span>" : "—") + "</td>" +
            (hasRivals ? "<td>" + rival(r, mine) + "</td>" : "") + "</tr>";
        });
        html += "</tbody></table></div>";
      }
      if (L && L.note) { html += '<p class="step-note">' + esc(L.note) + "</p>"; }
      if (!L) { html += '<p class="step-note">No benchmark table for this launch in our dataset yet.</p>'; }
      if (L) { html += '<p class="mc-src">Source: <a href="' + esc(L.src) + '" target="_blank" rel="noreferrer">' + esc(L.srcLabel || host(L.src)) + "</a></p>"; }
      html += "</li>";
    });
    html += "</ol>";
    html += '<h2 id="frontier-caveats">Read these before quoting a number</h2><ul>' + B.caveats.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>";
    root.innerHTML = html;
  }

  // ---------- FAMILIES ----------
  function renderFamilies() {
    var root = document.getElementById("familiesRoot");
    var fam = ["Haiku", "Sonnet", "Opus", "Fable", "Mythos"];
    var html = "";
    var series = fam.map(function (l) {
      return { name: l, color: COLOR[l], points: models.filter(function (m) { return m.line === l && m.inP != null; }).map(function (m) { return { x: m.released, y: m.inP, tip: m.name + ": $" + m.inP + " in / $" + m.outP + " out" }; }) };
    }).filter(function (s) { return s.points.length; });
    html += figure("Input price per million tokens, by family",
      timeChart({ label: "Input price over time for each Claude family", log: true, yMin: 0.05, yMax: 30, yTicks: [0.1, 0.25, 1, 3, 10, 25], yFmt: function (v) { return "$" + v; }, series: series, height: 300 }),
      "Log scale. Haiku went $0.25 → $0.80 → $1 → $0.10. Sonnet held at $3 for two years, then dropped to $2 with Sonnet 5. Opus went $15 → $5 → $4.", legend(fam));

    fam.forEach(function (l) {
      var mem = models.filter(function (m) { return m.line === l; });
      if (!mem.length) { return; }
      html += '<h2 id="fam-' + l.toLowerCase() + '">' + lineChip(l) + " " + esc(l) + " line <small>" + mem.length + " model" + (mem.length > 1 ? "s" : "") + "</small></h2>";
      html += '<div class="table-wrap"><table><thead><tr><th scope="col">Model</th><th scope="col">Released</th><th scope="col">Price in / out</th><th scope="col">vs previous</th><th scope="col">Context</th><th scope="col">Max out</th><th scope="col">Thinking</th><th scope="col">Cutoff</th><th scope="col">Status</th></tr></thead><tbody>';
      mem.forEach(function (m, i) {
        var p = mem[i - 1];
        var vs = "—";
        if (p && m.inP != null && p.inP != null) {
          var ch = Math.round((m.inP - p.inP) / p.inP * 100);
          vs = ch === 0 ? "same" : '<span class="delta ' + (ch < 0 ? "up" : "down") + '"><span aria-hidden="true">' + (ch < 0 ? "▼" : "▲") + "</span> " + (ch > 0 ? "+" : "−") + Math.abs(ch) + "% price</span>";
        }
        html += '<tr><th scope="row">' + esc(m.name) + "</th><td>" + day(m.released) + "</td><td>" + price(m) + "</td><td>" + vs + "</td><td>" + tokens(m.ctx) + "</td><td>" + tokens(m.out) + "</td><td>" + (m.thinking ? esc(m.thinking) : UNK) + "</td><td>" + (m.cutoff ? esc(m.cutoff) : UNK) + "</td><td>" + statusBadge(m) + "</td></tr>";
      });
      html += "</tbody></table></div>";
      // same-family benchmark pairs reported in one table
      var pairs = [];
      B.launches.forEach(function (Lc) {
        Lc.rows.forEach(function (r) {
          var ids = Object.keys(r.s).filter(function (k) { return byId[k] && byId[k].line === l; });
          if (ids.length >= 2) { pairs.push({ r: r, ids: ids.sort(function (a, b) { return byId[a].order - byId[b].order; }), L: Lc }); }
        });
      });
      if (pairs.length) {
        html += '<details class="table-view"><summary>' + esc(l) + " vs " + esc(l) + ": benchmarks reported side by side (" + pairs.length + ")</summary><div class=\"table-wrap\"><table><thead><tr><th scope=\"col\">Benchmark</th><th scope=\"col\">Scores</th><th scope=\"col\">Table</th></tr></thead><tbody>" +
          pairs.map(function (p) {
            return '<tr><th scope="row">' + esc(p.r.b) + "<small>" + esc(p.r.c) + "</small></th><td>" + p.ids.map(function (k) { return esc(byId[k].name.replace("Claude ", "")) + " <strong>" + pct(p.r.s[k], p.r.unit) + "</strong>"; }).join(" → ") + '</td><td><a href="' + esc(p.L.src) + '" target="_blank" rel="noreferrer">' + esc(byId[p.L.model] ? byId[p.L.model].name : p.L.model) + "</a></td></tr>";
          }).join("") + "</tbody></table></div></details>";
      }
    });
    root.innerHTML = html;
  }

  // ---------- COMPARE ----------
  function renderCompare() {
    var root = document.getElementById("compareRoot");
    var opts = models.slice().reverse().map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.name) + " (" + m.released.slice(0, 4) + ")</option>"; }).join("");
    root.innerHTML = '<div class="cmp-pick window"><label class="sel">Model A <select id="cmpA">' + opts + '</select></label><button type="button" class="btn glass small" id="cmpSwap" aria-label="Swap models">⇄ Swap</button><label class="sel">Model B <select id="cmpB">' + opts + '</select></label></div><div id="cmpOut" aria-live="polite"></div>';
    var a = root.querySelector("#cmpA"), b = root.querySelector("#cmpB");
    var params = new URLSearchParams(location.search);
    a.value = byId[params.get("a")] ? params.get("a") : "claude-haiku-4-5";
    b.value = byId[params.get("b")] ? params.get("b") : "claude-haiku-5-5";
    function better(x, y, lowerWins) {
      if (x == null || y == null || x === y) { return ["", ""]; }
      var xw = lowerWins ? x < y : x > y;
      return xw ? [" win", ""] : ["", " win"];
    }
    function draw() {
      var A = byId[a.value], Bm = byId[b.value];
      var rows = [
        ["Family", lineChip(A.line), lineChip(Bm.line), ["", ""]],
        ["Released", day(A.released), day(Bm.released), ["", ""]],
        ["Input $ / MTok", money(A.inP), money(Bm.inP), better(A.inP, Bm.inP, true)],
        ["Output $ / MTok", money(A.outP), money(Bm.outP), better(A.outP, Bm.outP, true)],
        ["Context", tokens(A.ctx), tokens(Bm.ctx), better(A.ctx, Bm.ctx)],
        ["Max output", tokens(A.out), tokens(Bm.out), better(A.out, Bm.out)],
        ["Thinking", A.thinking ? esc(A.thinking) : UNK, Bm.thinking ? esc(Bm.thinking) : UNK, ["", ""]],
        ["Knowledge cutoff", A.cutoff ? esc(A.cutoff) : UNK, Bm.cutoff ? esc(Bm.cutoff) : UNK, ["", ""]],
        ["Status", statusBadge(A), statusBadge(Bm), ["", ""]]
      ];
      var html = '<div class="table-wrap"><table class="cmp-table"><thead><tr><th scope="col">Spec</th><th scope="col">' + esc(A.name) + '</th><th scope="col">' + esc(Bm.name) + "</th></tr></thead><tbody>" +
        rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td class="' + r[3][0] + '">' + r[1] + '</td><td class="' + r[3][1] + '">' + r[2] + "</td></tr>"; }).join("") + "</tbody></table></div>";
      html += '<p class="cmp-key"><span class="win-key">Highlighted</span> = better on that spec (cheaper, or bigger window). Gap: ' + Math.abs(daysBetween(A.released, Bm.released)) + " days between releases.</p>";

      var same = [];
      B.launches.forEach(function (L) {
        L.rows.forEach(function (r) { if (r.s[A.id] != null && r.s[Bm.id] != null) { same.push({ r: r, L: L }); } });
      });
      html += "<h2>Benchmarks measured in the same table</h2>";
      if (same.length) {
        html += '<div class="table-wrap"><table><thead><tr><th scope="col">Benchmark</th><th scope="col">' + esc(A.name) + '</th><th scope="col">' + esc(Bm.name) + '</th><th scope="col">Reported in</th></tr></thead><tbody>' +
          same.map(function (x) {
            var va = x.r.s[A.id], vb = x.r.s[Bm.id], w = better(va, vb);
            return '<tr><th scope="row">' + esc(x.r.b) + "<small>" + esc(x.r.c) + '</small></th><td class="' + w[0] + '">' + pct(va, x.r.unit) + '</td><td class="' + w[1] + '">' + pct(vb, x.r.unit) + '</td><td><a href="' + esc(x.L.src) + '" target="_blank" rel="noreferrer">' + esc(byId[x.L.model] ? byId[x.L.model].name : x.L.model) + "</a></td></tr>";
          }).join("") + "</tbody></table></div>";
      } else {
        html += '<p class="empty">Anthropic never published these two in the same benchmark table. Scores from different tables can use different settings, so we don\'t line them up here.</p>';
      }
      var sep = [];
      ["SWE-bench Verified", "GPQA Diamond", "OSWorld-Verified", "MMMU", "Terminal-Bench 2.0", "Humanity's Last Exam (no tools)"].forEach(function (bn) {
        var sa = scoreOf(A.id, bn), sb = scoreOf(Bm.id, bn);
        if (sa && sb && !same.some(function (x) { return x.r.b === bn; })) { sep.push({ bn: bn, sa: sa, sb: sb }); }
      });
      if (sep.length) {
        html += '<h3>Reported in different tables <span class="badge-unv">Settings may differ</span></h3><div class="table-wrap"><table><thead><tr><th scope="col">Benchmark</th><th scope="col">' + esc(A.name) + '</th><th scope="col">' + esc(Bm.name) + "</th></tr></thead><tbody>" +
          sep.map(function (x) { return '<tr><th scope="row">' + esc(x.bn) + "</th><td>" + pct(x.sa.v) + "<small>" + esc(x.sa.c) + "</small></td><td>" + pct(x.sb.v) + "<small>" + esc(x.sb.c) + "</small></td></tr>"; }).join("") + "</tbody></table></div>";
      }
      root.querySelector("#cmpOut").innerHTML = html;
      var url = "?view=compare&a=" + encodeURIComponent(A.id) + "&b=" + encodeURIComponent(Bm.id);
      if (window.LSShell && window.LSShell.current() === "compare") { history.replaceState(history.state, "", url); }
    }
    a.addEventListener("change", draw);
    b.addEventListener("change", draw);
    root.querySelector("#cmpSwap").addEventListener("click", function () { var t = a.value; a.value = b.value; b.value = t; draw(); });
    draw();
  }

  // ---------- SOURCES + overview mini ----------
  function renderSources() {
    var root = document.getElementById("sourcesRoot");
    var urls = {};
    models.forEach(function (m) { m.src.forEach(function (u) { urls[u] = true; }); });
    B.launches.forEach(function (L) { urls[L.src] = true; });
    root.innerHTML = '<h2>Not confirmed on an official page</h2><ul>' + M.unverified.map(function (u) { return "<li>" + esc(u) + "</li>"; }).join("") + "</ul>" +
      "<h2>Benchmark caveats</h2><ul>" + B.caveats.map(function (u) { return "<li>" + esc(u) + "</li>"; }).join("") + "</ul>" +
      "<h2>Every source used (" + Object.keys(urls).length + ')</h2><ul class="src-list">' + Object.keys(urls).sort().map(function (u) { return '<li><a href="' + esc(u) + '" target="_blank" rel="noreferrer">' + esc(u.replace(/^https:\/\/(www\.)?/, "")) + "</a></li>"; }).join("") + "</ul>" +
      "<p>Archive verified " + day(M.verifiedAt) + ". Benchmarks verified " + day(B.verifiedAt || M.verifiedAt) + ".</p>";
  }
  function renderMini() {
    var node = document.getElementById("modelMini");
    if (!node) { return; }
    var last = models[models.length - 1];
    node.innerHTML = "<strong>" + models.length + " Claude models archived</strong> since " + day(models[0].released) + '. Newest: <a href="?view=latest" data-view-link="latest">' + esc(last.name) + "</a>, " + day(last.released) + ".";
  }

  // Render lazily on first visit so the ledger view stays fast.
  var rendered = {};
  var renderers = { archive: renderArchive, frontier: renderFrontier, families: renderFamilies, compare: renderCompare, sources: renderSources };
  function ensure(name) {
    if (renderers[name] && !rendered[name]) { rendered[name] = true; renderers[name](); }
  }
  renderMini();
  if (window.LSShell) {
    window.LSShell.onView(ensure);
    ensure(window.LSShell.current());
  }
})();
