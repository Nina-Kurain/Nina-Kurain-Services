import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import {
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,

  PinterestIcon,
} from "@/components/social-icons";

export const metadata: Metadata = {
  title: "Nina Kurain Official Social Profiles | Digital Creator",
  description:
    "Official verified social media profiles for Nina Kurain, Digital Creator. Connect on Instagram, YouTube, Facebook, and Pinterest.",
  keywords: [
    "Nina Kurain Instagram",
    "Nina Kurain YouTube",
    "Nina Kurain Facebook",

    "Nina Kurain Pinterest",
    "Nina Kurain Socials",
    "Nina Kurain Official Links",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/socials",
  },
  openGraph: {
    title: "Nina Kurain Official Social Profiles | Digital Creator",
    description: "Official verified social media profiles for Nina Kurain, Digital Creator.",
    url: "https://ninakurainservices.in/socials",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Nina Kurain Official Social Profiles",
      },
    ],
    locale: "en_IN",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Official Social Profiles",
    description: "Official verified social channels for Nina Kurain.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export default async function SocialsPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || "Nina Kurain";

  const channels = [
    {
      name: "Instagram",
      handle: "@ninakurain",
      url: settings.instagram || "https://www.instagram.com/ninakurain",
      icon: InstagramIcon,
      badge: "Primary Visual Hub",
      description: "Daily studio stories, editorial photo carousels, behind-the-scenes reels, and creator announcements.",
      stats: "Official Account",
      cta: "Follow on Instagram",
    },
    {
      name: "YouTube",
      handle: "@ninakurain",
      url: settings.youtube || "https://www.youtube.com/@ninakurain",
      icon: YoutubeIcon,
      badge: "Cinematography & 4K Motion",
      description: "Original 4K studio films, cinematic Shorts, visual essays, and creative direction breakdowns.",
      stats: "Official Channel",
      cta: "Subscribe on YouTube",
    },
    {
      name: "Facebook",
      handle: `${creatorName} Official`,
      url: settings.facebook || "https://www.facebook.com/ninakurain",
      icon: FacebookIcon,
      badge: "Community & Dispatches",
      description: "High-resolution photo albums, community updates, long-form creator thoughts, and project news.",
      stats: "Official Page",
      cta: "Connect on Facebook",
    },

    {
      name: "Pinterest",
      handle: creatorName,
      url: settings.pinterest || "https://www.pinterest.com/ninakurain",
      icon: PinterestIcon,
      badge: "Visual Moodboards",
      description: `Curated aesthetic boards: ${creatorName} Photography, Fashion Lookbooks, Studio Portraits, and Lighting Inspiration.`,
      stats: "Official Boards",
      cta: "Explore on Pinterest",
    },
  ];

  const jsonLdSocials = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": "https://ninakurainservices.in/socials/#webpage",
        "url": "https://ninakurainservices.in/socials",
        "name": `${creatorName} Official Social Profiles`,
        "mainEntity": {
          "@id": "https://ninakurainservices.in/#nina-kurain",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/socials/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Nina Kurain",
            "item": "https://ninakurainservices.in/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Socials",
            "item": "https://ninakurainservices.in/socials",
          },
        ],
      },
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSocials) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">VERIFIED CREATOR ECOSYSTEM</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Official Social Profiles
              </h1>
              <p>
                To ensure authenticity and protect our community from impersonation, all verified
                Nina Kurain digital touchpoints are listed here. Every official profile reinforces
                the consistent identity: <strong>Nina Kurain — Digital Creator</strong>.
              </p>
            </div>
          </div>

          <div className="socials-page-grid">
            {channels.map((ch) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.name}
                  style={{
                    padding: "28px",
                    borderRadius: "var(--nk-radius-lg)",
                    background: "var(--nk-surface)",
                    border: "1px solid var(--nk-border)",
                    boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "var(--nk-surface-card)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--nk-rose-light)",
                      border: "1px solid var(--nk-border)"
                    }}>
                      {Icon ? <Icon size={22} /> : <span style={{ fontFamily: "var(--nk-font-serif)", fontWeight: 900, fontSize: 18 }}>P</span>}
                    </div>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: "rgba(224, 96, 134, 0.12)",
                      color: "var(--nk-rose-light)",
                      textTransform: "uppercase"
                    }}>
                      {ch.badge}
                    </span>
                  </div>

                  <div>
                    <h2 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "22px", margin: "0 0 4px", color: "var(--nk-text)" }}>
                      {ch.name}
                    </h2>
                    <span style={{ fontSize: "13px", color: "var(--nk-rose-light)", fontWeight: 600 }}>
                      {ch.handle}
                    </span>
                  </div>

                  <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--nk-text-muted)", margin: 0, flex: 1 }}>
                    {ch.description}
                  </p>

                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ justifyContent: "center", marginTop: "10px" }}
                  >
                    <span>{ch.cta}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Verification & Integrity Note */}
        <section className="public-section" style={{ paddingTop: "0" }}>
          <div style={{
            padding: "24px 30px",
            borderRadius: "var(--nk-radius-md)",
            background: "var(--nk-surface-card)",
            border: "1px solid var(--nk-border)",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}>
            <CheckCircle2 size={24} style={{ color: "#34d399", flexShrink: 0 }} />
            <div style={{ fontSize: "13.5px", color: "var(--nk-text-muted)", lineHeight: 1.6 }}>
              <strong>Official Identity Verification:</strong> Nina Kurain only communicates through verified
              accounts linked directly from this domain (<code>ninakurainservices.in</code>). Any third-party
              account not listed here is unauthorized.
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
