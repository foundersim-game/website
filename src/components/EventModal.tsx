"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, TrendingUp, TrendingDown, Target, Users, Landmark, Activity, Heart, Briefcase } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export type EventChoice = {
    text: string;
    subtext?: string;
    effects: Record<string, number>;
};

export type GameEvent = {
    event_id?: string;
    stage?: string;
    scenario?: string;
    title: string;
    description: string;
    choices: EventChoice[];
    repeatable?: boolean;
};

interface EventModalProps {
    event: GameEvent | null;
    onResolve: (choice: EventChoice) => void;
    onClose?: () => void;
    multiplier?: number;
    isPremium?: boolean;
}

export const generateImpactSentence = (choiceText: string, effects: Record<string, number>, multiplier: number = 1, eventTitle?: string) => {
    const changes: string[] = [];
    Object.entries(effects).forEach(([key, val]) => {
        let adjustedVal = val * multiplier;
        if (adjustedVal === 0) return;

        const isMoney = ['cash', 'burn_rate', 'revenue', 'monthlyCost', 'salary'].includes(key.toLowerCase());
        const displayVal = isMoney ? formatMoney(Math.abs(adjustedVal)) : Math.abs(adjustedVal).toString();
        
        if (key === 'team_morale') changes.push(`morale ${adjustedVal > 0 ? 'improved' : 'dropped'}`);
        else if (key === 'product_quality') changes.push(`product quality ${adjustedVal > 0 ? 'grew' : 'sank'}`);
        else if (isMoney) changes.push(`${key.split('_').join(' ').toUpperCase()} ${adjustedVal > 0 ? 'gained' : 'spent'} ${displayVal}`);
        else changes.push(`${key.split('_').join(' ')} ${adjustedVal > 0 ? 'rose' : 'fell'}`);
    });
    const impactText = changes.length > 0 ? `. This resulted in: ${changes.join(', ')}` : '';
    const prefix = eventTitle ? `${eventTitle}: ` : '';
    return `${prefix}You decided to "${choiceText}"${impactText}.`;
};

const THEME = {
    panelFrom: "#1e1b4b", // Midnight Indigo
    panelTo: "#312e81",   // Indigo
    accent: "#6366f1",    // Bright Indigo
    badgeBg: "#4338ca",   // Darker Indigo
    badgeText: "#e0e7ff", // Lightest Indigo
    glowColor: "rgba(99,102,241,0.35)",
    borderColor: "rgba(99,102,241,0.25)",
    decorCircle1: "rgba(99,102,241,0.06)",
    decorCircle2: "rgba(139,92,246,0.08)",
};

// --- Typewriter Hook ---
function useTypewriter(text: string, isActive: boolean, speed = 15) {
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
            setDisplayed(text.slice(0, idx.current));
            if (idx.current < text.length) {
                timer.current = setTimeout(tick, speed);
            } else {
                setDone(true);
            }
        };
        timer.current = setTimeout(tick, 350);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [text, isActive, speed, reset]);

    const skip = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        setDisplayed(text);
        setDone(true);
        idx.current = text.length;
    }, [text]);

    return { displayed, done, skip };
}

// --- Impact Icon Helper ---
const MetricIcon = ({ metric, className = "size-4" }: { metric: string; className?: string }) => {
    const m = metric.toLowerCase();
    if (m === 'cash' || m === 'revenue') return <Landmark className={className} />;
    if (m === 'users') return <Users className={className} />;
    if (m === 'pmf_score' || m === 'product_quality') return <Target className={className} />;
    if (m === 'team_morale' || m === 'burnout') return <Heart className={className} />;
    if (m === 'brand_awareness' || m === 'reputation') return <Activity className={className} />;
    return <Briefcase className={className} />;
};

