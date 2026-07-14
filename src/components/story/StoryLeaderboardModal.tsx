"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoryLeaderboard, StoryRunLeaderboardEntry } from "@/lib/services/leaderboardService";
import { Trophy, Clock, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

const CAMPAIGNS = [
  { id: "pineapple", name: "Pineapple" },
  { id: "bookface", name: "BookFace" },
  { id: "searchgo", name: "SearchGo" },
];

export default function StoryLeaderboardModal({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState("pineapple");
  const [entries, setEntries] = useState<StoryRunLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getStoryLeaderboard(activeTab, 50).then((data) => {
      if (active) {
        setEntries(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [activeTab]);

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
        className="w-full max-w-xl bg-[#080810] border border-white/10 rounded-2xl flex flex-col overflow-hidden max-h-[85vh]"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-yellow-400" />
            <h2 className="text-lg font-black text-white">Speedrun Leaderboard</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 py-3 gap-2 border-b border-white/5">
          {CAMPAIGNS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${
                activeTab === c.id ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="size-6 animate-spin mb-2" />
              <div className="text-xs uppercase tracking-widest font-black">Loading Records...</div>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Clock className="size-8 mb-2 opacity-50" />
              <div className="text-sm font-bold">No speedruns recorded yet.</div>
              <div className="text-xs mt-1">Be the first to complete this campaign!</div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 mb-2">
                <div className="w-8">Rank</div>
                <div className="flex-1">Founder</div>
                <div className="text-right w-24">Months Played</div>
              </div>
              {entries.map((entry, idx) => (
                <div key={entry.id} className="flex items-center px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-8 font-black text-sm ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-600"}`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1 font-bold text-sm text-slate-200">{entry.username}</div>
                  <div className="text-right w-24 font-black text-indigo-400">{entry.monthsPlayed} <span className="text-[10px] text-indigo-400/60 uppercase tracking-widest">mo</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
