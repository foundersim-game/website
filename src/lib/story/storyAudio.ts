// src/lib/story/storyAudio.ts
// ─────────────────────────────────────────────────────────────────────────────
// Centralized audio engine for Story Mode.
// Uses Web Audio API — no third-party library needed.
// All WAV assets are already in /public.
// Programmatic sounds generated via OscillatorNode (no extra files).
// ─────────────────────────────────────────────────────────────────────────────

type WavKey = "click" | "success" | "fail" | "popup";

const wavCache: Record<string, AudioBuffer> = {};
let _ctx: AudioContext | null = null;
let _muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      _ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return _ctx;
}

async function ensureResumed(ac: AudioContext) {
  if (ac.state === "suspended") {
    try { await ac.resume(); } catch {}
  }
}

// ── WAV loader ────────────────────────────────────────────────────────────────
export async function playWav(
  key: WavKey,
  options: { volume?: number; rate?: number } = {}
) {
  if (_muted) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    await ensureResumed(ac);

    if (!wavCache[key]) {
      const res = await fetch(`/${key}.wav`);
      const buf = await res.arrayBuffer();
      wavCache[key] = await ac.decodeAudioData(buf);
    }

    const src = ac.createBufferSource();
    const gain = ac.createGain();
    src.buffer = wavCache[key];
    src.playbackRate.value = options.rate ?? 1;
    gain.gain.value = options.volume ?? 0.55;
    src.connect(gain);
    gain.connect(ac.destination);
    src.start();
  } catch {
    // Silent fail
  }
}

// ── Programmatic sounds (no extra WAV files needed) ───────────────────────────

/** Short coin-tick — used for metric change animations */
export function playCoinTick(volume = 0.25) {
  if (_muted) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.06);
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.1);
  } catch {}
}

/** Whoosh — used for card swipe / fast transitions */
export function playWhoosh(volume = 0.35) {
  if (_muted) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    const bufferSize = Math.floor(ac.sampleRate * 0.25);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ac.createBufferSource();
    source.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2000, ac.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.25);
    filter.Q.value = 0.5;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    source.start();
  } catch {}
}

/** Level-up arpeggio — used for S-rank, win screen */
export function playLevelUp(volume = 0.45) {
  if (_muted) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      const t = ac.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {}
}

/** Heartbeat — used during month advance loading pulse */
export function playHeartbeat(volume = 0.3) {
  if (_muted) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    const ctx = ac; // capture for nested function

    function beat(delay: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 80;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    }

    beat(0);
    beat(0.18);
  } catch {}
}

/** Shake/error buzzer — for locked choice taps */
export function playError(volume = 0.3) {
  if (_muted) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.15);
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.2);
  } catch {}
}

/** Typing tick — very quiet, used for typewriter text */
export function playTypeTick() {
  if (_muted) return;
  try {
    const ac = getCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.value = 800 + Math.random() * 200;
    gain.gain.setValueAtTime(0.04, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.05);
  } catch {}
}

// ── Ambient music layer ───────────────────────────────────────────────────────
let ambientNodes: { osc: OscillatorNode; lfo: OscillatorNode }[] = [];

const ACT_FREQS: Record<number, number[]> = {
  1: [110, 165],         // sparse, low
  2: [130, 196, 261],    // building
  3: [146, 220, 293],    // tense
  4: [174, 261, 349],    // full, triumphant
};

export function startAmbient(act: 1 | 2 | 3 | 4) {
  if (_muted) return;
  stopAmbient();
  try {
    const ac = getCtx();
    if (!ac) return;

    const freqs = ACT_FREQS[act] ?? ACT_FREQS[1];
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const lfo = ac.createOscillator();
      const lfoGain = ac.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      lfo.type = "sine";
      lfo.frequency.value = 0.05 + i * 0.03;
      lfoGain.gain.value = 3;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.04 - i * 0.01, ac.currentTime + 3);

      osc.connect(gain);
      gain.connect(ac.destination);
      lfo.start();
      osc.start();

      ambientNodes.push({ osc, lfo });
    });
  } catch {}
}

export function stopAmbient(fadeSecs = 1.5) {
  try {
    const ac = getCtx();
    if (!ac) return;
    const t = ac.currentTime;
    ambientNodes.forEach(({ osc, lfo }) => {
      try {
        osc.stop(t + fadeSecs + 0.1);
        lfo.stop(t + fadeSecs + 0.1);
      } catch {}
    });
    ambientNodes = [];
  } catch {}
}

// ── Mute toggle ───────────────────────────────────────────────────────────────
export function setMuted(muted: boolean) {
  _muted = muted;
  if (muted) stopAmbient(0.3);
  if (typeof window !== "undefined") {
    localStorage.setItem("story_muted", muted ? "1" : "0");
  }
}

export function isMuted(): boolean {
  if (typeof window !== "undefined") {
    _muted = localStorage.getItem("story_muted") === "1";
  }
  return _muted;
}
