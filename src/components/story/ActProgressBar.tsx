"use client";
// src/components/story/ActProgressBar.tsx
import React from "react";
import { StoryCampaign, StoryModeState } from "@/lib/story/types";

interface Props {
  campaign: StoryCampaign;
  storyState: StoryModeState;
  currentMonth: number;
}

export default function ActProgressBar({ campaign, storyState, currentMonth }: Props) {
  const currentAct = storyState.currentAct;
  const completed = new Set(storyState.completedEventIds);

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Campaign Progress</span>
        <span className="text-xs text-slate-500">Month {currentMonth}</span>
      </div>

      {/* Act blocks */}
      <div className="flex gap-1.5">
        {campaign.acts.map((act) => {
          const actEvents = campaign.events.filter((e) => e.act === act.act);
          const doneCount = actEvents.filter((e) => completed.has(e.id)).length;
          const progress = actEvents.length > 0 ? doneCount / actEvents.length : 0;
          const isCurrent = act.act === currentAct;
          const isPast = act.act < currentAct;

          return (
            <div key={act.act} className="flex-1">
              <div
                className="h-2 rounded-full overflow-hidden mb-1"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress * 100}%`,
                    background: isPast
                      ? "rgba(255,255,255,0.3)"
                      : isCurrent
                      ? `linear-gradient(90deg, ${getCampaignActColor(act.act, campaign)})`
                      : "rgba(255,255,255,0.05)",
                  }}
                />
              </div>
              <div
                className="text-xs font-bold truncate leading-tight"
                style={{
                  color: isCurrent
                    ? "white"
                    : isPast
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(255,255,255,0.2)",
                  fontSize: "0.6rem",
                }}
              >
                {isCurrent && <span style={{ color: "#fbbf24" }}>▶ </span>}
                ACT {act.act}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current act title */}
      {campaign.acts.find((a) => a.act === currentAct) && (
        <div className="mt-2 text-xs text-slate-400 italic">
          &quot;{campaign.acts.find((a) => a.act === currentAct)!.title}&quot;
        </div>
      )}
    </div>
  );
}

function getCampaignActColor(act: number, campaign: StoryCampaign): string {
  const actDef = campaign.acts.find((a) => a.act === act);
  if (!actDef) return campaign.themeColors.accent;
  // Use campaign accent color, vary opacity by act
  return `${campaign.themeColors.accent}cc, ${campaign.themeColors.accent}88`;
}
