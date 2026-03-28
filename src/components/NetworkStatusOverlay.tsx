"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw, Cpu, Users, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworkStatusOverlayProps {
    isOnline: boolean;
    onRetry: () => void;
}

export function NetworkStatusOverlay({ isOnline, onRetry }: NetworkStatusOverlayProps) {
    if (isOnline) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
        >
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 blur-[80px] rounded-full" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 rotate-3">
                        <WifiOff className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">Connection Required</h2>
                    <p className="text-slate-400 text-sm font-medium mb-8">
                        Founder Sim requires an active internet connection to power its <span className="text-indigo-400 font-bold">AI-Driven Dynamic World</span>.
                    </p>

                    <div className="grid grid-cols-1 gap-3 w-full mb-8">
                        <FeatureItem 
                            icon={<Cpu className="w-4 h-4" />} 
                            title="AI Mentorship" 
                            desc="Real-time strategic advice from Sam." 
                        />
                        <FeatureItem 
                            icon={<Zap className="w-4 h-4" />} 
                            title="Rivalry Events" 
                            desc="Dynamic competition with AI founders." 
                        />
                        <FeatureItem 
                            icon={<Globe className="w-4 h-4" />} 
                            title="AI-Driven Market Shifts" 
                            desc="Real-time simulations of market changes." 
                        />
                    </div>

                    <Button 
                        onClick={onRetry}
                        className="w-full h-14 bg-white hover:bg-slate-100 text-slate-950 rounded-2xl font-black uppercase italic tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <RefreshCw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                        Reconnect Now
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-left transition-all hover:bg-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">{title}</p>
                <p className="text-[11px] text-slate-400 font-medium leading-tight">{desc}</p>
            </div>
        </div>
    );
}
