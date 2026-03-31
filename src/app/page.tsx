"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, FolderOpen, Trash2, HelpCircle, Award, History, Trophy, Sun, Moon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HowToPlayContent } from "@/components/HowToPlay";
import { Button } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";
import { getLegacyData, LegacyData, PERKS, Perk, buyPerk } from "@/lib/engine/legacy";
import { toast, Toaster } from "sonner";
import { DollarSign, ShieldCheck, Zap as ZapIcon, Rocket as RocketIcon, Settings } from "lucide-react";
import { adService } from "@/lib/services/adService";
import { useTheme } from "@/components/ThemeProvider";

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
  "Bootstrapping": "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  "Angel Investment": "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
  "Seed Round": "bg-green-50 dark:bg-emerald-950/30 text-green-700 dark:text-emerald-400 border-green-200 dark:border-emerald-900/50",
  "Series A": "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
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
  const { toggleTheme, isDark } = useTheme();


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
    adService.hideBanner();
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
    localStorage.setItem("founder_sim_state", JSON.stringify({ 
      ...save.data, 
      founderMeta: { logo: save.logo, brandColor: save.brandColor } 
    }));
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
    <main className="min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden relative bg-slate-50 dark:bg-slate-950 select-none">

      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-[2rem] shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/50 mb-6 overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <img src="/app-logo.png" alt="Founder Sim" className="w-full h-full object-cover" />
              </div>
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-500 dark:text-indigo-400"
              >
                Loading...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorations - Immersive & Premium */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-indigo-100/40 dark:from-indigo-950/40 to-transparent" />
        <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] aspect-square rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px]" />
        
        {/* Animated Floating Elements */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              y: [null, "-20%", "20%", null],
              opacity: [0, 0.4, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 15 + Math.random() * 10, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "linear"
            }}
            className="absolute text-2xl select-none grayscale-[0.5] opacity-20 dark:opacity-10 pointer-events-none"
          >
            {i % 3 === 0 ? "🚀" : i % 3 === 1 ? "💰" : "✨"}
          </motion.div>
        ))}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed z-40 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"
        style={{ top: 'calc(var(--sat, 0px) + 16px)', right: '16px' }}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      {/* Main Content - Compact & Zero-Scroll */}
      <div 
        className="w-full max-w-sm mx-auto flex flex-col h-[100dvh] px-6 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] relative z-10 overflow-hidden"
        style={{ paddingTop: 'calc(var(--sat, 0px) + 16px)' }}
      >

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="flex flex-col items-center flex-1 justify-center gap-1 min-h-0"
        >
          {/* Simple Premium Logo */}
          <div className="relative group mb-2">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500 rounded-full" />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-36 h-36 rounded-[2.5rem] shadow-xl shadow-indigo-500/10 dark:shadow-indigo-950/40 overflow-hidden relative z-10"
            >
              <img src="/app-logo.png" alt="Founder Sim" className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-3">
            Build · Grow · Exit
          </p>

          {/* Version tag - Refined v1.6 */}
          <div className="flex items-center gap-1.5 bg-slate-500/5 dark:bg-white/5 border border-slate-500/10 dark:border-white/10 rounded-full px-4 py-1.5">
            <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">VERSION 1.6</span>
          </div>

          {/* Career Stats - Compact Glassmorphic Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-2 gap-3 w-full"
          >
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-white/5 rounded-2xl p-3 flex flex-col items-center shadow-sm relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              <div className="size-8 rounded-xl bg-amber-500 shadow-lg shadow-amber-500/20 flex items-center justify-center text-white mb-1.5 group-hover:scale-110 transition-transform">
                <Trophy className="size-4" />
              </div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Exits</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{legacyData?.totalExits || 0}</p>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Wins</span>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-white/5 rounded-2xl p-3 flex flex-col items-center shadow-sm relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
              <div className="size-8 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 flex items-center justify-center text-white mb-1.5 group-hover:scale-110 transition-transform">
                <Award className="size-4" />
              </div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Experience</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{legacyData?.unspentPoints || 0}</p>
                <span className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">XP</span>
              </div>
            </div>
          </motion.div>

          {/* Hall of Fame - Compact */}
          <div className="mt-6 w-full min-h-0 flex flex-col relative">
             <div className="absolute inset-0 bg-indigo-500/5 blur-2xl -z-10" />
             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2 text-center flex items-center justify-center gap-2 shrink-0">
               <Trophy className="size-2.5 text-amber-500" /> The Hall of Fame
             </p>
             <div className="space-y-2 overflow-y-auto max-h-[140px] custom-scrollbar pr-1 min-h-[60px]">
               {legacyData && legacyData.hallOfFame.filter(e => e.outcome === 'ipo' || e.outcome === 'acquisition').length > 0 ? (
                 legacyData.hallOfFame
                   .filter(e => e.outcome === 'ipo' || e.outcome === 'acquisition')
                   .slice(0, 10)
                   .map(entry => (
                    <motion.div 
                      key={entry.id} 
                      whileHover={{ x: 4 }}
                      className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-white dark:border-white/5 shadow-sm rounded-xl px-3 py-2 flex items-center justify-between shrink-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-base">{entry.outcome === 'ipo' ? '🏛️' : '💰'}</div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">{entry.companyName}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                            <span className={cn(entry.outcome === 'ipo' ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400")}>{entry.outcome}</span> · {formatMoney(entry.valuation)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">+{entry.pointsEarned} XP</span>
                      </div>
                    </motion.div>
                  ))
               ) : (
                 <div className="bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl px-3 py-6 text-center flex flex-col items-center gap-1.5 group">
                   <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:scale-110 transition-transform">
                     <Award className="size-4" />
                   </div>
                   <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">No successful exits yet</p>
                 </div>
               )}
             </div>
          </div>

          {/* Feature Pills - Compact */}
          <div className="mt-6 flex flex-wrap gap-1.5 justify-center shrink-0">
            {[
              { label: "Real Unit Economics", icon: "🏢" },
              { label: "100+ Events", icon: "📈" },
              { label: "Sales Pipeline", icon: "🎯" },
              { label: "Co-Founders", icon: "🤝" }
            ].map(tag => (
              <span key={tag.label} className="text-[8px] font-black text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm border border-white dark:border-white/5 rounded-full px-2.5 py-1 flex items-center gap-1">
                <span className="opacity-80">{tag.icon}</span> {tag.label}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex flex-col gap-2.5 mt-auto mb-2 shrink-0"
        >
          {hasActiveGame && (
            <button
              onClick={handleContinue}
              className="group relative w-full h-14 rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/10 active:scale-95 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-[1px] bg-gradient-to-r from-indigo-400/20 to-violet-500/20 rounded-[15px] pointer-events-none border border-white/20" />
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                <div className="size-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <Zap className="size-4 fill-white text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black text-white/70 uppercase tracking-widest leading-none mb-0.5">Resume Career</p>
                  <p className="text-xs font-black text-white uppercase tracking-wider leading-none">CONTINUE GAME</p>
                </div>
              </div>
            </button>
          )}

          <button
            onClick={handleNewGame}
            className={cn(
              "group relative w-full rounded-2xl overflow-hidden transition-all active:scale-95 shadow-md",
              hasActiveGame ? "h-12" : "h-14 shadow-indigo-500/10"
            )}
          >
            {hasActiveGame ? (
              <>
                <div className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800" />
                <div className="absolute inset-0 group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-colors" />
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Plus className="size-3.5 text-slate-400" />
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">New Game</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-700" />
                <div className="absolute inset-0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-[1px] bg-gradient-to-r from-white/10 to-transparent rounded-[15px] border border-white/10" />
                <div className="relative z-10 flex items-center justify-center gap-2">
                   <Plus className="size-4 text-white" />
                   <span className="text-xs font-black text-white uppercase tracking-widest">START NEW JOURNEY</span>
                </div>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => { loadSaves(); setShowLoadModal(true); }}
              className="h-12 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-white/5 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 group"
            >
              <FolderOpen className="size-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Load Saves</span>
            </button>

            <button
              onClick={() => setShowHowToPlay(true)}
              className="h-12 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-white/5 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 group"
            >
              <HelpCircle className="size-3.5 text-slate-400 group-hover:text-violet-500 transition-colors" />
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quick Help</span>
            </button>
          </div>

        </motion.div>

        <div className="flex flex-col items-center gap-1.5 shrink-0 pb-2.5">
          <p className="text-[9px] text-slate-400 font-bold tracking-tight">
            FounderSim · Real startup simulation
          </p>
          <a 
            href="https://foundersim.fun/privacy" 
            target="_blank" 
            className="text-[9px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold hover:underline transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Load Game Modal */}
      <AnimatePresence>
        {showLoadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoadModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[2rem] p-6 shadow-2xl max-h-[85dvh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Load Game</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">{savedGames.length}/{MAX_SLOTS} slots used</p>

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
                className="mt-4 w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How to Play Modal */}
      <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-4 rounded-[2rem] p-0 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col items-stretch [&>button]:hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8 relative">
            <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer" onClick={() => setShowHowToPlay(false)}>✕</div>
            <h2 className="text-2xl font-black tracking-tight text-white mb-1 leading-none">How To Play</h2>
            <p className="text-indigo-200 text-sm font-medium">Your guide to building a unicorn.</p>
          </div>

          <HowToPlayContent />

          <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <Button className="rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 h-12 w-full sm:w-auto px-10 shadow-lg shadow-indigo-600/20" onClick={() => setShowHowToPlay(false)}>GOT IT, LET'S BUILD</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster position="top-center" />
    </main>
  );
}
