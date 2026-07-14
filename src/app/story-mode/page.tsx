"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, BookOpen, Play, Lock, RotateCcw, Clock, Sparkles, Info, History, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/audio";
import { analyticsService } from "@/lib/services/analyticsService";
import { getStorySaveKey, STORY_SAVE_VERSION } from "@/lib/story/engine";
import { iapService, IAP_PRODUCT_IDS } from "@/lib/services/iapService";
import { toast } from "sonner";
import TimelineArchiveModal from "@/components/story/TimelineArchiveModal";
import StoryLeaderboardModal from "@/components/story/StoryLeaderboardModal";
import { calculateLegacyPerks, FounderLegacyPerks } from "@/lib/story/legacyEngine";

// ─── Campaign Definitions ─────────────────────────────────────────────────────

const CAMPAIGNS = [
  {
    id: "pineapple",
    name: "Pineapple",
    subtitle: "The Hardware Monopoly",
    icon: "🍎",
    gradient: "from-slate-700 via-slate-800 to-slate-950",
    accentColor: "#a8b4c8",
    tagline: "A garage. A vision. A trillion-dollar empire.",
    description:
      "Start with $5,000 and a circuit board in your parents' garage. Build the personal computer, get ousted from your own company, return from exile, and create the most iconic product ecosystem in history.",
    features: [
      "25-year founder arc across 4 acts",
      "40+ story-branching events",
      "The Keynote mini-game",
      "Key people: Woz, Marcus K., Sullivan, Jon A.",
    ],
    difficulty: "Hard",
    duration: "~4–6 hrs",
    isPlayable: true,
  },
  {
    id: "bookface",
    name: "BookFace",
    subtitle: "The Social Empire",
    icon: "👥",
    gradient: "from-blue-700 via-blue-800 to-blue-950",
    accentColor: "#93c5fd",
    tagline: "From a dorm room to 3 billion users.",
    description:
      "Launch a campus social network and ruthlessly scale it to dominate human attention. Dilute your co-founders, survive privacy hearings, acquire PhotoGram before anyone else can, and pivot to the MetaVerse.",
    features: [
      "20-year empire-building arc",
      "Co-founder betrayal mechanics",
      "Congressional hearing events",
      "Viral loop & algorithm strategy",
    ],
    difficulty: "Medium",
    duration: "~3–5 hrs",
    isPlayable: true,
  },
  {
    id: "searchgo",
    name: "SearchGo",
    subtitle: "The Infinite Money Glitch",
    icon: "🔍",
    gradient: "from-emerald-700 via-teal-800 to-emerald-950",
    accentColor: "#6ee7b7",
    tagline: "Don't be evil. (Try, anyway.)",
    description:
      "Invent the world's best search algorithm from a campus dorm room. Build AdPrint into the greatest money machine in history, launch DroidOS, buy ViewTube, and fight a desperate war against Chat AI challengers.",
    features: [
      "20-year search-to-empire arc",
      "AdPrint monetization mechanics",
      "Moonshot project system",
      "The AI arms race end-game",
    ],
    difficulty: "Medium",
    duration: "~3–5 hrs",
    isPlayable: true,
  },
  {
    id: "cosmosx",
    name: "CosmosX",
    subtitle: "To Mars and Beyond",
    icon: "🚀",
    gradient: "from-rose-700 via-orange-800 to-red-950",
    accentColor: "#fca5a5",
    tagline: "Go bankrupt. Or go to orbit. Your call.",
    description:
      "Use your payout from a payments startup to build electric cars and reusable rockets simultaneously. Sleep on the factory floor, make headlines for the wrong reasons, and try not to run out of cash before you change the world.",
    features: [
      "Manufacturing hell mechanics",
      "Dual-company management",
      "Rocket launch mini-game",
      "Hostile media takeover events",
    ],
    difficulty: "Brutal",
    duration: "~5–7 hrs",
    isPlayable: false, // Coming soon
  },
];

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Hard: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    Brutal: "bg-red-600/30 text-red-400 border-red-600/40",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${colors[level] ?? colors.Medium}`}>
      {level}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StoryModeLobby() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveStates, setSaveStates] = useState<Record<string, boolean>>({});
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [hasStoryPack, setHasStoryPack] = useState<boolean | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [legacy, setLegacy] = useState<FounderLegacyPerks | null>(null);

  // Detect existing saves
  useEffect(() => {
    const found: Record<string, boolean> = {};
    CAMPAIGNS.forEach((c) => {
      try {
        const raw = localStorage.getItem(getStorySaveKey(c.id));
        if (raw) {
          const save = JSON.parse(raw);
          found[c.id] = save.version === STORY_SAVE_VERSION;
        }
      } catch {}
    });
    setSaveStates(found);

    // Check IAP
    iapService.getOwnedNonConsumables().then((owned) => {
      setHasStoryPack(owned.includes(IAP_PRODUCT_IDS.STORY_PACK) || owned.includes(IAP_PRODUCT_IDS.AD_FREE));
    });

    // Load legacy perks
    setLegacy(calculateLegacyPerks());
  }, []);

  async function handlePlay(campaignId: string) {
    playSound("click");
    
    // IAP Gate
    if (hasStoryPack === false) {
      setIsPurchasing(true);
      const success = await iapService.purchaseProduct(IAP_PRODUCT_IDS.STORY_PACK);
      setIsPurchasing(false);
      if (success) {
        setHasStoryPack(true);
        analyticsService.logEvent("story_mode_play", { campaign: campaignId });
        router.push(`/story-mode/${campaignId}/play`);
      }
      return;
    }

    analyticsService.logEvent("story_mode_play", { campaign: campaignId });
    router.push(`/story-mode/${campaignId}/play`);
  }

  function handleReset(campaignId: string) {
    try {
      localStorage.removeItem(getStorySaveKey(campaignId));
      setSaveStates((prev) => ({ ...prev, [campaignId]: false }));
    } catch {}
  }

  const selectedCampaign = CAMPAIGNS.find((c) => c.id === selectedId);

  return (
    <main className="min-h-[100dvh] h-[100dvh] bg-[#080810] flex flex-col relative overflow-hidden select-none">

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-indigo-600/8 blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-violet-600/8 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#080810_100%)]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 pt-[calc(env(safe-area-inset-top,40px)+0.75rem)] px-5 pb-3 flex items-center justify-between bg-[#080810]/80 backdrop-blur-xl border-b border-white/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { playSound("click"); router.back(); }}
          className="gap-1.5 text-slate-400 hover:text-white hover:bg-white/8 rounded-full pl-2 pr-4"
        >
          <ChevronLeft className="size-4" />
          <span className="font-bold text-xs">Back</span>
        </Button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-yellow-500 transition-colors mr-2"
          >
            <Trophy className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Rankings</span>
          </button>
          <button
            onClick={() => setShowArchive(true)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition-colors mr-2"
          >
            <History className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Archive</span>
          </button>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition-colors"
          >
            <Info className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Legal</span>
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pb-safe">
        <div className="px-5 pt-6 pb-2 max-w-2xl mx-auto">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-8"
          >
            <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/25 flex items-center justify-center mb-4 border border-white/10">
              <BookOpen className="size-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Story Mode</h1>
            <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
              Step into the shoes of fictional founders. Every decision shapes history — or breaks it.
            </p>
          </motion.div>

          {/* Campaign Cards */}
          <div className="space-y-3 mb-8">
            {CAMPAIGNS.map((campaign, idx) => {
              const hasSave = saveStates[campaign.id] === true;
              const isSelected = selectedId === campaign.id;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`relative rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                    isSelected
                      ? "border-white/20 shadow-xl shadow-black/40"
                      : "border-white/5 hover:border-white/10"
                  }`}
                  onClick={() => {
                    if (!campaign.isPlayable) return;
                    setSelectedId(isSelected ? null : campaign.id);
                    playSound("click");
                  }}
                >
                  {/* Banner */}
                  <div className={`h-14 bg-gradient-to-r ${campaign.gradient} relative flex items-center px-4 gap-3`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="text-2xl relative z-10">{campaign.icon}</span>
                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black text-base leading-none">{campaign.name}</span>
                        {!campaign.isPlayable && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-black/40 text-white/60 px-2 py-0.5 rounded-full border border-white/10">
                            Coming Soon
                          </span>
                        )}
                        {hasSave && campaign.isPlayable && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Saved
                          </span>
                        )}
                      </div>
                      <div className="text-white/50 text-[10px] font-bold tracking-wide mt-0.5">{campaign.subtitle}</div>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                      <DifficultyBadge level={campaign.difficulty} />
                      {campaign.isPlayable ? (
                        <ChevronRight className={`size-4 text-white/40 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                      ) : (
                        <Lock className="size-4 text-white/30" />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden bg-[#0d0d1a] border-t border-white/5"
                      >
                        <div className="p-4">
                          {/* Tagline */}
                          <p className="text-white/70 text-xs font-bold italic mb-3" style={{ color: campaign.accentColor }}>
                            "{campaign.tagline}"
                          </p>

                          {/* Description */}
                          <p className="text-slate-400 text-sm leading-relaxed mb-4">{campaign.description}</p>

                          {/* Features */}
                          <div className="grid grid-cols-2 gap-1.5 mb-4">
                            {campaign.features.map((f) => (
                              <div key={f} className="flex items-start gap-1.5">
                                <div className="size-1 rounded-full mt-1.5 shrink-0" style={{ background: campaign.accentColor }} />
                                <span className="text-slate-500 text-xs leading-snug">{f}</span>
                              </div>
                            ))}
                          </div>

                          {/* Founder's Legacy Perks */}
                          {legacy && legacy.totalWins > 0 && (
                            <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Sparkles className="size-3.5 text-amber-500" />
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Founder&apos;s Legacy Active</span>
                              </div>
                              <p className="text-xs text-amber-200/80 mb-2 leading-relaxed">
                                Your past victories ({legacy.totalWins}) grant the following starting bonuses to this campaign:
                              </p>
                              <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                                <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">+${(legacy.startingCashBonus / 1000).toFixed(0)}k Starting Cash</span>
                                <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">+{legacy.startingUsersBonus.toLocaleString()} Early Users</span>
                                <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">+{legacy.initialMoraleBonus} Starting Morale</span>
                              </div>
                            </div>
                          )}

                          {/* Meta row */}
                          <div className="flex items-center gap-3 mb-4 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <Clock className="size-3" />
                              <span>{campaign.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="size-3" />
                              <span>Autosave enabled</span>
                            </div>
                          </div>

                          {/* CTAs */}
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => { e.stopPropagation(); handlePlay(campaign.id); }}
                              disabled={isPurchasing}
                              className="flex-1 h-11 font-black rounded-xl gap-2 text-sm transition-all"
                              style={{ background: `linear-gradient(135deg, ${campaign.accentColor}33, ${campaign.accentColor}22)`, color: campaign.accentColor, border: `1px solid ${campaign.accentColor}40` }}
                            >
                              {isPurchasing ? (
                                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : hasStoryPack === false ? (
                                <Lock className="size-4 fill-current" />
                              ) : (
                                <Play className="size-4 fill-current" />
                              )}
                              {isPurchasing ? "Purchasing..." : hasStoryPack === false ? "Unlock Story Mode" : hasSave ? "Continue" : "Play Now"}
                            </Button>

                            {hasSave && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReset(campaign.id);
                                }}
                                variant="ghost"
                                className="h-11 px-3 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Reset save"
                              >
                                <RotateCcw className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Legal Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowDisclaimer(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#101018] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-white font-black text-lg mb-3">📜 Fictional Works Notice</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Story Mode is a work of <strong className="text-slate-300">fiction</strong> inspired by public business history. All characters, companies, and products — including Pineapple, BookFace, SearchGo, CosmosX, and every person in their stories — are entirely fictional.
              </p>
              <p className="text-slate-500 text-xs leading-relaxed mb-5">
                Any resemblance to real persons, living or dead, or real companies is for satirical and entertainment purposes only. Founder Sim does not claim affiliation with, endorsement by, or any connection to any real company or individual.
              </p>
              <Button
                onClick={() => setShowDisclaimer(false)}
                className="w-full h-11 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Timeline Archive Modal */}
      <AnimatePresence>
        {showArchive && <TimelineArchiveModal onClose={() => setShowArchive(false)} />}
      </AnimatePresence>
      
      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && <StoryLeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      </AnimatePresence>
    </main>
  );
}


