import OpenAI from "openai";
import { Startup, Founder } from "../types/database.types";
import { STRATEGY_PLAYBOOK } from "./strategyPlaybook";

// Client-side OpenAI usage with offline fallbacks
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "dummy",
    dangerouslyAllowBrowser: true // Required for client-side use
});

export async function generateAIEvent(startup: Startup, founder: Founder, seenEvents: string[] = []) {
    // If no API key or offline, the calling code will fallback to PREDEFINED_EVENTS
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY === "dummy") {
        return null;
    }

    try {
        const { metrics, industry, phase, gtm_motion, name } = startup;
        const { attributes } = founder;

        const pbKey = `${industry}_${gtm_motion}`;
        const pb = STRATEGY_PLAYBOOK[pbKey];
        const pbContext = pb ? `
Strategy Playbook Context:
- Model: ${pb.model}
- Target Customers: ${pb.customers}
- MRR Formula: ${pb.mrrFormula}
- Growth Lever: ${pb.growthLever}
- Main Risk / Cost: ${pb.mainRisk}
` : "";

        const context = `
Startup: ${name}
Industry: ${industry}
Phase: ${phase}
GTM: ${gtm_motion}
${pbContext}
Metrics: Cash ${metrics.cash}, Users ${metrics.users}, Burn ${metrics.burn_rate}, Runway ${metrics.runway}mo, Quality ${metrics.product_quality}, Morale ${metrics.team_morale}, Tech Debt ${metrics.technical_debt}
Founder: ${founder.name}, Background ${founder.background}
Stats: Intelligence ${attributes.intelligence}, Leadership ${attributes.leadership}, Network ${attributes.networking}, Marketing ${attributes.marketing_skill}, Sales ${attributes.sales_skill}
        `.trim();

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an AI generating structured game events for a startup simulation game.
Based on the startup's current context, generate a realistic, challenging, or opportunistic situational event.
The event should feel like it belongs in the specific industry and phase they are in.

CRITICAL EFFECTS FORMULATION:
All quantities inside the "effects" dictionary MUST be RAW NUMBERS (integers or floats). Do NOT format values asStrings (e.g. use -5000, NOT "-5000" or "spent $5k").
Effects MUST be descriptive (such as decreasing technical_debt or increasing cash balances), and remain directly consistent with the Strategy Playbook provided (e.g., if Main Risk is content spend, generate content loading dilemmas).

Return ONLY valid JSON in this exact format:
{
  "title": "Caught in the Middle",
  "description": "A brief, compelling 2-3 sentence description of the situation.",
  "choices": [
    { "text": "Invest heavily in core architecture to reduce future technical debt", "effects": { "cash": -5000, "team_morale": 10 } },
    { "text": "Launch aggressive marketing push targeting niche industry demographics", "effects": { "product_quality": 5, "brand_awareness": -5 } },
    { "text": "Halt feature development to focus entirely on server reliability", "effects": { "reputation": 5, "burn_rate": 500 } }
  ]
}

Available effect keys: 
cash, burn_rate, product_quality, users, growth_rate, brand_awareness, team_morale, technical_debt, innovation, pmf_score, 
intelligence, technical_skill, leadership, networking, marketing_skill, sales_skill, risk_appetite, stress_tolerance, reputation, founder_health, founder_burnout.

Generate a diverse range of events: some should be crises, some should be lucky breaks, and some should be strategic dilemmas.
${seenEvents.length > 0 ? `Do NOT generate any events similar in premise or title to these previous events: ${seenEvents.join(", ")}` : ""}`
                },
                {
                    role: "user",
                    content: `Here is the current game context:\n${context}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(response.choices[0].message.content || "null");
        if (content && content.title && content.choices) {
            // Whitelist of strictly valid game parameters that exist on startup/founder model structures
            const ALLOWED_KEYS = [
                "cash", "burn_rate", "product_quality", "users", "growth_rate", 
                "brand_awareness", "team_morale", "technical_debt", "innovation", "pmf_score", 
                "intelligence", "technical_skill", "leadership", "networking", "marketing_skill", "sales_skill", 
                "risk_appetite", "stress_tolerance", "reputation", "founder_health", "founder_burnout"
            ];

            // Force cast and whitelist all effect values to Numbers to prevent string propagation bugs
            content.choices = content.choices.map((choice: any) => {
                if (choice.effects) {
                    const cleanEffects: any = {};
                    Object.entries(choice.effects).forEach(([key, val]) => {
                        const num = Number(val);
                        if (!isNaN(num) && ALLOWED_KEYS.includes(key)) {
                            cleanEffects[key] = num;
                        }
                    });
                    choice.effects = cleanEffects;
                }
                return choice;
            });
            return content;
        }
        return null;
    } catch (e) {
        console.warn("AI Event Generation failed (likely offline):", e);
        return null;
    }
}

export async function generateFounderStory(founderName: string, startupName: string, events: string[]) {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY === "dummy") {
        return "Your startup journey comes to an end. (AI Summary requires an internet connection and API Key)";
    }

    try {
        const timeline = events.join("\n");
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an AI generating a dramatic, 3-paragraph summary of a startup's journey. 
            The founder is ${founderName} and the startup is ${startupName}.
            Base the story heavily on this timeline of events:\n${timeline}\n
            Conclude with an endgame assessment (IPO, acquisition, or failure).`
                }
            ]
        });

        return response.choices[0].message.content || "The story of your startup is being written in the annals of history.";
    } catch (e) {
        return "Your startup journey was legendary. (AI Summary unavailable offline)";
    }
}

