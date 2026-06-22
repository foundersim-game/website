// src/app/story-mode/[campaignId]/layout.tsx
// Server component — provides generateStaticParams for the static export.
// The actual page content is in ./play/page.tsx (client component).

import type { Metadata } from "next";

// Pre-renders the three campaign routes at build time.
export function generateStaticParams() {
  return [
    { campaignId: "pineapple" },
    { campaignId: "bookface" },
    { campaignId: "searchgo" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}): Promise<Metadata> {
  const { campaignId } = await params;
  const names: Record<string, string> = {
    pineapple: "Pineapple — From Garage to $1T",
    bookface: "BookFace — Connect the World",
    searchgo: "SearchGo — Organize Everything",
  };
  return {
    title: names[campaignId] ?? "Story Mode | Founder Sim",
    description: "An immersive founder narrative campaign.",
  };
}

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
