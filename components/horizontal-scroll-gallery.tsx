"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "@/components/site-link";
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight, X, Eye } from "lucide-react";

export interface HorizontalPhotoItem {
  slug: string;
  title: string;
  tag?: string;
  caption?: string;
  image?: string;
  src?: string;
  category?: string;
  isPremium?: boolean;
  width?: number;
  height?: number;
}

interface HorizontalScrollGalleryProps {
  photos: HorizontalPhotoItem[];
  creatorName?: string;
  title?: string;
  subtitle?: string;
  showViewAllLink?: boolean;
}

export function HorizontalScrollGallery({
  photos,
  creatorName = "Nina Kurain",
  title = "Photographic Showcase",
  subtitle = "Explore signature studio frames, lighting studies, and editorial portraiture.",
  showViewAllLink = true,
}: HorizontalScrollGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activePhoto, setActivePhoto] = useState<HorizontalPhotoItem | null>(null);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [photos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 320;
    const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="horizontal-scroll-gallery-wrapper reveal-on-scroll">
      <div className="section-head" style={{ marginBottom: "20px" }}>
        <div className="section-head-copy">
          <span className="section-kicker">CURATED SHOWCASE</span>
          <h2 style={{ fontSize: "28px" }}>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="horizontal-scroll-controls">
          {showViewAllLink && (
            <Link href="/photos" className="section-action-link" style={{ marginRight: "12px" }}>
              <span>View All ({photos.length})</span>
              <ArrowRight size={14} />
            </Link>
          )}

          <button
            type="button"
            className="scroll-arrow-btn"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll gallery left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="scroll-arrow-btn"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll gallery right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="horizontal-scroll-track" ref={scrollRef}>
        {photos.map((photo, index) => {
          const imgSrc = photo.image || photo.src || "/nina-gallery/nina-kurain-01.jpeg";

          return (
            <div
              key={photo.slug || index}
              className="horizontal-scroll-card"
              title={`${photo.title} — ${creatorName}`}
              onClick={() => setActivePhoto(photo)}
              style={{ cursor: "pointer" }}
            >
              <div className="photo-card-media">
                <Image
                  src={imgSrc}
                  alt={`${creatorName} — ${photo.title}`}
                  width={photo.width || 500}
                  height={photo.height || 625}
                  className="photo-card-img"
                />

                <span className="photo-card-tag">
                  <Sparkles size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  {photo.tag || "Series"}
                </span>
              </div>

              <div className="photo-card-details">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--nk-accent-champagne)", fontWeight: 600 }}>
                    {photo.category || "Studio Portrait"}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)" }}>Gallery Frame</span>
                </div>
                <h3>{photo.title}</h3>
                <p>{photo.caption || "Official photography series."}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="demo-lightbox-overlay"
          onClick={() => setActivePhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <div
            className="demo-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 840 }}
          >
            <button
              type="button"
              className="demo-lightbox-close"
              onClick={() => setActivePhoto(null)}
              aria-label="Close preview"
            >
              <X size={20} />
            </button>

            <div className="demo-lightbox-media">
              <Image
                src={activePhoto.image || activePhoto.src || "/nina-gallery/nina-kurain-01.jpeg"}
                alt={`${creatorName} — ${activePhoto.title}`}
                width={activePhoto.width || 800}
                height={activePhoto.height || 1000}
                style={{ objectFit: "contain", maxHeight: "65vh", width: "100%", height: "auto" }}
              />
            </div>

            <div className="demo-lightbox-content">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="section-kicker" style={{ margin: 0 }}>
                  {activePhoto.tag || "Curated Series"} • {activePhoto.category || "Studio Photography"}
                </span>
              </div>
              <h3 style={{ fontSize: "22px", margin: "0 0 8px", fontFamily: "var(--nk-font-serif)" }}>
                {activePhoto.title}
              </h3>
              <p style={{ color: "var(--nk-text-muted)", fontSize: "14px", lineHeight: 1.6, margin: "0 0 20px" }}>
                {activePhoto.caption}
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href={`/photos/${activePhoto.slug}`}
                  className="btn-primary"
                  onClick={() => setActivePhoto(null)}
                >
                  <Eye size={15} />
                  <span>View Dedicated Page &amp; Metadata</span>
                </Link>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActivePhoto(null)}
                >
                  <span>Close Preview</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
