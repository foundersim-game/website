/**
 * Analytics Service
 * Unified interface for tracking gameplay and financial metrics in Founder Sim.
 * Currently uses GA4 via @next/third-parties/google.
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
  | "ad_view";

export const analyticsService = {
  /**
   * Log a custom event to Google Analytics
   */
  logEvent: (event: EventName, params?: Record<string, any>) => {
    if (typeof window === "undefined") return;
    
    const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'
    
    if (typeof (window as any).gtag === "function") {
      let clientId = localStorage.getItem('ga_client_id_v2');
      if (!clientId) {
        clientId = 'cid_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('ga_client_id_v2', clientId);
      }

      let sessionId = sessionStorage.getItem('ga_session_id');
      if (!sessionId) {
        sessionId = Date.now().toString();
        sessionStorage.setItem('ga_session_id', sessionId);
      }

      (window as any).gtag("event", event, {
        platform: platform,
        page_location: 'https://foundersim.fun' + window.location.pathname,
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
   * Track monthly game state
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
      // Grouping by ranges can sometimes help in GA4 reporting
      valuation_range: metrics.valuation > 1000000000 ? "unicorn" : metrics.valuation > 100000000 ? "centaur" : "early",
    });
  },

  /**
   * Set user properties (ID, etc)
   */
  setUserId: (userId: string) => {
    if (typeof window === "undefined" || typeof (window as any).gtag !== "function") return;
    (window as any).gtag("config", GA_MEASUREMENT_ID, { user_id: userId });
  }
};
