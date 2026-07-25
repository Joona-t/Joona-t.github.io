(function () {
  "use strict";

  var state = {
    filter: "all",
    query: "",
    sort: "desc"
  };

  var data = window.OPENAI_WATCH;
  var filters = [
    { key: "all", label: "All" },
    { key: "release", label: "Releases" },
    { key: "patch", label: "Patches" },
    { key: "deprecation", label: "Retired" },
    { key: "security", label: "Security" },
    { key: "ChatGPT", label: "ChatGPT" },
    { key: "API", label: "API" },
    { key: "Codex", label: "Codex" }
  ];

  var feed = document.getElementById("updateFeed");
  var filtersNode = document.getElementById("filters");
  var searchInput = document.getElementById("searchInput");
  var sortButton = document.getElementById("sortButton");
  var resultCount = document.getElementById("resultCount");
  var activeFilter = document.getElementById("activeFilter");
  var emptyState = document.getElementById("emptyState");

  function formatDate(value) {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value + "T12:00:00"));
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function matchesFilter(item) {
    return state.filter === "all" || item.type === state.filter || item.channel === state.filter;
  }

  function matchesQuery(item) {
    if (!state.query) {
      return true;
    }

    var haystack = [
      item.title,
      item.summary,
      item.channel,
      item.type,
      item.tags.join(" ")
    ].map(normalize).join(" ");

    return haystack.indexOf(state.query) !== -1;
  }

  function getFilteredUpdates() {
    return data.updates
      .filter(function (item) {
        return matchesFilter(item) && matchesQuery(item);
      })
      .sort(function (a, b) {
        var diff = new Date(a.date) - new Date(b.date);
        return state.sort === "asc" ? diff : -diff;
      });
  }

  function renderFilters() {
    filtersNode.innerHTML = filters.map(function (filter) {
      return [
        '<button class="filter-button" type="button" data-filter="',
        escapeHtml(filter.key),
        '" aria-pressed="',
        filter.key === state.filter ? "true" : "false",
        '">',
        escapeHtml(filter.label),
        "</button>"
      ].join("");
    }).join("");
  }

  function renderStatus() {
    document.getElementById("verifiedDate").textContent = formatDate(data.verifiedAt);
    document.getElementById("trackedCount").textContent = String(data.updates.length).padStart(2, "0");
    document.getElementById("statusLabel").textContent = data.statusSnapshot.label;
    document.getElementById("heroStatus").textContent = data.statusSnapshot.label;

    document.getElementById("uptimeList").innerHTML = data.statusSnapshot.uptime.map(function (item) {
      return "<dt>" + escapeHtml(item.name) + "</dt><dd>" + escapeHtml(item.value) + "</dd>";
    }).join("");
  }

  function renderTicker() {
    var latest = data.updates.slice(0, 6);
    var tickerItems = latest.map(function (item) {
      return [
        '<span class="ticker-item"><time>',
        escapeHtml(formatDate(item.date)),
        "</time>",
        escapeHtml(item.title),
        "</span>"
      ].join("");
    }).join("");

    document.getElementById("tickerTrack").innerHTML = tickerItems + tickerItems;
  }

  function renderFeed() {
    var updates = getFilteredUpdates();
    var currentFilter = filters.find(function (filter) {
      return filter.key === state.filter;
    });

    resultCount.textContent = updates.length + (updates.length === 1 ? " entry" : " entries");
    activeFilter.textContent = currentFilter ? currentFilter.label + " signals" : "Filtered signals";
    emptyState.hidden = updates.length !== 0;

    feed.innerHTML = updates.map(function (item) {
      var tags = item.tags.map(function (tag) {
        return "<span>#" + escapeHtml(tag) + "</span>";
      }).join("");

      var links = item.links.map(function (link) {
        return [
          '<a href="',
          escapeHtml(link.url),
          '" target="_blank" rel="noreferrer">',
          escapeHtml(link.label),
          " +</a>"
        ].join("");
      }).join("");

      return [
        '<li class="update-card" data-type="',
        escapeHtml(item.type),
        '">',
        '<div class="update-index" aria-hidden="true"></div>',
        '<article class="update-body">',
        '<div class="meta"><time datetime="',
        escapeHtml(item.date),
        '">',
        escapeHtml(formatDate(item.date)),
        '</time><span class="pill ',
        escapeHtml(item.type),
        '">',
        escapeHtml(item.type),
        '</span><span class="pill">',
        escapeHtml(item.channel),
        "</span></div>",
        "<h3>",
        escapeHtml(item.title),
        "</h3>",
        '<p class="summary">',
        escapeHtml(item.summary),
        "</p>",
        '<div class="tags">',
        tags,
        "</div>",
        "</article>",
        '<div class="source-links">',
        '<span class="source-count" aria-hidden="true">',
        String(item.links.length).padStart(2, "0"),
        "</span><div>",
        links,
        "</div></div></li>"
      ].join("");
    }).join("");
  }

  function render() {
    renderFilters();
    renderStatus();
    renderTicker();
    renderFeed();
    sortButton.textContent = state.sort === "desc" ? "Newest first" : "Oldest first";
  }

  filtersNode.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-filter]");
    if (!button) {
      return;
    }

    state.filter = button.getAttribute("data-filter");
    renderFilters();
    renderFeed();
  });

  searchInput.addEventListener("input", function () {
    state.query = normalize(searchInput.value.trim());
    renderFeed();
  });

  sortButton.addEventListener("click", function () {
    state.sort = state.sort === "desc" ? "asc" : "desc";
    renderFeed();
    sortButton.textContent = state.sort === "desc" ? "Newest first" : "Oldest first";
  });

  render();
})();
