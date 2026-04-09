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
        
        try {
            const { StatusBar, Style } = await import("@capacitor/status-bar");
            if (newTheme === "dark") {
                await StatusBar.setStyle({ style: Style.Dark });
                // Match the oklch(0.12 0.015 240) background color which is ~#1a1c24
                await StatusBar.setBackgroundColor({ color: '#1a1c24' });
                document.getElementById('theme-color-meta')?.setAttribute('content', '#1a1c24');
            } else {
                await StatusBar.setStyle({ style: Style.Light });
                await StatusBar.setBackgroundColor({ color: '#f7f8fc' });
                document.getElementById('theme-color-meta')?.setAttribute('content', '#f7f8fc');
            }
        } catch (e) {
            console.warn("StatusBar plugin not available", e);
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
