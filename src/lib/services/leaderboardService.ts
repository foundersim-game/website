/**
 * Leaderboard Service
 * Manages the global Founder Sim leaderboard via Firestore.
 *
 * Data model:
 *   players/{username}  — permanent player profile, cumulative across all ventures
 *   players/{username}/ventures/{runId}  — individual run archive
 *
 * Username is permanent and unique (enforced via Firestore transaction).
 * Stats accumulate across all runs — the leaderboard rewards serial founders.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    runTransaction,
    serverTimestamp,
    Timestamp,
    getCountFromServer
} from "firebase/firestore";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC1eT6e1KGwD331wvhqdOu6fxs5qyI_3P4",
    authDomain: "founder-sim-e86b7.firebaseapp.com",
    projectId: "founder-sim-e86b7",
    storageBucket: "founder-sim-e86b7.firebasestorage.app",
    messagingSenderId: "440106931045",
    appId: "1:440106931045:ios:dcc9a5afb8667a311a878c",
};

function getFirebaseApp() {
    return getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
}

function getDb() {
    return getFirestore(getFirebaseApp());
}

// ── Local Storage Keys ────────────────────────────────────────────────────────
const LS_USERNAME = "lb_username";
const LS_RUN_ID   = "lb_run_id";

export function getLbUsername(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LS_USERNAME);
}

export function saveLbUsername(username: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_USERNAME, username);
}

export function getLbRunId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem(LS_RUN_ID);
    if (!id) {
        id = "run_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(LS_RUN_ID, id);
    }
    return id;
}

export function resetLbRunId(): void {
    if (typeof window === "undefined") return;
    const id = "run_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(LS_RUN_ID, id);
}

// ── Username ──────────────────────────────────────────────────────────────────

export function validateUsername(tag: string): string | null {
    if (tag.length < 3) return "Too short (min 3 chars)";
    if (tag.length > 20) return "Too long (max 20 chars)";
    if (!/^[a-zA-Z0-9_]+$/.test(tag)) return "Only letters, numbers, underscores";
    return null; // valid
}

export async function checkUsernameAvailable(tag: string): Promise<boolean> {
    try {
        const db = getDb();
        const ref = doc(db, "players", tag.toLowerCase());
        const snap = await getDoc(ref);
        return !snap.exists();
    } catch {
        return true; // assume available on error so we don't block the user
    }
}

export async function claimUsername(tag: string): Promise<{ success: boolean; error?: string }> {
    const validationError = validateUsername(tag);
    if (validationError) return { success: false, error: validationError };

    const key = tag.toLowerCase();
    try {
        const db = getDb();
        const ref = doc(db, "players", key);
        await runTransaction(db, async (tx) => {
            const snap = await tx.get(ref);
            if (snap.exists()) throw new Error("taken");
            tx.set(ref, {
                username: key,
                displayTag: tag,
                totalLifetimeCash: 0,
                bestVentureValuation: 0,
                bestVentureName: "",
                bestVentureTier: "",
                totalVentures: 0,
                totalMonthsPlayed: 0,
                currentVenture: null,
                iap_god_mode: typeof window !== "undefined" && localStorage.getItem("founder_sim_god_mode") === "true",
                iap_titan: typeof window !== "undefined" && localStorage.getItem("founder_sim_titan") === "true",
                iap_premium: typeof window !== "undefined" && localStorage.getItem("founder_sim_premium") === "true",
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            });
        });
        saveLbUsername(key);
        return { success: true };
    } catch (e: any) {
        if (e?.message === "taken") return { success: false, error: "Username already taken" };
        return { success: false, error: "Could not connect to server" };
    }
}

// ── Venture Snapshots ─────────────────────────────────────────────────────────

export interface VentureSnapshot {
    runId: string;
    startupName: string;
    industry: string;
    outcome: string;
    totalNetWorth: number;    // personal_wealth + assets + equity stake
    peakValuation: number;
    peakUsers: number;
    monthsSurvived: number;
    legacyScore: number;
    tier: string;
    isActive: boolean;
}

/** Called every month advance — updates the live "currentVenture" snapshot */
export async function upsertCurrentVenture(username: string, snapshot: VentureSnapshot): Promise<void> {
    try {
        const db = getDb();
        const ref = doc(db, "players", username);
        const snap = await getDoc(ref);
        
        let isNewPeak = false;
        if (!snap.exists()) {
            // If the document was wiped from the DB but exists locally, 
            // recreate the full profile schema to pass any database security rules.
            await setDoc(ref, {
                username: username,
                displayTag: username,
                totalLifetimeCash: 0,
                bestVentureValuation: snapshot.peakValuation,
                bestVentureName: snapshot.startupName,
                bestVentureTier: snapshot.tier,
                totalVentures: 1,
                totalMonthsPlayed: snapshot.monthsSurvived,
                currentVenture: snapshot,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp(),
            });
            return;
        }

        const data = snap.data();
        const currentBest = data.bestVentureValuation || 0;
        
        // Update bests if the valuation increased OR if it's the same but the tier upgraded (due to score changes)
        if (snapshot.peakValuation >= currentBest) {
            isNewPeak = true;
        }

        await setDoc(ref, {
            currentVenture: snapshot,
            ...(isNewPeak && {
                bestVentureValuation: snapshot.peakValuation,
                bestVentureName: snapshot.startupName,
                bestVentureTier: snapshot.tier
            }),
            iap_god_mode: typeof window !== "undefined" && localStorage.getItem("founder_sim_god_mode") === "true",
            iap_titan: typeof window !== "undefined" && localStorage.getItem("founder_sim_titan") === "true",
            iap_premium: typeof window !== "undefined" && localStorage.getItem("founder_sim_premium") === "true",
            lastUpdated: serverTimestamp(),
        }, { merge: true });
    } catch (e: any) {
        console.error("Failed to upsertCurrentVenture:", e);
    }
}

