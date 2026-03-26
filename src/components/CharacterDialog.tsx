"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type CharacterDialogProps = {
    isOpen: boolean;
    character: "sam" | "chad";
    title: string;
    message: string;
    buttonText?: string;
    choiceA?: { label: string; description: string; onSelect: () => void };
    choiceB?: { label: string; description: string; onSelect: () => void };
    onDismiss: () => void;
};

const CHARACTER_CONFIG = {
    sam: {
        name: "Sam",
        role: "Startup Mentor",
        image: "/sam.png",
        panelFrom: "#0f172a",
        panelTo: "#1e3a5f",
        accent: "#3b82f6",
        badgeBg: "#1d4ed8",
        badgeText: "#bfdbfe",
        glowColor: "rgba(59,130,246,0.45)",
        borderColor: "rgba(59,130,246,0.3)",
        decorCircle1: "rgba(59,130,246,0.08)",
        decorCircle2: "rgba(99,102,241,0.12)",
        imageOffsetX: "-8px",
        // Sam: warm chime (play popup.wav at normal pitch)
        soundType: "sam" as const,
    },
    chad: {
        name: "Chad",
        role: "Core AI — Your Rival",
        image: "/chad.png",
        panelFrom: "#0a0a0a",
        panelTo: "#1a1a2e",
        accent: "#f97316",
        badgeBg: "#c2410c",
        badgeText: "#fed7aa",
        glowColor: "rgba(249,115,22,0.5)",
        borderColor: "rgba(249,115,22,0.35)",
        decorCircle1: "rgba(249,115,22,0.07)",
        decorCircle2: "rgba(239,68,68,0.1)",
        imageOffsetX: "-4px",
        soundType: "chad" as const,
    },
};

// ── Sound synthesis ───────────────────────────────────────────────────────────
function playChadEntrance() {
    if (typeof window === "undefined") return;
    const isMuted = localStorage.getItem("foundersim_sfx_muted") === "true";
    if (isMuted) return;
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Sharp downward sawtooth sweep — intimidating rival entrance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
        // Short impact click
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        const noise = ctx.createBufferSource();
        const ng = ctx.createGain();
        noise.buffer = buf;
        noise.connect(ng);
        ng.connect(ctx.destination);
        ng.gain.value = 0.12;
        noise.start(ctx.currentTime);
    } catch { /* silently ignore on browsers that block AudioContext */ }
}

function playSamEntrance() {
    if (typeof window === "undefined") return;
    const isMuted = localStorage.getItem("foundersim_sfx_muted") === "true";
    if (isMuted) return;
    try {
        // Use popup.wav if available, else synthesize a warm chime
        const audio = new Audio("/popup.wav");
        audio.volume = 0.55;
        audio.play().catch(() => {
            // Fallback: synthesized warm tone
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        });
    } catch { }
}

function playDismissSound() {
    if (typeof window === "undefined") return;
    const isMuted = localStorage.getItem("foundersim_sfx_muted") === "true";
    if (isMuted) return;
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch { }
}

// Shared AudioContext for typing ticks (avoids spawning one per character)
let _typeCtx: AudioContext | null = null;
function getTypeCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
        if (!_typeCtx || _typeCtx.state === "closed") {
            _typeCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return _typeCtx;
    } catch { return null; }
}

