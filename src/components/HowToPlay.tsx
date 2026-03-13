
import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, DollarSign, Users, Shield, AlertTriangle, Briefcase, BarChart3, Award, BookOpen, Rocket, LifeBuoy } from "lucide-react";

export function HowToPlayContent() {
  return (
    <div className="p-6 overflow-y-auto bg-slate-50 space-y-10 flex-1 pb-20">
      {/* QUICK START CHECKLIST */}
      <section id="quickstart">
        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest pb-2 flex items-center gap-2">
          <LifeBuoy className="size-4" /> Quick Start: Your First 3 Months
        </h3>
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01] cursor-default">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black italic shrink-0">1</div>
            <div>
              <p className="text-[11px] text-slate-900 font-bold leading-none mb-1 uppercase tracking-tighter">Code Your MVP</p>
              <p className="text-[10px] text-slate-500 font-medium">Open the <strong>Product menu</strong> and use "Build Features" until your product quality hits 100%.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01] cursor-default">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black italic shrink-0">2</div>
            <div>
              <p className="text-[11px] text-slate-900 font-bold leading-none mb-1 uppercase tracking-tighter">Launch to the World</p>
              <p className="text-[10px] text-slate-500 font-medium">Go to the <strong>Market menu</strong> &rarr; "Organic Social" or "PR Campaign" to get your very first users.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01] cursor-default">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black italic shrink-0">3</div>
            <div>
              <p className="text-[11px] text-slate-900 font-bold leading-none mb-1 uppercase tracking-tighter">Start the Sales Loop</p>
              <p className="text-[10px] text-slate-500 font-medium">In the <strong>Market menu</strong>, toggle ON "SEO Content Machine" to start growing users and MRR automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD GUIDE */}
      <section id="dashboard-guide">
        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-4 flex items-center gap-2">
          <BarChart3 className="size-4" /> Reading the Dashboard
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">Top Left</p>
            <p className="text-[10px] text-slate-600 font-bold leading-tight"><strong>Company Info</strong>. Your Logo, Name, and current Month.</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">Top Center</p>
            <p className="text-[10px] text-slate-600 font-bold leading-tight"><strong>Focus Energy</strong>. Your "Action Points". Don't let it hit zero!</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">Bottom Grid</p>
            <p className="text-[10px] text-slate-600 font-bold leading-tight"><strong>Action Menus</strong>. This is where you actually DO tasks (Product, Market, etc.).</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">Middle Area</p>
            <p className="text-[10px] text-slate-600 font-bold leading-tight"><strong>Event Log</strong>. A timeline of your startup's monthly journey.</p>
          </div>
        </div>
      </section>

      {/* 1. WELCOME & CORE LOOP */}
      <section id="basics">
        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-4 flex items-center gap-2">
          <Rocket className="size-4" /> The Founder's Journey
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed font-semibold">
          You are the CEO of a new startup. Your goal is to grow your company from an idea into a "Unicorn" (a company worth $1B) and eventually sell it or go public (IPO).
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1 font-mono">Month 1-3: The Grind</p>
            <p className="text-xs text-slate-600 leading-relaxed">Focus on <strong>Building MVP Features</strong>. You have no users yet. You need a product that actually works before you can sell it.</p>
          </div>
          <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1 font-mono">Month 4+: The Growth</p>
            <p className="text-xs text-slate-600 leading-relaxed">Start <strong>Marketing</strong>. Balance building new features with getting users. Watch your <strong>Burn Rate</strong> carefully!</p>
          </div>
        </div>
      </section>

      {/* 2. THE STARTUP DICTIONARY */}
      <section id="dictionary">
        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-4 flex items-center gap-2">
          <BookOpen className="size-4" /> Startup Dictionary
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 italic">Understand the jargon</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
            <p className="text-xs font-black text-indigo-700">MRR</p>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">Monthly Recurring Revenue. The predictable money users pay you every month.</p>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
            <p className="text-xs font-black text-emerald-700">Burn Rate</p>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">How much cash you "burn" (spend) every month. Keeping this low extends your life.</p>
          </div>
          <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
            <p className="text-xs font-black text-amber-700">Runway</p>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">How many months you can survive with your current cash before you go bankrupt.</p>
          </div>
          <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
            <p className="text-xs font-black text-rose-700">CAC</p>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">Customer Acquisition Cost. Exactly how much it costs to 'buy' one new customer via ads.</p>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
            <p className="text-xs font-black text-blue-700">Tech Debt</p>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">Messy code. building fast creates debt. Too much debt breaks your product (Reliability drops).</p>
          </div>
          <div className="bg-violet-50/50 border border-violet-100 p-3 rounded-xl">
            <p className="text-xs font-black text-violet-700">Equity</p>
            <p className="text-[10px] text-slate-600 font-medium leading-tight">Ownership percentage. When you take investor money, you give them a "slice of your pie".</p>
          </div>
        </div>
      </section>

      {/* 3. FOCUS & BURNOUT DETAIL */}
      <section id="energy">
        <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest border-b border-rose-100 pb-2 mb-4 flex items-center gap-2">
          <Zap className="size-4 fill-rose-500" /> Managing Yourself
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed font-medium mb-4">
          You have <strong>Focus Energy</strong> (hours) every month.
          <br /><br />
          ⚡ <strong>Instant Actions</strong> (coding, pitching) take chunks of time.
          <br />
          🔄 <strong>Ongoing Programs</strong> (weekly syncs) take hours every single month.
        </p>
        <div className="bg-white border-l-4 border-rose-500 p-4 rounded-r-2xl shadow-sm">
          <p className="text-xs font-black text-rose-700 uppercase mb-1">How to avoid Burnout:</p>
          <ul className="text-[11px] text-slate-600 space-y-2 font-medium">
            <li>• <strong>Hire Employees:</strong> Every person you hire increases your Energy capacity (Delegation).</li>
            <li>• <strong>Recruit a Co-Founder:</strong> They take half your burnout burden.</li>
            <li>• <strong>Don't over-schedule:</strong> If you use more than 100% of your energy, you start burning out fast.</li>
          </ul>
        </div>
      </section>

      {/* 4. HIRING REASONING */}
      <section id="hiring-why">
        <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2 mb-4 flex items-center gap-2">
          <Users className="size-4" /> Why Hire?
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed font-medium mb-4">
          Employees aren't just an expense, they provide <strong>Department Power</strong>:
        </p>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">👨‍💻</div>
            <div>
              <p className="text-xs font-black text-slate-800">Engineers</p>
              <p className="text-[10px] text-slate-500 font-medium">Lower Tech Debt and boost Product Quality automatically every month.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">📣</div>
            <div>
              <p className="text-xs font-black text-slate-800">Marketers</p>
              <p className="text-[10px] text-slate-500 font-medium">Increase Growth Rate and Brand Awareness automatically.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">🤝</div>
            <div>
              <p className="text-xs font-black text-slate-800">Sales</p>
              <p className="text-[10px] text-slate-500 font-medium">Help close large B2B deals if your price is high.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GTM EXPLAINED */}
      <section id="gtm">
        <h3 className="text-sm font-black text-violet-600 uppercase tracking-widest border-b border-violet-100 pb-2 mb-4 flex items-center gap-2">
          <TrendingUp className="size-4" /> PLG vs SLG (Your Strategy)
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">How you get users</p>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-indigo-100 p-4 rounded-2xl">
            <p className="text-sm font-black text-indigo-700 mb-1">✨ PLG (Product-Led Growth)</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Example: Zoom or Slack. People find it themselves, sign up for free, and pay a small fee. High Virality, easy to grow, but low revenue per user.
            </p>
          </div>
          <div className="bg-white border border-emerald-100 p-4 rounded-2xl">
            <p className="text-sm font-black text-emerald-700 mb-1">🤝 SLG (Sales-Led Growth)</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Example: Oracle or SAP. You hire sales people to call big companies. High price ($500+ / mo), takes long time to close, but massive money.
            </p>
          </div>
        </div>
      </section>

      {/* 6. PRO TIPS */}
      <section id="tips">
        <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2 mb-4 flex items-center gap-2">
          <LifeBuoy className="size-4" /> Pro Tips for Survival
        </h3>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <div className="size-2 rounded-full bg-amber-400 mt-1 shrink-0" />
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              <strong>Keep Cash for 12 months:</strong> Never let your Runway drop below 6 months if you can help it. Fundraising takes time.
            </p>
          </li>
          <li className="flex gap-3">
            <div className="size-2 rounded-full bg-amber-400 mt-1 shrink-0" />
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              <strong>Quality over Quantity:</strong> If Product Quality is below 30%, growth will stall even if you spend $100k on ads. People hate buggy products.
            </p>
          </li>
          <li className="flex gap-3">
            <div className="size-2 rounded-full bg-amber-400 mt-1 shrink-0" />
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              <strong>Watch tech debt:</strong> If reliability drops, you'll get hit with "Server Meltdown" events that can kill your reputation instantly.
            </p>
          </li>
          <li className="flex gap-3">
            <div className="size-2 rounded-full bg-amber-400 mt-1 shrink-0" />
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              <strong>The CFO is worth it:</strong> Hiring a CFO saves you 10% on all bills. In "Realistic Mode", this often decides if you survive or not.
            </p>
          </li>
        </ul>
      </section>

      {/* 7. EXIT */}
      <section id="win">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
          <Award className="size-4" /> How to Win
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed font-medium">
          You win when you create a lasting legacy. This happens via <strong>Acquisition</strong> (someone buys you) or <strong>IPO</strong> (you go on the stock market).
          <br /><br />
          Your final score is based on: <br />
          <strong>(Final Valuation × Your Equity %) + Cash Remaining</strong>.
        </p>
      </section>
    </div>
  );
}
