import OpenAI from "openai";

// Client-side OpenAI usage with offline fallbacks
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "dummy",
    dangerouslyAllowBrowser: true // Required for client-side use
});

export async function generateCrisisEvent(industry: string, users: number, runway: number) {
    // If no API key or offline, the calling code will fallback to PREDEFINED_EVENTS
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        return null;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an AI generating structured JSON events for a startup simulation game. The user has a ${industry} startup with ${users} users and ${runway} months of runway left. Generate a crisis event using this EXACT JSON format:
            {
              "title": "Short catchy title",
              "description": "1 paragraph describing the crisis",
              "choices": [
                { "text": "Option 1", "effects": { "cash": -1000, "team_morale": 5 } },
                { "text": "Option 2", "effects": { "brand_awareness": -5, "product_quality": 2 } },
                { "text": "Option 3", "effects": { "runway": 1, "product_quality": -5 } }
              ]
            }`
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
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        return "Your startup journey comes to an end. (AI Summary requires an internet connection and API Key)";
    }

    try {
        const timeline = events.join("\\n");
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an AI generating a dramatic, 3-paragraph summary of a startup's journey. 
            The founder is ${founderName} and the startup is ${startupName}.
            Base the story heavily on this timeline of events:\\n${timeline}\\n
            Conclude with an endgame assessment (IPO, acquisition, or failure).`
                }
            ]
        });

        return response.choices[0].message.content || "The story of your startup is being written in the annals of history.";
    } catch (e) {
        return "Your startup journey was legendary. (AI Summary unavailable offline)";
    }
}
