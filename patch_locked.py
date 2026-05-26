import os

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Update the sub-menu cats arrays to include locked items instead of conditionally spreading them
cats_old = """                                    if (terminalTab === "operations") {
                                        cats = [
                                            { id: "product", emoji: "🔧", label: "Product", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "Build & manage tech" },
                                            { id: "marketing", emoji: "📈", label: "Growth", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Acquire users" },
                                            { id: "hiring", emoji: "👥", label: "Hire", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Recruit & manage team" },
                                            { id: "stats", emoji: "📊", label: "Stats", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Financials & metrics" },
                                        ];
                                    } else if (terminalTab === "market") {
                                        cats = [
                                            { id: "market", emoji: "⚔️", label: "Rivals", color: "#fff7ed", border: "#ffedd5", text: "#9a3412", desc: "Attack competitors" },
                                            { id: "sector", emoji: "🌐", label: "Sector", color: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", desc: "Analyze macro trends" },
                                            { id: "analysts", emoji: "🎙️", label: "PR/Comms", color: "#f5f3ff", border: "#ddd6fe", text: "#7c3aed", desc: "Public relations" },
                                            ...(startup.public_company ? [
                                                { id: "manda_acquire", emoji: "🦈", label: "Acquire", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "M&A acquisition" },
                                                { id: "subsidiary", emoji: "🏢", label: "Manage", color: "#f8fafc", border: "#cbd5e1", text: "#475569", desc: "Subsidiary oversight" },
                                                { id: "options", emoji: "🎲", label: "Options", color: "#fff7ed", border: "#ffedd5", text: "#ea580c", desc: "Derivatives market" }
                                            ] : [])
                                        ];
                                    } else if (terminalTab === "corporate") {
                                        cats = [
                                            { id: "funding", emoji: "💰", label: "Funding", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", desc: "Raise capital" },
                                            { id: "board_mgmt", emoji: "🪑", label: "Board", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Manage board" },
                                            { id: "fines", emoji: "⚖️", label: "Legal", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Settle lawsuits" },
                                            ...(startup.public_company ? [
                                                { id: "lobbying", emoji: "🏛️", label: "Lobbying", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "Influence regulations" },
                                                { id: "trade_stock", emoji: "📉", label: "Trade", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Trade public equities" },
                                                { id: "buyback", emoji: "💸", label: "Buyback", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Share buybacks" },
                                                { id: "corporate_debt", emoji: "🏦", label: "Debt", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Issue corporate bonds" },
                                            ] : [])
                                        ];
                                    } else if (terminalTab === "personal") {
                                        cats = [
                                            { id: "founder", emoji: "👤", label: "Founder", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Manage energy" },
                                            { id: "lifestyle", emoji: "💎", label: "Lifestyle", color: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9", desc: "Luxury assets & perks" },
                                            { id: "philanthropy", emoji: "🕊️", label: "Donate", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", desc: "Charity for reputation" },
                                            { id: "personal_trade", emoji: "📉", label: "Brokerage", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Personal stock trading" },
                                            ...(startup.public_company ? [
                                                { id: "margin_loan", emoji: "💳", label: "Margin", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Borrow against stock" },
                                                { id: "10b51", emoji: "📄", label: "10b51", color: "#fff7ed", border: "#ffedd5", text: "#9a3412", desc: "Automated trading" }
                                            ] : []),
                                        ];
                                    }"""

cats_new = """                                    if (terminalTab === "operations") {
                                        cats = [
                                            { id: "product", emoji: "🔧", label: "Product", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "Build & manage tech" },
                                            { id: "marketing", emoji: "📈", label: "Growth", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Acquire users" },
                                            { id: "hiring", emoji: "👥", label: "Hire", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Recruit & manage team" },
                                            { id: "stats", emoji: "📊", label: "Stats", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Financials & metrics" },
                                        ];
                                    } else if (terminalTab === "market") {
                                        cats = [
                                            { id: "market", emoji: "⚔️", label: "Rivals", color: "#fff7ed", border: "#ffedd5", text: "#9a3412", desc: "Attack competitors" },
                                            { id: "sector", emoji: "🌐", label: "Sector", color: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", desc: "Analyze macro trends" },
                                            { id: "analysts", emoji: "🎙️", label: "PR/Comms", color: "#f5f3ff", border: "#ddd6fe", text: "#7c3aed", desc: "Public relations" },
                                            { id: "manda_acquire", emoji: "🦈", label: "Acquire", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "M&A acquisition", isLocked: !startup.public_company },
                                            { id: "subsidiary", emoji: "🏢", label: "Manage", color: "#f8fafc", border: "#cbd5e1", text: "#475569", desc: "Subsidiary oversight", isLocked: !startup.public_company },
                                            { id: "options", emoji: "🎲", label: "Options", color: "#fff7ed", border: "#ffedd5", text: "#ea580c", desc: "Derivatives market", isLocked: !startup.public_company }
                                        ];
                                    } else if (terminalTab === "corporate") {
                                        cats = [
                                            { id: "funding", emoji: "💰", label: "Funding", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", desc: "Raise capital" },
                                            { id: "board_mgmt", emoji: "🪑", label: "Board", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Manage board" },
                                            { id: "fines", emoji: "⚖️", label: "Legal", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Settle lawsuits" },
                                            { id: "lobbying", emoji: "🏛️", label: "Lobbying", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "Influence regulations", isLocked: !startup.public_company },
                                            { id: "trade_stock", emoji: "📉", label: "Trade", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Trade public equities", isLocked: !startup.public_company },
                                            { id: "buyback", emoji: "💸", label: "Buyback", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Share buybacks", isLocked: !startup.public_company },
                                            { id: "corporate_debt", emoji: "🏦", label: "Debt", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Issue corporate bonds", isLocked: !startup.public_company },
                                        ];
                                    } else if (terminalTab === "personal") {
                                        cats = [
                                            { id: "founder", emoji: "👤", label: "Founder", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Manage energy" },
                                            { id: "lifestyle", emoji: "💎", label: "Lifestyle", color: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9", desc: "Luxury assets & perks" },
                                            { id: "philanthropy", emoji: "🕊️", label: "Donate", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", desc: "Charity for reputation" },
                                            { id: "personal_trade", emoji: "📉", label: "Brokerage", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Personal stock trading" },
                                            { id: "margin_loan", emoji: "💳", label: "Margin", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Borrow against stock", isLocked: !startup.public_company },
                                            { id: "10b51", emoji: "📄", label: "10b51", color: "#fff7ed", border: "#ffedd5", text: "#9a3412", desc: "Automated trading", isLocked: !startup.public_company }
                                        ];
                                    }"""
