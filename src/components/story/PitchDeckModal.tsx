"use client";
// src/components/story/PitchDeckModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Card-based fundraising mini-game.
// Player picks 3 cards from 6, scored against the VC's personality.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { PitchCardType, VCPersonality, PitchDeckResult } from "@/lib/story/types";
import {
  dealPitchHand,
  scorePitchDeck,
  interpretPitchScore,
  getPitchResultDetail,
  VC_PERSONALITIES,
  PITCH_CARD_META,
} from "@/lib/story/pitchDeck";
import { haptic } from "@/lib/story/storyHaptics";
import { playCoinTick, playLevelUp, playError } from "@/lib/story/storyAudio";
import { burstAt } from "@/lib/story/storyParticles";

interface Props {
  vcPersonality: VCPersonality;
  baseFunding: number; // e.g. 5_000_000
  fundraisingSkill: number;
  onComplete: (result: PitchDeckResult, cashBonus: number) => void;
}

export default function PitchDeckModal({ vcPersonality, baseFunding, fundraisingSkill, onComplete }: Props) {
  const [hand] = useState<PitchCardType[]>(() => dealPitchHand());
  const [selected, setSelected] = useState<PitchCardType[]>([]);
  const [phase, setPhase] = useState<"select" | "results">("select");
  const [result, setResult] = useState<ReturnType<typeof getPitchResultDetail> | null>(null);
  const [score, setScore] = useState(0);

  const vc = VC_PERSONALITIES.find((v) => v.id === vcPersonality)!;

  function toggleCard(card: PitchCardType) {
    if (phase !== "select") return;
    setSelected((prev) => {
      if (prev.includes(card)) {
        haptic.light();
        playCoinTick();
        return prev.filter((c) => c !== card);
      }
      if (prev.length >= 3) return prev;
      haptic.medium();
      playCoinTick();
      return [...prev, card];
    });
  }

  function handlePresent() {
    if (selected.length < 3) return;
    haptic.heavy();
    
    let s = scorePitchDeck(selected, vcPersonality);
    
    // Skill bonus
    if (fundraisingSkill >= 80) s += 3;
    else if (fundraisingSkill >= 40) s += 1;

    const r = interpretPitchScore(s);
    const detail = getPitchResultDetail(r, baseFunding);
    
    if (r === "rejected") {
      playError();
    } else {
      playLevelUp();
      burstAt("💵", 20, window.innerWidth / 2, window.innerHeight / 2);
    }

    setScore(s);
    setResult(detail);
    setPhase("results");
  }

  function handleAccept() {
    if (!result) return;
    haptic.light();
    playCoinTick();
    onComplete(result.result, result.cashBonus);
  }

  const resultColors: Record<PitchDeckResult, string> = {
    great_terms: "#22c55e",
    fair_terms:  "#3b82f6",
    poor_terms:  "#f97316",
    rejected:    "#ef4444",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="w-full md:max-w-2xl md:rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0f0f14 0%, #16161f 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "95vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="text-xs text-blue-400 font-bold tracking-widest uppercase mb-2">
            💰 Pitch Deck
          </div>
          <h2 className="text-2xl font-black text-white">Raise Your Round</h2>
          <p className="text-slate-400 text-sm mt-1">
            Select 3 slides to present to your investor.
          </p>
        </div>

        {/* VC Profile */}
        <div
          className="mx-6 mb-5 p-4 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{vc.emoji}</span>
            <div>
              <div className="font-bold text-white text-base">{vc.name}</div>
              <div className="text-sm text-slate-400">{vc.description}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500">Responds well to:</span>
            {vc.strongCards.map((c) => (
              <span
                key={c}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}
              >
                {PITCH_CARD_META[c].emoji} {PITCH_CARD_META[c].name}
              </span>
            ))}
          </div>
        </div>

        {/* Card selection */}
        {phase === "select" && (
          <>
            <div className="px-6 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Your slides</span>
                <span className="text-sm font-bold text-white">{selected.length}/3 selected</span>
              </div>
            </div>

            <div className="px-6 pb-5 grid grid-cols-2 gap-3">
              {hand.map((card, idx) => {
                const meta = PITCH_CARD_META[card];
                const isSelected = selected.includes(card);
                const isDisabled = !isSelected && selected.length >= 3;

                return (
                  <button
                    key={`${card}-${idx}`}
                    onClick={() => toggleCard(card)}
                    disabled={isDisabled}
                    className="relative rounded-xl p-4 text-left transition-all duration-150"
                    style={{
                      background: isSelected
                        ? "rgba(59,130,246,0.2)"
                        : "rgba(255,255,255,0.05)",
                      border: isSelected
                        ? "2px solid #3b82f6"
                        : "1px solid rgba(255,255,255,0.08)",
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      transform: isSelected ? "translateY(-2px)" : "none",
                      boxShadow: isSelected ? "0 8px 20px rgba(59,130,246,0.2)" : "none",
                    }}
                  >
                    <div className="text-2xl mb-2">{meta.emoji}</div>
                    <div className="font-bold text-white text-sm leading-tight">{meta.name}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">{meta.description}</div>
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: "#3b82f6", color: "white" }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={handlePresent}
                disabled={selected.length < 3}
                className="w-full py-4 rounded-xl font-black text-base transition-all duration-200"
                style={{
                  background: selected.length === 3
                    ? "linear-gradient(135deg, #2563eb, #4f46e5)"
                    : "rgba(255,255,255,0.06)",
                  color: selected.length === 3 ? "white" : "rgba(255,255,255,0.3)",
                  cursor: selected.length === 3 ? "pointer" : "not-allowed",
                  boxShadow: selected.length === 3 ? "0 8px 24px rgba(37,99,235,0.3)" : "none",
                }}
              >
                {selected.length === 3 ? "Present the Pitch →" : `Select ${3 - selected.length} more slide${3 - selected.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </>
        )}

        {/* Results */}
        {phase === "results" && result && (
          <div className="px-6 pb-8">
            {/* Score reveal */}
            <div className="text-center py-6">
              <div className="text-5xl mb-3">{result.emoji}</div>
              <div
                className="text-6xl font-black mb-2"
                style={{ color: resultColors[result.result] }}
              >
                {score}<span className="text-2xl text-slate-500">/100</span>
              </div>
              <div className="text-xl font-bold text-white mb-1">{result.headline}</div>
              <p className="text-slate-400 text-sm">{result.subtext}</p>
            </div>

            {/* Terms */}
            {result.result !== "rejected" && (
              <div
                className="rounded-xl p-4 mb-5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-bold">Deal Terms</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Cash Raised</div>
                    <div className="text-lg font-black text-white">
                      ${(result.cashBonus / 1_000_000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Equity Given</div>
                    <div
                      className="text-lg font-black"
                      style={{ color: result.dilutionPct > 20 ? "#f97316" : "#22c55e" }}
                    >
                      {result.dilutionPct}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 items-center text-xs justify-center mb-6">
              <span className="text-slate-500">Raw Score: {score - (fundraisingSkill >= 80 ? 3 : fundraisingSkill >= 40 ? 1 : 0)}</span>
              <span className="text-emerald-400">Fundraising Skill: {fundraisingSkill >= 80 ? "Master (+3 Score)" : fundraisingSkill >= 40 ? "Expert (+1 Score)" : "Novice"}</span>
            </div>

            <button
              onClick={handleAccept}
              className="w-full py-4 rounded-xl font-black text-base text-white transition-all duration-200"
              style={{
                background: result.result === "rejected"
                  ? "rgba(255,255,255,0.08)"
                  : `linear-gradient(135deg, ${resultColors[result.result]}cc, ${resultColors[result.result]}88)`,
                boxShadow: result.result !== "rejected" ? `0 8px 24px ${resultColors[result.result]}44` : "none",
              }}
            >
              {result.result === "rejected" ? "Find Another Investor" : "Accept the Deal"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
