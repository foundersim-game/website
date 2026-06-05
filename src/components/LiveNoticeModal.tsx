import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Bell, ExternalLink } from "lucide-react";

interface NoticeData {
    id: string;
    active: boolean;
    title: string;
    message: string;
    actionText?: string;
    actionUrl?: string;
}

export function LiveNoticeModal() {
    const [notice, setNotice] = useState<NoticeData | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                // Add a cache-buster so we always get the freshest notice!
                const res = await fetch(`https://www.foundersim.fun/notice.json?t=${Date.now()}`);
                if (!res.ok) return;
                const data: NoticeData = await res.json();
                
                if (data && data.active && data.id) {
                    const lastSeenId = localStorage.getItem("foundersim_last_notice");
                    if (lastSeenId !== data.id) {
                        setNotice(data);
                        setOpen(true);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch live notice", e);
            }
        };
        fetchNotice();
    }, []);

    const handleDismiss = (clickedButton: boolean = false) => {
        if (notice?.id) {
            localStorage.setItem("foundersim_last_notice", notice.id);
        }
        setOpen(false);

        if (clickedButton && notice?.actionUrl) {
            window.open(notice.actionUrl, "_blank");
        }
    };

    if (!open || !notice) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
            >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center text-white relative shrink-0">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <button onClick={() => handleDismiss(false)} className="absolute top-4 right-4 text-white/80 hover:text-white z-20">
                        <X size={20} />
                    </button>
                    
                    <div className="mx-auto bg-white/20 p-3 rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-md mb-3 shadow-inner relative z-10">
                        <Bell size={28} className="text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-black tracking-tight relative z-10 drop-shadow-sm">
                        {notice.title}
                    </h2>
                </div>

                <div className="p-6 flex flex-col space-y-6">
                    <p className="text-slate-600 dark:text-slate-300 text-center leading-relaxed font-medium">
                        {notice.message}
                    </p>

                    <button
                        onClick={() => handleDismiss(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center space-x-2"
                    >
                        <span>{notice.actionText || "Got it"}</span>
                        {notice.actionUrl && <ExternalLink size={18} className="opacity-80" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
