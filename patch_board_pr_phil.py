import re

with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# 1. Philanthropy tweaks
phil_old = """                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
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
                                    </div>"""

phil_new = """                    <div className="space-y-3">
                        {[
                            { emoji: "🥫", label: "Community Food Drive", desc: "Donate $5,000 to local shelters. (+0 Rep, +500 Score)", btn: "Fund", cost: 5000, rep: 0, score: 500, name: "food drive" },
                            { emoji: "💻", label: "Open Source Foundation", desc: "Donate $100,000 to open source. (+2 Rep, +1000 Score)", btn: "Sponsor", cost: 100000, rep: 2, score: 1000, name: "open source" },
                            { emoji: "🏘️", label: "Local Charity Grant", desc: "Donate $500,000. (+1 Rep, +50 Score)", btn: "Donate", cost: 500000, rep: 1, score: 50, name: "local charity" },
                            { emoji: "🌍", label: "Global Climate Fund", desc: "Donate $1,000,000 to environment. (+5 Rep, +2000 Score)", btn: "Pledge", cost: 1000000, rep: 5, score: 2000, name: "climate fund" },
                            { emoji: "🎓", label: "Endow Scholarship", desc: "Donate $5,000,000. (+5 Rep, +500 Score)", btn: "Endow", cost: 5000000, rep: 5, score: 500, name: "scholarship" },
                            { emoji: "🏥", label: "Found a Hospital Wing", desc: "Donate $50,000,000. (+20 Rep, +5000 Score)", btn: "Found", cost: 50000000, rep: 20, score: 5000, name: "hospital wing" },
                            { emoji: "🚀", label: "Space Exploration Grant", desc: "Donate $500,000,000 for humanity. (+100 Rep, +50000 Score)", btn: "Launch", cost: 500000000, rep: 100, score: 50000, name: "space program" },
                        ].map((opt, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{opt.emoji}</div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{opt.label}</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </div>"""

content = content.replace(phil_old, phil_new)


# 2. PR/Comms (combine with sector)
# First let's remove sector from the Market terminal tab menu
sector_tab = '{ id: "sector", emoji: "🌐", label: "Sector", color: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", desc: "Analyze macro trends" },'
content = content.replace(sector_tab, '')

# Now let's replace `if (category === "sector") {` up to `if (category === "analysts") {`
# Wait, let's just find `if (category === "sector") {` block.
sector_start = content.find('    if (category === "sector") {')
phil_start = content.find('    if (category === "philanthropy") {', sector_start)

# We will just delete the sector block entirely
content = content[:sector_start] + content[phil_start:]

# Now replace the `analysts` block
analysts_old = """    // ── BASIC IMPLEMENTATIONS FOR ANALYSTS / FINES ─────────────────────────────
    if (category === "analysts") {
        return (
            <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Analyst Briefing</h3>
                    <p className="text-[10px] text-slate-500 mb-4">Spend focus hours to brief Wall Street analysts and potentially boost Brand Awareness.</p>
                    <button
                        onClick={() => {
                            if ((m.founder_burnout || 0) > 85) {
                                toast.error("Too Burned Out", { description: "You don't have the energy right now." });
                                return;
                            }
                            const newStartup = { ...startup };
                            newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + 5);
                            newStartup.metrics.founder_burnout = (newStartup.metrics.founder_burnout || 0) + 10;
                            if (setStartup) setStartup(newStartup);
                            addTimelineEvent(`🎙️ Conducted Analyst Briefing. (+5 Brand Awareness).`);
                            toast.success("Briefing Complete");
                        }}
                        className="w-full py-2 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase transition-all hover:bg-indigo-700"
                    >
                        Conduct Briefing
                    </button>
                </div>
            </div>
        );
    }"""

