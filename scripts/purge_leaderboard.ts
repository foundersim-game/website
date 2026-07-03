import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

const PURGE_THRESHOLD = 1_000_000_000_000_000; // 1 Quadrillion (1Qa)

async function purgeLeaderboard() {
    console.log("Starting Leaderboard Purge Script...");
    console.log(`Threshold: > ${PURGE_THRESHOLD}`);

    try {
        const playersRef = collection(db, "players");
        const snapshot = await getDocs(playersRef);
        console.log(`Fetched ${snapshot.size} players from Firestore.`);

        let purgedCount = 0;

        for (const playerDoc of snapshot.docs) {
            const data = playerDoc.data();
            const username = playerDoc.id;

            const maxVal = data.bestVentureValuation || 0;
            const maxCash = data.totalLifetimeCash || 0;

            if (maxVal > PURGE_THRESHOLD || maxCash > PURGE_THRESHOLD) {
                console.log(`⚠️ Flagging ${username}... (Val: ${maxVal}, Cash: ${maxCash})`);
                
                const ref = doc(db, "players", username);
                await updateDoc(ref, {
                    bestVentureValuation: 0,
                    totalLifetimeCash: 0,
                    totalVentures: 0,
                    totalMonthsPlayed: 0,
                    flagged_for_exploit: true
                });
                
                console.log(`✅ Reset ${username} and flagged for exploit warning.`);
                purgedCount++;
            }
        }

        console.log(`\n🎉 Purge Complete! Reset ${purgedCount} exploited accounts.`);
        process.exit(0);
    } catch (e) {
        console.error("❌ Failed to purge leaderboard:", e);
        process.exit(1);
    }
}

purgeLeaderboard();
