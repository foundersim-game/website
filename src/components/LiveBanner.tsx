"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "lucide-react";

interface BannerData {
    active: boolean;
    text: string;
}

export function LiveBanner() {
    const [banner, setBanner] = useState<BannerData | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch(
                    `https://www.foundersim.fun/notice.json?t=${Date.now()}`,
                    { cache: "no-store" }
                );
                if (!res.ok) return;
                const data = await res.json();
                if (data?.banner?.active && data.banner.text) {
                    // Use a composite key so changing the text auto-shows it again
                    const bannerKey = `foundersim_banner_dismissed_${btoa(data.banner.text).slice(0, 16)}`;
                    const wasDismissed = localStorage.getItem(bannerKey) === "true";
                    if (!wasDismissed) {
                        setBanner({ active: true, text: data.banner.text });
                        // Store key for later use in dismiss handler
                        (window as any).__bannerKey = bannerKey;
                    }
                }
            } catch (e) {
                // Silently fail — banner is non-critical
            }
        };
        fetchBanner();
    }, []);

    const handleDismiss = () => {
        const key = (window as any).__bannerKey;
        if (key) localStorage.setItem(key, "true");
        setDismissed(true);
    };

    if (!banner || !banner.active || dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white shrink-0"
                style={{ backgroundSize: "200% 100%", animation: "shimmer 4s linear infinite" }}
            >
                <style>{`
                    @keyframes shimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                    @keyframes marquee {
                        0% { transform: translateX(100vw); }
                        100% { transform: translateX(-100%); }
                    }
                `}</style>

                <div className="flex items-center gap-2 px-3 py-1.5 relative">
                    {/* Icon */}
                    <div className="shrink-0 flex items-center gap-1.5">
                        <Megaphone size={12} className="text-yellow-300 shrink-0" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-300 whitespace-nowrap">
                            LIVE
                        </span>
                    </div>

                    {/* Scrolling text container */}
                    <div className="flex-1 overflow-hidden relative">
                        <div
                            className="whitespace-nowrap text-[11px] font-bold text-white/95 inline-block"
                            style={{
                                animation: "marquee 20s linear infinite",
                                paddingLeft: "100%"
                            }}
                        >
                            {banner.text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{banner.text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{banner.text}
                        </div>
                    </div>

                    {/* Dismiss button */}
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 ml-1 text-white/60 hover:text-white transition-colors p-0.5 rounded"
                    >
                        <X size={12} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
