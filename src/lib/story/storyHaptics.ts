// src/lib/story/storyHaptics.ts
// ─────────────────────────────────────────────────────────────────────────────
// Haptic feedback wrapper for Story Mode.
// Uses @capacitor/haptics — works on iOS and Android native builds.
// All calls are wrapped in try/catch so they silently fail on web/desktop.
// ─────────────────────────────────────────────────────────────────────────────

let _hapticsMod: typeof import("@capacitor/haptics") | null = null;

async function getHaptics() {
  if (_hapticsMod) return _hapticsMod;
  try {
    _hapticsMod = await import("@capacitor/haptics");
    return _hapticsMod;
  } catch {
    return null;
  }
}

export const haptic = {
  /** Light tap — choice button press, typewriter start */
  light: async () => {
    try {
      const h = await getHaptics();
      await h?.Haptics.impact({ style: h.ImpactStyle.Light });
    } catch {}
  },

  /** Medium tap — month advance, card pick */
  medium: async () => {
    try {
      const h = await getHaptics();
      await h?.Haptics.impact({ style: h.ImpactStyle.Medium });
    } catch {}
  },

  /** Heavy tap — mini-game perfect hit, S-rank reveal */
  heavy: async () => {
    try {
      const h = await getHaptics();
      await h?.Haptics.impact({ style: h.ImpactStyle.Heavy });
    } catch {}
  },

  /** Success pattern — win screen, pitch deck success */
  success: async () => {
    try {
      const h = await getHaptics();
      await h?.Haptics.notification({ type: h.NotificationType.Success });
    } catch {}
  },

  /** Warning pattern — negative event outcome, low score */
  warning: async () => {
    try {
      const h = await getHaptics();
      await h?.Haptics.notification({ type: h.NotificationType.Warning });
    } catch {}
  },

  /** Error pattern — game over, locked choice tap */
  error: async () => {
    try {
      const h = await getHaptics();
      await h?.Haptics.notification({ type: h.NotificationType.Error });
    } catch {}
  },

  /** Victory rumble — triple success with 200ms gaps (win screen) */
  victoryRumble: async () => {
    try {
      const h = await getHaptics();
      if (!h) return;
      await h.Haptics.notification({ type: h.NotificationType.Success });
      setTimeout(() => h.Haptics.notification({ type: h.NotificationType.Success }), 200);
      setTimeout(() => h.Haptics.notification({ type: h.NotificationType.Success }), 400);
    } catch {}
  },
};
