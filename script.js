// LoveSpark — script.js
// Sparkle field, mouse trail, binary spiral canvas.
'use strict';

// ══════════════════════════════════════════════════════════════════════════════
// BINARY SPIRAL
// ══════════════════════════════════════════════════════════════════════════════

(function initSpiral() {
  const canvas = document.getElementById('spiral-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, animFrame;

  // Each arm segment: {angle, radius, char, glitch, glitchTimer}
  const ARMS = 4;
  const STEPS_PER_ARM = 60;
  const CHAR_SPACING = 18; // px between chars along the arm
  const SPIRAL_TIGHTNESS = 0.18; // radians per step

  const segments = [];

  function buildSegments() {
    segments.length = 0;
    for (let arm = 0; arm < ARMS; arm++) {
      const armOffset = (arm / ARMS) * Math.PI * 2;
      for (let s = 0; s < STEPS_PER_ARM; s++) {
        const angle  = armOffset + s * SPIRAL_TIGHTNESS;
        const radius = s * CHAR_SPACING * 0.55;
        segments.push({
          angle,
          radius,
          char: Math.random() > 0.5 ? '1' : '0',
          opacity: 0.3 + Math.random() * 0.7,
          glitchTimer: Math.random() * 120 | 0,
          glitchInterval: (40 + Math.random() * 120) | 0,
        });
      }
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  let rotation = 0;
  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;

    ctx.font = '11px "DM Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const seg of segments) {
      // Glitch: occasionally flip bit
      seg.glitchTimer++;
      if (seg.glitchTimer >= seg.glitchInterval) {
        seg.char = seg.char === '0' ? '1' : '0';
        seg.glitchTimer = 0;
        seg.glitchInterval = (40 + Math.random() * 120) | 0;
        seg.opacity = 0.2 + Math.random() * 0.8;
      }

      const a = seg.angle + rotation;
      const x = cx + Math.cos(a) * seg.radius;
      const y = cy + Math.sin(a) * seg.radius;

      // Fade based on radius (inner bright, outer dim)
      const distFade = 1 - seg.radius / (STEPS_PER_ARM * CHAR_SPACING * 0.55);
      const alpha = seg.opacity * Math.max(0.1, distFade) * 0.9;

      // Alternate purple / pink
      const usesPurple = (seg.radius / 30 + seg.angle) % 2 > 1;
      ctx.fillStyle = usesPurple
        ? `rgba(192, 132, 252, ${alpha})`
        : `rgba(255, 110, 180, ${alpha})`;

      ctx.fillText(seg.char, x, y);
    }

    rotation += 0.0012;
    frame++;
    animFrame = requestAnimationFrame(draw);
  }

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      animFrame = requestAnimationFrame(draw);
    }
  });

  resize();
  buildSegments();
  draw();
  window.addEventListener('resize', () => { resize(); buildSegments(); });
})();

// ══════════════════════════════════════════════════════════════════════════════
// STATIC SPARKLE FIELD
// Scattered ✦ ★ ♡ ✿ that twinkle independently at fixed positions.
// ══════════════════════════════════════════════════════════════════════════════

(function initSparkleField() {
  const field  = document.getElementById('sparkle-field');
  if (!field) return;

  const GLYPHS  = ['✦', '★', '♡', '✿', '✦', '✦', '★'];
  const COUNT   = 55;

  for (let i = 0; i < COUNT; i++) {
    const el  = document.createElement('span');
    el.className = 'spark';
    el.textContent = GLYPHS[i % GLYPHS.length];

    const x    = Math.random() * 100;
    const y    = Math.random() * 100;
    const dur  = (2 + Math.random() * 4).toFixed(2);
    const del  = (Math.random() * 5).toFixed(2);
    const size = 8 + Math.random() * 10;

    // Purple sparkles ~25% of the time
    const color = Math.random() > 0.75 ? '#c084fc' : '#ff6eb4';

    el.style.cssText = `
      left: ${x}%;
      top:  ${y}%;
      font-size: ${size}px;
      color: ${color};
      --dur: ${dur}s;
      --delay: -${del}s;
      text-shadow: 0 0 6px ${color};
    `;

    field.appendChild(el);
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// CURSOR SPARKLE TRAIL
// Small glyphs burst from cursor position, float up and fade.
// ══════════════════════════════════════════════════════════════════════════════

(function initCursorTrail() {
  const container = document.getElementById('cursor-sparks');
  if (!container) return;

  const GLYPHS   = ['✦', '★', '♡', '✿', '*', '·'];
  const COLORS   = ['#ff6eb4', '#ffb3d9', '#c084fc', '#fff5f9'];
  let   lastTime = 0;
  const THROTTLE = 50; // ms between spawns

  function spawnSpark(x, y) {
    const el    = document.createElement('span');
    el.className = 'cursor-spark';
    el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    const dx = (Math.random() - 0.5) * 60;
    const dy = -(20 + Math.random() * 50);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size  = 8 + Math.random() * 8;

    el.style.cssText = `
      left: ${x}px;
      top:  ${y}px;
      font-size: ${size}px;
      color: ${color};
      --dx: ${dx.toFixed(0)}px;
      --dy: ${dy.toFixed(0)}px;
      text-shadow: 0 0 6px ${color};
    `;

    container.appendChild(el);

    // Remove after animation
    el.addEventListener('animationend', () => el.remove());
  }

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTime < THROTTLE) return;
    lastTime = now;
    spawnSpark(e.clientX, e.clientY);
  });
})();

// ══════════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL (hero CTA)
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
// WIN98 CARD CLOSE BUTTON — small easter egg: card wobbles, doesn't close
// ══════════════════════════════════════════════════════════════════════════════

document.querySelectorAll('.win-btn-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.win98-card');
    if (!card) return;
    card.style.animation = 'none';
    card.offsetHeight; // force reflow
    card.style.animation = 'cardWobble 0.4s ease';
    card.addEventListener('animationend', () => {
      card.style.animation = '';
    }, { once: true });
  });
});

// Inject wobble keyframe
const wobbleStyle = document.createElement('style');
wobbleStyle.textContent = `
  @keyframes cardWobble {
    0%   { transform: translate(-3px, -4px) rotate(0deg); }
    20%  { transform: translate(-3px, -4px) rotate(-2deg); }
    40%  { transform: translate(-3px, -4px) rotate(2deg);  }
    60%  { transform: translate(-3px, -4px) rotate(-1deg); }
    80%  { transform: translate(-3px, -4px) rotate(1deg);  }
    100% { transform: translate(-3px, -4px) rotate(0deg);  }
  }
`;
document.head.appendChild(wobbleStyle);
