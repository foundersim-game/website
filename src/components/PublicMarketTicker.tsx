import React from "react";
import { PublicCompanyState, MarketStock, MacroEvent } from "@/lib/types/database.types";
import { formatMoney } from "@/lib/utils";

export function PublicMarketTicker({
    publicState,
    companyName,
    marketStocks,
    activeMacroEvent
}: {
    publicState?: PublicCompanyState;
    companyName: string;
    marketStocks: MarketStock[];
    activeMacroEvent?: MacroEvent | null;
}) {
    if (!marketStocks || marketStocks.length === 0) return null;

    // Simulate intra-day variance for visual flavor
    const dayChangePct = (Math.random() * 4) - 2; // -2% to +2%
    const isUp = dayChangePct >= 0;
    const sign = isUp ? "+" : "";

    return (
        <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center overflow-hidden h-7 shrink-0 relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10" />
                        {/* Slower scrolling marquee */}
            <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap items-center gap-8 pl-4">
                {/* Company Stock (Only if Public) */}
                {publicState && (
                    <span className="flex items-center gap-2 text-white">
                        <span className="text-indigo-400">{companyName.substring(0, 4).toUpperCase()}</span>
                        <span>{formatMoney(publicState.share_price)}</span>
                        <span className={isUp ? "text-emerald-400" : "text-rose-400"}>
                            {sign}{dayChangePct.toFixed(2)}%
                        </span>
                    </span>
                )}
                {publicState && <span className="text-slate-600">|</span>}
                
                {/* Market Stocks from Simulation */}
                {marketStocks.filter(s => s.symbol !== companyName.substring(0, 4).toUpperCase()).map(stock => {
                    const diff = stock.momentum * 100; // simplified mock change for ticker visual
                    const sUp = diff >= 0;
                    return (
                        <React.Fragment key={stock.symbol}>
                            <span className="flex items-center gap-2">
                                <span className="text-slate-400">{stock.symbol}</span>
                                <span>{formatMoney(stock.currentPrice)}</span>
                                <span className={sUp ? "text-emerald-400" : "text-rose-400"}>
                                    {sUp ? "+" : ""}{diff.toFixed(2)}%
                                </span>
                            </span>
                            <span className="text-slate-600">|</span>
                        </React.Fragment>
                    );
                })}

                {/* Macro/Rates */}
                {activeMacroEvent ? (
                    <span className="flex items-center gap-2">
                        <span className="text-amber-400">BREAKING</span>
                        <span className="text-white">{activeMacroEvent.name}</span>
                        <span className="text-slate-400">VOLATILITY SURGE</span>
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <span className="text-amber-400">FED RATE</span>
                        <span>5.25%</span>
                        <span className="text-slate-400">UNCH</span>
                    </span>
                )}

                <span className="text-slate-600">|</span>
                
                {/* Duplicate for infinite marquee effect */}
                {publicState && (
                    <span className="flex items-center gap-2 text-white">
                        <span className="text-indigo-400">{companyName.substring(0, 4).toUpperCase()}</span>
                        <span>{formatMoney(publicState.share_price)}</span>
                        <span className={isUp ? "text-emerald-400" : "text-rose-400"}>
                            {sign}{dayChangePct.toFixed(2)}%
                        </span>
                    </span>
                )}
                {publicState && <span className="text-slate-600">|</span>}
                
                {marketStocks.filter(s => s.symbol !== companyName.substring(0, 4).toUpperCase()).map(stock => {
                    const diff = stock.momentum * 100;
                    const sUp = diff >= 0;
                    return (
                        <React.Fragment key={stock.symbol + "_dup"}>
                            <span className="flex items-center gap-2">
                                <span className="text-slate-400">{stock.symbol}</span>
                                <span>{formatMoney(stock.currentPrice)}</span>
                                <span className={sUp ? "text-emerald-400" : "text-rose-400"}>
                                    {sUp ? "+" : ""}{diff.toFixed(2)}%
                                </span>
                            </span>
                            <span className="text-slate-600">|</span>
                        </React.Fragment>
                    );
                })}
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
            `}} />
        </div>
    );
}
