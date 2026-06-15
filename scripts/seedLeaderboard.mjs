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

const INDUSTRIES = [
    "AI Platform", "SaaS Platform", "Mobile Game", "Dev Tools", "FinTech App", "EdTech", "OTT / Streaming", "Marketplace"
];

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

function generateRandomPlayer(firstName) {
    const adj = randomChoice(ADJECTIVES);
    const useUnderscore = Math.random() > 0.5;
    const tag = useUnderscore ? `${firstName}_${adj}` : `${firstName}${adj}`;
    
    const wealthExp = Math.random(); 
    let totalLifetimeCash = 0;
    let bestValuation = 0;
    let monthsPlayed = 0; // Lifetime months across all ventures
    let currentVentureMonths = 0;
    
    if (wealthExp > 0.8) {
        totalLifetimeCash = Math.floor(Math.random() * 8_000_000_000) + 1_000_000_000;
        bestValuation = totalLifetimeCash * (Math.random() * 2 + 1);
        // Decacorn: 400+ total months, 200+ current venture months
        monthsPlayed = Math.floor(Math.random() * 200) + 400; // 400 - 600 months
        currentVentureMonths = Math.floor(Math.random() * 100) + 200; // 200 - 300 months
    } else {
        totalLifetimeCash = Math.floor(Math.random() * 900_000_000) + 100_000_000;
        bestValuation = totalLifetimeCash * (Math.random() * 3 + 1);
        // Unicorn: 200+ total months, 100+ current venture months
        monthsPlayed = Math.floor(Math.random() * 200) + 200; // 200 - 400 months
        currentVentureMonths = Math.floor(Math.random() * 100) + 100; // 100 - 200 months
    } 

    const totalVentures = Math.floor(Math.random() * 5) + 1;
    const isPlaying = Math.random() > 0.3; 
    const outcome = isPlaying ? "active" : randomChoice(OUTCOMES.filter(o => o !== "active"));
    
    const tier = totalLifetimeCash > 1_000_000_000 ? "Decacorn Elite" : "Unicorn Founder";
                 
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
            peakUsers: Math.floor(Math.random() * 10000000),
            monthsSurvived: currentVentureMonths,
            legacyScore: Math.floor(Math.random() * 80) + 20,
            tier: tier,
            isActive: true
        } : null,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
    };
}


async function seed() {
    console.log("Seeding ONLY 50 unique players with EXACT requested game times...");
    
    const shuffledNames = shuffle([...NEW_FIRST_NAMES]).slice(0, 50);
    
    for (let i = 0; i < 50; i++) {
        const p = generateRandomPlayer(shuffledNames[i]);
        const ref = doc(db, "players", p.username);
        
        try {
            await setDoc(ref, p, { merge: true });
            console.log(`[${i+1}/50] Added @${p.displayTag} - $${(p.totalLifetimeCash / 1000000).toFixed(1)}M (${p.totalMonthsPlayed} mos total / current venture: ${p.currentVenture ? p.currentVenture.monthsSurvived : 0} mos)`);
        } catch (e) {
            console.error(`Error on ${p.username}:`, e.message);
        }
    }
    
    console.log("Done seeding.");
    process.exit(0);
}

seed();
