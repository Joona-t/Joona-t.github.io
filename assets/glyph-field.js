/* Glyph field for lovespark.love: ported from forge-notebook/index.html (itself from the Glyph Grid Studio site).
 * Shown in basalt and parchment only (CSS decides: #glyphField is display:none elsewhere). Differences from the
 * notebook copy: it re-tints on the html class (this site's themes), it fully pauses while hidden, and it draws in a
 * Web Worker.
 *
 * A fixed canvas behind the page holds a character grid of vertical-hatching glyphs (strokes only, no dots). Each
 * cell samples a slowly drifting value-noise field (stretched vertically so it reads as strands of ink), adds a 4x4
 * Bayer threshold, and picks a glyph from a density ramp, at ~12 fps.
 *   - Glyphs are pre-rendered once into an atlas (one sprite per ramp step, in the theme's ink), so a frame is
 *     drawImage calls, never fillText. Only cells whose glyph changed are repainted.
 *   - The field thins out behind the centre text column so copy stays clean.
 *   - Paused when the tab is hidden or the theme hides it; one still frame under prefers-reduced-motion.
 *   - Ink and strength come from CSS (--field-ink, --field-alpha).
 *
 * Perf (2026-11-12, scripts/perf_switch.py): the noise and drawing run in a Web Worker on an OffscreenCanvas, so
 * none of it competes with theme switches, scrolling or input on the main thread. The main thread only reads the
 * theme and posts small messages. Without OffscreenCanvas the same engine runs in place, as before.
 */
