import { Startup, Founder } from "../types/database.types";

export type AdviceContent = {
    title: string;
    message: string;
    buttonText: string;
    trigger: string;
};

export const MENTOR_ADVICE: Record<string, AdviceContent> = {
    intro_plg: {
        title: "👋 WELCOME, {name}!",
        message: "I'm Sam, {name} — I've backed over a hundred startups in my time. Think of me as your advisor in the passenger seat. I'll check in when things get tricky.\n\nFirst order of business: keep an eye on your Runway — that's how many months of cash you have left. Let's build something great.",
        buttonText: "GOT IT, THANKS SAM",
        trigger: "month_1_plg"
    },
    intro_slg: {
        title: "👋 WELCOME, {name}!",
        message: "I'm Sam, {name} — I've backed over a hundred startups in my time. Think of me as your advisor in the passenger seat. I'll check in when things get tricky.\n\nFirst order of business: keep an eye on your Runway — that's how many months of cash you have left. Let's build something great.",
        buttonText: "GOT IT, THANKS SAM",
        trigger: "month_1_slg"
    },
    low_runway: {
        title: "RUNWAY ALERT! ⚠️",
        message: "You have less than 4 months of cash left. This is the 'Default Dead' zone. You need to either 'Pitch Investors' immediately or cut your burn rate. Consider firing non-essential staff or pausing expensive marketing.",
        buttonText: "I'M ON IT",
        trigger: "runway_low"
    },
    high_burnout: {
        title: "YOU'RE BURNING OUT! 🧘",
        message: "Your burnout is over 70%. Your decision-making is suffering, and the team is starting to notice. You must 'Rest and Recharge' this month. A dead founder can't lead a unicorn.",
        buttonText: "THANKS, SAM",
        trigger: "burnout_high"
    },
    hiring_first: {
        title: "TIME TO DELEGATE! 👥",
        message: "You've got some traction! You can't do everything alone anymore. Hiring your first Engineer will boost product quality passively, but watch your burn. Hire slow, fire fast.",
        buttonText: "SHOW ME CANDIDATES",
        trigger: "first_hire"
    },
    scaling_fast: {
        title: "STAY AGGRESSIVE! 🚀",
        message: "The fundamentals look solid. You have runway, PMF is improving, and your unit economics are healthy. Now is the time to be bold. Experiment with 'New Marketing Channels' or double down on 'Product Innovation'.",
        buttonText: "GOT IT, THANKS SAM",
        trigger: "scaling"
    }
};

export function getEducationalAdvice(startup: Startup, founder: Founder): AdviceContent | null {
    const m = startup.metrics;
    const months = startup.history?.length || 0;

    // 1. Onboarding
    if (months === 0) {
        return startup.gtm_motion === "PLG" ? MENTOR_ADVICE.intro_plg : MENTOR_ADVICE.intro_slg;
    }

    // 2. Critical States (Educational)
    if (m.runway > 0 && m.runway < 4 && m.cash > 0) return MENTOR_ADVICE.low_runway;
    if (m.founder_burnout > 75) return MENTOR_ADVICE.high_burnout;
    
    // 3. Milestone based (One time)
    if (m.users > 50 && m.employees === 0) return MENTOR_ADVICE.hiring_first;

    return null;
}

export function getConsultationAdvice(startup: Startup): AdviceContent {
    const m = startup.metrics;
    
    if ((m.net_profit || 0) > 0) {
        return {
            title: "PROFITS ARE UP! 💰",
            message: "You're in the rare group of profitable startups. You can now bootstrap to greatness or raise a 'clean' round with massive leverage. I'd suggest aggressive hiring in Sales to dominate the market.",
            buttonText: "PRUDENT ADVICE",
            trigger: "consult_profit"
        };
    }

    if (m.pmf_score < 30) {
        return {
            title: "FIX THE PRODUCT 🛠️",
            message: "Your PMF score is low. Marketing right now is like pouring water into a leaky bucket. Stop the ads. Put 100% of your energy into 'Fixing Bugs' and 'MVP Features' until users actually stick.",
            buttonText: "CHARTING COURSE",
            trigger: "consult_pmf"
        };
    }

    return MENTOR_ADVICE.scaling_fast;
}
