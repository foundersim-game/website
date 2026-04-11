import "./globals.css";
import { Inter } from "next/font/google";
import type { Viewport, Metadata } from "next";
import { ClientLayout } from "./ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Founder Sim",
  description: "Build, Grow, and Exit your dream startup in this ultimate founder simulation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" id="theme-color-meta" content="#0f1117" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-W7N2170J6N"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            var clientId = localStorage.getItem('ga_client_id_v2');
            if (!clientId) {
              clientId = 'cid_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
              localStorage.setItem('ga_client_id_v2', clientId);
            }

            var sessionId = sessionStorage.getItem('ga_session_id');
            if (!sessionId) {
              sessionId = Date.now().toString();
              sessionStorage.setItem('ga_session_id', sessionId);
            }

            gtag('config', 'G-W7N2170J6N', {
              client_id: clientId,
              session_id: sessionId,
              client_storage: 'none',
              page_location: 'https://foundersim.fun' + window.location.pathname,
              send_page_view: true
            });
          `
        }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
