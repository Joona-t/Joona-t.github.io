// Bvby Ash page: theme + font pickers, click-to-load YouTube players, kana glyph rain.
(() => {
  const root = document.documentElement;
  const store = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };

  // theme
  const pills = document.querySelectorAll("[data-set-theme]");
  const showTheme = () => pills.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setTheme === root.dataset.theme)));
  pills.forEach((b) => b.addEventListener("click", () => {
    root.dataset.theme = b.dataset.setTheme; store("bvby-theme", b.dataset.setTheme); showTheme(); rain.recolor();
  }));
  showTheme();

  // font
  const pick = document.getElementById("fontPick");
  pick.value = root.dataset.font || "";
  pick.addEventListener("change", () => {
    if (pick.value) root.dataset.font = pick.value; else delete root.dataset.font;
    store("bvby-font", pick.value || null);
  });

  // YouTube loads only when the visitor presses play (privacy-enhanced domain)
  document.querySelectorAll(".facade[data-yt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0`;
      f.title = btn.getAttribute("aria-label").replace(" (loads YouTube)", "");
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      btn.replaceWith(f);
    }, { once: true });
  });

  // conga line: enough Claudios to fill two screen widths, so the loop never shows an empty end at any width
  // (2026-11-22: a fixed 14 only covered ~1100 px; at 1920 px the right 795 px of the bar were empty)
  const track = document.querySelector(".conga-track");
  const SPEED = 40; // px per second
  function fillConga() {
    const one = track.firstElementChild; if (!one) return;
    const step = one.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    const perHalf = Math.ceil(track.parentElement.clientWidth / step) + 1;
    if (track.children.length !== perHalf * 2) {
      const tpl = one.cloneNode(true);
      track.replaceChildren(...Array.from({ length: perHalf * 2 }, () => tpl.cloneNode(true)));
    }
    track.style.setProperty("--conga-dur", `${(perHalf * step) / SPEED}s`);
  }
  if (track) { fillConga(); new ResizeObserver(fillConga).observe(track.parentElement); }

  // glyph rain: real words only — 音楽 music, 夢 dream, 愛 love, 光 light, オーラ aura, 踊れ dance, 六七 six-seven, 電波 signal
  const WORDS = ["音楽", "夢", "愛", "光", "オーラ", "踊れ", "六七", "電波", "バビーアッシュ"];
  const canvas = document.getElementById("glyphRain");
  const ctx = canvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const rain = { cols: [], size: 18, c1: "", c2: "", running: false, last: 0 };
  rain.recolor = () => {
    const cs = getComputedStyle(root);
    rain.c1 = cs.getPropertyValue("--rain").trim(); rain.c2 = cs.getPropertyValue("--rain-2").trim();
    if (still.matches) drawStill();
  };
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.ceil(innerWidth / (rain.size * 1.6));
    rain.cols = Array.from({ length: n }, (_, i) => ({
      x: i * rain.size * 1.6 + 4,
      y: Math.random() * innerHeight,
      v: 18 + Math.random() * 34,
      word: WORDS[(Math.random() * WORDS.length) | 0],
      alt: Math.random() < 0.35,
    }));
    if (still.matches) drawStill();
  }
  function drawCol(c) {
    ctx.font = `${rain.size}px "Yusei Magic", "Hiragino Maru Gothic ProN", sans-serif`;
    const chars = [...c.word];
    chars.forEach((ch, j) => {
      const a = 0.10 + 0.12 * ((j + 1) / chars.length);
      ctx.fillStyle = `rgba(${c.alt ? rain.c2 : rain.c1}, ${a})`;
      ctx.fillText(ch, c.x, c.y + j * rain.size * 1.15);
    });
  }
  function drawStill() { ctx.clearRect(0, 0, innerWidth, innerHeight); rain.cols.forEach(drawCol); }
  function frame(t) {
    if (!rain.running) return;
    const dt = Math.min(0.05, (t - (rain.last || t)) / 1000); rain.last = t;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const c of rain.cols) {
      c.y += c.v * dt;
      if (c.y > innerHeight) { c.y = -rain.size * 8; c.word = WORDS[(Math.random() * WORDS.length) | 0]; }
      drawCol(c);
    }
    requestAnimationFrame(frame);
  }
  function setRunning() {
    const go = !still.matches && !document.hidden;
    if (go && !rain.running) { rain.running = true; rain.last = 0; requestAnimationFrame(frame); }
    if (!go) { rain.running = false; drawStill(); }
  }
  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", setRunning);
  still.addEventListener("change", setRunning);
  rain.recolor(); resize(); setRunning();
  document.fonts && document.fonts.ready.then(() => still.matches && drawStill());
})();
