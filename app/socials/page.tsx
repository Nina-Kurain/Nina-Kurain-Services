import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,
  PinterestIcon,
} from "@/components/social-icons";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { NINA_ENTITY, getBreadcrumbListSchema, getProfilePageSchema } from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain Official Social Profiles",
  description:
    "Official verified social media profiles for Nina Kurain, Digital Creator. Connect on Instagram, YouTube, Facebook, and Pinterest.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/socials`,
  },
  openGraph: {
    title: "Nina Kurain Official Social Profiles",
    description: "Official social media profiles for Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/socials`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Official Social Profiles",
      },
    ],
    locale: "en_IN",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Official Social Profiles",
    description: "Official social channels for Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function SocialsPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;

  const channels = [
    {
      name: "Instagram",
      handle: NINA_ENTITY.instagramHandle,
      url: settings.instagram || NINA_ENTITY.instagramUrl,
      icon: InstagramIcon,
      badge: "Primary Visual Hub",
      description: "Daily studio stories, editorial styling, visual reels, and announcements.",
      stats: "Official Account",
      cta: `Follow ${NINA_ENTITY.instagramHandle}`,
    },
    {
      name: "YouTube",
      handle: "Official Channel",
      url: settings.youtube || NINA_ENTITY.youtubeUrl,
      icon: YoutubeIcon,
      badge: "Cinematography & Motion",
      description: "Original 4K studio films, cinematic Shorts, and creative visual essays.",
      stats: "Official Channel",
      cta: "Subscribe on YouTube",
    },
    {
      name: "Facebook",
      handle: `${creatorName} Official`,
      url: settings.facebook || NINA_ENTITY.facebookUrl,
      icon: FacebookIcon,
      badge: "Community & Dispatches",
      description: "High-resolution photo albums, community updates, lifestyle reels, and project news.",
      stats: "Official Page",
      cta: "Connect on Facebook",
    },
    {
      name: "Pinterest",
      handle: "@NinaKurain",
      url: settings.pinterest || NINA_ENTITY.pinterestUrl,
      icon: PinterestIcon,
      badge: "Visual Moodboards",
      description: `Curated aesthetic boards: ${creatorName} Photography, Fashion Styling, Studio Portraits, and Lighting Inspiration.`,
      stats: "Official Boards",
      cta: "Explore on Pinterest",
    },
    {
      name: "X (Twitter)",
      handle: "@ninakurain",
      url: settings.x || "https://x.com/ninakurain",
      icon: PinterestIcon, // or generic icon
      badge: "Dispatches & Thoughts",
      description: "Quick updates, creative dispatches, editorial thoughts, and production notes.",
      stats: "Official Profile",
      cta: "Follow on X",
    },
    {
      name: "Official Website",
      handle: "ninakurainservices.in",
      url: settings.website || NINA_ENTITY.canonicalBase,
      icon: PinterestIcon,
      badge: "Canonical Digital Hub",
      description: "Primary home for full-resolution photography galleries, official biography, press kits, and verified links.",
      stats: "First-Party Verified",
      cta: "Visit Homepage",
    },
    ...(settings.whatsapp ? [{
      name: "WhatsApp Direct",
      handle: "Official Communications",
      url: settings.whatsapp.startsWith("http") ? settings.whatsapp : `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`,
      icon: PinterestIcon,
      badge: "Direct Contact Desk",
      description: "Verified messaging channel for professional inquiries, brand bookings, and accredited media.",
      stats: "Creator Office",
      cta: "Chat on WhatsApp",
    }] : []),
    {
      name: "VIP Members Portal",
      handle: "vip.ninakurainservices.in",
      url: settings.vipUrl || "https://vip.ninakurainservices.in/",
      icon: PinterestIcon,
      badge: "Supporter Sanctuary",
      description: "Private sanctuary for dedicated patrons with uncensored archives, member-only drops, and community feed.",
      stats: "VIP Portal",
      cta: "Enter Member Portal",
    },
  ];

  const pageUrl = `${NINA_ENTITY.canonicalBase}/socials`;

  const jsonLdSocials = {
    "@context": "https://schema.org",
    "@graph": [
      getProfilePageSchema(pageUrl, `${creatorName} Official Social Profiles`),
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Socials", url: pageUrl },
      ]),
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
              <span className="section-kicker">OFFICIAL PROFILES</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Official Social Profiles
              </h1>
              <p>
                To ensure authenticity and protect our community from impersonation, all official
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
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "20px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--nk-radius-sm)",
                        background: "rgba(224, 96, 134, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--nk-rose)",
                      }}>
                        <Icon size={22} />
                      </div>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "var(--nk-rose-light)",
                        background: "rgba(224, 96, 134, 0.1)",
                        padding: "4px 10px",
                        borderRadius: 999,
                        textTransform: "uppercase"
                      }}>
                        {ch.badge}
                      </span>
                    </div>

                    <h2 style={{ fontSize: "20px", margin: "0 0 4px", fontFamily: "var(--nk-font-serif)" }}>
                      {ch.name}
                    </h2>
                    <span style={{ fontSize: "13px", color: "var(--nk-accent-champagne)", fontWeight: 600, display: "block", marginBottom: "12px" }}>
                      {ch.handle}
                    </span>
                    <p style={{ fontSize: "14px", color: "var(--nk-text-muted)", lineHeight: 1.6, margin: 0 }}>
                      {ch.description}
                    </p>
                  </div>

                  <div style={{ paddingTop: "16px", borderTop: "1px solid var(--nk-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--nk-text-subtle)", display: "flex", alignItems: "center", gap: 5 }}>
                      <CheckCircle2 size={13} style={{ color: "#34d399" }} />
                      {ch.stats}
                    </span>
                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ fontSize: "13px", padding: "8px 16px" }}
                    >
                      <span>{ch.cta}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
