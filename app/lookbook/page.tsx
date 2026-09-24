import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Sparkles, Camera, ArrowRight, Eye, Layers } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { PHOTOS_DATA } from "@/lib/photos-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — Official Visual Lookbook | Curated Themes & Styling",
  description:
    "Explore the official visual lookbook of Nina Kurain, Digital Creator. Discover seasonal aesthetics, contemporary ethnic wardrobe palettes, and curated studio photography.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/lookbook`,
  },
  openGraph: {
    title: "Nina Kurain — Official Visual Lookbook",
    description: "Curated seasonal aesthetics, ethnic styling, and studio portraiture by Nina Kurain.",
    url: `${NINA_ENTITY.canonicalBase}/lookbook`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-gallery/nina-kurain-01.jpeg", width: 1200, height: 1600, alt: "Nina Kurain Lookbook" }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function LookbookPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/lookbook`;

  const themes = [
    {
      id: "theme-1",
      title: "I. Signature Studio Chiaroscuro",
      palette: ["#120912", "#e06086", "#d4af37", "#f5e6d3"],
      desc: "Warm ambient key lights sculpting low-key obsidian portraits with deliberate restraint.",
      photos: PHOTOS_DATA.slice(0, 4),
    },
    {
      id: "theme-2",
      title: "II. Contemporary Ethnic Drapes",
      palette: ["#2a1020", "#c4406a", "#8c284a", "#fff1f4"],
      desc: "Modern interpretations of traditional sarees, handloom silks, and minimalist adornment.",
      photos: PHOTOS_DATA.slice(4, 8),
    },
    {
      id: "theme-3",
      title: "III. Editorial Shadow & Texture",
      palette: ["#0a0508", "#e699b0", "#5c1830", "#ffffff"],
      desc: "Deliberate interplay between sheer fabrics, intimate shadows, and textural skin highlights.",
      photos: PHOTOS_DATA.slice(8, 12),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${creatorName} Visual Lookbook`,
        description: `Official aesthetic lookbook and seasonal styling themes by ${creatorName}.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Lookbook", url: pageUrl },
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
              <span className="section-kicker">CURATED VISUAL THEMES</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain — Visual Lookbook
              </h1>
              <p>
                A study in tone, texture, and silhouette. Explore the thematic aesthetic suites defining {creatorName}&apos;s visual world.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 54 }}>
            {themes.map((theme) => (
              <div key={theme.id} style={{ background: "var(--nk-surface-card)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-lg)", padding: "clamp(20px, 4vw, 40px)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", margin: "0 0 8px", fontFamily: "var(--nk-font-serif)" }}>
                      {theme.title}
                    </h2>
                    <p style={{ margin: 0, color: "var(--nk-text-muted)", maxWidth: 580 }}>
                      {theme.desc}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Palette:</span>
                    {theme.palette.map((color, i) => (
                      <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: color, border: "1px solid rgba(255,255,255,0.2)" }} title={color} />
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  {theme.photos.map((photo) => (
                    <Link key={photo.slug} href={`/photos/${photo.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ position: "relative", borderRadius: "var(--nk-radius-md)", overflow: "hidden", border: "1px solid var(--nk-border-subtle)", aspectRatio: "3/4", background: "#0a0508" }}>
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw"
                          style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14 }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", color: "var(--nk-rose-light)", textTransform: "uppercase" }}>
                            {photo.category}
                          </span>
                          <strong style={{ fontSize: "13px", color: "#fff", margin: "2px 0 0" }}>
                            {photo.title}
                          </strong>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <Link href="/photos" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px" }}>
                <Camera size={18} />
                <span>Browse All 58 Gallery Photographs</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
