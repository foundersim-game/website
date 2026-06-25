import React, { useState } from "react";
import { motion } from "framer-motion";
import { Startup, MarketStock } from "@/lib/types/database.types";
import { cn, formatMoney, formatNumber } from "@/lib/utils";

// Subsidiary string parsing helper
const parseSubsidiaryString = (subStr: string) => {
    if (subStr.includes("::")) {
        const parts = subStr.split("::");
        const name = parts[0];
        const valuation = parseInt(parts[1]) || 45000000;
        const isV2 = parts.length >= 5 && !(parseFloat(parts[4]) > 0 && parseFloat(parts[4]) <= 1);
        let revenue: number, expenses: number, integrationRisk: "Low" | "Medium" | "High", dividendRatio: number;

        if (parts.length >= 5 && (parts[4] === "Low" || parts[4] === "Medium" || parts[4] === "High")) {
            revenue = parseInt(parts[2]) || 200000;
            expenses = parseInt(parts[3]) || 80000;
            integrationRisk = parts[4] as "Low" | "Medium" | "High";
            dividendRatio = parseFloat(parts[5]) || 0.25;
        } else {
            const synergy = parseInt(parts[2]) || 120000;
            integrationRisk = (parts[3] || "Low") as "Low" | "Medium" | "High";
            dividendRatio = parseFloat(parts[4]) || 0.25;
            if (synergy >= 0) {
                revenue = Math.round(synergy / 0.3);
                expenses = revenue - synergy;
            } else {
                revenue = 0;
                expenses = Math.abs(synergy);
            }
        }

        const netIncome = revenue - expenses;
        return { name, valuation, revenue, expenses, netIncome, integrationRisk, dividendRatio, raw: subStr };
    }
    const revenue = 400000;
    const expenses = 160000;
    return {
        name: subStr,
        valuation: 45000000,
        revenue,
        expenses,
        netIncome: revenue - expenses,
        integrationRisk: "Low" as const,
        dividendRatio: 0.25,
        raw: subStr
    };
};

interface ManageSubsidiaryModalProps {
    open: boolean;
    onClose: () => void;
    subRaw: string;
    startup: Startup;
    marketStocks: MarketStock[];
    onInjectCapital: (subRaw: string, amount: number) => void;
    onRebrandSubsidiary: (subRaw: string) => void;
    onListSubsidiary: (subRaw: string) => void;
    onDivestSubsidiary: (subRaw: string, payout: number) => void;
}

