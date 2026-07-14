/**
 * Analytics Service
 * Unified interface for tracking gameplay and financial metrics in Founder Sim.
 *
 * - On iOS/Android: Uses the native Firebase Analytics SDK via @capacitor-firebase/analytics
 * - On Web: Falls back to GA4 via window.gtag
 *
 * SETUP REQUIRED: Drop GoogleService-Info.plist into ios/App/App/ in Xcode
 * and google-services.json into android/app/ before building.
 */

import { Capacitor } from "@capacitor/core";

export const GA_MEASUREMENT_ID = "G-W7N2170J6N";

export type EventName =
  | "app_launch"
  | "game_start"
  | "industry_selected"
  | "month_advance"
  | "funding_secured"
  | "ipo_success"
  | "bankruptcy"
  | "hiring_success"
  | "ad_view"
  | "iap_attempt"
  | "iap_success"
  | "iap_failed"
  | "story_mode_vote"
  | "story_mode_waitlist"
  | "story_mode_play"
  | "story_mode_reset";

import { FirebaseAnalytics } from "@capacitor-firebase/analytics";

export const analyticsService = {
  /**
   * Log a custom event.
   * Routes to native Firebase SDK on iOS/Android, or gtag on web.
   */
  logEvent: async (event: EventName, params?: Record<string, any>) => {
    if (typeof window === "undefined") return;

    const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'
    const isNative = Capacitor.isNativePlatform();

    // ── Native Path (iOS / Android) ──────────────────────────────────────────
    if (isNative) {
      console.log(`[Analytics] PRE-FIRE NATIVE: ${event}`, params);
      if (FirebaseAnalytics) {
        try {
          await FirebaseAnalytics.logEvent({
            name: event,
            params: {
              platform,
              ...params,
            },
          });
          console.log(`[Analytics] NATIVE FIRED SUCCESS: ${event}`);
        } catch (e) {
          console.warn(`[Analytics] Native logEvent failed for "${event}":`, e);
        }
      } else {
        console.warn(`[Analytics] NATIVE SKIPPED: getFirebaseAnalytics() returned null for "${event}"`);
      }
      return;
    }

    // ── Web Fallback (gtag / GA4) ────────────────────────────────────────────
    if (typeof (window as any).gtag === "function") {
      let clientId = localStorage.getItem("ga_client_id_v2");
      if (!clientId) {
        clientId =
          "cid_" +
          Math.random().toString(36).substring(2) +
          Date.now().toString(36);
        localStorage.setItem("ga_client_id_v2", clientId);
      }

      let sessionId = sessionStorage.getItem("ga_session_id");
      if (!sessionId) {
        sessionId = Date.now().toString();
        sessionStorage.setItem("ga_session_id", sessionId);
      }

      (window as any).gtag("event", event, {
        platform,
        page_location: "https://foundersim.fun" + window.location.pathname,
        client_id: clientId,
        session_id: sessionId,
        ...params,
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${event} (${platform})`, params);
    }
  },

  /**
   * Track monthly game state snapshot
   */
  trackMonthlyMetrics: (metrics: {
    month: number;
    arr: number;
    valuation: number;
    cash: number;
    users: number;
    burnout: number;
    industry: string;
  }) => {
    analyticsService.logEvent("month_advance", {
      ...metrics,
      valuation_range:
        metrics.valuation > 1_000_000_000
          ? "unicorn"
          : metrics.valuation > 100_000_000
          ? "centaur"
          : "early",
    });
  },

  /**
   * Set user ID for cross-session tracking
   */
  setUserId: async (userId: string) => {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      if (FirebaseAnalytics) {
        try {
          await FirebaseAnalytics.setUserId({ userId });
        } catch (e) {
          console.warn("[Analytics] setUserId failed:", e);
        }
      }
      return;
    }

    // Web fallback
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("config", GA_MEASUREMENT_ID, { user_id: userId });
    }
  },

  /**
   * Set a user property (e.g. preferred industry, game mode)
   */
  setUserProperty: async (name: string, value: string) => {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      if (FirebaseAnalytics) {
        try {
          await FirebaseAnalytics.setUserProperty({ key: name, value });
        } catch (e) {
          console.warn("[Analytics] setUserProperty failed:", e);
        }
      }
      return;
    }

    // Web fallback
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("set", "user_properties", { [name]: value });
    }
  },
};



