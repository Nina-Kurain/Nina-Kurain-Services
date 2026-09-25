import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/site-link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { PHOTOS_DATA } from "@/lib/photos-data";
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
} from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema, getImageObjectSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

interface PhotoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PHOTOS_DATA.map((p) => ({ slug: p.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { photos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const photo = photos.find((p) => p.slug === slug || p.id === slug) || PHOTOS_DATA.find((p) => p.slug === slug);
  if (!photo) return { title: "Photograph Not Found" };

  const photoImg = "image" in photo ? photo.image : photo.src;
  const pageCanonical = `${NINA_ENTITY.canonicalBase}/photos/${photo.slug}`;

  return {
    title: `${photo.title} by ${creatorName} | Official Photograph`,
    description: `${photo.caption} Official photograph of ${creatorName}, Digital Creator. Captured under deliberate studio direction.`,
    alternates: {
      canonical: pageCanonical,
    },
    openGraph: {
      title: `${photo.title} | ${creatorName} — Digital Creator`,
      description: photo.caption,
      url: pageCanonical,
      siteName: creatorName,
      images: [
        {
          url: photoImg,
          width: photo.width || 1086,
          height: photo.height || 1448,
          alt: photo.title,
        },
      ],
      locale: "en_IN",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${photo.title} | ${creatorName}`,
      description: photo.caption,
      images: [photoImg],
    },
  };
}

export default async function SinglePhotoPage({ params }: PhotoPageProps) {
  const { slug } = await params;
  const { photos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;

  const rawPhoto = photos.find((p) => p.slug === slug || p.id === slug) || PHOTOS_DATA.find((p) => p.slug === slug);
  if (!rawPhoto) notFound();

  const photo = {
    slug: rawPhoto.slug,
    title: rawPhoto.title,
    heading: "heading" in rawPhoto ? rawPhoto.heading : rawPhoto.title,
    tag: rawPhoto.tag || "Signature Series",
    category: rawPhoto.category || "Portraits",
    src: "image" in rawPhoto ? rawPhoto.image : rawPhoto.src,
    alt: "alt" in rawPhoto ? rawPhoto.alt : `${creatorName} — ${rawPhoto.title}`,
    width: rawPhoto.width || 1086,
    height: rawPhoto.height || 1448,
    caption: rawPhoto.caption,
    description: rawPhoto.description,
    datePublished: rawPhoto.datePublished || "2026-08-15",
    locationCreated: "locationCreated" in rawPhoto ? rawPhoto.locationCreated : "Studio Archive, India",
    tags: "tags" in rawPhoto ? rawPhoto.tags : [creatorName, "Digital Creator", "Photography"],
  };

  const relatedPhotos = photos
    .filter((p) => p.slug !== photo.slug && !p.image.startsWith("/nina-kurain") && !p.image.startsWith("/seductive"))
    .slice(0, 3);
  const pageUrl = `${NINA_ENTITY.canonicalBase}/photos/${photo.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      getImageObjectSchema({
        id: `${pageUrl}#image`,
        url: photo.src,
        pageUrl,
        name: photo.heading,
        caption: photo.caption,
        description: photo.description,
        width: photo.width,
        height: photo.height,
        datePublished: photo.datePublished,
        creditText: creatorName,
        copyrightNotice: `© 2026 ${creatorName}. All rights reserved.`,
        license: `${NINA_ENTITY.canonicalBase}/terms-and-conditions`,
        acquireLicensePage: pageUrl,
      }),
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Photos", url: `${NINA_ENTITY.canonicalBase}/photos` },
        { name: photo.title, url: pageUrl },
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
        {/* Breadcrumb Navigation */}
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px clamp(16px, 3.5vw, 40px) 0" }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: "13px", color: "var(--nk-text-subtle)", display: "flex", gap: "8px", alignItems: "center" }}>
            <Link href="/" style={{ color: "var(--nk-text-muted)" }}>{creatorName}</Link>
            <span>/</span>
            <Link href="/photos" style={{ color: "var(--nk-text-muted)" }}>Photos</Link>
            <span>/</span>
            <span style={{ color: "var(--nk-rose-light)" }}>{photo.title}</span>
          </nav>
        </div>

        {/* Detailed Image Presentation */}
        <article className="public-section" style={{ paddingTop: "20px" }}>
          <div className="photo-detail-grid">
            {/* Visual Frame */}
            <div style={{
              position: "relative",
              borderRadius: "var(--nk-radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--nk-border)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              background: "var(--nk-surface-card, #120912)",
              minHeight: "420px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {photo.src.startsWith("/nina-kurain") || photo.src.startsWith("/seductive") ? (
                <div style={{ textAlign: "center", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(224, 96, 134, 0.12)",
                    color: "var(--nk-rose-light)",
                    display: "grid",
                    placeItems: "center",
                  }}>
                    <Camera size={30} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", color: "var(--nk-rose)", textTransform: "uppercase" }}>
                    STUDIO FOLIO ENTRY
                  </span>
                  <h2 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "22px", margin: 0, color: "var(--nk-text)" }}>
                    Original Master Negative in Curation
                  </h2>
                  <p style={{ maxWidth: "420px", fontSize: "13.5px", color: "var(--nk-text-muted)", margin: 0, lineHeight: 1.6 }}>
                    This photographic study is in active studio cataloging. Full high-resolution visuals are released via the Creator Studio.
                  </p>
                </div>
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  priority
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              )}
            </div>

            {/* Context & Metadata Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <span className="section-kicker">{photo.tag} • {photo.category}</span>
              
              <h1 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "clamp(32px, 3.6vw, 48px)", margin: 0, lineHeight: 1.1 }}>
                {photo.title}
              </h1>

              <div style={{
                padding: "16px 20px",
                borderRadius: "var(--nk-radius-md)",
                background: "var(--nk-surface)",
                border: "1px solid var(--nk-border)",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "var(--nk-accent-champagne)",
                fontStyle: "italic"
              }}>
                &ldquo;{photo.caption}&rdquo;
              </div>

              <div style={{ color: "var(--nk-text-muted)", fontSize: "15px", lineHeight: 1.7 }}>
                <p style={{ margin: "0 0 16px" }}>{photo.description}</p>
                <p style={{ margin: "0" }}>
                  This photograph represents {creatorName}&apos;s disciplined approach to visual storytelling,
                  balancing shadow depth, natural skin tones, and texture fidelity. Produced as part of her
                  ongoing creative dispatches, it reflects her focused aesthetic within contemporary digital creation.
                </p>
              </div>

              {/* Technical Photo Metadata */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                padding: "20px",
                borderRadius: "var(--nk-radius-md)",
                background: "var(--nk-surface-card)",
                border: "1px solid var(--nk-border-subtle)"
              }}>
                <div>
                  <small style={{ display: "block", color: "var(--nk-text-subtle)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Creator
                  </small>
                  <Link href="/about" style={{ color: "var(--nk-text)", fontWeight: 600, fontSize: "14px" }}>
                    {creatorName}
                  </Link>
                </div>

                <div>
                  <small style={{ display: "block", color: "var(--nk-text-subtle)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Resolution
                  </small>
                  <strong style={{ color: "var(--nk-text)", fontSize: "14px" }}>
                    {photo.width} × {photo.height}
                  </strong>
                </div>

                <div>
                  <small style={{ display: "block", color: "var(--nk-text-subtle)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Format
                  </small>
                  <strong style={{ color: "var(--nk-text)", fontSize: "14px" }}>
                    WebP Master
                  </strong>
                </div>

                <div>
                  <small style={{ display: "block", color: "var(--nk-text-subtle)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Canonical URL
                  </small>
                  <span style={{ color: "var(--nk-rose-light)", fontSize: "12px", wordBreak: "break-all" }}>
                    /photos/{photo.slug}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                <Link href="/collaborations" className="btn-primary">
                  <span>Licensing Inquiries</span>
                  <ArrowRight size={14} />
                </Link>
                <Link href="/photos" className="btn-secondary">
                  <ArrowLeft size={14} />
                  <span>Back to Gallery</span>
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related Photographs */}
        {relatedPhotos.length > 0 && (
          <section className="public-section">
            <div className="section-head">
              <div className="section-head-copy">
                <span className="section-kicker">MORE FROM THE ARCHIVE</span>
                <h2>Related Photographs</h2>
              </div>
            </div>

            <div className="photo-grid">
              {relatedPhotos.map((item) => (
                <Link key={item.slug} href={`/photos/${item.slug}`} className="photo-card">
                  <div className="photo-card-media">
                    <Image
                      src={item.image}
                      alt={`${creatorName} — ${item.title}`}
                      width={500}
                      height={625}
                      className="photo-card-img"
                    />
                    <span className="photo-card-tag is-featured">
                      <Sparkles size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                      Series
                    </span>
                  </div>
                  <div className="photo-card-details">
                    <h3>{item.title}</h3>
                    <p>{item.caption}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
