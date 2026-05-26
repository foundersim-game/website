import os
import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Rename Brokerage to Stock Market
content = content.replace(
    '{ id: "personal_trade", emoji: "📉", label: "Brokerage", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Personal stock trading" }',
    '{ id: "personal_trade", emoji: "📉", label: "Stock Market", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Personal stock trading" }'
)

# 2. Add useEffect to initialize market stocks if empty
hook_old = "    const [marketStocks, setMarketStocks] = useState<MarketStock[]>([]);"
hook_new = """    const [marketStocks, setMarketStocks] = useState<MarketStock[]>([]);
    
    useEffect(() => {
        if (marketStocks.length === 0) {
            import('@/lib/engine/publicMarket').then(m => {
                setMarketStocks(m.initializeMarketStocks("CORP", 100));
            });
        }
    }, [marketStocks.length]);"""
content = content.replace(hook_old, hook_new)

# 3. Update Philanthropy list
phil_old = """                    <div className="space-y-3">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">Local Charity Grant</p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">Donate $50,000. (+1 Rep, +50 Score)</p>
                                </div>
                                <button
                                    onClick={() => handleDonate(50000, 1, 50, "local charities")}
                                    disabled={liquidCash < 50000}
                                    className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded text-[10px] font-black uppercase hover:bg-purple-200 disabled:opacity-50"
                                >
                                    Donate
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">Endow Scholarship</p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">Donate $500,000. (+5 Rep, +500 Score)</p>
                                </div>
                                <button
                                    onClick={() => handleDonate(500000, 5, 500, "university scholarship")}
                                    disabled={liquidCash < 500000}
                                    className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded text-[10px] font-black uppercase hover:bg-purple-200 disabled:opacity-50"
                                >
                                    Endow
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">Found a Hospital Wing</p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">Donate $5,000,000. (+20 Rep, +5000 Score)</p>
                                </div>
                                <button
                                    onClick={() => handleDonate(5000000, 20, 5000, "hospital wing")}
                                    disabled={liquidCash < 5000000}
                                    className="px-3 py-1.5 bg-purple-600 text-white rounded text-[10px] font-black uppercase hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Found
                                </button>
                            </div>
                        </div>
                    </div>"""

phil_new = """                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {[
                            { label: "Community Food Drive", desc: "Donate $5,000 to local shelters. (+0 Rep, +500 Score)", btn: "Fund", cost: 5000, rep: 0, score: 500, name: "food drive" },
                            { label: "Open Source Foundation", desc: "Donate $100,000 to open source. (+2 Rep, +1000 Score)", btn: "Sponsor", cost: 100000, rep: 2, score: 1000, name: "open source" },
                            { label: "Local Charity Grant", desc: "Donate $500,000. (+1 Rep, +50 Score)", btn: "Donate", cost: 500000, rep: 1, score: 50, name: "local charity" },
                            { label: "Global Climate Fund", desc: "Donate $1,000,000 to environment. (+5 Rep, +2000 Score)", btn: "Pledge", cost: 1000000, rep: 5, score: 2000, name: "climate fund" },
                            { label: "Endow Scholarship", desc: "Donate $5,000,000. (+5 Rep, +500 Score)", btn: "Endow", cost: 5000000, rep: 5, score: 500, name: "scholarship" },
                            { label: "Found a Hospital Wing", desc: "Donate $50,000,000. (+20 Rep, +5000 Score)", btn: "Found", cost: 50000000, rep: 20, score: 5000, name: "hospital wing" },
                            { label: "Space Exploration Grant", desc: "Donate $500,000,000 for humanity. (+100 Rep, +50000 Score)", btn: "Launch", cost: 500000000, rep: 100, score: 50000, name: "space program" },
                        ].map((opt, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{opt.label}</p>
                                        <p className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDonate(opt.cost, opt.rep, opt.score, opt.name)}
                                        disabled={liquidCash < opt.cost}
                                        className="shrink-0 ml-2 px-3 py-1.5 bg-purple-600 text-white rounded text-[10px] font-black uppercase hover:bg-purple-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                    >
                                        {opt.btn}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>"""
content = content.replace(phil_old, phil_new)

# 4. Separator border color
border_old1 = '<div className="flex items-center gap-2 py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0 grow">'
border_new1 = '<div className="flex items-center gap-2 py-1.5 border-b border-slate-200 dark:border-slate-800 last:border-0 grow">'
content = content.replace(border_old1, border_new1)

border_old2 = '<div className="mt-2 pt-2 border-t border-slate-50 space-y-0.5">'
border_new2 = '<div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-0.5">'
content = content.replace(border_old2, border_new2)

# 5. Programs text color
prog_text_old = '<p className="text-sm font-bold text-slate-700">{prog.label}</p>'
prog_text_new = '<p className="text-sm font-bold text-slate-700 dark:text-slate-200">{prog.label}</p>'
content = content.replace(prog_text_old, prog_text_new)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)

# Now fix skillWeb.ts
with open("src/lib/engine/skillWeb.ts", "r") as f:
    skill_content = f.read()

skill_old = """export const SKILL_BRANCHES: Record<SkillBranch, { emoji: string; color: string; bgColor: string; borderColor: string }> = {
    Technical:    { emoji: "⚙️",  color: "text-blue-700",   bgColor: "bg-blue-50",    borderColor: "border-blue-200" },
    Marketing:    { emoji: "📈",  color: "text-pink-700",   bgColor: "bg-pink-50",    borderColor: "border-pink-200" },
    Leadership:   { emoji: "👔",  color: "text-violet-700", bgColor: "bg-violet-50",  borderColor: "border-violet-200" },
    Fundraising:  { emoji: "💰",  color: "text-emerald-700",bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
};"""

skill_new = """export const SKILL_BRANCHES: Record<SkillBranch, { emoji: string; color: string; bgColor: string; borderColor: string }> = {
    Technical:    { emoji: "⚙️",  color: "text-blue-700 dark:text-blue-400",   bgColor: "bg-blue-50 dark:bg-blue-900/30",    borderColor: "border-blue-200 dark:border-blue-800/50" },
    Marketing:    { emoji: "📈",  color: "text-pink-700 dark:text-pink-400",   bgColor: "bg-pink-50 dark:bg-pink-900/30",    borderColor: "border-pink-200 dark:border-pink-800/50" },
    Leadership:   { emoji: "👔",  color: "text-violet-700 dark:text-violet-400", bgColor: "bg-violet-50 dark:bg-violet-900/30",  borderColor: "border-violet-200 dark:border-violet-800/50" },
    Fundraising:  { emoji: "💰",  color: "text-emerald-700 dark:text-emerald-400",bgColor: "bg-emerald-50 dark:bg-emerald-900/30", borderColor: "border-emerald-200 dark:border-emerald-800/50" },
};"""

skill_content = skill_content.replace(skill_old, skill_new)
with open("src/lib/engine/skillWeb.ts", "w") as f:
    f.write(skill_content)

