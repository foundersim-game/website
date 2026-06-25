"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "lucide-react";

interface BannerData {
    active: boolean;
    text: string;
}

export function LiveBanner({ onActiveChange }: { onActiveChange?: (active: boolean) => void }) {
    const [banner, setBanner] = useState<BannerData | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await fetch(
                    `https://www.foundersim.fun/notice.json?t=${Date.now()}`,
                    { cache: "no-store" }
                );
                if (!res.ok) {
                    console.error("[LiveBanner] Bad response:", res.status);
                    return;
                }
                const data = await res.json();
                console.log("[LiveBanner] Fetched data:", data);

                if (data?.banner?.active && data.banner.text) {
                    // Safe base64 encoding for unicode/emojis
                    const safeText = encodeURIComponent(data.banner.text);
                    const bannerKey = `foundersim_banner_dismissed_${btoa(safeText).slice(0, 32)}`;
                    const wasDismissed = localStorage.getItem(bannerKey) === "true";
                    console.log("[LiveBanner] wasDismissed:", wasDismissed, "Key:", bannerKey);
                    if (!wasDismissed) {
                        setBanner({ active: true, text: data.banner.text });
                        (window as any).__bannerKey = bannerKey;
                        console.log("[LiveBanner] Banner state set to show!");
                        if (onActiveChange) onActiveChange(true);
                    }
                } else {
                    console.log("[LiveBanner] No active banner in data");
                    if (onActiveChange) onActiveChange(false);
                }
            } catch (e) {
                console.error("[LiveBanner] Fetch failed:", e);
                if (onActiveChange) onActiveChange(false);
            }
        };
        fetchBanner();
    }, []);

    const handleDismiss = () => {
        const key = (window as any).__bannerKey;
        if (key) localStorage.setItem(key, "true");
        setDismissed(true);
        if (onActiveChange) onActiveChange(false);
    };

    if (!banner || !banner.active || dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="live-banner"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ transformOrigin: "top" }}
                className="sticky top-0 z-[9999] bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white shrink-0 overflow-hidden"
            >
                <style>{`
                    @keyframes marqueeScroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>

                {/* Safe-area spacer — fills the notch/status bar with the gradient, no content hidden */}
                <div style={{ height: "env(safe-area-inset-top)" }} />

                {/* Readable content — always inside the safe zone */}
                <div className="flex items-center gap-2 px-3 py-1.5">
                    {/* Icon + label */}
                    <div className="shrink-0 flex items-center gap-1.5">
                        <Megaphone size={12} className="text-yellow-300 shrink-0" />
                        <span className="text-[0.5625rem] font-black uppercase tracking-widest text-yellow-300 whitespace-nowrap">
                            ALERT
                        </span>
                    </div>

                    {/* Seamless marquee — two copies so it loops without jumping */}
                    <div className="flex-1 overflow-hidden relative">
                        <div
                            className="whitespace-nowrap text-[0.6875rem] font-semibold text-white/95 inline-flex"
                            style={{ animation: "marqueeScroll 18s linear infinite" }}
                        >
                            <span className="pr-16">{banner.text}</span>
                            <span className="pr-16">{banner.text}</span>
                        </div>
                    </div>

                    {/* Dismiss button — always reachable */}
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
                        aria-label="Dismiss alert"
                    >
                        <X size={11} className="text-white" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
