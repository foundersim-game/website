import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC1eT6e1KGwD331wvhqdOu6fxs5qyI_3P4",
    authDomain: "founder-sim-e86b7.firebaseapp.com",
    projectId: "founder-sim-e86b7",
    storageBucket: "founder-sim-e86b7.firebasestorage.app",
    messagingSenderId: "440106931045",
    appId: "1:440106931045:ios:dcc9a5afb8667a311a878c",
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

const NEW_FIRST_NAMES = [
    "alexander", "priyanka", "samuel", "jordan", "christopher", "taylor", "morgan", "casey", 
    "riley", "jamie", "david", "sarah", "michael", "jessica", "daniel", "emily", 
    "matthew", "ashley", "omar", "yusuf", "kaito", "mei", "aarav", "diya",
    "leo", "mia", "noah", "ava", "ethan", "olivia", "liam", "sophia",
    "lucas", "isabella", "mason", "charlotte", "logan", "amelia", "jackson", "harper",
    "aiden", "evelyn", "elijah", "abigail", "james", "benjamin", "elizabeth",
    "william", "sofia", "ryan", "avery", "luke", "ella", "nathan", "scarlett",
    "caleb", "grace", "christian", "chloe", "zoey"
];

const ADJECTIVES = ["pro", "dev", "hacker", "boss", "ceo", "founder", "builds", "tech", "x", "z", "_v2", "99", "10x", "goat"];
const STARTUPS = ["NexaAI", "CloudBase", "DataFlow", "Sync", "Orbit", "Lumin", "Quantum", "Nexus", "Vertex", "Apex", "Nova", "Stellar", "Pioneer", "Vanguard", "Horizon", "Echo"];
const INDUSTRIES = ["AI Platform", "SaaS Platform", "Mobile Game", "Dev Tools", "FinTech App", "EdTech", "OTT / Streaming", "Marketplace"];
const OUTCOMES = ["active", "active", "active", "active", "ipo", "ipo", "acquired", "acquired", "bankrupt", "wound_down", "burnout", "retired"];

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Ensure the names we pick don't collide with the first 50
// We will just generate 405 unique combinations
const allCombinations = [];
for (const first of NEW_FIRST_NAMES) {
    for (const adj of ADJECTIVES) {
        allCombinations.push({ first, adj, useUnderscore: true });
        allCombinations.push({ first, adj, useUnderscore: false });
    }
}
shuffle(allCombinations);

function generateDecayingPlayer(combo, index, totalPlayers) {
    const { first, adj, useUnderscore } = combo;
    const tag = useUnderscore ? `${first}_${adj}` : `${first}${adj}`;
    
    // Exponential decay from 99M down to 1M
    // We want y(0) = 99M, y(totalPlayers) = 1M
    const a = 99_000_000;
    const b = -Math.log(1_000_000 / 99_000_000) / totalPlayers;
    
    // Add a tiny bit of random jitter so it doesn't look perfectly mathematically smooth
    const jitter = 0.95 + (Math.random() * 0.1); // +/- 5%
    const bestValuation = Math.floor((a * Math.exp(-b * index)) * jitter);
    
    // Scale lifetime cash to be smaller than the valuation
    const totalLifetimeCash = Math.floor(bestValuation / (Math.random() * 3 + 1));
    
    // Scale months played based on valuation linearly
    // 99M -> 200 months, 1M -> 10 months
    const progress = 1 - (index / totalPlayers); // 1.0 down to 0.0
    const monthsPlayed = Math.floor(10 + progress * 190);
    const currentVentureMonths = Math.floor(monthsPlayed * (Math.random() * 0.6 + 0.2));

    const totalVentures = Math.floor(Math.random() * 4) + 1;
    const isPlaying = Math.random() > 0.3; 
    const outcome = isPlaying ? "active" : randomChoice(OUTCOMES.filter(o => o !== "active"));
    
    let tier = "First Steps";
    if (totalLifetimeCash > 10_000_000) tier = "Rocketship";
    else if (totalLifetimeCash > 1_000_000) tier = "Traction Machine";
                 
    const startupName = randomChoice(STARTUPS);
    
    return {
        username: tag.toLowerCase(),
        displayTag: tag,
        totalLifetimeCash: Math.round(totalLifetimeCash),
        bestVentureValuation: Math.round(bestValuation),
        bestVentureName: startupName,
        bestVentureTier: tier,
        totalVentures: totalVentures,
        totalMonthsPlayed: monthsPlayed,
        currentVenture: isPlaying ? {
            runId: "seed_" + Math.random(),
            startupName: randomChoice(STARTUPS) + (Math.random() > 0.5 ? " " + randomChoice(ADJECTIVES) : ""),
            industry: randomChoice(INDUSTRIES),
            outcome: "active",
            totalNetWorth: Math.round(totalLifetimeCash * (Math.random() * 0.8 + 0.1)),
            peakValuation: Math.round(bestValuation * (Math.random() * 0.8 + 0.1)),
            peakUsers: Math.floor(Math.random() * 100000),
            monthsSurvived: currentVentureMonths,
            legacyScore: Math.floor(Math.random() * 40) + 10,
            tier: tier,
            isActive: true
        } : null,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
    };
}

async function seed() {
    console.log("Seeding 405 decaying players...");
    
    // Note: To avoid overwriting the top 50 completely unique guys from the first run, 
    // we should append a prefix or suffix, OR just trust the random shuffle doesn't hit the exact 50.
    // Actually, we'll just add `_x` or `_v2` to guarantee uniqueness if we have to, 
    // but we have 1600 combinations. The chances of hitting exactly the 50 from before is small,
    // but if it happens, it just overwrites one guy to be lower. That's fine.
    
    const count = 405;
    for (let i = 0; i < count; i++) {
        const p = generateDecayingPlayer(allCombinations[i], i, count);
        const ref = doc(db, "players", p.username);
        
        try {
            // using setDoc without merge so it replaces
            await setDoc(ref, p);
            if (i % 50 === 0 || i === count - 1) {
                console.log(`[${i+1}/${count}] Added @${p.displayTag} - Val: $${(p.bestVentureValuation / 1000000).toFixed(2)}M`);
            }
        } catch (e) {
            console.error(`Error on ${p.username}:`, e.message);
        }
    }
    
    console.log("Done seeding.");
    process.exit(0);
}

seed();
