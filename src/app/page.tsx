"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, FolderOpen, Trash2, HelpCircle, Award, History, Trophy, Sun, Moon, BookOpen, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HowToPlayContent } from "@/components/HowToPlay";
import { Button } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";
import { getLegacyData, LegacyData, PERKS, Perk, buyPerk } from "@/lib/engine/legacy";
import { toast, Toaster } from "sonner";
import { adService } from "@/lib/services/adService";
import { useTheme } from "@/components/ThemeProvider";
import { playSound, playSynthSound } from "@/lib/audio";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { secureSave, secureLoad } from "@/lib/security";

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
  const [isPremium, setIsPremium] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const { t } = useTranslation();


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
      const raw = (secureLoad("founder_sim_saves") || []) as SaveSlot[];
      let sorted = raw.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sorted.length > MAX_SLOTS) {
        sorted = sorted.slice(0, MAX_SLOTS);
        secureSave("founder_sim_saves", sorted);
      }
      setSavedGames(sorted);

      const activeState = localStorage.getItem("founder_sim_state");
      setHasActiveGame(!!activeState);

      const premium = localStorage.getItem("founder_sim_premium") === "true" || localStorage.getItem("founder_sim_titan") === "true";
      setIsPremium(premium);
    } catch {
      setSavedGames([]);
      setHasActiveGame(false);
      setIsPremium(false);
    }
  };

  useEffect(() => {
    const premium = localStorage.getItem("founder_sim_premium") === "true" || localStorage.getItem("founder_sim_titan") === "true";
    if (premium) {
      adService.hideBanner();
    } else {
      adService.showBanner();
    }
    loadSaves();
    setLegacyData(getLegacyData());

    const handleFocus = () => {
      setLegacyData(getLegacyData());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleContinue = async () => {
    playSound("click");
    try {
      const { notificationService } = await import("@/lib/services/notificationService");
      await notificationService.askPermissions();
    } catch { }
    router.push("/dashboard");
  };

  const handleNewGame = async () => {
    playSound("click");
    try {
      const { notificationService } = await import("@/lib/services/notificationService");
      await notificationService.askPermissions();
    } catch { }
    localStorage.removeItem("founder_sim_state");
    localStorage.removeItem("founder_data");
    router.push("/create-founder");
  };

  const handleLoad = async (save: SaveSlot) => {
    playSound("click");
    try {
      const { notificationService } = await import("@/lib/services/notificationService");
      await notificationService.askPermissions();
    } catch { }
    localStorage.setItem("founder_sim_state", JSON.stringify({
      ...save.data,
      founderMeta: { logo: save.logo, brandColor: save.brandColor }
    }));
    router.push("/dashboard");
  };

  const handleDelete = (id: string) => {
    playSound("click");
    const updated = savedGames.filter(s => s.id !== id);
    secureSave("founder_sim_saves", updated);
    setSavedGames(updated);
    setConfirmDelete(null);
  };

  const stageColor = (stage: string) => STAGE_COLORS[stage] || "bg-slate-100 text-slate-600";

  return (
    <main className="h-[100dvh] flex flex-col items-center justify-center overflow-hidden relative bg-slate-50 dark:bg-slate-950 select-none">
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
              <div className="w-full max-w-[12rem] rounded-2xl shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/50 mb-6 overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <img src="/app-logo.png" alt="Founder Sim" className="w-full h-auto object-contain" />
              </div>
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-4 text-[0.625rem] font-bold uppercase tracking-[0.4em] text-indigo-500 dark:text-indigo-400"
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

      {/* Toggles (Theme & Language) */}
      <div 
        className="fixed z-40 flex flex-col gap-2"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: '16px' }}
      >
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90 self-end"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <LanguageSwitcher className="self-end" />
      </div>

      <div
        className={`w-full max-w-sm mx-auto flex flex-col h-[100dvh] px-6 relative z-10 overflow-hidden justify-evenly py-2 ${isPremium ? 'pb-[calc(env(safe-area-inset-bottom,0px)+8px)]' : 'pb-[calc(env(safe-area-inset-bottom,0px)+76px)] md:pb-[calc(env(safe-area-inset-bottom,0px)+120px)]'}`}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)'
        }}
      >
        {/* --- TOP SECTION (Logo & Stats) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="flex flex-col items-center gap-[max(1vh,0.5rem)] shrink w-full"
        >
          {/* Simple Premium Logo */}
          <div className="relative group mb-1 shrink-0 w-[min(15vh,6rem)] h-[min(15vh,6rem)] aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all duration-500 rounded-full" />
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-full h-full rounded-[1.5rem] shadow-xl shadow-indigo-500/10 dark:shadow-indigo-950/40 overflow-hidden relative z-10"
            >
              <img src="/app-logo.png" alt="Founder Sim" className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.2em] font-medium text-slate-500/80 dark:text-slate-400/80">
            <span>{t("home.subtitle", { defaultValue: "BUILD · GROW · EXIT" })}</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="px-3 py-1 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest backdrop-blur-sm">
              {t("home.version", { defaultValue: "VERSION 2.0.0" })}
            </div>
          </div>

          {/* Career Stats - Compact Glassmorphic Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-2 w-full shrink"
          >
            <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50 text-center shadow-lg shadow-slate-200/20 dark:shadow-none flex flex-col justify-between h-full w-full"
                    >
                      <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1 flex justify-center items-center gap-1.5 h-full">
                        <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{t("home.total_exits", { defaultValue: "TOTAL EXITS" })}</span>
                      </div>
                      <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-auto pt-1">
                        {legacyData ? legacyData.totalExits : 0} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{t("home.wins", { defaultValue: "WINS" })}</span>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md rounded-3xl p-5 border border-slate-200/50 dark:border-slate-700/50 text-center shadow-lg shadow-slate-200/20 dark:shadow-none flex flex-col justify-between h-full w-full"
                    >
                      <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1 flex justify-center items-center gap-1.5 h-full">
                        <Award className="w-3 h-3 text-purple-500 shrink-0" />
                        <span>{t("home.experience", { defaultValue: "EXPERIENCE" })}</span>
                      </div>
                      <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-auto pt-1">
                        {legacyData ? (legacyData.unspentPoints || 0).toLocaleString() : 0} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{t("home.xp", { defaultValue: "XP" })}</span>
                      </div>
                    </motion.div>
          </motion.div>
        </motion.div>

        {/* --- MIDDLE SECTION (Hall of Fame) --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="flex flex-col items-center w-full shrink min-h-[5rem] max-h-[35vh]"
        >
          {/* Hall of Fame - Compact */}
          <div className="w-full flex flex-col relative shrink h-full">
            <div className="absolute inset-0 bg-indigo-500/5 blur-2xl -z-10" />
            <div className="flex items-center justify-center gap-2 mb-3">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">{t("home.hall_of_fame", { defaultValue: "THE HALL OF FAME" })}</span>
                    </div>

                    {!legacyData || legacyData.hallOfFame.length === 0 ? (
                      <div className="h-12 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700/50 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider">{t("home.no_exits", { defaultValue: "NO SUCCESSFUL EXITS YET" })}</span>
                      </div>
                    ) : (
            <div className="space-y-1.5 overflow-y-auto w-full custom-scrollbar pr-1 shrink min-h-0 h-full">
              {legacyData && legacyData.hallOfFame.filter(e => e.outcome === 'ipo' || e.outcome === 'acquisition' || e.outcome === 'acquired').length > 0 ? (
                legacyData.hallOfFame
                  .filter(e => e.outcome === 'ipo' || e.outcome === 'acquisition' || e.outcome === 'acquired')
                  .slice(0, 10)
                  .map(entry => (
                    <motion.div
                      key={entry.id}
                      whileHover={{ x: 4 }}
                      className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-white dark:border-white/5 shadow-sm rounded-xl px-2.5 py-1.5 flex items-center justify-between shrink-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm">{entry.outcome === 'ipo' ? '🏛️' : '💰'}</div>
                        <div className="min-w-0">
                          <p className="text-[0.625rem] font-black text-slate-800 dark:text-slate-100 truncate">{entry.companyName}</p>
                          <p className="text-[0.5rem] font-bold text-slate-500 uppercase tracking-wider mt-0">
                            <span className={cn(entry.outcome === 'ipo' ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400")}>
                              {entry.outcome === 'acquired' || entry.outcome === 'acquisition' ? 'acquired' : entry.outcome}
                            </span> · {formatMoney(entry.valuation)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        <span className="text-[0.5rem] font-black text-indigo-600 dark:text-indigo-400">+{entry.pointsEarned} XP</span>
                      </div>
                    </motion.div>
                  ))
              ) : null}
            </div>
            )}
          </div>

          {/* Feature Pills - Compact */}
          <div className="mt-[max(1vh,0.5rem)] flex flex-wrap gap-1.5 justify-center shrink-0">
            {[
              { label: t("home.feature_economics", { defaultValue: "Real Unit Economics" }), icon: "🏢" },
              { label: t("home.feature_events", { defaultValue: "100+ Events" }), icon: "📈" },
              { label: t("home.feature_pipeline", { defaultValue: "Sales Pipeline" }), icon: "🎯" },
              { label: t("home.feature_cofounders", { defaultValue: "Co-Founders" }), icon: "🤝" }
            ].map(tag => (
              <span key={tag.label} className="text-[0.5rem] font-black text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm border border-white dark:border-white/5 rounded-full px-2.5 py-1 flex items-center gap-1">
                <span className="opacity-80">{tag.icon}</span> {tag.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* --- BOTTOM SECTION (Actions & Footer) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex flex-col gap-[max(1vh,0.5rem)] shrink-0 w-full"
        >
          {hasActiveGame && (
            <Button
                        onClick={() => router.push("/dashboard")}
                        className="w-full h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/25 border-none transition-all active:scale-[0.98]"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {t("home.continue_game", { defaultValue: "CONTINUE GAME" })}
                      </Button>
          )}

          <Button
                      onClick={() => router.push("/create-founder")}
                      variant="outline"
                      className="w-full h-14 rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs tracking-widest uppercase transition-all active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("home.new_game", { defaultValue: "NEW GAME" })}
                    </Button>

          <button
            onClick={() => { playSound("click"); router.push("/story-mode"); }}
            className={cn(
              "group relative w-full rounded-2xl overflow-hidden transition-all active:scale-95 shadow-lg shadow-amber-500/10 shrink-0 h-[min(6.5vh,3.25rem)] border-2 border-amber-200/50 dark:border-amber-900/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 backdrop-blur-sm"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="relative z-10 flex items-center justify-between px-4 h-full">
              <div className="flex items-center gap-2.5">
                <div className="size-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-inner">
                  <BookOpen className="size-3.5 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[0.6875rem] font-black text-amber-900 dark:text-amber-100 uppercase tracking-widest leading-none truncate max-w-[120px]">{t("home.story_mode", { defaultValue: "STORY MODE" })}</span>
                  <span className="text-[0.5rem] font-bold text-amber-700/70 dark:text-amber-400/70 uppercase tracking-wider mt-0.5 truncate max-w-[120px]">{t("home.rewrite_history", { defaultValue: "REWRITE HISTORY" })}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-2.5 py-1 rounded-full shadow-md animate-pulse">
                <Sparkles className="size-2.5 fill-white" />
                <span className="text-[0.5625rem] font-black uppercase tracking-widest leading-none mt-0.5">NEW</span>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-2 shrink-0">
            <button
              onClick={() => { playSound("click"); loadSaves(); setShowLoadModal(true); }}
              className="h-[min(6vh,3rem)] rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-white/5 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-0 group"
            >
              <FolderOpen className="size-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-[0.5rem] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("home.load_saves", { defaultValue: "LOAD SAVES" })}</span>
            </button>

            <button
              onClick={() => { playSound("click"); setShowHowToPlay(true); }}
              className="h-[min(6vh,3rem)] rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-white/5 shadow-sm hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-0 group"
            >
              <HelpCircle className="size-3 text-slate-400 group-hover:text-violet-500 transition-colors" />
              <span className="text-[0.5rem] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("home.quick_help", { defaultValue: "QUICK HELP" })}</span>
            </button>
          </div>

        </motion.div>

        <div className="flex flex-col items-center gap-[max(0.5vh,0.25rem)] shrink-0 pt-[max(0.5vh,0.25rem)] text-center">
          <p className="text-[0.5625rem] text-slate-400 font-bold tracking-tight">
            FounderSim · Real startup simulation
          </p>
          <p className="text-[0.5625rem] text-slate-400/80 font-bold tracking-tight">
            © {new Date().getFullYear()} SMISH Ventures. All rights reserved.
          </p>
          <a
            href="https://foundersim.fun/privacy"
            target="_blank"
            className="text-[0.5625rem] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold hover:underline transition-colors"
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
              <p className="text-[0.6875rem] text-slate-400 dark:text-slate-500 mb-4">{savedGames.length}/{MAX_SLOTS} slots used</p>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {/* Filled Slots */}
                {savedGames.map(save => (
                  <div key={save.id} className="relative">
                    {confirmDelete === save.id ? (
                      <div className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50 flex items-center justify-between">
                        <p className="text-sm font-bold text-rose-700">Delete this save?</p>
                        <div className="flex gap-2">
                          <button onClick={() => { playSound("click"); setConfirmDelete(null); }} className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-xl bg-white border border-slate-200">Cancel</button>
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
                            <p className="text-[0.625rem] text-slate-400 mt-0.5">{formatSaveDate(save.date)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[0.5625rem] font-bold px-2 py-0.5 rounded-full border ${stageColor(save.stage)}`}>
                                {save.stage}
                              </span>
                              <span className="text-[0.5625rem] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {formatMoney(save.valuation)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); playSound("click"); setConfirmDelete(save.id); }}
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
            <h2 className="text-2xl font-black tracking-tight text-white mb-1 leading-none">{t("howToPlay.header_title", { defaultValue: "How To Play" })}</h2>
            <p className="text-indigo-200 text-sm font-medium">{t("howToPlay.header_subtitle", { defaultValue: "Your guide to building a unicorn." })}</p>
          </div>

          <HowToPlayContent />

          <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <Button className="rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 h-12 w-full sm:w-auto px-10 shadow-lg shadow-indigo-600/20" onClick={() => setShowHowToPlay(false)}>{t("howToPlay.header_btn_got_it", { defaultValue: "GOT IT, LET'S BUILD" })}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster position="top-center" />
    </main>
  );
}
