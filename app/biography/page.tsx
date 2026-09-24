import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Camera, Sparkles, ArrowRight, ShieldCheck, Heart, ExternalLink, Calendar, MapPin, Award } from "lucide-react";
import { InstagramIcon, YoutubeIcon, FacebookIcon, PinterestIcon } from "@/components/social-icons";
import { NINA_ENTITY, getBreadcrumbListSchema, getPersonSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain Biography | Official Life, Career & Creative Journey",
  description:
    "Official comprehensive biography of Nina Kurain, Digital Creator and visual artist. Learn about her artistic philosophy, editorial photography, and digital journey.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/biography`,
  },
  openGraph: {
    title: "Nina Kurain Biography | Official Life, Career & Creative Journey",
    description: "Official comprehensive biography of Nina Kurain, Digital Creator and visual artist.",
    url: `${NINA_ENTITY.canonicalBase}/biography`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-kurain-og.jpg", width: 1376, height: 768, alt: "Nina Kurain Biography" }],
    locale: "en_IN",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Biography | Official Life, Career & Creative Journey",
    description: "Official comprehensive biography of Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function BiographyPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/biography`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${creatorName} Official Biography`,
        description: `Official comprehensive biographical record of ${creatorName}, Digital Creator.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getPersonSchema(),
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Biography", url: pageUrl },
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
              <span className="section-kicker">DOCUMENTARY ARCHIVE</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain — Official Biography
              </h1>
              <p>
                The verified biographical profile, artistic journey, and creative timeline of Digital Creator Nina Kurain.
              </p>
            </div>
          </div>

          <div className="about-grid">
            <div className="about-text-col">
              <div className="editorial-prose">
                <h2>Artistic Origins &amp; Background</h2>
                <p>
                  <strong>{creatorName}</strong> is an independent Indian <em>Digital Creator</em> and visual artist celebrated for her distinctive photographic aesthetic, characterized by chiaroscuro lighting, contemporary ethnic styling, and atmospheric visual storytelling.
                </p>
                <p>
                  Beginning her creative exploration through self-directed portrait sessions and digital publishing, Nina developed a nuanced aesthetic that harmonizes classical South Asian sensibilities with modern editorial restraint. Her work rejects superficial fast-fashion imagery in favor of deliberate shadow play, organic textures, and cinematic depth.
                </p>

                <h2>Creative Evolution &amp; Disciplines</h2>
                <p>
                  Operating from her private studio space, Nina oversees every dimension of her visual output — including concept conception, moodboard curation, lighting design, and post-production tonal grading. Her primary creative disciplines include:
                </p>
                <ul>
                  <li><strong>Fine-Art Portraiture:</strong> Exploring character, expression, and high-contrast ambient illumination.</li>
                  <li><strong>Contemporary Ethnic Styling:</strong> Modern interpretations of handloom weaves, silk silhouettes, and minimalist adornment.</li>
                  <li><strong>Atmospheric Motion &amp; Cinematography:</strong> 4K visual studies capturing rhythmic motion, fabric drape, and subtle tension.</li>
                  <li><strong>Digital Creator Curation:</strong> Direct audience relationships through private archives, creator notes, and curated releases.</li>
                </ul>

                <h2>Philosophy: Deliberate Restraint &amp; Visual Truth</h2>
                <p>
                  In a digital landscape inundated with algorithmic urgency, Nina champions deliberate craftsmanship. She employs low-key tungsten and natural directional light to sculpt silhouettes, capturing the authentic texture of skin and textiles without artificial distortion.
                </p>

                <h2>Verified Presence &amp; Canonical Authority</h2>
                <p>
                  To protect creative integrity and ensure audience safety against third-party impersonation, all official releases, high-resolution photo archives, and commercial engagements are centralized through this verified domain: <code>https://ninakurainservices.in/</code>.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "32px" }}>
                  <a href={settings.instagram || NINA_ENTITY.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <InstagramIcon size={16} />
                    <span>Follow @kurain.bae</span>
                    <ExternalLink size={13} />
                  </a>
                  <Link href="/photos" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Camera size={16} />
                    <span>Explore Photo Gallery</span>
                  </Link>
                  <Link href="/wiki" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span>Wikipedia Archive</span>
                  </Link>
                  <Link href="/pricing" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span>Memberships</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="about-sidebar-col">
              <div className="about-bio-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(224, 96, 134, 0.15)", display: "grid", placeItems: "center", color: "var(--nk-rose-light)" }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "17px" }}>{creatorName}</h3>
                    <small style={{ color: "var(--nk-rose-light)", fontWeight: 700 }}>VERIFIED CREATOR DOSSIER</small>
                  </div>
                </div>

                <div className="bio-fact-row">
                  <span>Occupation:</span>
                  <strong>Digital Creator • Visual Artist</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Canonical Website:</span>
                  <strong>ninakurainservices.in</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Primary Instagram:</span>
                  <strong>@kurain.bae</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Focus Disciplines:</span>
                  <strong>Portraiture • Styling • Motion</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Nationality:</span>
                  <strong>Indian</strong>
                </div>
                <div className="bio-fact-row">
                  <span>Archive Access:</span>
                  <strong>Free &amp; Patron Tiers</strong>
                </div>

                <hr style={{ borderColor: "var(--nk-border)", margin: "20px 0" }} />

                <h4 style={{ fontSize: "13px", letterSpacing: "0.08em", color: "var(--nk-text-subtle)", textTransform: "uppercase", marginBottom: 12 }}>
                  Connected Official Pages
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "13px" }}>
                  <Link href="/about" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>About Overview</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link href="/wiki" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Wikipedia Encyclopedia Page</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link href="/entity" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Entity Knowledge Graph</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link href="/lookbook" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Visual Lookbook</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link href="/net-worth" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Career &amp; Brand Valuation</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link href="/collaborations" style={{ color: "var(--nk-rose-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Brand Collaborations</span>
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
