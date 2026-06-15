"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, BookOpen, Clock, Users, Globe, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { adService } from "@/lib/services/adService";
import { playSound } from "@/lib/audio";
import { useTheme } from "@/components/ThemeProvider";
import { analyticsService } from "@/lib/services/analyticsService";

const CLONE_CAMPAIGNS = [
    {
        id: "pineapple",
        name: "Pineapple",
        subtitle: "The Hardware Monopoly",
        icon: "🍎",
        color: "from-slate-700 to-slate-900",
        description: "Start in a garage with Woz. Invent the personal computer, get ousted from your own company, return to save it from bankruptcy, and build the most valuable hardware ecosystem in history.",
        features: ["Steve Jobs narrative", "Hardware R&D system", "Supply chain scandals", "The Keynote minigame"]
    },
    {
        id: "bookface",
        name: "BookFace",
        subtitle: "The Social Empire",
        icon: "👥",
        color: "from-blue-600 to-blue-800",
        description: "Launch a college hot-or-not site and ruthlessly scale it to 3 billion users. Betray your co-founders, fight privacy hearings, buy out competitors like PhotoGram, and pivot to the MetaVerse.",
        features: ["Mark Zuckerberg narrative", "Viral loops & algorithms", "Congressional hearings", "Massive acquisitions"]
    },
    {
        id: "searchgo",
        name: "SearchGo",
        subtitle: "The Infinite Money Glitch",
        icon: "🔍",
        color: "from-emerald-500 to-teal-700",
        description: "Invent the ultimate search algorithm. Print billions with AdWords, try not to be evil, build a mobile OS monopoly, and fight a desperate Code Red war against new Chat AI startups.",
        features: ["Larry Page narrative", "AdWords money printer", "Moonshot projects", "The AI arms race"]
    },
    {
        id: "space-x",
        name: "AeroSpaceX",
        subtitle: "To Mars and Beyond",
        icon: "🚀",
        color: "from-rose-600 to-orange-700",
        description: "Use your payout from a payments startup to build electric cars and reusable rockets. Sleep on the factory floor, smoke weed on podcasts, and try not to go bankrupt before orbit.",
        features: ["Elon Musk narrative", "Manufacturing hell", "Exploding rockets", "Hostile Twitter takeovers"]
    }
];

export default function StoryModeTeaser() {
    const router = useRouter();
    const { isDark } = useTheme();

    const [votedCampaigns, setVotedCampaigns] = useState<Set<string>>(new Set());
    const [joinedWaitlist, setJoinedWaitlist] = useState(false);

    const handleVote = (campaignName: string) => {
        if (votedCampaigns.has(campaignName)) return;

        playSound("click");
        analyticsService.logEvent("story_mode_vote", { campaign: campaignName });
        
        setVotedCampaigns(prev => new Set(prev).add(campaignName));
        
        toast.success(`Vote recorded for ${campaignName}!`, {
            description: "Thanks for voting. We are prioritizing the most requested campaigns for the upcoming Story Mode."
        });
    };

    return (
        <main className="min-h-[100dvh] h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden select-none">
            {/* Background elements */}
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-indigo-100/40 dark:from-indigo-950/40 to-transparent" />
                <div className="absolute top-[10%] left-[-10%] w-[50%] aspect-square rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[-10%] w-[50%] aspect-square rounded-full bg-amber-400/20 dark:bg-amber-600/10 blur-[120px]" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 pt-[calc(env(safe-area-inset-top,40px)+1rem)] px-6 pb-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { playSound("click"); router.back(); }}
                    className="gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full pl-2 pr-4 bg-white/50 dark:bg-black/20"
                >
                    <ChevronLeft className="size-4" />
                    <span className="font-bold text-xs">Back</span>
                </Button>
                
                <div className="flex items-center gap-2 bg-indigo-100/80 dark:bg-indigo-950/80 backdrop-blur-sm border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full">
                    <Sparkles className="size-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">In Development</span>
                </div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 px-6 pt-4 pb-8 flex-1 overflow-y-auto custom-scrollbar">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl mx-auto flex flex-col items-center text-center mb-10"
                >
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center mb-5 border border-white/20">
                        <BookOpen className="size-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-none">
                        Story Mode
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium max-w-md text-sm md:text-base leading-relaxed">
                        Step into the shoes of iconic founders. Rewrite history or follow the real timeline in highly curated, branching narrative campaigns where your sandbox stats dictate your success.
                    </p>
                </motion.div>

                {/* Campaigns Grid */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {CLONE_CAMPAIGNS.map((campaign, idx) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col"
                        >
                            <div className={`h-24 bg-gradient-to-br ${campaign.color} relative overflow-hidden flex items-center justify-center`}>
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10" />
                                <span className="text-5xl relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform">{campaign.icon}</span>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{campaign.name}</h3>
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">{campaign.subtitle}</p>
                                
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-6 flex-1">
                                    {campaign.description}
                                </p>
                                
                                <div className="space-y-2 mb-6">
                                    {campaign.features.map(feat => (
                                        <div key={feat} className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                            <div className="size-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                                
                                <Button 
                                    onClick={() => handleVote(campaign.name)}
                                    disabled={votedCampaigns.has(campaign.name)}
                                    className={`w-full font-bold h-12 rounded-xl transition-all shadow-none ${
                                        votedCampaigns.has(campaign.name) 
                                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                                            : "bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-indigo-950/50 dark:text-slate-300 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700"
                                    }`}
                                >
                                    {votedCampaigns.has(campaign.name) ? "Voted ✓" : "Vote for this Campaign"}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* General Waitlist */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-xl mx-auto bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl p-8 text-center text-white shadow-xl shadow-indigo-500/20 mb-8"
                >
                    <Crown className="size-8 mx-auto mb-4 text-white/80" />
                    <h3 className="text-2xl font-black mb-2">Want to play this next?</h3>
                    <p className="text-indigo-100 text-sm font-medium mb-6">
                        We are designing Story Mode right now. Cast your votes above, or join the general waitlist to get notified the second it drops.
                    </p>
                    <Button 
                        onClick={() => { 
                            if (joinedWaitlist) return;
                            playSound("click"); 
                            analyticsService.logEvent("story_mode_waitlist");
                            setJoinedWaitlist(true);
                            toast.success("You're on the waitlist!"); 
                        }}
                        disabled={joinedWaitlist}
                        className={`rounded-xl h-12 px-8 font-black shadow-lg transition-all ${
                            joinedWaitlist 
                                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                                : "bg-white text-indigo-600 hover:bg-indigo-50"
                        }`}
                    >
                        {joinedWaitlist ? "Waitlist Joined ✓" : "Join Waitlist"}
                    </Button>
                </motion.div>
            </div>

            <Toaster position="top-center" toastOptions={{ style: { marginTop: 'calc(env(safe-area-inset-top, 40px) + 10px)' } }} />
        </main>
    );
}
