import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Calendar, ArrowRight, Sparkles, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Nina Kurain Updates | Official Creator Journal & News",
  description:
    "Official updates, creative releases, and behind-the-scenes journal entries from Nina Kurain, Digital Creator and model.",
  keywords: [
    "Nina Kurain Updates",
    "Nina Kurain News",
    "Nina Kurain Journal",
    "Nina Kurain Releases",
    "Nina Kurain Digital Creator",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/updates",
  },
  openGraph: {
    title: "Nina Kurain Updates | Official Creator Journal & News",
    description: "Official updates, creative releases, and journal entries from Nina Kurain.",
    url: "https://ninakurainservices.in/updates",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Nina Kurain Creator Updates",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Updates | Official Creator Journal",
    description: "Official updates and creative releases from Nina Kurain.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

const UPDATES_DATA = [
  {
    slug: "autumn-editorial-collection-2026",
    title: "Autumn Editorial Collection Premieres",
    date: "September 18, 2026",
    category: "Portfolio Release",
    excerpt: "New fine-art portrait collection exploring tonal harmonies, studio shadows, and seasonal aesthetics. Discover the creative philosophy behind the frames.",
    body: "The Autumn 2026 editorial collection marks a focused return to tactile studio portraiture. Over three dedicated studio sessions, we explored the interaction between heavy wool silhouettes, sheer fabrics, and low-angle tungsten lighting. The primary aim was to achieve an atmosphere of quiet reflection while retaining bold graphic presence across digital displays.",
    link: "/photos",
    linkText: "View New Collection",
  },
  {
    slug: "official-youtube-cinematography-series",
    title: "Official YouTube Cinematography Series Launched",
    date: "August 28, 2026",
    category: "Platform Expansion",
    excerpt: "Expanding into episodic short-form visual storytelling and creative direction breakdowns for aspiring artists and patrons alike.",
    body: "In response to community interest in our lighting and camera techniques, we are producing a dedicated video series on YouTube. Each vignette explores framing, color grading, and creative pacing from original studio sessions.",
    link: "/videos",
    linkText: "Watch Video Teasers",
  },
  {
    slug: "collaborations-autumn-2026",
    title: "Creator Collaborations Open for Autumn / Winter",
    date: "July 30, 2026",
    category: "Partnerships",
    excerpt: "Now accepting select brand collaborations, lookbook creative direction briefs, and editorial syndication requests for the upcoming season.",
    body: "We are partnering with visionary fashion labels, luxury accessories, and design publications seeking distinctive visual identity. Direct brand inquiries can be submitted through our new collaboration portal.",
    link: "/collaborations",
    linkText: "Submit Collaboration Inquiry",
  },
  {
    slug: "canonical-digital-creator-hub",
    title: "Official Website Relaunch: Establishing Canonical Presence",
    date: "June 20, 2026",
    category: "Digital Architecture",
    excerpt: "Centralizing all verified photography, video showreels, and official social channels under ninakurainservices.in.",
    body: "To establish a definitive entity foundation on Google Search, Google Images, and social discovery graphs, we have rebuilt ninakurainservices.in. The public site remains fully open and accessible, while private content is strictly maintained on our VIP portal.",
    link: "/about",
    linkText: "Explore Entity Profile",
  },
];

import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const { updates, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || "Nina Kurain";

  const jsonLdUpdates = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": "https://ninakurainservices.in/updates/#blog",
        "url": "https://ninakurainservices.in/updates",
        "name": `${creatorName} Creator Updates`,
        "description": `Official announcements and creative updates from ${creatorName}, Digital Creator.`,
        "publisher": {
          "@id": "https://ninakurainservices.in/#nina-kurain",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/updates/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": creatorName,
            "item": "https://ninakurainservices.in/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Updates",
            "item": "https://ninakurainservices.in/updates",
          },
        ],
      },
      ...updates.map((u) => ({
        "@type": "BlogPosting",
        "@id": `https://ninakurainservices.in/updates/#${u.slug}`,
        "headline": u.title,
        "description": u.excerpt,
        "datePublished": "2026-09-24",
        "author": {
          "@type": "Person",
          "@id": "https://ninakurainservices.in/#nina-kurain",
          "name": creatorName,
        },
      })),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdUpdates) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CREATOR JOURNAL</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Creator Updates &amp; News
              </h1>
              <p>
                Dispatches, milestone announcements, and artistic insights directly from {creatorName}.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {updates.map((update) => (
              <article
                key={update.slug}
                id={update.slug}
                style={{
                  padding: "clamp(24px, 4vw, 36px)",
                  borderRadius: "var(--nk-radius-lg)",
                  background: "var(--nk-surface)",
                  border: "1px solid var(--nk-border)",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "var(--nk-rose-light)", fontWeight: 700, letterSpacing: "0.1em" }}>
                  <span>{update.date}</span>
                  <span>•</span>
                  <span>{update.category}</span>
                </div>

                <h2 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "clamp(24px, 3vw, 32px)", margin: 0, color: "var(--nk-text)" }}>
                  {update.title}
                </h2>

                <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
                  {update.body}
                </p>

                <div style={{ paddingTop: "10px" }}>
                  <Link href={update.href} className="section-action-link">
                    <span>Explore details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
