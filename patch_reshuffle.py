import os

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Update the Main Menu buttons section to reflect the 4 new categories
main_menu_old = """                    {/* BOTTOM RIGHT: Treasury/Corporate (Post-IPO) */}
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
                    )}"""

main_menu_new = """                    {/* BOTTOM RIGHT: Corporate */}
                    <button onClick={() => { setTerminalTab("corporate"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm border border-amber-100 dark:border-amber-800/50 hover:scale-105 transition-transform"><span className="drop-shadow-sm">🏛️</span></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Corporate</span>
                    </button>"""

content = content.replace(main_menu_old, main_menu_new)

# 2. Update the Submenu Top Bar Title logic
title_logic_old = """{terminalTab === "operations" ? "🏢 Operations" : terminalTab === "market" ? "📈 Market" : terminalTab === "personal" ? "💎 Wealth" : "🏦 Treasury"}"""
title_logic_new = """{terminalTab === "operations" ? "🏢 Operations" : terminalTab === "market" ? "📈 Strategy" : terminalTab === "personal" ? "💎 Wealth" : "🏛️ Corporate"}"""
content = content.replace(title_logic_old, title_logic_new)

# 3. Update the Next Month Button text from +{month+1} to just advance
btn_old = """<span className="text-3xl font-black mt-0.5">+{month + 1}</span>"""
btn_new = """<span className="text-xl font-black mt-0.5">Month {month + 1}</span>"""
content = content.replace(btn_old, btn_new)

btn_old2 = """onClick={() => { setTerminalTab("market"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm border border-rose-100 dark:border-rose-800/50 hover:scale-105 transition-transform"><span className="drop-shadow-sm">📈</span></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Market</span>"""

btn_new2 = """onClick={() => { setTerminalTab("market"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-sm border border-rose-100 dark:border-rose-800/50 hover:scale-105 transition-transform"><span className="drop-shadow-sm">📈</span></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Strategy</span>"""
content = content.replace(btn_old2, btn_new2)

# 4. Update the categories mapping
cats_old = """                                    if (terminalTab === "operations") {
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
content = content.replace(cats_old, cats_new)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)

