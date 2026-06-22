"use client";
// src/app/story-mode/[campaignId]/play/page.tsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getCampaign,
  initializeStoryState,
  initializeStorySnapshot,
  getStorySaveKey,
  STORY_SAVE_VERSION,
} from "@/lib/story/engine";
import { StorySaveFile, StoryModeState, StoryStartupSnapshot } from "@/lib/story/types";
import StoryDashboard from "@/components/story/StoryDashboard";

type LoadState = "loading" | "ready" | "error";

export default function StoryPlayPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = (params?.campaignId as string) ?? "";

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [snapshot, setSnapshot] = useState<StoryStartupSnapshot | null>(null);
  const [storyState, setStoryState] = useState<StoryModeState | null>(null);

  // ── Load or initialize on mount ─────────────────────────────────────────────
  useEffect(() => {
    const campaign = getCampaign(campaignId);
    if (!campaign) {
      setLoadState("error");
      return;
    }

    const saveKey = getStorySaveKey(campaignId);

    try {
      const raw = localStorage.getItem(saveKey);
      if (raw) {
        const save = JSON.parse(raw) as StorySaveFile;
        // Version check — if mismatch, start fresh (future-proof)
        if (save.version !== STORY_SAVE_VERSION) {
          localStorage.removeItem(saveKey);
          throw new Error("Save version mismatch — starting fresh.");
        }
        setSnapshot(save.startupSnapshot);
        setStoryState(save.storyState);
      } else {
        // New game
        const newSnapshot = initializeStorySnapshot(campaignId);
        const newStoryState = initializeStoryState(campaignId);
        if (!newSnapshot || !newStoryState) throw new Error("Could not initialize campaign.");
        setSnapshot(newSnapshot);
        setStoryState(newStoryState);
      }
      setLoadState("ready");
    } catch (err) {
      console.error("[Story Mode] Load error:", err);
      // Attempt fresh start
      try {
        const newSnapshot = initializeStorySnapshot(campaignId);
        const newStoryState = initializeStoryState(campaignId);
        if (newSnapshot && newStoryState) {
          setSnapshot(newSnapshot);
          setStoryState(newStoryState);
          setLoadState("ready");
          return;
        }
      } catch {}
      setLoadState("error");
    }
  }, [campaignId]);

  // ── Save handler (called by StoryDashboard after every action) ──────────────
  function handleSave(newSnapshot: StoryStartupSnapshot, newStoryState: StoryModeState) {
    try {
      const saveFile: StorySaveFile = {
        storyState: newStoryState,
        startupSnapshot: newSnapshot,
        savedAt: new Date().toISOString(),
        version: STORY_SAVE_VERSION,
      };
      localStorage.setItem(getStorySaveKey(campaignId), JSON.stringify(saveFile));
    } catch (err) {
      console.error("[Story Mode] Save error:", err);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadState === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#08080f" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📖</div>
          <div className="text-slate-400 text-sm font-medium">Loading your story...</div>
        </div>
      </div>
    );
  }

  if (loadState === "error" || !snapshot || !storyState) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: "#08080f" }}
      >
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-black text-white mb-2">Campaign Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          The campaign "{campaignId}" doesn't exist or could not be loaded.
        </p>
        <button
          onClick={() => router.push("/story-mode")}
          className="px-6 py-3 rounded-xl font-bold text-white"
          style={{ background: "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.5)" }}
        >
          ← Back to Campaigns
        </button>
      </div>
    );
  }

  const campaign = getCampaign(campaignId)!;

  return (
    <StoryDashboard
      campaign={campaign}
      initialSnapshot={snapshot}
      initialStoryState={storyState}
      onSave={handleSave}
    />
  );
}
