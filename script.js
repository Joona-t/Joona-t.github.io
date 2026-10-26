// LoveSpark — bubble gum Y2K script.
// Theme switcher, hero videos, Dyson swarm, smooth scroll, card-close wobble.
'use strict';

// Motion / pointer gates. Reduced motion → no swarm, instant scroll, videos
// paused on their poster.
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');

// ══════════════════════════════════════════════════════════════════════════════
// THEME SWITCHER — basalt (default) · bubblegum (was 'candy') · parchment · kawaii ('pink').
// Retro was archived 2026-10-25 (archive/styles-retro.css); a saved 'retro' opens basalt.
// The FOUC-prevention script in <head> already applied the saved theme class
// (theme-basalt when nothing is saved, a saved 'candy' becomes 'bubblegum'; kawaii = no class). This wires the switcher buttons and
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

    const CLASS = { bubblegum: 'theme-bubblegum', basalt: 'theme-basalt', parchment: 'theme-parchment' };
    const VALID = ['pink', 'bubblegum', 'basalt', 'parchment'];

    function apply(theme) {
      if (!VALID.includes(theme)) theme = 'basalt';
      root.classList.remove('theme-bubblegum', 'theme-basalt', 'theme-parchment');
      if (CLASS[theme]) root.classList.add(CLASS[theme]);  // pink (kawaii) = no class
      pills.forEach(p => p.setAttribute('aria-pressed', String(p.dataset.theme === theme)));
      try { localStorage.setItem(KEY, theme); } catch (_) {}
      // Lets other modules (hero videos) react to a theme change.
      document.dispatchEvent(new CustomEvent('lovespark:theme', { detail: theme }));
    }

    const current = root.classList.contains('theme-bubblegum') ? 'bubblegum'
      : root.classList.contains('theme-basalt') ? 'basalt'
      : root.classList.contains('theme-parchment') ? 'parchment' : 'pink';
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
  return !c.contains('theme-basalt') && !c.contains('theme-parchment');
};

