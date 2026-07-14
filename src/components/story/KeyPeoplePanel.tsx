"use client";
// src/components/story/KeyPeoplePanel.tsx
import React, { useState } from "react";
import { KeyPerson } from "@/lib/story/types";
import {
  getLoyaltyHearts,
  getLoyaltyLabel,
  getLoyaltyColor,
  getTopCompetence,
  getPassiveEffectSummary,
} from "@/lib/story/keyPeople";
import { haptic } from "@/lib/story/storyHaptics";
import { playCoinTick } from "@/lib/story/storyAudio";

interface Props {
  keyPeople: KeyPerson[];
  currentMonth: number;
  accentColor: string;
}

export default function KeyPeoplePanel({ keyPeople, currentMonth, accentColor }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const active = keyPeople.filter((p) => p.isActive);

  if (active.length === 0) return null;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Inner Circle</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          {active.length}
        </span>
      </div>

      <div className="space-y-2">
        {active.map((person) => {
          const isNearThreshold = person.loyalty <= person.loyaltyThreshold + 15;
          const isExpanded = expandedId === person.id;
          const loyaltyColor = getLoyaltyColor(person.loyalty);

          return (
            <div key={person.id}>
              <button
                onClick={() => {
                  haptic.light();
                  playCoinTick();
                  setExpandedId(isExpanded ? null : person.id);
                }}
                className="w-full text-left"
              >
                <div
                  className="flex items-center gap-3 rounded-lg p-2.5 transition-all duration-150"
                  style={{
                    background: isNearThreshold ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
                    border: isNearThreshold
                      ? "1px solid rgba(239,68,68,0.3)"
                      : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Avatar */}
                  <span className="text-xl flex-shrink-0">{person.emoji}</span>

                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{person.displayName}</div>
                    <div className="text-xs text-slate-500 truncate">{person.title}</div>
                  </div>

                  {/* Loyalty hearts */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm leading-none">{getLoyaltyHearts(person.loyalty)}</div>
                    <div className="text-xs mt-0.5 font-medium" style={{ color: loyaltyColor }}>
                      {getLoyaltyLabel(person.loyalty)}
                    </div>
                  </div>

                  {/* Pulse warning */}
                  {isNearThreshold && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  className="mt-1 mx-1 rounded-lg p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Top Skill</div>
                  <div className="text-sm text-slate-300 mb-3">{getTopCompetence(person)}</div>

                  <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Monthly Effect</div>
                  <div className="space-y-0.5">
                    {getPassiveEffectSummary(person).map((line, i) => (
                      <div key={i} className="text-xs text-slate-300">{line}</div>
                    ))}
                  </div>

                  {person.secretAgenda && person.loyalty < 40 && (
                    <div
                      className="mt-3 p-2 rounded-lg text-xs text-red-300"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      ⚠️ <strong>Warning:</strong> {person.secretAgenda}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
