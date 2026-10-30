/* Anthropic Watch: Y2K Korean cursor themes from the LoveSpark Retro Cursor pack.
   Same SVGs and hotspots as the extension (content_script.js). The choice is
   remembered per browser in localStorage; nothing leaves the page. */
(function () {
  "use strict";

  var STORAGE_KEY = "anthropicWatchCursor";
  var STYLE_ID = "ls-cursor-theme";
  var THEMES = [
    { id: "honey-bunny", label: "🐰 Honey Bunny 꿀토끼" },
    { id: "cyworld-dotti", label: "💖 Cyworld Dotti 싸이월드" },
    { id: "coquette-ribbon", label: "🎀 Coquette Ribbon 리본" },
    { id: "strawberry-milk", label: "🍓 Strawberry Milk 딸기우유" },
    { id: "glossy-pearl", label: "✨ Glossy Pearl" },
    { id: "bubble-boba", label: "🧋 Bubble Boba 버블티" },
    { id: "phone-charm", label: "📱 Phone Charm 폰꽂이" },
    { id: "heart-locket", label: "💝 Heart Locket 하트 로켓" },
    { id: "cyber-butterfly", label: "🦋 Cyber Butterfly 나비" }
  ];
  var ALLOWED = {};
  THEMES.forEach(function (t) {
    ALLOWED[t.id + "-pointer"] = true;
    ALLOWED[t.id + "-emoji"] = true;
  });

  function buildCSS(pack) {
    var base = "assets/cursors/" + pack + "/";
    var isEmoji = /-emoji$/.test(pack);
    var defH = isEmoji ? "16 16" : "5 4";
    var ptrH = isEmoji ? "15 12" : "11 3";
    return [
      "html, body, body *, body *::before, body *::after { cursor: url(\"" + base + "default.svg\") " + defH + ", auto !important; }",
      "a, area, button, summary, select, label[for], [role=\"button\"], [role=\"link\"], [tabindex]:not([tabindex=\"-1\"]) { cursor: url(\"" + base + "pointer.svg\") " + ptrH + ", pointer !important; }",
      "input:not([type=\"submit\"]):not([type=\"button\"]):not([type=\"checkbox\"]):not([type=\"radio\"]), textarea, [contenteditable=\"true\"] { cursor: url(\"" + base + "text.svg\") 16 16, text !important; }",
      "[aria-busy=\"true\"] { cursor: url(\"" + base + "wait.svg\") 16 16, wait !important; }"
    ].join("\n");
  }

  function apply(pack) {
    var style = document.getElementById(STYLE_ID);
    if (!ALLOWED[pack]) {
      if (style) style.remove();
      return;
    }
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = buildCSS(pack);
  }

  function load() {
    try { return localStorage.getItem(STORAGE_KEY) || ""; } catch (e) { return ""; }
  }

  function save(pack) {
    try {
      if (pack) localStorage.setItem(STORAGE_KEY, pack);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* private window: the choice just isn't remembered */ }
  }

  var select = document.getElementById("cursorSelect");
  if (!select) return;

  [["pointer", "Pointer"], ["emoji", "Emoji"]].forEach(function (variant) {
    var group = document.createElement("optgroup");
    group.label = "Y2K Korean · " + variant[1];
    THEMES.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t.id + "-" + variant[0];
      opt.textContent = t.label;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });

  var saved = load();
  if (!ALLOWED[saved]) saved = "";
  select.value = saved;
  apply(saved);

  select.addEventListener("change", function () {
    var pack = ALLOWED[select.value] ? select.value : "";
    apply(pack);
    save(pack);
  });
})();