// Soft mechanical key-tap: white noise burst + very short sine click
function playTypeKey(character: "sam" | "chad") {
    if (typeof window === "undefined") return;
    const isMuted = localStorage.getItem("foundersim_sfx_muted") === "true";
    if (isMuted) return;
    const ctx = getTypeCtx();
    if (!ctx) return;
    try {
        // Noise click — 5ms burst
        const bufLen = Math.floor(ctx.sampleRate * 0.005);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        }
        const noise = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const ng = ctx.createGain();
        filter.type = "bandpass";
        filter.frequency.value = character === "chad" ? 2200 : 3000;
        filter.Q.value = 0.8;
        ng.gain.value = 0.045; // very subtle
        noise.buffer = buf;
        noise.connect(filter);
        filter.connect(ng);
        ng.connect(ctx.destination);
        noise.start(ctx.currentTime);
    } catch { }
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, isActive: boolean, character: "sam" | "chad", speed = 20) {
    const [displayed, setDisplayed] = useState("");
    const [done, setDone] = useState(false);
    const idx = useRef(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const reset = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        idx.current = 0;
        setDisplayed("");
        setDone(false);
    }, []);

    useEffect(() => {
        if (!isActive) { reset(); return; }
        idx.current = 0;
        setDisplayed("");
        setDone(false);

        const tick = () => {
            idx.current++;
            const ch = text[idx.current - 1];
            setDisplayed(text.slice(0, idx.current));
            // Tick sound for visible characters only (skip spaces & newlines)
            if (ch && ch !== " " && ch !== "\n") {
                playTypeKey(character);
            }
            if (idx.current < text.length) {
                timer.current = setTimeout(tick, speed);
            } else {
                setDone(true);
            }
        };
        // Small initial delay so card animation settles first
        timer.current = setTimeout(tick, 420);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [text, isActive, speed, reset, character]);

    // Skip to end on tap
    const skip = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        setDisplayed(text);
        setDone(true);
        idx.current = text.length;
    }, [text]);

    return { displayed, done, skip };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CharacterDialog({
    isOpen,
    character,
    title,
    message,
    buttonText = "GOT IT",
    choiceA,
    choiceB,
    onDismiss,
}: CharacterDialogProps) {
    const cfg = CHARACTER_CONFIG[character];
    const hasChoices = !!(choiceA && choiceB);
    const [isExiting, setIsExiting] = useState(false);

    // Typewriter for message only (title pops in instantly)
    const { displayed: displayedMsg, done: msgDone, skip } = useTypewriter(message, isOpen, character, 20);

    // Play entrance sound on open
    useEffect(() => {
        if (isOpen) {
            if (character === "chad") playChadEntrance();
            else playSamEntrance();
        }
    }, [isOpen, character]);

    const handleDismiss = useCallback(() => {
        if (!msgDone) { skip(); return; } // First tap: skip typewriter
        playDismissSound();
        setIsExiting(true);
        setTimeout(() => {
            setIsExiting(false);
            onDismiss();
        }, 300);
    }, [msgDone, skip, onDismiss]);

    const handleChoice = useCallback((fn: () => void) => {
        playDismissSound();
        fn();
        setIsExiting(true);
        setTimeout(() => { setIsExiting(false); onDismiss(); }, 300);
    }, [onDismiss]);

    // Card exit spring
    const cardVariants = {
        hidden: { y: "100%", opacity: 0 },
        visible: {
            y: 0, opacity: 1,
            transition: { type: "spring" as const, damping: 28, stiffness: 280 }
        },
        exit: {
            y: "110%", opacity: 0,
            transition: { type: "spring" as const, damping: 30, stiffness: 320, duration: 0.28 }
        },
    };

    return (
        <AnimatePresence>
            {isOpen && !isExiting && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{
                            position: "fixed", inset: 0, zIndex: 200,
                            background: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(5px)",
                        }}
                        onClick={handleDismiss}
                    />

                    {/* Card */}
                    <motion.div
                        key={`card-${character}`}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            position: "fixed",
                            bottom: 0, left: 0, right: 0,
                            zIndex: 201,
                            maxWidth: 480,
                            margin: "0 auto",
                            borderRadius: "28px 28px 0 0",
                            overflow: "hidden",
                            border: `1px solid ${cfg.borderColor}`,
                            boxShadow: `0 -12px 60px ${cfg.glowColor}, 0 0 0 1px ${cfg.borderColor}`,
                        }}
                    >
                        {/* ── Character panel ── */}
                        <div style={{
                            position: "relative",
                            height: 220,
                            background: `linear-gradient(165deg, ${cfg.panelFrom} 0%, ${cfg.panelTo} 100%)`,
                            overflow: "hidden",
                        }}>
                            {/* Decorative circles */}
                            <div style={{
                                position: "absolute", top: -60, right: -60,
                                width: 220, height: 220, borderRadius: "50%",
                                background: cfg.decorCircle2,
                            }} />
                            <div style={{
                                position: "absolute", bottom: 20, left: "42%",
                                width: 160, height: 160, borderRadius: "50%",
                                background: cfg.decorCircle1,
                            }} />

                            {/* Accent top line */}
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                                background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
                                opacity: 0.85,
                            }} />

                            {/* Character image — slides up from below */}
                            <motion.img
                                src={cfg.image}
                                alt={cfg.name}
                                initial={{ y: 50, opacity: 0, scale: 0.92 }}
                                animate={{ y: 0, opacity: 1, scale: 1.05 }}
                                transition={{ delay: 0.1, type: "spring", damping: 20, stiffness: 180 }}
                                style={{
                                    position: "absolute",
                                    bottom: -10,
                                    left: cfg.imageOffsetX,
                                    height: 245,
                                    width: "auto",
                                    objectFit: "contain",
                                    transformOrigin: "bottom left",
                                    pointerEvents: "none",
                                    userSelect: "none",
                                    filter: `drop-shadow(0 8px 28px ${cfg.glowColor})`,
                                }}
                                draggable={false}
                            />

                            {/* Name badge — slides in from right */}
                            <motion.div
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, type: "spring", damping: 22 }}
                                style={{
                                    position: "absolute", top: 16, right: 16,
                                    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4,
                                }}
                            >
                                <span style={{
                                    background: cfg.badgeBg,
                                    color: cfg.badgeText,
                                    fontSize: 10, fontWeight: 900,
                                    letterSpacing: "0.12em", textTransform: "uppercase",
                                    padding: "4px 12px", borderRadius: 99,
                                    boxShadow: `0 2px 16px ${cfg.glowColor}`,
                                }}>
                                    {cfg.name}
                                </span>
                                <span style={{
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: 9, fontWeight: 600,
                                    letterSpacing: "0.1em", textTransform: "uppercase",
                                }}>
                                    {cfg.role}
                                </span>
                            </motion.div>

                            {/* Bottom fade to white */}
                            <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0, height: 64,
                                background: "linear-gradient(to bottom, transparent, #ffffff)",
                            }} />
                        </div>

                        {/* ── Content panel ── */}
                        <div style={{ background: "#ffffff", padding: "14px 20px 24px" }}>

                            {/* Title — pops in with scale */}
                            <motion.p
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.22, type: "spring", damping: 18 }}
                                style={{
                                    fontSize: 13, fontWeight: 900,
                                    color: "#0f172a",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    marginBottom: 8,
                                }}
                            >
                                {title}
                            </motion.p>

                            {/* Message — typewriter */}
                            <div
                                onClick={skip}
                                style={{ cursor: msgDone ? "default" : "pointer", marginBottom: 16 }}
                            >
                                <p style={{
                                    fontSize: 13, color: "#475569",
                                    lineHeight: 1.65, whiteSpace: "pre-line",
                                    minHeight: 52,
                                }}>
                                    {displayedMsg}
                                    {/* Blinking cursor while typing */}
                                    {!msgDone && (
                                        <motion.span
                                            animate={{ opacity: [1, 0, 1] }}
                                            transition={{ repeat: Infinity, duration: 0.7 }}
                                            style={{
                                                display: "inline-block",
                                                width: 2, height: 13,
                                                background: cfg.accent,
                                                marginLeft: 2,
                                                borderRadius: 1,
                                                verticalAlign: "middle",
                                            }}
                                        />
                                    )}
                                </p>
                                {!msgDone && (
                                    <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, letterSpacing: "0.06em" }}>
                                        TAP TO SKIP
                                    </p>
                                )}
                            </div>

                            {/* Choices / dismiss — fade in after typing done */}
                            <AnimatePresence>
                                {msgDone && (
                                    <motion.div
                                        key="actions"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", damping: 22, stiffness: 240 }}
                                    >
                                        {hasChoices ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                <button
                                                    onClick={() => handleChoice(choiceA!.onSelect)}
                                                    style={{
                                                        width: "100%", textAlign: "left",
                                                        padding: "12px 16px", borderRadius: 16,
                                                        border: "2px solid #3b82f6",
                                                        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <p style={{ fontSize: 11, fontWeight: 900, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                                                        {choiceA!.label}
                                                    </p>
                                                    <p style={{ fontSize: 11, color: "#3b82f6" }}>{choiceA!.description}</p>
                                                </button>
                                                <button
                                                    onClick={() => handleChoice(choiceB!.onSelect)}
                                                    style={{
                                                        width: "100%", textAlign: "left",
                                                        padding: "12px 16px", borderRadius: 16,
                                                        border: "2px solid #f97316",
                                                        background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <p style={{ fontSize: 11, fontWeight: 900, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                                                        {choiceB!.label}
                                                    </p>
                                                    <p style={{ fontSize: 11, color: "#ea580c" }}>{choiceB!.description}</p>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleDismiss}
                                                style={{
                                                    width: "100%", height: 50,
                                                    borderRadius: 16, border: "none",
                                                    background: `linear-gradient(135deg, ${cfg.accent} 0%, ${cfg.accent}bb 100%)`,
                                                    color: "#fff",
                                                    fontSize: 12, fontWeight: 900,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.1em",
                                                    cursor: "pointer",
                                                    boxShadow: `0 4px 20px ${cfg.glowColor}`,
                                                }}
                                            >
                                                {buttonText}
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
