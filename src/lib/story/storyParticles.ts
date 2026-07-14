// src/lib/story/storyParticles.ts
// ─────────────────────────────────────────────────────────────────────────────
// Lightweight CSS particle emitter for Story Mode.
// No canvas, no dependencies — pure DOM + CSS animations.
// Particles float up, rotate, and fade out.
// ─────────────────────────────────────────────────────────────────────────────

const STYLE_ID = "story-particles-style";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes story-particle-rise {
      0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
      80%  { opacity: 1; }
      100% { transform: translateY(-160px) rotate(720deg) scale(0.3); opacity: 0; }
    }
    .story-particle {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      animation: story-particle-rise linear forwards;
      will-change: transform, opacity;
      user-select: none;
      font-size: 18px;
      line-height: 1;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Burst emoji particles from a screen position.
 * @param emoji - The emoji character(s) to use as particles
 * @param count - Number of particles to spawn
 * @param x - Screen X origin (px)
 * @param y - Screen Y origin (px)
 * @param durationMs - How long each particle lives (default 1000ms)
 */
export function burstAt(
  emoji: string,
  count: number,
  x: number,
  y: number,
  durationMs = 1000
) {
  if (typeof document === "undefined") return;
  ensureStyles();

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "story-particle";
    el.textContent = emoji;

    const spread = 80;
    const offsetX = (Math.random() - 0.5) * spread;
    const offsetY = (Math.random() - 0.5) * (spread * 0.4);
    const delay = Math.random() * 200;
    const duration = durationMs + Math.random() * 300;

    el.style.left = `${x + offsetX}px`;
    el.style.top = `${y + offsetY}px`;
    el.style.animationDuration = `${duration}ms`;
    el.style.animationDelay = `${delay}ms`;
    el.style.opacity = "0"; // start invisible until delay fires
    el.style.fontSize = `${14 + Math.random() * 10}px`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), delay + duration + 100);
  }
}

/**
 * Burst particles from an HTML element's center position.
 * @param emoji - The emoji character(s)
 * @param count - Number of particles
 * @param sourceEl - The element to burst from
 */
export function burstFrom(
  emoji: string,
  count: number,
  sourceEl: HTMLElement,
  durationMs = 1000
) {
  const rect = sourceEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  burstAt(emoji, count, x, y, durationMs);
}

/**
 * Rain particles from the top of the screen (win/celebration).
 */
export function rainConfetti(count = 40, durationMs = 1800) {
  if (typeof document === "undefined") return;
  ensureStyles();

  const emojis = ["🏆", "⭐", "🎉", "✨", "💰", "🚀"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "story-particle";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const delay = Math.random() * 800;
    const duration = durationMs + Math.random() * 600;
    const x = Math.random() * window.innerWidth;

    el.style.left = `${x}px`;
    el.style.top = `${-20 + Math.random() * 40}px`;
    el.style.animationDuration = `${duration}ms`;
    el.style.animationDelay = `${delay}ms`;
    el.style.opacity = "0";

    document.body.appendChild(el);
    setTimeout(() => el.remove(), delay + duration + 100);
  }
}
