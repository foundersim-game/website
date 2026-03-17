import OpenAI from "openai";
import { Startup, Founder } from "../types/database.types";

// Client-side OpenAI usage with offline fallbacks
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "dummy",
    dangerouslyAllowBrowser: true // Required for client-side use
});

export async function generateAIEvent(startup: Startup, founder: Founder) {
    // If no API key or offline, the calling code will fallback to PREDEFINED_EVENTS
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY === "dummy") {
        return null;
    }

    try {
        const { metrics, industry, phase, gtm_motion, name } = startup;
        const { attributes } = founder;

        const context = `
Startup: ${name}
Industry: ${industry}
Phase: ${phase}
GTM: ${gtm_motion}
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

CRITICAL: Return ONLY valid JSON in this exact format:
{
  "title": "Caught in the Middle",
  "description": "A brief, compelling 2-3 sentence description of the situation.",
  "choices": [
    { "text": "Option A...", "effects": { "cash": -5000, "team_morale": 10 } },
    { "text": "Option B...", "effects": { "product_quality": 5, "brand_awareness": -5 } },
    { "text": "Option C...", "effects": { "reputation": 5, "burn_rate": 500 } }
  ]
}

Available effect keys: 
cash, burn_rate, product_quality, users, growth_rate, brand_awareness, team_morale, technical_debt, innovation, pmf_score, 
intelligence, technical_skill, leadership, networking, marketing_skill, sales_skill, risk_appetite, stress_tolerance, reputation, founder_health, founder_burnout.

Generate a diverse range of events: some should be crises, some should be lucky breaks, and some should be strategic dilemmas.`
                },
                {
                    role: "user",
                    content: `Here is the current game context:\n${context}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(response.choices[0].message.content || "null");
        if (content && content.title && content.choices) return content;
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

