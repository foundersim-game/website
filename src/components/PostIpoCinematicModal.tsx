import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { playSound } from "../lib/audio";

interface PostIpoCinematicModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

const DIALOGUE_STEPS = [
    {
        text: "You made it. Ringing that bell is the dream.",
        subtext: "But take a breath, because the game just changed.",
    },
    {
        text: "Private markets forgive. Public markets punish.",
        subtext: "Every quarter, Wall Street will grade your existence. Miss your numbers, and the activist sharks will circle.",
    },
    {
        text: "You're no longer just an operator. You're a capital allocator.",
        subtext: "Stock splits, margin loans, lobbying, hostile takeovers... Welcome to the big leagues.",
    },
    {
        text: "Let me show you your new command center.",
        subtext: "Welcome to the Founder Terminal.",
    }
];

// Warm, low-frequency ambient pad chord frequencies (Pure sine waves only for cinematic hum)
const CHORDS = [
    [110.00, 164.81, 220.00, 329.63], // A2, E3, A3, E4
    [87.31, 130.81, 174.61, 261.63],  // F2, C3, F3, C4
    [65.41, 130.81, 196.00, 261.63],  // C2, C3, G3, C4
    [98.00, 146.83, 196.00, 293.66]   // G2, D3, G3, D4
];