export function EventModal({ event, onResolve, onClose, multiplier = 1, isPremium = false }: EventModalProps) {
    const { isDark } = useTheme();
    const [resolvedChoice, setResolvedChoice] = useState<EventChoice | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    
    // Typewriter for the event description
    const { displayed: displayedDesc, done: descDone, skip } = useTypewriter(event?.description || "", !!event && !resolvedChoice);

    useEffect(() => {
        if (event) {
            setResolvedChoice(null);
            setIsExiting(false);
        }
    }, [event]);

    if (!event) return null;

    const handleChoiceClick = (choice: EventChoice) => {
        onResolve(choice);
        setResolvedChoice(choice);
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            if (onClose) onClose();
            setIsExiting(false);
        }, 300);
    };

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
            {event && !isExiting && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed", inset: 0, zIndex: 1000,
                            background: "rgba(0,0,0,0.8)",
                            backdropFilter: "blur(8px)",
                        }}
                    />

                    {/* Modal Container */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            position: "fixed",
                            bottom: 0, left: 0, right: 0,
                            zIndex: 1001,
                            maxWidth: 480,
                            margin: "0 auto",
                            borderRadius: "32px 32px 0 0",
                            overflow: "hidden",
                            background: isDark ? "#0f172a" : "#fff",
                            boxShadow: `0 -12px 60px ${isDark ? "rgba(0,0,0,0.5)" : THEME.glowColor}`,
                        }}
                    >
                        {/* --- TOP PANEL (The Visual Area) --- */}
                        <div style={{
                            position: "relative",
                            height: 180,
                            background: `linear-gradient(165deg, ${THEME.panelFrom} 0%, ${THEME.panelTo} 100%)`,
                            overflow: "hidden",
                        }}>
                            {/* Decorative Elements */}
                            <div style={{
                                position: "absolute", top: -40, right: -40,
                                width: 180, height: 180, borderRadius: "50%",
                                background: THEME.decorCircle2,
                            }} />
                            <div style={{
                                position: "absolute", bottom: 20, left: "10%",
                                width: 120, height: 120, borderRadius: "50%",
                                background: THEME.decorCircle1,
                            }} />

                            {/* Accent Glow */}
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                                background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
                                opacity: 0.8,
                            }} />

                            {/* Centered Main Icon Container */}
                            <div style={{
                                position: "absolute",
                                top: "50%", left: "50%",
                                transform: "translate(-50%, -50%)",
                                display: "flex", flexDirection: "column", alignItems: "center", gap: 12
                            }}>
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    style={{
                                        width: 80, height: 80,
                                        borderRadius: "24px",
                                        background: "rgba(255,255,255,0.1)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    <Zap style={{ width: 40, height: 40, color: "#fff", fill: "#fff" }} />
                                </motion.div>
                                
                                <span style={{
                                    background: THEME.badgeBg,
                                    color: THEME.badgeText,
                                    fontSize: 10, fontWeight: 900,
                                    letterSpacing: "0.15em", textTransform: "uppercase",
                                    padding: "4px 14px", borderRadius: 99,
                                    boxShadow: `0 4px 16px rgba(0,0,0,0.2)`,
                                }}>
                                    Dynamic Event
                                </span>
                            </div>

                            {/* Bottom Page Fade */}
                            <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
                                background: isDark ? "linear-gradient(to bottom, transparent, #0f172a)" : "linear-gradient(to bottom, transparent, #ffffff)",
                            }} />
                        </div>

                        {/* --- CONTENT PANEL --- */}
                        <div style={{ 
                            background: isDark ? "#0f172a" : "#ffffff", 
                            padding: `16px 24px ${isPremium ? '32px' : 'calc(32px + var(--sab, 0px) + 70px)'}`
                        }}>
                            {!resolvedChoice ? (
                                <>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            fontSize: 22, fontWeight: 900,
                                            color: isDark ? "#f1f5f9" : "#0f172a",
                                            textTransform: "uppercase",
                                            letterSpacing: "-0.01em",
                                            marginBottom: 8,
                                            lineHeight: 1.1
                                        }}
                                    >
                                        {event.title}
                                    </motion.h2>

                                     <div 
                                        onClick={skip}
                                        style={{ cursor: descDone ? "default" : "pointer", marginBottom: 24 }}
                                     >
                                        <p style={{
                                            fontSize: 14, color: isDark ? "#94a3b8" : "#475569",
                                            lineHeight: 1.6, minHeight: 60,
                                        }}>
                                            {displayedDesc}
                                            {!descDone && (
                                                <motion.span
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{ repeat: Infinity, duration: 0.7 }}
                                                    style={{
                                                        display: "inline-block",
                                                        width: 2, height: 14,
                                                        background: THEME.accent,
                                                        marginLeft: 2,
                                                        verticalAlign: "middle"
                                                    }}
                                                />
                                            )}
                                        </p>
                                    </div>

                                    {/* Choice Buttons */}
                                    <AnimatePresence>
                                        {descDone && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ display: "flex", flexDirection: "column", gap: 10 }}
                                            >
                                                {event.choices.map((choice, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleChoiceClick(choice)}
                                                        style={{
                                                            width: "100%", textAlign: "left",
                                                            padding: "16px 20px", borderRadius: 20,
                                                            border: isDark ? "2px solid #1e293b" : "2px solid #e2e8f0",
                                                            background: isDark ? "linear-gradient(135deg, #1e293b, #0f172a)" : "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                            display: "flex", alignItems: "center", gap: 16,
                                                            position: "relative", overflow: "hidden"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.borderColor = THEME.accent;
                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                            e.currentTarget.style.boxShadow = isDark ? "0 8px 20px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.05)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor = isDark ? "#1e293b" : "#e2e8f0";
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "none";
                                                        }}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 900, color: isDark ? "#f1f5f9" : "#1e293b", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                                                {choice.text}
                                                            </p>
                                                            {choice.subtext && (
                                                                <p style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b", marginTop: 2 }}>{choice.subtext}</p>
                                                            )}
                                                        </div>
                                                        <ArrowRight className="size-5 text-slate-300" />
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ display: "flex", flexDirection: "column", gap: 20 }}
                                >
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 900, color: THEME.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                                            Analysis Complete
                                        </p>
                                        <h2 style={{ fontSize: 24, fontWeight: 900, color: isDark ? "#f1f5f9" : "#0f172a", marginBottom: 12 }}>
                                            The Outcome
                                        </h2>
                                        <div style={{ 
                                            background: isDark ? "#1e293b" : "#f8fafc", 
                                            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                                            borderRadius: 24,
                                            padding: 20,
                                            display: "flex", flexDirection: "column", gap: 12
                                        }}>
                                            {Object.entries(resolvedChoice.effects).map(([metric, val], idx) => {
                                                const amount = val * multiplier;
                                                if (amount === 0) return null;
                                                const isPositive = amount > 0;
                                                const color = isPositive ? "#10b981" : "#ef4444";
                                                
                                                return (
                                                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        <div style={{ 
                                                            width: 32, height: 32, borderRadius: 10, 
                                                            background: `${color}15`, color: color,
                                                            display: "flex", alignItems: "center", justifyContent: "center"
                                                        }}>
                                                            <MetricIcon metric={metric} />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontSize: 10, fontWeight: 800, color: isDark ? "#64748b" : "#94a3b8", textTransform: "uppercase" }}>
                                                                {metric.replace('_', ' ')}
                                                            </p>
                                                            <p style={{ fontSize: 15, fontWeight: 900, color: isDark ? "#f1f5f9" : "#1e293b" }}>
                                                                {isPositive ? "+" : ""}{metric.toLowerCase().includes('cash') || metric.toLowerCase().includes('revenue') ? formatMoney(amount) : amount}
                                                            </p>
                                                        </div>
                                                        {isPositive ? <TrendingUp className="size-5 text-emerald-500" /> : <TrendingDown className="size-5 text-red-500" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        style={{
                                            width: "100%", height: 56,
                                            borderRadius: 20, border: "none",
                                            background: `linear-gradient(135deg, ${THEME.accent} 0%, ${THEME.panelTo} 100%)`,
                                            color: "#fff",
                                            fontSize: 14, fontWeight: 900,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.1em",
                                            cursor: "pointer",
                                            boxShadow: `0 8px 24px ${THEME.glowColor}`,
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                                        }}
                                    >
                                        Acknowledged <ArrowRight className="size-5" />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

