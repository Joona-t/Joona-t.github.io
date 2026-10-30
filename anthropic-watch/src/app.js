(function () {
  "use strict";

  var data = window.ANTHROPIC_WATCH;
  if (!data || !Array.isArray(data.updates)) {
    return;
  }

  var TYPES = {
    release: { label: "Release", plural: "Releases", icon: "✦" },
    patch: { label: "Patch", plural: "Patches", icon: "✚" },
    deprecation: { label: "Retired", plural: "Retired", icon: "☾" },
    security: { label: "Security", plural: "Security", icon: "◈" }
  };
  var CHANNELS = {
    "Claude": { icon: "✿" },
    "API": { icon: "{ }" },
    "Claude Code": { icon: ">_" },
    "News": { icon: "✉" }
  };
  var NEW_WINDOW_DAYS = 3;
  var DAY_MS = 86400000;

  var state = { filter: "all", query: "", day: "", sort: "desc" };

  var feed = document.getElementById("updateFeed");
  var filtersNode = document.getElementById("filters");
  var searchInput = document.getElementById("searchInput");
  var sortButton = document.getElementById("sortButton");
  var resultCount = document.getElementById("resultCount");
  var activeFilter = document.getElementById("activeFilter");
  var activeFilterText = document.getElementById("activeFilterText");
  var clearFilters = document.getElementById("clearFilters");
  var emptyState = document.getElementById("emptyState");
  var heatmap = document.getElementById("heatmap");
  var channelPulse = document.getElementById("channelPulse");

  // ---------- helpers ----------

  function parseDay(value) {
    var p = value.split("-");
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }

  function dayKey(ms) {
    return new Date(ms).toISOString().slice(0, 10);
  }

  var fmtLong = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  var fmtShort = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
  var fmtMonth = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
  var fmtMonthYear = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });
  var fmtDow = new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" });
  var fmtFull = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function plural(n, one, many) {
    return n + " " + (n === 1 ? one : many);
  }

  var verifiedMs = parseDay(data.verifiedAt);
  var updates = data.updates.map(function (item) {
    var ms = parseDay(item.date);
    return {
      item: item,
      ms: ms,
      isNew: verifiedMs - ms <= NEW_WINDOW_DAYS * DAY_MS,
      haystack: normalize([item.title, item.summary, item.channel, item.type, (TYPES[item.type] || {}).label, item.tags.join(" ")].join(" "))
    };
  });

  var countsByDay = {};
  updates.forEach(function (u) {
    countsByDay[u.item.date] = (countsByDay[u.item.date] || 0) + 1;
  });

  // ---------- filtering ----------

  var filters = [{ key: "all", label: "All" }]
    .concat(Object.keys(TYPES).map(function (key) {
      return { key: key, label: TYPES[key].plural, icon: TYPES[key].icon };
    }))
    .concat([{ sep: true }])
    .concat(Object.keys(CHANNELS).map(function (key) {
      return { key: key, label: key, icon: CHANNELS[key].icon };
    }));

  function matchesFilter(u) {
    return state.filter === "all" || u.item.type === state.filter || u.item.channel === state.filter;
  }

  function matchesQuery(u) {
    if (!state.query) {
      return true;
    }
    return state.query.split(/\s+/).every(function (word) {
      return u.haystack.indexOf(word) !== -1;
    });
  }

  function matchesDay(u) {
    return !state.day || u.item.date === state.day;
  }

  function getFiltered() {
    return updates
      .filter(function (u) { return matchesFilter(u) && matchesQuery(u) && matchesDay(u); })
      .sort(function (a, b) { return state.sort === "asc" ? a.ms - b.ms : b.ms - a.ms; });
  }

  function countFor(key) {
    if (key === "all") {
      return updates.length;
    }
    return updates.filter(function (u) { return u.item.type === key || u.item.channel === key; }).length;
  }

  // ---------- URL hash state ----------

  function writeHash() {
    var parts = [];
    if (state.filter !== "all") { parts.push("f=" + encodeURIComponent(state.filter)); }
    if (state.query) { parts.push("q=" + encodeURIComponent(state.query)); }
    if (state.day) { parts.push("d=" + state.day); }
    if (state.sort !== "desc") { parts.push("s=asc"); }
    if (parts.length) {
      history.replaceState(null, "", "#/" + parts.join("&"));
    } else if (location.hash.indexOf("#/") === 0) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function readHash() {
    var hash = location.hash;
    if (hash.indexOf("#/") !== 0) {
      return false;
    }
    var params = {};
    hash.slice(2).split("&").forEach(function (pair) {
      var i = pair.indexOf("=");
      if (i > 0) { params[pair.slice(0, i)] = decodeURIComponent(pair.slice(i + 1)); }
    });
    var validFilter = filters.some(function (f) { return f.key === params.f; });
    state.filter = validFilter ? params.f : "all";
    state.query = normalize(params.q || "").trim();
    state.day = /^\d{4}-\d{2}-\d{2}$/.test(params.d || "") ? params.d : "";
    state.sort = params.s === "asc" ? "asc" : "desc";
    return true;
  }

  // ---------- render: hero + status ----------

  function renderHero() {
    var latest = updates[0];
    document.getElementById("verifiedDate").textContent = fmtLong.format(verifiedMs);
    document.getElementById("syncChipText").textContent = "Verified " + fmtLong.format(verifiedMs);
    document.getElementById("trackedCount").textContent = String(updates.length);
    document.getElementById("recentCount").textContent = String(updates.filter(function (u) {
      return verifiedMs - u.ms < 30 * DAY_MS;
    }).length);
    document.getElementById("heroStatus").textContent = data.statusSnapshot.label;

    if (latest) {
      document.getElementById("latestBurstText").textContent = latest.item.title;
      var latestLink = document.getElementById("latestLink");
      if (latestLink) { latestLink.setAttribute("href", "#sig-" + latest.item.id); }
    }
    if (data.sources && data.sources.api) {
      document.getElementById("apiSourceLink").setAttribute("href", data.sources.api);
    }

    var allOk = data.statusSnapshot.uptime.every(function (row) { return /operational/i.test(row.value); });
    var icon = document.getElementById("statusIcon");
    icon.textContent = allOk ? "✓" : "!";
    icon.classList.toggle("is-warn", !allOk);
    document.getElementById("statusLabel").textContent = data.statusSnapshot.label;
    document.getElementById("statusNote").textContent = "Snapshot from the " + fmtLong.format(verifiedMs) + " check.";
    document.getElementById("uptimeList").innerHTML = data.statusSnapshot.uptime.map(function (row) {
      var warn = /operational/i.test(row.value) ? "" : ' class="is-warn"';
      return "<dt>" + escapeHtml(row.name) + "</dt><dd" + warn + ">" + escapeHtml(row.value) + "</dd>";
    }).join("");
  }

  function renderTicker() {
    var items = updates.slice(0, 8).map(function (u) {
      return '<a class="ticker-item" href="#sig-' + escapeHtml(u.item.id) + '"><time datetime="' + u.item.date + '">' +
        escapeHtml(fmtShort.format(u.ms)) + "</time>" + escapeHtml(u.item.title) + "</a>";
    }).join("");
    document.getElementById("tickerTrack").innerHTML =
      '<div class="ticker-set">' + items + '</div><div class="ticker-set" aria-hidden="true" inert>' + items + "</div>";
  }

  // ---------- render: pulse ----------

  function heatLevel(n) {
    if (n === 0) { return 0; }
    if (n === 1) { return 1; }
    if (n <= 3) { return 2; }
    if (n <= 6) { return 3; }
    return 4;
  }

  var heatDays = [];

  function renderHeatmap() {
    var first = updates.reduce(function (min, u) { return Math.min(min, u.ms); }, verifiedMs);
    var startDate = new Date(first);
    var start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);
    var mondayOffset = (new Date(start).getUTCDay() + 6) % 7;
    var gridStart = start - mondayOffset * DAY_MS;
    var html = [];
    var lastMonth = -1;
    heatDays = [];

    for (var weekStart = gridStart; weekStart <= verifiedMs; weekStart += 7 * DAY_MS) {
      var label = "";
      for (var k = 0; k < 7; k++) {
        var probeMs = weekStart + k * DAY_MS;
        var probe = new Date(probeMs);
        if (probeMs >= start && probeMs <= verifiedMs && probe.getUTCDate() === 1 && probe.getUTCMonth() !== lastMonth) {
          lastMonth = probe.getUTCMonth();
          label = fmtMonth.format(probeMs);
        }
      }
      html.push('<span class="heat-month" aria-hidden="true">' + label + "</span>");

      for (var d = 0; d < 7; d++) {
        var ms = weekStart + d * DAY_MS;
        if (ms < start || ms > verifiedMs) {
          html.push('<span class="heat-cell is-pad"></span>');
          continue;
        }
        var key = dayKey(ms);
        var n = countsByDay[key] || 0;
        if (n === 0) {
          html.push('<span class="heat-cell" data-level="0" title="' + fmtShort.format(ms) + ': quiet"></span>');
          continue;
        }
        heatDays.push(key);
        html.push('<button type="button" class="heat-cell" data-day="' + key + '" data-level="' + heatLevel(n) +
          '" tabindex="-1" aria-pressed="false" aria-label="' + fmtFull.format(ms) + ": " + plural(n, "signal", "signals") +
          '" title="' + fmtShort.format(ms) + ": " + plural(n, "signal", "signals") + '"></button>');
      }
    }
    heatmap.innerHTML = html.join("");
    // On narrow screens the calendar scrolls; start on the most recent weeks.
    heatmap.scrollLeft = heatmap.scrollWidth;

    var busiest = Object.keys(countsByDay).sort(function (a, b) { return countsByDay[b] - countsByDay[a] || (a < b ? 1 : -1); })[0];
    var activeDays = heatDays.length;
    document.getElementById("heatSummary").innerHTML = busiest
      ? "Shipped on <strong>" + activeDays + "</strong> different days. Busiest: <strong>" + escapeHtml(fmtLong.format(parseDay(busiest))) +
        "</strong> with " + plural(countsByDay[busiest], "signal", "signals") + "."
      : "";
    syncHeatmap();
  }

  function syncHeatmap() {
    var focusKey = state.day && heatDays.indexOf(state.day) !== -1 ? state.day : heatDays[heatDays.length - 1];
    Array.prototype.forEach.call(heatmap.querySelectorAll("button.heat-cell"), function (cell) {
      var key = cell.getAttribute("data-day");
      cell.setAttribute("aria-pressed", key === state.day ? "true" : "false");
      cell.tabIndex = key === focusKey ? 0 : -1;
    });
  }

  function renderChannelPulse() {
    var first = updates.reduce(function (min, u) { return Math.min(min, u.ms); }, verifiedMs);
    var months = [];
    var cursor = new Date(first);
    var y = cursor.getUTCFullYear();
    var m = cursor.getUTCMonth();
    var end = new Date(verifiedMs);
    while (y < end.getUTCFullYear() || (y === end.getUTCFullYear() && m <= end.getUTCMonth())) {
      months.push(y + "-" + String(m + 1).padStart(2, "0"));
      m += 1;
      if (m > 11) { m = 0; y += 1; }
    }

    channelPulse.innerHTML = Object.keys(CHANNELS).map(function (channel) {
      var mine = updates.filter(function (u) { return u.item.channel === channel; });
      var perMonth = months.map(function (month) {
        return mine.filter(function (u) { return u.item.date.slice(0, 7) === month; }).length;
      });
      var max = Math.max.apply(null, perMonth.concat([1]));
      var bars = perMonth.map(function (n, i) {
        return '<i style="height:' + Math.max(8, Math.round((n / max) * 100)) + '%" title="' +
          fmtMonth.format(parseDay(months[i] + "-01")) + ": " + n + '"></i>';
      }).join("");
      var span = months.length ? fmtMonth.format(parseDay(months[0] + "-01")) + " to " + fmtMonth.format(parseDay(months[months.length - 1] + "-01")) : "";
      return '<li class="channel-card"><button type="button" data-filter="' + escapeHtml(channel) + '" aria-pressed="false" aria-label="' +
        escapeHtml(channel) + ": " + plural(mine.length, "signal", "signals") + '. Show only ' + escapeHtml(channel) + '.">' +
        '<span class="channel-name"><span class="channel-glyph" aria-hidden="true">' + escapeHtml(CHANNELS[channel].icon) + "</span>" + escapeHtml(channel) + "</span>" +
        '<span class="channel-count">' + mine.length + "</span>" +
        '<span class="channel-bars" aria-hidden="true">' + bars + "</span>" +
        '<span class="channel-caption" aria-hidden="true">per month, ' + span + "</span></button></li>";
    }).join("");
  }

  function syncChannelPulse() {
    Array.prototype.forEach.call(channelPulse.querySelectorAll("button[data-filter]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-filter") === state.filter ? "true" : "false");
    });
  }

  // ---------- render: ledger ----------

  function renderFilters() {
    filtersNode.innerHTML = filters.map(function (f) {
      if (f.sep) {
        return '<span class="filter-sep" aria-hidden="true"></span>';
      }
      return '<button class="filter-button" type="button" data-filter="' + escapeHtml(f.key) + '" aria-pressed="' +
        (f.key === state.filter ? "true" : "false") + '">' +
        (f.icon ? '<span aria-hidden="true">' + escapeHtml(f.icon) + "</span>" : "") +
        escapeHtml(f.label) + ' <span class="count">' + countFor(f.key) + "</span></button>";
    }).join("");
  }

  function syncFilters() {
    Array.prototype.forEach.call(filtersNode.querySelectorAll("button[data-filter]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-filter") === state.filter ? "true" : "false");
    });
  }

  function cardHtml(u) {
    var item = u.item;
    var type = TYPES[item.type] || { label: item.type, icon: "" };
    var tags = item.tags.map(function (tag) {
      return '<button type="button" class="tag" data-tag="' + escapeHtml(tag) + '" aria-label="Search for ' + escapeHtml(tag) + '">#' + escapeHtml(tag) + "</button>";
    }).join("");
    var links = item.links.map(function (link) {
      return '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noreferrer">' + escapeHtml(link.label) +
        ' <span aria-hidden="true">&#8599;</span><span class="visually-hidden"> (opens in a new tab)</span></a>';
    }).join("");

    return '<li class="update-card" id="sig-' + escapeHtml(item.id) + '" data-type="' + escapeHtml(item.type) + '">' +
      '<div class="date-stamp" aria-hidden="true"><span class="d-month">' + fmtMonth.format(u.ms) + '</span><span class="d-day">' +
      new Date(u.ms).getUTCDate() + '</span><span class="d-dow">' + fmtDow.format(u.ms) + "</span></div>" +
      '<article class="update-body">' +
      '<div class="meta"><time class="visually-hidden" datetime="' + item.date + '">' + fmtLong.format(u.ms) + "</time>" +
      '<span class="pill type-' + escapeHtml(item.type) + '"><span aria-hidden="true">' + type.icon + "</span>" + escapeHtml(type.label) + "</span>" +
      '<span class="pill"><span aria-hidden="true">' + escapeHtml((CHANNELS[item.channel] || {}).icon || "") + "</span>" + escapeHtml(item.channel) + "</span>" +
      (u.isNew ? '<span class="new-sticker">NEW!</span>' : "") + "</div>" +
      '<h4><a href="#sig-' + escapeHtml(item.id) + '">' + escapeHtml(item.title) + "</a></h4>" +
      '<p class="summary">' + escapeHtml(item.summary) + "</p>" +
      '<div class="card-foot"><div class="tags">' + tags + '</div><div class="source-links">' + links + "</div></div>" +
      "</article></li>";
  }

  function renderFeed() {
    var list = getFiltered();
    var html = [];
    var currentMonth = "";

    list.forEach(function (u) {
      var month = u.item.date.slice(0, 7);
      if (month !== currentMonth) {
        currentMonth = month;
        var inMonth = list.filter(function (x) { return x.item.date.slice(0, 7) === month; }).length;
        html.push('<li class="month-mark"><h3>' + fmtMonthYear.format(parseDay(month + "-01")) +
          " <small>" + plural(inMonth, "signal", "signals") + "</small></h3></li>");
      }
      html.push(cardHtml(u));
    });

    feed.innerHTML = html.join("");
    resultCount.textContent = plural(list.length, "entry", "entries");
    emptyState.hidden = list.length !== 0;

    var bits = [];
    if (state.filter !== "all") {
      var f = filters.filter(function (x) { return x.key === state.filter; })[0];
      bits.push(f ? f.label : state.filter);
    }
    if (state.day) { bits.push("on " + fmtLong.format(parseDay(state.day))); }
    if (state.query) { bits.push("matching “" + state.query + "”"); }
    activeFilter.hidden = bits.length === 0;
    activeFilterText.textContent = bits.length ? "Showing " + bits.join(", ") : "";
  }

  function update() {
    syncFilters();
    syncChannelPulse();
    syncHeatmap();
    renderFeed();
    sortButton.textContent = state.sort === "desc" ? "Newest first" : "Oldest first";
    sortButton.setAttribute("aria-label", "Sort order: " + sortButton.textContent + ". Activate to reverse.");
    writeHash();
  }

  function resetState() {
    state.filter = "all";
    state.query = "";
    state.day = "";
    searchInput.value = "";
  }

  function revealEntry(id) {
    var node = document.getElementById(id);
    if (!node) {
      resetState();
      update();
      node = document.getElementById(id);
    }
    if (node) {
      node.scrollIntoView({ block: "start" });
    }
  }

  // ---------- events ----------

  filtersNode.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-filter]");
    if (!button) { return; }
    state.filter = button.getAttribute("data-filter");
    update();
  });

  channelPulse.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-filter]");
    if (!button) { return; }
    var key = button.getAttribute("data-filter");
    state.filter = state.filter === key ? "all" : key;
    update();
    document.getElementById("releaseFeed").scrollIntoView({ block: "start" });
  });

  heatmap.addEventListener("click", function (event) {
    var cell = event.target.closest("button.heat-cell");
    if (!cell) { return; }
    var key = cell.getAttribute("data-day");
    state.day = state.day === key ? "" : key;
    update();
    var target = heatmap.querySelector('[data-day="' + key + '"]');
    if (target) { target.focus(); }
  });

  heatmap.addEventListener("keydown", function (event) {
    var cell = event.target.closest("button.heat-cell");
    if (!cell) { return; }
    var index = heatDays.indexOf(cell.getAttribute("data-day"));
    var next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") { next = Math.min(heatDays.length - 1, index + 1); }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") { next = Math.max(0, index - 1); }
    if (event.key === "Home") { next = 0; }
    if (event.key === "End") { next = heatDays.length - 1; }
    if (next === -1) { return; }
    event.preventDefault();
    var target = heatmap.querySelector('[data-day="' + heatDays[next] + '"]');
    Array.prototype.forEach.call(heatmap.querySelectorAll("button.heat-cell"), function (c) { c.tabIndex = -1; });
    target.tabIndex = 0;
    target.focus();
  });

  feed.addEventListener("click", function (event) {
    var tag = event.target.closest("button[data-tag]");
    if (!tag) { return; }
    state.query = normalize(tag.getAttribute("data-tag"));
    searchInput.value = tag.getAttribute("data-tag");
    update();
    document.getElementById("releaseFeed").scrollIntoView({ block: "start" });
  });

  var searchTimer = 0;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.query = normalize(searchInput.value).trim();
      update();
    }, 120);
  });

  sortButton.addEventListener("click", function () {
    state.sort = state.sort === "desc" ? "asc" : "desc";
    update();
  });

  clearFilters.addEventListener("click", function () {
    resetState();
    update();
    searchInput.focus();
  });

  document.addEventListener("keydown", function (event) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (event.key === "Escape" && (state.filter !== "all" || state.query || state.day)) {
      resetState();
      update();
    }
  });

  window.addEventListener("hashchange", function () {
    if (location.hash.indexOf("#sig-") === 0) {
      revealEntry(location.hash.slice(1));
    } else if (readHash()) {
      searchInput.value = state.query;
      update();
    }
  });

  // ---------- boot ----------

  readHash();
  searchInput.value = state.query;
  renderHero();
  renderTicker();
  renderHeatmap();
  renderChannelPulse();
  renderFilters();
  update();

  if (location.hash.indexOf("#sig-") === 0) {
    revealEntry(location.hash.slice(1));
  }
})();
