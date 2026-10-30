/* Anthropic Watch shell: ?view= router, sidebar, pager, mobile drawer.
   Loaded before app.js so its hashchange/keydown listeners run first:
   ledger permalinks (#sig-…) and filter hashes (#/…) switch to the ledger view
   before app.js scrolls to them. */
(function () {
  "use strict";

  var views = Array.prototype.slice.call(document.querySelectorAll("[data-view]"));
  var order = views.map(function (v) { return v.getAttribute("data-view"); });
  var sidebar = document.getElementById("sidebar");
  var menuBtn = document.getElementById("menuBtn");
  var backdrop = document.getElementById("backdrop");
  var pagerTop = document.getElementById("pagerTop");
  var pagerBottom = document.getElementById("pagerBottom");
  var announcer = document.getElementById("announcer");
  var content = document.getElementById("content");
  var drawerMedia = window.matchMedia("(max-width: 900px)");
  var current = "";
  var listeners = [];

  function titleOf(name) {
    var node = document.querySelector('[data-view="' + name + '"]');
    return node ? node.getAttribute("data-title") : name;
  }

  function viewFromUrl() {
    if (location.hash.indexOf("#sig-") === 0 || location.hash.indexOf("#/") === 0) {
      return "ledger";
    }
    var params = new URLSearchParams(location.search);
    var v = params.get("view");
    return order.indexOf(v) === -1 ? order[0] : v;
  }

  function pagerHtml(index) {
    var prev = order[index - 1];
    var next = order[index + 1];
    var html = "";
    html += prev
      ? '<a class="pg-btn" href="?view=' + prev + '" data-view-link="' + prev + '"><span aria-hidden="true">&larr;</span> ' + titleOf(prev) + "</a>"
      : "<span></span>";
    html += '<span class="progress">Section <span class="cur">' + (index + 1) + "</span> of " + order.length + "</span>";
    html += next
      ? '<a class="pg-btn" href="?view=' + next + '" data-view-link="' + next + '">' + titleOf(next) + ' <span aria-hidden="true">&rarr;</span></a>'
      : "<span></span>";
    return html;
  }

  function show(name, opts) {
    opts = opts || {};
    if (order.indexOf(name) === -1) { name = order[0]; }
    var changed = name !== current;
    current = name;
    views.forEach(function (v) {
      var on = v.getAttribute("data-view") === name;
      v.hidden = !on;
    });
    content.classList.toggle("is-wide", !!document.querySelector('[data-view="' + name + '"].view-wide, [data-view="' + name + '"].chapter-wide'));
    Array.prototype.forEach.call(sidebar.querySelectorAll("[data-view-link]"), function (a) {
      if (a.getAttribute("data-view-link") === name) { a.setAttribute("aria-current", "page"); }
      else { a.removeAttribute("aria-current"); }
    });
    var index = order.indexOf(name);
    pagerTop.innerHTML = pagerHtml(index);
    pagerBottom.innerHTML = pagerHtml(index);
    document.title = (name === "overview" ? "" : titleOf(name).replace("&amp;", "&") + " · ") + "Anthropic Watch · LoveSpark";

    if (opts.push) {
      var url = "?view=" + name + (opts.keepHash ? location.hash : "");
      history.pushState({ view: name }, "", url);
    }
    if (changed) {
      listeners.forEach(function (fn) { fn(name); });
      if (!opts.initial) {
        announcer.textContent = titleOf(name).replace("&amp;", "&");
        if (!opts.keepScroll) { window.scrollTo(0, 0); }
        var heading = document.querySelector('[data-view="' + name + '"] .chapter-title');
        (heading || content).focus({ preventScroll: true });
      }
    }
  }

  // ---------- drawer ----------
  function setInert(node, on) {
    if (on) { node.setAttribute("inert", ""); } else { node.removeAttribute("inert"); }
  }
  function syncDrawer() {
    var mobile = drawerMedia.matches;
    if (!mobile) { closeDrawer(false); }
    setInert(sidebar, mobile && !sidebar.classList.contains("open"));
  }
  function openDrawer() {
    sidebar.classList.add("open");
    backdrop.hidden = false;
    document.body.classList.add("drawer-open");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close section menu");
    setInert(sidebar, false);
    var target = sidebar.querySelector("[aria-current]") || sidebar.querySelector(".side-link");
    if (target) { target.focus(); }
  }
  function closeDrawer(returnFocus) {
    var wasOpen = sidebar.classList.contains("open");
    sidebar.classList.remove("open");
    backdrop.hidden = true;
    document.body.classList.remove("drawer-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open section menu");
    if (drawerMedia.matches) { setInert(sidebar, true); }
    if (wasOpen && returnFocus) { menuBtn.focus(); }
  }
  menuBtn.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) { closeDrawer(true); } else { openDrawer(); }
  });
  backdrop.addEventListener("click", function () { closeDrawer(true); });
  if (drawerMedia.addEventListener) { drawerMedia.addEventListener("change", syncDrawer); }

  // ---------- navigation ----------
  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[data-view-link]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) { return; }
    event.preventDefault();
    var name = link.getAttribute("data-view-link");
    closeDrawer(false);
    show(name, { push: true });
  });

  window.addEventListener("popstate", function () { show(viewFromUrl(), {}); });

  window.addEventListener("hashchange", function () {
    if (location.hash.indexOf("#sig-") === 0 || location.hash.indexOf("#/") === 0) {
      show("ledger", { keepScroll: true });
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && sidebar.classList.contains("open")) {
      closeDrawer(true);
      return;
    }
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && current !== "ledger") {
      show("ledger", { push: true, keepScroll: true });
    }
  });

  window.LSShell = {
    go: function (name) { show(name, { push: true }); },
    current: function () { return current; },
    onView: function (fn) { listeners.push(fn); }
  };

  show(viewFromUrl(), { initial: true });
  syncDrawer();

  // A ledger permalink can't scroll while its view is still being laid out; retry after load.
  if (location.hash.indexOf("#sig-") === 0) {
    window.addEventListener("load", function () {
      var node = document.getElementById(location.hash.slice(1));
      if (node) { node.scrollIntoView({ block: "start" }); }
    });
  }
})();
