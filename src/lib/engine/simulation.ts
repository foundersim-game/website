import { Founder, Startup, BoardMember, SalaryProposal, CapTableEntry } from "../types/database.types";
import { SCENARIOS, ScenarioId } from "./legacy";

export type StartupAction =
    // Product
    | "build_mvp_features"
    | "refactor_core"
    | "fix_bugs"
    // Marketing
    | "organic_social"
    | "paid_acquisition"
    | "pr_influencer"
    // Hiring
    | "hire_engineer"
    | "hire_marketer"
    | "hire_sales"
    // Funding
    | "pitch_investors"
    | "rest_and_recharge"
    | "none";

export function processMonth(founder: Founder, startup: Startup, action: StartupAction): { newStartup: Startup, notices: string[] } {
    const newStartup = {
        ...startup,
        metrics: { ...startup.metrics },
        employees: startup.employees || []
    };
    const notices: string[] = [];
    const attrs = founder.attributes;
    const metrics = newStartup.metrics;
    const industry = startup.industry;

    // Initialize new metrics if they don't exist (for migration)
    if (metrics.reliability === undefined) metrics.reliability = 80;
    if (metrics.innovation === undefined) metrics.innovation = 10;
    if (metrics.founder_burnout === undefined) metrics.founder_burnout = 0;
    if (metrics.founder_health === undefined) metrics.founder_health = 100;
    if (metrics.pmf_score === undefined) metrics.pmf_score = 10;
    if (metrics.sleep_quality === undefined) metrics.sleep_quality = 100;
    if (metrics.option_pool === undefined) metrics.option_pool = 0;
    if (metrics.founder_salary === undefined) metrics.founder_salary = 0;
    if (metrics.investor_pipeline === undefined) {
        metrics.investor_pipeline = { leads: 0, meetings: 0, term_sheets: 0 };
    }
    if (!founder.xp) {
        (founder as any).xp = { technical: 0, marketing: 0, leadership: 0, fundraising: 0, total: 0 };
    }

    // ---- FOUNDER XP SYSTEM ----
    const xpGrants: Record<string, { area: keyof typeof founder.xp; amount: number; attr: keyof typeof attrs }> = {
        "build_mvp_features": { area: "technical", amount: 15, attr: "technical_skill" },
        "refactor_core": { area: "technical", amount: 20, attr: "technical_skill" },
        "fix_bugs": { area: "technical", amount: 10, attr: "technical_skill" },
        "organic_social": { area: "marketing", amount: 15, attr: "marketing_skill" },
        "paid_acquisition": { area: "marketing", amount: 20, attr: "marketing_skill" },
        "pr_influencer": { area: "marketing", amount: 12, attr: "marketing_skill" },
        "hire_engineer": { area: "leadership", amount: 10, attr: "leadership" },
        "hire_marketer": { area: "leadership", amount: 10, attr: "leadership" },
        "hire_sales": { area: "leadership", amount: 10, attr: "leadership" },
        "pitch_investors": { area: "fundraising", amount: 25, attr: "networking" },
    };

    if (action !== "none" && xpGrants[action]) {
        const grant = xpGrants[action];
        const prevXP = (founder.xp as any)[grant.area] || 0;
        const newXP = prevXP + grant.amount;
        (founder.xp as any)[grant.area] = newXP;
        founder.xp.total += grant.amount;

        const prevLevel = Math.floor(prevXP / 100);
        const newLevel = Math.floor(newXP / 100);
        if (newLevel > prevLevel) {
            (attrs as any)[grant.attr] = Math.min(100, (attrs[grant.attr] as number) + 3);
        }
    }

    // 1. Process Actions
    let marketingBoost = 0;
    let techBoost = 0;
    let debtReduction = 0;
    let reliabilityBoost = 0;
    let innovationBoost = 0;
    let explicitMarketingSpend = 0;

    switch (action) {
        case "build_mvp_features":
            if (industry === "AI Startup") { techBoost = 7; metrics.innovation += 4; metrics.burn_rate += 1500; metrics.technical_debt += 15; }
            else if (industry === "E-commerce Brand") { techBoost = 5; metrics.innovation += 3; metrics.cash -= 5000; metrics.technical_debt += 8; }
            else { techBoost = 10; metrics.technical_debt += 12; metrics.burn_rate += 800; }
            break;
        case "refactor_core":
            if (industry === "AI Startup") { techBoost = 5; metrics.burn_rate -= 300; metrics.innovation += 5; debtReduction = 5; }
            else if (industry === "E-commerce Brand") { metrics.burn_rate -= 200; reliabilityBoost = 10; debtReduction = 5; }
            else { techBoost = 5; debtReduction = 10; reliabilityBoost = 5; metrics.burn_rate += 400; }
            break;
        case "fix_bugs":
            debtReduction = 20; reliabilityBoost = 15;
            if (industry === "AI Startup") attrs.reputation += 2;
            else if (industry === "E-commerce Brand") metrics.team_morale += 5;
            break;
        case "organic_social":
            if (industry === "E-commerce Brand") marketingBoost = 15;
            else if (industry === "AI Startup") marketingBoost = 10;
            else marketingBoost = 10;
            metrics.cash -= 500; explicitMarketingSpend += 500;
            break;
        case "paid_acquisition":
            if (industry === "E-commerce Brand") { marketingBoost = 25; metrics.cash -= 4000; explicitMarketingSpend += 4000; }
            else if (industry === "AI Startup") { marketingBoost = 12; metrics.cash -= 8000; explicitMarketingSpend += 8000; }
            else { marketingBoost = 18; metrics.cash -= 5000; explicitMarketingSpend += 5000; }
            break;
        case "pr_influencer":
            if (industry === "AI Startup") { innovationBoost = 8; attrs.reputation += 3; metrics.cash -= 5000; explicitMarketingSpend += 5000; }
            else if (industry === "E-commerce Brand") { marketingBoost = 15; metrics.brand_awareness += 10; metrics.cash -= 6000; explicitMarketingSpend += 6000; }
            else { marketingBoost = 10; attrs.reputation += 1; metrics.cash -= 3000; explicitMarketingSpend += 3000; }
            break;
        case "hire_engineer": metrics.engineers += 1; metrics.employees += 1; metrics.team_morale -= 5; break;
        case "hire_marketer": metrics.marketers += 1; metrics.employees += 1; metrics.team_morale -= 5; break;
        case "hire_sales": metrics.sales += 1; metrics.employees += 1; metrics.team_morale -= 5; break;
        case "pitch_investors":
            innovationBoost = -10;
            metrics.investor_pipeline.leads += Math.floor(10 + (attrs.networking / 5));
            metrics.burn_rate += 1000;
            metrics.founder_burnout = Math.min(100, (metrics.founder_burnout || 0) + 5);
            break;
        case "rest_and_recharge":
            metrics.founder_burnout = Math.max(0, (metrics.founder_burnout || 0) - 40);
            metrics.founder_health = Math.min(100, (metrics.founder_health || 100) + 15);
            metrics.sleep_quality = Math.min(100, (metrics.sleep_quality || 100) + 30);
            metrics.team_morale += 2; // Team happy to see founder rest
            break;
    }

    // 2. Department Power & Passive Metrics
    metrics.technical_debt = Math.max(0, metrics.technical_debt - debtReduction);
    metrics.reliability = Math.max(0, Math.min(100, (metrics.reliability || 80) + reliabilityBoost - (metrics.technical_debt / 10)));
    metrics.innovation = Math.max(0, Math.min(100, (metrics.innovation || 10) + innovationBoost));

    // Improved CXO Detection
    const employees = newStartup.employees || [];
    const cxoTeam: Record<string, boolean> = (startup as any).cxoTeam || {};
    const hasCTO = cxoTeam["CTO"] || employees.some(e => (e as any).role === "cto" || (e as any).role === "CTO" || (e as any).isCXO && (e as any).role === "cto");
    const hasCMO = cxoTeam["CMO"] || employees.some(e => (e as any).role === "cmo" || (e as any).role === "CMO" || (e as any).isCXO && (e as any).role === "cmo");
    const hasCOO = cxoTeam["COO"] || employees.some(e => (e as any).role === "coo" || (e as any).role === "COO" || (e as any).isCXO && (e as any).role === "coo");
    const hasCPO = cxoTeam["CPO"] || employees.some(e => (e as any).role === "cpo" || (e as any).role === "CPO" || (e as any).isCXO && (e as any).role === "cpo");
    const hasCFO = cxoTeam["CFO"] || employees.some(e => (e as any).role === "cfo" || (e as any).role === "CFO" || (e as any).isCXO && (e as any).role === "cfo");

    if (hasCTO) {
        metrics.technical_debt = Math.max(0, metrics.technical_debt - 5);
        techBoost += 3; // Boost product quality growth
    }
    if (hasCMO) {
        metrics.brand_awareness = Math.min(100, (metrics.brand_awareness || 0) + 5);
        marketingBoost += 10;
    }
    if (hasCOO) {
        metrics.founder_burnout = Math.max(0, (metrics.founder_burnout || 0) - 8);
        metrics.team_morale = Math.min(100, metrics.team_morale + 3);
    }
    if (hasCPO) {
        metrics.product_quality = Math.min(100, metrics.product_quality + 5);
        metrics.pmf_score = Math.min(100, metrics.pmf_score + 2);
    }

    const employeesLeft: any[] = [];
    let engineerPower = 0, marketerPower = 0, salesPower = 0, totalSalaries = 0;
    const turnoverRisk = Math.max(0, 110 - metrics.team_morale - (metrics.culture_score || 50)) / 100;

    employees.forEach(emp => {
        if (Math.random() < turnoverRisk) {
            if (emp.role === "engineer") metrics.engineers = Math.max(0, metrics.engineers - 1);
            if (emp.role === "marketer") metrics.marketers = Math.max(0, metrics.marketers - 1);
            if (emp.role === "sales") metrics.sales = Math.max(0, metrics.sales - 1);
            metrics.employees = Math.max(0, metrics.employees - 1);
        } else {
            employeesLeft.push(emp);
            const perfMult = emp.performance / 100;
            totalSalaries += emp.salary / 12;
            if (emp.role === "engineer") engineerPower += emp.skills.technical * perfMult;
            else if (emp.role === "marketer") marketerPower += emp.skills.marketing * perfMult;
            else if (emp.role === "sales") salesPower += emp.skills.sales * perfMult;
            else if ((emp as any).isCXO) {
                if (emp.role === "cto") engineerPower += 80;
                if (emp.role === "cmo") marketerPower += 80;
                if (emp.role === "coo") salesPower += 40;
            }
        }
    });

    // Total Department Power (Combining Founder + Team)
    // We treat founder attributes as the "baseline" power that scales with the team
    const totalTechPower = (attrs.technical_skill * 0.5) + (engineerPower * 0.8);
    const totalMarketingPower = (attrs.marketing_skill * 0.5) + (marketerPower * 0.8) + (attrs.networking * 0.3);
    const totalSalesPower = (attrs.sales_skill * 0.6) + (salesPower * 0.8) + (attrs.networking * 0.4);

    newStartup.employees = employeesLeft;
    const engCount = employeesLeft.filter((e: any) => e.role === "engineer").length;
    const mktCount = employeesLeft.filter((e: any) => e.role === "marketer").length;
    const teamEfficiency = metrics.team_morale / 100;

    if (engCount > 0) {
        const engPassiveDebtReduction = (engineerPower / engCount / 100) * engCount * 2 * teamEfficiency;
        metrics.technical_debt = Math.max(0, metrics.technical_debt - engPassiveDebtReduction);
    }
    if (mktCount > 0) {
        const mktPassiveBrand = (marketerPower / mktCount / 100) * mktCount * 3 * teamEfficiency;
        metrics.brand_awareness = Math.min(100, (metrics.brand_awareness || 0) + mktPassiveBrand);
    }

    if (engineerPower === 0) engineerPower = attrs.technical_skill / 30;
    if (marketerPower === 0) marketerPower = attrs.marketing_skill / 30;

    const engMult = 1 + (engineerPower * 0.004 * teamEfficiency);
    const mktMult = 1 + (marketerPower * 0.004 * teamEfficiency);
    const debtPenalty = Math.min(0.5, metrics.technical_debt / 100);
    const qualityIncrease = ((totalTechPower * 0.4) + (techBoost * 0.5)) / 10;
    metrics.product_quality = Math.min(100, metrics.product_quality + (qualityIncrease * (1 - debtPenalty)));

    // REALISM FIX: Reliability is strictly capped by Product Quality. 
    // You can't have a 10% quality product that is 80% reliable.
    const maxReliability = Math.max(5, Math.min(100, metrics.product_quality + 15 - (metrics.technical_debt / 10)));
    metrics.reliability = Math.max(0, Math.min(maxReliability, (metrics.reliability || 80) + reliabilityBoost));
    // Enforce the cap immediately
    if (metrics.reliability > maxReliability) metrics.reliability = maxReliability;

    // PLG focus on quality and viral loops reduces debt accumulation speed
    if (startup.gtm_motion === "PLG") {
        metrics.technical_debt = Math.max(0, metrics.technical_debt - (totalTechPower * 0.02));
    }

    // PMF Gain is now quality-dependent
    const pmfGain = metrics.users > 0 ? Math.min(0.8, (metrics.product_quality * 0.006) + (metrics.users > 100 ? 0.2 : 0)) : (metrics.product_quality > 30 ? 0.1 : 0);
    metrics.pmf_score = Math.max(0, Math.min(100, metrics.pmf_score + pmfGain - (action === "none" ? 0.5 : 0.1)));

    // --- SCENARIO RULES ---
    const scenario = SCENARIOS[(startup.scenario as ScenarioId) || "classic"];
    const scenarioRules = scenario?.rules || {};

    // --- FINANCIALS & HARD MODE BALANCE ---
    const monthsPassed = startup.history?.length || 0;
    // Dynamic Living Cost: scales with age and company growth (lifestyle creep) - REBALANCED
    const baseLivingCost = 3500;
    const ageAdjustment = monthsPassed * 75;
    const growthAdjustment = (startup.metrics.revenue || 0) * 0.02; // 2% of PREVIOUS month revenue as lifestyle spend
    const founderLivingCost = baseLivingCost + ageAdjustment + growthAdjustment;

    const userInfraCost = metrics.users * 0.75;
    const benefitsBudget = totalSalaries * 0.15;
    const scalingOverheadMult = 1 + (Math.floor((newStartup.employees?.length || 0) / 10) * 0.02);
    const salary = metrics.founder_salary || 0;
    let monthlyOpex = (totalSalaries + benefitsBudget + (metrics.burn_rate * 0.5) + founderLivingCost + userInfraCost + salary) * scalingOverheadMult;
    if (scenarioRules.burnMultiplier) monthlyOpex *= scenarioRules.burnMultiplier;
    if (cxoTeam["CFO"]) monthlyOpex *= 0.9;
    
    // Legacy Perk: Efficient Operations
    if (startup.unlocked_perks?.includes("efficient_ops")) {
        monthlyOpex *= 0.85;
    }

    // --- GROWTH & CONVERSION ENGINE ---
    const isPLG = startup.gtm_motion === "PLG";
    const isSLG = startup.gtm_motion === "SLG";

    const standardPrice = industry === "AI Startup" ? 49 : industry === "E-commerce Brand" ? 85 : 19;
    const price = metrics.pricing ?? standardPrice;
    metrics.pricing = price;
    const priceElasticity = price / standardPrice;

    const currentPrice = metrics.pricing || 0;
    const pricingConversionMult = currentPrice === 0 ? 2.5 : Math.max(0.01, 35 / (currentPrice + 10));
    const pmfMultiplier = Math.max(0.05, (metrics.pmf_score / 120));
    const annualBillingMult = metrics.annual_billing ? 0.70 : 1.0;
    
    // GTM specific multipliers
    const plgViralBonus = isPLG ? 1.25 : 1.0;
    const slgSalesBonus = isSLG ? 1.25 : 1.0;

    // Quality Penalty for Growth: People hate low-quality products
    const qualityGrowthMult = metrics.product_quality < 20 ? 0.3 : metrics.product_quality < 40 ? 0.7 : 1.0;

    const burnoutGrowthPenalty = metrics.founder_burnout > 50 ? (metrics.founder_burnout - 50) / 100 : 0;
    // --- MARKET DYNAMICS ---
    // Market cycle fluctuates every 18 months, with a bias towards headwinds in "hard mode"
    const marketCycle = Math.sin(monthsPassed / 3); 
    const marketSentiment = 0.85 + (marketCycle * 0.1); // Ranges 0.75 - 0.95 (tougher market)
    
    let growthRate = ((metrics.product_quality * 0.2 + (totalMarketingPower) * 0.5 + metrics.innovation * 0.2) / 400) * (1 - (metrics.reliability < 50 ? (50 - metrics.reliability) / 100 : 0)) * pmfMultiplier * pricingConversionMult * annualBillingMult * plgViralBonus * qualityGrowthMult * (1 - burnoutGrowthPenalty) * marketSentiment;
    
    // Legacy Perk: Growth Hacker
    if (startup.unlocked_perks?.includes("growth_hacker")) {
        growthRate *= 1.10;
    }
    
    metrics.growth_rate = growthRate;

    if (scenarioRules.fundingDifficulty && action === "pitch_investors") {
        metrics.investor_pipeline.leads = Math.floor(metrics.investor_pipeline.leads / scenarioRules.fundingDifficulty);
    }

    const initialUsers = startup.metrics.users || 0;
    let grossNewUsers = 0;
    if (currentPrice > 199 || isSLG) {
        if (!metrics.b2b_pipeline) metrics.b2b_pipeline = { leads: 0, active_deals: 0, closed_won: 0 };
        const pipelinePower = (totalSalesPower * 0.7) + (totalMarketingPower * 0.3);
        let newLeads = 0;
        
        // solo founders with low marketing skills should get near-zero leads initially
        if (pipelinePower < 15 && metrics.users < 10) {
            newLeads = Math.random() < 0.1 ? 1 : 0; // Very rare 1-lead chance
        } else {
            newLeads = Math.floor(metrics.users === 0 ? (pipelinePower / 25) * growthRate * 120 : metrics.users * (growthRate * 0.45 * (pipelinePower / 60)));
        }
        
        // SLG strategy gets more consistent lead flow but still relies on power
        if (isSLG && newLeads < 1 && pipelinePower > 30) newLeads += 1;

        metrics.b2b_pipeline.leads += newLeads;
        const toActive = Math.floor(metrics.b2b_pipeline.leads * 0.1 * (totalSalesPower / 60));
        metrics.b2b_pipeline.leads -= toActive;
        metrics.b2b_pipeline.active_deals += toActive;
        // Win rate is now heavily dependent on Quality and Sales Power
        const qualityWinMult = metrics.product_quality / 100;
        const winRate = Math.min(0.5, (0.05 + (qualityWinMult * 0.2) + (totalSalesPower * 0.004)) * slgSalesBonus);
        const toClosed = Math.floor(metrics.b2b_pipeline.active_deals * winRate);
        metrics.b2b_pipeline.active_deals -= toClosed;
        metrics.b2b_pipeline.closed_won = toClosed;
        grossNewUsers = toClosed;
        metrics.users += grossNewUsers;
    } else {
        if (metrics.users === 0 && metrics.product_quality > 40) {
            grossNewUsers = Math.max(1, Math.floor(growthRate * 8));
            metrics.users += grossNewUsers;
        } else if (metrics.users > 0) {
            const rawNewUsers = Math.floor(metrics.users * (growthRate * 0.12 * (1 + (salesPower * 0.006))));
            grossNewUsers = Math.min(rawNewUsers, Math.floor(metrics.users * 0.08));
            metrics.users += grossNewUsers;
        }
    }

    const isSubscription = ["Tech SaaS", "SaaS Platform", "AI Platform", "AI Startup", "OTT / Streaming", "EdTech", "Dev Tools"].includes(industry);
    const isTransactional = ["Marketplace", "E-commerce Brand"].includes(industry);
    const isMobileGame = industry === "Mobile Game";
    const isFinTech = industry === "FinTech" || industry === "FinTech App";

    let monthlyRevenue = 0, monthlyCogs = 0;
    // --- OVERHAULED INDUSTRY MONETIZATION ---
    if (industry === "Mobile Game") {
        const isPLG = startup.gtm_motion === "PLG";
        if (isPLG) {
            const adsFreq = (metrics as any).ad_intensity || 0;
            const iapPrice = metrics.pricing || 0;
            const adRevenue = metrics.users * (adsFreq / 100) * 0.15;
            const iapRevenue = metrics.users * 0.03 * iapPrice;
            monthlyRevenue = adRevenue + iapRevenue;
        } else {
            // SLG (Branded IP sponsorship): Revenue scales off Contract size ($)
            monthlyRevenue = (metrics.b2b_pipeline?.closed_won || 0) * price;
        }
        monthlyCogs = monthlyRevenue * 0.05; 
    } else if (industry === "AI Platform" || industry === "AI Startup") {
        monthlyRevenue = metrics.users * price; 
        monthlyCogs = monthlyRevenue * 0.35; // high GPU COGS
    } else if (industry === "FinTech" || industry === "FinTech App") {
        // Interchange volume math: $200 volume per user average
        const txVolume = metrics.users * 200; 
        monthlyRevenue = txVolume * (price / 100); 
        monthlyCogs = monthlyRevenue * 0.20;
    } else if (industry === "Marketplace") {
        const gmv = metrics.users * 150; 
        monthlyRevenue = gmv * (price / 100);
        monthlyCogs = monthlyRevenue * 0.15;
    } else {
        // Default SaaS / Subscriptions (OTT, EdTech, Dev Tools)
        monthlyRevenue = metrics.users * price;
        monthlyCogs = monthlyRevenue * 0.15;
        if (priceElasticity > (metrics.product_quality / 100) * 1.5) {
            metrics.users -= Math.floor(metrics.users * 0.03 * (priceElasticity - 0.5));
        }
    }

    metrics.revenue = monthlyRevenue;
    metrics.cogs = monthlyCogs;
    metrics.opex = monthlyOpex;
    metrics.net_profit = monthlyRevenue - monthlyCogs - monthlyOpex;
    metrics.cash += metrics.net_profit;
    if (metrics.annual_billing && grossNewUsers > 0) metrics.cash += (grossNewUsers * price * 11);

    const actualNetBurn = -metrics.net_profit;
    metrics.burn_rate = actualNetBurn > 0 ? actualNetBurn : 0;
    metrics.runway = actualNetBurn > 0 ? Math.floor(metrics.cash / actualNetBurn) : 99;

    // --- CHURN & QUALITY GAP ---
    let baseChurn = currentPrice === 0 ? 0.04 : Math.min(0.35, 0.08 + (currentPrice / 150) * 0.15);
    if (metrics.annual_billing) baseChurn *= 0.4;

    if (metrics.users > 0) {
        let currentChurn = baseChurn;
        const monthsActive = startup.history?.length || 0;
        const expectedQuality = Math.min(85, 20 + (monthsActive * 1.5));
        if (metrics.product_quality < expectedQuality) currentChurn += (expectedQuality - metrics.product_quality) / 500;
        if (metrics.pmf_score < 45) currentChurn += 0.08 * ((45 - metrics.pmf_score) / 45);
        if (scenarioRules.churnMultiplier) currentChurn *= scenarioRules.churnMultiplier;
        metrics.users = Math.max(0, metrics.users - Math.floor(metrics.users * currentChurn * (1 - (metrics.product_quality / 250))));
    }

    // --- PRODUCT DEBT GROWTH (SCENARIO) ---
    if (scenarioRules.techDebtGrowthMultiplier && (action === "build_mvp_features")) {
        // Additional debt from aggressive building in AI Rush etc.
        metrics.technical_debt += (10 * (scenarioRules.techDebtGrowthMultiplier - 1));
    }

    // --- FOUNDER STATS ---
    const burnoutPenalty = metrics.founder_burnout > 60 ? (metrics.founder_burnout - 60) / 40 : 0;
    if (burnoutPenalty > 0) {
        metrics.team_morale = Math.max(0, metrics.team_morale - Math.floor(burnoutPenalty * 5));
        metrics.product_quality = Math.max(0, metrics.product_quality - Math.floor(burnoutPenalty * 2));
    }
    metrics.founder_health = Math.max(0, Math.min(100, (metrics.founder_health || 100) - (metrics.founder_burnout > 60 ? 3 : 0) + (action === "none" ? 5 : 0)));

    // Update Personal Wealth
    if (metrics.cash > 0) {
        founder.personal_wealth = (founder.personal_wealth || 0) + (metrics.founder_salary || 0);
    } else if ((metrics.founder_salary || 0) > 0) {
        notices.push("The company is out of cash! You couldn't draw a salary this month.");
    }

    // --- HISTORY & VALUATION ---
    newStartup.history = [...(startup.history || []), {
        month: (startup.history?.length || 0) + 1,
        revenue: monthlyRevenue,
        cogs: monthlyCogs,
        grossProfit: monthlyRevenue - monthlyCogs,
        opex: monthlyOpex,
        netIncome: metrics.net_profit
    }];

    // --- VALUATION MODEL (REFINED) ---
    // Base Multiple: 6x to 12x ARR depending on Growth and PMF
    const annualRevenue = monthlyRevenue * 12;
    const baseMultiple = 6 + (Math.min(0.25, metrics.growth_rate) * 20) + (metrics.pmf_score / 25);
    const growthPenalty = metrics.growth_rate < 0 ? 0.5 : metrics.growth_rate < 0.05 ? 0.8 : 1.0;
    
    // Quality reflects technical value/IP
    const qualityPremium = 1 + (metrics.product_quality / 100);

    // Baseline: Floor of $500k or ARR * Multiple
    const arrValuation = (annualRevenue * baseMultiple * growthPenalty);
    
    // User-based floor for pre-revenue
    const userValuation = metrics.users * 40 * (1 + metrics.pmf_score / 100);

    let finalValuation = Math.max(500000, arrValuation, userValuation) * qualityPremium;

    // Elite Growth Premium (Unicorn Path) - Only for significant revenue
    if (annualRevenue > 2000000 && metrics.growth_rate > 0.15 && metrics.pmf_score > 60) {
        finalValuation *= 1.3;
    }

    newStartup.valuation = Math.floor(finalValuation);

    // --- SKILL ATROPHY & MAINTENANCE (Use it or Lose it!) ---
    const actionCategories: Record<string, string[]> = {
        technical: ["build_mvp_features", "refactor_core", "fix_bugs"],
        marketing: ["organic_social", "paid_acquisition", "pr_influencer"],
        leadership: ["hire_engineer", "hire_marketer", "hire_sales", "pitch_investors"]
    };

    const isTechAction = actionCategories.technical.includes(action);
    const isMktAction = actionCategories.marketing.includes(action);
    const isLeadAction = actionCategories.leadership.includes(action);

    // Founder Atrophy
    const decayRate = 0.8;
    const background = founder.background;
    
    // Muscle Memory Floors: Reduced for more challenge
    const techFloor = background === "Engineer" ? 30 : 5;
    const mktFloor = background === "MBA" || background === "Hustler" ? 30 : 5;
    const leadershipFloor = background === "MBA" || background === "Serial Founder" ? 30 : 5;

    if (!isTechAction && !hasCTO) {
        attrs.technical_skill = Math.max(techFloor, attrs.technical_skill - decayRate);
    }
    if (!isMktAction && !hasCMO) {
        attrs.marketing_skill = Math.max(mktFloor, attrs.marketing_skill - decayRate);
    }
    if (!isMktAction && !hasCOO && !isLeadAction) {
        attrs.sales_skill = Math.max(10, attrs.sales_skill - decayRate);
    }
    if (!isLeadAction && !hasCOO) {
        attrs.leadership = Math.max(leadershipFloor, attrs.leadership - decayRate);
    }

    // Employee Skill Decay (if department is neglected) & Salary Stagnation
    newStartup.employees = newStartup.employees.map(emp => {
        let skillDecay = 0;
        let moraleDecay = 1; // Base monthly morale decay (natural entropy)

        if (emp.role === "engineer" && !isTechAction && !hasCTO) skillDecay = 0.3;
        if (emp.role === "marketer" && !isMktAction && !hasCMO) skillDecay = 0.3;
        if (emp.role === "sales" && !isMktAction && !hasCOO) skillDecay = 0.3;

        // Salary Stagnation Logic
        const monthsSinceIncrement = monthsPassed - (emp.last_increment_at ?? emp.joined_at);
        if (monthsSinceIncrement > 12) {
            // Accelerated decay for long-term neglect
            skillDecay += (monthsSinceIncrement - 12) * 0.1;
            moraleDecay += (monthsSinceIncrement - 12) * 0.5; // Morale drops faster when ignored
            
            if (monthsSinceIncrement === 13 || monthsSinceIncrement % 6 === 0) {
                notices.push(`Retention: ${emp.name} is dissatisfied with their salary (no raise in ${monthsSinceIncrement}mo).`);
            }
        }

        // Global Morale influence (peer pressure/company culture)
        if (metrics.team_morale < 50) moraleDecay += 1.5;
        if (metrics.team_morale > 85) moraleDecay -= 1.0;

        const newMorale = Math.max(0, Math.min(100, (emp.morale ?? 70) - moraleDecay));
        
        // Morale Performance Penalty: Low morale kills performance
        if (newMorale < 40) skillDecay += 0.5;
        if (newMorale < 20) skillDecay += 1.0;

        return {
            ...emp,
            performance: Math.max(10, emp.performance - skillDecay),
            morale: newMorale,
            skills: {
                technical: Math.max(0, emp.skills.technical - (emp.role === "engineer" ? skillDecay : 0)),
                marketing: Math.max(0, emp.skills.marketing - (emp.role === "marketer" ? skillDecay : 0)),
                sales: Math.max(0, emp.skills.sales - (emp.role === "sales" ? skillDecay : 0)),
            }
        };
    });

    return { newStartup, notices };
}

