"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { formatMoney } from "@/lib/utils";

export type EventChoice = {
    text: string;
    effects: Record<string, number>;
};

export type GameEvent = {
    event_id?: string;
    stage?: string;
    scenario?: string;
    title: string;
    description: string;
    choices: EventChoice[];
    repeatable?: boolean;
};

interface EventModalProps {
    event: GameEvent | null;
    onResolve: (choice: EventChoice) => void;
    onClose?: () => void;
}

export function EventModal({ event, onResolve, onClose }: EventModalProps) {
    const [resolvedChoice, setResolvedChoice] = useState<EventChoice | null>(null);

    // Reset state when event changes
    useEffect(() => {
        if (event) {
            setResolvedChoice(null);
        }
    }, [event]);

    if (!event || !event.choices) return null;

    const handleChoiceClick = (choice: EventChoice) => {
        // Apply the outcome in the engine
        onResolve(choice);
        // Show the results UI
        setResolvedChoice(choice);
    };

    const handleClose = () => {
        if (onClose) onClose();
    };

    const formatEffectKey = (key: string) => {
        // e.g. "team_morale" -> "Team Morale"
        return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <Dialog open={!!event} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-white border-slate-200 border-4 rounded-[2rem] p-6 shadow-2xl [&>button]:hidden">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                        <Zap className="size-6 fill-current" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-800 leading-tight">
                        {resolvedChoice ? "Outcome" : event.title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium text-sm leading-relaxed">
                        {resolvedChoice ? `You chose: "${resolvedChoice.text}"` : event.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-6">
                    {!resolvedChoice ? (
                        event.choices.map((choice, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="w-full justify-start h-auto min-h-[4rem] py-4 px-6 bg-white border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-left rounded-2xl transition-all active:scale-[0.98] group shadow-sm flex items-center"
                                onClick={() => handleChoiceClick(choice)}
                            >
                                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 whitespace-normal block leading-snug">{choice.text}</span>
                            </Button>
                        ))
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Impact on Startup</p>
                                {Object.entries(resolvedChoice.effects).map(([key, val]) => {
                                    const isPositive = val > 0;
                                    const isMoney = ['cash', 'revenue', 'monthlyCost', 'salary'].includes(key.toLowerCase());
                                    const displayVal = isMoney ? formatMoney(Math.abs(val)) : Math.abs(val).toString();

                                    return (
                                        <div key={key} className="flex justify-between items-center py-1">
                                            <span className="text-sm font-bold text-slate-700">{formatEffectKey(key)}</span>
                                            <span className={`text-sm font-black flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {isPositive ? '+' : '-'}{displayVal}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <Button
                                className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg mt-2 transition-all active:scale-[0.98]"
                                onClick={handleClose}
                            >
                                Continue <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
