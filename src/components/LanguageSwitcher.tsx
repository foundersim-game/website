"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const LANGUAGES = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "pt", name: "Português (BR)", flag: "🇧🇷" }
];

export function LanguageSwitcher({ className }: { className?: string }) {
    const { i18n, t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const currentLang = i18n.language || "en";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
                className={`flex items-center justify-center gap-1.5 px-3 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90 ${className || ''}`}
                aria-label="Select language"
            >
                <Globe className="size-3.5" />
                <span className="text-[0.625rem] font-black uppercase tracking-wider">{currentLang}</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[320px] rounded-3xl p-6 border-slate-100 dark:border-slate-800 shadow-2xl z-[99999]">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-xl font-black text-center flex items-center justify-center gap-2">
                        <Globe className="size-5 text-indigo-600" />
                        {t("dashboard.menu.language", { defaultValue: "Select Language" })}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                i18n.changeLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all active:scale-[0.98] ${currentLang === lang.code ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl leading-none">{lang.flag}</span>
                                <span className="font-bold">{lang.name}</span>
                            </div>
                            {currentLang === lang.code && <Check className="size-5" />}
                        </button>
                    ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[0.65rem] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                    <p>
                        {t("menu.languageDisclaimer", { defaultValue: "Please note: Translations for non-English languages are in beta. If you spot any errors or awkward phrasing, please submit a bug report so we can improve it. We in no manner want to disrespect any language or culture!" })}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
