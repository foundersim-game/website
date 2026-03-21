// src/lib/audio.ts

export type SoundType = "click" | "popup" | "success" | "fail";

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
