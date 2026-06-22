"use client";
// src/app/story-mode/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Story Mode Campaign Selection Screen.
// Replaces the previous teaser/waitlist page entirely.
// Sandbox code at /dashboard is completely unaffected.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CAMPAIGNS } from "@/lib/story/engine";
import { StoryCampaign, CampaignId } from "@/lib/story/types";
import { getStorySaveKey } from "@/lib/story/engine";
import type { StorySaveFile } from "@/lib/story/types";

const CAMPAIGN_IDS: CampaignId[] = ["pineapple", "bookface", "searchgo"];

function formatValuation(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3)  return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

export default function StoryModeSelectionPage() {
  const router = useRouter();
  const [saves, setSaves] = useState<Record<string, StorySaveFile | null>>({});
  const [visible, setVisible] = useState(false);

  // Load existing saves from localStorage
  useEffect(() => {
    const loaded: Record<string, StorySaveFile | null> = {};
    CAMPAIGN_IDS.forEach((id) => {
      try {
        const raw = localStorage.getItem(getStorySaveKey(id));
        loaded[id] = raw ? (JSON.parse(raw) as StorySaveFile) : null;
      } catch {
        loaded[id] = null;
      }
    });
    setSaves(loaded);
    setTimeout(() => setVisible(true), 50);
  }, []);

  function handleStart(campaignId: CampaignId) {
    router.push(`/story-mode/${campaignId}/play`);
  }

  function handleDelete(campaignId: CampaignId) {
    localStorage.removeItem(getStorySaveKey(campaignId));
    setSaves((prev) => ({ ...prev, [campaignId]: null }));
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #08080f 0%, #0d0d18 100%)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-5"
        style={{
          background: "rgba(8,8,15,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "calc(env(safe-area-inset-top, 20px) + 12px)",
          paddingBottom: "12px",
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div
          className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase"
          style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          ✦ Story Mode
        </div>
      </div>

      {/* Hero */}
      <div
        className="px-5 pt-8 pb-6 text-center"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        <div className="text-5xl mb-4">📖</div>
        <h1 className="text-3xl font-black text-white mb-3 leading-tight">
          Choose Your<br />Founder Story
        </h1>
        <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
          Step into the shoes of history's most iconic founders.
          Every decision is yours. Every consequence is real.
        </p>
      </div>

      {/* Campaign Cards */}
      <div
        className="px-4 pb-12 space-y-4 max-w-2xl mx-auto w-full"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
      >
        {CAMPAIGN_IDS.map((id, idx) => {
          const campaign = CAMPAIGNS[id] as StoryCampaign;
          if (!campaign) return null;
          const save = saves[id];
          const hasSave = !!save;

          return (
            <CampaignCard
              key={id}
              campaign={campaign}
              save={save ?? null}
              hasSave={hasSave}
              index={idx}
              onStart={() => handleStart(id)}
              onDelete={() => handleDelete(id)}
            />
          );
        })}

        {/* Coming Soon — AeroSpaceX */}
        <div
          className="rounded-2xl p-5 opacity-40"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <div>
              <div className="text-sm font-bold text-slate-400">AeroSpaceX</div>
              <div className="text-xs text-slate-600">Legendary Difficulty — Coming Soon</div>
            </div>
            <div className="ml-auto text-xs text-slate-600 font-bold uppercase tracking-wider">🔒</div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Campaign Card ──────────────────────────────────────────────────────────────

function CampaignCard({
  campaign,
  save,
  hasSave,
  index,
  onStart,
  onDelete,
}: {
  campaign: StoryCampaign;
  save: StorySaveFile | null;
  hasSave: boolean;
  index: number;
  onStart: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const accent = campaign.themeColors.accent;

  const difficultyColor: Record<string, string> = {
    Normal: "#22c55e",
    Hard: "#f97316",
    Legendary: "#ef4444",
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${accent}44`,
        boxShadow: `0 0 40px ${accent}11`,
        animation: `fadeSlideUp 0.4s ease ${index * 0.08}s both`,
      }}
    >
      {/* Campaign Header Banner */}
      <div
        className="px-5 py-5 flex items-center gap-4"
        style={{
          background: `linear-gradient(135deg, ${accent}22, transparent)`,
          borderBottom: `1px solid ${accent}22`,
        }}
      >
        <span className="text-4xl">{campaign.founderEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl font-black text-white">{campaign.companyName}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                background: `${difficultyColor[campaign.difficulty] ?? "#fff"}22`,
                color: difficultyColor[campaign.difficulty] ?? "#fff",
              }}
            >
              {campaign.difficulty}
            </span>
          </div>
          <div className="text-xs text-slate-400">{campaign.tagline}</div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <p className="text-sm text-slate-400 leading-relaxed mb-4">{campaign.description}</p>

        {/* Win Condition */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs"
          style={{ background: `${accent}11`, border: `1px solid ${accent}33` }}
        >
          <span>🏆</span>
          <span className="text-slate-300 font-medium">{campaign.winCondition.description}</span>
        </div>

        {/* Save Info */}
        {hasSave && save && (
          <div
            className="flex items-center justify-between px-3 py-2 rounded-lg mb-4 text-xs"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div>
              <span className="text-slate-500">Month </span>
              <span className="text-white font-bold">{save.storyState.currentMonth}</span>
              <span className="text-slate-500 mx-2">·</span>
              <span className="text-slate-500">Val: </span>
              <span className="font-bold" style={{ color: accent }}>
                {formatValuation(save.startupSnapshot.valuation)}
              </span>
            </div>
            <div className="text-slate-600">
              {new Date(save.savedAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Acts preview */}
        <div className="flex gap-1 mb-4">
          {campaign.acts.map((act) => (
            <div
              key={act.act}
              className="flex-1 text-center py-1.5 rounded-lg"
              style={{ background: `${accent}11` }}
            >
              <div className="text-xs font-black" style={{ color: `${accent}cc` }}>
                {act.act}
              </div>
              <div className="text-[0.55rem] text-slate-600 leading-tight truncate px-1">
                {act.title.split(" ").slice(0, 2).join(" ")}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onStart}
            className="flex-1 py-3.5 rounded-xl font-black text-sm text-white transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${accent}ee, ${accent}88)`,
              boxShadow: `0 6px 20px ${accent}44`,
            }}
          >
            {hasSave ? "▶ Continue Story" : "▶ Start Campaign"}
          </button>

          {hasSave && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-3.5 rounded-xl text-slate-500 hover:text-red-400 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              🗑
            </button>
          )}

          {confirmDelete && (
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="px-4 py-3.5 rounded-xl text-red-400 font-bold text-xs transition-all"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              Confirm Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Keyframe animation injected via style tag
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
