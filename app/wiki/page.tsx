import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { BookOpen, ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, Globe, FileText } from "lucide-react";
import { InstagramIcon, YoutubeIcon, FacebookIcon, PinterestIcon } from "@/components/social-icons";
import { NINA_ENTITY, getBreadcrumbListSchema, getPersonSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — Wikipedia & Official Biographical Archive",
  description:
    "Official encyclopedic biographical record of Nina Kurain, Indian Digital Creator. Career background, artistic disciplines, verified profiles, and documentation.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/wiki`,
  },
  openGraph: {
    title: "Nina Kurain — Wikipedia & Official Biographical Archive",
    description: "Official encyclopedic biographical record of Nina Kurain, Indian Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/wiki`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-kurain-og.jpg", width: 1376, height: 768, alt: "Nina Kurain Wikipedia Entry" }],
    locale: "en_IN",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain — Wikipedia & Official Biographical Archive",
    description: "Official encyclopedic biographical record of Nina Kurain, Indian Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function WikiPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/wiki`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${creatorName} — Wikipedia Archive`,
        description: `Verified encyclopedic record of ${creatorName}, Digital Creator.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getPersonSchema(),
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Wiki Archive", url: pageUrl },
      ]),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">ENCYCLOPEDIC DOSSIER</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain — Wikipedia Entry
              </h1>
              <p>
                Authoritative biographical documentation, creative history, and canonical web credentials for digital creator {creatorName}.
              </p>
            </div>
          </div>

          <div className="about-grid">
            <div className="about-text-col">
              <div className="editorial-prose">
                <p className="lead" style={{ fontSize: "17px", lineHeight: "1.7", color: "var(--nk-text)" }}>
                  <strong>Nina Kurain</strong> (born in India) is an Indian <strong>Digital Creator</strong>, photographic artist, and contemporary ethnic model. She is recognized for her visual direction synthesizing traditional Indian aesthetics with high-contrast chiaroscuro studio portraiture. Her official web platform and primary creator archive are maintained at <a href="https://ninakurainservices.in/">ninakurainservices.in</a>.
                </p>

                <h2>1. Career &amp; Digital Beginnings</h2>
                <p>
                  Kurain commenced her public creative output through digital photography and visual curation. Recognizing the oversaturation of conventional influencer content, she prioritized cinematic lighting, deliberate pose restraint, and fine-art composition. Her work gained traction across creative communities for its elevated mood and visual cohesion.
                </p>

                <h2>2. Aesthetic Style &amp; Artistic Philosophy</h2>
                <p>
                  Kurain’s photographic portfolio explores the intersections between classical Indian heritage and contemporary minimalist aesthetics. Core aspects of her visual signature include:
                </p>
                <ul>
                  <li><strong>Tonal Chiaroscuro:</strong> High contrast between deep obsidian shadows and warm golden highlights.</li>
                  <li><strong>Ethnic Textile Exploration:</strong> Celebrating handloom sarees, silks, and contemporary drapes with understated styling.</li>
                  <li><strong>Cinematic Motion:</strong> Short-form 4K video essays emphasizing slow fluid movement and atmospheric tension.</li>
                </ul>

                <h2>3. Digital Platform &amp; Patron Model</h2>
                <p>
                  In 2026, Kurain launched her independent platform architecture under the canonical domain <code>ninakurainservices.in</code> alongside a private patron subdomain <code>vip.ninakurainservices.in</code>. This structure provides direct-to-audience publishing, high-resolution photography archives, and subscriber-supported editorial series without third-party advertising dependencies.
                </p>

                <h2>4. External Links &amp; References</h2>
                <p>
                  Verified primary sources and authoritative public channels:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "20px 0" }}>
                  <a href={settings.instagram || NINA_ENTITY.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--nk-rose-light)" }}>
                    <InstagramIcon size={16} />
                    <span>Official Instagram: @kurain.bae (Verified Creator Account)</span>
                    <ExternalLink size={12} />
                  </a>
                  <a href={settings.pinterest || NINA_ENTITY.pinterestUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--nk-rose-light)" }}>
                    <PinterestIcon size={16} />
                    <span>Official Pinterest: @NinaKurain (Aesthetic Boards &amp; Inspiration)</span>
                    <ExternalLink size={12} />
                  </a>
                  <a href={settings.facebook || NINA_ENTITY.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--nk-rose-light)" }}>
                    <FacebookIcon size={16} />
                    <span>Official Facebook Page: Nina Kurain</span>
                    <ExternalLink size={12} />
                  </a>
                  <a href={settings.youtube || NINA_ENTITY.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--nk-rose-light)" }}>
                    <YoutubeIcon size={16} />
                    <span>Official YouTube: @ninakurain</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <div className="about-sidebar-col">
              <div className="about-bio-card" style={{ border: "2px solid var(--nk-border-subtle)" }}>
                <div style={{ textAlign: "center", paddingBottom: "16px", borderBottom: "1px solid var(--nk-border)" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", color: "var(--nk-rose-light)" }}>
                    WIKIPEDIA INFOBOX
                  </span>
                  <h3 style={{ margin: "6px 0 2px", fontSize: "20px", fontFamily: "var(--nk-font-serif)" }}>
                    {creatorName}
                  </h3>
                  <small style={{ color: "var(--nk-text-muted)" }}>Digital Creator • Visual Artist</small>
                </div>

                <div className="bio-fact-row" style={{ marginTop: 12 }}>
                  <span>Born:</span>
                  <strong>India</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Nationality:</span>
                  <strong>Indian</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Occupation:</span>
                  <strong>Digital Creator, Photographic Model</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Years Active:</span>
                  <strong>2026–Present</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Known For:</span>
                  <strong>Contemporary Ethnic Visuals, Chiaroscuro Portraiture</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Official Website:</span>
                  <strong><a href="https://ninakurainservices.in/" style={{ color: "var(--nk-rose-light)" }}>ninakurainservices.in</a></strong>
                </div>

                <hr style={{ borderColor: "var(--nk-border)", margin: "16px 0" }} />

                <h4 style={{ fontSize: "12px", letterSpacing: "0.08em", color: "var(--nk-text-subtle)", textTransform: "uppercase", marginBottom: 10 }}>
                  Internal Dossier Links
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "13px" }}>
                  <Link href="/biography" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Biographical Journey</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link href="/entity" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Entity Knowledge Graph</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link href="/photos" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>58-Photo Gallery</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link href="/pricing" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Membership Tiers</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