export function PostIpoCinematicModal({ isOpen, onComplete }: PostIpoCinematicModalProps) {
    const [step, setStep] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    
    // Typewriter state
    const [displayedTitle, setDisplayedTitle] = useState("");
    const [displayedSubtext, setDisplayedSubtext] = useState("");
    const [titleDone, setTitleDone] = useState(false);
    const [subtextDone, setSubtextDone] = useState(false);
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const nodesRef = useRef<{ oscillators: OscillatorNode[]; gainNodes: GainNode[]; filter: BiquadFilterNode } | null>(null);
    const currentChordIndexRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Audio SFX tick synthesizer
    const playTick = () => {
        if (isMuted || !audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
        try {
            const ctx = audioCtxRef.current;
            const now = ctx.currentTime;
            
            // Ultra-subtle keyboard typing tap (white noise burst)
            const bufLen = Math.floor(ctx.sampleRate * 0.002);
            const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufLen; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen) * 0.02;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buf;
            
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.value = 3000;
            filter.Q.value = 1.0;
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.015, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.002);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
        } catch {}
    };

    // Synthesize Bell Chime for IPO opening celebratory hit
    const playIPOBell = (ctx: AudioContext) => {
        if (isMuted || !ctx) return;
        try {
            const now = ctx.currentTime;
            
            // Trigger standard success chime
            playSound("success");

            // Superimpose a ringing metallic bell
            const frequencies = [587.33, 880.00, 1174.66, 1318.51, 1567.98];
            frequencies.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const oscGain = ctx.createGain();
                
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now);
                
                // Ringing decay
                const vol = 0.04 - (idx * 0.008);
                const decay = 2.5 - (idx * 0.3);
                
                oscGain.gain.setValueAtTime(vol, now);
                oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
                
                osc.connect(oscGain);
                oscGain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + decay);
            });
        } catch {}
    };

    // Initialize Ambient Pad Synth
    const initAmbientSynth = () => {
        try {
            if (audioCtxRef.current) return;
            
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtxClass();
            audioCtxRef.current = ctx;
            
            // Play initial celebratory bell chime
            playIPOBell(ctx);

            // Setup main lowpass filter for warm analog feel
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 350; // Extra dark filter to cut harsh high-end
            filter.Q.value = 1.0;
            
            const mainGain = ctx.createGain();
            mainGain.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);
            
            filter.connect(mainGain);
            mainGain.connect(ctx.destination);
            
            const oscs: OscillatorNode[] = [];
            const gains: GainNode[] = [];
            
            // We play 4 oscillators for warm, deep ambient sine wave drones
            for (let i = 0; i < 4; i++) {
                const osc = ctx.createOscillator();
                osc.type = "sine"; // Pure sines only for zero harshness!
                
                const oscGain = ctx.createGain();
                oscGain.gain.setValueAtTime(0, ctx.currentTime);
                
                osc.connect(oscGain);
                oscGain.connect(filter);
                
                oscs.push(osc);
                gains.push(oscGain);
                
                osc.start();
            }
            
            nodesRef.current = { oscillators: oscs, gainNodes: gains, filter };
            
            // Set first chord
            playChord(0);
            
            // Setup infinite chord rotation loop
            intervalRef.current = setInterval(() => {
                const nextIndex = (currentChordIndexRef.current + 1) % CHORDS.length;
                currentChordIndexRef.current = nextIndex;
                playChord(nextIndex);
            }, 8000); // Shift chords every 8s
            
        } catch (e) {
            console.error("Ambient pad error:", e);
        }
    };

    // Play/crossfade to a specific chord
    const playChord = (chordIndex: number) => {
        const nodes = nodesRef.current;
        const ctx = audioCtxRef.current;
        if (!nodes || !ctx) return;
        
        const frequencies = CHORDS[chordIndex];
        const now = ctx.currentTime;
        
        nodes.gainNodes.forEach((gainNode, i) => {
            const osc = nodes.oscillators[i];
            const targetFreq = frequencies[i];
            
            if (osc && targetFreq) {
                // 1. Gently slide oscillator frequency to new pitch (Portamento)
                osc.frequency.setTargetAtTime(targetFreq, now, 1.5);
                
                // 2. Volume envelope cross-fade (Extremely soft volume for background hum)
                const targetVolume = isMuted ? 0 : 0.02 + (Math.random() * 0.01);
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.linearRampToValueAtTime(targetVolume, now + 3.0); // 3-second crossfade
            }
        });
    };

    // Stop all synthesis
    const stopAmbientSynth = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (nodesRef.current) {
            nodesRef.current.oscillators.forEach(osc => {
                try { osc.stop(); } catch {}
            });
        }
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close(); } catch {}
        }
        audioCtxRef.current = null;
        nodesRef.current = null;
    };

    // Reset and trigger whenever modal is opened
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setTitleDone(false);
            setSubtextDone(false);
            setDisplayedTitle("");
            setDisplayedSubtext("");
            
            // Respect mute options on launch
            const mute = localStorage.getItem("foundersim_sfx_muted") === "true";
            setIsMuted(mute);
            
            // Start audio on mount (requires previous user interaction, which is guaranteed because they clicked "Go Public")
            setTimeout(() => {
                initAmbientSynth();
            }, 100);
        }
        
        return () => {
            stopAmbientSynth();
        };
    }, [isOpen]);

    // Handle mute state toggle
    const toggleMute = () => {
        const nextMute = !isMuted;
        setIsMuted(nextMute);
        localStorage.setItem("foundersim_sfx_muted", nextMute.toString());
        
        // Update currently active notes immediately
        const nodes = nodesRef.current;
        const ctx = audioCtxRef.current;
        if (nodes && ctx) {
            const now = ctx.currentTime;
            nodes.gainNodes.forEach(gainNode => {
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.linearRampToValueAtTime(nextMute ? 0 : 0.03, now + 0.5);
            });
        }
    };

    // Dialogue text typewriter effect
    useEffect(() => {
        if (!isOpen) return;
        
        const text = DIALOGUE_STEPS[step].text;
        const subtext = DIALOGUE_STEPS[step].subtext;
        
        setTitleDone(false);
        setSubtextDone(false);
        setDisplayedTitle("");
        setDisplayedSubtext("");
        
        let titleIndex = 0;
        let subIndex = 0;
        let titleTimer: ReturnType<typeof setInterval>;
        let subtextTimer: ReturnType<typeof setInterval>;
        
        // Use slice instead of append to prevent react concurrent batching/undefined bugs!
        titleTimer = setInterval(() => {
            titleIndex++;
            if (titleIndex <= text.length) {
                setDisplayedTitle(text.slice(0, titleIndex));
                if (titleIndex % 2 === 0) playTick();
            } else {
                setTitleDone(true);
                clearInterval(titleTimer);
                
                // Trigger subtext after a brief delay
                setTimeout(() => {
                    subtextTimer = setInterval(() => {
                        subIndex++;
                        if (subIndex <= subtext.length) {
                            setDisplayedSubtext(subtext.slice(0, subIndex));
                            if (subIndex % 3 === 0) playTick();
                        } else {
                            setSubtextDone(true);
                            clearInterval(subtextTimer);
                        }
                    }, 15);
                }, 300);
            }
        }, 25);
        
        return () => {
            clearInterval(titleTimer);
            clearInterval(subtextTimer);
        };
    }, [step, isOpen]);

    if (!isOpen) return null;

    const skipTypewriter = () => {
        if (!titleDone || !subtextDone) {
            setDisplayedTitle(DIALOGUE_STEPS[step].text);
            setDisplayedSubtext(DIALOGUE_STEPS[step].subtext);
            setTitleDone(true);
            setSubtextDone(true);
        }
    };

    const handleInteraction = () => {
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume().catch(() => {});
        }
        skipTypewriter();
    };

    const nextStep = () => {
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume().catch(() => {});
        }
        if (!titleDone || !subtextDone) {
            skipTypewriter();
            return;
        }
        
        if (step < DIALOGUE_STEPS.length - 1) {
            if (!isMuted) playSound("click");
            setStep(prev => prev + 1);
        } else {
            stopAmbientSynth();
            onComplete();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8 }}
                onClick={handleInteraction}
                className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none cursor-pointer"
            >
                {/* ── CINEMATIC NEBULA AMBIENT GRADIENTS ── */}
                <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            x: ["-20%", "-10%", "-20%"],
                            y: ["-20%", "-30%", "-20%"]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-0 w-[80vw] h-[80vw] rounded-full bg-indigo-500/10 blur-[130px]" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1.1, 0.9, 1.1],
                            rotate: [0, -90, 0],
                            x: ["30%", "20%", "30%"],
                            y: ["40%", "30%", "40%"]
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-0 right-0 w-[90vw] h-[90vw] rounded-full bg-violet-600/15 blur-[150px]" 
                    />
                </div>

                {/* ── DRAPING GLOWING PARTICLES ── */}
                <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ 
                                x: Math.random() * 100 + "vw", 
                                y: "110vh", 
                                opacity: 0, 
                                scale: 0.3 + Math.random() * 0.8 
                            }}
                            animate={{ 
                                y: "-10vh",
                                opacity: [0, 0.7, 0],
                                x: [null, `calc(${Math.random() * 100}vw + ${Math.sin(i) * 50}px)`]
                            }}
                            transition={{ 
                                duration: 14 + Math.random() * 10, 
                                repeat: Infinity, 
                                delay: i * 0.6,
                                ease: "easeInOut"
                            }}
                            className="absolute size-2 rounded-full bg-indigo-400/40 blur-[1px]"
                        />
                    ))}
                </div>

                {/* ── CONTROLS: Mute Button ── */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                    }}
                    className="absolute top-6 right-6 z-50 w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/15 hover:text-white transition-all active:scale-90"
                    aria-label="Toggle cinematic music"
                >
                    {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 animate-pulse" />}
                </button>

                {/* ── MAIN CINEMATIC PRESENTATION ── */}
                <div className="max-w-2xl w-full text-center flex flex-col items-center justify-center min-h-[70vh] px-6 relative z-10">
                    
                    {/* Glowing Accent Star */}
                    <div className="absolute -top-16 z-0 opacity-40">
                        <motion.div
                            animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="text-amber-400/30 blur-[2px]"
                        >
                            <Sparkles className="size-36" />
                        </motion.div>
                    </div>

                    {/* Sam's Large Transparent Avatar (No circle crop, floating Visual-Novel style!) */}
                    <div className="relative mb-4 shrink-0 z-10 flex flex-col items-center">
                        {/* Glow halo behind Sam */}
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[40px] w-64 h-64 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none animate-pulse" />
                        
                        <motion.div
                            key={`avatar-${step}`}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ 
                                opacity: 1, 
                                y: 0, 
                                scale: 1,
                                // Subtle breathing effect
                                transition: { type: "spring", damping: 15 }
                            }}
                            className="relative w-64 h-64 flex items-end justify-center"
                        >
                            <img 
                                src="/sam.png" 
                                alt="Sam" 
                                className="h-full w-auto object-contain select-none pointer-events-none drop-shadow-[0_10px_30px_rgba(99,102,241,0.35)]" 
                                draggable={false}
                            />
                        </motion.div>
                        
                        {/* Glowing Mentor Tag */}
                        <div className="absolute -bottom-1 bg-indigo-600 border border-indigo-400/40 rounded-full px-5 py-1.5 flex items-center gap-1.5 shadow-lg">
                            <Sparkles className="size-3 text-amber-300 animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] leading-none">SUPER MENTOR SAM</span>
                        </div>
                    </div>

                    {/* Cinematic Text Card Container (Clean, Glassmorphic, Extremely Readable) */}
                    <div className="bg-slate-900/60 border border-white/5 backdrop-blur-lg p-6 md:p-8 rounded-[2rem] w-full max-w-xl shadow-2xl space-y-4 text-center z-10 relative">
                        <div className="min-h-[160px] flex flex-col justify-center gap-3">
                            {/* Title dialog */}
                            <h2 className="text-xl md:text-3xl font-black tracking-tight text-white leading-tight min-h-[2.2em] flex items-center justify-center">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-200">
                                    {displayedTitle}
                                </span>
                            </h2>
                            
                            {/* Subtext dialogue */}
                            <p className="text-xs md:text-sm text-indigo-200/70 font-semibold leading-relaxed tracking-wide min-h-[3em]">
                                {displayedSubtext}
                                {/* Cursor */}
                                {titleDone && !subtextDone && (
                                    <motion.span
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.6 }}
                                        className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-1 vertical-middle"
                                    />
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Glassmorphic Navigation controls */}
                    <motion.div
                        key={`btn-${step}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 z-20"
                    >
                        <Button 
                            onClick={(e) => {
                                e.stopPropagation();
                                nextStep();
                            }}
                            className="bg-white/10 text-white border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all duration-500 px-10 py-6 text-base font-black rounded-full uppercase tracking-widest shadow-2xl backdrop-blur-md active:scale-95"
                        >
                            {!titleDone || !subtextDone ? "Skip Talk ⏩" : step < DIALOGUE_STEPS.length - 1 ? "Keep Listening →" : "Enter Command Center 🚀"}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
