// LoveSpark — bubble gum Y2K script.
// Sparkle field, cursor trail, smooth scroll, card-close wobble easter egg.
'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// STATIC SPARKLE FIELD — twinkles scattered across the page
// ══════════════════════════════════════════════════════════════════════════════
(function initSparkleField() {
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

  // Inject the twinkle keyframe (kept here so styles.css stays component-focused)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkleTwinkle {
      0%, 100% { opacity: 0.15; transform: scale(0.7); }
      50%      { opacity: 1;    transform: scale(1.15); }
    }
  `;
  document.head.appendChild(style);
})();

// ══════════════════════════════════════════════════════════════════════════════
// CURSOR SPARK TRAIL — small glyphs burst from cursor, drift up, fade
// ══════════════════════════════════════════════════════════════════════════════
(function initCursorTrail() {
  const container = document.getElementById('cursor-sparks');
  if (!container) return;

  const GLYPHS = ['✦', '★', '♡', '⋆', '✧'];
  const COLORS = ['#FF4FB3', '#FFB3D9', '#FFF5B5', '#C5E1FF'];
  const THROTTLE = 60;
  let lastTime = 0;

  function spawnSpark(x, y) {
    const el = document.createElement('span');
    el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    const dx = (Math.random() - 0.5) * 50;
    const dy = -(20 + Math.random() * 40);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = 9 + Math.random() * 7;

    el.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      font-size: ${size}px;
      color: ${color};
      text-shadow: 0 0 6px ${color};
      --dx: ${dx.toFixed(0)}px;
      --dy: ${dy.toFixed(0)}px;
      animation: cursorSparkFly 800ms ease-out forwards;
    `;
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTime < THROTTLE) return;
    lastTime = now;
    spawnSpark(e.clientX, e.clientY);
  });

  // Inject the fly keyframe — uses CSS custom props for direction
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cursorSparkFly {
      0%   { transform: translate(0, 0) scale(0.6); opacity: 1; }
      100% { transform: translate(var(--dx, 0), var(--dy, -30px)) scale(1.4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ══════════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL — hero CTA "See the tools ✦" anchors to the suite
// ══════════════════════════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// CARD CLOSE BUTTON — easter egg: card wobbles instead of closing
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
const wobbleStyle = document.createElement('style');
wobbleStyle.textContent = `
  @keyframes cardWobble {
    0%   { transform: translateY(-4px) rotate(-0.4deg); }
    25%  { transform: translateY(-4px) rotate(2deg); }
    50%  { transform: translateY(-4px) rotate(-2deg); }
    75%  { transform: translateY(-4px) rotate(1deg); }
    100% { transform: translateY(-4px) rotate(-0.4deg); }
  }
`;
document.head.appendChild(wobbleStyle);
