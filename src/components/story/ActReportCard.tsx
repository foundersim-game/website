"use client";
// src/components/story/ActReportCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Act Report Card — shown when the player completes an act.
// Scores performance, highlights key decisions, and teases next act.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryCampaign, StoryModeState, StoryStartupSnapshot } from "@/lib/story/types";
import { playWav, playLevelUp, playCoinTick } from "@/lib/story/storyAudio";
import { haptic } from "@/lib/story/storyHaptics";
import { rainConfetti } from "@/lib/story/storyParticles";

interface Props {
  campaign: StoryCampaign;
  snapshot: StoryStartupSnapshot;
  storyState: StoryModeState;
  completedAct: 1 | 2 | 3 | 4;
  onContinue: () => void;
}

// Grade calculation
function computeGrade(score: number): { letter: string; color: string; label: string } {
  if (score >= 90) return { letter: "S", color: "#f59e0b", label: "Legendary" };
  if (score >= 80) return { letter: "A", color: "#10b981", label: "Excellent" };
  if (score >= 65) return { letter: "B", color: "#6366f1", label: "Solid" };
  if (score >= 50) return { letter: "C", color: "#94a3b8", label: "Struggling" };
  return { letter: "D", color: "#ef4444", label: "Barely Alive" };
}

function ScoreRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        <span className="text-xs font-black text-white">{value}<span className="text-slate-600">/{max}</span></span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function ActReportCard({ campaign, snapshot, storyState, completedAct, onContinue }: Props) {
  const m = snapshot.metrics;
  const actDef = campaign.acts.find((a) => a.act === completedAct);
  const nextAct = campaign.acts.find((a) => a.act === (completedAct + 1) as 1 | 2 | 3 | 4);
  const accentColor = campaign.themeColors.accent;

  // Score calculation: weighted average of key metrics + valuation milestones
  const productScore = m.product_quality;
  const growthScore = Math.min(100, (m.users / 10000) * 100);  // 10K users = 100
  const healthScore = Math.max(0, 100 - (m.founder_burnout || 0));
  const teamScore = m.team_morale;
  const financialScore = m.cash > 0 ? Math.min(100, (m.cash / 100_000) * 100) : 0;

  const overallScore = Math.round(
    productScore * 0.25 +
    growthScore * 0.25 +
    healthScore * 0.15 +
    teamScore * 0.20 +
    financialScore * 0.15
  );

  const grade = computeGrade(overallScore);

  // S-rank ceremony on mount
  useEffect(() => {
    const delay = setTimeout(() => {
      if (grade.letter === "S") {
        playLevelUp(0.5);
        haptic.victoryRumble();
        rainConfetti(35, 1600);
      } else if (grade.letter === "A") {
        playWav("success", { volume: 0.45 });
        haptic.success();
      } else if (grade.letter === "D") {
        playWav("fail", { volume: 0.3 });
        haptic.warning();
      } else {
        haptic.medium();
      }
    }, 400);

    // Staggered coin ticks for score bars
    [0.7, 0.85, 1.0, 1.15].forEach((t) =>
      setTimeout(() => playCoinTick(0.18), t * 1000)
    );

    return () => clearTimeout(delay);
  }, []);

  // Completed events this act
  const actEvents = campaign.events.filter((e) => e.act === completedAct);
  const completedCount = actEvents.filter((e) => storyState.completedEventIds.includes(e.id)).length;

  function fmtNum(n: number) {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
    return `${n}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="w-full md:max-w-md md:rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0d0d18 0%, #12121f 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Act banner */}
        <div
          className="h-20 relative flex items-center justify-center"
          style={{ background: actDef?.color ?? `linear-gradient(135deg, ${accentColor}44, transparent)` }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-center">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Act {completedAct} Complete</p>
            <p className="text-white font-black text-lg">{actDef?.title ?? `Act ${completedAct}`}</p>
          </div>
        </div>

        <div className="p-5">
          {/* Grade */}
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.35 }}
              className="size-16 rounded-2xl flex items-center justify-center font-black text-3xl border"
              style={{
                background: `${grade.color}22`,
                border: `2px solid ${grade.color}88`,
                color: grade.color,
                boxShadow: grade.letter === "S" ? `0 0 24px ${grade.color}88, 0 0 48px ${grade.color}44` : undefined,
              }}
            >
              {grade.letter}
            </motion.div>
            <div>
              <p className="text-white font-black text-xl">{grade.label}</p>
              <p className="text-slate-500 text-xs font-bold">Overall Score: {overallScore}/100</p>
              <p className="text-slate-600 text-[10px] mt-0.5">
                {completedCount}/{actEvents.length} events completed
              </p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { emoji: "💰", label: "Cash", value: fmtNum(m.cash) },
              { emoji: "👥", label: "Users", value: fmtNum(m.users) },
              { emoji: "🏅", label: "Valuation", value: fmtNum(snapshot.valuation) },
            ].map((s) => (
              <div key={s.label} className="bg-white/4 rounded-xl p-3 text-center border border-white/5">
                <div className="text-lg mb-1">{s.emoji}</div>
                <div className="text-white font-black text-sm leading-none">{s.value}</div>
                <div className="text-slate-600 text-[10px] font-bold mt-0.5 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Score Bars */}
          <div className="space-y-3 mb-5">
            <ScoreRow label="Product Quality" value={m.product_quality} max={100} color="#6366f1" />
            <ScoreRow label="Team Morale"    value={m.team_morale}    max={100} color="#10b981" />
            <ScoreRow label="Founder Health" value={healthScore}      max={100} color="#f59e0b" />
            <ScoreRow label="Brand Awareness" value={m.brand_awareness} max={100} color={accentColor} />
          </div>

          {/* Next Act Preview */}
          {nextAct && (
            <div
              className="rounded-xl p-3.5 mb-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Coming Up</p>
              <p className="text-white font-black text-sm">Act {nextAct.act}: {nextAct.title}</p>
              {nextAct.description && (
                <p className="text-slate-500 text-xs mt-1 leading-snug">{nextAct.description}</p>
              )}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onContinue}
            className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}88)`,
              color: "#fff",
              boxShadow: `0 4px 20px ${accentColor}44`,
            }}
          >
            Continue to Act {(completedAct + 1 <= 4 ? completedAct + 1 : completedAct)} →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