export function ManageSubsidiaryModal({
    open,
    onClose,
    subRaw,
    startup,
    marketStocks,
    onInjectCapital,
    onRebrandSubsidiary,
    onListSubsidiary,
    onDivestSubsidiary
}: ManageSubsidiaryModalProps) {
    const [injectAmount, setInjectAmount] = useState<number>(1000000);

    if (!open || !subRaw) return null;

    const sub = parseSubsidiaryString(subRaw);
    const corporateCash = startup.metrics?.cash || 0;

    // Check if subsidiary is listed
    const listedStock = marketStocks?.find(
        s => (s.companyName === sub.name || s.symbol === sub.name || s.symbol === subRaw) && !s.isDelisted
    );
    const isListed = !!listedStock;

    // Determine ownership info if listed
    const corpPortfolio = startup.public_company?.corporate_portfolio || startup.treasury_portfolio || [];
    const corpPos = isListed ? corpPortfolio.find(p => p.symbol === listedStock.symbol) : null;
    const corpShares = corpPos?.shares || 0;
    const ownershipPct = isListed && listedStock.sharesOutstanding > 0
        ? (corpShares / listedStock.sharesOutstanding) * 100
        : 0;

    // Override sub details if listed
    const valuation = isListed
        ? listedStock.currentPrice * listedStock.sharesOutstanding
        : sub.valuation;

    // Derive financials dynamically if listed, to ensure consistency
    let revenue = sub.revenue;
    let expenses = sub.expenses;
    let netIncome = sub.netIncome;
    let dividendRatio = sub.dividendRatio;

    if (isListed) {
        const pe = listedStock.peRatio && Math.abs(listedStock.peRatio) > 0 ? listedStock.peRatio : 20;
        const annualNetIncome = valuation / pe;
        netIncome = Math.round(annualNetIncome / 12);
        const annualRevenue = valuation / 8;
        revenue = Math.round(annualRevenue / 12);
        expenses = Math.max(0, revenue - netIncome);
        // Find dividendRatio if stored in stock, or fallback to parsed sub
        dividendRatio = sub.dividendRatio;
    }

    const subARR = valuation * 0.15;
    const subUsers = Math.floor(valuation / 200);
    const hasCFO = !!(startup as any).cxoTeam?.["CFO"];

    const passARR = subARR >= 50000000;
    const passUsers = subUsers >= 10000;
    const passCFO = hasCFO;
    const canIPO = passARR && passUsers && passCFO && corporateCash >= 2000000;

    const divestPrice = Math.max(10000000, Math.floor(valuation * 0.8));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className={cn(
                    "p-6 text-center text-white relative shrink-0",
                    isListed
                        ? "bg-gradient-to-r from-violet-600 to-indigo-700"
                        : "bg-gradient-to-r from-slate-700 to-slate-900"
                )}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors text-lg"
                    >
                        ✕
                    </button>
                    <h2 className="text-xl font-black tracking-tight flex items-center justify-center gap-2">
                        <span>🏢</span> {sub.name}
                    </h2>
                    <p className="text-white/80 text-xs font-semibold mt-1">
                        {isListed ? `Public Subsidiary (${listedStock.symbol})` : "Unlisted Division"}
                    </p>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1 space-y-4">

                    {/* Public Market Card */}
                    {isListed ? (
                        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[0.625rem] font-black uppercase text-indigo-700 dark:text-indigo-400">Stock Market Info</span>
                                <span className="text-[0.625rem] font-black uppercase bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                                    {listedStock.symbol}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[0.5rem] uppercase font-black text-slate-400">Share Price</p>
                                    <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                        ${listedStock.currentPrice.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[0.5rem] uppercase font-black text-slate-400">Market Capitalization</p>
                                    <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                                        {formatMoney(valuation)}
                                    </p>
                                </div>
                            </div>
                            <div className="border-t border-indigo-100 dark:border-indigo-900/40 pt-3 flex justify-between items-center">
                                <div>
                                    <p className="text-[0.5rem] uppercase font-black text-slate-400 font-bold">Parent Ownership Stake</p>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">
                                        {formatNumber(corpShares)} shares ({ownershipPct.toFixed(1)}%)
                                    </p>
                                </div>
                                <span className={cn(
                                    "text-[0.5625rem] font-black px-2 py-1 rounded-md border",
                                    ownershipPct >= 50
                                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200"
                                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200"
                                )}>
                                    {ownershipPct >= 50 ? "Majority Control" : "Minority Stake"}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[0.625rem] font-black uppercase text-slate-500">Asset Profile</span>
                                <span className="text-[0.5rem] font-black uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                                    Private Division
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[0.5rem] uppercase font-black text-slate-400">Estimated Book Value</p>
                                    <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">
                                        {formatMoney(valuation)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[0.5rem] uppercase font-black text-slate-400">Integration Risk</p>
                                    <p className={cn(
                                        "text-sm font-black mt-0.5 uppercase tracking-wider",
                                        sub.integrationRisk === "High" ? "text-rose-500" :
                                            sub.integrationRisk === "Medium" ? "text-amber-500" : "text-emerald-500"
                                    )}>
                                        {sub.integrationRisk}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Performance Section */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                        <p className="text-[0.625rem] font-black uppercase text-slate-500 border-b border-slate-50 dark:border-slate-800/80 pb-1.5 flex justify-between">
                            <span>Financial Metrics</span>
                            <span className="text-slate-400 normal-case font-medium">Monthly rates</span>
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                                <p className="text-[0.5rem] uppercase font-black text-slate-400">Revenue</p>
                                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    +{formatMoney(revenue)}
                                </p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                                <p className="text-[0.5rem] uppercase font-black text-slate-400">Expenses</p>
                                <p className="text-xs font-black text-rose-500 mt-0.5">
                                    -{formatMoney(expenses)}
                                </p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                                <p className="text-[0.5rem] uppercase font-black text-slate-400">Net Income</p>
                                <p className={cn(
                                    "text-xs font-black mt-0.5",
                                    netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                                )}>
                                    {netIncome >= 0 ? "+" : ""}{formatMoney(netIncome)}
                                </p>
                            </div>
                        </div>

                        {isListed ? (
                            <div className="p-3 bg-violet-50/50 dark:bg-violet-950/10 rounded-xl text-[0.625rem] font-semibold text-violet-700 dark:text-violet-400 leading-relaxed border border-violet-100 dark:border-violet-900/30">
                                💼 <strong className="font-black">Consolidated P&L Note:</strong> Listed subsidiaries do not transfer net income directly to your corporate cash. Instead, they pay dividends quarterly:
                                <div className="mt-1 text-[0.5625rem] font-black text-slate-600 dark:text-slate-400">
                                    • Dividend Ratio: {(dividendRatio * 100).toFixed(0)}% payout of quarterly profits<br />
                                    • Estimated Dividend: ~{formatMoney(Math.max(0, Math.floor(netIncome * 3 * dividendRatio * (ownershipPct / 100)) || 0))} every 3 months
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl text-[0.625rem] font-semibold text-emerald-700 dark:text-emerald-400 leading-relaxed border border-emerald-100 dark:border-emerald-900/30">
                                💼 <strong className="font-black">Consolidated P&L Note:</strong> Unlisted subsidiaries are fully consolidated. 100% of their net income (+{formatMoney(netIncome)}/mo) is added directly to parent corporate treasury each month.
                            </div>
                        )}
                    </div>

                    {/* Unlisted IPO Readiness / Actions */}
                    {!isListed && (
                        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                            <p className="text-[0.625rem] font-black uppercase text-slate-500 border-b border-slate-50 dark:border-slate-800/80 pb-1.5">
                                IPO Qualifications
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[0.5625rem] font-bold">
                                <div className="flex items-center gap-1.5">
                                    <span>{passCFO ? "✅" : "❌"}</span>
                                    <span className={passCFO ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>
                                        Corporate CFO Hired
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span>{passARR ? "✅" : "❌"}</span>
                                    <span className={passARR ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>
                                        {"ARR >= $50M"} (Have: {formatMoney(subARR)})
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span>{passUsers ? "✅" : "❌"}</span>
                                    <span className={passUsers ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>
                                        {"Users >= 10k"} (Have: {subUsers.toLocaleString()})
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span>{corporateCash >= 2000000 ? "✅" : "❌"}</span>
                                    <span className={corporateCash >= 2000000 ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>
                                        {"Treasury Cash >= $2M"} (IPO fee)
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions Panel */}
                    <div className="space-y-2">
                        <p className="text-[0.625rem] font-black uppercase text-slate-500">Corporate Actions</p>

                        {isListed ? (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
                                <p className="text-[0.625rem] text-slate-500 font-semibold leading-relaxed">
                                    This division is publicly listed on the stock market. Direct corporate actions like rebranding or private PE trade sale are not available. However, you can make a PIPE (Private Investment in Public Equity) cash injection to bolster its valuation and increase your corporate ownership.
                                </p>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 gap-2 mb-2">
                            {/* Inject Capital */}
                            <p className="text-[0.5625rem] font-black uppercase tracking-widest text-slate-400 mt-2 flex justify-between">
                                <span>Inject Capital</span>
                                <span className="text-indigo-500">Injecting: {formatMoney(Math.min(Math.max(1, Math.floor(corporateCash / 1000000)), Math.max(1, Math.floor(injectAmount / 1000000))) * 1000000)}</span>
                            </p>
                            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <input
                                    type="range"
                                    min="1"
                                    max={Math.max(1, Math.floor(corporateCash / 1000000))}
                                    step="1"
                                    value={Math.min(Math.max(1, Math.floor(corporateCash / 1000000)), Math.max(1, Math.floor(injectAmount / 1000000)))}
                                    onChange={(e) => setInjectAmount(Number(e.target.value) * 1000000)}
                                    className="w-full accent-indigo-600 cursor-pointer"
                                    disabled={corporateCash < 1000000}
                                />
                                <div className="flex justify-between w-full mt-1 px-1 text-[0.5rem] font-black text-slate-400 uppercase">
                                    <span>$1M</span>
                                    <span>{formatMoney(Math.max(1, Math.floor(corporateCash / 1000000)) * 1000000)} (Max)</span>
                                </div>
                                <button
                                    onClick={() => {
                                        const amount = Math.min(Math.max(1, Math.floor(corporateCash / 1000000)), Math.max(1, Math.floor(injectAmount / 1000000))) * 1000000;
                                        onInjectCapital(subRaw, amount);
                                        onClose();
                                    }}
                                    disabled={corporateCash < 1000000}
                                    className="w-full mt-3 p-3 border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 disabled:opacity-40 text-indigo-700 dark:text-indigo-400 rounded-xl text-center transition-all active:scale-[0.98] font-black uppercase tracking-wide text-[0.6875rem]"
                                >
                                    Confirm Inject {formatMoney(Math.min(Math.max(1, Math.floor(corporateCash / 1000000)), Math.max(1, Math.floor(injectAmount / 1000000))) * 1000000)}
                                </button>
                            </div>
                        </div>

                        {!isListed && (
                            <div className="grid grid-cols-2 gap-2">
                                {/* Rebrand */}
                                <button
                                    onClick={() => {
                                        onRebrandSubsidiary(subRaw);
                                        onClose();
                                    }}
                                    disabled={corporateCash < 5000000}
                                    className="p-3 border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-100 disabled:opacity-40 text-violet-700 dark:text-violet-400 rounded-xl text-left transition-all active:scale-[0.98] group flex flex-col gap-0.5"
                                >
                                    <span className="text-[0.625rem] font-black uppercase">🎯 Rebrand Division</span>
                                    <span className="text-[0.5rem] text-slate-500 dark:text-slate-400 font-medium">
                                        Cost: $5M corporate cash
                                    </span>
                                    <span className="text-[0.4688rem] font-bold text-violet-600 dark:text-violet-400 mt-1">
                                        Boosts awareness & resets risk.
                                    </span>
                                </button>

                                {/* IPO Stock */}
                                <button
                                    onClick={() => {
                                        onListSubsidiary(subRaw);
                                        onClose();
                                    }}
                                    disabled={!canIPO}
                                    className="p-3 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 disabled:opacity-40 text-emerald-700 dark:text-emerald-400 rounded-xl text-left transition-all active:scale-[0.98] group flex flex-col gap-0.5"
                                >
                                    <span className="text-[0.625rem] font-black uppercase">📈 Underwrite IPO</span>
                                    <span className="text-[0.5rem] text-slate-500 dark:text-slate-400 font-medium">
                                        Cost: $2M corporate cash
                                    </span>
                                    <span className="text-[0.4688rem] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                        List stock on public market. Keep 80% stake.
                                    </span>
                                </button>

                                {/* Divest */}
                                <button
                                    onClick={() => {
                                        onDivestSubsidiary(subRaw, divestPrice);
                                        onClose();
                                    }}
                                    className="p-3 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-700 dark:text-rose-400 rounded-xl text-left transition-all active:scale-[0.98] group flex flex-col gap-0.5"
                                >
                                    <span className="text-[0.625rem] font-black uppercase">💰 Divest to PE</span>
                                    <span className="text-[0.5rem] text-slate-500 dark:text-slate-400 font-medium">
                                        Trade Sale (80% of book value)
                                    </span>
                                    <span className="text-[0.4688rem] font-bold text-rose-600 dark:text-rose-400 mt-1">
                                        Receive +{formatMoney(divestPrice)} corporate cash.
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
