"use client";
// src/components/story/KeynoteModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Keynote rhythm mini-game. Fires for climax keynote events.
// Player clicks targets as a shrinking ring reaches the center.
// Score determines launch multiplier applied to the event outcome.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from "react";
import { playWav, playLevelUp, playCoinTick } from "@/lib/story/storyAudio";
import { haptic } from "@/lib/story/storyHaptics";
import { burstAt } from "@/lib/story/storyParticles";

interface Target {
  id: string;
  x: number;    // 0–100% of container
  y: number;    // 0–100% of container
  appearsAt: number;   // ms from game start
  windowMs: number;    // click window duration
  hit?: "perfect" | "good" | "miss";
}

interface Props {
  marketingSkill: number;
  onComplete: (score: number) => void;
}

// 12 targets spread over 24 seconds
const TARGETS: Omit<Target, "hit">[] = [
  { id: "t1",  x: 30, y: 40, appearsAt: 2000,  windowMs: 2000 },
  { id: "t2",  x: 65, y: 30, appearsAt: 4000,  windowMs: 1800 },
  { id: "t3",  x: 50, y: 60, appearsAt: 6000,  windowMs: 1800 },
  { id: "t4",  x: 20, y: 55, appearsAt: 8000,  windowMs: 1700 },
  { id: "t5",  x: 75, y: 50, appearsAt: 10000, windowMs: 1700 },
  { id: "t6",  x: 45, y: 25, appearsAt: 12000, windowMs: 1600 },
  { id: "t7",  x: 55, y: 70, appearsAt: 14000, windowMs: 1600 },
  { id: "t8",  x: 35, y: 50, appearsAt: 16000, windowMs: 1500 },
  { id: "t9",  x: 70, y: 35, appearsAt: 18000, windowMs: 1500 },
  { id: "t10", x: 25, y: 65, appearsAt: 20000, windowMs: 1400 },
  { id: "t11", x: 60, y: 45, appearsAt: 22000, windowMs: 1400 },
  { id: "t12", x: 40, y: 35, appearsAt: 24000, windowMs: 1300 },
];

const TOTAL_MS = 26000;
const MAX_SCORE = TARGETS.length * 2; // 24 points max (2 per perfect hit)

