import { Startup, Founder } from "../types/database.types";

export type AdviceContent = {
    title: string;
    message: string;
    buttonText: string;
    trigger: string;
};

export const MENTOR_ADVICE: Record<string, AdviceContent> = {
    intro_plg: {
        title: "mentorship.intro_plg.title",
        message: "mentorship.intro_plg.message",
        buttonText: "mentorship.intro_plg.buttonText",
        trigger: "month_1_plg"
    },
    intro_slg: {
        title: "mentorship.intro_slg.title",
        message: "mentorship.intro_slg.message",
        buttonText: "mentorship.intro_slg.buttonText",
        trigger: "month_1_slg"
    },
    low_runway: {
        title: "mentorship.low_runway.title",
        message: "mentorship.low_runway.message",
        buttonText: "mentorship.low_runway.buttonText",
        trigger: "runway_low"
    },
    high_burnout: {
        title: "mentorship.high_burnout.title",
        message: "mentorship.high_burnout.message",
        buttonText: "mentorship.high_burnout.buttonText",
        trigger: "burnout_high"
    },
    hiring_first: {
        title: "mentorship.hiring_first.title",
        message: "mentorship.hiring_first.message",
        buttonText: "mentorship.hiring_first.buttonText",
        trigger: "first_hire"
    },
    scaling_fast: {
        title: "mentorship.scaling_fast.title",
        message: "mentorship.scaling_fast.message",
        buttonText: "mentorship.scaling_fast.buttonText",
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
            title: "mentorship.consult_profit.title",
            message: "mentorship.consult_profit.message",
            buttonText: "mentorship.consult_profit.buttonText",
            trigger: "consult_profit"
        };
    }

    if (m.pmf_score < 30) {
        return {
            title: "mentorship.consult_pmf.title",
            message: "mentorship.consult_pmf.message",
            buttonText: "mentorship.consult_pmf.buttonText",
            trigger: "consult_pmf"
        };
    }

    return MENTOR_ADVICE.scaling_fast;
}
