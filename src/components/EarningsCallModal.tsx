import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Startup, Founder } from "@/lib/types/database.types";
import { formatMoney } from "@/lib/utils";

interface EarningsCallModalProps {
    open: boolean;
    startup: Startup;
    founder: Founder;
    month: number;
    onComplete: (results: {
        guidance: "bullish" | "realistic" | "bearish",
        questionAnswered: string,
        priceImpactPct: number,
        message: string
    }) => void;
}

const ANALYST_QUESTIONS = [
    {
        id: 1,
        question: "With competitors aggressively discounting, how do you defend your margins next quarter?",
        options: [
            { text: "We will counter with aggressive feature drops to justify our premium.", impact: 0.02, msg: "Analysts loved the product-first focus." },
            { text: "We will reluctantly match prices to defend market share.", impact: -0.04, msg: "Street fears a race to the bottom on pricing." },
            { text: "We refuse to comment on competitor pricing strategy.", impact: -0.01, msg: "Analysts noted your defensive posture." }
        ]
    },
    {
        id: 2,
        question: "Your R&D spend has ballooned. When will investors see a return on this AI pivot?",
        options: [
            { text: "The AI wave is a decade-long play. We invest for the future.", impact: 0.01, msg: "Investors appreciate the long-term vision." },
            { text: "We expect tangible revenue acceleration from AI by Q4.", impact: 0.04, msg: "Aggressive timeline excited retail investors." },
            { text: "We will slash R&D next quarter to protect the bottom line.", impact: -0.03, msg: "Street worries you are abandoning innovation." }
        ]
    },
    {
        id: 3,
        question: "There are rumors of internal team strife and high executive turnover. Can you comment?",
        options: [
            { text: "Turnover is natural as we scale into a global enterprise.", impact: 0.01, msg: "A safe, standard corporate PR response." },
            { text: "Those rumors are completely fabricated by short sellers.", impact: -0.02, msg: "Combative tone spooked institutional holders." },
            { text: "We are actively recruiting world-class leaders to replace them.", impact: 0.03, msg: "Proactive hiring stance reassured the market." }
        ]
    }
];

