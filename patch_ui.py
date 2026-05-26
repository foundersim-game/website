import os

with open("src/app/dashboard/page.tsx", "r") as f:
    lines = f.readlines()

new_lines = []

for idx, line in enumerate(lines):
    if "const [showPostIpoCinematic" in line:
        new_lines.append('    const [viewState, setViewState] = useState<"dashboard" | "submenu" | "action">("dashboard");\n')
    new_lines.append(line)

start_idx = -1
end_idx = -1
for i, line in enumerate(new_lines):
    if "            {/* TERMINAL NAVIGATION TABS */}" in line:
        start_idx = i
    if start_idx != -1 and "            {/* MANDATORY CONNECTION OVERLAY */}" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    ui_block = """
            {/* BITLIFE-STYLE MAIN MENU */}
            <div className="shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-4 pt-6 pb-8" style={{
                position: "relative",
                zIndex: storyState.tutorialStep >= 2 ? 50 : 1,
                paddingBottom: isNative ? `calc(env(safe-area-inset-bottom, 0px) + ${isPremium ? '20px' : '85px'})` : '1rem'
            }}>
                <div className="max-w-md mx-auto grid grid-cols-3 grid-rows-2 gap-y-6 gap-x-2 items-center justify-items-center">
                    
                    {/* TOP LEFT: Operations */}
                    <button onClick={() => { setTerminalTab("operations"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm border border-blue-100 dark:border-blue-800/50 hover:scale-105 transition-transform"><span className="drop-shadow-sm">🏢</span></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Operations</span>
                    </button>

                    {/* CENTER: Advance Month (Spans 2 rows) */}
                    <div className="col-span-1 row-span-2 w-full flex justify-center items-center">
                        {!isLoaded ? (
                            <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                            </div>
                        ) : (storyState.tutorialStep >= 0 && !isCharacterDialogOpen) ? (
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
                                className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center text-white active:scale-95 transition-all z-50 relative"
                            >
                                <span className="text-[10px] font-black tracking-widest uppercase">Tutorial</span>
                                <span className="text-2xl font-black mt-1">→</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleNextMonth} 
                                disabled={isProcessing || isCharacterDialogOpen}
                                className={cn(
                                    "relative w-[7.5rem] h-[7.5rem] rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_8px_30px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center text-white hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-950 z-10",
                                    isCharacterDialogOpen && "opacity-50 pointer-events-none"
                                )}
                            >
                                {isProcessing ? (
                                    <div className="w-8 h-8 border-4 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="text-[10px] font-black tracking-widest uppercase opacity-90">Advance</span>
                                        <span className="text-3xl font-black mt-0.5">+{month + 1}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* TOP RIGHT: Market */}
                    <button onClick={() => { setTerminalTab("market"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm border border-rose-100 dark:border-rose-800/50 hover:scale-105 transition-transform"><span className="drop-shadow-sm">📈</span></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Market</span>
                    </button>

                    {/* BOTTOM LEFT: Wealth */}
                    <button onClick={() => { setTerminalTab("personal"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm border border-purple-100 dark:border-purple-800/50 hover:scale-105 transition-transform"><span className="drop-shadow-sm">💎</span></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Wealth</span>
                    </button>

                    {/* BOTTOM RIGHT: Treasury/Corporate (Post-IPO) */}
                    {startup.public_company ? (
                        <button onClick={() => { setTerminalTab("treasury"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5">
                            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm border border-amber-100 dark:border-amber-800/50 hover:scale-105 transition-transform"><span className="drop-shadow-sm">🏦</span></div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Treasury</span>
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5 opacity-40">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-inner border border-slate-200 dark:border-slate-700"><span className="drop-shadow-sm">🔒</span></div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Post-IPO</span>
                        </div>
                    )}
                </div>
            </div>

            {/* FULL SCREEN OVERLAYS */}
            <AnimatePresence>
                {viewState === "submenu" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[100] flex flex-col"
                    >
                        {/* Submenu Top Bar */}
                        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                            <button onClick={() => setViewState("dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-transform">
                                <span className="text-xl">←</span> <span className="font-black text-sm uppercase tracking-widest">Dashboard</span>
                            </button>
                            <h2 className="mx-auto font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
                                {terminalTab === "operations" ? "🏢 Operations" : terminalTab === "market" ? "📈 Market" : terminalTab === "personal" ? "💎 Wealth" : "🏦 Treasury"}
                            </h2>
                            <div className="w-[104px]" /> {/* Spacer to balance Back button */}
                        </div>
                        {/* Submenu Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ paddingBottom: isNative ? `calc(env(safe-area-inset-bottom, 0px) + 2rem)` : '2rem' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                                {(() => {
                                    let cats = [] as any[];
                                    if (terminalTab === "operations") {
                                        cats = [
                                            { id: "product", emoji: "🔧", label: "Product", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "Build & manage tech" },
                                            { id: "marketing", emoji: "📈", label: "Growth", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Acquire users" },
                                            { id: "market", emoji: "⚔️", label: "Rivals", color: "#fff7ed", border: "#ffedd5", text: "#9a3412", desc: "Attack competitors" },
                                            { id: "hiring", emoji: "👥", label: "Hire", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Recruit & manage team" },
                                            { id: "funding", emoji: "💰", label: "Funding", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", desc: "Raise capital" },
                                            { id: "stats", emoji: "📊", label: "Stats", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Financials & metrics" },
                                            { id: "founder", emoji: "👤", label: "Founder", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Manage energy" },
                                        ];
                                    } else if (terminalTab === "market") {
                                        cats = [
                                            { id: "sector", emoji: "🌐", label: "Sector", color: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", desc: "Analyze macro trends" },
                                            { id: "analysts", emoji: "🎙️", label: "PR/Comms", color: "#f5f3ff", border: "#ddd6fe", text: "#7c3aed", desc: "Public relations" },
                                            ...(startup.public_company ? [{ id: "options", emoji: "🎲", label: "Options", color: "#fff7ed", border: "#ffedd5", text: "#ea580c", desc: "Derivatives market" }] : [])
                                        ];
                                    } else if (terminalTab === "treasury") {
                                        cats = [
                                            { id: "trade_stock", emoji: "📉", label: "Trade", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Trade public equities" },
                                            { id: "buyback", emoji: "💸", label: "Buyback", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Share buybacks" },
                                            { id: "corporate_debt", emoji: "🏦", label: "Debt", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Issue corporate bonds" },
                                            { id: "manda_acquire", emoji: "🦈", label: "Acquire", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "M&A acquisition" },
                                            { id: "subsidiary", emoji: "🏢", label: "Manage", color: "#f8fafc", border: "#cbd5e1", text: "#475569", desc: "Subsidiary oversight" },
                                        ];
                                    } else if (terminalTab === "personal") {
                                        cats = [
                                            { id: "personal_trade", emoji: "📉", label: "Brokerage", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Personal stock trading" },
                                            ...(startup.public_company ? [
                                                { id: "margin_loan", emoji: "💳", label: "Margin", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Borrow against stock" },
                                                { id: "10b51", emoji: "📄", label: "10b51", color: "#fff7ed", border: "#ffedd5", text: "#9a3412", desc: "Automated trading" }
                                            ] : []),
                                            { id: "philanthropy", emoji: "🕊️", label: "Donate", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", desc: "Charity for reputation" },
                                            { id: "lifestyle", emoji: "💎", label: "Lifestyle", color: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9", desc: "Luxury assets & perks" },
                                        ];
                                    } else if (terminalTab === "compliance") {
                                        cats = [
                                            { id: "lobbying", emoji: "🏛️", label: "Lobbying", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "Influence regulations" },
                                            { id: "board_mgmt", emoji: "🪑", label: "Board", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Manage board" },
                                            { id: "fines", emoji: "⚖️", label: "Legal", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Settle lawsuits" },
                                        ];
                                    }
                                    return cats.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setActionCategory(cat.id as SheetCategory);
                                                setViewState("action");
                                            }}
                                            className="p-5 rounded-2xl border-2 flex items-center gap-4 transition-all active:scale-[0.98]"
                                            style={{
                                                backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : cat.color,
                                                borderColor: isDark ? "rgba(51, 65, 85, 0.5)" : cat.border
                                            }}
                                        >
                                            <span className="text-4xl drop-shadow-sm">{cat.emoji}</span>
                                            <div className="text-left flex-1">
                                                <span className="block text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider leading-tight">{cat.label}</span>
                                                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{cat.desc}</span>
                                            </div>
                                            <span className="text-slate-400 dark:text-slate-600 text-xl font-bold">›</span>
                                        </button>
                                    ));
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewState === "action" && actionCategory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[200] flex flex-col"
                    >
                        {/* Action Top Bar */}
                        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                            <button onClick={() => setViewState("submenu")} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-transform">
                                <span className="text-xl">←</span> <span className="font-black text-sm uppercase tracking-widest">Back</span>
                            </button>
                            <h2 className="mx-auto font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm text-center">
                                {actionCategory.replace("_", " ")}
                            </h2>
                            <div className="w-[104px]" /> {/* Spacer */}
                        </div>
                        {/* Action Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ paddingBottom: isNative ? `calc(env(safe-area-inset-bottom, 0px) + 2rem)` : '2rem' }}>
                            <div className="max-w-3xl mx-auto">
                                <ActionSheet
                                    category={actionCategory}
                                    startup={startup}
                                    founder={founder}
                                    m={m}
                                    allEmployees={allEmployees}
                                    selectedAction={selectedAction}
                                    rejectedCandidates={rejectedCandidates}
                                    setSelectedAction={(action) => {
                                        handleActionClick(action as any);
                                        const c = actionCategory || "";
                                        if (!["product", "marketing", "hiring", "funding", "market"].includes(c)) {
                                            setViewState("submenu");
                                        }
                                    }}
                                    selectedEmpIdx={selectedEmpIdx}
                                    setSelectedEmpIdx={setSelectedEmpIdx}
                                    handleTrainEmployee={handleTrainEmployee}
                                    handlePromoteEmployee={handlePromoteEmployee}
                                    handleFireEmployee={handleFireEmployee}
                                    handleIncrementSalary={handleIncrementSalary}
                                    setIsTeamOpen={setIsTeamOpen}
                                    setIsFinancialsOpen={setIsFinancialsOpen}
                                    setIsBurnBreakdownOpen={setIsBurnBreakdownOpen}
                                    setActionCategory={setActionCategory}
                                    competitors={competitors}
                                    expandedMetric={expandedMetric}
                                    setExpandedMetric={setExpandedMetric}
                                    handleImmediateAction={handleImmediateAction}
                                    handleToggleOngoingProgram={handleToggleOngoingProgram}
                                    ongoingPrograms={ongoingPrograms}
                                    actionUsageLog={actionUsageLog}
                                    focusHoursUsed={focusHoursUsed}
                                    setFocusHoursUsed={setFocusHoursUsed}
                                    setStartup={setStartup}
                                    addTimelineEvent={addTimelineEvent}
                                    setIsEndgameOpen={setIsEndgameOpen}
                                    month={month}
                                    salaryInput={salaryInput}
                                    setSalaryInput={setSalaryInput}
                                    setIsBoardModalOpen={setIsBoardModalOpen}
                                    setLastProposalResult={setLastProposalResult}
                                    setVotingMembers={setVotingMembers}
                                    handlePurchaseAsset={handlePurchaseAsset}
                                    handleToggleLifestyle={handleToggleLifestyle}
                                    setFounder={setFounder}
                                    marketStocks={marketStocks}
                                    setMarketStocks={setMarketStocks}
                                    handleActionClick={handleActionClick}
                                    handleAllocateESOP={handleAllocateESOP}
                                    currentTime={currentTime}
                                    cashGrants={cashGrants}
                                    setCashGrants={setCashGrants}
                                    energyRefills={energyRefills}
                                    setEnergyRefills={setEnergyRefills}
                                    setConfirmDialog={setConfirmDialog}
                                    isOnline={isOnline}
                                    isPremium={isPremium}
                                    handleRivalryAction={handleRivalryAction}
                                    onUnlockSkill={(nodeId) => {
                                        const node = SKILL_NODE_MAP[nodeId];
                                        const { canUnlock, reason } = canUnlockNode(nodeId, founder, startup, month);
                                        if (!canUnlock) { toast.error("Cannot unlock", { description: reason }); return; }
                                        setFounder(f => ({ ...f, unlocked_skill_nodes: [...(f.unlocked_skill_nodes || []), nodeId] }));
                                        addTimelineEvent(`📚 Skill Unlocked: ${node?.emoji} ${node?.label}`);
                                        toast.success(`${node?.emoji ?? ''} ${node?.label ?? ''} Unlocked!`, { description: node?.tagline });
                                    }}
                                    hrSearchRole={hrSearchRole}
                                    setHrSearchRole={setHrSearchRole}
                                    hrCandidates={hrCandidates}
                                    setHrCandidates={setHrCandidates}
                                    isProcessing={isProcessing}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
\n"""
    new_lines = new_lines[:start_idx] + [ui_block] + new_lines[end_idx:]
    with open("src/app/dashboard/page.tsx", "w") as f:
        f.writelines(new_lines)
    print(f"Successfully replaced {end_idx - start_idx} lines.")
else:
    print(f"Failed to find bounds. start_idx: {start_idx}, end_idx: {end_idx}")

