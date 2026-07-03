"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    getLbUsername,
    claimUsername,
    checkUsernameAvailable,
    getLeaderboard,
    getPlayerProfile,
    getPlayerRank,
    getTotalPlayers,
    validateUsername,
    type LeaderboardEntry,
} from "@/lib/services/leaderboardService";
import { formatMoney } from "@/lib/utils";
import { useTranslation, Trans } from "react-i18next";

// ── Helpers ───────────────────────────────────────────────────────────────────
const OUTCOME_BADGE: Record<string, { label: string; cls: string }> = {
    active:    { label: "🟢 Playing",  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    ipo:       { label: "🏛️ IPO",      cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
    acquired:  { label: "🤝 Acquired", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    bankrupt:  { label: "💀 Bankrupt", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
    wound_down:{ label: "🔒 Closed",   cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    burnout:   { label: "🔥 Burnout",  cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    retired:   { label: "🏖️ Retired",  cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
};

const TIER_COLOR: Record<string, string> = {
    "Universal Overlord": "text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] font-black",
    "Emperor of Humanity":"text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]",
    "God of Wealth":   "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    "Global Legend":   "text-orange-500",
    "Industry Titan":  "text-blue-600",
    "Unicorn Founder": "text-violet-500",
    "Rocketship":      "text-blue-500",
    "Traction Machine":"text-emerald-500",
    "First Steps":     "text-amber-500",
    "Burned Out":      "text-rose-400",
};

// ── Client-side tier computation (always correct, no stale DB values) ───────────
function getTierFromValuation(valuation: number): string {
    const logV = Math.log10(Math.max(1, valuation));
    let valScore = 0;
    if (logV <= 9) {
        valScore = Math.floor(logV * 5);
    } else {
        valScore = 45 + Math.floor((logV - 9) * 20);
    }
    // Mirror LEGACY_TIERS thresholds (outcome:active gives 8 pts baseline)
    const totalApprox = valScore + 8;
    if (totalApprox >= 245) return "Universal Overlord";
    if (totalApprox >= 200) return "Emperor of Humanity";
    if (totalApprox >= 150) return "God of Wealth";
    if (totalApprox >= 130) return "Global Legend";
    if (totalApprox >= 110) return "Industry Titan";
    if (totalApprox >= 90)  return "Unicorn Founder";
    if (totalApprox >= 70)  return "Rocketship";
    if (totalApprox >= 50)  return "Traction Machine";
    if (totalApprox >= 30)  return "First Steps";
    return "Burned Out";
}

// ── Username Claim Flow ───────────────────────────────────────────────────────

function UsernameSetup({ onDone }: { onDone: (username: string) => void }) {
    const { t } = useTranslation();
    const [tag, setTag]             = useState("");
    const [status, setStatus]       = useState<"idle"|"checking"|"available"|"taken"|"invalid">("idle");
    const [statusMsg, setStatusMsg] = useState("");
    const [claiming, setClaiming]   = useState(false);

    const checkAvailability = useCallback(async (value: string) => {
        const err = validateUsername(value);
        if (err) { setStatus("invalid"); setStatusMsg(err); return; }
        setStatus("checking");
        setStatusMsg("Checking...");
        const avail = await checkUsernameAvailable(value);
        if (avail) { setStatus("available"); setStatusMsg("✓ Available!"); }
        else        { setStatus("taken");     setStatusMsg("Already taken"); }
    }, []);

    useEffect(() => {
        if (!tag) { setStatus("idle"); setStatusMsg(""); return; }
        const t = setTimeout(() => checkAvailability(tag), 600);
        return () => clearTimeout(t);
    }, [tag, checkAvailability]);

    const handleClaim = async () => {
        if (status !== "available") return;
        setClaiming(true);
        const result = await claimUsername(tag);
        if (result.success) { onDone(tag.toLowerCase()); }
        else { setStatus("taken"); setStatusMsg(result.error || "Failed"); }
        setClaiming(false);
    };

    const borderCls =
        status === "available" ? "border-emerald-400 ring-2 ring-emerald-400/20" :
        status === "taken" || status === "invalid" ? "border-rose-400 ring-2 ring-rose-400/20" :
        "border-slate-200 dark:border-slate-700";

    const msgCls =
        status === "available" ? "text-emerald-500" :
        status === "taken" || status === "invalid" ? "text-rose-500" :
        "text-slate-400";

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
            {/* Trophy graphic */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30">
                    🏆
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                        {t('leaderboard.join_leaderboard')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs leading-relaxed">
                        <Trans i18nKey="leaderboard.join_desc">
                            Pick a permanent username. Your stats across <strong className="text-slate-700 dark:text-slate-300">all your ventures</strong> will accumulate under this name — forever.
                        </Trans>
                    </p>
                </div>
            </div>

            {/* Input */}
            <div className="w-full max-w-xs space-y-3">
                <div className={`flex items-center gap-2 border-2 rounded-2xl px-4 py-4 transition-all ${borderCls}`}>
                    <span className="text-slate-400 font-black text-base">@</span>
                    <input
                        value={tag}
                        onChange={e => setTag(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
                        placeholder="your_tag"
                        className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white font-black text-lg"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                    />
                    {status === "checking" && (
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin shrink-0" />
                    )}
                </div>
                {statusMsg ? (
                    <p className={`text-xs font-bold text-center ${msgCls}`}>{statusMsg}</p>
                ) : (
                    <p className="text-[0.6875rem] text-slate-400 text-center">3–20 chars · letters, numbers, underscores only</p>
                )}
            </div>

            {/* CTA */}
            <button
                onClick={handleClaim}
                disabled={status !== "available" || claiming}
                className="w-full max-w-xs py-5 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-amber-500/30 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {claiming ? t('leaderboard.claiming') : t('leaderboard.claim_button')}
            </button>

            <p className="text-[0.625rem] text-slate-400 text-center max-w-xs">
                {t('leaderboard.permanent_warning')}
            </p>
        </div>
    );
}

// ── Leaderboard Row ───────────────────────────────────────────────────────────

function LeaderboardRow({ entry, rank, isMe, category }: {
    entry: LeaderboardEntry;
    rank: number;
    isMe: boolean;
    category: "bestVentureValuation" | "totalLifetimeCash";
}) {
    const { t } = useTranslation();
    const venture = entry.currentVenture;
    const outcome = venture?.outcome ?? "active";
    const badge = OUTCOME_BADGE[outcome] ?? OUTCOME_BADGE["active"];
    // Compute tier client-side from valuation so ALL players show the correct tier
    // immediately — no need to wait for each player to hit "Next Month".
    const tier = getTierFromValuation(entry.bestVentureValuation ?? 0);
    const tierCls = TIER_COLOR[tier] || "text-slate-400";
    
    // Dynamically add the current active venture to the totals
    const displayVentures = (entry.totalVentures ?? 0) + (venture?.isActive ? 1 : 0) || 1;
    const displayMonths = (entry.totalMonthsPlayed ?? 0) + (venture?.isActive ? venture.monthsSurvived : 0);
    const hasGodMode = entry.iap_god_mode || (isMe && typeof window !== 'undefined' && localStorage.getItem('founder_sim_god_mode') === 'true');
    const hasTitan = entry.iap_titan || (isMe && typeof window !== 'undefined' && localStorage.getItem('founder_sim_titan') === 'true');
    const hasPremium = entry.iap_premium || (isMe && typeof window !== 'undefined' && localStorage.getItem('founder_sim_premium') === 'true');

    const rankDisplay =
        rank === 1 ? "🥇" :
        rank === 2 ? "🥈" :
        rank === 3 ? "🥉" :
        `#${rank}`;

    return (
        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
            isMe
                ? "bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-600 shadow-sm shadow-indigo-200/50"
                : "bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
        }`}>
            {/* Rank */}
            <span className={`text-base font-black w-8 text-center shrink-0 ${rank <= 3 ? "text-lg" : "text-slate-500 dark:text-slate-400"}`}>
                {rankDisplay}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-black text-sm truncate ${isMe ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}>
                        @{entry.displayTag ?? entry.username}
                    </span>
                    {isMe && (
                        <span className="text-[0.5rem] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                            YOU
                        </span>
                    )}
                    {hasTitan && (
                        <span className="text-[0.5rem] font-black bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm" title="Titan of Industry">
                            👑 TITAN
                        </span>
                    )}
                    {hasGodMode && !hasTitan && (
                        <span className="text-[0.5rem] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm" title="God Mode Owner">
                            ⚡ GOD MODE
                        </span>
                    )}
                    {hasPremium && !hasTitan && !hasGodMode && (
                        <span className="text-[0.5rem] font-black bg-slate-800 dark:bg-slate-200 text-slate-100 dark:text-slate-900 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm" title="Premium Supporter">
                            ✨ PATRON
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {entry.bestVentureName && (
                        <span className="text-[0.625rem] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[5.625rem]">
                            {entry.bestVentureName}
                        </span>
                    )}
                    <span className={`text-[0.5625rem] font-black px-1.5 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                        {t(`leaderboard.badge_${outcome}`, { defaultValue: badge.label })}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[0.5625rem] font-black ${tierCls}`}>
                        {t(`leaderboard.tier_${tier.replace(/ /g, "_").toLowerCase()}`, { defaultValue: tier })}
                    </span>
                    <span className="text-[0.5625rem] text-slate-400 dark:text-slate-500">
                        · {displayVentures} {displayVentures !== 1 ? t("leaderboard.ventures", { defaultValue: "ventures" }) : t("leaderboard.venture", { defaultValue: "venture" })}
                        · {displayMonths}{t("leaderboard.mo_played", { defaultValue: "mo played" })}
                    </span>
                </div>
            </div>

            {/* Wealth */}
            <div className="text-right shrink-0">
                <p className={`text-sm font-black ${isMe ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {category === "bestVentureValuation" ? formatMoney(entry.bestVentureValuation) : formatMoney(entry.totalLifetimeCash)}
                </p>
                <p className="text-[0.5625rem] text-slate-400 dark:text-slate-500">
                    {category === "bestVentureValuation" 
                        ? `${t("leaderboard.lifetime_cash", { defaultValue: "Lifetime Cash:" })} ${formatMoney(entry.totalLifetimeCash)}` 
                        : `${t("leaderboard.peak_val", { defaultValue: "Peak Valuation:" })} ${formatMoney(entry.bestVentureValuation)}`}
                </p>
            </div>
        </div>
    );
}

// ── Stats Header ──────────────────────────────────────────────────────────────

function StatsHeader({ entries, username, globalRank, totalPlayers, category }: { entries: LeaderboardEntry[]; username: string | null; globalRank: number | null; totalPlayers: number; category: "bestVentureValuation" | "totalLifetimeCash" }) {
    const { t } = useTranslation();
    const topEntry = entries[0];

    return (
        <div className="grid grid-cols-3 gap-2 px-4 mb-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 text-center border border-amber-100 dark:border-amber-800/40">
                <p className="text-base font-black text-amber-600 dark:text-amber-400">
                    {topEntry ? (category === "bestVentureValuation" ? formatMoney(topEntry.bestVentureValuation) : formatMoney(topEntry.totalLifetimeCash)) : "—"}
                </p>
                <p className="text-[0.5625rem] font-black text-amber-500 uppercase tracking-widest mt-0.5">{category === "bestVentureValuation" ? t('leaderboard.top_valuation') : t('leaderboard.top_lifetime_cash')}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-3 text-center border border-indigo-100 dark:border-indigo-800/40">
                <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {globalRank && globalRank > 0 ? `#${globalRank}` : "—"}
                </p>
                <p className="text-[0.5625rem] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{t('leaderboard.your_rank')}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
                <p className="text-base font-black text-slate-700 dark:text-slate-300">
                    {totalPlayers > 0 ? Math.max(totalPlayers, globalRank || 0).toLocaleString() : "—"}
                </p>
                <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('leaderboard.founders')}</p>
            </div>
        </div>
    );
}

// ── Main Modal (Full Screen) ──────────────────────────────────────────────────

interface Props {
    open: boolean;
    onClose: () => void;
    currentIndustry?: string;
}

export function LeaderboardModal({ open, onClose, currentIndustry }: Props) {
    const { t } = useTranslation();
    const [username, setUsername]   = useState<string | null>(null);
    const [showSetup, setShowSetup] = useState(false);
    const [entries, setEntries]     = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading]     = useState(false);
    const [category, setCategory]   = useState<"bestVentureValuation" | "totalLifetimeCash">("bestVentureValuation");
    
    // Global tracking
    const [globalRank, setGlobalRank] = useState<number | null>(null);
    const [totalPlayers, setTotalPlayers] = useState<number>(0);
    const [myProfile, setMyProfile] = useState<LeaderboardEntry | null>(null);

    useEffect(() => {
        if (!open) return;
        const stored = getLbUsername();
        setUsername(stored);
        if (!stored) {
            setShowSetup(true);
        } else {
            setShowSetup(false);
            loadBoard(stored);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, category]);

    const loadBoard = async (currentUser: string | null) => {
        setLoading(true);
        // Only load the top 50, since we now fetch global count and rank natively
        const data = await getLeaderboard(category, 50);
        setEntries(data);
        
        // Concurrently fetch true global stats
        const [total, rank, profile] = await Promise.all([
            getTotalPlayers(),
            currentUser ? getPlayerRank(currentUser) : Promise.resolve(null),
            currentUser && !data.find(e => e.username === currentUser) ? getPlayerProfile(currentUser) : Promise.resolve(null)
        ]);
        
        setTotalPlayers(total);
        setGlobalRank(rank);
        setMyProfile(profile);
        
        setLoading(false);
    };

    const handleSetupDone = (newUsername: string) => {
        setUsername(newUsername);
        setShowSetup(false);
        loadBoard(newUsername);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9000] bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 flex items-center gap-3 shrink-0">
                <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95 shrink-0"
                >
                    ←
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        🏆 {t('leaderboard.global_leaderboard')}
                    </h1>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mt-1.5 w-max">
                        <button 
                            onClick={() => setCategory("bestVentureValuation")}
                            className={`px-3 py-1 rounded-md text-[0.5625rem] font-black uppercase tracking-widest transition-all ${category === "bestVentureValuation" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}
                        >
                            {t('leaderboard.peak_valuation')}
                        </button>
                        <button 
                            onClick={() => setCategory("totalLifetimeCash")}
                            className={`px-3 py-1 rounded-md text-[0.5625rem] font-black uppercase tracking-widest transition-all ${category === "totalLifetimeCash" ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
                        >
                            {t('leaderboard.lifetime_cash')}
                        </button>
                    </div>
                </div>
                {username && (
                    <span className="text-[0.625rem] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 px-2 py-1 rounded-full uppercase tracking-wider shrink-0">
                        @{username}
                    </span>
                )}
            </div>

            {showSetup ? (
                <UsernameSetup onDone={handleSetupDone} />
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {/* Stats */}
                    {!loading && entries.length > 0 && (
                        <div className="pt-4">
                            <StatsHeader entries={entries} username={username} globalRank={globalRank} totalPlayers={totalPlayers} category={category} />
                        </div>
                    )}

                    {/* Column Headers */}
                    {!loading && entries.length > 0 && (
                        <div className="flex items-center px-4 mb-2">
                            <span className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest w-8 text-center shrink-0">{t('leaderboard.rank_header')}</span>
                            <span className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest flex-1 ml-3">{t('leaderboard.founder_header')}</span>
                            <span className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest text-right">
                                {category === "bestVentureValuation" ? t('leaderboard.peak_valuation') : t('leaderboard.lifetime_cash')}
                            </span>
                        </div>
                    )}

                    {/* Rows */}
                    <div className="px-4 pb-8 space-y-2">
                        {loading ? (
                            <>
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                                ))}
                            </>
                        ) : entries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <p className="text-5xl">🌱</p>
                                <p className="font-black text-slate-700 dark:text-slate-300 text-lg">{t('leaderboard.be_first')}</p>
                                <p className="text-sm text-slate-400 text-center">{t('leaderboard.no_players')}</p>
                            </div>
                        ) : (
                            <>
                                {entries.map((entry, i) => (
                                    <LeaderboardRow
                                        key={entry.username}
                                        entry={entry}
                                        rank={i + 1}
                                        isMe={entry.username === username}
                                        category={category}
                                    />
                                ))}

                                {/* Pinned self-row if user is outside the top 50 */}
                                {myProfile && globalRank && globalRank > 50 && (
                                    <>
                                        <div className="flex items-center gap-4 py-2 opacity-50 px-8">
                                            <div className="flex-1 border-b border-slate-300 dark:border-slate-700 border-dashed" />
                                            <span className="text-slate-400">⋮</span>
                                            <div className="flex-1 border-b border-slate-300 dark:border-slate-700 border-dashed" />
                                        </div>
                                        <LeaderboardRow
                                            entry={myProfile}
                                            rank={globalRank}
                                            isMe={true}
                                            category={category}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Footer safe area */}
            <div className="shrink-0 bg-slate-50 dark:bg-slate-950" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
    );
}
