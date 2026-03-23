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
      // Only force home if no save exists or we're already somewhere else
      const hasSave = typeof window !== 'undefined' && !!localStorage.getItem("founder_sim_state");
      if (pathname !== "/" && !hasSave) {
        router.push("/");
      }
    }

    // 2. Handle Resume from Background
    // Import dynamically to avoid SSR issues
    const setupAppListener = async () => {
      try {
        const { App } = await import("@capacitor/app");
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) {
            // Only clear splash seen, don't force redirect on every resume
            // This prevented ads from landing correctly
            sessionStorage.removeItem("founder_sim_splash_seen");
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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {isInitialized ? children : <div className="bg-white fixed inset-0" />}
      </body>
    </html>
  );
}
