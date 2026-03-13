import { Startup } from "../types/database.types";

export type Achievement = {
    id: string;
    title: string;
    description: string;
    condition: (startup: Startup) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: "first_users",
        title: "Hello World",
        description: "Acquire your first 100 users.",
        condition: (s) => s.metrics.users >= 100
    },
    {
        id: "traction_king",
        title: "Traction King",
        description: "Reach 10,000 active users.",
        condition: (s) => s.metrics.users >= 10000
    },
    {
        id: "seed_raised",
        title: "Venture Backed",
        description: "Raise your Seed Round.",
        condition: (s) => s.funding_stage === "Seed Round" || s.funding_stage === "Series A"
    },
    {
        id: "unicorn",
        title: "Unicorn Status",
        description: "Reach a $1 Billion valuation.",
        condition: (s) => s.valuation >= 1000000000
    },
    {
        id: "lean_machine",
        title: "Lean Machine",
        description: "Reached 1,000 users with fewer than 5 employees.",
        condition: (s) => s.metrics.users >= 1000 && s.metrics.employees < 5
    },
    {
        id: "centicorn",
        title: "Centicorn",
        description: "Reach a $100M valuation.",
        condition: (s) => s.valuation >= 100000000
    },
    {
        id: "public_company",
        title: "Going Public",
        description: "Successfully complete an IPO.",
        condition: (s) => s.outcome === "ipo"
    }
];

export function checkAchievements(startup: Startup, unlockedIds: string[]): Achievement[] {
    return ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id) && a.condition(startup));
}
