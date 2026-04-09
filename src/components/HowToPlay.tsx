
import React, { useState } from 'react';
import { 
  Zap, TrendingUp, DollarSign, Users, Shield, Award, BarChart3, 
  Heart, AlertCircle, Sparkles, Globe, ChevronRight, 
  CreditCard, Banknote, ShoppingBag, Gamepad2, GraduationCap, 
  Terminal, MonitorPlay, BrainCircuit, Box
} from "lucide-react";

export function HowToPlayContent() {
  const [activeTab, setActiveTab] = useState('basics');
  const [selectedIndustry, setSelectedIndustry] = useState('SaaS');

  const tabs = [
    { id: 'basics',      label: 'Basics',      icon: BarChart3 },
    { id: 'product',     label: 'Product',     icon: Zap },
    { id: 'industries',  label: 'Industries',  icon: Globe },
    { id: 'growth',      label: 'Growth',      icon: TrendingUp },
    { id: 'funding',     label: 'Funding',     icon: DollarSign },
    { id: 'team',        label: 'Team',        icon: Users },
    { id: 'competitors', label: 'Rivals',      icon: Shield },
    { id: 'ending',      label: 'Winning',     icon: Award },
  ];

  const industries = [
    { id: 'SaaS', name: 'SaaS', icon: Box, description: 'Software as a Service. High margins, predictable recurring revenue.' },
    { id: 'AI', name: 'AI Platform', icon: BrainCircuit, description: 'Cutting-edge intelligence. High compute costs but massive scaling potential.' },
    { id: 'FinTech', name: 'FinTech', icon: CreditCard, description: 'Banking and payments. Trust-dependent, regulated, volume-driven revenue.' },
    { id: 'Game', name: 'Mobile Game', icon: Gamepad2, description: 'Entertainment first. Hit-driven with complex monetization levers.' },
    { id: 'Marketplace', name: 'Marketplace', icon: ShoppingBag, description: 'Connecting buyers and sellers. Hard to start (cold-start), huge network effects.' },
    { id: 'OTT', name: 'OTT Streaming', icon: MonitorPlay, description: 'Media and content. Reliability is king, high infrastructure burn.' },
    { id: 'DevTools', name: 'Dev Tools', icon: Terminal, description: 'Building for builders. Reliability and word-of-mouth are everything.' },
    { id: 'EdTech', name: 'EdTech', icon: GraduationCap, description: 'Digital learning. Completion rates drive reputation and referrals.' },
  ];

  const industryDetails: Record<string, any> = {
    'SaaS': {
      viral: {
        title: 'Self-Serve SaaS',
        formula: 'Revenue = Paid Users × Monthly Price',
        drivers: 'PMF vs. Pricing Tension. Early-game "Honeymoon" multipliers help early growth.',
        tip: 'Keep pricing low relative to PMF early to maximize conversion.'
      },
      sales: {
        title: 'Enterprise SaaS',
        formula: 'Revenue = Active Contracts × Annual Contract Value (ACV)',
        drivers: 'Win Rate is driven 50% by Sales Team skill and 50% by Product Quality.',
        tip: 'Enterprise deals pay 12 months upfront. Great for cash flow!'
      }
    },
    'AI': {
      viral: {
        title: 'Self-Serve API Model',
        formula: 'Revenue = Paid Users × Token Usage × Price',
        drivers: 'Token Volume scales with Innovation Score and Team technical power.',
        tip: 'Innovation drives usage. Keep your Engineers building hits.'
      },
      sales: {
        title: 'Enterprise AI Solutions',
        formula: 'Revenue = Closed Deals × 10x Enterprise Premium',
        drivers: 'Very low base win rate. Requires highly skilled Solution Architects.',
        tip: 'Each contract is worth 10x your base price. Big fish only.'
      }
    },
    'FinTech': {
      viral: {
        title: 'Consumer Neo-Bank',
        formula: 'Revenue = Users × Transaction Volume × Interchange %',
        drivers: 'Transaction Volume depends heavily on PMF (Trust) and quality.',
        tip: 'Regulatory compliance overhead adds to your monthly burn.'
      },
      sales: {
        title: 'B2B Embedded Finance API',
        formula: 'Revenue = Platform Deals × Bulk Transaction Fees',
        drivers: 'Enterprise clients value Reliability above all else. 0% downtime = 100% renewal.',
        tip: 'A single reliability outage in FinTech can trigger massive churn.'
      }
    },
    'Game': {
      viral: {
        title: 'F2P Viral Mobile Game',
        formula: 'Revenue = (Ads × Freq) + (Users × IAP Conversion × Price)',
        drivers: 'Ad Intensity (Slider) increases revenue but destroys PMF and spikes churn.',
        tip: 'Check your Ad Intensity! Past 40%, users start quitting in droves.'
      },
      sales: {
        title: 'Branded / IP Licensed Game',
        formula: 'Revenue = License Contracts × Monthly Franchise Fee',
        drivers: 'Fixed revenue per brand deal. High Reputation helps close big IPs.',
        tip: 'You don\'t own the users here; you own the contract. Sticky but slower growth.'
      }
    },
    'Marketplace': {
      viral: {
        title: 'Community Marketplace',
        formula: 'Revenue = Users × GMV per User × Take Rate %',
        drivers: 'Network Effects log-scale bonus: revenue per user GROWS as your base grows.',
        tip: 'Cross 10,000 users to unlock the first tier of exponential network effects.'
      },
      sales: {
        title: 'Managed Marketplace',
        formula: 'Revenue = Active Vetted Contracts × Retainer Fee',
        drivers: 'Operations-intensive. Vetting quality dictates how much suppliers pay to be listed.',
        tip: 'High COGS (30%+) due to manual vetting and supply-side management.'
      }
    },
    'OTT': {
      viral: {
        title: 'Direct-to-Consumer Streaming',
        formula: 'Revenue = Subscribed Users × Monthly Price',
        drivers: 'High infrastructure burn (CDN). Quality/Content determines conversion.',
        tip: 'Reliability is critical. If content buffers, users cancel immediate.'
      },
      sales: {
        title: 'B2B Content Licensing',
        formula: 'Revenue = License Deals × Periodic Renewal Fee',
        drivers: 'Sales-driven content distribution to larger platforms/airlines/hotels.',
        tip: 'Lower upside than consumer, but much lower infrastructure cost.'
      }
    },
    'DevTools': {
      viral: {
        title: 'Self-Serve DevTool / OSS',
        formula: 'Revenue = Paid Developer Seats × Price',
        drivers: 'Developer word-of-mouth (Virality) is unusually high (8x multiplier).',
        tip: 'Developers hate bugs. Reliability is the lead growth engine here.'
      },
      sales: {
        title: 'Enterprise Dev Platform',
        formula: 'Revenue = Enterprise Contracts × Security/SSO Premium',
        drivers: 'SOC2, Security, and Compliance features close these deals.',
        tip: 'Standard engineers can\'t build these; hire Senior Sales AEs.'
      }
    },
    'EdTech': {
      viral: {
        title: 'Direct-to-Learner Platform',
        formula: 'Revenue = Subscribed Learners × Price',
        drivers: 'PMF (Student Success) above 60 unlocks major viral referrals.',
        tip: 'Help students graduate! Completion rates drive your organic growth rate.'
      },
      sales: {
        title: 'Institutional / Corporate learning',
        formula: 'Revenue = Active Seat Licenses × Per-Seat Price',
        drivers: 'Winning multi-seat contracts at universities or HR departments.',
        tip: 'Long procurement cycles. You need a CFO to handle these contracts.'
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'industries':
        const indData = industryDetails[selectedIndustry] || industryDetails['SaaS'];
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">Industries & Modes</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                Every industry is governed by different physical laws. Select one below to see how its business models function.
              </p>
            </div>

            {/* Industry Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              {industries.map(ind => {
                const Icon = ind.icon;
                const isSelected = selectedIndustry === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all shrink-0 w-24 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <Icon className={`size-6 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-tight ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-500'}`}>{ind.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-4 italic leading-relaxed">
                "{industries.find(i => i.id === selectedIndustry)?.description}"
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Viral Mode */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10"><Zap className="size-12 text-indigo-500" /></div>
                  <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Mode: Viral / Self-Serve</p>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-3">{indData.viral.title}</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Revenue Formula</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{indData.viral.formula}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Core Levers</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{indData.viral.drivers}</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-1 flex items-center gap-1"><Sparkles className="size-3" /> Growth Pro-Tip</p>
                      <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80 font-bold italic">{indData.viral.tip}</p>
                    </div>
                  </div>
                </div>

                {/* Sales Mode */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10"><Users className="size-12 text-emerald-500" /></div>
                  <p className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1">Mode: Enterprise / B2B</p>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-3">{indData.sales.title}</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Revenue Formula</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{indData.sales.formula}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Core Levers</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{indData.sales.drivers}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-1 flex items-center gap-1"><BrainCircuit className="size-3" /> Strategy Pro-Tip</p>
                      <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 font-bold italic">{indData.sales.tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Mechanics Alert */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest mb-1">Hidden Multipliers</p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-medium leading-relaxed">
                  Profit margins are not flat. <strong className="font-bold">AI Platforms</strong> suffer from GPU compute COGS. <strong className="font-bold">FinTech</strong> carries high regulatory costs. <strong className="font-bold">OTT</strong> burns cash on CDN delivery. Scale carefully.
                </p>
              </div>
            </div>
          </div>
        );

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
          </div>
        );

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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">PMF reflects how well users love your product. It grows automatically as quality improves and users engage. Low PMF ({'<'}45) adds +10% monthly churn on top of your base rate.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-lg shadow-amber-600/20 shrink-0">⚠️</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">Technical Debt</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Building features too fast accumulates Tech Debt. High debt drops reliability, triggers server crisis events, and limits how high your Quality can reach.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="size-6 text-amber-600 dark:text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase mb-1">Key Insight: Bad Products Can't Go Viral</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">The viral multiplier only kicks in when Quality {'>'} 50 AND PMF {'>'} 15. Fix the product first, then market it.</p>
              </div>
            </div>
          </div>
        );

      case 'growth':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">Growth Strategies</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                When you create your startup, you choose a Go-To-Market strategy. This fundamentally changes how users, leads, and revenue are calculated.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 p-4 rounded-2xl">
                <p className="text-sm font-black text-indigo-900 dark:text-indigo-300 mb-1">📲 Viral / Self-Serve Growth</p>
                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest mb-2">Self-Serve SaaS · F2P Viral · Community Marketplace · Consumer Neo-bank</p>
                <ul className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium space-y-1.5 leading-relaxed">
                  <li>• Growth metric = <strong className="font-bold">Free Users</strong></li>
                  <li>• Revenue comes from converting free → paid via PMF & pricing</li>
                  <li>• Viral growth multiplies when Quality {'>'} 50 and PMF {'>'} 30</li>
                  <li>• Marketing team boosts organic intake</li>
                  <li>• Churn is your enemy — bad product empties the bucket</li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl">
                <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">🤝 Enterprise / B2B Sales</p>
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-black uppercase tracking-widest mb-2">Enterprise SaaS · Branded IP Game · Managed Marketplace · B2B Finance API</p>
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
          </div>
        );

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
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Investor Relations Programs</p>
              <ul className="text-slate-600 dark:text-slate-400 text-xs font-medium space-y-2 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">Monthly Investor Updates:</strong> Costs nothing. Adds +1 Reputation/mo.</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">CFO Roadshow:</strong> Replaces the Consultant once you hire a CFO. Zero extra cost, higher lead volume.</li>
              </ul>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl">
              <p className="text-xs font-black uppercase text-indigo-400 mb-1">Valuation Formula</p>
              <p className="text-[11px] font-medium leading-relaxed text-slate-300">Your valuation grows dynamically with <strong className="font-bold text-white">Revenue × ARR Multiple × PMF Factor × Team Score</strong>. A company with high revenue but low PMF will be worth less than a high-PMF competitor at the same revenue level.</p>
            </div>
          </div>
        );

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
                { emoji: "🤝", role: "Sales", color: "emerald", effect: "In Enterprise mode, their combined skill score drives pipeline win-rate directly. In Viral/Self-Serve, they boost conversion by up to +50% per 100 skill points." },
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
          </div>
        );

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
          </div>
        );

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
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Taking your company public requires hitting  <strong className="font-bold text-slate-700 dark:text-slate-300">$50M ARR, 10k+ users, PMF ≥ 60, Series A raised</strong>.</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex gap-3">
                <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/20 shrink-0">💰</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">2. Acquisition</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">A strategic buyer approaches you with an offer based on your current valuation multiple. Payout is typically 5-10x ARR.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden flex-1">
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
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
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
