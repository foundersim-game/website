"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp, TrendingDown, X, BarChart2, Newspaper, Briefcase,
    ChevronRight, Building2, User, ArrowUpRight, ArrowDownRight,
    AlertTriangle, Zap, Info, ShieldAlert, Users, RefreshCw,
    Shield, ChevronDown, Lock, Clock
} from "lucide-react";
import { adService } from "@/lib/services/adService";
import {
    MarketStock, PortfolioPosition, Startup, Founder,
    PublicCompanyState, FounderPersonalWealth
} from "../lib/types/database.types";
import {
    executeTrade, getPortfolioValue, getPlayerOwnershipPct,
    checkHostileTakeoverEligibility, executeTenderOffer, checkPoisonPill,
    getControlThreshold, getTenderOfferAcceptance
} from "../lib/engine/publicMarket";

// ── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(n: number): string {
    if (n >= 1e15) return `$${(n / 1e15).toFixed(2)}Q`;
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
}
function pct(n: number, d: number): string {
    if (!d) return "0.00%";
    return `${((n / d - 1) * 100).toFixed(2)}%`;
}

const SECTOR_COLORS: Record<string, string> = {
    Technology: "from-blue-500 to-indigo-600",
    Energy: "from-amber-500 to-orange-600",
    Healthcare: "from-emerald-500 to-teal-600",
    Defense: "from-slate-600 to-slate-700",
    "Real Estate": "from-violet-500 to-purple-600",
    "Broad Market": "from-rose-400 to-pink-600",
};
const SECTOR_BADGE: Record<string, string> = {
    Technology: "bg-blue-50 text-blue-700 border-blue-200",
    Energy: "bg-amber-50 text-amber-700 border-amber-200",
    Healthcare: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Defense: "bg-slate-50 text-slate-700 border-slate-200",
    "Real Estate": "bg-violet-50 text-violet-700 border-violet-200",
    "Broad Market": "bg-rose-50 text-rose-700 border-rose-200",
};

