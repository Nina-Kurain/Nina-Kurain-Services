"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "@/components/site-link";
import { Lock, Sparkles, ChevronLeft, ChevronRight, ArrowRight, X, Eye, LockKeyhole } from "lucide-react";

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
  title = "Horizontal Photographic Showcase",
  subtitle = "Swipe or scroll through signature studio frames. Free demo works are visible; exclusive VIP frames are archived under member lock.",
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
    if (activePhoto) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setActivePhoto(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [activePhoto]);

  const scrollByDistance = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -340 : 340;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="horizontal-gallery-section" aria-label={title}>
      <div className="horizontal-gallery-header">
        <div style={{ maxWidth: "680px" }}>
          <div className="creator-eyebrow" style={{ marginBottom: "6px" }}>
            <span className="eyebrow-line" />
            <span>INTERACTIVE HORIZONTAL REEL</span>
          </div>
          <h3
            style={{
              fontFamily: "var(--nk-font-serif)",
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 400,
              color: "var(--nk-text)",
              margin: "0 0 6px",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "13.5px",
              color: "var(--nk-text-muted)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div className="horizontal-gallery-nav">
          <button
            type="button"
            className="horizontal-nav-btn"
            onClick={() => scrollByDistance("left")}
            disabled={!canScrollLeft}
            style={{ opacity: canScrollLeft ? 1 : 0.4, cursor: canScrollLeft ? "pointer" : "default" }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="horizontal-nav-btn"
            onClick={() => scrollByDistance("right")}
            disabled={!canScrollRight}
            style={{ opacity: canScrollRight ? 1 : 0.4, cursor: canScrollRight ? "pointer" : "default" }}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="horizontal-scroll-track" ref={scrollRef}>
        {[...photos].sort((a, b) => (a.isPremium ? 1 : 0) - (b.isPremium ? 1 : 0)).map((photo, index) => {
          const imgSrc = photo.image || photo.src || "/nina-kurain-official-portrait.webp";
          const isLocked = Boolean(photo.isPremium);

          if (isLocked) {
            return (
              <div
                key={photo.slug || index}
                className="horizontal-scroll-card is-locked"
                title={`${photo.title} — VIP Exclusive (18+)`}
                onClick={() => setActivePhoto(photo)}
                style={{ cursor: "pointer" }}
              >
                <div className="photo-card-media">
                  <Image
                    src={imgSrc}
                    alt={`${creatorName} — ${photo.title} (VIP Locked)`}
                    width={photo.width || 500}
                    height={photo.height || 625}
                    unoptimized
                    className="photo-card-img"
                  />

                  <span className="photo-card-tag is-locked">
                    <Lock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                    VIP Locked
                  </span>

                  <div className="locked-card-overlay">
                    <div className="lock-shield-icon">
                      <Lock size={20} />
                    </div>
                    <span className="locked-card-tag">VIP ARCHIVE EXCLUSIVE (18+)</span>
                    <strong className="locked-card-title">{photo.title}</strong>
                    <button
                      type="button"
                      className="locked-card-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open("https://vip.ninakurainservices.in/", "_blank", "noopener,noreferrer");
                      }}
                    >
                      <span>Unlock in VIP Sanctuary</span>
                      <Lock size={12} />
                    </button>
                  </div>
                </div>

                <div className="photo-card-details">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--nk-rose-light)", fontWeight: 600 }}>
                      {photo.category || "VIP Private Set"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)" }}>Exclusive 18+</span>
                  </div>
                  <h3>{photo.title}</h3>
                  <p>{photo.caption || "Exclusive studio set preserved in the private creator vault."}</p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={photo.slug || index}
              className="horizontal-scroll-card"
              title={`${photo.title} — Free Demo`}
              onClick={() => setActivePhoto(photo)}
              style={{ cursor: "pointer" }}
            >
              <div className="photo-card-media">
                <Image
                  src={imgSrc}
                  alt={`${creatorName} — ${photo.title}`}
                  width={photo.width || 500}
                  height={photo.height || 625}
                  unoptimized
                  className="photo-card-img"
                />

                <span className="photo-card-tag">
                  <Sparkles size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  {photo.tag || "Free Demo"}
                </span>
              </div>

              <div className="photo-card-details">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--nk-accent-champagne)", fontWeight: 600 }}>
                    {photo.category || "Studio Portrait"}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)" }}>Public Demo</span>
                </div>
                <h3>{photo.title}</h3>
                <p>{photo.caption || "High-resolution signature frame available in public demo."}</p>
                <div style={{ marginTop: "auto", paddingTop: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--nk-rose-light)", fontWeight: 600 }}>
                  <span>View Frame</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", padding: "0 4px" }}>
        <span className="horizontal-scroll-hint">
          <span>←</span>
          <span>Drag or use arrows to view all {photos.length} frames</span>
          <span>→</span>
        </span>

        {showViewAllLink && (
          <Link
            href="/photos"
            style={{
              fontSize: "12.5px",
              color: "var(--nk-rose-light)",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
            }}
          >
            <span>View All in Gallery</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* Interactive Photo Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          className="photo-preview-backdrop"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="photo-preview-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="photo-preview-media-wrap">
              {/* Ambient blurred backdrop for luxurious framing */}
              <Image
                src={activePhoto.image || activePhoto.src || "/nina-kurain-official-portrait.webp"}
                alt=""
                fill
                unoptimized
                aria-hidden="true"
                className="photo-preview-ambient-bg"
              />
              {/* Main crisp contained image */}
              <Image
                src={activePhoto.image || activePhoto.src || "/nina-kurain-official-portrait.webp"}
                alt={activePhoto.title}
                fill
                unoptimized
                className="photo-preview-main-img"
                style={{
                  filter: activePhoto.isPremium ? "blur(18px) brightness(0.55)" : "none",
                }}
              />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                aria-label="Close photo preview"
                className="photo-preview-close-btn"
              >
                <X size={18} />
              </button>

              {activePhoto.isPremium && (
                <div className="locked-card-overlay" style={{ background: "rgba(12, 5, 11, 0.78)" }}>
                  <div className="lock-shield-icon">
                    <Lock size={24} />
                  </div>
                  <span className="locked-card-tag">VIP ARCHIVE EXCLUSIVE (18+)</span>
                  <strong className="locked-card-title">{activePhoto.title}</strong>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "0 0 14px" }}>
                    Uncut 4K uncompressed original frame reserved for VIP members.
                  </p>
                  <a
                    href="https://vip.ninakurainservices.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="locked-card-cta"
                  >
                    <span>Unlock in VIP Sanctuary</span>
                    <Lock size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="photo-preview-body">
              <div className="photo-preview-meta">
                <span
                  className="photo-preview-tag"
                  style={{
                    color: activePhoto.isPremium ? "var(--nk-rose-light)" : "var(--nk-accent-champagne)",
                  }}
                >
                  {activePhoto.tag || (activePhoto.isPremium ? "VIP LOCKED" : "FREE DEMO")}
                </span>
                <span className="photo-preview-category">
                  {activePhoto.category || "Studio Photography"}
                </span>
              </div>
              <h3 className="photo-preview-title">
                {activePhoto.title}
              </h3>
              <p className="photo-preview-caption">
                {activePhoto.caption}
              </p>

              <div className="photo-preview-actions">
                {activePhoto.isPremium ? (
                  <a
                    href="https://vip.ninakurainservices.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                  >
                    <LockKeyhole size={14} />
                    <span>Unlock Full Frame</span>
                  </a>
                ) : (
                  <Link
                    href={`/photos/${activePhoto.slug}`}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                  >
                    <span>Open Photo Page</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="btn-secondary"
                  style={{ padding: "0 18px" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
