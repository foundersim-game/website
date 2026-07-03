
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Zap, TrendingUp, DollarSign, Users, Shield, Award, BarChart3, 
  Heart, AlertCircle, Sparkles, Globe, ChevronRight, 
  CreditCard, Banknote, ShoppingBag, Gamepad2, GraduationCap, 
  Terminal, MonitorPlay, BrainCircuit, Box
} from "lucide-react";

export function HowToPlayContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('basics');
  const [selectedIndustry, setSelectedIndustry] = useState('SaaS');

  const tabs = useMemo(() => [
    { id: 'basics',      label: t('howToPlay.tabs_basics'),      icon: BarChart3 },
    { id: 'skills',      label: t('howToPlay.tabs_skills'),      icon: GraduationCap },
    { id: 'product',     label: t('howToPlay.tabs_product'),     icon: Zap },
    { id: 'industries',  label: t('howToPlay.tabs_industries'),  icon: Globe },
    { id: 'growth',      label: t('howToPlay.tabs_growth'),      icon: TrendingUp },
    { id: 'funding',     label: t('howToPlay.tabs_funding'),     icon: DollarSign },
    { id: 'team',        label: t('howToPlay.tabs_team'),        icon: Users },
    { id: 'competitors', label: t('howToPlay.tabs_competitors'), icon: Shield },
    { id: 'ending',      label: t('howToPlay.tabs_ending'),      icon: Award },
  ], [t]);

  const industries = useMemo(() => [
    { id: 'SaaS',        name: t('howToPlay.industries_saas_name'),        icon: Box,          description: t('howToPlay.industries_saas_desc') },
    { id: 'AI',          name: t('howToPlay.industries_ai_name'),          icon: BrainCircuit, description: t('howToPlay.industries_ai_desc') },
    { id: 'FinTech',     name: t('howToPlay.industries_fintech_name'),     icon: CreditCard,   description: t('howToPlay.industries_fintech_desc') },
    { id: 'Game',        name: t('howToPlay.industries_game_name'),        icon: Gamepad2,     description: t('howToPlay.industries_game_desc') },
    { id: 'Marketplace', name: t('howToPlay.industries_marketplace_name'), icon: ShoppingBag,  description: t('howToPlay.industries_marketplace_desc') },
    { id: 'OTT',         name: t('howToPlay.industries_ott_name'),         icon: MonitorPlay,  description: t('howToPlay.industries_ott_desc') },
    { id: 'DevTools',    name: t('howToPlay.industries_devtools_name'),    icon: Terminal,     description: t('howToPlay.industries_devtools_desc') },
    { id: 'EdTech',      name: t('howToPlay.industries_edtech_name'),      icon: GraduationCap,description: t('howToPlay.industries_edtech_desc') },
  ], [t]);

  const industryDetails = useMemo(() => ({
    'SaaS': {
      viral: { title: t('howToPlay.ind_saas_viral_title'), formula: t('howToPlay.ind_saas_viral_formula'), drivers: t('howToPlay.ind_saas_viral_drivers'), tip: t('howToPlay.ind_saas_viral_tip') },
      sales: { title: t('howToPlay.ind_saas_sales_title'), formula: t('howToPlay.ind_saas_sales_formula'), drivers: t('howToPlay.ind_saas_sales_drivers'), tip: t('howToPlay.ind_saas_sales_tip') }
    },
    'AI': {
      viral: { title: t('howToPlay.ind_ai_viral_title'), formula: t('howToPlay.ind_ai_viral_formula'), drivers: t('howToPlay.ind_ai_viral_drivers'), tip: t('howToPlay.ind_ai_viral_tip') },
      sales: { title: t('howToPlay.ind_ai_sales_title'), formula: t('howToPlay.ind_ai_sales_formula'), drivers: t('howToPlay.ind_ai_sales_drivers'), tip: t('howToPlay.ind_ai_sales_tip') }
    },
    'FinTech': {
      viral: { title: t('howToPlay.ind_fintech_viral_title'), formula: t('howToPlay.ind_fintech_viral_formula'), drivers: t('howToPlay.ind_fintech_viral_drivers'), tip: t('howToPlay.ind_fintech_viral_tip') },
      sales: { title: t('howToPlay.ind_fintech_sales_title'), formula: t('howToPlay.ind_fintech_sales_formula'), drivers: t('howToPlay.ind_fintech_sales_drivers'), tip: t('howToPlay.ind_fintech_sales_tip') }
    },
    'Game': {
      viral: { title: t('howToPlay.ind_game_viral_title'), formula: t('howToPlay.ind_game_viral_formula'), drivers: t('howToPlay.ind_game_viral_drivers'), tip: t('howToPlay.ind_game_viral_tip') },
      sales: { title: t('howToPlay.ind_game_sales_title'), formula: t('howToPlay.ind_game_sales_formula'), drivers: t('howToPlay.ind_game_sales_drivers'), tip: t('howToPlay.ind_game_sales_tip') }
    },
    'Marketplace': {
      viral: { title: t('howToPlay.ind_marketplace_viral_title'), formula: t('howToPlay.ind_marketplace_viral_formula'), drivers: t('howToPlay.ind_marketplace_viral_drivers'), tip: t('howToPlay.ind_marketplace_viral_tip') },
      sales: { title: t('howToPlay.ind_marketplace_sales_title'), formula: t('howToPlay.ind_marketplace_sales_formula'), drivers: t('howToPlay.ind_marketplace_sales_drivers'), tip: t('howToPlay.ind_marketplace_sales_tip') }
    },
    'OTT': {
      viral: { title: t('howToPlay.ind_ott_viral_title'), formula: t('howToPlay.ind_ott_viral_formula'), drivers: t('howToPlay.ind_ott_viral_drivers'), tip: t('howToPlay.ind_ott_viral_tip') },
      sales: { title: t('howToPlay.ind_ott_sales_title'), formula: t('howToPlay.ind_ott_sales_formula'), drivers: t('howToPlay.ind_ott_sales_drivers'), tip: t('howToPlay.ind_ott_sales_tip') }
    },
    'DevTools': {
      viral: { title: t('howToPlay.ind_devtools_viral_title'), formula: t('howToPlay.ind_devtools_viral_formula'), drivers: t('howToPlay.ind_devtools_viral_drivers'), tip: t('howToPlay.ind_devtools_viral_tip') },
      sales: { title: t('howToPlay.ind_devtools_sales_title'), formula: t('howToPlay.ind_devtools_sales_formula'), drivers: t('howToPlay.ind_devtools_sales_drivers'), tip: t('howToPlay.ind_devtools_sales_tip') }
    },
    'EdTech': {
      viral: { title: t('howToPlay.ind_edtech_viral_title'), formula: t('howToPlay.ind_edtech_viral_formula'), drivers: t('howToPlay.ind_edtech_viral_drivers'), tip: t('howToPlay.ind_edtech_viral_tip') },
      sales: { title: t('howToPlay.ind_edtech_sales_title'), formula: t('howToPlay.ind_edtech_sales_formula'), drivers: t('howToPlay.ind_edtech_sales_drivers'), tip: t('howToPlay.ind_edtech_sales_tip') }
    },
  }), [t]);

  const renderContent = () => {
    switch (activeTab) {
      case 'industries':
        const indData = (industryDetails as Record<string, any>)[selectedIndustry] || industryDetails['SaaS'];
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.industries_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.industries_subtitle')}
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
                    <span className={`text-[0.625rem] font-black uppercase tracking-tight ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-500'}`}>{ind.name}</span>
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
                  <p className="text-[0.625rem] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">{t('howToPlay.industries_mode_viral')}</p>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-3">{indData.viral.title}</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[0.625rem] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('howToPlay.industries_revenue_formula')}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{indData.viral.formula}</p>
                    </div>
                    <div>
                      <p className="text-[0.625rem] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('howToPlay.industries_core_levers')}</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{indData.viral.drivers}</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                      <p className="text-[0.625rem] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-1 flex items-center gap-1"><Sparkles className="size-3" /> {t('howToPlay.industries_growth_tip')}</p>
                      <p className="text-[0.6875rem] text-indigo-900/80 dark:text-indigo-300/80 font-bold italic">{indData.viral.tip}</p>
                    </div>
                  </div>
                </div>

                {/* Sales Mode */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10"><Users className="size-12 text-emerald-500" /></div>
                  <p className="text-[0.625rem] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1">{t('howToPlay.industries_mode_sales')}</p>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-3">{indData.sales.title}</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[0.625rem] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('howToPlay.industries_revenue_formula')}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{indData.sales.formula}</p>
                    </div>
                    <div>
                      <p className="text-[0.625rem] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">{t('howToPlay.industries_core_levers')}</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{indData.sales.drivers}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                      <p className="text-[0.625rem] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-1 flex items-center gap-1"><BrainCircuit className="size-3" /> {t('howToPlay.industries_strategy_tip')}</p>
                      <p className="text-[0.6875rem] text-emerald-900/80 dark:text-emerald-300/80 font-bold italic">{indData.sales.tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Mechanics Alert */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[0.6875rem] font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest mb-1">{t('howToPlay.industries_hidden_title')}</p>
                <p className="text-[0.6875rem] text-amber-800/80 dark:text-amber-300/80 font-medium leading-relaxed">
                  {t('howToPlay.industries_hidden_body')}
                </p>
              </div>
            </div>
          </div>
        );

      case 'basics':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.basics_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.basics_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black mb-2 shadow-sm shadow-indigo-600/30">1</div>
                <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 mb-1 uppercase tracking-wider">{t('howToPlay.basics_burn_rate_title')}</p>
                <p className="text-[0.6875rem] text-indigo-700 dark:text-indigo-400 font-medium">
                  {t('howToPlay.basics_burn_rate_body')}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black mb-2 shadow-sm shadow-emerald-600/30">2</div>
                <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 mb-1 uppercase tracking-wider">{t('howToPlay.basics_focus_title')}</p>
                <p className="text-[0.6875rem] text-emerald-700 dark:text-emerald-400 font-medium">{t('howToPlay.basics_focus_body')}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><BarChart3 className="size-3" /> {t('howToPlay.basics_monthly_loop')}</p>
              <ul className="text-slate-600 dark:text-slate-400 text-xs font-medium space-y-2 leading-relaxed">
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">{t('howToPlay.basics_loop1').split(':')[0]}:</strong> {t('howToPlay.basics_loop1').split(':').slice(1).join(':').trim()}</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">{t('howToPlay.basics_loop2').split('—')[0].trim()}</strong> — {t('howToPlay.basics_loop2').split('—').slice(1).join('—').trim()}</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">{t('howToPlay.basics_loop3').split('—')[0].trim()}</strong> — {t('howToPlay.basics_loop3').split('—').slice(1).join('—').trim()}</li>
                <li>• <strong className="font-bold text-slate-800 dark:text-slate-200">{t('howToPlay.basics_loop4').split(' ')[0]} {t('howToPlay.basics_loop4').split(' ')[1]}</strong> {t('howToPlay.basics_loop4').split(' ').slice(2).join(' ')}</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">{t('howToPlay.basics_store_title')}</p>
              <ul className="text-slate-600 dark:text-slate-400 text-xs font-medium space-y-2 leading-relaxed">
                <li>• {t('howToPlay.basics_store1')}</li>
                <li>• {t('howToPlay.basics_store2')}</li>
                <li>• {t('howToPlay.basics_store3')}</li>
                <li>• {t('howToPlay.basics_store4')}</li>
              </ul>
            </div>
          </div>
        );
      
      case 'skills':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.skills_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.skills_subtitle')}
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-900/30 p-5 rounded-2xl">
              <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 mb-3 uppercase tracking-widest flex items-center gap-2">
                <GraduationCap className="size-4" /> {t('howToPlay.skills_how_to_earn')}
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3 bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xl">💰</div>
                  <div>
                    <p className="text-[0.6875rem] font-black text-slate-800 dark:text-slate-200 uppercase">{t('howToPlay.skills_funding_title')}</p>
                    <p className="text-[0.625rem] text-slate-500 font-medium">{t('howToPlay.skills_funding_body')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xl">📈</div>
                  <div>
                    <p className="text-[0.6875rem] font-black text-slate-800 dark:text-slate-200 uppercase">{t('howToPlay.skills_user_title')}</p>
                    <p className="text-[0.625rem] text-slate-500 font-medium">{t('howToPlay.skills_user_body')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xl">⏳</div>
                  <div>
                    <p className="text-[0.6875rem] font-black text-slate-800 dark:text-slate-200 uppercase">{t('howToPlay.skills_tenure_title')}</p>
                    <p className="text-[0.625rem] text-slate-500 font-medium">{t('howToPlay.skills_tenure_body')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('howToPlay.skills_branches')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                  <p className="text-[0.625rem] font-black text-blue-700 uppercase mb-1">{t('howToPlay.skills_branch_tech')}</p>
                  <p className="text-[0.625rem] text-slate-500 font-medium leading-tight">{t('howToPlay.skills_branch_tech_body')}</p>
                </div>
                <div className="p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-xl">
                  <p className="text-[0.625rem] font-black text-pink-700 uppercase mb-1">{t('howToPlay.skills_branch_mkt')}</p>
                  <p className="text-[0.625rem] text-slate-500 font-medium leading-tight">{t('howToPlay.skills_branch_mkt_body')}</p>
                </div>
                <div className="p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl">
                  <p className="text-[0.625rem] font-black text-violet-700 uppercase mb-1">{t('howToPlay.skills_branch_lead')}</p>
                  <p className="text-[0.625rem] text-slate-500 font-medium leading-tight">{t('howToPlay.skills_branch_lead_body')}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                  <p className="text-[0.625rem] font-black text-emerald-700 uppercase mb-1">{t('howToPlay.skills_branch_fund')}</p>
                  <p className="text-[0.625rem] text-slate-500 font-medium leading-tight">{t('howToPlay.skills_branch_fund_body')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.product_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.product_subtitle')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black shadow-lg shadow-violet-600/20 shrink-0">✨</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{t('howToPlay.product_quality_title')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('howToPlay.product_quality_body')}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-600/20 shrink-0">🔁</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{t('howToPlay.product_pmf_title')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('howToPlay.product_pmf_body')}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-lg shadow-amber-600/20 shrink-0">⚠️</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{t('howToPlay.product_debt_title')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('howToPlay.product_debt_body')}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex gap-3">
              <AlertCircle className="size-6 text-amber-600 dark:text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase mb-1">{t('howToPlay.product_insight_title')}</p>
                <p className="text-[0.6875rem] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">{t('howToPlay.product_insight_body')}</p>
              </div>
            </div>
          </div>
        );

      case 'growth':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.growth_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.growth_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 p-4 rounded-2xl">
                <p className="text-sm font-black text-indigo-900 dark:text-indigo-300 mb-1">{t('howToPlay.growth_viral_title')}</p>
                <p className="text-[0.625rem] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest mb-2">{t('howToPlay.growth_viral_sub')}</p>
                <ul className="text-[0.6875rem] text-indigo-700 dark:text-indigo-400 font-medium space-y-1.5 leading-relaxed">
                  <li>• <strong className="font-bold">{t('howToPlay.growth_viral1')}</strong></li>
                  <li>• {t('howToPlay.growth_viral2')}</li>
                  <li>• {t('howToPlay.growth_viral3')}</li>
                  <li>• {t('howToPlay.growth_viral4')}</li>
                  <li>• {t('howToPlay.growth_viral5')}</li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl">
                <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">{t('howToPlay.growth_sales_title')}</p>
                <p className="text-[0.625rem] text-emerald-500 dark:text-emerald-400 font-black uppercase tracking-widest mb-2">{t('howToPlay.growth_sales_sub')}</p>
                <ul className="text-[0.6875rem] text-emerald-700 dark:text-emerald-400 font-medium space-y-1.5 leading-relaxed">
                  <li>• <strong className="font-bold">{t('howToPlay.growth_sales1')}</strong></li>
                  <li>• {t('howToPlay.growth_sales2')}</li>
                  <li>• {t('howToPlay.growth_sales3')}</li>
                  <li>• {t('howToPlay.growth_sales4')}</li>
                  <li>• {t('howToPlay.growth_sales5')}</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('howToPlay.growth_churn_title')}</p>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="flex justify-between"><span>{t('howToPlay.growth_churn1')}</span><span className="font-black text-rose-600">{t('howToPlay.growth_churn_extra1')}</span></div>
                <div className="flex justify-between"><span>{t('howToPlay.growth_churn2')}</span><span className="font-black text-rose-600">{t('howToPlay.growth_churn_extra2')}</span></div>
                <div className="flex justify-between"><span>{t('howToPlay.growth_churn3')}</span><span className="font-black text-rose-600">{t('howToPlay.growth_churn_extra3')}</span></div>
                <div className="flex justify-between"><span>{t('howToPlay.growth_churn4')}</span><span className="font-black text-rose-600">{t('howToPlay.growth_churn_extra4')}</span></div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2"><span className="font-black text-slate-700 dark:text-slate-300">{t('howToPlay.growth_churn_max')}</span><span className="font-black text-slate-700 dark:text-slate-300">{t('howToPlay.growth_churn_max_val')}</span></div>
              </div>
            </div>
          </div>
        );

      case 'funding':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.funding_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.funding_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-wider">{t('howToPlay.funding_fundraising_title')}</p>
                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('howToPlay.funding_fundraising_body')}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-wider">{t('howToPlay.funding_board_title')}</p>
                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('howToPlay.funding_board_body')}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-wider">{t('howToPlay.funding_options_title')}</p>
                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('howToPlay.funding_options_body')}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-wider">{t('howToPlay.funding_compliance_title')}</p>
                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('howToPlay.funding_compliance_body')}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-wider">{t('howToPlay.funding_debt_title')}</p>
                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('howToPlay.funding_debt_body')}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-wider">{t('howToPlay.funding_treasury_title')}</p>
                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('howToPlay.funding_treasury_body')}</p>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl flex gap-3">
              <Sparkles className="size-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase mb-1">{t('howToPlay.funding_lifestyle_title')}</p>
                <p className="text-[0.6875rem] text-indigo-800 dark:text-indigo-400 font-medium leading-relaxed">{t('howToPlay.funding_lifestyle_body')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('howToPlay.funding_ir_title')}</p>
              <ul className="text-slate-600 dark:text-slate-400 text-xs font-medium space-y-2 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                <li>• {t('howToPlay.funding_ir1')}</li>
                <li>• {t('howToPlay.funding_ir2')}</li>
              </ul>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl">
              <p className="text-xs font-black uppercase text-indigo-400 mb-1">{t('howToPlay.funding_valuation_label')}</p>
              <p className="text-[0.6875rem] font-medium leading-relaxed text-slate-300">{t('howToPlay.funding_valuation_body')}</p>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.team_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.team_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { emoji: "👨‍💻", roleKey: "engineers_role", effectKey: "engineers_effect", cls: "p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30" },
                { emoji: "📣",   roleKey: "marketers_role", effectKey: "marketers_effect", cls: "p-3 bg-pink-50/50 dark:bg-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-900/30" },
                { emoji: "🤝",   roleKey: "sales_role",     effectKey: "sales_effect",     cls: "p-3 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30" },
                { emoji: "🎨",   roleKey: "designers_role", effectKey: "designers_effect", cls: "p-3 bg-violet-50/50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-900/30" },
              ].map(e => (
                <div key={e.roleKey} className={e.cls}>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1">{e.emoji} {t(`howToPlay.team_${e.roleKey}`)}</p>
                  <p className="text-[0.625rem] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t(`howToPlay.team_${e.effectKey}`)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('howToPlay.team_cxo_title')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { titleKey: "cpo_title", descKey: "cpo_desc", cls: "p-2.5 bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800 rounded-xl", txtCls: "text-xs font-black text-violet-800 dark:text-violet-400 mb-0.5" },
                  { titleKey: "cto_title", descKey: "cto_desc", cls: "p-2.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 rounded-xl",   txtCls: "text-xs font-black text-blue-800 dark:text-blue-400 mb-0.5" },
                  { titleKey: "cmo_title", descKey: "cmo_desc", cls: "p-2.5 bg-pink-50/50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-800 rounded-xl",   txtCls: "text-xs font-black text-pink-800 dark:text-pink-400 mb-0.5" },
                  { titleKey: "coo_title", descKey: "coo_desc", cls: "p-2.5 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800 rounded-xl", txtCls: "text-xs font-black text-amber-800 dark:text-amber-400 mb-0.5" },
                  { titleKey: "cfo_title", descKey: "cfo_desc", cls: "p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 rounded-xl", txtCls: "text-xs font-black text-emerald-800 dark:text-emerald-400 mb-0.5" },
                  { titleKey: "ea_title",  descKey: "ea_desc",  cls: "p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 rounded-xl",  txtCls: "text-xs font-black text-indigo-800 dark:text-indigo-400 mb-0.5" },
                ].map(cxo => (
                  <div key={cxo.titleKey} className={cxo.cls}>
                    <p className={cxo.txtCls}>{t(`howToPlay.team_${cxo.titleKey}`)}</p>
                    <p className="text-[0.625rem] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t(`howToPlay.team_${cxo.descKey}`)}</p>
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
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.competitors_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.competitors_subtitle')}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('howToPlay.competitors_tactics_title')}</p>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl space-y-2">
                {[
                  { tacticKey: "tactic_price",     effectKey: "tactic_price_effect" },
                  { tacticKey: "tactic_talent",    effectKey: "tactic_talent_effect" },
                  { tacticKey: "tactic_press",     effectKey: "tactic_press_effect" },
                  { tacticKey: "tactic_feature",   effectKey: "tactic_feature_effect" },
                  { tacticKey: "tactic_fundraise", effectKey: "tactic_fundraise_effect" },
                ].map(r => (
                  <div key={r.tacticKey} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t(`howToPlay.competitors_${r.tacticKey}`)}</span>
                    <span className="text-[0.625rem] bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">{t(`howToPlay.competitors_${r.effectKey}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl">
              <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 mb-1 uppercase tracking-wider">{t('howToPlay.competitors_manda_title')}</p>
              <p className="text-[0.6875rem] text-indigo-700 dark:text-indigo-400 font-medium">{t('howToPlay.competitors_manda_body')}</p>
            </div>
          </div>
        );

      case 'ending':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">{t('howToPlay.ending_title')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {t('howToPlay.ending_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex gap-3">
                <div className="size-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-black shadow-lg shadow-slate-900/20 shrink-0">🏛️</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{t('howToPlay.ending_ipo_title')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('howToPlay.ending_ipo_body')}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex gap-3">
                <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-600/20 shrink-0">💰</div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{t('howToPlay.ending_manda_title')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t('howToPlay.ending_manda_body')}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl flex gap-3">
              <MonitorPlay className="size-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase mb-1">{t('howToPlay.ending_earnings_title')}</p>
                <p className="text-[0.6875rem] text-indigo-800 dark:text-indigo-400 font-medium leading-relaxed">{t('howToPlay.ending_earnings_body')}</p>
              </div>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-2xl flex gap-3">
              <Shield className="size-6 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-rose-900 dark:text-rose-300 uppercase mb-1">{t('howToPlay.ending_lobbying_title')}</p>
                <p className="text-[0.6875rem] text-rose-800 dark:text-rose-400 font-medium leading-relaxed">{t('howToPlay.ending_lobbying_body')}</p>
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
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left font-black text-[0.625rem] uppercase tracking-wider transition-all duration-150 shrink-0 select-none ${
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
