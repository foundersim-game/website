"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, FolderOpen, Trash2, HelpCircle, Award, History, Trophy } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HowToPlayContent } from "@/components/HowToPlay";
import { Button } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";
import { getLegacyData, LegacyData, PERKS, Perk, buyPerk } from "@/lib/engine/legacy";
import { toast, Toaster } from "sonner";
import { DollarSign, ShieldCheck, Zap as ZapIcon, Rocket as RocketIcon, Settings } from "lucide-react";

export type SaveSlot = {
  id: string;
  date: string;
  companyName: string;
  stage: string;
  valuation: number;
  logo?: string;
  brandColor?: string;
  data: any;
};

const MAX_SLOTS = 6;

function formatSaveDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}


const STAGE_COLORS: Record<string, string> = {
  "Bootstrapping": "bg-slate-100 text-slate-600",
  "Angel Investment": "bg-amber-50 text-amber-700 border-amber-200",
  "Seed Round": "bg-green-50 text-green-700 border-green-200",
  "Series A": "bg-blue-50 text-blue-700 border-blue-200",
};


export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [savedGames, setSavedGames] = useState<SaveSlot[]>([]);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [legacyData, setLegacyData] = useState<LegacyData | null>(null);

  const [hasActiveGame, setHasActiveGame] = useState(false);


  useEffect(() => {
    const seen = sessionStorage.getItem("founder_sim_splash_seen");
    if (seen) { setShowSplash(false); }
    else {
      const t = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("founder_sim_splash_seen", "true");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const loadSaves = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("founder_sim_saves") || "[]") as SaveSlot[];
      let sorted = raw.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sorted.length > MAX_SLOTS) {
        sorted = sorted.slice(0, MAX_SLOTS);
        localStorage.setItem("founder_sim_saves", JSON.stringify(sorted));
      }
      setSavedGames(sorted);

      const activeState = localStorage.getItem("founder_sim_state");
      setHasActiveGame(!!activeState);
    } catch {
      setSavedGames([]);
      setHasActiveGame(false);
    }
  };

  useEffect(() => { 
    loadSaves(); 
    setLegacyData(getLegacyData());

    const handleFocus = () => {
      setLegacyData(getLegacyData());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  const handleNewGame = () => {
    localStorage.removeItem("founder_sim_state");
    localStorage.removeItem("founder_data");
    router.push("/create-founder");
  };

  const handleLoad = (save: SaveSlot) => {
    localStorage.setItem("founder_sim_state", JSON.stringify(save.data));
    router.push("/dashboard");
  };

  const handleDelete = (id: string) => {
    const updated = savedGames.filter(s => s.id !== id);
    localStorage.setItem("founder_sim_saves", JSON.stringify(updated));
    setSavedGames(updated);
    setConfirmDelete(null);
  };

  const stageColor = (stage: string) => STAGE_COLORS[stage] || "bg-slate-100 text-slate-600";

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden relative bg-white select-none">

      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-200 mb-6">
                <Zap className="size-10 text-white fill-white" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900">
                FOUNDER<span className="text-indigo-500 italic">SIM</span>
              </h1>
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400"
              >
                Loading...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorations */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-50 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-100/70 blur-[60px] -z-10" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sky-100/70 blur-[60px] -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-indigo-100/50 blur-[40px] -z-10" />

      {/* Main Content */}
      <div className="w-full max-w-sm mx-auto flex flex-col min-h-[100dvh] px-6 py-12 relative z-10">

        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex flex-col items-center flex-1 justify-center gap-2"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-200 mb-2">
            <Zap className="size-8 text-white fill-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 text-center leading-tight">
            FOUNDER<span className="text-indigo-500 italic">SIM</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-1">
            Build · Grow · Exit
          </p>

          {/* Version tag */}
          <div className="mt-4 flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">v2.1 · Founder's Legacy</span>
          </div>

          {/* Legacy Stats */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 grid grid-cols-2 gap-3 w-full"
          >
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-3 flex flex-col items-center shadow-sm">
              <Trophy className="size-4 text-amber-500 mb-1" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exits</p>
              <p className="text-xl font-black text-slate-900">{legacyData?.totalExits || 0}</p>
            </div>
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-3 flex flex-col items-center shadow-sm">
              <Award className="size-4 text-indigo-500 mb-1" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</p>
              <p className="text-xl font-black text-slate-900">{legacyData?.unspentPoints || 0} XP</p>
            </div>
          </motion.div>

          {/* Hall of Fame Snippet */}
          <div className="mt-6 w-full">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center flex items-center justify-center gap-2">
               <History className="size-3" /> Hall of Fame
             </p>
             <div className="space-y-2">
               {legacyData && legacyData.hallOfFame.length > 0 ? (
                 legacyData.hallOfFame.slice(0, 2).map(entry => (
                   <div key={entry.id} className="bg-slate-50/50 border border-slate-100 rounded-xl px-3 py-2 flex items-center justify-between">
                     <div>
                       <p className="text-[10px] font-black text-slate-800">{entry.companyName}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{entry.outcome} · {formatMoney(entry.valuation)}</p>
                     </div>
                     <span className="text-[10px] font-black text-indigo-600">+{entry.pointsEarned} XP</span>
                   </div>
                 ))
               ) : (
                 <div className="bg-slate-50/30 border border-dashed border-slate-100 rounded-xl px-3 py-4 text-center">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No entries yet</p>
                 </div>
               )}
             </div>
          </div>

          {/* Feature tags */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {["🏢 Real Unit Economics", "📈 100+ Events", "🎯 Sales Pipeline", "🤝 Co-Founders"].map(tag => (
              <span key={tag} className="text-[9px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">{tag}</span>
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="flex flex-col gap-3 mt-8 mb-8"
        >
          {hasActiveGame && (
            <button
              onClick={handleContinue}
              className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black text-base uppercase tracking-[0.15em] shadow-xl shadow-indigo-100 active:scale-95 transition-transform flex items-center justify-center gap-2 relative overflow-hidden group border-2 border-indigo-400"
            >
              <Zap className="size-5 fill-white" />
              Continue Game
            </button>
          )}

          <button
            onClick={handleNewGame}
            className={cn(
              "w-full rounded-2xl font-black text-base uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 relative overflow-hidden group",
              hasActiveGame
                ? "h-14 bg-white border-2 border-slate-200 text-slate-600 shadow-sm"
                : "h-16 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-200"
            )}
          >
            {!hasActiveGame && <Plus className="size-5" />}
            New Game
          </button>

          <button
            onClick={() => { loadSaves(); setShowLoadModal(true); }}
            className="w-full h-14 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm uppercase tracking-[0.15em] hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <FolderOpen className="size-4 text-slate-500" />
            Load Game
            {savedGames.length > 0 && (
              <span className="ml-1 text-[9px] font-black bg-indigo-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {savedGames.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowHowToPlay(true)}
            className="w-full h-14 rounded-2xl bg-white text-slate-600 font-bold text-sm uppercase tracking-widest border-2 border-slate-100 hover:border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <HelpCircle className="size-4" />
            How to Play
          </button>

        </motion.div>

        <p className="text-center text-[9px] text-slate-300 font-medium pb-4">
          FounderSim · Real startup simulation
        </p>
      </div>

      {/* Load Game Modal */}
      <AnimatePresence>
        {showLoadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowLoadModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-full max-w-sm bg-white rounded-t-[2rem] p-6 shadow-2xl max-h-[85dvh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              <h2 className="text-lg font-black text-slate-900 mb-1">Load Game</h2>
              <p className="text-[11px] text-slate-400 mb-4">{savedGames.length}/{MAX_SLOTS} slots used</p>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {/* Filled Slots */}
                {savedGames.map(save => (
                  <div key={save.id} className="relative">
                    {confirmDelete === save.id ? (
                      <div className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50 flex items-center justify-between">
                        <p className="text-sm font-bold text-rose-700">Delete this save?</p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDelete(null)} className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-xl bg-white border border-slate-200">Cancel</button>
                          <button onClick={() => handleDelete(save.id)} className="text-xs font-bold text-white px-3 py-1.5 rounded-xl bg-rose-500">Delete</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleLoad(save)}
                        className="p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="flex items-start gap-3">
                          {/* Logo */}
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                            style={{ background: save.brandColor ? `${save.brandColor}20` : '#eef2ff' }}>
                            {save.logo || '🚀'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-900 text-sm truncate">{save.companyName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{formatSaveDate(save.date)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${stageColor(save.stage)}`}>
                                {save.stage}
                              </span>
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {formatMoney(save.valuation)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDelete(save.id); }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-400 transition-colors shrink-0"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, MAX_SLOTS - savedGames.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-4 rounded-2xl border-2 border-dashed border-slate-100 flex items-center gap-3 opacity-40">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <Plus className="size-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Empty Slot</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowLoadModal(false)}
                className="mt-4 w-full h-12 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How to Play Modal */}
      <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
        <DialogContent className="sm:max-w-2xl bg-white border-slate-200 border-4 rounded-[2rem] p-0 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col items-stretch [&>button]:hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8 relative">
            <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer" onClick={() => setShowHowToPlay(false)}>✕</div>
            <h2 className="text-2xl font-black tracking-tight text-white mb-1 leading-none">How To Play</h2>
            <p className="text-indigo-200 text-sm font-medium">Your guide to building a unicorn.</p>
          </div>

          <HowToPlayContent />

          <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <Button className="rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 h-12 w-full sm:w-auto px-10 shadow-lg shadow-indigo-600/20" onClick={() => setShowHowToPlay(false)}>GOT IT, LET'S BUILD</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster position="top-center" />
    </main>
  );
}
