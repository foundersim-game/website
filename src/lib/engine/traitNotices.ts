import { EmployeeTrait } from "../types/database.types";

/**
 * Trait Notices — Flavor text for the moment a hidden trait is revealed to the player.
 * Triggered when traitRevealedMonth is first set on an employee.
 * {{name}} is replaced with the employee's name at runtime.
 */

export type TraitRevealNotice = {
    emoji: string;
    title: string;
    message: string;   // {{name}} is replaced at runtime
    sentiment: "positive" | "negative" | "neutral";
};

export const TRAIT_REVEAL_NOTICES: Record<EmployeeTrait, TraitRevealNotice> = {
    toxic_genius: {
        emoji: "⚡",
        title: "A Double-Edged Sword",
        sentiment: "negative",
        message: "{{name}} operates at a frightening level — three features shipped this month, all of them impressive. But two other engineers quietly asked if they could switch teams. Trait revealed: Toxic Genius.",
    },
    loyalist: {
        emoji: "🛡️",
        title: "A Rare Find",
        sentiment: "positive",
        message: "{{name}} turned down a competing offer this month without even mentioning it. You only found out from a recruiter who called to ask why they said no. Trait revealed: Loyalist.",
    },
    mercenary: {
        emoji: "💸",
        title: "The Market Is Calling",
        sentiment: "negative",
        message: "You caught {{name}} updating their LinkedIn profile — skills, open to work, the works. They're not disloyal, just ambitious about compensation. Trait revealed: Mercenary.",
    },
    cultural_anchor: {
        emoji: "🌟",
        title: "The Glue",
        sentiment: "positive",
        message: "The team feels noticeably more energized this month. Turns out {{name}} has been running an informal Friday retro and a Slack channel for wins. Nobody asked them to. Trait revealed: Cultural Anchor.",
    },
    bug_prone: {
        emoji: "🐛",
        title: "Fast But Messy",
        sentiment: "negative",
        message: "{{name}} shipped more features this month than anyone else. They also shipped four hidden bugs that only surfaced in production. Trait revealed: Bug Prone.",
    },
    evangelist: {
        emoji: "📢",
        title: "Natural Amplifier",
        sentiment: "positive",
        message: "{{name}}'s LinkedIn post about a problem your product solves went viral — 40k impressions, unprompted, on their own time. Trait revealed: Evangelist.",
    },
    burnout_magnet: {
        emoji: "🔥",
        title: "The Energy Vampire",
        sentiment: "negative",
        message: "You've been working overtime just to keep pace with {{name}}'s output and expectations. You're not sure if it's inspiring or exhausting. Probably both. Trait revealed: Burnout Magnet.",
    },
};

/**
 * Interpolate {{name}} in a trait reveal message.
 */
export function formatTraitNotice(trait: EmployeeTrait, employeeName: string): TraitRevealNotice {
    const base = TRAIT_REVEAL_NOTICES[trait];
    return {
        ...base,
        message: base.message.replace("{{name}}", employeeName),
    };
}
