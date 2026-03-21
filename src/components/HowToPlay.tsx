
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, DollarSign, Users, Shield, AlertTriangle, Briefcase, BarChart3, Award, BookOpen, Rocket, LifeBuoy, Heart, AlertCircle, Sparkles } from "lucide-react";

export function HowToPlayContent() {
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics', label: 'Basics', icon: Rocket },
    { id: 'product', label: 'Product', icon: Zap },
    { id: 'marketing', label: 'Marketing', icon: TrendingUp },
    { id: 'funding', label: 'Funding', icon: DollarSign },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'competitors', label: 'Competitors', icon: Shield },
    { id: 'ending', label: 'Winning', icon: Award },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'basics':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">The Founder's Journey</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                You are the CEO of a brand new startup. Your grid-based dashboard represents your operations. Your main goal is to grow your company from an idea into a massive fully funded entity, and eventually sell it or go on the stock market (IPO).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black mb-2 shadow-sm shadow-indigo-600/30">1</div>
                <p className="text-xs font-black text-indigo-900 mb-1 uppercase tracking-wider">Burn Rate & Runway</p>
                <p className="text-[11px] text-indigo-700 font-medium"><strong className="font-bold text-indigo-900">Burn Rate</strong> is the money you spend each month (salaries, ads). <strong className="font-bold text-indigo-900">Runway</strong> is how many months you can survive with your current cash. If your runway hits 0, you go <strong className="font-bold text-indigo-900">Bankrupt</strong>.</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black mb-2 shadow-sm shadow-emerald-600/30">2</div>
                <p className="text-xs font-black text-emerald-900 mb-1 uppercase tracking-wider">Focus Energy (Hours)</p>
                <p className="text-[11px] text-emerald-700 font-medium">Everything you trigger (Actions or Programs) takes <strong className="font-bold text-emerald-900">Focus Hours</strong>. Operating beyond your 100/100 cap speeds up <strong className="font-bold text-emerald-900">Burnout</strong>, which deals damage quickly. Delegate work to survive.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><BarChart3 className="size-3" /> Standard Dashboard Loop</p>
              <ul className="text-slate-600 text-xs font-medium space-y-2 leading-relaxed">
                <li>• <strong className="font-bold text-slate-800">Product Setup (Month 1-3):</strong> Build your MVP features safely up to 100% standard setup accurately.</li>
                <li>• <strong className="font-bold text-slate-800">Marketing:</strong> Launch to the world organically to hook initial customers flawlessly.</li>
                <li>• <strong className="font-bold text-slate-800">Next Month Drive:</strong> Clicking bottom forward shifts operations and triggers Rival moves index setup.</li>
              </ul>
            </div>
          </div>
        );
      case 'product':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Building The Product</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Before people give you money, you need to offer them value. This lives inside the <strong className="font-bold text-slate-900">Product</strong> management sheet triggers index layout flawlessly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black shadow-lg shadow-violet-600/20 shrink-0">✨</div>
                <div>
                  <p className="text-sm font-black text-slate-800">Features & Quality</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Adding new features raises your <strong className="font-bold text-slate-700">Product Quality</strong>. People won't pay for empty products. Higher quality translates directly to faster organic user growth rates!</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-lg shadow-amber-600/20 shrink-0">⚠️</div>
                <div>
                  <p className="text-sm font-black text-slate-800">Technical Debt (The Danger Zone)</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Developing things too fast adds <strong className="font-bold text-slate-700">Tech Debt</strong>. Imagine it like messy wiring inside your code. Too much debug overhead drops reliability, which spawns random Server Meltdown crisis alerts that drain reputation instantly.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="size-6 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-900 uppercase">Founder Pro-Tip:</p>
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">Running "Code Feature" actions creates debt. Run "Refactor Code" intervals or employ <strong className="font-bold text-amber-900">Engineers</strong> to passively remove debt every month while keeping the lights flawlessly on!</p>
              </div>
            </div>
          </div>
        );
      case 'marketing':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Growth Strategies</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                How does your company get users? Choose between self-serve virality or high-touch contract consultations triggers layout flawlessly correctly.
              </p>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
              <table className="w-full text-left text-[11px] leading-relaxed">
                <thead className="bg-slate-50 border-b border-slate-200 font-black text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-1/4">Product</th>
                    <th className="p-3 w-1/8">Strategy</th>
                    <th className="p-3">Mode - A short description of Business Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">SaaS Platform</td>
                    <td className="p-2.5 bg-indigo-50/30 font-bold text-indigo-800">PLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Self-Serve SaaS:</strong> Freemium, viral loops, and self-serve upgrades. Your product drives adoption of small subscribers.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">SaaS Platform</td>
                    <td className="p-2.5 bg-emerald-50/30 font-bold text-emerald-800">SLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Enterprise SaaS:</strong> Outbound demos detailing complex contracts for mid to large companies with high ACVs.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">AI Platform</td>
                    <td className="p-2.5 bg-indigo-50/30 font-bold text-indigo-800">PLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Self-Serve API Model:</strong> Simple API access for devs to build on your models. Pay-as-you-go massive throughput.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">AI Platform</td>
                    <td className="p-2.5 bg-emerald-50/30 font-bold text-emerald-800">SLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Enterprise AI Solutions:</strong> Custom fine-tuned models and on-premise deployments for large corporations.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">OTT / Streaming</td>
                    <td className="p-2.5 bg-indigo-50/30 font-bold text-indigo-800">PLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Direct-to-Consumer:</strong> Broad library access for monthly subscribers. Focus on churn and content loops.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">OTT / Streaming</td>
                    <td className="p-2.5 bg-emerald-50/30 font-bold text-emerald-800">SLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Content Licensing:</strong> Selling content rights to other platforms or distributors for large upfront cash.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">Mobile Game</td>
                    <td className="p-2.5 bg-indigo-50/30 font-bold text-indigo-800">PLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">F2P Viral Growth:</strong> Free-to-play with aggressive ad-mediation and IAP hooks to scale casual player counts.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">Mobile Game</td>
                    <td className="p-2.5 bg-emerald-50/30 font-bold text-emerald-800">SLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Branded / IP Games:</strong> Working with movie studios or brands to build high-quality licensed games with Guaranteed audience.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">FinTech App</td>
                    <td className="p-2.5 bg-indigo-50/30 font-bold text-indigo-800">PLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Consumer Neo-bank:</strong> Elegant mobile banking for direct users with high daily usage and word-of-mouth.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">FinTech App</td>
                    <td className="p-2.5 bg-emerald-50/30 font-bold text-emerald-800">SLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">B2B Infrastructure:</strong> Embedded finance APIs & payment rails for other companies. High transaction volume.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">EdTech Platform</td>
                    <td className="p-2.5 bg-indigo-50/30 font-bold text-indigo-800">PLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Direct-to-Learner:</strong> Self-paced courses and community-led learning for individuals. Fast go-to-market.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">EdTech Platform</td>
                    <td className="p-2.5 bg-emerald-50/30 font-bold text-emerald-800">SLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Institutional Sales:</strong> Selling whole-school or corporate-training licenses. Slow procurement but stable.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">Developer Tools</td>
                    <td className="p-2.5 bg-indigo-50/30 font-bold text-indigo-800">PLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Open Source Core:</strong> Free tools developers love, charging for hosting/cloud. Organic dev community growth.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">Developer Tools</td>
                    <td className="p-2.5 bg-emerald-50/30 font-bold text-emerald-800">SLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Enterprise Cloud:</strong> Managed deployments with security, SSO, and compliance for huge enterprise teams.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">Marketplace</td>
                    <td className="p-2.5 bg-indigo-50/30 font-bold text-indigo-800">PLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Community Growth:</strong> Niche marketplace growing through user reviews & social trust. Organic liquidity setup.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">Marketplace</td>
                    <td className="p-2.5 bg-emerald-50/30 font-bold text-emerald-800">SLG</td>
                    <td className="p-2.5"><strong className="font-bold text-slate-700">Managed Supply:</strong> Vetting and managing supply directly to guarantee high-quality service and premium pricing.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Growth Engines</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Brand Awareness</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black">Boosts Free User Intake</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">B2B Leads (SLG Only)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">Requires Sales To Convert</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">CAC (Acquisition Cost)</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-black">Checks cost per 1 paid user</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'funding':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Equity & Valuations</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                To move fast, sometimes you need immediate safety triggers flawless budget cushions triggers flawlessly.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex gap-3">
                <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-600/20 shrink-0">💵</div>
                <div>
                  <p className="text-sm font-black text-slate-800">The Pitch Layout</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Pitching investors requires pitching rounds. When an investor gives you money, it is <strong className="font-bold text-slate-700">NOT</strong> a gift! They take a percentage slice of your company pie (<strong className="font-bold text-slate-700">Equity</strong>).</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fundamentals</p>
              <ul className="text-slate-600 text-xs font-medium space-y-2 leading-relaxed">
                <li>• <strong className="font-bold text-slate-800">Dilution:</strong> If you give 20% away today, your personal 100% drops to 80%. Protect your layout indices correctly triggers flaws.</li>
                <li>• <strong className="font-bold text-slate-800">Valuation Rate:</strong> The total theoretical math payout cost multiplied properly layout flawlessly correctly!</li>
                <li>• <strong className="font-bold text-slate-800">Board Seats:</strong> Taking continuous rounds allows investors seats that demand payout triggers layout node indices flaws triggers triggers flawlessly flaws layout flaws!</li>
              </ul>
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Hiring & Morale</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                You cannot do everything alone. Employees act as your delegating amplifiers triggers layout flaws flawless triggering flawlessly triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2">
                <span className="text-xl">👨‍💻</span>
                <div>
                  <p className="text-xs font-black text-blue-900">Engineers</p>
                  <p className="text-[10px] text-blue-700 font-medium">Remove technical debt passively index triggered flawlessly correctly.</p>
                </div>
              </div>
              <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 flex items-center gap-2">
                <span className="text-xl">📣</span>
                <div>
                  <p className="text-xs font-black text-pink-900">Marketers</p>
                  <p className="text-[10px] text-pink-700 font-medium">Raise users and brand intake effortlessly layout flawlessly.</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2">
                <span className="text-xl">🤝</span>
                <div>
                  <p className="text-xs font-black text-emerald-900">Sales</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Boost closure payout triggers securely correctly triggers flawlessly layout.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">🏆 Executive Hired (CXOs)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-violet-50/50 border border-violet-100 rounded-xl">
                  <p className="text-xs font-black text-violet-800 flex items-center gap-1">🎯 CPO</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Accelerates product features flawlessly correctly triggers.</p>
                </div>
                <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-black text-blue-800 flex items-center gap-1">💻 CTO</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Cuts tech debt index triggered flawlessly Correct triggers.</p>
                </div>
                <div className="p-2.5 bg-pink-50/50 border border-pink-100 rounded-xl">
                  <p className="text-xs font-black text-pink-800 flex items-center gap-1">✉️ CMO</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Boosts brand indices reduction multipliers triggers flaws.</p>
                </div>
                <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-black text-amber-800 flex items-center gap-1">⚙️ COO</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Reduces burnout cushions indices accurately triggered flaws.</p>
                </div>
                <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <p className="text-xs font-black text-emerald-800 flex items-center gap-1">📊 CFO</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Optimises burn & improves runway layout flawless accurately.</p>
                </div>
                <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <p className="text-xs font-black text-indigo-800 flex items-center gap-1">📅 EA</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Boosts focus capacity hours flawlessly corrected triggers.</p>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl flex gap-3">
              <Heart className="size-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-rose-900 uppercase">Team Morale:</p>
                <p className="text-[11px] text-rose-700 font-medium leading-relaxed">If salaries are too low or crisis events keep hitting, morale drops. Low morale means higher <strong className="font-bold text-rose-900">Attrition</strong> (employees quitting and leaving you stranded!). Granting Equity restores faith triggers correctly layout flaw triggers flawlessly layout.</p>
              </div>
            </div>
          </div>
        );
      case 'competitors':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Market Rivals</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                You aren't operating in a vacuum. Rivals are raising rounds, building features, and attacking your startup nodes triggering flawlessly correctly triggers.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rival Tactics</p>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">💸 Price Cut</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Steals Customers/Margin</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">💔 Talent Poaching</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Hires Your Staff Away</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">📰 Press Attack</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Hurts Brand & Founder Rep</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
              <p className="text-xs font-black text-indigo-900 mb-1 flex items-center gap-1"><Sparkles className="size-3" /> Can they make mistakes?</p>
              <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">Yes! Rivals act like real players setup flawlessly correctly. They sometimes overleverage their roadmaps, suffering Backfires that drop their valuations passively safely flawlessly triggers.</p>
            </div>
          </div>
        );
      case 'ending':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">How To Win the Game</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Creating a lasting legacy and monetizing your layout properly triggers indices layout flaws flaws triggering flawlessly layout flawlessly correctly triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl flex gap-3">
                <div className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg shadow-slate-900/20 shrink-0">🏛️</div>
                <div>
                  <p className="text-sm font-black text-slate-800">1. The IPO Route</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Taking your company public sets off a 4-month multi-tier roadmap setup triggers flawlessly correctly triggers flawless setup correctly flawless trigger layout flawlessly flaws layout flawlessly correctly layout.</p>
                </div>
              </div>
              <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl flex gap-3">
                <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/20 shrink-0">💰</div>
                <div>
                  <p className="text-sm font-black text-slate-800">2. The Acquisition Setup</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">An organic cash buyout offer index flawless triggers accurately accurately accurately layout flawlessly correctly triggering flawless trigger layout flaws flawlessly flaws layout flaws correctly triggers flaws layout flawlessly correctly layout!</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl">
              <p className="text-xs font-black uppercase text-indigo-400 mb-1 flex items-center gap-1"><Award className="size-4" /> Score Formula:</p>
              <p className="text-[11px] font-medium leading-relaxed text-slate-300">You Score payouts equal: <br /><strong className="font-bold text-white">(End Valuation × Your Equity %) + Extracted Personal Wealth</strong>. <br />Build slow, retain equity, then strike layout flawless correctly triggers flawlessly triggers!</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden flex-1">
      {/* Mobile Scroll Instructions Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 border-b border-slate-200 md:hidden shrink-0">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tabs Layout</span>
        <div className="flex items-center gap-1 text-indigo-600 animate-pulse">
          <span className="text-[9px] font-black uppercase tracking-wider">Scroll Right</span>
          <span className="text-xs font-bold leading-none">→</span>
        </div>
      </div>

      {/* Sidebar / Top Tabs Navigation */}
      <div className="relative shrink-0 w-full md:w-52">
        <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-3 pr-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-black text-[10px] uppercase tracking-wider transition-all duration-150 shrink-0 select-none ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:bg-slate-200/60 active:scale-[0.98]'
                  }`}
              >
                <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Rendering Zone */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {renderContent()}
      </div>
    </div>
  );
}

