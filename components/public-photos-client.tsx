"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "@/components/site-link";
import { Lock, Sparkles, ArrowRight, ArrowUpRight, Filter, ShieldAlert } from "lucide-react";
import { HorizontalScrollGallery } from "@/components/horizontal-scroll-gallery";
import type { DynamicPhoto } from "@/lib/server/public-data";

interface PublicPhotosClientProps {
  photos: DynamicPhoto[];
  creatorName: string;
}

type FilterMode = "all" | "demo" | "locked";

export function PublicPhotosClient({ photos, creatorName }: PublicPhotosClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterMode>("all");

  const demoCount = useMemo(() => photos.filter((p) => !p.isPremium).length, [photos]);
  const lockedCount = useMemo(() => photos.filter((p) => p.isPremium).length, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeFilter === "demo") {
      return photos.filter((p) => !p.isPremium);
    }
    if (activeFilter === "locked") {
      return photos.filter((p) => p.isPremium);
    }
    return [...photos].sort((a, b) => (a.isPremium ? 1 : 0) - (b.isPremium ? 1 : 0));
  }, [photos, activeFilter]);

  return (
    <div className="photos-client-container">
      {/* 1. Interactive Horizontal Showcase Reel with Padlocks */}
      <HorizontalScrollGallery
        photos={photos}
        creatorName={creatorName}
        title="Horizontal Studio Showcase"
        subtitle="Swipe horizontally or use arrows to explore all frames. VIP exclusive frames are locked under member protection."
        showViewAllLink={false}
      />

      <div style={{ margin: "48px 0 28px", borderTop: "1px solid var(--nk-border-subtle)" }} />

      <div className="section-head reveal-on-scroll" style={{ marginBottom: "18px" }}>
        <div className="section-head-copy">
          <span className="section-kicker">CURATED ARCHIVE</span>
          <h2 style={{ fontSize: "28px" }}>Complete Photographic Gallery</h2>
          <p>Filter between public demonstration frames and locked VIP member archives.</p>
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="gallery-filter-bar reveal-on-scroll">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`filter-tab-btn ${activeFilter === "all" ? "active" : ""}`}
        >
          <Filter size={13} />
          <span>All Works</span>
          <span className="filter-count-badge">{photos.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("demo")}
          className={`filter-tab-btn ${activeFilter === "demo" ? "active" : ""}`}
        >
          <Sparkles size={13} />
          <span>Free Demo Images</span>
          <span className="filter-count-badge">{demoCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("locked")}
          className={`filter-tab-btn ${activeFilter === "locked" ? "active" : ""}`}
        >
          <Lock size={13} />
          <span>VIP Locked (18+)</span>
          <span className="filter-count-badge">{lockedCount}</span>
        </button>
      </div>

      {/* Grid of Free Demos & Locked Works */}
      <div className="photo-grid">
        {filteredPhotos.map((photo, idx) => {
          const isLocked = Boolean(photo.isPremium);

          if (isLocked) {
            return (
              <article
                key={photo.slug || idx}
                className="photo-card-wrap reveal-on-scroll"
              >
                <div className="photo-card is-locked" title={`${photo.title} — VIP Exclusive Set (18+)`}>
                  <div className="photo-card-media">
                    <Image
                      src={photo.image}
                      alt={`${creatorName} — ${photo.title} (Exclusive)`}
                      width={photo.width || 1200}
                      height={photo.height || 1600}
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
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "0 0 12px" }}>
                        Uncensored &amp; 4K Uncompressed Set
                      </p>
                      <a
                        href="https://vip.ninakurainservices.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="locked-card-cta"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Unlock in VIP Sanctuary</span>
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>

                  <div className="photo-card-details">
                    <h3>{photo.title}</h3>
                    <p>{photo.caption}</p>
                    <div className="photo-card-footer">
                      <span style={{ color: "var(--nk-rose-light)" }}>VIP Patron Series</span>
                      <a
                        href="https://vip.ninakurainservices.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--nk-rose-light)",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        <span>Unlock Access</span>
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          }

          // Free Demo Photo (First item interactive demo, subsequent items locked for logged-in members)
          const isInteractiveDemo = idx === 0;

          if (!isInteractiveDemo) {
            return (
              <article
                key={photo.slug || idx}
                className="photo-card-wrap reveal-on-scroll"
              >
                <div className="photo-card is-locked" title={`${photo.title} — Member Archive`}>
                  <div className="photo-card-media">
                    <Image
                      src={photo.image}
                      alt={`${creatorName} — ${photo.title}`}
                      width={photo.width || 1200}
                      height={photo.height || 1600}
                      unoptimized
                      className="photo-card-img"
                    />
                    <span className="photo-card-tag is-locked">
                      <Lock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                      Member Lock
                    </span>

                    <div className="locked-card-overlay">
                      <div className="lock-shield-icon">
                        <Lock size={20} />
                      </div>
                      <span className="locked-card-tag">LOG IN TO UNLOCK</span>
                      <strong className="locked-card-title">{photo.title}</strong>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "0 0 12px" }}>
                        Free for Registered Members
                      </p>
                      <Link
                        href="/login"
                        className="locked-card-cta"
                        style={{ background: "linear-gradient(135deg, #7a2738, #b63b54)" }}
                      >
                        <span>Sign In to Unlock</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  <div className="photo-card-details">
                    <h3>{photo.title}</h3>
                    <p>{photo.caption}</p>
                    <div className="photo-card-footer">
                      <span>{photo.category || "Studio Photography"}</span>
                      <Link href="/login" style={{ color: "var(--nk-rose-light)", fontWeight: 600 }}>
                        Log In to View →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          }

          return (
            <article
              key={photo.slug || idx}
              className="photo-card-wrap reveal-on-scroll"
            >
              <Link
                href={`/photos/${photo.slug}`}
                className="photo-card"
                title={`Interactive Demo Frame: ${photo.title} by ${creatorName}`}
              >
                <div className="photo-card-media">
                  <Image
                    src={photo.image}
                    alt={`${creatorName} — ${photo.title}`}
                    width={photo.width || 1200}
                    height={photo.height || 1600}
                    priority
                    unoptimized
                    className="photo-card-img"
                  />
                  <span className="photo-card-tag is-demo">
                    <Sparkles size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                    Interactive Demo
                  </span>
                </div>
                <div className="photo-card-details">
                  <h3>{photo.title}</h3>
                  <p>{photo.caption}</p>
                  <div className="photo-card-footer">
                    <span>{photo.category || "Studio Photography"}</span>
                    <strong>Interact &amp; View Demo →</strong>
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