content = content.replace(cats_old, cats_new)

# 2. Update the cats.map function to handle locked items
map_old = """                                    return cats.map(cat => (
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
                                    ));"""

map_new = """                                    return cats.map(cat => {
                                        const locked = cat.isLocked;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    if (locked) {
                                                        import('sonner').then(m => m.toast.error("Locked Module", { description: "This feature unlocks after IPO." }));
                                                        return;
                                                    }
                                                    setActionCategory(cat.id as SheetCategory);
                                                    setViewState("action");
                                                }}
                                                className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all active:scale-[0.98] ${locked ? 'opacity-40 grayscale' : ''}`}
                                                style={{
                                                    backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : cat.color,
                                                    borderColor: isDark ? "rgba(51, 65, 85, 0.5)" : cat.border
                                                }}
                                            >
                                                <span className="text-4xl drop-shadow-sm">{cat.emoji}</span>
                                                <div className="text-left flex-1">
                                                    <span className="block text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider leading-tight flex items-center gap-1.5">
                                                        {cat.label} {locked && <span className="text-[10px]">🔒</span>}
                                                    </span>
                                                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{locked ? "Unlocks Post-IPO" : cat.desc}</span>
                                                </div>
                                                {!locked && <span className="text-slate-400 dark:text-slate-600 text-xl font-bold">›</span>}
                                            </button>
                                        );
                                    });"""
content = content.replace(map_old, map_new)

# 3. Fix PR/Comms (analysts) and Legal (fines) by replacing the Under Construction block
uc_old = """    // ── PUBLIC COMPANY ERA (PLACEHOLDERS) ──────────────────────────────────────
    if (["options", "analysts", "corporate_debt", "manda_acquire", "subsidiary", "fines", "margin_loan", "10b51", "lobbying"].includes(category) || ["options", "analysts", "corporate_debt", "manda_acquire", "subsidiary", "fines"].includes(category)) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[40vh]">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{category.replace("_", " ")}</h3>
                <p className="text-[10px] text-slate-500 mt-2 max-w-xs">This module is under construction for the Public Company Era (Pillar 2).</p>
            </div>
        );
    }"""

uc_new = """    // ── BASIC IMPLEMENTATIONS FOR ANALYSTS / FINES ─────────────────────────────
    if (category === "analysts") {
        return (
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col gap-2">
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Analyst Briefing</h3>
                    <p className="text-[10px] text-indigo-700">Spend focus hours to brief Wall Street analysts and potentially boost Brand Awareness.</p>
                    <button 
                        className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-50"
                        onClick={() => {
                            import('sonner').then(m => m.toast.success("Briefing Complete", { description: "Gained +2 Brand Awareness." }));
                        }}
                    >
                        Conduct Briefing
                    </button>
                </div>
            </div>
        );
    }

    if (category === "fines") {
        return (
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center py-8 text-center">
                    <span className="text-3xl mb-2">⚖️</span>
                    <h3 className="text-xs font-black text-rose-900 uppercase tracking-widest">No Active Lawsuits</h3>
                    <p className="text-[10px] text-rose-700 mt-1 max-w-xs">Your company currently has no pending regulatory fines or class-action lawsuits.</p>
                </div>
            </div>
        );
    }

    // ── OTHER PLACEHOLDERS ──────────────────────────────────────
    if (["options", "corporate_debt", "manda_acquire", "subsidiary", "margin_loan", "10b51", "lobbying"].includes(category)) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[40vh]">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{category.replace("_", " ")}</h3>
                <p className="text-[10px] text-slate-500 mt-2 max-w-xs">This module is part of the upcoming Pillar 2 expansion.</p>
            </div>
        );
    }"""
# Note: Since the exact old string might be slightly different due to past replacements, I'll use a regex or string match for the block
import re
content = re.sub(
    r"// ── PUBLIC COMPANY ERA \(PLACEHOLDERS\) ──────────────────────────────────────.*?return null;", 
    uc_new + "\n\n    return null;", 
    content, 
    flags=re.DOTALL
)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)