analysts_new = """    // ── PR & COMMUNICATIONS ─────────────────────────────
    if (category === "analysts" || category === "pr_comms") {
        const handleAction = (costHours: number, baGain: number, name: string) => {
            if ((m.founder_burnout || 0) > 85) {
                toast.error("Too Burned Out", { description: "You don't have the energy right now." });
                return;
            }
            if (focusHoursUsed + costHours > maxHours) {
                toast.error("Insufficient Focus", { description: `You don't have ${costHours} focus hours available.` });
                return;
            }
            const newStartup = { ...startup };
            newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + baGain);
            setFocusHoursUsed(focusHoursUsed + costHours);
            
            if (setStartup) setStartup(newStartup);
            addTimelineEvent(`🎙️ ${name} (+${baGain} Brand Awareness).`);
            toast.success("Campaign Successful");
        };

        return (
            <div className="flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">PR & Communications</h3>
                            <p className="text-[10px] text-slate-500">Spend focus hours to boost Brand Awareness.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Awareness</p>
                            <p className="text-sm font-bold text-indigo-600">{Math.round(m.brand_awareness || 0)}/100</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-3">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">Current Market Season</p>
                                <p className="text-[10px] font-bold text-indigo-500">{m.current_season || "Neutral Market"}</p>
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1">Sector conditions dynamically affect investor sentiment and marketing yield.</p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { emoji: "📰", label: "Press Release", desc: "Write and distribute a press release.", btn: "Publish", cost: 5, gain: 1 },
                            { emoji: "📊", label: "Deep Sector Research", desc: "Analyze macro trends and publish a whitepaper.", btn: "Research", cost: 10, gain: 2 },
                            { emoji: "🎙️", label: "Podcast Interview", desc: "Go on a popular industry podcast.", btn: "Speak", cost: 15, gain: 4 },
                            { emoji: "📈", label: "Analyst Briefing", desc: "Brief Wall Street analysts on your trajectory.", btn: "Brief", cost: 20, gain: 5 },
                            { emoji: "🎪", label: "Industry Conference", desc: "Headline a major tech conference.", btn: "Headline", cost: 30, gain: 10 },
                        ].map((opt, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{opt.emoji}</div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{opt.label}</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5">Costs {opt.cost} Focus. Gives +{opt.gain} Brand Awareness.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAction(opt.cost, opt.gain, opt.label)}
                                        disabled={(m.founder_burnout || 0) > 85 || (focusHoursUsed + opt.cost > maxHours)}
                                        className="shrink-0 ml-2 px-3 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-black uppercase hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                    >
                                        {opt.btn}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }"""
content = content.replace(analysts_old, analysts_new)


# 3. Board Management Additions
board_old = """    if (category === "board_mgmt") {
        const pub = startup.public_company;
        const handleStockSplit = () => {
            if (!pub || pub.share_price < 50) return;

            const newStartup = { ...startup };
            newStartup.public_company = {
                ...pub,
                shares_outstanding: pub.shares_outstanding * 2,
                share_price: pub.share_price / 2,
            };

            const newFounder = { ...founder };
            if (newFounder.wealth_profile) {
                newFounder.wealth_profile.portfolio = newFounder.wealth_profile.portfolio.map(p => ({
                    ...p,
                    shares: p.symbol === (startup.symbol || "CORP") ? p.shares * 2 : p.shares,
                    averageCost: p.symbol === (startup.symbol || "CORP") ? p.averageCost / 2 : p.averageCost
                }));
                newFounder.wealth_profile.active_10b51_plans = newFounder.wealth_profile.active_10b51_plans.map(p => ({
                    ...p,
                    monthlySellAmount: p.monthlySellAmount * 2,
                    targetPriceMinimum: p.targetPriceMinimum / 2
                }));
            }
            if (setFounder) setFounder(newFounder);

            // Sync Ticker
            if (setMarketStocks && marketStocks) {
                setMarketStocks(marketStocks.map(s =>
                    s.symbol === (startup.symbol || "CORP")
                        ? { ...s, currentPrice: newStartup.public_company.share_price }
                        : s
                ));
            }

            addTimelineEvent(`✂️ Board authorized a 2-for-1 Stock Split! Share price halved to ${formatMoney(newStartup.public_company.share_price)}.`);
            toast.success("Stock Split Executed", { description: "Retail investors are piling in!" });
        };

        return (
            <div className="flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Board of Directors</h3>
                    <p className="text-[10px] text-slate-500 mb-4">Execute high-level corporate governance actions.</p>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">2-for-1 Stock Split</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">Halves share price, doubles share count. Psychological boost for retail investors.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleStockSplit}
                            disabled={(pub?.share_price || 0) < 50}
                            className="w-full mt-2 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-md text-[10px] font-black uppercase hover:opacity-90 disabled:opacity-30 transition-all"
                        >
                            {(pub?.share_price || 0) >= 50 ? "Execute Split" : "Requires $50+ Share Price"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }"""

