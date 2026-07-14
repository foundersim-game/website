"use client";
// src/components/story/TimelineArchiveModal.tsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getArchivedRuns, ArchivedRun } from "@/lib/story/archiveRegistry";
import { getCurrencySymbol } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

function fmtCash(n: number): string {
  const c = getCurrencySymbol();
  if (Math.abs(n) >= 1e12) return `${c}${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${c}${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${c}${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${c}${(n / 1e3).toFixed(0)}K`;
  return `${c}${n.toFixed(0)}`;
}

export default function TimelineArchiveModal({ onClose }: Props) {
  const [runs, setRuns] = useState<ArchivedRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ArchivedRun | null>(null);

  useEffect(() => {
    setRuns(getArchivedRuns());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#080810] border border-white/10 rounded-2xl flex flex-col overflow-hidden max-h-[85vh]"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/5">
          <h2 className="text-lg font-black text-white">Timeline Archive</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: List of runs */}
          <div className="w-1/3 min-w-[200px] border-r border-white/5 bg-white/[0.02] overflow-y-auto custom-scrollbar p-3 space-y-2">
            {runs.length === 0 ? (
              <div className="text-xs text-slate-500 text-center mt-6">No completed runs yet. Finish a campaign to see it here!</div>
            ) : (
              runs.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRun(r)}
                  className={`w-full text-left p-3 rounded-xl transition-colors border ${
                    selectedRun?.id === r.id
                      ? "bg-indigo-500/20 border-indigo-500/30"
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="font-bold text-sm text-white mb-0.5">{r.companyName}</div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black">
                    <span className={r.outcome === "win" ? "text-emerald-400" : "text-rose-400"}>
                      {r.outcome === "win" ? "Victory" : "Defeat"}
                    </span>
                    <span className="text-slate-500">{new Date(r.dateCompleted).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right: Selected Run Details */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 relative">
            {!selectedRun ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Select a run to view its history
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">{selectedRun.companyName}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Outcome: <span className={selectedRun.outcome === "win" ? "text-emerald-400" : "text-rose-400"}>{selectedRun.outcome}</span></span>
                    <span>Duration: {selectedRun.monthsPlayed} months</span>
                    <span>Final Val: {fmtCash(selectedRun.finalValuation)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Full Timeline Log</div>
                  <div className="space-y-3">
                    {selectedRun.timeline.map((entry, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-indigo-400 font-bold mr-2 text-xs">Mo {entry.month}</span>
                        <span className="text-slate-300">{entry.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
