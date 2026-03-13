"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { PERKS } from "@/lib/engine/legacy";

interface PerkModalProps {
    unspent: number;
    unlocked: string[];
    onBuy: (id: string) => void;
    open: boolean;
    setOpen: (o: boolean) => void;
}

export function PerkModal({ unspent, unlocked, onBuy, open, setOpen }: PerkModalProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md bg-white border-slate-200 border-4 rounded-[2rem] p-6 shadow-2xl overflow-hidden [&>button]:hidden">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                                <Trophy className="size-5 fill-current" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Legacy Perks</h2>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1 flex items-center gap-2">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{unspent} XP AVAILABLE</span>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {PERKS.map(perk => {
                            const isUnlocked = unlocked.includes(perk.id);
                            const canAfford = unspent >= perk.cost;

                            return (
                                <div key={perk.id} className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                                    isUnlocked ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100"
                                )}>
                                    <span className="text-3xl shrink-0">{perk.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-800">{perk.name}</p>
                                        <p className="text-[10px] font-medium text-slate-500 leading-tight">{perk.description}</p>
                                    </div>
                                    <div className="shrink-0 flex flex-col items-end gap-2">
                                        {isUnlocked ? (
                                            <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Unlocked</span>
                                        ) : (
                                            <Button
                                                disabled={!canAfford}
                                                onClick={() => onBuy(perk.id)}
                                                className={cn(
                                                    "h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    canAfford ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 text-slate-400"
                                                )}
                                            >
                                                {perk.cost} XP
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Button
                        className="w-full py-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-lg transition-all active:scale-[0.98]"
                        onClick={() => setOpen(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