(function () {
  'use strict';
  var canvas = document.getElementById('glyphField');
  if (!canvas || !canvas.getContext) return;

  // ---- the engine: identical drawing code for the worker and the in-page fallback -------------------------------
  // engine(canvas, makeCanvas, schedule, now) -> { configure, setInk, setScroll, setActive, setStill }
  function engine(canvas, makeCanvas, schedule, now) {
    var ctx = canvas.getContext('2d', { alpha: true });
    var RAMP = [' ', '╷', '┆', '╎', '¦', '│', '┃', '║'];   // strokes only, faintest first: hatching, never dots
    var CELL_W = 9, CELL_H = 15, FONT_PX = 13;            // CSS px
    var FPS = 12;
    var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    var dpr = 1, W = 0, H = 0, cols = 0, rows = 0, ink = '#5e3a24', alpha = 0.1;
    var atlas = null, prev = null, still = false, active = false, scrollY = 0;
    var t0 = now(), lastFrame = 0, ticking = false;

    function hash(x, y) {
      var h = (x * 374761393 + y * 668265263) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    }
    function vnoise(x, y) {
      var xi = Math.floor(x), yi = Math.floor(y);
      var xf = x - xi, yf = y - yi;
      var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function field(x, y, t) {
      return 0.65 * vnoise(x * 0.11 + t * 0.06, y * 0.022 - t * 0.09)
           + 0.35 * vnoise(x * 0.31 - t * 0.04, y * 0.07 + t * 0.05);
    }
    function smooth(e0, e1, x) { var k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return k * k * (3 - 2 * k); }

    function buildAtlas() {
      var cw = Math.ceil(CELL_W * dpr), ch = Math.ceil(CELL_H * dpr);
      atlas = makeCanvas(cw * RAMP.length, ch);
      var a = atlas.getContext('2d');
      a.font = (FONT_PX * dpr) + 'px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
      a.textAlign = 'center'; a.textBaseline = 'middle';
      a.fillStyle = ink;
      for (var i = 1; i < RAMP.length; i++) {
        a.globalAlpha = alpha * (0.55 + 0.45 * i / (RAMP.length - 1));   // denser glyphs carry a touch more ink
        a.fillText(RAMP[i], i * cw + cw / 2, ch / 2);
      }
      prev = null;   // force a full repaint
    }

    function draw(ms) {
      var t = still ? 0 : (ms - t0) / 1000;
      var drift = still ? 0 : scrollY * 0.12 / CELL_H;     // gentle parallax, in rows
      var cw = Math.ceil(CELL_W * dpr), ch = Math.ceil(CELL_H * dpr);
      var n = cols * rows, full = !prev || prev.length !== n;
      if (full) { prev = new Uint8Array(n).fill(255); ctx.clearRect(0, 0, canvas.width, canvas.height); }
      var top = Math.floor(drift), frac = drift - top;
      var half = Math.min(530, W * 0.5), cx = W / 2;        // the text column: content is centred, max 1060 px
      var floor = W < 760 ? 0.5 : 0.32;   // narrow screens: copy fills the width, keep a quiet field everywhere
      for (var r = 0; r < rows; r++) {
        var gy = r + top;
        for (var c = 0; c < cols; c++) {
          var px = c * CELL_W;
          var dist = Math.abs(px + CELL_W / 2 - cx);
          var mask = floor + (1 - floor) * smooth(half * 0.55, half * 1.08, dist);
          var s = field(c, gy + frac, t) * mask;
          s = s * 1.45 - 0.02 + (BAYER[(gy & 3) * 4 + (c & 3)] / 16 - 0.5) * 0.22;
          var g = Math.max(0, Math.min(RAMP.length - 1, Math.floor(s * RAMP.length)));
          var i = r * cols + c;
          if (g === prev[i]) continue;
          prev[i] = g;
          var x = Math.round(px * dpr), y = Math.round(r * CELL_H * dpr);
          if (!full) ctx.clearRect(x, y, cw, ch);
          if (g) ctx.drawImage(atlas, g * cw, 0, cw, ch, x, y, cw, ch);
        }
      }
    }

    function loop(ms) {
      ticking = false;
      if (!active || still) return;
      if (ms - lastFrame >= 1000 / FPS) { lastFrame = ms; draw(ms); }
      ticking = true; schedule(loop);
    }
    function kick() {
      if (!active) return;
      draw(now());
      if (!still && !ticking) { ticking = true; schedule(loop); }
    }
    return {
      configure: function (w, h, d) {
        W = w; H = h; dpr = d;
        var cw0 = Math.ceil(W * dpr), ch0 = Math.ceil(H * dpr);
        if (canvas.width !== cw0 || canvas.height !== ch0) { canvas.width = cw0; canvas.height = ch0; }  // realloc only on a real size change
        cols = Math.ceil(W / CELL_W) + 1; rows = Math.ceil(H / CELL_H) + 1;
        buildAtlas(); kick();
      },
      setInk: function (i, a) { ink = i; alpha = a; buildAtlas(); kick(); },   // re-tint into the same canvas
      setScroll: function (y) { scrollY = y; },
      setStill: function (s) { still = s; kick(); },
      setActive: function (a) { active = a; kick(); }
    };
  }

  // ---- main thread: theme, size, scroll, visibility -> engine ---------------------------------------------------
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  // 1.5x, not 2x: the strokes are faint (10-13% ink) and every redraw uploads the whole canvas (44% fewer pixels).
  function size() {
    return [document.documentElement.clientWidth || window.innerWidth, window.innerHeight,
            Math.min(window.devicePixelRatio || 1, 1.5)];
  }
  var send;   // send(method, args...) to the engine, wherever it runs
  var useWorker = typeof canvas.transferControlToOffscreen === 'function' && typeof Worker === 'function' &&
                  typeof OffscreenCanvas === 'function';
  var worker = null;
  if (useWorker) {
    try {
      var src = 'var engine = ' + engine.toString() + ';\n' +
        'var api; var raf = self.requestAnimationFrame ? function (f) { self.requestAnimationFrame(f); }' +
        ' : function (f) { setTimeout(function () { f(performance.now()); }, 16); };\n' +
        'self.onmessage = function (e) { var m = e.data;\n' +
        '  if (m.init) { api = engine(m.canvas, function (w, h) { return new OffscreenCanvas(w, h); }, raf,' +
        ' function () { return performance.now(); }); return; }\n' +
        '  api[m.fn].apply(null, m.args); };';
      worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      var off = canvas.transferControlToOffscreen();
      worker.postMessage({ init: true, canvas: off }, [off]);
      send = function (fn) { worker.postMessage({ fn: fn, args: Array.prototype.slice.call(arguments, 1) }); };
    } catch (e) { worker = null; }
  }
  if (!worker) {
    var api = engine(canvas, function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; },
      function (f) { requestAnimationFrame(f); }, function () { return performance.now(); });
    send = function (fn) { api[fn].apply(null, Array.prototype.slice.call(arguments, 1)); };
  }

  var on = true, themeKey = '';
  // Theme switches also add and remove helper classes on <html> (the wipe's is-theme-wipe): those must not trigger
  // any work. 2026-11-12: each switch caused 4 class changes and up to 3 full-canvas reallocations (the glitch).
  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    on = getComputedStyle(canvas).display !== 'none';
    return [on, cs.getPropertyValue('--field-ink').trim() || '#5e3a24', parseFloat(cs.getPropertyValue('--field-alpha')) || 0.1];
  }
  function applySize() {
    var s = size();
    canvas.style.width = s[0] + 'px'; canvas.style.height = s[1] + 'px';
    send('configure', s[0], s[1], s[2]);
  }
  function applyActive() { send('setActive', on && !document.hidden); }

  var th = readTheme(); themeKey = th.join('|');
  send('setStill', reduce.matches);
  send('setScroll', window.scrollY);
  send('setInk', th[1], th[2]);
  applySize(); applyActive();
  canvas.classList.add('on');

  var rt = 0, scrollPending = false;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(applySize, 120); });
  window.addEventListener('scroll', function () {
    if (scrollPending) return;            // one message per frame at most
    scrollPending = true;
    requestAnimationFrame(function () { scrollPending = false; send('setScroll', window.scrollY); });
  }, { passive: true });
  document.addEventListener('visibilitychange', applyActive);
  if (reduce.addEventListener) reduce.addEventListener('change', function () { send('setStill', reduce.matches); });
  new MutationObserver(function () {
    var t = readTheme(), k = t.join('|');
    if (k === themeKey) return;           // a helper class, not a theme change: nothing to do
    themeKey = k;
    if (on) send('setInk', t[1], t[2]);   // re-tint, then (re)start
    applyActive();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