// ── MINI SPARKLINE ────────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
    if (data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 60, h = 24;
    const points = data.map((v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
    ).join(" ");
    return (
        <svg width={w} height={h} className="shrink-0">
            <polyline points={points} fill="none"
                stroke={positive ? "#22c55e" : "#ef4444"}
                strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ── PORTFOLIO EQUITY CURVE ────────────────────────────────────────────────────
function EquityCurve({ history }: { history: { month: number; value: number }[] }) {
    if (history.length < 2) return (
        <div className="h-32 flex items-center justify-center text-slate-400 text-xs">
            Not enough data yet — advance more months
        </div>
    );
    const vals = history.map(h => h.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const w = 300, h = 80;
    // Build SVG points
    const svgPoints = history.map((item, i) => {
        const x = (i / (history.length - 1)) * w;
        const y = h - ((item.value - min) / range) * h;
        return `${x},${y}`;
    }).join(" ");
    const isPositive = vals[vals.length - 1] >= vals[0];
    const color = isPositive ? "#22c55e" : "#ef4444";
    return (
        <div className="w-full px-1">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon
                    points={`0,${h} ${svgPoints} ${w},${h}`}
                    fill="url(#equityGrad)"
                />
                <polyline points={svgPoints} fill="none" stroke={color} strokeWidth={2}
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex justify-between text-[9px] text-slate-400 font-medium mt-1 px-0.5">
                <span>Month {history[0].month}</span>
                <span>Month {history[history.length - 1].month}</span>
            </div>
        </div>
    );
}

// ── SHAREHOLDERS PANEL ────────────────────────────────────────────────────────
function ShareholdersPanel({ stock, personalOwnershipPct, corporateOwnershipPct, startup }: { stock: MarketStock; personalOwnershipPct: number; corporateOwnershipPct: number; startup: any }) {
    let holders = [...(stock.shareholders || [])];
    
    // Filter out previous dynamic artifacts if they exist
    holders = holders.filter(h => h.name !== "You (Player)" && h.name !== "You (Personal)" && h.name !== "Corporate Treasury");

    const isOwnCompany = stock.symbol === startup.symbol;

    if (personalOwnershipPct > 0) {
        holders.push({ name: "You (Personal)", type: "player" as const, ownershipPct: personalOwnershipPct });
    }

    if (corporateOwnershipPct > 0) {
        if (stock.isSubsidiary) {
            // Find the parent entry and update it
            const existing = holders.find(h => h.name === startup.name || h.name === "Parent");
            if (existing) {
                existing.ownershipPct = corporateOwnershipPct;
            } else {
                holders.push({ name: startup.name || "Corporate Treasury", type: "parent_company" as const, ownershipPct: corporateOwnershipPct });
            }
        } else {
            holders.push({ name: isOwnCompany ? "Corporate Treasury" : (startup.name || "Corporate Treasury"), type: "parent_company" as const, ownershipPct: corporateOwnershipPct });
        }
    }

    if (isOwnCompany && holders.length === 0 && personalOwnershipPct === 0 && corporateOwnershipPct === 0) {
        holders.push({ name: "You (Founder)", type: "founder" as const, ownershipPct: 100 });
    }

    const displayHolders = holders.sort((a, b) => b.ownershipPct - a.ownershipPct).slice(0, 6);

    const typeColor: Record<string, string> = {
        institution: "bg-blue-100 text-blue-700",
        founder: "bg-amber-100 text-amber-700",
        vc: "bg-purple-100 text-purple-700",
        public_float: "bg-slate-100 text-slate-600",
        player: "bg-emerald-100 text-emerald-700",
        parent_company: "bg-indigo-100 text-indigo-700",
    };
    const typeLabel: Record<string, string> = {
        institution: "Fund",
        founder: "Insider",
        vc: "VC",
        public_float: "Float",
        player: "You",
        parent_company: "Parent",
    };

    return (
        <div className="space-y-1.5">
            {displayHolders.map((sh, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider w-[48px] text-center shrink-0 ${typeColor[sh.type] || "bg-slate-100 text-slate-600"}`}>
                        {typeLabel[sh.type] || sh.type}
                    </span>
                    <div className="grid grid-cols-[100px_1fr_40px] items-center gap-3 flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate">{sh.name}</span>
                        <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-full">
                            <div className={`h-full rounded-full transition-all ${sh.type === "player" ? "bg-emerald-500" : sh.type === "parent_company" ? "bg-indigo-500" : sh.type === "founder" ? "bg-amber-400" : sh.type === "vc" ? "bg-purple-400" : "bg-blue-400"}`}
                                style={{ width: `${Math.min(100, sh.ownershipPct)}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 text-right">{sh.ownershipPct.toFixed(1)}%</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── STOCK DETAIL PANEL ────────────────────────────────────────────────────────
function StockDetail({
    stock, personalPortfolio, corporatePortfolio, personalCash, corporateCash,
    account, onTrade, onTenderOffer, onClose, month, startup
}: {
    stock: MarketStock;
    personalPortfolio: PortfolioPosition[];
    corporatePortfolio: PortfolioPosition[];
    personalCash: number;
    corporateCash: number;
    account: "personal" | "corporate";
    onTrade: (symbol: string, shares: number, price: number, account: "personal" | "corporate") => void;
    onTenderOffer: (stock: MarketStock, premiumPct: number, account: "personal" | "corporate") => void;
    onClose: () => void;
    month: number;
    startup: any;
}) {
    const [shareInput, setShareInput] = useState("0");
    const [tab, setTab] = useState<"trade" | "info" | "shareholders">("trade");
    const [toPremium, setToPremium] = useState(25);
    const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");

    const portfolio = account === "personal" ? personalPortfolio : corporatePortfolio;
    const cash = account === "personal" ? personalCash : corporateCash;
    const pos = portfolio.find(p => p.symbol === stock.symbol);
    const shares = parseInt(shareInput) || 0;
    const cost = shares * stock.currentPrice;
    const canBuy = cash >= cost && shares > 0;
    const canSell = !!pos && pos.shares >= shares && shares > 0;

    const playerSharesPersonal = personalPortfolio.find(p => p.symbol === stock.symbol)?.shares || 0;
    const playerSharesCorp = corporatePortfolio.find(p => p.symbol === stock.symbol)?.shares || 0;
    
    const personalOwnershipPct = stock.sharesOutstanding > 0 ? (playerSharesPersonal / stock.sharesOutstanding) * 100 : 0;
    const corporateOwnershipPct = stock.sharesOutstanding > 0 ? (playerSharesCorp / stock.sharesOutstanding) * 100 : (stock.isSubsidiary ? 100 : 0);
    const playerOwnershipPct = getPlayerOwnershipPct(stock.symbol, stock, personalPortfolio, corporatePortfolio);
    const takeoverCheck = checkHostileTakeoverEligibility(playerOwnershipPct, stock);
    const tier = stock.companyTier || "large_cap";
    const threshold = getControlThreshold(tier);

    const priceChange = stock.priceHistory.length >= 2
        ? ((stock.currentPrice - stock.priceHistory[stock.priceHistory.length - 2]) / stock.priceHistory[stock.priceHistory.length - 2]) * 100
        : 0;
    const isPositive = priceChange >= 0;
    const gradClass = SECTOR_COLORS[stock.sector] || "from-slate-500 to-slate-600";

    return (
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="absolute inset-0 bg-white dark:bg-slate-900 z-10 flex flex-col overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-br ${gradClass} px-5 pt-12 pb-5 shrink-0`}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">{stock.symbol}</span>
                            {stock.isRival && <span className="text-[8px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">RIVAL</span>}
                            {stock.isSubsidiary && <span className="text-[8px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">SUBSIDIARY</span>}
                            {stock.poisonPillActive && <span className="text-[8px] font-black bg-red-400/80 text-white px-2 py-0.5 rounded-full uppercase">☠️ Poison Pill</span>}
                        </div>
                        <h2 className="text-xl font-black text-white leading-tight">{stock.companyName}</h2>
                        <p className="text-white/70 text-[10px] font-semibold mt-0.5">{stock.sector}</p>
                    </div>
                    <button onClick={onClose} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/35 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest">
                        <ChevronRight className="size-3.5 rotate-180" /> Back
                    </button>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-black text-white">${stock.currentPrice.toFixed(2)}</p>
                        <div className={`flex items-center gap-1 mt-0.5 ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
                            {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                            <span className="text-xs font-black">{isPositive ? "+" : ""}{priceChange.toFixed(2)}%</span>
                        </div>
                    </div>
                    <Sparkline data={stock.priceHistory} positive={isPositive} />
                </div>
                {/* Ownership bar */}
                {playerOwnershipPct > 0 && (
                    <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
                        <div className="flex justify-between text-white/80 text-[9px] font-bold mb-1">
                            <span>YOUR STAKE</span>
                            <span>
                                {playerOwnershipPct === Infinity ? "100" : playerOwnershipPct.toFixed(2)}%
                                {(!stock.isSubsidiary && stock.symbol !== startup.symbol) && ` / ${threshold}% needed for takeover`}
                            </span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (playerOwnershipPct === Infinity ? 100 : playerOwnershipPct) / (!stock.isSubsidiary && stock.symbol !== startup.symbol ? threshold : 100) * 100)}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* RSI + News quick bar */}
            <div className="shrink-0 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className={`text-[9px] font-black px-2 py-1 rounded-lg ${stock.rsi > 70 ? "bg-red-50 text-red-600" : stock.rsi < 30 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}`}>
                    RSI {stock.rsi?.toFixed(0)}
                </div>
                <div className={`text-[9px] font-black px-2 py-1 rounded-lg ${stock.momentum > 0.2 ? "bg-emerald-50 text-emerald-600" : stock.momentum < -0.2 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"}`}>
                    MOM {stock.momentum > 0 ? "+" : ""}{(stock.momentum * 100).toFixed(0)}
                </div>
                <div className="flex-1 text-[9px] text-slate-500 font-medium truncate">{stock.recentNews || "No recent news"}</div>
            </div>

            {/* Sub-tabs */}
            <div className="shrink-0 flex border-b border-slate-100 dark:border-slate-800 px-4">
                {(["trade", "info", "shareholders"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${tab === t ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400"}`}>
                        {t === "trade" ? "Trade" : t === "info" ? "Stock Info" : "Holders"}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {tab === "trade" && (
                    <>
                        {/* Position summary */}
                        {pos && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-3 flex items-center gap-3">
                                <Briefcase className="size-4 text-indigo-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Your Position</p>
                                    <p className="text-sm font-black text-indigo-900 dark:text-indigo-100">{pos.shares.toLocaleString()} shares</p>
                                    <p className="text-[10px] text-indigo-500">Avg cost ${pos.averageCost.toFixed(2)} · P&L {pct(stock.currentPrice, pos.averageCost)}</p>
                                </div>
                                <p className={`text-sm font-black ${stock.currentPrice >= pos.averageCost ? "text-emerald-600" : "text-red-500"}`}>
                                    {stock.currentPrice >= pos.averageCost ? "+" : ""}{fmt((stock.currentPrice - pos.averageCost) * pos.shares)}
                                </p>
                            </div>
                        )}

                        {/* Trade Mode Toggle */}
                        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            {(["buy", "sell"] as const).map(mode => (
                                <button key={mode} onClick={() => { setTradeMode(mode); setShareInput("0"); }}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tradeMode === mode ? (mode === "buy" ? "bg-emerald-500 text-white shadow-sm" : "bg-rose-500 text-white shadow-sm") : "text-slate-500"}`}>
                                    {mode === "buy" ? "Buy Shares" : "Sell Shares"}
                                </button>
                            ))}
                        </div>

                        {/* Trade input */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Shares</label>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {tradeMode === "buy" ? `Max buyable: ${Math.floor(cash / stock.currentPrice).toLocaleString()}` : `Owned: ${pos ? pos.shares.toLocaleString() : 0}`}
                                </span>
                            </div>
                            <input
                                type="number"
                                value={shareInput}
                                onChange={e => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    const maxS = tradeMode === "buy" ? Math.floor(cash / stock.currentPrice) : (pos ? pos.shares : 0);
                                    setShareInput(String(Math.min(val, maxS)));
                                }}
                                className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 text-base font-black text-slate-900 dark:text-slate-100 border-2 border-transparent focus:border-indigo-400 outline-none transition-all"
                                min="0"
                            />
                            {/* Range Slider */}
                            {(() => {
                                const maxS = tradeMode === "buy" ? Math.floor(cash / stock.currentPrice) : (pos ? pos.shares : 0);
                                return (
                                    <div className="px-1">
                                        <input
                                            type="range"
                                            min={0}
                                            max={maxS}
                                            value={Math.min(shares, maxS)}
                                            onChange={e => setShareInput(e.target.value)}
                                            className="w-full accent-indigo-500"
                                            disabled={maxS <= 0}
                                        />
                                        <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                                            <span>0%</span>
                                            <span className="cursor-pointer hover:text-indigo-500" onClick={() => setShareInput(String(Math.floor(maxS * 0.25)))}>25%</span>
                                            <span className="cursor-pointer hover:text-indigo-500" onClick={() => setShareInput(String(Math.floor(maxS * 0.50)))}>50%</span>
                                            <span className="cursor-pointer hover:text-indigo-500" onClick={() => setShareInput(String(Math.floor(maxS * 0.75)))}>75%</span>
                                            <span className="cursor-pointer hover:text-indigo-500 font-black text-indigo-500" onClick={() => setShareInput(String(maxS))}>MAX</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {shares > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-[11px] text-slate-600 dark:text-slate-400 flex justify-between">
                                <span>{tradeMode === "buy" ? "Total cost" : "Est. proceeds"}</span>
                                <span className="font-black text-slate-800 dark:text-slate-200">{fmt(cost)}</span>
                            </div>
                        )}

                        <div className="pt-1">
                            <button
                                onClick={() => onTrade(stock.symbol, tradeMode === "buy" ? shares : -shares, stock.currentPrice, account)}
                                disabled={tradeMode === "buy" ? !canBuy : !canSell}
                                className={`w-full h-12 rounded-xl text-white font-black text-sm uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-all shadow-lg ${tradeMode === "buy" ? "bg-emerald-500 shadow-emerald-500/30" : "bg-rose-500 shadow-rose-500/30"}`}>
                                {tradeMode === "buy" 
                                    ? `Buy ${shares > 0 ? shares.toLocaleString() : ""} Shares` 
                                    : `Sell ${shares > 0 ? shares.toLocaleString() : ""} Shares`}
                            </button>
                        </div>

                        {/* Hostile Takeover CTA */}
                        {takeoverCheck.eligible && !stock.isSubsidiary && stock.symbol !== startup.symbol && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="size-4 text-amber-600" />
                                    <p className="text-sm font-black text-amber-800">Hostile Takeover Eligible!</p>
                                </div>
                                <p className="text-[10px] text-amber-600">You hold {playerOwnershipPct.toFixed(1)}% — enough to initiate a {takeoverCheck.method}.</p>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Tender Offer Premium: {toPremium}%</label>
                                    <input type="range" min={15} max={60} value={toPremium} onChange={e => setToPremium(+e.target.value)}
                                        className="w-full accent-amber-500" />
                                    <p className="text-[9px] text-amber-600">Est. acceptance: {(getTenderOfferAcceptance(toPremium, tier) * 100).toFixed(0)}% of float · Offered price: ${(stock.currentPrice * (1 + toPremium / 100)).toFixed(2)}/share</p>
                                    {stock.poisonPillActive && (
                                        <p className="text-[9px] text-red-600 font-bold">☠️ Poison pill active — add 40% to your budget</p>
                                    )}
                                </div>
                                <button onClick={() => onTenderOffer(stock, toPremium, account)}
                                    className="w-full h-10 rounded-xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-amber-500/30">
                                    Launch Tender Offer
                                </button>
                            </div>
                        )}

                        {/* Poison pill warning when approaching threshold */}
                        {!takeoverCheck.eligible && !stock.isSubsidiary && stock.symbol !== startup.symbol && playerOwnershipPct >= 15 && playerOwnershipPct < threshold && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 flex gap-2 items-start">
                                <AlertTriangle className="size-3 text-rose-500 mt-0.5 shrink-0" />
                                <p className="text-[9px] text-rose-600 font-medium">
                                    You hold {playerOwnershipPct.toFixed(1)}%. Need {threshold}% for takeover. Crossing 20% may trigger a poison pill defense (15% chance).
                                </p>
                            </div>
                        )}
                    </>
                )}

                {tab === "info" && (
                    <div className="space-y-4">
                        {/* Latest news */}
                        {stock.recentNews && (
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">This Month</p>
                                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{stock.recentNews}</p>
                                {stock.newsContext && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{stock.newsContext}</p>
                                )}
                            </div>
                        )}
                        {/* News history */}
                        {(stock.newsHistory || []).length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Previous Months</p>
                                {(stock.newsHistory || []).map((news, i) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded shrink-0">{i + 1}mo ago</span>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{news}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Fundamentals */}
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Market Cap", value: fmt(stock.currentPrice * stock.sharesOutstanding) },
                                { label: "P/E Ratio", value: stock.peRatio > 0 ? stock.peRatio.toFixed(1) : "N/A" },
                                { label: "Shares Out.", value: `${(stock.sharesOutstanding / 1e6).toFixed(0)}M` },
                                { label: "Volatility", value: `${(stock.volatility * 100).toFixed(1)}%` },
                                { label: "52W High", value: `$${Math.max(...stock.priceHistory).toFixed(2)}` },
                                { label: "52W Low", value: `$${Math.min(...stock.priceHistory).toFixed(2)}` },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "shareholders" && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="size-3.5 text-slate-400" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Top Shareholders</p>
                        </div>
                        <ShareholdersPanel stock={stock} personalOwnershipPct={personalOwnershipPct} corporateOwnershipPct={corporateOwnershipPct} startup={startup} />
                        {playerOwnershipPct >= 5 && !stock.isSubsidiary && stock.symbol !== startup.symbol && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-[9px] text-amber-700 font-medium">
                                📋 SEC 13D Filing — Your {playerOwnershipPct.toFixed(1)}% stake is now public. Other shareholders are watching.
                            </div>
                        )}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                            <p className="text-[9px] text-slate-500">Control threshold for this company:</p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">{threshold}%
                                <span className="text-[10px] font-semibold text-slate-400 ml-1">({(stock.companyTier || "").replace("_", " ")})</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
interface StockMarketViewProps {
    onClose: () => void;
    stocks: MarketStock[];
    startup: Startup;
    founder: Founder;
    month: number;
    onTradePersonal: (symbol: string, shares: number, price: number) => void;
    onTradeCorporate: (symbol: string, shares: number, price: number) => void;
    onTenderOffer: (stock: MarketStock, premiumPct: number, account: "personal" | "corporate") => void;
    onBlockBuy?: (stock: MarketStock, shareholderIndex: number, premiumPct: number, account: "personal" | "corporate") => void;
    onToggleCfoAutoTrade: () => void;
    personalPortfolio: PortfolioPosition[];
    corporatePortfolio: PortfolioPosition[];
    personalCash: number;
    corporateCash: number;
    personalPortfolioHistory?: { month: number; value: number }[];
    corporatePortfolioHistory?: { month: number; value: number }[];
    geniusUsesThisHour: number;
    lastGeniusResetTime: number;
    onInsiderTipUsed: () => void;
    activeTips?: { symbol: string; monthsLeft: number }[];
}

export default function StockMarketView({
    onClose, stocks, startup, founder, month,
    onTradePersonal, onTradeCorporate, onTenderOffer, onBlockBuy, onToggleCfoAutoTrade,
    personalPortfolio, corporatePortfolio, personalCash, corporateCash,
    personalPortfolioHistory = [], corporatePortfolioHistory = [],
    geniusUsesThisHour, lastGeniusResetTime, onInsiderTipUsed, activeTips
}: StockMarketViewProps) {
    const [mainTab, setMainTab] = useState<"market" | "portfolio" | "news">("market");
    
    // Timer for Insider Tip cooldown
    const [timeLeft, setTimeLeft] = useState<number>(0);
    React.useEffect(() => {
        if (geniusUsesThisHour >= 2) {
            const updateTimer = () => setTimeLeft(Math.max(0, (lastGeniusResetTime + 3600000) - Date.now()));
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [geniusUsesThisHour, lastGeniusResetTime]);

    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const [account, setAccount] = useState<"personal" | "corporate">("personal");
    const [selectedStock, setSelectedStock] = useState<MarketStock | null>(null);
    const [sectorFilter, setSectorFilter] = useState<string>("All");
    const [searchQ, setSearchQ] = useState("");

    const hasCfo = !!(startup.cxoTeam as any)?.cfo;
    const cfoAutoTrade = startup.cfo_auto_trade_enabled;

    const portfolio = account === "personal" ? personalPortfolio : corporatePortfolio;
    const cash = account === "personal" ? personalCash : corporateCash;
    const portHistory = account === "personal" ? personalPortfolioHistory : corporatePortfolioHistory;

    const portValue = useMemo(() => getPortfolioValue(portfolio, stocks), [portfolio, stocks]);
    const totalWealth = cash + portValue;

    const sectors = useMemo(() => ["All", ...Array.from(new Set(stocks.map(s => s.sector)))], [stocks]);

    const filteredStocks = useMemo(() => stocks.filter(s => {
        if (s.isDelisted) return false;
        if (sectorFilter !== "All" && s.sector !== sectorFilter) return false;
        if (searchQ && !s.companyName.toLowerCase().includes(searchQ.toLowerCase()) && !s.symbol.toLowerCase().includes(searchQ.toLowerCase())) return false;
        return true;
    }), [stocks, sectorFilter, searchQ]);

    // Relevant news feed: stocks you hold + your company + subsidiaries + rivals
    const heldSymbols = useMemo(() => {
        const personal = personalPortfolio.map(p => p.symbol);
        const corp = corporatePortfolio.map(p => p.symbol);
        const mySymbol = startup.symbol || "";
        const subs = startup.subsidiaries || [];
        return Array.from(new Set([...personal, ...corp, mySymbol, ...subs])).filter(Boolean);
    }, [personalPortfolio, corporatePortfolio, startup]);

    const newsStocks = useMemo(() =>
        stocks.filter(s => heldSymbols.includes(s.symbol) || s.isRival || s.isSubsidiary),
        [stocks, heldSymbols]);

    const handleTrade = (symbol: string, shares: number, price: number, acc: "personal" | "corporate") => {
        if (acc === "personal") onTradePersonal(symbol, shares, price);
        else onTradeCorporate(symbol, shares, price);
        setSelectedStock(null);
    };

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-br from-indigo-700 to-violet-800 px-4 pt-12 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-black text-white">Markets</h1>
                        <p className="text-indigo-200 text-xs font-medium">{stocks.filter(s => !s.isDelisted).length} stocks listed</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white"><X className="size-4" /></button>
                </div>

                {/* Account switcher */}
                <div className="flex gap-2 mb-4">
                    {(["personal", "corporate"] as const).map(acc => (
                        <button key={acc} onClick={() => setAccount(acc)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${account === acc ? "bg-white text-indigo-700" : "bg-white/15 text-white/70"}`}>
                            {acc === "personal" ? <User className="size-3" /> : <Building2 className="size-3" />}
                            <span className="font-bold">{acc === "personal" ? "Personal" : "Corporate"}</span>
                        </button>
                    ))}
                </div>

                {/* Wealth summary */}
                <div className="bg-white/10 rounded-2xl px-4 py-3 grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="text-indigo-200 text-[8px] font-bold uppercase tracking-widest">Cash</p>
                        <p className="text-white font-black text-sm mt-0.5">{fmt(cash)}</p>
                    </div>
                    <div>
                        <p className="text-indigo-200 text-[8px] font-bold uppercase tracking-widest">Portfolio</p>
                        <p className="text-white font-black text-sm mt-0.5">{fmt(portValue)}</p>
                    </div>
                    <div>
                        <p className="text-indigo-200 text-[8px] font-bold uppercase tracking-widest">Total</p>
                        <p className="text-emerald-300 font-black text-sm mt-0.5">{fmt(totalWealth)}</p>
                    </div>
                </div>

                {/* CFO Auto-trade toggle */}
                {account === "corporate" && hasCfo && (
                    <button onClick={onToggleCfoAutoTrade}
                        className={`mt-2 w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${cfoAutoTrade ? "bg-emerald-500/20 border border-emerald-400/30" : "bg-white/10"}`}>
                        <div className="flex items-center gap-2">
                            <Zap className={`size-3 ${cfoAutoTrade ? "text-emerald-300" : "text-white/50"}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${cfoAutoTrade ? "text-emerald-300" : "text-white/60"}`}>
                                CFO Auto-Trading {cfoAutoTrade ? "ON" : "OFF"}
                            </span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-all ${cfoAutoTrade ? "bg-emerald-400" : "bg-white/20"}`}>
                            <div className={`w-3 h-3 bg-white rounded-full shadow m-0.5 transition-all ${cfoAutoTrade ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                    </button>
                )}
            </div>

            {/* SEC WARNING & GENIUS HEADER */}
            <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-xs border-b border-slate-800 shrink-0 shadow-sm">
                {geniusUsesThisHour >= 2 ? (
                    <div className="flex items-center gap-2 text-rose-500 font-semibold tracking-wide uppercase">
                        <Shield className="w-3.5 h-3.5" /> SEC Surveillance Active ({formatTime(timeLeft)})
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-purple-400 font-semibold tracking-wide uppercase">
                        <Zap className="w-3.5 h-3.5" /> Market Genius
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <span className="text-slate-400">Tips: {2 - geniusUsesThisHour}/2 left</span>
                    <button 
                        onClick={() => {
                            if (geniusUsesThisHour >= 2) return;
                            adService.showRewardedAd(() => {
                                onInsiderTipUsed();
                            }, 'default');
                        }}
                        disabled={geniusUsesThisHour >= 2}
                        className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-colors"
                    >
                        {geniusUsesThisHour >= 2 ? <Lock className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />} Insider Tip
                    </button>
                </div>
            </div>

            {/* Main tabs */}
            <div className="shrink-0 flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                {([
                    { key: "market", icon: BarChart2, label: "Market" },
                    { key: "portfolio", icon: Briefcase, label: "Portfolio" },
                    { key: "news", icon: Newspaper, label: "News Feed" },
                ] as const).map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setMainTab(key as any)}
                        className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${mainTab === key ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400"}`}>
                        <Icon className="size-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto relative">
                {mainTab === "market" && (
                    <div>
                        {/* Search + filter */}
                        <div className="px-4 pt-3 pb-2 space-y-2 sticky top-0 bg-white dark:bg-slate-950 z-10 border-b border-slate-50 dark:border-slate-900 shadow-sm">
                            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                placeholder="Search stocks..."
                                className="w-full h-9 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none border-2 border-transparent focus:border-indigo-300" />
                            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                                {sectors.map(s => (
                                    <button key={s} onClick={() => setSectorFilter(s)}
                                        className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${sectorFilter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Tips */}
                        {activeTips && activeTips.length > 0 && (
                            <div className="px-4 py-2 bg-purple-50 dark:bg-slate-800/80 border-b border-purple-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-inner">
                                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider whitespace-nowrap">Active Tips:</span>
                                {activeTips.map(t => (
                                    <div key={t.symbol} className="bg-white dark:bg-slate-900 px-2 py-1 rounded border border-purple-200 dark:border-purple-900 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap shadow-sm">
                                        <Zap className="w-3 h-3 text-purple-500" />
                                        {t.symbol} <span className="text-slate-400 font-normal">({t.monthsLeft}mo)</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Stock list */}
                        <div className="divide-y divide-slate-50 dark:divide-slate-900">
                            {filteredStocks.map(stock => {
                                const change = stock.priceHistory.length >= 2
                                    ? ((stock.currentPrice - stock.priceHistory[stock.priceHistory.length - 2]) / stock.priceHistory[stock.priceHistory.length - 2]) * 100
                                    : 0;
                                const pos = portfolio.find(p => p.symbol === stock.symbol);
                                const owned = pos ? pos.shares : 0;
                                return (
                                    <button key={stock.symbol} onClick={() => setSelectedStock(stock)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 active:bg-slate-100 transition-colors text-left">
                                        {/* Symbol badge */}
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${SECTOR_COLORS[stock.sector] || "from-slate-400 to-slate-500"} flex items-center justify-center shrink-0`}>
                                            <span className="text-white text-[8px] font-black">{stock.symbol.slice(0, 4)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{stock.companyName}</p>
                                                {owned > 0 && <span className="text-[7px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full shrink-0">HELD</span>}
                                                {stock.isRival && <span className="text-[7px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full shrink-0">RIVAL</span>}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium truncate">{stock.recentNews || "No news"}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Sparkline data={stock.priceHistory} positive={change >= 0} />
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-200">${stock.currentPrice.toFixed(2)}</p>
                                                <p className={`text-[10px] font-black ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                                                </p>
                                            </div>
                                            <ChevronRight className="size-3 text-slate-300" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {mainTab === "portfolio" && (
                    <div className="px-4 py-4 space-y-5">
                        {/* Equity curve */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Portfolio Value</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{fmt(portValue)}</p>
                                </div>
                                {portHistory.length >= 2 && (
                                    <div className={`text-right`}>
                                        <p className={`text-sm font-black ${portHistory[portHistory.length - 1].value >= portHistory[0].value ? "text-emerald-500" : "text-red-500"}`}>
                                            {portHistory[portHistory.length - 1].value >= portHistory[0].value ? "+" : ""}
                                            {fmt(portHistory[portHistory.length - 1].value - portHistory[0].value)}
                                        </p>
                                        <p className="text-[9px] text-slate-400">all time</p>
                                    </div>
                                )}
                            </div>
                            <EquityCurve history={portHistory} />
                        </div>

                        {/* Holdings */}
                        {portfolio.length === 0 ? (
                            <div className="text-center py-10">
                                <Briefcase className="size-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-semibold text-sm">No holdings yet</p>
                                <p className="text-slate-300 text-xs mt-1">Go to Market tab to start investing</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Holdings</p>
                                {portfolio.map(pos => {
                                    const foundStock = stocks.find(s => s.symbol === pos.symbol);
                                    // Fallback for private/pre-IPO shares (like founder equity) not yet listed
                                    const displayStock: MarketStock = foundStock || {
                                            symbol: pos.symbol,
                                            companyName: pos.symbol === (startup?.symbol || "CORP") ? (startup?.name || "Startup") : `${pos.symbol} (Private)`,
                                            sector: "Technology",
                                            currentPrice: pos.averageCost,
                                            sharesOutstanding: 20000000,
                                            peRatio: 0, momentum: 0, volatility: 0, rsi: 50,
                                            priceHistory: [pos.averageCost],
                                            companyTier: "small_cap",
                                            isSubsidiary: true,
                                            shareholders: []
                                        };
                                    const currentVal = pos.shares * displayStock.currentPrice;
                                    const costBasis = pos.shares * pos.averageCost;
                                    const gainLoss = currentVal - costBasis;
                                    const gainLossPct = ((displayStock.currentPrice / pos.averageCost) - 1) * 100;
                                    const isGain = gainLoss >= 0;
                                    return (
                                        <button key={pos.symbol} onClick={() => setSelectedStock(displayStock)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 hover:border-indigo-200 transition-all active:scale-[0.99]">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${SECTOR_COLORS[displayStock.sector] || "from-slate-400 to-slate-500"} flex items-center justify-center shrink-0`}>
                                                <span className="text-white text-[8px] font-black">{displayStock.symbol.slice(0, 4)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{displayStock.symbol}</p>
                                                <p className="text-[10px] text-slate-400">{pos.shares.toLocaleString()} shares · avg ${pos.averageCost.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{fmt(currentVal)}</p>
                                                <p className={`text-[10px] font-black flex items-center justify-end gap-0.5 ${isGain ? "text-emerald-500" : "text-red-500"}`}>
                                                    {isGain ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                                                    {isGain ? "+" : ""}{gainLossPct.toFixed(1)}%
                                                </p>
                                            </div>
                                            <Sparkline data={displayStock.priceHistory} positive={isGain} />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {mainTab === "news" && (
                    <div className="px-4 py-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Info className="size-3 text-slate-400" />
                            <p className="text-[9px] text-slate-400 font-medium">News for stocks you hold, your company, rivals & subsidiaries</p>
                        </div>
                        {newsStocks.length === 0 ? (
                            <div className="text-center py-10">
                                <Newspaper className="size-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-semibold text-sm">No relevant news yet</p>
                                <p className="text-slate-300 text-xs mt-1">Hold stocks or rivals will appear here as events happen</p>
                            </div>
                        ) : (
                            newsStocks.map(stock => {
                                if (!stock.recentNews) return null;
                                const change = stock.priceHistory.length >= 2
                                    ? ((stock.currentPrice - stock.priceHistory[stock.priceHistory.length - 2]) / stock.priceHistory[stock.priceHistory.length - 2]) * 100 : 0;
                                return (
                                    <button key={stock.symbol} onClick={() => setSelectedStock(stock)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-left hover:border-indigo-200 transition-all active:scale-[0.99]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${SECTOR_BADGE[stock.sector] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                                {stock.symbol}
                                            </span>
                                            {stock.isRival && <span className="text-[7px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">RIVAL</span>}
                                            {stock.isSubsidiary && <span className="text-[7px] font-black bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">SUBSIDIARY</span>}
                                            <span className={`ml-auto text-[10px] font-black ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                                            </span>
                                        </div>
                                        <p className="text-sm font-black text-slate-800 dark:text-slate-100">{stock.recentNews}</p>
                                        {stock.newsContext && (
                                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{stock.newsContext}</p>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Stock Detail Overlay */}
            <AnimatePresence>
                {selectedStock && (
                    <StockDetail
                        stock={selectedStock}
                        personalPortfolio={personalPortfolio}
                        corporatePortfolio={corporatePortfolio}
                        personalCash={personalCash}
                        corporateCash={corporateCash}
                        account={account}
                        onTrade={handleTrade}
                        onTenderOffer={onTenderOffer}
                        onClose={() => setSelectedStock(null)}
                        month={month}
                        startup={startup}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