// ══════════════════════════════════════════════════════════════════════════════
// DYSON SWARM — bubblegum + kawaii only, motion allowed. Three sparse orbital shells
// of fine dust around the heart (~180 spans; was 5 shells / 1,074). Built when
// the theme + motion gate passes, torn down (DOM removed) on a switch to
// basalt/parchment or when reduced motion turns on. Paused via the shared hero
// visibility gate. CSS still hides it in basalt/parchment/reduced motion as a
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
// DESTINY SPECKS — fine gold sparkle on and just around the primary hero CTA
// (Qwen Guide), all themes, like the wordmark's speck shimmer: tiny dots that
// twinkle in place and creep a few px outward. ~40 spans, CSS keyframes only.
// Not built under reduced motion; paused with the shared hero visibility gate.
// ══════════════════════════════════════════════════════════════════════════════
(function initDestinySpecks() {
  const host = document.querySelector('.hero-cta--primary');
  if (!host) return;

  const COUNT = 40;
  const COLORS = ['#fff4d6', '#f7e2a6', '#efd08a'];
  let specks = null;

  function build() {
    specks = document.createElement('span');
    specks.className = 'destiny-specks';
    specks.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < COUNT; i++) {
      // scattered over the face and a thin halo past the edge (percent box)
      const x = -4 + Math.random() * 108;
      const y = -14 + Math.random() * 128;
      const dx = (x - 50) * 0.06;   // a few px outward, no further
      const dy = (y - 50) * 0.08;
      const size = (0.8 + Math.random() * 1.1).toFixed(2);
      const dot = document.createElement('span');
      dot.style.cssText =
        `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${size}px;height:${size}px;` +
        `--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px;--c:${COLORS[i % COLORS.length]};` +
        `animation-duration:${(1.8 + Math.random() * 2.4).toFixed(2)}s;` +
        `animation-delay:${(-Math.random() * 4).toFixed(2)}s;`;
      specks.appendChild(dot);
    }
    host.appendChild(specks);
  }

  function sync() {
    const want = !mqReduce.matches;
    if (want && !specks) build();
    if (!want && specks) { specks.remove(); specks = null; }
    if (specks) specks.classList.toggle('is-paused', !heroActivity.active());
  }

  sync();
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', sync);
  heroActivity.subscribe(sync);
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
// until this runs. A video only gets a src in the theme that shows it (and
// loses it again on a switch away): basalt shows only its charcoal-glyph
// wordmark (.hero-mark--basalt), parchment only its own, kawaii/bubblegum the rest.
// Reduced motion: src stays, playback stops and the poster frame shows.
// Without JS: poster only.
// ══════════════════════════════════════════════════════════════════════════════
(function gateVideos() {
  const videos = document.querySelectorAll('video.heart-mark, video.hero-mark');
  if (!videos.length) return;
  const root = document.documentElement;

  function themeShowsVideo(v) {
    const own = v.classList.contains('hero-mark--basalt') ? 'theme-basalt'
      : v.classList.contains('hero-mark--parchment') ? 'theme-parchment' : null;
    const active = ['theme-basalt', 'theme-parchment'].find(c => root.classList.contains(c));
    return own ? own === active : !active;
  }

  function sync() {
    videos.forEach(v => {
      if (!themeShowsVideo(v)) {
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

// ══════════════════════════════════════════════════════════════════════════════
// ANCIENT GLYPHS — basalt and parchment are esoteric themes, so the cute emoji,
// hearts, flowers and sparkles become glyphs from ancient scripts (Egyptian
// hieroglyphs, runes, alchemical and planetary signs). This only wraps each
// one once: <span class="glyph-swap" data-ancient="𓆸"><span class="glyph-orig">🌸</span></span>.
// CSS decides what shows: the original everywhere, the ancient glyph in
// html.theme-basalt / html.theme-parchment. Runs over the whole page, so the
// generated gallery (data/gallery.json) needs no edits. ✕ window buttons and
// glyphs that are already ancient (☉ ☥ 𓂀, the lore) are not in the table.
// ══════════════════════════════════════════════════════════════════════════════
(function ancientGlyphs() {
  const ANCIENT = {
    '✦': '🜂',                                    // sparkle → fire rising (the lore's 🜂)
    '✨': '𓇼', '💫': '𓇼', '✶': '𓆼',             // stars → star N014, lotus-thousand M012
    '♡': '𓄣', '💕': '𓄣', '💌': '𓄣',             // hearts → ib, the heart F034
    '✿': '⧫',                                     // ornament flower → the forge lozenge (⟊⧫ cipher)
    '🌸': '𓆸', '🎀': '𓆸',                        // blossom, ribbon → lotus M009
    '📖': '𓏛', '📚': '𓏛', '✉': '𓏛',             // books, letter → papyrus roll Y001
    '📝': '𓏞',                                    // notes → scribe's kit Y003
    '🧠': '𓂀',                                    // focus → wedjat eye D010
    '🛡': 'ᛉ',                                     // privacy → algiz, rune of protection
    '🍎': '𓊽',                                    // Mac & iOS → djed pillar R011
    '🗣': '𓂋',                                    // language → mouth D021
    '🃏': '𓎆',                                    // flashcards → tally of ten V020
    '🌐': '🜨',                                    // web → alchemical verdigris
    '⚛': '☿',                                     // STEM → Mercury
    '🖨': '𓊮',                                    // 3D printer → brazier Q007
    '🔭': '𓇯',                                    // physics → sky N001
    '🧪': '🝪',                                    // lab → alembic
    '🌙': '☽',                                     // sleep → moon
    '🧩': 'ᛝ',                                     // extensions → ing rune
    '📊': '𓍝',                                    // dashboard → plumb level U038
    '🛋': '𓉐',                                    // a11y home → house O001
    '🍪': '𓏏',                                    // cookies → bread loaf X001
    '🧹': '𓂡',                                    // ad blocker → arm with stick D040
    '✂': '𓌪',                                    // link cleaner → knife T030
    '🚫': '𓂜',                                    // popup blocker → negation arms D035
    '🖱': '𓂧',                                    // cursor → hand D046
    '☕': '𓏊',                                    // coffee → jar W022
    '😎': '𓈗',                                    // cool → water N035 (the tagline's sign-off)
    '⏲': '𓇳',                                    // timer → sun disc N005
    '⏭': '𓂻',                                    // skip → walking legs D054
  };
  // Optional U+FE0F variation selector rides along with the emoji it follows.
  const re = new RegExp('(' + Object.keys(ANCIENT).join('|') + ')️?', 'gu');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement.closest('script, style, .lore') ? NodeFilter.FILTER_REJECT
      : (re.lastIndex = 0, re.test(n.nodeValue)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const frag = document.createDocumentFragment();
    let last = 0;
    node.nodeValue.replace(re, (match, key, at) => {
      frag.append(node.nodeValue.slice(last, at));
      const swap = document.createElement('span');
      swap.className = 'glyph-swap';
      swap.dataset.ancient = ANCIENT[key];
      const orig = document.createElement('span');
      orig.className = 'glyph-orig';
      orig.textContent = match;
      swap.append(orig);
      frag.append(swap);
      last = at + match.length;
    });
    frag.append(node.nodeValue.slice(last));
    node.replaceWith(frag);
  });
})();
