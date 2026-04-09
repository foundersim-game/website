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
        
        const darkBg = '#0f1117';  // matches CSS --background in dark
        const lightBg = '#f7f8fc'; // matches CSS --background in light
        const bg = newTheme === "dark" ? darkBg : lightBg;

        // Update web meta tag for PWA
        document.getElementById('theme-color-meta')?.setAttribute('content', bg);

        try {
            const { StatusBar, Style } = await import("@capacitor/status-bar");
            await StatusBar.setStyle({ style: newTheme === "dark" ? Style.Dark : Style.Light });
            
            // On iOS, we make the status bar transparent and overlay the webview
            // This ensures the top bar color matches the game header perfectly.
            try {
                await StatusBar.setOverlaysWebView({ overlay: true });
            } catch (e) {
                // setOverlaysWebView not available on all platforms, safe to ignore
            }

            if (newTheme === "dark") {
                await StatusBar.setBackgroundColor({ color: darkBg });
            } else {
                await StatusBar.setBackgroundColor({ color: lightBg });
            }
        } catch (e) {
            console.warn("StatusBar plugin not available", e);
        }

        try {
            // @ts-ignore - Dynamic import for native plugin
            const { NavigationBar } = await import('@capgo/capacitor-navigation-bar');
            await (NavigationBar as any).set({ color: bg, darkButtons: newTheme !== "dark" });
        } catch (e) {
            // NavigationBar plugin optional — Android only, safe to swallow on iOS
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
