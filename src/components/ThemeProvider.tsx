"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "light",
    toggleTheme: () => {},
    isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    const updateNativeUI = useCallback(async (newTheme: Theme) => {
        if (typeof window === "undefined") return;
        
        const isDark = newTheme === "dark";
        const darkBg = '#0f1117';  // matches CSS --background in dark
        const lightBg = '#f7f8fc'; // matches CSS --background in light
        const bg = isDark ? darkBg : lightBg;

        // Update web meta tag for PWA
        document.getElementById('theme-color-meta')?.setAttribute('content', bg);

        try {
            const { StatusBar, Style } = await import("@capacitor/status-bar");
            
            // 1. Set text/icon style
            // Style.Dark = White icons (for dark bg)
            // Style.Light = Black icons (for light bg)
            await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
            
            // 2. iOS Overlay Support
            // Force content to go UNDER the status bar for a premium full-screen look
            try {
                await StatusBar.setOverlaysWebView({ overlay: true });
            } catch (e) {
                // Not supported on Android, ignore
            }

            // 3. Android Background Color (ignored on iOS when overlay is true)
            try {
                await StatusBar.setBackgroundColor({ color: bg });
            } catch (e) {
                // Not supported on iOS, ignore
            }
        } catch (e) {
            console.warn("StatusBar plugin error:", e);
        }

        try {
            // @ts-ignore - Dynamic import for native plugin
            const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
            await (NavigationBar as any).set({ 
                color: bg, 
                darkButtons: !isDark // Black icons on light bg
            });
        } catch (e) {
            // NavigationBar plugin optional — Android only
        }
    }, []);

    // On mount, read preference from localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem("foundersim_theme") as Theme | null;
        const initial = stored ?? "dark";
        setTheme(initial);
        document.documentElement.classList.toggle("dark", initial === "dark");
        updateNativeUI(initial);
    }, [updateNativeUI]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("foundersim_theme", next);
            document.documentElement.classList.toggle("dark", next === "dark");
            updateNativeUI(next);
            return next;
        });
    }, [updateNativeUI]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
