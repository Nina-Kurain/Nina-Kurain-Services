"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "@/components/site-link";
import { Sparkles, ArrowRight, Filter, Camera, X, Layers } from "lucide-react";
import { HorizontalScrollGallery } from "@/components/horizontal-scroll-gallery";
import type { DynamicPhoto } from "@/lib/server/public-data";
import { ARCHIVAL_LOOKS, getLookByIdOrSlug, filterPhotosByLook } from "@/lib/looks-data";

interface PublicPhotosClientProps {
  photos: DynamicPhoto[];
  creatorName: string;
  initialLook?: string;
}

type FilterCategory = "all" | "Portraits" | "Editorial" | "Fashion" | "Studio";

export function PublicPhotosClient({ photos, creatorName, initialLook }: PublicPhotosClientProps) {
  const [activeLook, setActiveLook] = useState<string | null>(initialLook || null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");

  const categories: FilterCategory[] = ["all", "Portraits", "Editorial", "Fashion", "Studio"];

  // Read URL query params on mount and on popstate
  useEffect(() => {
    const handleUrlSync = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const lookParam = params.get("look");
        if (lookParam) {
          setActiveLook(lookParam);
        } else if (initialLook && !params.has("look")) {
          // If query cleared, clear active look
          setActiveLook(null);
        }
      }
    };
    handleUrlSync();
    window.addEventListener("popstate", handleUrlSync);
    return () => window.removeEventListener("popstate", handleUrlSync);
  }, [initialLook]);

  // Include authentic photos from /nina-gallery and uploaded creator assets
  const validPhotos = useMemo(() => {
    return photos.filter((p) => {
      const src = p.image || "";
      return !src.startsWith("/seductive") && (src.startsWith("/nina-gallery/") || src.startsWith("/api/content/"));
    });
  }, [photos]);

  const currentLookDef = useMemo(() => {
    return getLookByIdOrSlug(activeLook);
  }, [activeLook]);

  // Filter by Look first (if selected)
  const lookPhotos = useMemo(() => {
    if (!currentLookDef) return validPhotos;
    return filterPhotosByLook(validPhotos, currentLookDef);
  }, [validPhotos, currentLookDef]);

  // Filter by Category within the look (or all)
  const filteredPhotos = useMemo(() => {
    if (activeCategory === "all") return lookPhotos;
    return lookPhotos.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
  }, [lookPhotos, activeCategory]);

  const handleSelectLook = (lookSlug: string | null) => {
    setActiveLook(lookSlug);
    setActiveCategory("all");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (lookSlug) {
        url.searchParams.set("look", lookSlug);
      } else {
        url.searchParams.delete("look");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

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
        </div>
      </div>
    );
  }

  return (
    <div className="photos-client-container">
      {/* Look Selector Suite Bar */}
      <div className="look-suite-selector-bar" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Layers size={14} style={{ color: "var(--nk-rose)" }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--nk-text-subtle)" }}>
            Filter by Signature Look:
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 6,
            scrollbarWidth: "none",
          }}
        >
          <button
            type="button"
            onClick={() => handleSelectLook(null)}
            className={`filter-tab-btn ${!activeLook ? "active" : ""}`}
            style={{ whiteSpace: "nowrap" }}
          >
            <Camera size={13} />
            <span>All Works</span>
            <span className="filter-count-badge">{validPhotos.length}</span>
          </button>

          {ARCHIVAL_LOOKS.map((look) => {
            const isActive = currentLookDef?.id === look.id;
            const lookCount = filterPhotosByLook(validPhotos, look).length;
            return (
              <button
                key={look.id}
                type="button"
                onClick={() => handleSelectLook(look.slug)}
                className={`filter-tab-btn ${isActive ? "active" : ""}`}
                style={{ whiteSpace: "nowrap" }}
              >
                <Sparkles size={13} style={{ color: isActive ? "var(--nk-rose)" : "inherit" }} />
                <span>{look.num}: {look.title}</span>
                <span className="filter-count-badge">{lookCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Look Suite Hero Banner (Displayed when a specific Look is selected) */}
      {currentLookDef && (
        <div
          className="active-look-suite-banner"
          style={{
            padding: "24px 26px",
            borderRadius: "var(--nk-radius-md, 18px)",
            background: "var(--nk-surface-card)",
            border: "1px solid var(--nk-border-hover)",
            boxShadow: "var(--nk-card-shadow)",
            marginBottom: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 18,
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--nk-rose)",
                  background: "rgba(226, 75, 120, 0.12)",
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
              >
                {currentLookDef.num} SUITE
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--nk-accent-champagne)" }}>
                {lookPhotos.length} Curated Frames Displayed
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "clamp(22px, 3vw, 30px)", margin: "0 0 6px", color: "var(--nk-text)" }}>
              {currentLookDef.title}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--nk-text-muted)", margin: 0, lineHeight: 1.55 }}>
              {currentLookDef.desc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleSelectLook(null)}
            className="btn-secondary"
            style={{
              padding: "0 18px",
              minHeight: 40,
              fontSize: 12,
              borderRadius: "var(--nk-radius-full)",
              gap: 6,
            }}
          >
            <X size={14} />
            <span>Show All 51 Gallery Photos</span>
          </button>
        </div>
      )}

      {/* 1. Interactive Horizontal Showcase Reel (Scoped to the look or all) */}
      <HorizontalScrollGallery
        photos={filteredPhotos}
        creatorName={creatorName}
        title={currentLookDef ? `${currentLookDef.num} Showcase` : "Studio Showcase"}
        subtitle={
          currentLookDef
            ? `Displaying ${filteredPhotos.length} frames curated specifically for ${currentLookDef.title}.`
            : "Swipe horizontally to explore signature frames and portraiture."
        }
        showViewAllLink={false}
      />

      <div style={{ margin: "40px 0 24px", borderTop: "1px solid var(--nk-border-subtle)" }} />

      <div className="section-head reveal-on-scroll" style={{ marginBottom: "18px" }}>
        <div className="section-head-copy">
          <span className="section-kicker">
            {currentLookDef ? `${currentLookDef.num.toUpperCase()} CURATED GALLERY` : "CURATED ARCHIVE"}
          </span>
          <h2 style={{ fontSize: "28px" }}>
            {currentLookDef ? `${currentLookDef.title} (${filteredPhotos.length} Frames)` : "Photographic Gallery"}
          </h2>
          <p>
            {currentLookDef
              ? `Listing exclusively the ${filteredPhotos.length} authentic studio photographs curated for ${currentLookDef.title}.`
              : "Explore official studio portraiture, editorial series, and creative compositions."}
          </p>
        </div>
      </div>

      {/* Interactive Category Filter Bar */}
      <div className="gallery-filter-bar reveal-on-scroll">
        {categories.map((cat) => {
          const count = cat === "all" ? lookPhotos.length : lookPhotos.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`filter-tab-btn ${activeCategory === cat ? "active" : ""}`}
            >
              {cat === "all" ? <Filter size={13} /> : <Camera size={13} />}
              <span>{cat === "all" ? "All In Look" : cat}</span>
              <span className="filter-count-badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Crawlable Public Photos (Filtered to ONLY this Look's photos) */}
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
