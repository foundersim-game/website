import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

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

const usersToFlag = [
    "yyyyyyyyy",
    "1Law",
    "adtholio",
    "Shawnfleming949"
];

async function flagUsers() {
    console.log("Starting Manual Flag Script...");
    let flaggedCount = 0;

    for (const username of usersToFlag) {
        try {
            const ref = doc(db, "players", username.toLowerCase());
            const docSnap = await getDoc(ref);
            
            if (docSnap.exists()) {
                await updateDoc(ref, {
                    bestVentureValuation: 0,
                    totalLifetimeCash: 0,
                    totalVentures: 0,
                    totalMonthsPlayed: 0,
                    flagged_for_exploit: true
                });
                console.log(`✅ Reset and flagged: ${username}`);
                flaggedCount++;
            } else {
                console.log(`❌ User not found: ${username}`);
            }
        } catch (e) {
            console.error(`❌ Failed to flag ${username}:`, e);
        }
    }

    console.log(`\n🎉 Complete! Flagged ${flaggedCount}/${usersToFlag.length} users.`);
    process.exit(0);
}

flagUsers();
