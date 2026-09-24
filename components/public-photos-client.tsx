"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "@/components/site-link";
import { Sparkles, ArrowRight, Filter, Camera } from "lucide-react";
import { HorizontalScrollGallery } from "@/components/horizontal-scroll-gallery";
import type { DynamicPhoto } from "@/lib/server/public-data";

interface PublicPhotosClientProps {
  photos: DynamicPhoto[];
  creatorName: string;
}

type FilterCategory = "all" | "Portraits" | "Editorial" | "Fashion" | "Studio";

export function PublicPhotosClient({ photos, creatorName }: PublicPhotosClientProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");

  const categories: FilterCategory[] = ["all", "Portraits", "Editorial", "Fashion", "Studio"];

  // Include authentic photos from /nina-gallery and uploaded creator assets
  const validPhotos = useMemo(() => {
    return photos.filter((p) => {
      const src = p.image || "";
      return !src.startsWith("/seductive") && (src.startsWith("/nina-gallery/") || src.startsWith("/api/content/"));
    });
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === "all") return validPhotos;
    return validPhotos.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
  }, [validPhotos, activeCategory]);

  if (validPhotos.length === 0) {
    return (
      <div className="photos-client-container">
        <div
          style={{
            padding: "54px clamp(20px, 4vw, 48px)",
            borderRadius: "var(--nk-radius-lg, 20px)",
            background: "var(--nk-surface-card, #120912)",
            border: "1px solid var(--nk-border)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            margin: "24px 0 48px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(224, 96, 134, 0.12)",
              display: "grid",
              placeItems: "center",
              color: "var(--nk-rose-light)",
            }}
          >
            <Camera size={28} />
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: "var(--nk-rose)",
              textTransform: "uppercase",
            }}
          >
            STUDIO ARCHIVE
          </span>
          <h2
            style={{
              fontFamily: "var(--nk-font-serif)",
              fontSize: "clamp(24px, 3.5vw, 36px)",
              margin: 0,
              color: "var(--nk-text)",
            }}
          >
            Photography Portfolio in Curation
          </h2>
          <p
            style={{
              maxWidth: "580px",
              fontSize: "14.5px",
              color: "var(--nk-text-muted)",
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            Original studio portraiture, editorial series, and lookbooks are currently in studio curation.
            High-resolution visual drops will be published directly from the Nina Kurain Creator Studio.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <a
              href="https://www.instagram.com/kurain.bae"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <span>Follow on Instagram (@kurain.bae)</span>
            </a>
            <Link href="/collaborations" className="btn-secondary">
              <span>Brand Collaborations</span>
            </Link>
            <Link href="/about" className="btn-secondary">
              <span>About Nina Kurain</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="photos-client-container">
      {/* 1. Interactive Horizontal Showcase Reel */}
      <HorizontalScrollGallery
        photos={validPhotos}
        creatorName={creatorName}
        title="Studio Showcase"
        subtitle="Swipe horizontally to explore signature frames and portraiture."
        showViewAllLink={false}
      />

      <div style={{ margin: "48px 0 28px", borderTop: "1px solid var(--nk-border-subtle)" }} />

      <div className="section-head reveal-on-scroll" style={{ marginBottom: "18px" }}>
        <div className="section-head-copy">
          <span className="section-kicker">CURATED ARCHIVE</span>
          <h2 style={{ fontSize: "28px" }}>Photographic Gallery</h2>
          <p>Explore official studio portraiture, editorial series, and creative compositions.</p>
        </div>
      </div>

      {/* Interactive Category Filter Bar */}
      <div className="gallery-filter-bar reveal-on-scroll">
        {categories.map((cat) => {
          const count = cat === "all" ? validPhotos.length : validPhotos.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`filter-tab-btn ${activeCategory === cat ? "active" : ""}`}
            >
              {cat === "all" ? <Filter size={13} /> : <Camera size={13} />}
              <span>{cat === "all" ? "All Series" : cat}</span>
              <span className="filter-count-badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Crawlable Public Photos */}
      <div className="photo-grid">
        {filteredPhotos.map((photo, idx) => {
          return (
            <article
              key={photo.slug || idx}
              className="photo-card-wrap reveal-on-scroll"
            >
              <Link
                href={`/photos/${photo.slug}`}
                className="photo-card"
                title={`${photo.title} — ${creatorName}`}
              >
                <div className="photo-card-media">
                  <Image
                    src={photo.image}
                    alt={`${creatorName} — ${photo.title}`}
                    width={photo.width || 1086}
                    height={photo.height || 1448}
                    priority={idx < 2}
                    className="photo-card-img"
                  />
                  <span className="photo-card-tag is-featured">
                    <Sparkles size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                    {photo.tag || "Editorial"}
                  </span>
                </div>
                <div className="photo-card-details">
                  <h3>{photo.title}</h3>
                  <p>{photo.caption}</p>
                  <div className="photo-card-footer">
                    <span>{photo.category || "Studio Series"}</span>
                    <strong>View Frame Details &rarr;</strong>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