export default function KeynoteModal({ marketingSkill, onComplete }: Props) {
  const [phase, setPhase] = useState<"countdown" | "active" | "results">("countdown");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  
  const [targets, setTargets] = useState<Target[]>(() => {
    // Skill bonus: >80 = +50% time, >40 = +25% time
    const multiplier = marketingSkill >= 80 ? 1.5 : marketingSkill >= 40 ? 1.25 : 1.0;
    return TARGETS.map((t) => ({ ...t, windowMs: t.windowMs * multiplier }));
  });

  const [rawScore, setRawScore] = useState(0);
  const [hits, setHits] = useState<string[]>([]);   // IDs of hit targets
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 30);
  }, []);

  // Countdown phase — with haptic ticks
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      haptic.heavy();
      setPhase("active");
      startTimeRef.current = performance.now();
      return;
    }
    haptic.light();
    playCoinTick(0.3);
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // Game loop
  useEffect(() => {
    if (phase !== "active") return;

    function tick() {
      const now = performance.now();
      const ms = now - startTimeRef.current;
      setElapsed(ms);

      if (ms >= TOTAL_MS) {
        setPhase("results");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  // End game — ceremony
  useEffect(() => {
    if (phase !== "results") return;
    const normalized = Math.round((rawScore / MAX_SCORE) * 100);
    if (normalized >= 80) {
      playLevelUp(0.5);
      haptic.victoryRumble();
    } else if (normalized >= 50) {
      playWav("success", { volume: 0.4 });
      haptic.success();
    } else {
      playWav("fail", { volume: 0.35 });
      haptic.warning();
    }
    const timer = setTimeout(() => onComplete(normalized), 2500);
    return () => clearTimeout(timer);
  }, [phase, rawScore, onComplete]);

  const handleTargetClick = useCallback((target: Target, e: React.MouseEvent) => {
    if (phase !== "active") return;
    if (hits.includes(target.id)) return;

    const ms = elapsed;
    const age = ms - target.appearsAt;
    if (age < 0 || age > target.windowMs) return;

    // Perfect hit: clicked in first 40% of window
    const isPerfect = age < target.windowMs * 0.4;
    const points = isPerfect ? 2 : 1;

    // Sound + haptic feedback
    if (isPerfect) {
      playWav("success", { volume: 0.55, rate: 1.2 });
      haptic.heavy();
      burstAt("⭐", 8, e.clientX, e.clientY, 700);
    } else {
      playWav("click", { volume: 0.4, rate: 1.1 });
      haptic.medium();
      burstAt("✦", 4, e.clientX, e.clientY, 500);
    }

    setRawScore((s) => s + points);
    setHits((h) => [...h, target.id]);
    setTargets((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, hit: isPerfect ? "perfect" : "good" } : t))
    );
  }, [phase, elapsed, hits]);

  const normalizedScore = Math.round((rawScore / MAX_SCORE) * 100);
  const scoreLabel =
    normalizedScore >= 80 ? "🎤 Legendary Keynote!" :
    normalizedScore >= 50 ? "👏 Solid Presentation" :
    "😬 Room Felt Flat";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #08080f 0%, #0f0f1a 100%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <div className="text-xs text-amber-400 font-bold tracking-widest uppercase mb-1">✦ KEY MOMENT</div>
          <h2 className="text-xl font-black text-white">The Keynote Stage</h2>
        </div>
        {phase === "active" && (
          <div className="text-right">
            <div className="text-xs text-slate-400 mb-1">Score</div>
            <div className="text-2xl font-black text-white">{rawScore}<span className="text-slate-500 text-sm">/{MAX_SCORE}</span></div>
          </div>
        )}
      </div>

      {/* Countdown */}
      {phase === "countdown" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-slate-400 text-center max-w-sm px-4">
            Click each target as the ring closes in. The faster you click, the higher your score.
          </p>
          <div
            className="text-8xl font-black text-white"
            style={{ textShadow: "0 0 40px rgba(255,255,255,0.3)" }}
          >
            {countdown === 0 ? "GO!" : countdown}
          </div>
        </div>
      )}

      {/* Game area */}
      {phase === "active" && (
        <div className="flex-1 relative select-none" style={{ cursor: "crosshair" }}>
          {targets.map((target) => {
            const age = elapsed - target.appearsAt;
            const isVisible = age >= 0 && age <= target.windowMs;
            const isHit = hits.includes(target.id);
            if (!isVisible && !isHit) return null;

            const progress = Math.min(1, age / target.windowMs); // 0 → 1 as ring closes
            const ringSize = 60 + (1 - progress) * 40; // 100px → 60px
            const ringOpacity = isHit ? 0 : (1 - progress * 0.3);

            return (
              <div
                key={target.id}
                onClick={(e) => handleTargetClick(target, e)}
                className="absolute"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                }}
              >
                {/* Outer shrinking ring */}
                {!isHit && (
                  <div
                    style={{
                      position: "absolute",
                      width: ringSize,
                      height: ringSize,
                      borderRadius: "50%",
                      border: "3px solid rgba(251,191,36,0.8)",
                      transform: "translate(-50%, -50%)",
                      top: "50%",
                      left: "50%",
                      transition: "none",
                      opacity: ringOpacity,
                    }}
                  />
                )}
                {/* Center target circle */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: isHit
                      ? (target.hit === "perfect" ? "rgba(34,197,94,0.9)" : "rgba(59,130,246,0.9)")
                      : "rgba(255,255,255,0.15)",
                    border: isHit ? "3px solid white" : "3px solid rgba(255,255,255,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    cursor: "pointer",
                    transform: isHit ? "scale(0.8)" : "scale(1)",
                    transition: "transform 0.15s, background 0.15s",
                    boxShadow: isHit ? "0 0 20px rgba(34,197,94,0.5)" : "none",
                  }}
                >
                  {isHit ? (target.hit === "perfect" ? "✓" : "✓") : "🎤"}
                </div>

                {/* Hit feedback */}
                {isHit && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-sm whitespace-nowrap"
                    style={{
                      color: target.hit === "perfect" ? "#22c55e" : "#3b82f6",
                      transform: "translateX(-50%) translateY(-30px)",
                    }}
                  >
                    {target.hit === "perfect" ? "+2 PERFECT" : "+1 GOOD"}
                  </div>
                )}
              </div>
            );
          })}

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-amber-400 transition-none"
              style={{ width: `${Math.min(100, (elapsed / TOTAL_MS) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {phase === "results" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <div className="text-6xl">{normalizedScore >= 80 ? "🎤" : normalizedScore >= 50 ? "👏" : "😬"}</div>
          <div className="text-4xl font-black text-white">{normalizedScore}/100</div>
          <div className="text-xl font-bold text-amber-400">{scoreLabel}</div>
          <p className="text-slate-400 text-center max-w-xs">
            {normalizedScore >= 80
              ? "The crowd erupts. This moment will be remembered for decades."
              : normalizedScore >= 50
              ? "Solid. The product speaks for itself."
              : "The presentation didn't land. The product will have to do the talking."}
          </p>
          <p className="text-sm font-bold text-slate-300">Audience Impact: {normalizedScore}%</p>
          
          <div className="flex gap-4 items-center text-xs mt-2 mb-4">
            <span className="text-slate-500">Hits: {hits.length}/{targets.length}</span>
            <span className="text-indigo-400">Marketing Skill: {marketingSkill >= 80 ? "Master (+50% Time)" : marketingSkill >= 40 ? "Expert (+25% Time)" : "Novice"}</span>
          </div>

          <button
            onClick={() => onComplete(normalizedScore)}
            className="px-8 py-4 rounded-xl font-black text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors uppercase tracking-widest text-sm shadow-lg shadow-amber-400/20"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
