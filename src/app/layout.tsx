"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 1. Handle Cold Launch
    const hasLaunched = sessionStorage.getItem("app_launched");
    if (!hasLaunched) {
      sessionStorage.setItem("app_launched", "true");
      if (pathname !== "/") router.push("/");
    }

    // 2. Handle Resume from Background
    // Import dynamically to avoid SSR issues
    const setupAppListener = async () => {
      try {
        const { App } = await import("@capacitor/app");
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) {
            // When app becomes active (relaunch/foreground), go to home
            // Also clear the splash-seen flag so they see the splash again
            sessionStorage.removeItem("founder_sim_splash_seen");
            if (window.location.pathname !== "/") {
              router.push("/");
            }
          }
        });
      } catch (e) {
        console.warn("Capacitor App plugin not available", e);
      }
    };

    setupAppListener();
    setIsInitialized(true);
  }, [router, pathname]);

  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {isInitialized ? children : <div className="bg-white fixed inset-0" />}
      </body>
    </html>
  );
}
