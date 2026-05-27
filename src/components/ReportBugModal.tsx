"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, Send, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { playSound } from "@/lib/audio";

interface ReportBugModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReportBugModal({ isOpen, onClose }: ReportBugModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error("Please fill in all fields to report a bug.");
            playSound("fail");
            return;
        }

        setIsSubmitting(true);
        playSound("click");

        try {
            const response = await fetch("https://formspree.io/f/xaqljavr", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    context: "Founder Sim Bug Report"
                })
            });

            if (response.ok) {
                toast.success("Bug report submitted successfully! Thank you.");
                playSound("success");
                setName("");
                setEmail("");
                setMessage("");
                onClose();
            } else {
                throw new Error("Failed to submit form");
            }
        } catch (error) {
            toast.error("Failed to submit bug report. Please try again later.");
            playSound("fail");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-br from-rose-500 to-pink-600 px-6 py-6 text-white shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Bug className="size-6 text-white" />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="size-8 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center transition-colors text-white/70 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <h2 className="text-xl font-black tracking-tight mt-2">Report a Bug</h2>
                            <p className="text-rose-100 text-sm font-medium mt-1 leading-snug">
                                Encountered an issue? Let us know so we can fix it!
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-rose-400 dark:focus:border-rose-500 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-rose-400 dark:focus:border-rose-500 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                                        Bug Details
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Please describe the issue, what you were doing when it happened, and any error messages..."
                                        rows={4}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-rose-400 dark:focus:border-rose-500 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                                    />
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex gap-2.5 mt-2">
                                    <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-snug">
                                        If possible, include steps to reproduce the bug. We will follow up via email if we need more details.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-black text-sm tracking-wide shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all mt-4"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                    {isSubmitting ? "SUBMITTING..." : "SUBMIT BUG REPORT"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
