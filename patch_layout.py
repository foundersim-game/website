import os

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Fix the cross-fade micro gap
content = content.replace('{viewState === "submenu" && (', '{viewState !== "dashboard" && (')

# Revert to Old Advance button layout
old_menu_start = """            {/* BITLIFE-STYLE MAIN MENU */}"""
old_menu_end = """            {/* FULL SCREEN OVERLAYS */}"""

# We need to find the slice between old_menu_start and old_menu_end
start_idx = content.find(old_menu_start)
end_idx = content.find(old_menu_end)

if start_idx != -1 and end_idx != -1:
    new_menu = """            {/* MAIN DASHBOARD CONTROLS */}
            <div className="shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-4 pb-8" style={{
                position: "relative",
                zIndex: storyState.tutorialStep >= 2 ? 50 : 1,
                paddingBottom: isNative ? `calc(env(safe-area-inset-bottom, 0px) + ${isPremium ? '20px' : '85px'})` : '1rem'
            }}>
                <div className="max-w-md mx-auto flex flex-col gap-4">
                    
                    {/* OLD ADVANCE MONTH BUTTON */}
                    {!isLoaded ? (
                        <div className="w-full h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {storyState.tutorialStep >= 0 && !isCharacterDialogOpen ? (
                                <button
                                    onClick={() => {
                                        const currentTrigger = TUTORIAL_STEPS[storyState.tutorialStep].trigger;
                                        const next = storyState.tutorialStep + 1;
                                        setStoryState(prev => {
                                            const safeTriggers = prev.seenTriggers || [];
                                            const updatedSeen = safeTriggers.includes(currentTrigger) ? safeTriggers : [...safeTriggers, currentTrigger];
                                            return { ...prev, tutorialStep: next >= TUTORIAL_STEPS.length ? -1 : next, seenTriggers: updatedSeen };
                                        });
                                    }}
                                    className="w-full h-14 rounded-2xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
                                    style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", boxShadow: "0 4px 15px rgba(99,102,241,0.5)", position: "relative", zIndex: 50 }}
                                >
                                    {storyState.tutorialStep < TUTORIAL_STEPS.length - 1 ? `CONTINUE TUTORIAL (${storyState.tutorialStep + 1}/${TUTORIAL_STEPS.length}) →` : "FINISH TUTORIAL & START 🚀"}
                                </button>
                            ) : (
                                <button onClick={handleNextMonth} disabled={isProcessing || isCharacterDialogOpen}
                                    className={cn("w-full h-14 rounded-2xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg",
                                        isCharacterDialogOpen && "opacity-0 pointer-events-none"
                                    )}
                                    style={{ background: isProcessing ? 'linear-gradient(135deg, #818cf8, #a78bfa)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                                    {isProcessing ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simulating Month {month}...</> : <>Advance to Month {month + 1} ▶</>}
                                </button>
                            )}
                        </>
                    )}

                    {/* 4 MAIN CATEGORIES GRID */}
                    <div className="grid grid-cols-4 gap-2">
                        {/* Operations */}
                        <button onClick={() => { setTerminalTab("operations"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-blue-100 dark:border-blue-800/50"><span className="drop-shadow-sm">🏢</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Operations</span>
                        </button>
                        {/* Strategy */}
                        <button onClick={() => { setTerminalTab("market"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-rose-100 dark:border-rose-800/50"><span className="drop-shadow-sm">📈</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Strategy</span>
                        </button>
                        {/* Wealth */}
                        <button onClick={() => { setTerminalTab("personal"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-purple-100 dark:border-purple-800/50"><span className="drop-shadow-sm">💎</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Wealth</span>
                        </button>
                        {/* Corporate */}
                        <button onClick={() => { setTerminalTab("corporate"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-amber-100 dark:border-amber-800/50"><span className="drop-shadow-sm">🏛️</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Corporate</span>
                        </button>
                    </div>

                </div>
            </div>

"""
    content = content[:start_idx] + new_menu + content[end_idx:]

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)