/**
 * Boards are dynamic. They are composed of Founders, CXOs, and Investors.
 */
export function getBoardMembers(startup: Startup): BoardMember[] {
    const members: BoardMember[] = [];
    
    // 1. Main Founder
    members.push({
        id: "founder-main",
        name: "You (Founder)",
        type: "Founder",
        equityWeight: (startup.capTable || []).find(e => e.type === "Founder")?.equity || 100,
        avatar: "👤"
    });

    // 2. Co-Founders (other Founder entries in cap table)
    (startup.capTable || []).forEach((e, idx) => {
        if (e.type === "Founder" && e.name !== "Founder") {
            members.push({
                id: `cofounder-${idx}`,
                name: e.name,
                type: "Co-Founder",
                equityWeight: e.equity,
                avatar: "👥"
            });
        }
    });

    // 3. Investors
    (startup.capTable || []).forEach((e, idx) => {
        if (e.type === "Investor") {
            members.push({
                id: `investor-${idx}`,
                name: e.name,
                type: "Investor",
                equityWeight: e.equity,
                avatar: "💰"
            });
        }
    });

    return members;
}

export function evaluateSalaryProposal(startup: Startup, founder: Founder, amount: number): SalaryProposal {
    const members = getBoardMembers(startup);
    const m = startup.metrics;
    const runway = m.runway;
    const isProfitable = (m.net_profit || 0) > 0;
    const currentSalary = m.founder_salary || 0;
    const increase = amount - currentSalary;
    
    const votes: SalaryProposal["votes"] = [];

    members.forEach(member => {
        let yesProb = 50; // Base probability

        if (member.type === "Founder") {
            yesProb = amount > 200000 ? 70 : 95; // Founders usually want more money unless it's insane
        } else if (member.type === "Co-Founder") {
            yesProb = 80;
            if (runway < 6) yesProb -= 40;
            if (increase > 5000) yesProb -= 20;
        } else if (member.type === "Investor") {
            yesProb = 40;
            if (runway < 12) yesProb -= 20;
            if (runway < 6) yesProb -= 50;
            if (amount > 15000) yesProb -= 30;
            if (amount > 25000) yesProb -= 50;
            if (isProfitable) yesProb += 40;
            if (m.growth_rate > 0.2) yesProb += 20;
        }

        const votedYes = Math.random() * 100 < yesProb;
        votes.push({
            memberId: member.id,
            vote: votedYes ? "yes" : "no",
            reason: getVoteReason(member.type, votedYes, runway, isProfitable, amount)
        });
    });

    // Weighted voting
    const totalWeight = members.reduce((acc, mem) => acc + mem.equityWeight, 0);
    const yesWeight = votes.reduce((acc, v, idx) => v.vote === "yes" ? acc + members[idx].equityWeight : acc, 0);
    
    const approved = yesWeight > totalWeight / 2;

    return {
        amount,
        proposed_month: 0, // Should be set by caller
        status: approved ? "approved" : "rejected",
        votes
    };
}

function getVoteReason(type: string, votedYes: boolean, runway: number, isProfitable: boolean, amount: number): string {
    if (votedYes) {
        if (type === "Founder") return "I deserve a fair share of the value I'm creating.";
        if (isProfitable) return "The company is profitable; we should reward the founder.";
        if (amount < 10000) return "This is a reasonable management salary for our stage.";
        return "The founder's commitment is essential for our continued growth.";
    } else {
        if (runway < 6) return "We don't have enough runway to support this increase.";
        if (amount > 20000) return "This salary is significantly above market for a startup at our stage.";
        return "We need to preserve cash for growth and hiring.";
    }
}
