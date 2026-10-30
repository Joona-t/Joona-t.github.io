/* Anthropic Watch: theme + font picker ("Change Theme" menu in the top bar).
   The <head> applies a saved choice before first paint; this file builds the menu
   and saves changes. Choices live in this browser's localStorage only. */
(function () {
  "use strict";

  var THEME_KEY = "aw-theme";
  var FONT_KEY = "aw-font";

  // swatch = the theme's accent, shown as a dot next to its name
  var THEME_GROUPS = [
    { label: "LoveSpark", items: [
      { id: "bubblegum", name: "Bubblegum", swatch: "#ff49a6" },
      { id: "basalt", name: "Basalt", swatch: "#d9a23b" },
      { id: "paper", name: "Beige Paper", swatch: "#b07a3a" }
    ] },
    { label: "Y2K Korean", items: [
      { id: "honey-bunny", name: "Honey Bunny", ko: "꿀토끼", swatch: "#ff6e96" },
      { id: "cyworld-dotti", name: "Cyworld Dotti", ko: "싸이월드", swatch: "#b48cb0" },
      { id: "coquette-ribbon", name: "Coquette Ribbon", ko: "리본", swatch: "#ff6e96" },
      { id: "strawberry-milk", name: "Strawberry Milk", ko: "딸기우유", swatch: "#ff5f8a" },
      { id: "glossy-pearl", name: "Glossy Pearl", swatch: "#b98ad6" },
      { id: "bubble-boba", name: "Bubble Boba", ko: "버블티", swatch: "#a77bd1" },
      { id: "phone-charm", name: "Phone Charm", ko: "폰꽂이", swatch: "#ff3d8a" },
      { id: "heart-locket", name: "Heart Locket", ko: "하트 로켓", swatch: "#e84a85" },
      { id: "cyber-butterfly", name: "Cyber Butterfly", ko: "나비", swatch: "#a774ff" }
    ] }
  ];
  var FONTS = [
    { id: "classic", name: "Garamond", note: "elegant serif" },
    { id: "dyslexic", name: "OpenDyslexic", note: "easier letter shapes" },
    { id: "sans", name: "System sans", note: "plain and compact" }
  ];

  var root = document.documentElement;
  var btn = document.getElementById("prefsBtn");
  var panel = document.getElementById("prefsPanel");
  if (!btn || !panel) return;

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private window: not remembered */ }
  }

  function radio(group, value, checked, labelHtml) {
    return '<label class="prefs-opt"><input type="radio" name="' + group + '" value="' + value + '"' +
      (checked ? " checked" : "") + "> " + labelHtml + "</label>";
  }

  var theme = root.getAttribute("data-theme") || "bubblegum";
  var font = root.getAttribute("data-font") || "classic";
  var html = '<fieldset class="prefs-set"><legend>Theme</legend>';
  THEME_GROUPS.forEach(function (g) {
    html += '<p class="prefs-group">' + g.label + "</p>";
    g.items.forEach(function (t) {
      html += radio("aw-theme", t.id, t.id === theme,
        '<span class="prefs-swatch" style="background:' + t.swatch + '" aria-hidden="true"></span>' +
        "<span>" + t.name + (t.ko ? ' <span class="prefs-ko" lang="ko">' + t.ko + "</span>" : "") + "</span>");
    });
  });
  html += '</fieldset><fieldset class="prefs-set"><legend>Font</legend>';
  FONTS.forEach(function (f) {
    html += radio("aw-font", f.id, f.id === font,
      '<span class="prefs-font prefs-font--' + f.id + '">' + f.name + '</span> <span class="prefs-note">' + f.note + "</span>");
  });
  html += "</fieldset>";
  panel.innerHTML = html;

  panel.addEventListener("change", function (e) {
    var input = e.target;
    if (input.name === "aw-theme") {
      if (input.value === "bubblegum") root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", input.value);
      save(THEME_KEY, input.value);
    } else if (input.name === "aw-font") {
      if (input.value === "classic") root.removeAttribute("data-font");
      else root.setAttribute("data-font", input.value);
      save(FONT_KEY, input.value);
    }
  });

  function setOpen(open) {
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) {
      var checked = panel.querySelector("input:checked");
      if (checked) checked.focus();
    }
  }
  btn.addEventListener("click", function () { setOpen(panel.hidden); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { setOpen(false); btn.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) setOpen(false);
  });
})();