export function EarningsCallModal({ open, startup, founder, month, onComplete }: EarningsCallModalProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedGuidance, setSelectedGuidance] = useState<"bullish" | "realistic" | "bearish" | null>(null);
    
    const [consensusReduction, setConsensusReduction] = useState(0);
    
    // Pick a random question on mount/open
    const [qData, setQData] = useState(() => ANALYST_QUESTIONS[Math.floor(Math.random() * ANALYST_QUESTIONS.length)]);

    React.useEffect(() => {
        if (open) {
            setStep(1);
            setSelectedGuidance(null);
            setQData(ANALYST_QUESTIONS[Math.floor(Math.random() * ANALYST_QUESTIONS.length)]);
            setConsensusReduction(0);
        }
    }, [open]);

    if (!open || !startup.public_company) return null;

    const pub = startup.public_company;
    const eps = pub.eps_last_quarter;
    const consensus = pub.consensus_eps - consensusReduction;
    
    // EPS Beat/Miss Logic
    const isBeat = eps >= consensus;
    const difference = eps - consensus;
    const differencePct = (difference / Math.abs(consensus || 1)) * 100;
    
    let epsImpact = 0;
    if (isBeat) {
        epsImpact = Math.min(0.08, 0.01 + (differencePct / 1000)); // up to +8%
    } else {
        epsImpact = Math.max(-0.15, -0.03 + (differencePct / 1000)); // up to -15%
    }

    const handleSubmitGuidance = (guidance: "bullish" | "realistic" | "bearish") => {
        setSelectedGuidance(guidance);
        setStep(2);
    };

    const handleAnswerQuestion = (opt: any) => {
        if (!selectedGuidance) return;
        
        let guidanceImpact = 0;
        if (selectedGuidance === "bullish") guidanceImpact = 0.02;
        if (selectedGuidance === "bearish") guidanceImpact = -0.04;
        if (selectedGuidance === "realistic") guidanceImpact = 0.00;

        const totalImpact = epsImpact + guidanceImpact + opt.impact;
        
        const qNum = Math.max(1, Math.ceil((month % 12) / 3));
        let finalMessage = isBeat 
            ? t("dashboard.timeline.q_earnings_beat", { q: qNum, defaultValue: `Q${qNum} Earnings: BEAT consensus. ` })
            : t("dashboard.timeline.q_earnings_miss", { q: qNum, defaultValue: `Q${qNum} Earnings: MISSED consensus. ` });
        finalMessage += t("dashboard.timeline.guidance_was", { guidance: selectedGuidance, defaultValue: `Guidance was ${selectedGuidance}. ` });
        finalMessage += t("dashboard.timeline.qa_result", { msg: opt.msg, defaultValue: `Q&A Result: ${opt.msg} ` });
        
        onComplete({
            guidance: selectedGuidance,
            questionAnswered: opt.text,
            priceImpactPct: totalImpact,
            message: finalMessage
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <h2 className="text-2xl font-black tracking-tight relative z-10">{t("dashboard.earnings.title", { defaultValue: "Quarterly Earnings Call" })}</h2>
                    <p className="text-indigo-200 text-sm font-medium mt-1 relative z-10">{startup.symbol || "CORP"} {t("dashboard.earnings.investor_relations", { defaultValue: "Investor Relations" })}</p>
                </div>

                <div className="p-6">
                    {/* EPS Results */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-[0.625rem] uppercase font-black text-slate-500 tracking-wider mb-1">{t("dashboard.earnings.reported_eps", { defaultValue: "Reported EPS" })}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">${eps.toFixed(3)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[0.625rem] uppercase font-black text-slate-500 tracking-wider mb-1">{t("dashboard.earnings.consensus", { defaultValue: "Consensus" })}</p>
                            <p className="text-lg font-black text-slate-600 dark:text-slate-400">${consensus.toFixed(3)}</p>
                        </div>
                    </div>

                    {isBeat ? (
                        <div className="mb-6 flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
                            <span className="text-xl">📈</span>
                            <p className="text-sm font-bold">{t("dashboard.earnings.beat", { defaultValue: "Earnings Beat! The street is impressed." })}</p>
                        </div>
                    ) : (
                        <div className="mb-6 flex items-center justify-between bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl">
                            <div className="flex items-center gap-2 text-rose-600">
                                <span className="text-xl">📉</span>
                                <p className="text-sm font-bold">{t("dashboard.earnings.missed", { defaultValue: "Earnings Missed. Investors are demanding answers." })}</p>
                            </div>
                            {consensusReduction === 0 && (
                                <button 
                                    onClick={() => {
                                        import('@/lib/services/adService').then(({ adService }) => {
                                            adService.showRewardedAd(() => {
                                                setConsensusReduction(pub.consensus_eps * 0.15); // Reduce by 15%
                                                import('sonner').then(m => m.toast.success("Guidance Adjusted", { description: "Wall Street analysts have lowered their targets." }));
                                            });
                                        });
                                    }}
                                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg text-[0.5625rem] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                                >
                                    <span>▶</span> {t("dashboard.earnings.adjust_models", { defaultValue: "Adjust Models" })}
                                </button>
                            )}
                        </div>
                    )}

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase mb-4 tracking-widest">{t("dashboard.earnings.step1", { defaultValue: "1. Issue Forward Guidance" })}</h3>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => handleSubmitGuidance("bullish")} className="text-left p-4 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 transition-all active:scale-95 group">
                                    <p className="font-black text-emerald-600 dark:text-emerald-400">{t("dashboard.earnings.bullish", { defaultValue: "Bullish (+)" })}</p>
                                    <p className="text-xs text-slate-500 mt-1">{t("dashboard.earnings.bullish_desc", { defaultValue: "Raise forecasts. Pops the stock today, but sets a dangerously high bar for next quarter." })}</p>
                                </button>
                                <button onClick={() => handleSubmitGuidance("realistic")} className="text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900 transition-all active:scale-95">
                                    <p className="font-black text-slate-700 dark:text-slate-300">{t("dashboard.earnings.realistic", { defaultValue: "Realistic (=)" })}</p>
                                    <p className="text-xs text-slate-500 mt-1">{t("dashboard.earnings.realistic_desc", { defaultValue: "Maintain current forecasts. Safe, but boring to growth investors." })}</p>
                                </button>
                                <button onClick={() => handleSubmitGuidance("bearish")} className="text-left p-4 rounded-xl border-2 border-rose-100 dark:border-rose-900/30 hover:border-rose-500 bg-white dark:bg-slate-900 transition-all active:scale-95">
                                    <p className="font-black text-rose-600 dark:text-rose-400">{t("dashboard.earnings.bearish", { defaultValue: "Bearish (-)" })}</p>
                                    <p className="text-xs text-slate-500 mt-1">{t("dashboard.earnings.bearish_desc", { defaultValue: "Lower forecasts. Tanks the stock today, but makes next quarter an easy beat." })}</p>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase mb-4 tracking-widest">{t("dashboard.earnings.step2", { defaultValue: "2. Analyst Q&A" })}</h3>
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-4 relative">
                                <div className="absolute -left-2 -top-2 text-2xl">🎙️</div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic ml-4">
                                    &quot;{t(`dashboard.earnings.q${qData.id}_text`, { defaultValue: qData.question })}&quot;
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                {qData.options.map((opt, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleAnswerQuestion(opt)}
                                        className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        &quot;{t(`dashboard.earnings.q${qData.id}_opt${idx}`, { defaultValue: opt.text })}&quot;
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
