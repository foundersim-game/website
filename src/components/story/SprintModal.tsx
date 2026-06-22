"use client";
// src/components/story/SprintModal.tsx
import React, { useState } from "react";
import { SprintAllocation } from "@/lib/story/types";
import {
  SPRINT_BUCKETS,
  validateAllocation,
  getAllocationTotal,
  describeAllocationImpacts,
} from "@/lib/story/sprintAllocation";

interface Props {
  currentAllocation: SprintAllocation;
  onSave: (a: SprintAllocation) => void;
  onClose: () => void;
  accentColor: string;
}

export default function SprintModal({ currentAllocation, onSave, onClose, accentColor }: Props) {
  const [allocation, setAllocation] = useState<SprintAllocation>({ ...currentAllocation });
  const total = getAllocationTotal(allocation);
  const isValid = Math.round(total) === 100;
  const impacts = describeAllocationImpacts(allocation);

  function updateBucket(bucket: keyof SprintAllocation, value: number) {
    setAllocation((prev) => ({ ...prev, [bucket]: Math.max(0, Math.min(100, value)) }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full md:max-w-lg md:rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0f0f14 0%, #16161f 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-1">Monthly Focus</div>
            <h2 className="text-xl font-black text-white">Sprint Allocation</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl transition-colors">✕</button>
        </div>

        {/* Total counter */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-400">Points distributed</span>
            <span
              className="text-lg font-black"
              style={{ color: isValid ? "#22c55e" : total > 100 ? "#ef4444" : "#f97316" }}
            >
              {Math.round(total)}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${Math.min(100, total)}%`,
                background: isValid ? "#22c55e" : total > 100 ? "#ef4444" : `${accentColor}`,
              }}
            />
          </div>
          {!isValid && (
            <p className="text-xs text-amber-400 mt-1">
              {total > 100
                ? `Over by ${Math.round(total - 100)} points — reduce some sliders.`
                : `${Math.round(100 - total)} points remaining to distribute.`}
            </p>
          )}
        </div>

        {/* Sliders */}
        <div className="px-5 pb-4 space-y-4">
          {SPRINT_BUCKETS.map((bucket) => {
            const val = allocation[bucket.id as keyof SprintAllocation] as number;
            const impact = impacts.find((i) => i.bucket === bucket.id);

            return (
              <div key={bucket.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{bucket.emoji}</span>
                    <span className="text-sm font-bold text-white">{bucket.label}</span>
                  </div>
                  <span
                    className="text-sm font-black w-8 text-right"
                    style={{ color: val >= 30 ? accentColor : "white" }}
                  >
                    {val}%
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={val}
                  onChange={(e) => updateBucket(bucket.id as keyof SprintAllocation, Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg, ${accentColor} ${val}%, rgba(255,255,255,0.1) ${val}%)`,
                    accentColor: accentColor,
                  }}
                />

                {impact && impact.impacts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {impact.impacts.map((line, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-slate-400 transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => isValid && onSave(allocation)}
            disabled={!isValid}
            className="flex-1 py-3 rounded-xl font-black text-white transition-all"
            style={{
              background: isValid
                ? `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`
                : "rgba(255,255,255,0.05)",
              color: isValid ? "white" : "rgba(255,255,255,0.3)",
              cursor: isValid ? "pointer" : "not-allowed",
              boxShadow: isValid ? `0 8px 20px ${accentColor}44` : "none",
            }}
          >
            Save Sprint
          </button>
        </div>
      </div>
    </div>
  );
}
