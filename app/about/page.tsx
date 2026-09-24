import type { Metadata } from "next";
import Link from "@/components/site-link";
import Image from "next/image";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { rows } from "@/lib/server/db";
import {
  Camera,
  Film,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Mail,
  Palette,
  Globe2,
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,
  PinterestIcon,
} from "@/components/social-icons";
import {
  NINA_ENTITY,
  getPersonSchema,
  getProfilePageSchema,
  getBreadcrumbListSchema,
} from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Nina Kurain | Digital Creator",
  description:
    "Official biography and creative profile of Nina Kurain, Digital Creator. Discover her photography, visual direction, videos, and official social channels.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/about`,
  },
  openGraph: {
    title: "About Nina Kurain | Digital Creator",
    description:
      "Official biography and creative profile of Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/about`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "About Nina Kurain — Digital Creator",
      },
    ],
    locale: "en_IN",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Nina Kurain | Digital Creator",
    description:
      "Official biography and creative profile of Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function AboutPage() {
  const settingsRows = await rows<{ key: string; value: string }>(
    "SELECT key,value FROM site_settings WHERE key IN ('creator_name','creator_bio','creator_instagram','creator_youtube','creator_facebook','creator_pinterest','creator_website')"
  );
  const config = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  const instagramUrl = config.creator_instagram || NINA_ENTITY.instagramUrl;
  const youtubeUrl = config.creator_youtube || NINA_ENTITY.youtubeUrl;
  const facebookUrl = config.creator_facebook || NINA_ENTITY.facebookUrl;
  const pinterestUrl = config.creator_pinterest || NINA_ENTITY.pinterestUrl;

  const pageUrl = `${NINA_ENTITY.canonicalBase}/about`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      getProfilePageSchema(pageUrl, "About Nina Kurain | Digital Creator"),
      getPersonSchema(),
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "About", url: pageUrl },
      ]),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main id="main-content">
        {/* Creator Identity Hero */}
        <section className="creator-hero" aria-label="Nina Kurain Biography">
          <div className="creator-hero-copy">
            <div className="creator-eyebrow">
              <span className="eyebrow-line" />
              <span>OFFICIAL CREATOR PROFILE</span>
            </div>

            <h1 style={{ fontSize: "clamp(32px, 6vw, 76px)" }}>
              Nina Kurain
              <em>Digital Creator</em>
            </h1>

            <p className="creator-subtitle">
              Visual Storyteller • Photography &amp; Creative Direction
            </p>

            <p className="creator-bio-p">
              Nina Kurain is an independent Digital Creator dedicated to exploring the nuances of
              contemporary editorial styling, portraiture, and visual storytelling. Through thoughtful
              composition and disciplined aesthetic direction, she documents her creative evolution
              across digital platforms.
            </p>

            <div className="creator-hero-actions">
              <Link href="/photos" className="btn-primary">
                <span>View Official Photography</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/collaborations" className="btn-secondary">
                <span>Collaborate</span>
              </Link>
            </div>
          </div>

          <div className="creator-hero-media" aria-label="Nina Kurain Official Studio Portrait">
            <div className="hero-portrait-frame">
              <Image
                src="/nina-gallery/nina-kurain-30.jpeg"
                alt="Nina Kurain — Digital Creator Official Studio Portrait Frame 30"
                width={1200}
                height={1600}
                className="hero-portrait-img"
                priority
              />
              <div className="hero-portrait-overlay" />
            </div>
            <div className="hero-floating-badge badge-top">
              <span className="badge-pulse-dot" />
              <div className="badge-text">
                <strong>OFFICIAL PORTRAIT</strong>
                <small>STUDIO ARCHIVE · 2026</small>
              </div>
            </div>
            <div className="hero-floating-badge badge-bottom">
              <Sparkles size={14} style={{ color: "var(--nk-rose-light)" }} />
              <div className="badge-text">
                <strong>NINA KURAIN</strong>
                <small>FRAME 30 · DIGITAL CREATOR</small>
              </div>
            </div>
          </div>
        </section>

        {/* Official Identity Dossier & Verification */}
        <section className="public-section" style={{ paddingTop: 0 }}>
          <div style={{ maxWidth: 840, margin: "0 auto" }}>
            <div className="dossier-card">
              <div className="dossier-header">
                <div className="dossier-monogram">
                  <span>NK</span>
                </div>
                <div className="dossier-title-wrap">
                  <span className="dossier-kicker">OFFICIAL CREATOR PROFILE</span>
                  <h3>Nina Kurain</h3>
                  <span className="dossier-role">Digital Creator • Visual Direction</span>
                </div>
              </div>

              <div className="dossier-divider" />

              <div className="dossier-specs">
                <div className="dossier-spec-item">
                  <span className="spec-label">Primary Discipline</span>
                  <span className="spec-value">Editorial Photography &amp; Motion</span>
                </div>
                <div className="dossier-spec-item">
                  <span className="spec-label">Official Domain</span>
                  <span className="spec-value">ninakurainservices.in</span>
                </div>
                <div className="dossier-spec-item">
                  <span className="spec-label">Primary Instagram</span>
                  <span className="spec-value">@kurain.bae</span>
                </div>
              </div>

              <div className="dossier-portals">
                <Link href="/photos" className="dossier-portal-link">
                  <div className="portal-icon"><Camera size={16} /></div>
                  <div className="portal-info">
                    <strong>Photographic Series</strong>
                    <span>Explore original studio works (51 frames)</span>
                  </div>
                  <ArrowRight size={14} />
                </Link>

                <Link href="/portfolio" className="dossier-portal-link">
                  <div className="portal-icon"><Palette size={16} /></div>
                  <div className="portal-info">
                    <strong>Creative Portfolio</strong>
                    <span>Curated works &amp; commercial campaigns</span>
                  </div>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="dossier-badge">
                <Globe2 size={13} style={{ color: "var(--nk-rose-light)" }} />
                <span>Canonical Profile Anchor • Verified Official</span>
              </div>
            </div>
          </div>
        </section>

        {/* In-Depth Narrative Biography & Artistic Journey */}
        <section className="public-section">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">ARTISTIC JOURNEY &amp; GENESIS</span>
              <h2>The Creative Evolution of Nina Kurain</h2>
              <p>
                From intimate studio lighting studies to nationwide digital recognition — documenting a disciplined commitment to authentic visual art.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginBottom: 48 }}>
            <div style={{ background: "var(--nk-surface)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-lg)", padding: "32px", display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--nk-rose-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>CHAPTER 01</span>
              <h3 style={{ fontSize: "22px", margin: 0, fontFamily: "var(--nk-font-serif)", color: "var(--nk-text)" }}>Origins &amp; Visual Storytelling</h3>
              <p style={{ fontSize: "14px", color: "var(--nk-text-muted)", lineHeight: 1.7, margin: 0 }}>
                Nina Kurain began her digital creative journey with a singular focus: to strip away the synthetic clutter of modern social feeds and return to intentional, sculptural photography. Grounded in classical Indian aesthetics yet influenced by modern European editorial minimalism, her early works explored how lighting, posture, and subtle movement can evoke deep emotional connection.
              </p>
            </div>

            <div style={{ background: "var(--nk-surface)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-lg)", padding: "32px", display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--nk-rose-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>CHAPTER 02</span>
              <h3 style={{ fontSize: "22px", margin: 0, fontFamily: "var(--nk-font-serif)", color: "var(--nk-text)" }}>Heritage Meets Contemporary Minimalism</h3>
              <p style={{ fontSize: "14px", color: "var(--nk-text-muted)", lineHeight: 1.7, margin: 0 }}>
                A defining hallmark of Nina&apos;s artistic voice is her interpretation of Indian textiles, sarees, and traditional styling through a modern lens. Rather than conventional catalog poses, each photograph treats fabric as an architectural element — celebrating the fluidity of silk, the warmth of earthy tones, and the poise of modern Indian womanhood.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Craft, Lighting & Optics */}
        <section className="public-section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">TECHNICAL METHODOLOGY</span>
              <h2>Lighting, Optics &amp; Aesthetic Craft</h2>
              <p>
                A deliberate synthesis of natural skin fidelity, directional lighting, and disciplined color science.
              </p>
            </div>
          </div>

          <div className="benefit-grid">
            <article>
              <Palette size={26} />
              <h3>Chiaroscuro &amp; Studio Lighting</h3>
              <p>
                Nina utilizes directional softboxes, bounce cards, and ambient golden-hour rim lighting to sculpt natural shadows, highlighting facial architecture without harsh digital flash.
              </p>
            </article>

            <article>
              <Camera size={26} />
              <h3>Optical Discipline &amp; Texture</h3>
              <p>
                Captured primarily on prime focal lengths (50mm and 85mm) to maintain natural proportions. Images celebrate real skin textures and fabric weaves with zero plastic over-smoothing.
              </p>
            </article>

            <article>
              <Film size={26} />
              <h3>Kinetic Cinematography</h3>
              <p>
                Translating static portraits into 4K 60fps cinematic reels and motion dispatches. Atmosphere, deliberate pacing, and rich color grading converge to tell intimate visual stories.
              </p>
            </article>
          </div>

          {/* Quick Credential Factsheet */}
          <div style={{ marginTop: 48, background: "var(--nk-surface-card)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-lg)", padding: "32px clamp(20px, 4vw, 44px)" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--nk-rose-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>OFFICIAL DOSSIER SUMMARY</span>
              <h3 style={{ fontSize: "24px", fontFamily: "var(--nk-font-serif)", margin: "6px 0 0" }}>Creator Specifications &amp; Overview</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
              <div style={{ borderLeft: "2px solid var(--nk-rose)", paddingLeft: 16 }}>
                <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Full Entity Name</span>
                <strong style={{ fontSize: "15px", color: "var(--nk-text)" }}>Nina Kurain</strong>
              </div>

              <div style={{ borderLeft: "2px solid var(--nk-rose)", paddingLeft: 16 }}>
                <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Primary Occupation</span>
                <strong style={{ fontSize: "15px", color: "var(--nk-text)" }}>Digital Creator &amp; Visual Artist</strong>
              </div>

              <div style={{ borderLeft: "2px solid var(--nk-rose)", paddingLeft: 16 }}>
                <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Active Works</span>
                <strong style={{ fontSize: "15px", color: "var(--nk-text)" }}>51 Archival High-Res Master Frames</strong>
              </div>

              <div style={{ borderLeft: "2px solid var(--nk-rose)", paddingLeft: 16 }}>
                <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Official Handle</span>
                <strong style={{ fontSize: "15px", color: "var(--nk-text)" }}>@kurain.bae</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Connected Official Channels */}
        <section className="public-section">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">OFFICIAL CHANNELS</span>
              <h2>Connected Profiles</h2>
              <p>Official verified social channels and platforms maintained by Nina Kurain.</p>
            </div>
          </div>

          <div className="social-platforms-grid">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-icon-wrapper"><InstagramIcon size={22} /></div>
              <strong>Instagram</strong>
              <span>@kurain.bae</span>
            </a>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-icon-wrapper"><YoutubeIcon size={22} /></div>
              <strong>YouTube</strong>
              <span>Official Channel</span>
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-icon-wrapper"><FacebookIcon size={22} /></div>
              <strong>Facebook</strong>
              <span>Nina Kurain</span>
            </a>
            <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-icon-wrapper"><PinterestIcon size={22} /></div>
              <strong>Pinterest</strong>
              <span>@NinaKurain</span>
            </a>
          </div>
        </section>

        {/* Inquiries Strip */}
        <div className="vip-banner-wrap">
          <div className="vip-banner">
            <div className="vip-banner-content">
              <h3>Collaborations &amp; Creative Inquiries</h3>
              <p>
                For editorial licensing, brand collaborations, and creative bookings, reach out directly.
              </p>
            </div>
            <div className="vip-banner-action">
              <Link href="/collaborations" className="vip-banner-btn">
                <span>Get in Touch</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter settings={{ name: config.creator_name, bio: config.creator_bio, instagram: instagramUrl, youtube: youtubeUrl, facebook: facebookUrl, pinterest: pinterestUrl, website: config.creator_website }} />
    </div>
  );
}
