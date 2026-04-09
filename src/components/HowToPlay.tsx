
import React, { useState } from 'react';
import { Zap, TrendingUp, DollarSign, Users, Shield, Award, BarChart3, Heart, AlertCircle, Sparkles, Globe } from "lucide-react";

export function HowToPlayContent() {
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics',      label: 'Basics',      icon: BarChart3 },
    { id: 'product',     label: 'Product',     icon: Zap },
    { id: 'growth',      label: 'Growth',      icon: TrendingUp },
    { id: 'revenue',     label: 'Revenue',     icon: Globe },
    { id: 'funding',     label: 'Funding',     icon: DollarSign },
    { id: 'team',        label: 'Team',        icon: Users },
    { id: 'competitors', label: 'Rivals',      icon: Shield },
    { id: 'ending',      label: 'Winning',     icon: Award },
  ];

  const renderContent = () => {
    switch (activeTab) {

      // ─── BASICS ───────────────────────────────────────────────────────────────
      case 'basics':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">The Founder's Journey</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                You are the CEO of a brand-new startup. Each month you make one key decision — then the simulation runs. Your goal is to grow from an idea into a venture-backed company and eventually exit via Acquisition or IPO.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black mb-2 shadow-sm shadow-indigo-600/30">1</div>
                <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 mb-1 uppercase tracking-wider">Burn Rate & Runway</p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                  <strong className="font-bold text-indigo-900 dark:text-indigo-200">Burn Rate</strong> is your monthly cash outflow (salaries, ads, rent). <strong className="font-bold text-indigo-900 dark:text-indigo-200">Runway</strong> is months until you're out of cash. Hit zero and you go <strong className="font-bold text-indigo-900 dark:text-indigo-200">Bankrupt</strong>.
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black mb-2 shadow-sm shadow-emerald-600/30">2</div>
                <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-1 uppercase tracking-wider">Focus Energy (Hours)</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Every action and program costs <strong className="font-bold text-emerald-900 dark:text-emerald-200">Focus Hours</strong>. Exceeding your 100h cap accelerates <strong className="font-bold text-emerald-900 dark:text-emerald-200">Burnout</strong>, which tanks productivity and team morale. Hire to delegate.</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><BarChart3 className="size-3" /> Monthly Loop</p>
              <ul className="text-slate-600 dark:text-slate-400 text-xs font-medium space-y-2 leading-relaxed">
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Choose your action</strong> from the dashboard (Build, Market, Pitch, etc.)</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Advance the month</strong> — the engine processes growth, churn, revenue, and events.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Rivals move too</strong> — they raise money, build features, and may attack you.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Valuation grows</strong> dynamically based on user count, revenue, PMF, and team quality.</li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                <strong className="font-bold">Valuation is dynamic.</strong> It grows when your PMF, revenue, and team are strong — and shrinks when you have high debt, low morale, or low PMF. Bad products will not sustain a high valuation.
              </p>
            </div>
          </div>
        );

      // ─── PRODUCT ──────────────────────────────────────────────────────────────
      case 'product':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">Building The Product</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                Product quality directly affects almost every simulation outcome. A low-quality product bleeds users, stalls virality, and crashes your valuation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black shadow-lg shadow-violet-600/20 shrink-0">✨</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">Product Quality</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Raised by building features and refactoring code. Quality above 60 unlocks full viral growth potential. Below 30, users churn heavily and growth is throttled to 20% of normal.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-600/20 shrink-0">🔁</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">PMF Score (Product-Market Fit)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">PMF reflects how well users love your product. It grows automatically as quality improves and users engage. Low PMF ({'<'}45) adds +10% monthly churn on top of your base rate. It is the biggest lever for transaction volume in FinTech and retention in all industries.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-lg shadow-amber-600/20 shrink-0">⚠️</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">Technical Debt</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Building features too fast accumulates Tech Debt. High debt drops reliability, triggers server crisis events, and limits how high your Product Quality can actually reach. Run "Refactor Code" or hire Engineers to clear it passively.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-slate-600 text-white flex items-center justify-center font-black shadow-lg shrink-0">📉</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">Reliability</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Reliability below 60% adds a direct churn penalty every month. For OTT/Streaming, even a brief outage means users cancel. Keep debt low to keep reliability high.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="size-6 text-amber-600 dark:text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase mb-1">Key Insight: Bad Products Can't Go Viral</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">The viral multiplier only kicks in when Quality {'>'} 50 AND PMF {'>'} 30. A buggy product spread through word-of-mouth only accelerates churn. Fix the product first, then market it.</p>
              </div>
            </div>
          </div>
        );

      // ─── GROWTH ───────────────────────────────────────────────────────────────
      case 'growth':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">PLG vs SLG Growth Modes</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                When you create your startup, you choose a Go-To-Market motion. This fundamentally changes how users, leads, and revenue are calculated.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 p-4 rounded-2xl">
                <p className="text-sm font-black text-indigo-900 dark:text-indigo-300 mb-2">📲 PLG — Product-Led Growth</p>
                <ul className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium space-y-1.5 leading-relaxed">
                  <li>• Growth metric = <strong className="font-bold">Free Users</strong></li>
                  <li>• Revenue comes from converting free → paid via PMF & pricing</li>
                  <li>• Viral growth multiplies when Quality {'>'} 50 and PMF {'>'} 30</li>
                  <li>• Marketing team boosts organic intake</li>
                  <li>• Churn is your enemy — bad product empties the bucket</li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl">
                <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-2">🤝 SLG — Sales-Led Growth</p>
                <ul className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium space-y-1.5 leading-relaxed">
                  <li>• Growth metric = <strong className="font-bold">B2B Leads → Active Deals → Closed Won</strong></li>
                  <li>• Revenue = Contracts × Price (no free tier)</li>
                  <li>• Sales team skill directly drives win rate</li>
                  <li>• Hire a CFO to activate the Fundraising Roadshow</li>
                  <li>• Slow but sticky: enterprise clients rarely churn</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Churn — What Kills Growth</p>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="flex justify-between"><span>Product Quality below expected</span><span className="font-black text-rose-600">+up to 5% extra churn</span></div>
                <div className="flex justify-between"><span>PMF Score below 45</span><span className="font-black text-rose-600">+up to 10% extra churn</span></div>
                <div className="flex justify-between"><span>Reliability below 60%</span><span className="font-black text-rose-600">+up to 5% extra churn</span></div>
                <div className="flex justify-between"><span>Team Morale below 40</span><span className="font-black text-rose-600">+up to 2% extra churn</span></div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2"><span className="font-black text-slate-700 dark:text-slate-300">Maximum monthly churn cap</span><span className="font-black text-slate-700 dark:text-slate-300">40%</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Growth Engines</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Brand Awareness</span>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-black">Boosts Free User Intake</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Network Effects (Marketplace PLG)</span>
                  <span className="text-[10px] bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-black">Volume grows with user base</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">B2B Pipeline (SLG Only)</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-black">Requires Sales Team to Convert</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">CAC (Cost to Acquire a User)</span>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-black">Marketing Spend ÷ New Users</span>
                </div>
              </div>
            </div>
          </div>
        );

      // ─── REVENUE ──────────────────────────────────────────────────────────────
      case 'revenue':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">Revenue Engines By Industry</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                Each industry has a unique revenue formula. The same action (like improving product quality) hits your MRR differently depending on what you're building.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  emoji: "💳", name: "FinTech (PLG — NeoBank)",
                  formula: "Users × Avg Transaction Volume × Take Rate",
                  drivers: "PMF (trust) raises volume. Quality (stability) raises volume. Bad product = users keep less money with you.",
                  color: "blue"
                },
                {
                  emoji: "🏦", name: "FinTech (SLG — B2B API)",
                  formula: "Enterprise Clients × Bulk Volume × Take Rate",
                  drivers: "Sales Team converts leads. Once landed, enterprise contracts process massive bulk volumes automatically.",
                  color: "blue"
                },
                {
                  emoji: "🏪", name: "Marketplace (PLG — C2C)",
                  formula: "Users × GMV per User × Take Rate",
                  drivers: "Network Effects bonus: the bigger your marketplace, the more each user transacts (log scale). PMF raises base GMV.",
                  color: "amber"
                },
                {
                  emoji: "📦", name: "Marketplace (SLG — Managed B2B)",
                  formula: "Vetted Suppliers × High-Ticket GMV × Commission",
                  drivers: "Quality vetting = higher listing value. Heavy COGS (30%) — this is ops-intensive. Sales drives supplier onboarding.",
                  color: "amber"
                },
                {
                  emoji: "🤖", name: "AI Platform (PLG — Dev API)",
                  formula: "Paying Devs × Token Bundles Used × Price",
                  drivers: "PMF converts free devs to paid. Token usage volume scales with Team innovation score and Product Quality.",
                  color: "violet"
                },
                {
                  emoji: "🏢", name: "AI Platform (SLG — Enterprise)",
                  formula: "Closed Deals × Enterprise Price × 10×",
                  drivers: "Very low base conversion (15%). Sales team multiplies it. Each closed deal is worth 10× your listed price.",
                  color: "violet"
                },
                {
                  emoji: "🎮", name: "Mobile Game (PLG — F2P)",
                  formula: "Ad Revenue + (IAP Paying Users × Price)",
                  drivers: "High Ad Intensity kills IAP conversion. Quality raises IAP conversion directly. Low quality = low paying whale ratio.",
                  color: "rose"
                },
                {
                  emoji: "🎓", name: "Mobile Game (SLG — Institutional)",
                  formula: "Licensed Seats × Price Per Seat",
                  drivers: "No free users. Entire revenue from organisational contracts. Sales Team is the sole growth engine.",
                  color: "rose"
                },
                {
                  emoji: "🎬", name: "OTT / Streaming (PLG)",
                  formula: "Subscribed Users × Monthly Price",
                  drivers: "Conversion gated by Quality (content/UX). Low reliability (buffering) directly triggers immediate churn.",
                  color: "pink"
                },
                {
                  emoji: "☁️", name: "SaaS / DevTools (PLG)",
                  formula: "Paid Users × Monthly Price",
                  drivers: "Conversion balances PMF vs Pricing tension. Early adopters convert 2.5× easier. Over-pricing kills conversion fast.",
                  color: "indigo"
                },
                {
                  emoji: "🏗️", name: "SaaS / DevTools (SLG)",
                  formula: "Enterprise Contracts × Annual Contract Value",
                  drivers: "5% base conversion from Sales pipeline. Sales Skill multiplies this. Revenue modelled as Annual ACV upfront.",
                  color: "indigo"
                },
              ].map(item => (
                <div key={item.name} className={`bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3 rounded-xl`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{item.name}</p>
                  </div>
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-1 font-mono">{item.formula}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.drivers}</p>
                </div>
              ))}
            </div>
          </div>
        );

      // ─── FUNDING ──────────────────────────────────────────────────────────────
      case 'funding':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">Equity & Valuations</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                Raising money extends your runway but dilutes your ownership. Balance how much equity you give away — it directly affects your final exit payout.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex gap-3">
                <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-600/20 shrink-0">💵</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">How Pitching Works</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Use "Pitch Investors" to build your pipeline, then negotiate term sheets. Investors give you cash in exchange for <strong className="font-bold text-slate-700 dark:text-slate-300">equity (a % of your company)</strong>. Once diluted, you can't get equity back.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Funding Stages</p>
              <ul className="text-slate-600 dark:text-slate-400 text-xs font-medium space-y-2 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Bootstrapping:</strong> Only your savings. Tight runway but you own 100%.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Angel Round:</strong> Small checks from individuals. 5-15% dilution typical.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Seed Round:</strong> Institutional money. Requires basic traction proof.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Series A:</strong> Large round. Needs strong MRR, PMF ≥ 60, and a credible team.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Investor Relations Programs</p>
              <ul className="text-slate-600 dark:text-slate-400 text-xs font-medium space-y-2 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Monthly Investor Updates:</strong> Costs nothing. Adds +1 Reputation/mo.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Angel Syndicate Membership:</strong> $200/mo, builds networking contacts.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Fundraising Consultant:</strong> Generates investor leads every month — expensive but powerful when you have no CFO.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">CFO Roadshow:</strong> Replaces the Consultant once you hire a CFO. Zero extra cost, higher lead volume.</li>
              </ul>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl">
              <p className="text-xs font-black uppercase text-indigo-400 mb-1">Valuation Formula</p>
              <p className="text-[11px] font-medium leading-relaxed text-slate-300">Your valuation grows dynamically with <strong className="font-bold text-white">Revenue × ARR Multiple × PMF Factor × Team Score</strong>. A company with high revenue but low PMF will be worth less than a high-PMF competitor at the same revenue level.</p>
            </div>
          </div>
        );

      // ─── TEAM ─────────────────────────────────────────────────────────────────
      case 'team':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">Hiring & Morale</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                Every employee has a role, a salary, and a skill level that directly impacts the simulation — not just as a headcount number.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { emoji: "👨‍💻", role: "Engineers", color: "blue", effect: "Clear tech debt passively. The higher the skill, the more debt removed monthly." },
                { emoji: "📣", role: "Marketers", color: "pink", effect: "Increase brand awareness and organic user growth. Reduce CAC over time." },
                { emoji: "🤝", role: "Sales", color: "emerald", effect: "In SLG mode, their combined skill score drives pipeline win-rate directly. In PLG, they boost conversion by up to +50% per 100 skill points." },
                { emoji: "🎨", role: "Designers", color: "violet", effect: "Raise product quality by improving UX and reducing friction." },
              ].map(e => (
                <div key={e.role} className={`p-3 bg-${e.color}-50/50 dark:bg-${e.color}-900/20 rounded-xl border border-${e.color}-100 dark:border-${e.color}-900/30`}>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1">{e.emoji} {e.role}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{e.effect}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">🏆 C-Suite Executives (CXOs)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { title: "🎯 CPO", desc: "Accelerates product features and reduces time-to-quality.", color: "violet" },
                  { title: "💻 CTO", desc: "Passively reduces tech debt at 2× the rate of standard engineers.", color: "blue" },
                  { title: "✉️ CMO", desc: "Boosts brand awareness multiplier. Reduces ad spend waste.", color: "pink" },
                  { title: "⚙️ COO", desc: "Reduces founder burnout accumulation. Increases team morale floor.", color: "amber" },
                  { title: "📊 CFO", desc: "Reduces burn rate by 10%. Unlocks the Fundraising Roadshow program.", color: "emerald" },
                  { title: "📅 EA", desc: "Expands your monthly focus capacity, letting you run more actions.", color: "indigo" },
                ].map(cxo => (
                  <div key={cxo.title} className={`p-2.5 bg-${cxo.color}-50/50 dark:bg-${cxo.color}-950/30 border border-${cxo.color}-100 dark:border-${cxo.color}-800 rounded-xl`}>
                    <p className={`text-xs font-black text-${cxo.color}-800 dark:text-${cxo.color}-400 mb-0.5`}>{cxo.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{cxo.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-900/30 p-4 rounded-2xl flex gap-3">
              <Heart className="size-6 text-rose-600 dark:text-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-rose-900 dark:text-rose-300 uppercase mb-1">Team Morale Matters Now</p>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium leading-relaxed">Low morale (below 40) now directly increases monthly churn. Unhappy teams give poor support, driving users away. Morale drops from low salaries, crisis events, and founder burnout. Raise salaries or grant equity to restore it.</p>
              </div>
            </div>
          </div>
        );

      // ─── COMPETITORS ──────────────────────────────────────────────────────────
      case 'competitors':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">Market Rivals</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                You operate in a competitive market. Rivals make moves every month — and so does your AI mentor/rival character Chadly.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rival Tactics</p>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl space-y-2">
                {[
                  { tactic: "💸 Price Cut", effect: "Steals users & compresses your margins" },
                  { tactic: "💔 Talent Poaching", effect: "Attempts to hire your employees away" },
                  { tactic: "📰 Press Attack", effect: "Damages brand reputation and PMF" },
                  { tactic: "🚀 Feature Launch", effect: "Raises rival's quality and threat level" },
                  { tactic: "💰 Fundraise", effect: "Extends their runway, increases their pressure" },
                ].map(r => (
                  <div key={r.tactic} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{r.tactic}</span>
                    <span className="text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">{r.effect}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl">
              <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1"><Sparkles className="size-3" /> Meet Chadly</p>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium leading-relaxed">Chadly is your in-game rival character. He tracks your progress and taunts you when you're struggling. He can also make his own strategic mistakes — over-expanding, running out of runway, or suffering PR disasters that drop his valuation. Watch for him in the Rival feed.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Counter-Moves</p>
              <ul className="text-slate-600 dark:text-slate-400 text-xs font-medium space-y-1.5 leading-relaxed">
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">High PMF:</strong> Users with high loyalty are harder for rivals to poach.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">PR Campaign:</strong> Directly counter press attacks and restore reputation.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Competitor Analysis:</strong> Reveals their valuation, stage, and next likely move.</li>
              </ul>
            </div>
          </div>
        );

      // ─── ENDING ───────────────────────────────────────────────────────────────
      case 'ending':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">How To Win</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                There are two ways to exit. The path you choose changes your payout, your XP reward, and what you unlock in future runs.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex gap-3">
                <div className="size-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-black shadow-lg shadow-slate-900/20 shrink-0">🏛️</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">1. IPO Route</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Taking your company public requires hitting  <strong className="font-bold text-slate-700 dark:text-slate-300">$50M ARR, 10k+ users, PMF ≥ 60, Series A raised</strong>, and filing your S-1. It's a 4-month multi-step process with underwriting, roadshows, and a public offering price. Higher risk, potentially highest payout.</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex gap-3">
                <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/20 shrink-0">💰</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">2. Acquisition</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">A strategic buyer approaches you with an offer based on your current valuation multiple. Negotiations can raise the offer. Faster to close than an IPO, typically 5-8× ARR. Best for founders who want a clean exit without lockup periods.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Legacy System</p>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-medium space-y-1.5">
                <p>After each exit, you earn <strong className="font-bold text-slate-800 dark:text-slate-200">XP (Experience Points)</strong> based on your final valuation and equity retained. Use XP to unlock <strong className="font-bold text-slate-800 dark:text-slate-200">Legacy Perks</strong> that carry into future games:</p>
                <ul className="space-y-1 mt-2">
                  <li>• <strong className="font-bold text-slate-700 dark:text-slate-300">Serial Founder:</strong> Start with extra cash in your next run.</li>
                  <li>• <strong className="font-bold text-slate-700 dark:text-slate-300">Growth Hacker:</strong> +10% monthly growth rate permanently.</li>
                  <li>• <strong className="font-bold text-slate-700 dark:text-slate-300">Efficient Ops:</strong> -15% burn rate across all future companies.</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl">
              <p className="text-xs font-black uppercase text-indigo-400 mb-1 flex items-center gap-1"><Award className="size-4" /> Score Formula</p>
              <p className="text-[11px] font-medium leading-relaxed text-slate-300">
                <strong className="font-bold text-white">(Exit Valuation × Your Equity %) + Personal Wealth Extracted</strong>
                <br />Build slow, retain equity, then strike at valuation peak. A 60% stake in a $200M company beats a 10% stake in a $500M company.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden flex-1">
      {/* Mobile Scroll Hint */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 md:hidden shrink-0">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sections</span>
        <div className="flex items-center gap-1 text-indigo-600 animate-pulse">
          <span className="text-[9px] font-black uppercase tracking-wider">Scroll Right</span>
          <span className="text-xs font-bold leading-none">→</span>
        </div>
      </div>

      {/* Sidebar / Tab Navigation */}
      <div className="relative shrink-0 w-full md:w-52">
        <div className="bg-slate-50 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-black text-[10px] uppercase tracking-wider transition-all duration-150 shrink-0 select-none ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 active:scale-[0.98]'
                }`}
              >
                <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-950">
        {renderContent()}
      </div>
    </div>
  );
}
