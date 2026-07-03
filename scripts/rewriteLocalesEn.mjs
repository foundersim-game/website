import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const p = path.join(ROOT, 'src/locales/en.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

Object.assign(data.dashboard.manda, {
    target_desc: "{{sector}} startup focused on {{rationale}}.",
    rationales: {
        "acqui_hire": "acqui-hire",
        "ip_patents": "ip/patents",
        "market_share": "market share",
        "defensive_acquisition": "defensive acquisition"
    }
});

if (!data.dashboard.pr) data.dashboard.pr = {};
Object.assign(data.dashboard.pr, {
    actions: {
        press_release: "Press Release",
        press_release_desc: "Write and distribute a press release.",
        publish: "Publish",
        deep_research: "Deep Sector Research",
        deep_research_desc: "Analyze macro trends and publish a whitepaper.",
        research: "Research",
        podcast: "Podcast Interview",
        podcast_desc: "Go on a popular industry podcast.",
        speak: "Speak",
        analyst: "Analyst Briefing",
        analyst_desc: "Brief Wall Street analysts on your trajectory.",
        brief: "Brief",
        conference: "Industry Conference",
        conference_desc: "Headline a major tech conference.",
        headline: "Headline",
        viral_stunt: "Viral PR Stunt",
        viral_stunt_desc: "Free brand awareness and user bump.",
        watch_ad: "Watch Ad",
        costs_gives: "Costs {{cost}} Focus. Gives +{{gain}} Brand Awareness."
    }
});

fs.writeFileSync(p, JSON.stringify(data, null, 2));
console.log("Updated en.json");
