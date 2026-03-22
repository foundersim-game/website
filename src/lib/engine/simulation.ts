import { Founder, Startup, BoardMember, SalaryProposal, CapTableEntry } from "../types/database.types";
import { SCENARIOS, ScenarioId } from "./legacy";

export interface PricingConfigNode {
    maxPrice: number;
    label: string;
    unit: string;
    sliders?: { key: string; label: string; min: number; max: number; step: number; unit: string }[];
    calc: (p: number, m: any) => { conversion: number; churn: number; loopPower: number };
    salesRoleName: string;
    salesRoleDescription: string;
}

export type IndustryConfig = {
    PLG: PricingConfigNode;
    SLG: PricingConfigNode;
};

export function getPricingScale(industry: string, gtm_motion: "PLG" | "SLG"): number {
    const config = INDUSTRY_PRICING_CONFIG[industry] || INDUSTRY_PRICING_CONFIG["SaaS Platform"];
    const modeConfig = config[gtm_motion] || config.PLG;
    const price = modeConfig.maxPrice > 0 ? modeConfig.maxPrice : 3;
    return 30 / price;
}

export const INDUSTRY_PRICING_CONFIG: Record<string, IndustryConfig> = {
    "SaaS Platform": {
        PLG: {
            maxPrice: 300, label: "Self-Serve Price", unit: "/ mo",
            calc: (p) => {
                return {
                    conversion: p === 0 ? 5.0 : Math.max(0.1, 50 / (p + 15)),
                    churn: p === 0 ? 0.01 : Math.min(0.15, 0.03 + (p / 200) * 0.05),
                    loopPower: p === 0 ? 6 : Math.max(1, (300 - p) / 50)
                };
            },
            salesRoleName: "Growth Specialist",
            salesRoleDescription: "New User Conversions · Self-Serve Revenue"
        },
        SLG: {
            maxPrice: 5000, label: "Enterprise Retainer", unit: "/ mo",
            calc: (p) => {
                return {
                    conversion: Math.max(0.01, 20 / (p/100 + 10)),
                    churn: Math.min(0.05, 0.015 + (p / 5000) * 0.01),
                    loopPower: 1.5
                };
            },
            salesRoleName: "Account Executive",
            salesRoleDescription: "B2B Pipeline Win Rate · Enterprise Contracts"
        }
    },
    "AI Platform": {
        PLG: {
            maxPrice: 50, label: "Token Bundle Price", unit: "/ 10k",
            calc: (p) => {
                return {
                    conversion: p === 0 ? 6.0 : Math.max(0.5, 30 / (p + 5)),
                    churn: 0.05 + (p / 50) * 0.08,
                    loopPower: 8
                };
            },
            salesRoleName: "DevRel / Growth",
            salesRoleDescription: "Developer Adoption · Token Usage Optimization"
        },
        SLG: {
            maxPrice: 10000, label: "Enterprise Solution", unit: " value",
            calc: (p) => ({ 
                conversion: Math.max(0.01, 15 / (p/100 + 10)),
                churn: 0.015,
                loopPower: 2 
            }),
            salesRoleName: "Solutions Architect",
            salesRoleDescription: "Enterprise API Integration · Custom Solutions"
        }
    },
    "OTT / Streaming": {
        PLG: {
            maxPrice: 30, label: "Sub Price", unit: "/ mo",
            calc: (p) => {
                return { 
                    conversion: p === 0 ? 8.0 : Math.max(0.1, 80 / (p * 2 + 5)),
                    churn: Math.min(0.20, 0.04 + (p / 30) * 0.08),
                    loopPower: 5 
                };
            },
            salesRoleName: "Acquisition Manager",
            salesRoleDescription: "Subscriber Growth · Trial Conversions"
        },
        SLG: {
            maxPrice: 50000, label: "Content License Price", unit: " deal",
            calc: (p) => ({ 
                conversion: Math.max(0.01, 10 / (p/1000 + 5)),
                churn: 0.01,
                loopPower: 0.5 
            }),
            salesRoleName: "Content Partnership",
            salesRoleDescription: "Licensing Deals · Distribution Expansion"
        }
    },
    "Mobile Game": {
        PLG: {
            maxPrice: 20, label: "IAP Item Size", unit: " scale",
            sliders: [{ key: "ad_intensity", label: "Ad Frequency", min: 0, max: 100, step: 1, unit: "%" }],
            calc: (p, m) => {
                const ads = m.ad_intensity || 0;
                return {
                    conversion: p === 0 ? 10.0 : Math.max(0.1, 15 / (p + 5)),
                    churn: 0.12 + (ads / 100) * 0.15 + (p / 20) * 0.05,
                    loopPower: 10 - (ads / 20)
                };
            },
            salesRoleName: "Monetization Manager",
            salesRoleDescription: "IAP Conversions · Ad Revenue Optimization"
        },
        SLG: {
            maxPrice: 5000, label: "Engine License Fee", unit: "/ mo",
            calc: (p) => {
                const convMult = 10 / (p/100 + 5); 
                return {
                    conversion: Math.max(0.01, convMult),
                    churn: 0.02, 
                    loopPower: 3 
                };
            },
            salesRoleName: "Ad Network Sales",
            salesRoleDescription: "DSP/SSP Partnerships · Brand Deal Acquisition"
        }
    },
    "FinTech": {
        PLG: {
            maxPrice: 5, label: "% Interchange Fee", unit: "%",
            calc: (p) => {
                return { 
                    conversion: p === 0 ? 6.0 : Math.max(0.01, 4.0 / (p + 1)),
                    churn: p > 2.9 ? 0.08 + (p-2.9) * 0.1 : 0.02, 
                    loopPower: 4 
                };
            },
            salesRoleName: "Conversion Analyst",
            salesRoleDescription: "User Activation · Transaction Volume"
        },
        SLG: {
            maxPrice: 5000, label: "Infra Sub", unit: "/ mo",
            calc: (p) => ({ 
                conversion: Math.max(0.01, 15 / (p/100 + 10)),
                churn: 0.01,
                loopPower: 1 
            }),
            salesRoleName: "Partnership Manager",
            salesRoleDescription: "Bank Partnerships · Institutional Onboarding"
        }
    },
    "EdTech": {
        PLG: {
            maxPrice: 100, label: "Course Ticket", unit: " avg",
            calc: (p) => {
                return { 
                    conversion: p === 0 ? 4.0 : Math.max(0.1, 30 / (p + 10)),
                    churn: 0.08 + (p / 100) * 0.05, 
                    loopPower: 3 
                };
            },
            salesRoleName: "Learning Consultant",
            salesRoleDescription: "Course Enrollment · Student Success"
        },
        SLG: {
            maxPrice: 200, label: "Per Seat/yr", unit: " avg",
            calc: (p) => ({ 
                conversion: Math.max(0.01, 10 / (p/10 + 5)),
                churn: 0.02,
                loopPower: 2 
            }),
            salesRoleName: "Institutional Sales",
            salesRoleDescription: "School District Deals · University Partnerships"
        }
    },
    "Dev Tools": {
        PLG: {
            maxPrice: 100, label: "Paid Tier", unit: "/ mo",
            calc: (p) => {
                return { 
                    conversion: p === 0 ? 5.0 : Math.max(0.1, 40 / (p + 10)),
                    churn: 0.02 + (p / 100) * 0.03,
                    loopPower: 8
                };
            },
            salesRoleName: "Developer Advocate",
            salesRoleDescription: "Community Growth · Open Source Conversion"
        },
        SLG: {
            maxPrice: 1000, label: "Enterprise SSO Package", unit: "/ mo",
            calc: (p) => ({ 
                conversion: Math.max(0.01, 15 / (p/50 + 5)),
                churn: 0.015, 
                loopPower: 3 
            }),
            salesRoleName: "Enterprise Sales",
            salesRoleDescription: "Security/Compliance Deals · SSO Upsells"
        }
    },
    "Marketplace": {
        PLG: {
            maxPrice: 15, label: "Take Rate", unit: "%",
            calc: (p) => {
                return { 
                    conversion: p === 0 ? 8.0 : Math.max(0.01, 10.0 / (p + 2)),
                    churn: p > 15 ? 0.08 : 0.04,
                    loopPower: 6
                };
            },
            salesRoleName: "Supply Growth",
            salesRoleDescription: "Vendor Onboarding · GMV Optimization"
        },
        SLG: {
            maxPrice: 500, label: "Supplier Retainer", unit: "/ mo",
            calc: (p) => ({ 
                conversion: Math.max(0.01, 10 / (p/25 + 5)),
                churn: 0.04,
                loopPower: 1 
            }),
            salesRoleName: "Merchant Success",
            salesRoleDescription: "Enterprise Merchant Support · Retainer Deals"
        }
    }
};

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
    | "negotiate_round"
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
            if (industry === "AI Platform") { techBoost = 7; metrics.innovation += 4; metrics.burn_rate += 1500; metrics.technical_debt += 15; }
            else if (industry === "Mobile Game") { techBoost = 5; metrics.innovation += 3; metrics.cash -= 3000; metrics.technical_debt += 8; }
            else if (industry === "SaaS Platform") { techBoost = 10; metrics.technical_debt += 12; metrics.burn_rate += 800; }
            else if (industry === "Dev Tools") { techBoost = 12; metrics.technical_debt += 10; metrics.innovation += 2; metrics.burn_rate += 600; }
            else if (industry === "FinTech App") { techBoost = 8; metrics.technical_debt += 14; metrics.burn_rate += 1000; } // Compliance overhead
            else if (industry === "EdTech") { techBoost = 7; metrics.technical_debt += 8; metrics.burn_rate += 500; }
            else if (industry === "OTT / Streaming") { techBoost = 6; metrics.technical_debt += 10; metrics.burn_rate += 1200; } // CDN infra costs
            else if (industry === "Marketplace") { techBoost = 8; metrics.technical_debt += 11; metrics.burn_rate += 700; }
            else { techBoost = 10; metrics.technical_debt += 12; metrics.burn_rate += 800; }
            break;

        case "refactor_core":
            if (industry === "AI Platform") { techBoost = 5; metrics.burn_rate -= 300; metrics.innovation += 5; debtReduction = 5; }
            else if (industry === "Dev Tools") { metrics.burn_rate -= 200; reliabilityBoost = 10; debtReduction = 5; }
            else if (industry === "SaaS Platform") { techBoost = 5; debtReduction = 10; reliabilityBoost = 5; metrics.burn_rate += 400; }
            else if (industry === "FinTech App") { debtReduction = 12; reliabilityBoost = 12; metrics.burn_rate += 200; } // Compliance-grade refactor has real upside
            else if (industry === "Mobile Game") { debtReduction = 8; reliabilityBoost = 6; metrics.burn_rate += 300; }
            else if (industry === "EdTech") { debtReduction = 9; reliabilityBoost = 7; metrics.burn_rate += 350; }
            else if (industry === "OTT / Streaming") { debtReduction = 7; reliabilityBoost = 8; metrics.burn_rate -= 100; } // CDN optimization reduces costs
            else if (industry === "Marketplace") { debtReduction = 10; reliabilityBoost = 6; metrics.burn_rate += 400; }
            else { techBoost = 5; debtReduction = 10; reliabilityBoost = 5; metrics.burn_rate += 400; }
            break;

        case "fix_bugs":
            debtReduction = 20; reliabilityBoost = 15;
            if (industry === "AI Platform") { attrs.reputation += 2; debtReduction = 18; }
            else if (industry === "Dev Tools") { metrics.team_morale += 5; reliabilityBoost = 18; } // Dev Tools users are power users who care deeply
            else if (industry === "FinTech App") { reliabilityBoost = 20; attrs.reputation += 3; } // Bugs in FinTech = trust disaster
            else if (industry === "SaaS Platform") { metrics.team_morale += 3; }
            else if (industry === "Mobile Game") { metrics.team_morale += 2; debtReduction = 15; } // Gamers churn fast on bugs
            else if (industry === "EdTech") { attrs.reputation += 1; debtReduction = 18; }
            else if (industry === "OTT / Streaming") { reliabilityBoost = 18; attrs.reputation += 1; } // Buffering = instant churn
            else if (industry === "Marketplace") { metrics.team_morale += 2; reliabilityBoost = 16; }
            break;

        case "organic_social":
            if (industry === "OTT / Streaming") { marketingBoost = 15; metrics.brand_awareness += 3; } // Content is viral
            else if (industry === "AI Platform") { marketingBoost = 10; metrics.innovation += 1; }
            else if (industry === "Mobile Game") { marketingBoost = 18; } // Clips + memes = massive viral reach
            else if (industry === "EdTech") { marketingBoost = 12; attrs.reputation += 1; } // Testimonials and learning wins
            else if (industry === "Marketplace") { marketingBoost = 13; metrics.brand_awareness += 2; }
            else if (industry === "SaaS Platform") { marketingBoost = 10; }
            else if (industry === "Dev Tools") { marketingBoost = 14; } // Dev social (Twitter/X, HN, Reddit) is high ROI
            else if (industry === "FinTech App") { marketingBoost = 9; attrs.reputation += 1; } // Trust-driven word of mouth
            else { marketingBoost = 10; }
            metrics.cash -= 500; explicitMarketingSpend += 500;
            break;

        case "paid_acquisition":
            if (industry === "Marketplace") { marketingBoost = 25; metrics.cash -= 4000; explicitMarketingSpend += 4000; }
            else if (industry === "AI Platform") { marketingBoost = 12; metrics.cash -= 8000; explicitMarketingSpend += 8000; } // High CPC in AI space
            else if (industry === "Mobile Game") { marketingBoost = 22; metrics.cash -= 6000; explicitMarketingSpend += 6000; } // App install ads are effective
            else if (industry === "OTT / Streaming") { marketingBoost = 20; metrics.cash -= 7000; explicitMarketingSpend += 7000; }
            else if (industry === "EdTech") { marketingBoost = 16; metrics.cash -= 4500; explicitMarketingSpend += 4500; }
            else if (industry === "SaaS Platform") { marketingBoost = 18; metrics.cash -= 5000; explicitMarketingSpend += 5000; }
            else if (industry === "Dev Tools") { marketingBoost = 14; metrics.cash -= 3000; explicitMarketingSpend += 3000; } // Dev-targeted ads are cheaper
            else if (industry === "FinTech App") { marketingBoost = 15; metrics.cash -= 5500; explicitMarketingSpend += 5500; } // Referral + performance ads
            else { marketingBoost = 18; metrics.cash -= 5000; explicitMarketingSpend += 5000; }
            break;

        case "pr_influencer":
            if (industry === "AI Platform") { innovationBoost = 8; attrs.reputation += 3; metrics.cash -= 5000; explicitMarketingSpend += 5000; }
            else if (industry === "OTT / Streaming") { marketingBoost = 15; metrics.brand_awareness += 10; metrics.cash -= 6000; explicitMarketingSpend += 6000; }
            else if (industry === "Mobile Game") { marketingBoost = 18; metrics.brand_awareness += 8; metrics.cash -= 4000; explicitMarketingSpend += 4000; } // Streamers & gaming influencers
            else if (industry === "EdTech") { marketingBoost = 12; attrs.reputation += 2; metrics.cash -= 3500; explicitMarketingSpend += 3500; } // Educator influencers
            else if (industry === "SaaS Platform") { marketingBoost = 10; attrs.reputation += 1; metrics.cash -= 3000; explicitMarketingSpend += 3000; }
            else if (industry === "Marketplace") { marketingBoost = 13; metrics.brand_awareness += 5; metrics.cash -= 3500; explicitMarketingSpend += 3500; }
            else if (industry === "Dev Tools") { marketingBoost = 11; attrs.reputation += 2; metrics.cash -= 2500; explicitMarketingSpend += 2500; } // Dev evangelists are cheap & trusted
            else if (industry === "FinTech App") { marketingBoost = 10; attrs.reputation += 2; metrics.cash -= 4000; explicitMarketingSpend += 4000; } // Finance YouTubers
            else { marketingBoost = 10; attrs.reputation += 1; metrics.cash -= 3000; explicitMarketingSpend += 3000; }
            break;
        case "hire_engineer": metrics.engineers += 1; metrics.employees += 1; metrics.team_morale -= 5; break;
        case "hire_marketer": metrics.marketers += 1; metrics.employees += 1; metrics.team_morale -= 5; break;
        case "hire_sales": metrics.sales += 1; metrics.employees += 1; metrics.team_morale -= 5; break;
        case "pitch_investors":
            // Pitching is now handled as an instant action in page.tsx 
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
            const monthsPassed = startup.history?.length || 0;
            const monthsEmployed = Math.max(0, monthsPassed - (emp.joined_at || 0));
            
            let vestedEquity = 0;
            if (monthsEmployed >= 12) { // 1-year cliff
                vestedEquity = Math.min(emp.equity || 0, (monthsEmployed / 48) * (emp.equity || 0));
            }
            
            const returnedEquity = Math.max(0, (emp.equity || 0) - vestedEquity);
            if (returnedEquity > 0) {
                metrics.option_pool = (metrics.option_pool || 0) + returnedEquity;
            }
            if (vestedEquity > 0) {
                metrics.former_employee_equity = (metrics.former_employee_equity || 0) + vestedEquity;
            }

            notices.push(`🚨 ${emp.name} (${emp.role}) resigned due to low team morale. ${returnedEquity > 0 ? `${returnedEquity.toFixed(2)}% unvested equity returned to pool.` : ""}`);

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

    const configRef = INDUSTRY_PRICING_CONFIG[industry] || INDUSTRY_PRICING_CONFIG["SaaS Platform"];
    const activeConfig = isPLG ? configRef.PLG : configRef.SLG;

    const currentPrice = metrics.pricing ?? (isPLG ? activeConfig.maxPrice * 0.1 : activeConfig.maxPrice * 0.5);
    metrics.pricing = Math.min(currentPrice, activeConfig.maxPrice);

    // Fetch real math from config
    const { conversion: configConversion, churn: configChurn, loopPower } = activeConfig.calc(metrics.pricing, metrics);

    // Div by 2 to match original balance format where ~2.5 was standard PLG multiplier
    const pricingConversionMult = configConversion / 2;
    const pmfMultiplier = Math.max(0.05, (metrics.pmf_score / 120));
    const annualBillingMult = metrics.annual_billing ? 0.70 : 1.0;
    
    // Virality (loopPower) directly enhances organic baseline growth
    const viralBonus = 1 + (loopPower * 0.05);

    // Quality Penalty for Growth: People hate low-quality products
    const qualityGrowthMult = metrics.product_quality < 20 ? 0.3 : metrics.product_quality < 40 ? 0.7 : 1.0;

    const burnoutGrowthPenalty = metrics.founder_burnout > 50 ? (metrics.founder_burnout - 50) / 100 : 0;
    // --- MARKET DYNAMICS ---
    const marketCycle = Math.sin(monthsPassed / 3); 
    const marketSentiment = 0.85 + (marketCycle * 0.1); 
    
    let growthRate = ((metrics.product_quality * 0.2 + (totalMarketingPower) * 0.5 + metrics.innovation * 0.2) / 400) * (1 - (metrics.reliability < 50 ? (50 - metrics.reliability) / 100 : 0)) * pmfMultiplier * pricingConversionMult * annualBillingMult * viralBonus * qualityGrowthMult * (1 - burnoutGrowthPenalty) * marketSentiment;
    
    if (startup.unlocked_perks?.includes("growth_hacker")) {
        growthRate *= 1.10;
    }
    metrics.growth_rate = growthRate;

    if (scenarioRules.fundingDifficulty && action === "pitch_investors") {
        metrics.investor_pipeline.leads = Math.floor(metrics.investor_pipeline.leads / scenarioRules.fundingDifficulty);
    }

    const initialUsers = startup.metrics.users || 0;
    let grossNewUsers = 0;
    if (isSLG) {
        if (!metrics.b2b_pipeline) metrics.b2b_pipeline = { leads: 0, active_deals: 0, closed_won: 0 };
        const pipelinePower = (totalSalesPower * 0.7) + (totalMarketingPower * 0.3);
        let newLeads = 0;
        
        if (pipelinePower < 15 && metrics.users < 10) {
            newLeads = Math.random() < 0.1 ? 1 : 0;
        } else {
            newLeads = Math.floor(metrics.users === 0 ? (pipelinePower / 25) * growthRate * 120 : metrics.users * (growthRate * 0.45 * (pipelinePower / 60)));
        }
        
        if (newLeads < 1 && pipelinePower > 30) newLeads += 1;

        metrics.b2b_pipeline.leads += newLeads;
        const toActive = Math.floor(metrics.b2b_pipeline.leads * 0.1 * (totalSalesPower / 60));
        metrics.b2b_pipeline.leads -= toActive;
        metrics.b2b_pipeline.active_deals += toActive;
        
        // SLG Win rate uses the precise config conversion %, boosted by actual sales power 
        const qualityWinMult = metrics.product_quality / 100;
        const baseWinRate = configConversion / 100; // e.g. 0.5% => 0.005
        const winRate = Math.min(1.0, baseWinRate * (1 + (qualityWinMult * 2)) * (1 + (totalSalesPower / 50)));

        const toClosed = Math.floor(metrics.b2b_pipeline.active_deals * winRate);
        metrics.b2b_pipeline.active_deals -= toClosed;
        metrics.b2b_pipeline.closed_won = (metrics.b2b_pipeline.closed_won || 0) + toClosed;
        
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

    let monthlyRevenue = 0, monthlyCogs = 0;
    // --- OVERHAULED INDUSTRY MONETIZATION ---
    if (isSLG) {
        // All SLG models are straightforward: Active Contracts * Contract Size
        metrics.paid_users = metrics.users;
        monthlyRevenue = metrics.users * metrics.pricing;
        monthlyCogs = monthlyRevenue * (industry === "AI Platform" ? 0.30 : 0.10);
    } else {
        // PLG models have specialized revenue mappings based on their unit types
        if (industry === "Mobile Game") {
            const adsFreq = (metrics as any).ad_intensity || 0;
            const adRevenue = metrics.users * (adsFreq / 100) * 0.15;
            const iapRevenue = metrics.users * 0.03 * metrics.pricing;
            metrics.paid_users = Math.floor(metrics.users * 0.03); // IAP payers
            monthlyRevenue = adRevenue + iapRevenue;
            monthlyCogs = monthlyRevenue * 0.05; 
        } else if (industry === "AI Platform") {
            metrics.paid_users = metrics.users; // Assume seat pricing for simplicity or tokens
            monthlyRevenue = metrics.users * metrics.pricing * 2; 
            monthlyCogs = monthlyRevenue * 0.35; 
        } else if (industry === "FinTech" || industry === "FinTech App" || industry === "FinTech Platform") {
            metrics.paid_users = metrics.users; // Transaction users
            const txVolume = metrics.users * 200; 
            monthlyRevenue = txVolume * (metrics.pricing / 100); 
            monthlyCogs = monthlyRevenue * 0.20;
        } else if (industry === "Marketplace") {
            metrics.paid_users = metrics.users;
            const gmv = metrics.users * 150; 
            monthlyRevenue = gmv * (metrics.pricing / 100);
            monthlyCogs = monthlyRevenue * 0.15;
        } else {
            // Default PLG SaaS (Dynamic Freemium: scales with Quality, PMF, and Price)
            const pmfFactor = Math.max(0.2, (metrics.pmf_score || 10) / 50); 
            const qualityFactor = Math.max(0.2, (metrics.product_quality || 10) / 50);
            
            const maxPrice = activeConfig?.maxPrice || 300;
            const priceRatio = Math.min(1, Math.max(0.01, metrics.pricing / maxPrice));
            const priceFactor = Math.max(0.1, 1.2 - (priceRatio * 0.9)); // penalize heavy pricing index

            const paidRate = Math.min(0.25, Math.max(0.005, 0.04 * pmfFactor * qualityFactor * priceFactor));
            const paidUsers = Math.floor(metrics.users * paidRate);
            
            metrics.paid_users = paidUsers;
            monthlyRevenue = paidUsers * metrics.pricing;
            monthlyCogs = monthlyRevenue * 0.15;
        }
    }

    metrics.revenue = monthlyRevenue;
    metrics.cogs = monthlyCogs;
    metrics.opex = monthlyOpex;
    metrics.net_profit = monthlyRevenue - monthlyCogs - monthlyOpex;
    metrics.cash += metrics.net_profit;
    if (metrics.annual_billing && grossNewUsers > 0 && !isSLG) metrics.cash += (grossNewUsers * metrics.pricing * 11);

    const actualNetBurn = -metrics.net_profit;
    metrics.burn_rate = actualNetBurn > 0 ? actualNetBurn : 0;
    metrics.runway = actualNetBurn > 0 ? Math.floor(metrics.cash / actualNetBurn) : 99;

    // --- CHURN & QUALITY GAP ---
    // Inherit the exact calculated churn from the industry config
    let baseChurn = configChurn;
    if (metrics.annual_billing) baseChurn *= 0.4;

    if (metrics.users > 0) {
        let currentChurn = baseChurn;
        const monthsActive = startup.history?.length || 0;
        const expectedQuality = Math.min(85, 20 + (monthsActive * 1.5));
        
        // Quality gap penalty
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

    // --- VALUATION PERSISTENCE (Damping) ---
    // Prevent sudden crashes after a high-valuation round. 
    // Valuation can only drop by ~3% per month unless metrics are truly disastrous.
    const previousValuation = startup.valuation || 500000;
    const supportFloor = previousValuation * 0.97;
    
    newStartup.valuation = Math.max(Math.floor(finalValuation), Math.floor(supportFloor));

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
    
    // --- INVESTOR PIPELINE PROGRESSION ---
    const pipeline = metrics.investor_pipeline;
    if (pipeline) {
        if (pipeline.leads > 0) {
            const toMeetings = Math.max(0, Math.floor(pipeline.leads * 0.2 * (attrs.networking / 100)));
            pipeline.leads -= toMeetings;
            pipeline.meetings += toMeetings;
        }
        if (pipeline.meetings > 0) {
            const toTermSheets = Math.max(0, Math.floor(pipeline.meetings * 0.15 * (attrs.marketing_skill / 100)));
            pipeline.meetings -= toTermSheets;
            pipeline.term_sheets += toTermSheets;
        }
    }

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
        proposed_month: startup.history?.length ?? 0,
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
