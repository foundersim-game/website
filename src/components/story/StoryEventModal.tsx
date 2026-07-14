"use client";
// src/components/story/StoryEventModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Story Mode event modal. Shows narrative events with choice buttons.
// This is COMPLETELY SEPARATE from sandbox EventModal.tsx — never imports it.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from "react";
import { StoryEvent, StoryChoice, StoryModeState, StoryCampaign } from "@/lib/story/types";
import { StoryStartupSnapshot } from "@/lib/story/types";
import { getWisdomForEvent } from "@/lib/story/wisdom";
import { playWav, playError, playTypeTick } from "@/lib/story/storyAudio";
import { haptic } from "@/lib/story/storyHaptics";


interface Props {
  event: StoryEvent;
  snapshot: StoryStartupSnapshot;
  storyState: StoryModeState;
  campaign: StoryCampaign;
  onChoiceMade: (choiceId: string, succeeded: boolean) => void;
}

// ── Typewriter component ──────────────────────────────────────────────────────
function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const fullRef = useRef(text);
  const tickRef = useRef(0);

  const skipToEnd = useCallback(() => {
    setDisplayed(fullRef.current);
    setDone(true);
    onDone?.();
  }, [onDone]);

  useEffect(() => {
    fullRef.current = text;
    setDisplayed("");
    setDone(false);
    tickRef.current = 0;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i % 5 === 0) playTypeTick();
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, 22);
    return () => clearInterval(interval);
  }, [text, onDone]);

  return (
    <p
      className="text-base text-slate-300 leading-relaxed cursor-pointer select-none"
      onClick={!done ? skipToEnd : undefined}
      title={!done ? "Tap to skip" : undefined}
    >
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-slate-400 ml-0.5 animate-pulse align-middle" />}
    </p>
  );
}

// ── Outcome flash overlay ─────────────────────────────────────────────────────
function OutcomeFlash({ type }: { type: "success" | "fail" | null }) {
  if (!type) return null;
  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{
        background: type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)",
        animation: "story-flash 0.35s ease-out forwards",
      }}
    />
  );
}

export default function StoryEventModal({ event, snapshot, storyState, campaign, onChoiceMade }: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [outcomeFlash, setOutcomeFlash] = useState<"success" | "fail" | null>(null);
  const [shakeChoiceId, setShakeChoiceId] = useState<string | null>(null);

  // Inject flash keyframe once
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("story-flash-style")) return;
    const style = document.createElement("style");
    style.id = "story-flash-style";
    style.textContent = `
      @keyframes story-flash { 0% { opacity:1; } 100% { opacity:0; } }
      @keyframes story-shake {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-6px); }
        40%     { transform: translateX(6px); }
        60%     { transform: translateX(-4px); }
        80%     { transform: translateX(4px); }
      }
      .story-shake { animation: story-shake 0.35s ease-out; }
    `;
    document.head.appendChild(style);
  }, []);

  // Entrance
  useEffect(() => {
    haptic.light();
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

  async function handleLockedClick(choiceId: string) {
    playError();
    haptic.warning();
    setShakeChoiceId(choiceId);
    setTimeout(() => setShakeChoiceId(null), 400);
  }

  async function handleChoiceClick(choice: StoryChoice) {
    if (isChoiceLocked(choice)) { handleLockedClick(choice.id); return; }
    if (isResolving) return;

    playWav("click");
    haptic.medium();
    setSelectedChoice(choice.id);
    setIsResolving(true);

    // Determine success
    const rate = choice.successRate ?? 1.0;
    const succeeded = Math.random() < rate;

    // Brief dramatic pause
    await new Promise((r) => setTimeout(r, 600));

    // Outcome flash
    const flashType = succeeded ? "success" : "fail";
    setOutcomeFlash(flashType);
    if (succeeded) { playWav("success", { volume: 0.5 }); haptic.success(); }
    else           { playWav("fail",    { volume: 0.45 }); haptic.error(); }

    await new Promise((r) => setTimeout(r, 350));
    setOutcomeFlash(null);

    onChoiceMade(choice.id, succeeded);
  }

  const actDef = campaign.acts.find((a) => a.act === event.act);
  const accentColor = campaign.themeColors.accent;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <OutcomeFlash type={outcomeFlash} />

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

        {/* Description — typewriter */}
        <div className="px-5 pb-4">
          <TypewriterText text={event.description} onDone={() => setTypingDone(true)} />
        </div>

        {/* Wisdom Callout */}
        {typingDone && (() => {
          const wisdom = getWisdomForEvent(event.id);
          if (!wisdom) return null;
          const categoryStyles: Record<string, { bg: string; border: string; icon: string; label: string; textColor: string }> = {
            lesson:    { bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.25)",  icon: "📘", label: "Founder's Lesson",   textColor: "#a5b4fc" },
            warning:   { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  icon: "⚠️", label: "Watch Out",         textColor: "#fcd34d" },
            insight:   { bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)",  icon: "💡", label: "Key Insight",       textColor: "#6ee7b7" },
            principle: { bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.25)",  icon: "🧭", label: "Business Principle", textColor: "#d8b4fe" },
          };
          const s = categoryStyles[wisdom.category];
          return (
            <div
              className="mx-5 mb-4 rounded-xl p-3.5"
              style={{ background: s.bg, border: `1px solid ${s.border}`, animation: "story-flash-in 0.4s ease" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{s.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: s.textColor }}>{s.label}</span>
              </div>
              <p className="text-xs leading-relaxed italic" style={{ color: s.textColor, opacity: 0.9 }}>"{wisdom.quote}"</p>
            </div>
          );
        })()}

        {/* Choices */}
        <div
          className="px-5 pb-6 space-y-3"
          style={{
            opacity: typingDone ? 1 : 0,
            transform: typingDone ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {event.choices.map((choice) => {
            const locked = isChoiceLocked(choice);
            const isSelected = selectedChoice === choice.id;
            const isShaking = shakeChoiceId === choice.id;

            return (
              <button
                key={choice.id}
                onClick={() => locked ? handleLockedClick(choice.id) : handleChoiceClick(choice)}
                disabled={isResolving && !locked}
                className={`w-full text-left rounded-xl p-4 transition-all duration-200 group relative overflow-hidden ${isShaking ? "story-shake" : ""}`}
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
