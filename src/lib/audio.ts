// src/lib/audio.ts

export type SoundType = "click" | "popup" | "success" | "fail";
export type SynthSoundType = "ui_tap" | "ui_select" | "ui_step" | "ui_back" | "ui_launch" | "ui_open" | "ui_delete";

const SOUND_URLS: Record<SoundType, string> = {
    click: "/click.wav",
    popup: "/popup.wav",
    success: "/success.wav",
    fail: "/fail.wav",
};

// Simple Audio cache to prevent re-fetching and allow overlapping plays
const audioCache: Partial<Record<SoundType, HTMLAudioElement>> = {};

export function playSound(type: SoundType) {
    if (typeof window === "undefined") return;

    // Check mute state from localStorage
    const isMuted = localStorage.getItem("foundersim_sfx_muted") === "true";
    if (isMuted) return;

    try {
        if (!audioCache[type]) {
            audioCache[type] = new Audio(SOUND_URLS[type]);
        }
        
        // Clone the node so we can play overlapping sounds (e.g., rapid clicking)
        const audioNode = audioCache[type]!.cloneNode() as HTMLAudioElement;
        audioNode.volume = type === "click" ? 0.3 : 0.6; // Adjust volume individually as needed
        audioNode.play().catch((e) => {
            // Browsers may block autoplay without user interaction, catch and ignore
            console.debug("Audio play prevented:", e);
        });
    } catch (error) {
        console.debug("Error playing sound:", error);
    }
}

export function isAudioMuted(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("foundersim_sfx_muted") === "true";
}

export function toggleAudioMute(): boolean {
    if (typeof window === "undefined") return false;
    const currentMute = localStorage.getItem("foundersim_sfx_muted") === "true";
    const newMute = !currentMute;
    localStorage.setItem("foundersim_sfx_muted", newMute.toString());
    return newMute;
}

// ─── Synthesized UI Sounds (Web Audio API — no file dependencies) ────────────
let _synthCtx: AudioContext | null = null;
function getSynthCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!_synthCtx) {
        try { _synthCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
    }
    return _synthCtx;
}

export function playSynthSound(type: SynthSoundType) {
    if (typeof window === "undefined") return;
    const isMuted = localStorage.getItem("foundersim_sfx_muted") === "true";
    if (isMuted) return;

    const ctx = getSynthCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    const beep = (freq: number, startTime: number, duration: number, vol: number, oscType: OscillatorType = "sine") => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.01);
    };

    try {
        switch (type) {
            case "ui_tap":
                // Short soft click — card/option tap
                beep(380, now, 0.07, 0.15);
                break;
            case "ui_select":
                // Bright confirm — option chosen
                beep(520, now, 0.05, 0.16);
                beep(780, now + 0.05, 0.08, 0.13);
                break;
            case "ui_step":
                // Upward two-tone — advance wizard step
                beep(440, now, 0.07, 0.17);
                beep(660, now + 0.07, 0.10, 0.15);
                break;
            case "ui_back":
                // Downward tick — go back
                beep(440, now, 0.05, 0.12);
                beep(300, now + 0.05, 0.08, 0.09);
                break;
            case "ui_launch":
                // Rocket ascent chord — Launch Startup
                beep(330, now, 0.10, 0.18);
                beep(493, now + 0.09, 0.10, 0.18);
                beep(659, now + 0.18, 0.12, 0.18);
                beep(880, now + 0.26, 0.24, 0.20);
                break;
            case "ui_open":
                // Soft whoosh — modal/overlay opens
                beep(260, now, 0.04, 0.10);
                beep(380, now + 0.04, 0.09, 0.11);
                break;
            case "ui_delete":
                // Low thud — destructive action
                beep(180, now, 0.06, 0.18, "triangle");
                beep(120, now + 0.06, 0.11, 0.13, "triangle");
                break;
        }
    } catch {
        // Silently ignore audio errors
    }
}
