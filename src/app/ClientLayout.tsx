"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";
import { analyticsService, GA_MEASUREMENT_ID } from "@/lib/services/analyticsService";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Handle Cold Launch
    const hasLaunched = sessionStorage.getItem("app_launched");
    if (!hasLaunched) {
      sessionStorage.setItem("app_launched", "true");
      const hasSave = typeof window !== 'undefined' && !!localStorage.getItem("founder_sim_state");
      if (pathname !== "/" && !hasSave) {
        router.push("/");
      }
    }

    // 2. Handle Resume from Background & Push Notifications
    const setupAppListener = async () => {
      try {
        const { App } = await import("@capacitor/app");
        const { notificationService } = await import("@/lib/services/notificationService");
        
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) {
            sessionStorage.removeItem("founder_sim_splash_seen");
            notificationService.clearAll();
          } else {
            // App backgrounded - Schedule the reminders
            const raw = localStorage.getItem("founder_sim_state");
            let stage = "Bootstrapping";
            if (raw) {
              try {
                const state = JSON.parse(raw);
                if (state.stage) stage = state.stage;
              } catch (_) {}
            }
            notificationService.scheduleAbsenceReminders(stage);
          }
        });
      } catch (e) {
        console.warn("Capacitor App plugin or Notification service not available", e);
      }
    };

    setupAppListener();

    // 3. Analytics: Track Launch
    analyticsService.logEvent("app_launch");

    setIsInitialized(true);
  }, [router, pathname]);

  return (
    <>
      <ThemeProvider>
        {isInitialized ? children : <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950" />}
      </ThemeProvider>
    </>
  );
}
