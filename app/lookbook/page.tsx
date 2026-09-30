import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Camera, ArrowRight, Sparkles } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema, getImageObjectSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { PHOTOS_DATA } from "@/lib/photos-data";
import { ARCHIVAL_LOOKS, filterPhotosByLook } from "@/lib/looks-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — Official Visual Lookbook | Curated Themes & Styling",
  description:
    "Explore the official visual lookbook of Nina Kurain, Digital Creator. Discover 4 curated looks, contemporary ethnic wardrobe palettes, and directional studio photography.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/lookbook`,
  },
  openGraph: {
    title: "Nina Kurain — Official Visual Lookbook",
    description: "Curated seasonal aesthetics, ethnic styling, and studio portraiture by Nina Kurain.",
    url: `${NINA_ENTITY.canonicalBase}/lookbook`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-gallery/nina-kurain-22.jpeg", width: 1200, height: 1600, alt: "Nina Kurain Lookbook" }],
    locale: "en_IN",
    type: "website",
  },
};

const LOOK_PALETTES: Record<string, string[]> = {
  "look-01": ["#120912", "#e06086", "#d4af37", "#f5e6d3"],
  "look-02": ["#0b070c", "#444444", "#999999", "#f5f5f7"],
  "look-03": ["#231219", "#e24b78", "#f0a2ba", "#fff3ea"],
  "look-04": ["#08040a", "#2a1020", "#c4406a", "#eedde5"],
};

export default async function LookbookPage() {
  const { settings, photos } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/lookbook`;

  const pool = (photos.length > 0 ? photos : PHOTOS_DATA) as Array<{
    slug: string;
    title: string;
    caption?: string;
    description?: string;
    image?: string;
    src?: string;
    width?: number;
    height?: number;
    datePublished?: string;
  }>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${creatorName} Visual Lookbook`,
        description: `Official aesthetic lookbook and seasonal styling themes by ${creatorName}.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Lookbook", url: pageUrl },
      ]),
      ...pool.slice(0, 16).map((photo) =>
        getImageObjectSchema({
          id: `${NINA_ENTITY.canonicalBase}/photos/${photo.slug}#image`,
          url: photo.image || photo.src || "/nina-gallery/nina-kurain-01.jpeg",
          pageUrl: `${NINA_ENTITY.canonicalBase}/photos/${photo.slug}`,
          name: photo.title,
          caption: photo.caption,
          description: photo.description,
          width: photo.width || 1086,
          height: photo.height || 1448,
          datePublished: photo.datePublished || "2026-08-15",
          creditText: creatorName,
          copyrightNotice: `© 2026 ${creatorName}. All rights reserved.`,
          license: `${NINA_ENTITY.canonicalBase}/terms-and-conditions`,
          acquireLicensePage: `${NINA_ENTITY.canonicalBase}/photos/${photo.slug}`,
        })
      ),
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
                A study in tone, texture, and silhouette. Click into any signature look suite to isolate and explore its dedicated curated photographic collection.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 54 }}>
            {ARCHIVAL_LOOKS.map((look) => {
              const lookPhotos = filterPhotosByLook(pool, look);
              const previewPhotos = lookPhotos.slice(0, 4);
              const palette = LOOK_PALETTES[look.id] || ["#120912", "#e24b78", "#d4af37", "#f5e6d3"];

              return (
                <div
                  key={look.id}
                  style={{
                    background: "var(--nk-surface-card)",
                    border: "1px solid var(--nk-border)",
                    borderRadius: "var(--nk-radius-lg)",
                    padding: "clamp(20px, 4vw, 40px)",
                    boxShadow: "var(--nk-card-shadow)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 16,
                      marginBottom: 24,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--nk-rose)",
                            background: "rgba(226, 75, 120, 0.12)",
                            padding: "3px 10px",
                            borderRadius: 99,
                          }}
                        >
                          {look.num}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--nk-accent-champagne)", fontWeight: 700 }}>
                          {lookPhotos.length} Curated Frames
                        </span>
                      </div>
                      <h2 style={{ fontSize: "clamp(24px, 3.2vw, 32px)", margin: "0 0 8px", fontFamily: "var(--nk-font-serif)" }}>
                        {look.title}
                      </h2>
                      <p style={{ margin: 0, color: "var(--nk-text-muted)", maxWidth: 580, fontSize: "14.5px", lineHeight: 1.6 }}>
                        {look.desc}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Palette:</span>
                        {palette.map((color, i) => (
                          <span
                            key={i}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: color,
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                            title={color}
                          />
                        ))}
                      </div>

                      <Link
                        href={`/photos?look=${look.slug}`}
                        className="btn-primary"
                        style={{
                          fontSize: "12.5px",
                          padding: "8px 18px",
                          borderRadius: "var(--nk-radius-full)",
                          gap: 6,
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <Sparkles size={13} />
                        <span>Explore {look.num} Suite ({lookPhotos.length} Frames)</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                    {previewPhotos.map((photo) => {
                      const imgSrc = photo.image || photo.src;
                      return (
                        <Link
                          key={photo.slug}
                          href={`/photos?look=${look.slug}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div
                            style={{
                              position: "relative",
                              borderRadius: "var(--nk-radius-md)",
                              overflow: "hidden",
                              border: "1px solid var(--nk-border-subtle)",
                              aspectRatio: "3/4",
                              background: "#0a0508",
                            }}
                          >
                            <Image
                              src={imgSrc || "/nina-gallery/nina-kurain-01.jpeg"}
                              alt={photo.title || `${creatorName} ${look.title}`}
                              fill
                              sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw"
                              style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                padding: 14,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 800,
                                  letterSpacing: "0.1em",
                                  color: "var(--nk-rose-light)",
                                  textTransform: "uppercase",
                                }}
                              >
                                {look.num}
                              </span>
                              <strong style={{ fontSize: "13px", color: "#fff", margin: "2px 0 0" }}>
                                {photo.title}
                              </strong>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <Link
                href="/photos"
                className="btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px" }}
              >
                <Camera size={18} />
                <span>Browse Full Archival Gallery ({pool.length} Works)</span>
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
