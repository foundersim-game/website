"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type CharacterDialogProps = {
    isOpen: boolean;
    character: "sam" | "chad";
    title: string;
    message: string;
    buttonText?: string;
    /** If provided, shows a second choice button (Sam's Way / Chad's Way mechanic) */
    choiceA?: { label: string; description: string; onSelect: () => void };
    choiceB?: { label: string; description: string; onSelect: () => void };
    onDismiss: () => void;
};

const CHARACTER_CONFIG = {
    sam: {
        name: "Sam",
        role: "Startup Mentor",
        image: "/sam.png",
        accent: "#3b82f6",       // blue
        panelGradient: "linear-gradient(160deg, #1e3a5f 0%, #1e293b 100%)",
        badge: "bg-blue-600",
        glow: "shadow-[0_0_24px_rgba(59,130,246,0.35)]",
        border: "border-blue-500/30",
        pulse: false,
    },
    chad: {
        name: "Chad",
        role: "Core AI Rival",
        image: "/chad.png",
        accent: "#f97316",       // orange
        panelGradient: "linear-gradient(160deg, #431407 0%, #1c0a00 100%)",
        badge: "bg-orange-600",
        glow: "shadow-[0_0_28px_rgba(249,115,22,0.45)]",
        border: "border-orange-500/30",
        pulse: true,
    },
};

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
    const [pulsing, setPulsing] = useState(false);

    // Trigger entrance pulse for Chad
    useEffect(() => {
        if (isOpen && cfg.pulse) {
            setPulsing(true);
            const t = setTimeout(() => setPulsing(false), 600);
            return () => clearTimeout(t);
        }
    }, [isOpen, cfg.pulse]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                        onClick={onDismiss}
                    />

                    {/* Dialog card — slides up */}
                    <motion.div
                        key="dialog"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 26, stiffness: 300 }}
                        className={`fixed bottom-0 left-0 right-0 z-[201] mx-auto max-w-md rounded-t-3xl overflow-hidden border ${cfg.border} ${cfg.glow} ${pulsing ? "animate-[pulse_0.3s_ease-in-out_2]" : ""}`}
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        {/* Top character panel */}
                        <div
                            className="relative h-[200px] flex items-end overflow-hidden"
                            style={{ background: cfg.panelGradient }}
                        >
                            {/* Character image — anchored bottom-left */}
                            <img
                                src={cfg.image}
                                alt={cfg.name}
                                className="absolute bottom-0 left-0 h-[220px] w-auto object-contain select-none"
                                draggable={false}
                            />

                            {/* Name badge top-right */}
                            <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                                <span className={`${cfg.badge} text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
                                    {cfg.name}
                                </span>
                                <span className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                                    {cfg.role}
                                </span>
                            </div>

                            {/* Gradient fade at the bottom so text panel blends in */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                        </div>

                        {/* Content panel */}
                        <div className="bg-white px-5 pb-6 pt-3">
                            {/* Title */}
                            <p className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2">
                                {title}
                            </p>

                            {/* Message */}
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-4">
                                {message}
                            </p>

                            {/* Choices (Reply to Chad / Sam mechanics) */}
                            {choiceA && choiceB ? (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => { choiceA.onSelect(); onDismiss(); }}
                                        className="w-full rounded-2xl border-2 border-blue-500 bg-blue-50 px-4 py-3 text-left active:scale-[0.98] transition-transform"
                                    >
                                        <p className="text-xs font-black text-blue-700 uppercase tracking-wide">{choiceA.label}</p>
                                        <p className="text-xs text-blue-500 mt-0.5">{choiceA.description}</p>
                                    </button>
                                    <button
                                        onClick={() => { choiceB.onSelect(); onDismiss(); }}
                                        className="w-full rounded-2xl border-2 border-orange-500 bg-orange-50 px-4 py-3 text-left active:scale-[0.98] transition-transform"
                                    >
                                        <p className="text-xs font-black text-orange-700 uppercase tracking-wide">{choiceB.label}</p>
                                        <p className="text-xs text-orange-500 mt-0.5">{choiceB.description}</p>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={onDismiss}
                                    className="w-full h-12 rounded-2xl text-white font-black text-sm uppercase tracking-wider active:scale-[0.98] transition-transform"
                                    style={{ background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accent}cc)` }}
                                >
                                    {buttonText}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