board_new = """    if (category === "board_mgmt") {
        const pub = startup.public_company;
        const handleStockSplit = () => {
            if (!pub || pub.share_price < 50) return;

            const newStartup = { ...startup };
            newStartup.public_company = {
                ...pub,
                shares_outstanding: pub.shares_outstanding * 2,
                share_price: pub.share_price / 2,
            };

            const newFounder = { ...founder };
            if (newFounder.wealth_profile) {
                newFounder.wealth_profile.portfolio = newFounder.wealth_profile.portfolio.map(p => ({
                    ...p,
                    shares: p.symbol === (startup.symbol || "CORP") ? p.shares * 2 : p.shares,
                    averageCost: p.symbol === (startup.symbol || "CORP") ? p.averageCost / 2 : p.averageCost
                }));
                newFounder.wealth_profile.active_10b51_plans = newFounder.wealth_profile.active_10b51_plans.map(p => ({
                    ...p,
                    monthlySellAmount: p.monthlySellAmount * 2,
                    targetPriceMinimum: p.targetPriceMinimum / 2
                }));
            }
            if (setFounder) setFounder(newFounder);

            if (setMarketStocks && marketStocks) {
                setMarketStocks(marketStocks.map(s =>
                    s.symbol === (startup.symbol || "CORP")
                        ? { ...s, currentPrice: newStartup.public_company.share_price }
                        : s
                ));
            }
            addTimelineEvent(`✂️ Board authorized a 2-for-1 Stock Split! Share price halved to ${formatMoney(newStartup.public_company.share_price)}.`);
            toast.success("Stock Split Executed");
        };

        const handleBoardAction = (cost: number, name: string) => {
            if (m.cash < cost) {
                toast.error("Insufficient Corporate Cash");
                return;
            }
            const newStartup = { ...startup };
            newStartup.metrics.cash -= cost;
            
            if (name === "Appoint Independent Director") {
                newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + 5);
                const newFounder = { ...founder };
                newFounder.attributes.reputation = Math.min(100, (newFounder.attributes.reputation || 0) + 5);
                if (setFounder) setFounder(newFounder);
            } else if (name === "Executive Retreat") {
                const newFounder = { ...founder };
                newFounder.attributes.burnout = 0;
                if (setFounder) setFounder(newFounder);
            } else if (name === "Rebrand Company") {
                newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + 20);
            }
            
            if (setStartup) setStartup(newStartup);
            addTimelineEvent(`🪑 Board approved: ${name} (Cost: ${formatMoney(cost)})`);
            toast.success("Resolution Passed");
        };

        return (
            <div className="flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Board of Directors</h3>
                    <p className="text-[10px] text-slate-500 mb-4">Execute high-level corporate governance actions.</p>

                    <div className="space-y-3">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">✂️</div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">2-for-1 Stock Split</p>
                                        <p className="text-[9px] text-slate-500 mt-0.5">Halves share price, doubles share count. Boosts retail sentiment.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleStockSplit}
                                    disabled={!pub || pub.share_price < 50}
                                    className="shrink-0 ml-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded text-[10px] font-black uppercase hover:opacity-90 disabled:opacity-30 transition-all"
                                >
                                    {(!pub || pub.share_price < 50) ? "Req $50+" : "Execute"}
                                </button>
                            </div>
                        </div>

                        {[
                            { emoji: "🧑‍⚖️", label: "Appoint Independent Director", desc: "Brings oversight. (+5 CEO Rep, +5 Brand)", btn: "Appoint", cost: 500000 },
                            { emoji: "🏝️", label: "Executive Retreat", desc: "Fully cures Founder Burnout. (0 Burnout)", btn: "Retreat", cost: 250000 },
                            { emoji: "🎨", label: "Rebrand Company", desc: "Major marketing overhaul. (+20 Brand Awareness)", btn: "Rebrand", cost: 1000000 },
                            { emoji: "🛡️", label: "Adopt Poison Pill", desc: "Defends against hostile takeovers.", btn: "Adopt", cost: 100000, locked: !pub },
                        ].map((opt, i) => (
                            <div key={i} className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 ${opt.locked ? 'opacity-50 grayscale' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{opt.emoji}</div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{opt.label}</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5">Costs {formatMoney(opt.cost)}. {opt.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleBoardAction(opt.cost, opt.label)}
                                        disabled={m.cash < opt.cost || opt.locked}
                                        className="shrink-0 ml-2 px-3 py-1.5 bg-amber-600 text-white rounded text-[10px] font-black uppercase hover:bg-amber-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                    >
                                        {opt.locked ? "Post-IPO" : opt.btn}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }"""
content = content.replace(board_old, board_new)

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)

