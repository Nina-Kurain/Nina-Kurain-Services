import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/site-link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { PHOTOS_DATA, PhotoItem } from "@/lib/photos-data";
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
  Lock,
  ArrowUpRight,
} from "lucide-react";

interface PhotoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PHOTOS_DATA.map((p) => ({ slug: p.slug }));
}

import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { photos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || "Nina Kurain";
  const photo = photos.find((p) => p.slug === slug || p.id === slug) || PHOTOS_DATA.find((p) => p.slug === slug);
  if (!photo) return { title: "Photograph Not Found" };

  const photoImg = "image" in photo ? photo.image : photo.src;

  return {
    title: `${photo.title} by ${creatorName} | Official Photograph`,
    description: `${photo.caption} Official photograph of ${creatorName}, Digital Creator and model. Available in high-resolution WebP.`,
    keywords: [photo.title, creatorName, `${creatorName} Photos`, "Digital Creator"],
    alternates: {
      canonical: `https://ninakurainservices.in/photos/${photo.slug}`,
    },
    openGraph: {
      title: `${photo.title} | ${creatorName} — Digital Creator`,
      description: photo.caption,
      url: `https://ninakurainservices.in/photos/${photo.slug}`,
      siteName: creatorName,
      images: [
        {
          url: photoImg,
          width: photo.width || 1200,
          height: photo.height || 1600,
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
      creator: "@ninakurain",
    },
  };
}

export default async function SinglePhotoPage({ params }: PhotoPageProps) {
  const { slug } = await params;
  const { photos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || "Nina Kurain";

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
    width: rawPhoto.width || 1200,
    height: rawPhoto.height || 1600,
    caption: rawPhoto.caption,
    description: rawPhoto.description,
    datePublished: rawPhoto.datePublished || "2026-09-24",
    locationCreated: "locationCreated" in rawPhoto ? rawPhoto.locationCreated : "Studio Archive, India",
    tags: "tags" in rawPhoto ? rawPhoto.tags : [creatorName, "Digital Creator", "Photography"],
    isPremium: Boolean("isPremium" in rawPhoto ? rawPhoto.isPremium : false),
  };

  const relatedPhotos = photos.filter((p) => p.slug !== photo.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ImageObject",
        "@id": `https://ninakurainservices.in/photos/${photo.slug}/#image`,
        "url": `https://ninakurainservices.in/photos/${photo.slug}`,
        "contentUrl": `https://ninakurainservices.in${photo.src}`,
        "name": photo.heading,
        "caption": photo.caption,
        "description": photo.description,
        "width": photo.width,
        "height": photo.height,
        "datePublished": photo.datePublished,
        "encodingFormat": "image/webp",
        "author": {
          "@type": "Person",
          "@id": "https://ninakurainservices.in/#nina-kurain",
          "name": "Nina Kurain",
          "jobTitle": "Digital Creator",
          "url": "https://ninakurainservices.in/",
        },
        "creator": {
          "@type": "Person",
          "@id": "https://ninakurainservices.in/#nina-kurain",
          "name": "Nina Kurain",
        },
        "copyrightHolder": {
          "@type": "Person",
          "@id": "https://ninakurainservices.in/#nina-kurain",
          "name": "Nina Kurain",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://ninakurainservices.in/photos/${photo.slug}/#breadcrumbs`,
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
            "name": "Photos",
            "item": "https://ninakurainservices.in/photos",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": photo.title,
            "item": `https://ninakurainservices.in/photos/${photo.slug}`,
          },
        ],
      },
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
            <Link href="/" style={{ color: "var(--nk-text-muted)" }}>Nina Kurain</Link>
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
              background: "#000"
            }}>
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                priority
                unoptimized={photo.src.startsWith("/api/")}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  filter: photo.isPremium ? "blur(18px) brightness(0.55)" : "none",
                  transform: photo.isPremium ? "scale(1.04)" : "none",
                  transition: "filter 0.3s ease",
                }}
              />

              {photo.isPremium && (
                <div
                  className="locked-card-overlay"
                  style={{
                    padding: "36px 24px",
                    background: "rgba(9, 5, 9, 0.68)",
                  }}
                >
                  <div
                    className="lock-shield-icon"
                    style={{ width: "64px", height: "64px", marginBottom: "16px" }}
                  >
                    <Lock size={30} />
                  </div>
                  <span
                    className="locked-card-tag"
                    style={{ fontSize: "11px", marginBottom: "10px" }}
                  >
                    VIP ARCHIVE EXCLUSIVE (18+)
                  </span>
                  <h2
                    style={{
                      fontFamily: "var(--nk-font-serif)",
                      fontSize: "24px",
                      color: "#ffffff",
                      margin: "0 0 10px",
                    }}
                  >
                    {photo.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "rgba(255, 255, 255, 0.78)",
                      maxWidth: "380px",
                      margin: "0 0 20px",
                      lineHeight: 1.5,
                    }}
                  >
                    This photograph is part of Nina Kurain&apos;s Private Creator Sanctuary.
                    Access uncompressed 4K master files and exclusive companion sets.
                  </p>
                  <a
                    href="https://vip.ninakurainservices.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="locked-card-cta"
                    style={{ padding: "10px 24px", fontSize: "13px" }}
                  >
                    <span>Unlock in VIP Sanctuary</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
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
                    Nina Kurain
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
                    WebP / JPEG
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
                {photo.isPremium ? (
                  <a
                    href="https://vip.ninakurainservices.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <span>Unlock in VIP Sanctuary</span>
                    <ArrowUpRight size={14} />
                  </a>
                ) : (
                  <Link href="/collaborations" className="btn-primary">
                    <span>Licensing Inquiries</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
                <Link href="/photos" className="btn-secondary">
                  <ArrowLeft size={14} />
                  <span>Back to Gallery</span>
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related Photographs */}
        <section className="public-section">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">MORE FROM THE ARCHIVE</span>
              <h2>Related Photographs</h2>
            </div>
          </div>

          <div className="photo-grid">
            {relatedPhotos.map((item) => {
              const isLocked = Boolean(item.isPremium);

              if (isLocked) {
                return (
                  <div key={item.slug} className="photo-card is-locked" title={`${item.title} — VIP Exclusive (18+)`}>
                    <div className="photo-card-media">
                      <Image
                        src={item.image}
                        alt={`${creatorName} — ${item.title}`}
                        width={500}
                        height={625}
                        unoptimized
                        className="photo-card-img"
                      />
                      <span className="photo-card-tag is-locked">
                        <Lock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                        VIP Locked
                      </span>
                      <div className="locked-card-overlay">
                        <div className="lock-shield-icon">
                          <Lock size={18} />
                        </div>
                        <span className="locked-card-tag">VIP ARCHIVE EXCLUSIVE</span>
                        <strong className="locked-card-title">{item.title}</strong>
                        <a
                          href="https://vip.ninakurainservices.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="locked-card-cta"
                        >
                          <span>Unlock in VIP</span>
                          <ArrowUpRight size={12} />
                        </a>
                      </div>
                    </div>
                    <div className="photo-card-details">
                      <h3>{item.title}</h3>
                      <p>{item.caption}</p>
                    </div>
                  </div>
                );
              }

              return (
                <Link key={item.slug} href={`/photos/${item.slug}`} className="photo-card">
                  <div className="photo-card-media">
                    <Image
                      src={item.image}
                      alt={`${creatorName} — ${item.title}`}
                      width={500}
                      height={625}
                      unoptimized
                      className="photo-card-img"
                    />
                    <span className="photo-card-tag is-demo">
                      <Sparkles size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                      Free Demo
                    </span>
                  </div>
                  <div className="photo-card-details">
                    <h3>{item.title}</h3>
                    <p>{item.caption}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