// ── Story Mode Leaderboard ──────────────────────────────────────────────────

export interface StoryRunLeaderboardEntry {
    id: string;
    username: string;
    campaignId: string;
    monthsPlayed: number;
    outcome: "win" | "loss";
    createdAt: Date;
}

export async function submitStoryRun(username: string, campaignId: string, monthsPlayed: number, outcome: "win" | "loss"): Promise<void> {
    try {
        const db = getDb();
        const runsRef = collection(db, "story_runs");
        await addDoc(runsRef, {
            username,
            campaignId,
            monthsPlayed,
            outcome,
            createdAt: serverTimestamp(),
        });
    } catch (e: any) {
        console.error("Failed to submit story run:", e);
    }
}

export async function getStoryLeaderboard(campaignId: string, limitCount = 50): Promise<StoryRunLeaderboardEntry[]> {
    try {
        const db = getDb();
        const runsRef = collection(db, "story_runs");
        const q = query(
            runsRef,
            where("campaignId", "==", campaignId),
            where("outcome", "==", "win"),
            orderBy("monthsPlayed", "asc"),
            limit(limitCount)
        );

        const snap = await getDocs(q);
        const results: StoryRunLeaderboardEntry[] = [];
        
        // Track lowest months per username so we only show their best run
        const bestPerUser = new Map<string, number>();

        snap.forEach((doc) => {
            const data = doc.data();
            const username = data.username;
            const months = data.monthsPlayed;
            if (!bestPerUser.has(username) || bestPerUser.get(username)! > months) {
                bestPerUser.set(username, months);
            }
        });

        // Now collect unique best runs
        const addedUsers = new Set<string>();
        snap.forEach((doc) => {
            const data = doc.data();
            const username = data.username;
            if (!addedUsers.has(username) && bestPerUser.get(username) === data.monthsPlayed) {
                addedUsers.add(username);
                results.push({
                    id: doc.id,
                    username: data.username,
                    campaignId: data.campaignId,
                    monthsPlayed: data.monthsPlayed,
                    outcome: data.outcome,
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
            }
        });

        // Re-sort since map filtering might disrupt ordering if there are exact ties out of order
        results.sort((a, b) => a.monthsPlayed - b.monthsPlayed);
        return results;
    } catch (e: any) {
        console.error("Failed to fetch story leaderboard:", e);
        return [];
    }
}

/** Called at game-over — archives this run and updates cumulative stats */
export async function finalizeVenture(username: string, snapshot: VentureSnapshot): Promise<void> {
    try {
        const db = getDb();
        const playerRef = doc(db, "players", username);

        await runTransaction(db, async (tx) => {
            const playerSnap = await tx.get(playerRef);
            if (!playerSnap.exists()) return;

            const data = playerSnap.data();
            const prevCash      = data.totalLifetimeCash    || 0;
            const prevBestVal   = data.bestVentureValuation || 0;
            const prevVentures  = data.totalVentures        || 0;
            const prevMonths    = data.totalMonthsPlayed    || 0;

            const newTotalCash = prevCash + snapshot.totalNetWorth;
            const newBestVal   = Math.max(prevBestVal, snapshot.peakValuation);
            const isNewPeak    = snapshot.peakValuation >= prevBestVal;

            tx.update(playerRef, {
                totalLifetimeCash:    newTotalCash,
                bestVentureValuation: newBestVal,
                bestVentureName:      isNewPeak ? snapshot.startupName : data.bestVentureName,
                bestVentureTier:      isNewPeak ? snapshot.tier        : data.bestVentureTier,
                totalVentures:        prevVentures + 1,
                totalMonthsPlayed:    prevMonths + snapshot.monthsSurvived,
                currentVenture:       { ...snapshot, isActive: false },
                iap_god_mode:         typeof window !== "undefined" && localStorage.getItem("founder_sim_god_mode") === "true",
                iap_titan:            typeof window !== "undefined" && localStorage.getItem("founder_sim_titan") === "true",
                iap_premium:          typeof window !== "undefined" && localStorage.getItem("founder_sim_premium") === "true",
                lastUpdated:          serverTimestamp(),
            });
        });

        // Archive the run in the sub-collection
        const venturesRef = collection(db, "players", username, "ventures");
        await addDoc(venturesRef, {
            ...snapshot,
            isActive: false,
            archivedAt: serverTimestamp(),
        });

        // Generate fresh run ID for the next game
        resetLbRunId();
    } catch {
        // silent fail
    }
}

// ── Leaderboard Queries ───────────────────────────────────────────────────────

export interface LeaderboardEntry {
    username: string;
    displayTag: string;
    totalLifetimeCash: number;
    bestVentureValuation: number;
    bestVentureName: string;
    bestVentureTier: string;
    totalVentures: number;
    totalMonthsPlayed: number;
    currentVenture: VentureSnapshot | null;
    iap_god_mode?: boolean;
    iap_titan?: boolean;
    iap_premium?: boolean;
    shadowbanned?: boolean;
    flagged_for_exploit?: boolean;
    createdAt?: any;
    lastUpdated?: any;
}

// Minimum wealth to appear on the global leaderboard ($0 so everyone appears)
const LEADERBOARD_MIN_WEALTH = 0;

export async function getLeaderboard(category: "bestVentureValuation" | "totalLifetimeCash" = "bestVentureValuation", limitCount = 50): Promise<LeaderboardEntry[]> {
    try {
        const db = getDb();
        const q = query(
            collection(db, "players"),
            where(category, ">=", LEADERBOARD_MIN_WEALTH),
            orderBy(category, "desc"),
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data() as LeaderboardEntry);
    } catch {
        return [];
    }
}

export async function getPlayerProfile(username: string): Promise<LeaderboardEntry | null> {
    try {
        const db = getDb();
        const ref = doc(db, "players", username);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            // Handle edge case where DB was manually wiped but local storage remains
            return {
                username,
                displayTag: username,
                totalLifetimeCash: 0,
                bestVentureValuation: 0,
                bestVentureName: "",
                bestVentureTier: "First Steps",
                totalVentures: 0,
                totalMonthsPlayed: 0,
                currentVenture: null
            };
        }
        return snap.data() as LeaderboardEntry;
    } catch {
        return null;
    }
}

export async function getPlayerRank(username: string): Promise<number | null> {
    try {
        const db = getDb();
        const ref = doc(db, "players", username);
        const snap = await getDoc(ref);
        
        const myWealth = snap.exists() ? (snap.data().bestVentureValuation || 0) : 0;
        
        // Count how many players have STRICTLY HIGHER valuation than this player
        const q = query(
            collection(db, "players"),
            where("bestVentureValuation", ">", myWealth)
        );
        const countSnap = await getCountFromServer(q);
        // Rank is number of players ahead of them + 1
        return countSnap.data().count + 1;
    } catch {
        return null;
    }
}

export async function getTotalPlayers(): Promise<number> {
    try {
        const db = getDb();
        const q = query(
            collection(db, "players"),
            where("bestVentureValuation", ">=", LEADERBOARD_MIN_WEALTH)
        );
        const countSnap = await getCountFromServer(q);
        return countSnap.data().count;
    } catch {
        return 0;
    }
}

export async function clearExploitFlag(username: string): Promise<void> {
    try {
        if (!username) return;
        const db = getDb();
        const ref = doc(db, "players", username.toLowerCase());
        await updateDoc(ref, {
            flagged_for_exploit: false
        });
    } catch (e) {
        console.error("Failed to clear exploit flag", e);
    }
}
