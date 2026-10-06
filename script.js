// LoveSpark — bubble gum Y2K script.
// Wavy rings, sparkle field, cursor trail, smooth scroll, card-close wobble.
'use strict';

// Motion / pointer gates. Reduced motion → no swarm, no sparkle field, no
// cursor trail, instant scroll, videos paused on their poster. The cursor
// trail is retro-only and additionally needs a hover-capable fine pointer.
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');

// ══════════════════════════════════════════════════════════════════════════════
// THEME SWITCHER — candy (default) · kawaii ('pink') · basalt · retro
// The FOUC-prevention script in <head> already applied the saved theme class
// (theme-candy when nothing is saved; kawaii = no class). This wires the switcher buttons and
// syncs across tabs via the storage event.
// ══════════════════════════════════════════════════════════════════════════════
(function setupThemeSwitcher() {
  const KEY = 'lovespark-theme';

  function init() {
    const root = document.documentElement;
    const pills = document.querySelectorAll('.theme-pill');
    if (!pills.length) {
      console.warn('[lovespark] theme switcher pills not found');
      return;
    }

    const CLASS = { retro: 'theme-retro', candy: 'theme-candy', basalt: 'theme-basalt' };
    const VALID = ['pink', 'candy', 'basalt', 'retro'];

    function apply(theme) {
      if (!VALID.includes(theme)) theme = 'candy';
      root.classList.remove('theme-retro', 'theme-candy', 'theme-basalt');
      if (CLASS[theme]) root.classList.add(CLASS[theme]);  // pink (kawaii) = no class
      pills.forEach(p => p.setAttribute('aria-pressed', String(p.dataset.theme === theme)));
      try { localStorage.setItem(KEY, theme); } catch (_) {}
      // Lets other modules (hero videos) react to a theme change.
      document.dispatchEvent(new CustomEvent('lovespark:theme', { detail: theme }));
    }

    const current = root.classList.contains('theme-retro') ? 'retro'
      : root.classList.contains('theme-candy') ? 'candy'
      : root.classList.contains('theme-basalt') ? 'basalt' : 'pink';
    pills.forEach(p => p.setAttribute('aria-pressed', String(p.dataset.theme === current)));

    // Theme wipe: a clip-path circle grows from the clicked pill over a View
    // Transition. Falls back to a plain swap without the API or under reduced
    // motion. Cross-tab sync (storage event below) keeps using plain apply().
    function switchTheme(theme, pill) {
      if (!document.startViewTransition || mqReduce.matches || !pill) {
        apply(theme);
        return;
      }
      const r = pill.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add('is-theme-wipe');
      let vt;
      try {
        vt = document.startViewTransition(() => apply(theme));
      } catch (_) {
        root.classList.remove('is-theme-wipe');
        apply(theme);
        return;
      }
      vt.ready.then(() => {
        const easing = getComputedStyle(root).getPropertyValue('--wipe-ease').trim() || 'ease-out';
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 560, easing, pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(() => {});
      vt.finished.finally(() => root.classList.remove('is-theme-wipe'));
    }

    pills.forEach(p => {
      p.addEventListener('click', () => switchTheme(p.dataset.theme, p));
    });

    window.addEventListener('storage', (e) => {
      if (e.key === KEY && VALID.includes(e.newValue)) {
        apply(e.newValue);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// WAVY ORB RINGS — generate undulating circle paths for each .orb-ring SVG
// Each ring's perimeter is a sine-modulated radius:
//   r(θ) = baseR + amp · sin(waves · θ + phase)
// Combined with the CSS scale + rotate animation, the wave bumps appear to
// travel around the perimeter as the ring radiates outward — gives an
// organic, breathing-water feel rather than a hard sonar ping.
// ══════════════════════════════════════════════════════════════════════════════
(function initWavyRings() {
  const rings = document.querySelectorAll('.orb-ring');
  if (!rings.length) return;

  // Per-ring parameters: [waves, amplitude, phaseOffset]
  // Different wave counts so neighboring rings don't sync visually.
  const params = [
    { waves: 8,  amp: 6, phase: 0      },
    { waves: 11, amp: 5, phase: 1.2    },
    { waves: 14, amp: 4, phase: 2.4    },
  ];

  function makeWavyCircle(baseR, amp, waves, phase, samples = 140) {
    const cx = 100, cy = 100;  // center within viewBox 0..200
    let d = '';
    for (let i = 0; i <= samples; i++) {
      const theta = (i / samples) * Math.PI * 2;
      const r = baseR + amp * Math.sin(waves * theta + phase);
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
    }
    return d + 'Z';
  }

  rings.forEach((ring, i) => {
    const path = ring.querySelector('path');
    if (!path) return;
    const p = params[i % params.length];
    path.setAttribute('d', makeWavyCircle(78, p.amp, p.waves, p.phase));
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// HERO VISIBILITY — one shared IntersectionObserver on the hero plus the page
// visibilitychange. Continuous hero motion (swarm, videos) subscribes and
// pauses while the hero is off-screen or the tab is hidden.
// ══════════════════════════════════════════════════════════════════════════════
const heroActivity = (function () {
  const subs = [];
  let inView = true;
  const hero = document.querySelector('.hero');
  const active = () => inView && !document.hidden;
  const notify = () => subs.forEach(fn => fn(active()));
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; notify(); })
      .observe(hero);
  }
  document.addEventListener('visibilitychange', notify);
  return {
    active,
    subscribe(fn) { subs.push(fn); },
  };
})();

const isMotionTheme = () => {
  const c = document.documentElement.classList;
  return !c.contains('theme-retro') && !c.contains('theme-basalt');
};

// ══════════════════════════════════════════════════════════════════════════════
// DYSON SWARM — candy + kawaii only, motion allowed. Three sparse orbital shells
// of fine dust around the heart (~180 spans; was 5 shells / 1,074). Built when
// the theme + motion gate passes, torn down (DOM removed) on a switch to
// retro/basalt or when reduced motion turns on. Paused via the shared hero
// visibility gate. CSS still hides it in retro/basalt/reduced motion as a
// belt-and-braces fallback.
// ══════════════════════════════════════════════════════════════════════════════
(function initDysonSwarm() {
  const host = document.querySelector('.heart-orb');
  if (!host) return;

  // [radius px, particle count, orbit duration s, direction]
  const SHELLS = [
    [165, 50, 300, 'normal'],
    [323, 60, 447, 'reverse'],
    [480, 70, 593, 'normal'],
  ];

  // Deep mauve palette — enough contrast against the pink page to read.
  const COLORS = [
    'rgba( 90,  42,  71, 0.55)',
    'rgba(140,  56,  98, 0.50)',
    'rgba(196,  84, 138, 0.55)',
    'rgba(255,  79, 179, 0.45)',
    'rgba(255, 121, 198, 0.40)',
  ];

  const DOT_SIZE = 2.5;     // base, multiplied by per-dot 0.55..1.5 jitter
  const DOT_OPACITY = 0.74; // base, multiplied by per-dot 0.4..1.9 jitter
  const RADIAL_JITTER = 33; // px, breaks hard wire-frame look

  let swarm = null;

  function build() {
    swarm = document.createElement('div');
    swarm.className = 'dyson-swarm';
    swarm.setAttribute('aria-hidden', 'true');
    for (const [radius, count, duration, direction] of SHELLS) {
      const shell = document.createElement('div');
      shell.className = 'dyson-shell';
      shell.style.animation = `dysonOrbit ${duration}s linear infinite ${direction}`;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 360 + (Math.random() - 0.5) * 4;
        const r = radius + (Math.random() - 0.5) * RADIAL_JITTER;
        const size = Math.max(0.3, DOT_SIZE * (0.55 + Math.random() * 0.95)).toFixed(2);
        const opacity = Math.min(1, DOT_OPACITY * (0.4 + Math.random() * 1.5)).toFixed(2);
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const dust = document.createElement('span');
        dust.style.cssText =
          `--a:${angle.toFixed(2)}deg;--r:${r.toFixed(1)}px;` +
          `width:${size}px;height:${size}px;background:${color};opacity:${opacity};`;
        shell.appendChild(dust);
      }
      swarm.appendChild(shell);
    }
    host.appendChild(swarm);
  }

  function sync() {
    const want = isMotionTheme() && !mqReduce.matches;
    if (want && !swarm) build();
    if (!want && swarm) { swarm.remove(); swarm = null; }
    if (swarm) swarm.classList.toggle('is-paused', !heroActivity.active());
  }

  sync();
  document.addEventListener('lovespark:theme', sync);
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', sync);
  heroActivity.subscribe(sync);
})();

// ══════════════════════════════════════════════════════════════════════════════
// STATIC SPARKLE FIELD — twinkles scattered across the page (retro only;
// hidden in kawaii via CSS — the Dyson swarm above is the kawaii equivalent).
// ══════════════════════════════════════════════════════════════════════════════
(function initSparkleField() {
  if (mqReduce.matches) return;
  const field = document.getElementById('sparkle-field');
  if (!field) return;

  const GLYPHS = ['✦', '★', '♡', '✿', '⋆', '✧'];
  const COLORS = ['#FF4FB3', '#FF79C6', '#FFF5B5', '#C5E1FF', '#B5F0E2'];
  const COUNT = 48;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('span');
    el.textContent = GLYPHS[i % GLYPHS.length];
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = (3 + Math.random() * 4).toFixed(2);
    const del = (Math.random() * 6).toFixed(2);
    const size = 9 + Math.random() * 12;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    el.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      font-size: ${size}px;
      color: ${color};
      text-shadow: 0 0 8px ${color};
      animation: sparkleTwinkle ${dur}s ease-in-out infinite;
      animation-delay: -${del}s;
    `;
    field.appendChild(el);
  }
  // @keyframes sparkleTwinkle lives in styles.css.
})();

// ══════════════════════════════════════════════════════════════════════════════
// CURSOR SPARK TRAIL — retro only. A fixed pool of 12 spans is reused round-
// robin (no per-move DOM churn) and animated with WAAPI. The passive listener
// only exists while the gate passes: retro + motion allowed + hover-capable
// fine pointer. Candy, kawaii and basalt have no trail at all.
// ══════════════════════════════════════════════════════════════════════════════
(function initCursorTrail() {
  const container = document.getElementById('cursor-sparks');
  if (!container || !Element.prototype.animate) return;

  const GLYPHS = ['✦', '★', '♡', '⋆', '✧'];
  const COLORS = ['#FF4FB3', '#FFB3D9', '#FFF5B5', '#C5E1FF'];
  const POOL = 12;
  const THROTTLE = 60;
  const pool = [];
  let next = 0;
  let lastTime = 0;
  let listening = false;

  function spark(x, y) {
    if (!pool.length) {
      for (let i = 0; i < POOL; i++) {
        const el = document.createElement('span');
        container.appendChild(el);
        pool.push(el);
      }
    }
    const el = pool[next];
    next = (next + 1) % POOL;
    const dx = ((Math.random() - 0.5) * 50).toFixed(0);
    const dy = (-(20 + Math.random() * 40)).toFixed(0);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    el.style.cssText =
      `left:${x}px;top:${y}px;font-size:${(9 + Math.random() * 7).toFixed(1)}px;` +
      `color:${color};text-shadow:0 0 6px ${color};`;
    el.getAnimations().forEach(a => a.cancel());
    el.animate([
      { transform: 'translate(0, 0) scale(0.6)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(1.4)`, opacity: 0 },
    ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
  }

  function onMove(e) {
    const now = e.timeStamp;
    if (now - lastTime < THROTTLE) return;
    lastTime = now;
    spark(e.clientX, e.clientY);
  }

  function sync() {
    const want = document.documentElement.classList.contains('theme-retro')
      && !mqReduce.matches && mqFine.matches;
    if (want && !listening) {
      document.addEventListener('pointermove', onMove, { passive: true });
      listening = true;
    } else if (!want && listening) {
      document.removeEventListener('pointermove', onMove);
      listening = false;
      pool.forEach(el => el.getAnimations().forEach(a => a.cancel()));
    }
  }

  sync();
  document.addEventListener('lovespark:theme', sync);
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', sync);
  if (mqFine.addEventListener) mqFine.addEventListener('change', sync);
})();

// ══════════════════════════════════════════════════════════════════════════════
// CARD SPOTLIGHT + TILT — one delegated, passive pointermove, throttled to one
// rAF. Sets --mx/--my (spotlight position on .card-body) and --rx/--ry (-1..1,
// scaled by the theme's --tilt-max in CSS) on the hovered card. Only for a
// hover-capable fine pointer with motion allowed; touch never tilts.
// ══════════════════════════════════════════════════════════════════════════════
(function initCardSpotlight() {
  let pending = null;
  let active = null;

  function reset(card) {
    if (!card) return;
    ['--mx', '--my', '--rx', '--ry'].forEach(k => card.style.removeProperty(k));
  }

  function frame() {
    const e = pending;
    pending = null;
    const card = e.target instanceof Element ? e.target.closest('.win98-card') : null;
    if (card !== active) { reset(active); active = card; }
    if (!card) return;
    const box = card.getBoundingClientRect();
    const body = card.querySelector('.card-body');
    const bb = body ? body.getBoundingClientRect() : box;
    const nx = (e.clientX - box.left) / box.width;   // 0..1
    const ny = (e.clientY - box.top) / box.height;
    card.style.setProperty('--rx', ((nx - 0.5) * 2).toFixed(3));
    card.style.setProperty('--ry', ((ny - 0.5) * 2).toFixed(3));
    card.style.setProperty('--mx', (e.clientX - bb.left).toFixed(0) + 'px');
    card.style.setProperty('--my', (e.clientY - bb.top).toFixed(0) + 'px');
  }

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || mqReduce.matches || !mqFine.matches) {
      if (active) { reset(active); active = null; }
      return;
    }
    if (!pending) requestAnimationFrame(frame);
    pending = e;
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => { reset(active); active = null; }, { passive: true });
})();

// ══════════════════════════════════════════════════════════════════════════════
// IN-PAGE LINKS — skip link, site bar, hero CTAs. Smooth unless reduced motion;
// the sticky bar offset comes from `scroll-padding-top` in CSS. Focus moves to
// the target so keyboard and screen-reader users land where they jumped.
// ══════════════════════════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: mqReduce.matches ? 'auto' : 'smooth', block: 'start' });
    if (!target.matches('a[href], button, input, select, textarea, summary, [tabindex]')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SITE BAR — one IntersectionObserver marks the section in view with
// aria-current on its nav link; a 1px sentinel above the bar flips
// data-stuck once the page scrolls (CSS scroll-state queries do the same
// natively where supported). No scroll listener.
// ══════════════════════════════════════════════════════════════════════════════
(function initSiteBar() {
  if (!('IntersectionObserver' in window)) return;
  const bar = document.querySelector('.site-bar');
  const sentinel = document.querySelector('.site-bar-sentinel');
  if (bar && sentinel) {
    new IntersectionObserver(([entry]) => {
      bar.toggleAttribute('data-stuck', !entry.isIntersecting);
    }).observe(sentinel);
  }

  const links = new Map();
  document.querySelectorAll('.site-nav-link[href^="#"]').forEach(a => {
    const section = document.getElementById(a.getAttribute('href').slice(1));
    if (section) links.set(section, a);
  });
  if (!links.size) return;

  const visible = new Set();
  const order = [...links.keys()];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
    // The last section (document order) crossing the band wins.
    const current = order.filter(sec => visible.has(sec)).pop();
    links.forEach((a, sec) => {
      if (sec === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  order.forEach(sec => io.observe(sec));
})();

// ══════════════════════════════════════════════════════════════════════════════
// HERO VIDEOS — the markup ships `data-src` + poster only, so nothing downloads
// until this runs. Basalt and retro hide both videos, so they never get a src
// (and lose it again on a switch to those themes). Reduced motion: src stays,
// playback stops and the poster frame shows. Without JS: poster only.
// ══════════════════════════════════════════════════════════════════════════════
(function gateVideos() {
  const videos = document.querySelectorAll('video.heart-mark, video.hero-mark');
  if (!videos.length) return;
  const root = document.documentElement;

  function themeShowsVideo() {
    return !root.classList.contains('theme-basalt') && !root.classList.contains('theme-retro');
  }

  function sync() {
    const show = themeShowsVideo();
    videos.forEach(v => {
      if (!show) {
        if (v.getAttribute('src')) {
          v.pause();
          v.removeAttribute('src');
          v.load(); // drop the buffered media
        }
        return;
      }
      if (!v.getAttribute('src') && v.dataset.src) v.setAttribute('src', v.dataset.src);
      if (mqReduce.matches) {
        v.autoplay = false;
        if (!v.paused || v.currentTime > 0) { v.pause(); v.load(); } // back to the poster frame
      } else if (!heroActivity.active()) {
        v.autoplay = false;
        if (!v.paused) v.pause(); // off-screen or tab hidden: hold the current frame
      } else if (v.paused) {
        v.autoplay = true;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    });
  }

  sync();
  document.addEventListener('lovespark:theme', sync);
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', sync);
  heroActivity.subscribe(sync);
})();

// ══════════════════════════════════════════════════════════════════════════════
// CARD CLOSE BUTTON — easter egg: card wobbles instead of closing. It's a real
// <button> (generator output), so Enter/Space trigger it too.
// ══════════════════════════════════════════════════════════════════════════════
document.querySelectorAll('.win-btn-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.win98-card');
    if (!card) return;
    card.style.animation = 'none';
    card.offsetHeight; // force reflow
    card.style.animation = 'cardWobble 0.4s ease';
    card.addEventListener('animationend', () => { card.style.animation = ''; }, { once: true });
  });
});
// @keyframes cardWobble lives in styles.css.
