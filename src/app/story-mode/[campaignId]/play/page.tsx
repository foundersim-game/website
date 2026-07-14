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
import { iapService, IAP_PRODUCT_IDS } from "@/lib/services/iapService";

type LoadState = "loading" | "ready" | "error";

export default function StoryPlayPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = (params?.campaignId as string) ?? "";

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [snapshot, setSnapshot] = useState<StoryStartupSnapshot | null>(null);
  const [storyState, setStoryState] = useState<StoryModeState | null>(null);
  const [hasRewindPoint, setHasRewindPoint] = useState(false);

  // ── Load or initialize on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function loadCampaign() {
      // 1. IAP Gate Check
      const owned = await iapService.getOwnedNonConsumables();
      if (!owned.includes(IAP_PRODUCT_IDS.STORY_PACK) && !owned.includes(IAP_PRODUCT_IDS.AD_FREE)) {
        console.warn("[Story Mode] User does not own the Story Pack. Redirecting.");
        router.replace("/story-mode");
        return;
      }

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
          setHasRewindPoint(!!save.previousMonthState && !!save.previousMonthSnapshot);
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
    }
    
    loadCampaign();
  }, [campaignId, router]);

  // ── Save handler (called by StoryDashboard after every action) ──────────────
  function handleSave(newSnapshot: StoryStartupSnapshot, newStoryState: StoryModeState) {
    try {
      const saveKey = getStorySaveKey(campaignId);
      const raw = localStorage.getItem(saveKey);
      let prevSave: StorySaveFile | null = null;
      if (raw) prevSave = JSON.parse(raw);

      // If month advanced, save the state exactly AT the month transition as the rewind point
      // If we are currently inside the month, keep the existing rewind point
      const isMonthTransition = prevSave && prevSave.storyState && prevSave.storyState.currentMonth < newStoryState.currentMonth;
      
      const pState = isMonthTransition ? newStoryState : prevSave?.previousMonthState;
      const pSnap = isMonthTransition ? newSnapshot : prevSave?.previousMonthSnapshot;

      const saveFile: StorySaveFile = {
        storyState: newStoryState,
        startupSnapshot: newSnapshot,
        previousMonthState: pState,
        previousMonthSnapshot: pSnap,
        savedAt: new Date().toISOString(),
        version: STORY_SAVE_VERSION,
      };
      localStorage.setItem(saveKey, JSON.stringify(saveFile));
      setHasRewindPoint(!!pState && !!pSnap);
    } catch (err) {
      console.error("[Story Mode] Save error:", err);
    }
  }

  // ── Rewind handler ────────────────────────────────────────────────────────
  function handleRewind() {
    try {
      const saveKey = getStorySaveKey(campaignId);
      const raw = localStorage.getItem(saveKey);
      if (!raw) return;
      const save = JSON.parse(raw) as StorySaveFile;
      if (save.previousMonthState && save.previousMonthSnapshot) {
        setStoryState(save.previousMonthState);
        setSnapshot(save.previousMonthSnapshot);
        
        // Remove the rewind point so they can't double-rewind infinitely
        const newSave: StorySaveFile = {
            ...save,
            storyState: save.previousMonthState,
            startupSnapshot: save.previousMonthSnapshot,
            previousMonthState: undefined,
            previousMonthSnapshot: undefined,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(saveKey, JSON.stringify(newSave));
        setHasRewindPoint(false);
      }
    } catch (err) {
      console.error("[Story Mode] Rewind error:", err);
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
          The campaign &quot;{campaignId}&quot; doesn&apos;t exist or could not be loaded.
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
      hasRewindPoint={hasRewindPoint}
      onRewind={handleRewind}
      onSave={handleSave}
    />
  );
}
