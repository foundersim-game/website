"use client";
// src/components/story/StoryEventModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Story Mode event modal. Shows narrative events with choice buttons.
// This is COMPLETELY SEPARATE from sandbox EventModal.tsx — never imports it.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { StoryEvent, StoryChoice, StoryModeState, StoryCampaign } from "@/lib/story/types";
import { StoryStartupSnapshot } from "@/lib/story/types";

interface Props {
  event: StoryEvent;
  snapshot: StoryStartupSnapshot;
  storyState: StoryModeState;
  campaign: StoryCampaign;
  onChoiceMade: (choiceId: string, succeeded: boolean) => void;
}

export default function StoryEventModal({ event, snapshot, storyState, campaign, onChoiceMade }: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay for entrance animation
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Build a minimal Startup-like object for condition checks
  const fakeStartup = {
    metrics: {
      cash: snapshot.metrics.cash,
      users: snapshot.metrics.users,
      product_quality: snapshot.metrics.product_quality,
      technical_debt: snapshot.metrics.technical_debt,
      team_morale: snapshot.metrics.team_morale,
      brand_awareness: snapshot.metrics.brand_awareness,
      innovation: snapshot.metrics.innovation,
      pmf_score: snapshot.metrics.pmf_score,
      reliability: snapshot.metrics.reliability,
      founder_health: snapshot.metrics.founder_health,
      founder_burnout: snapshot.metrics.founder_burnout,
    },
    valuation: snapshot.valuation,
    ceo_reputation: snapshot.ceo_reputation,
  } as any;

  function isChoiceLocked(choice: StoryChoice): boolean {
    if (!choice.condition) return false;
    return !choice.condition(fakeStartup, storyState);
  }

  async function handleChoiceClick(choice: StoryChoice) {
    if (isChoiceLocked(choice) || isResolving) return;
    setSelectedChoice(choice.id);
    setIsResolving(true);

    // Determine success based on successRate (default 1.0)
    const rate = choice.successRate ?? 1.0;
    const succeeded = Math.random() < rate;

    // Brief dramatic pause before resolving
    await new Promise((r) => setTimeout(r, 800));

    onChoiceMade(choice.id, succeeded);
  }

  const actDef = campaign.acts.find((a) => a.act === event.act);
  const accentColor = campaign.themeColors.accent;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full md:max-w-2xl md:rounded-2xl overflow-hidden"
        style={{
          transform: visible ? "translateY(0)" : "translateY(40px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease",
          background: "linear-gradient(180deg, #0f0f14 0%, #16161f 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "95vh",
          overflowY: "auto",
        }}
      >
        {/* Act Badge & Month */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span
            className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }}
          >
            {actDef ? `ACT ${actDef.act} — ${actDef.title}` : `ACT ${event.act}`}
          </span>
          {event.isClimax && (
            <span className="text-xs font-bold tracking-wider uppercase text-amber-400 animate-pulse">
              ✦ KEY MOMENT
            </span>
          )}
        </div>

        {/* Event Title */}
        <div className="px-5 pb-2">
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {event.title}
          </h2>
        </div>

        {/* Divider */}
        <div className="h-px mx-5 mb-4" style={{ background: `linear-gradient(90deg, ${accentColor}66, transparent)` }} />

        {/* Description */}
        <div className="px-5 pb-5">
          <p className="text-base text-slate-300 leading-relaxed">{event.description}</p>
        </div>

        {/* Choices */}
        <div className="px-5 pb-6 space-y-3">
          {event.choices.map((choice) => {
            const locked = isChoiceLocked(choice);
            const isSelected = selectedChoice === choice.id;

            return (
              <button
                key={choice.id}
                onClick={() => handleChoiceClick(choice)}
                disabled={locked || isResolving}
                className="w-full text-left rounded-xl p-4 transition-all duration-200 group relative overflow-hidden"
                style={{
                  background: locked
                    ? "rgba(255,255,255,0.03)"
                    : isSelected
                    ? `${accentColor}22`
                    : "rgba(255,255,255,0.06)",
                  border: locked
                    ? "1px solid rgba(255,255,255,0.06)"
                    : isSelected
                    ? `1px solid ${accentColor}88`
                    : "1px solid rgba(255,255,255,0.10)",
                  cursor: locked ? "not-allowed" : "pointer",
                  opacity: locked ? 0.5 : 1,
                  transform: isSelected ? "scale(0.99)" : "scale(1)",
                }}
              >
                {/* Hover shimmer */}
                {!locked && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${accentColor}11, transparent)` }}
                  />
                )}

                <div className="relative flex items-start gap-3">
                  {/* Lock / Arrow icon */}
                  <span className="text-lg mt-0.5 flex-shrink-0">
                    {locked ? "🔒" : isSelected && isResolving ? "⏳" : "→"}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-white mb-1">{choice.label}</div>
                    <div className="text-sm text-slate-400 leading-snug">{choice.description}</div>

                    {/* Lock reason */}
                    {locked && choice.conditionFailReason && (
                      <div className="mt-2 text-xs text-amber-400 font-medium">
                        ⚠️ {choice.conditionFailReason}
                      </div>
                    )}

                    {/* Success rate indicator */}
                    {!locked && choice.successRate !== undefined && choice.successRate < 1.0 && (
                      <div className="mt-2 text-xs text-slate-500">
                        Success chance: {Math.round(choice.successRate * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom safe area */}
        <div className="h-4 md:h-0" />
      </div>
    </div>
  );
}
