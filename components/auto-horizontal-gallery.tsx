"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowRight, Play, Pause, Sparkles } from "lucide-react";
import { PHOTOS_DATA } from "@/lib/photos-data";

export interface AutoGalleryPhoto {
  slug: string;
  title: string;
  image?: string;
  src?: string;
  category?: string;
  tag?: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface AutoHorizontalGalleryProps {
  photos?: AutoGalleryPhoto[];
}

export function AutoHorizontalGallery({ photos }: AutoHorizontalGalleryProps) {
  const [isPaused, setIsPaused] = useState(false);

  // If photos passed from server, use them, otherwise fallback to all authentic PHOTOS_DATA
  const fallbackPhotos: AutoGalleryPhoto[] = PHOTOS_DATA.map((p) => ({
    slug: p.slug,
    title: p.title,
    image: p.src,
    src: p.src,
    category: p.category,
    tag: p.tag,
    caption: p.caption,
    width: p.width,
    height: p.height,
  }));

  const galleryItems = (photos && photos.length > 0 ? photos : fallbackPhotos).filter((item: AutoGalleryPhoto) => {
    const src = item.image || item.src || "";
    // Ensure no demo images
    return !src.includes("seductive") && !item.tag?.toLowerCase().includes("demo");
  });

  // Split gallery into 2 rows for authentic 2-way marquee
  const mid = Math.ceil(galleryItems.length / 2);
  const row1Base = galleryItems.slice(0, mid);
  const row2Base = galleryItems.slice(mid);

  // Duplicate for seamless infinite loop
  const row1Items = [...row1Base, ...row1Base];
  const row2Items = [...row2Base, ...row2Base];

  return (
    <div className="auto-gallery-container">
      <div 
        className={`auto-gallery-viewport ${isPaused ? "is-paused" : ""}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Row 1: Leftward Stream (←) */}
        <div className="auto-gallery-row-1">
          {row1Items.map((photo, index) => {
            const imgSrc = photo.image || photo.src || "/nina-gallery/nina-kurain-01.jpeg";
            const frameNum = (index % row1Base.length) + 1;
            const paddedNum = frameNum < 10 ? `0${frameNum}` : `${frameNum}`;

            return (
              <Link
                key={`r1-${photo.slug}-${index}`}
                href={`/photos/${photo.slug}`}
                className="auto-gallery-card"
                title={`${photo.title} — Nina Kurain Photography`}
              >
                <div className="auto-gallery-img-wrap">
                  <Image
                    src={imgSrc}
                    alt={`Nina Kurain — ${photo.title}`}
                    width={photo.width || 360}
                    height={photo.height || 480}
                    className="auto-gallery-img"
                    loading="lazy"
                    sizes="(max-width: 768px) 190px, 240px"
                  />
                  <div className="auto-gallery-overlay" />
                </div>

                <div className="auto-gallery-content">
                  <div className="auto-gallery-badge-row">
                    <span className="auto-gallery-category">
                      {photo.category || "Portrait"}
                    </span>
                    <span className="auto-gallery-frame-num">Frame {paddedNum}</span>
                  </div>

                  <h3 className="auto-gallery-title">{photo.title}</h3>
                  {photo.caption && (
                    <p className="auto-gallery-caption">{photo.caption}</p>
                  )}

                  <span className="auto-gallery-action">
                    <span>View Frame</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Row 2: Rightward Stream (→) */}
        <div className="auto-gallery-row-2">
          {row2Items.map((photo, index) => {
            const imgSrc = photo.image || photo.src || "/nina-gallery/nina-kurain-01.jpeg";
            const frameNum = mid + (index % row2Base.length) + 1;
            const paddedNum = frameNum < 10 ? `0${frameNum}` : `${frameNum}`;

            return (
              <Link
                key={`r2-${photo.slug}-${index}`}
                href={`/photos/${photo.slug}`}
                className="auto-gallery-card"
                title={`${photo.title} — Nina Kurain Photography`}
              >
                <div className="auto-gallery-img-wrap">
                  <Image
                    src={imgSrc}
                    alt={`Nina Kurain — ${photo.title}`}
                    width={photo.width || 360}
                    height={photo.height || 480}
                    className="auto-gallery-img"
                    loading="lazy"
                    sizes="(max-width: 768px) 190px, 240px"
                  />
                  <div className="auto-gallery-overlay" />
                </div>

                <div className="auto-gallery-content">
                  <div className="auto-gallery-badge-row">
                    <span className="auto-gallery-category">
                      {photo.category || "Portrait"}
                    </span>
                    <span className="auto-gallery-frame-num">Frame {paddedNum}</span>
                  </div>

                  <h3 className="auto-gallery-title">{photo.title}</h3>
                  {photo.caption && (
                    <p className="auto-gallery-caption">{photo.caption}</p>
                  )}

                  <span className="auto-gallery-action">
                    <span>View Frame</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="auto-gallery-controls-bar">
        <div className="auto-gallery-status">
          <span className="auto-gallery-pulse-dot" />
          <span>2-Way Panoramic Marquee &bull; Hover to pause</span>
        </div>

        <div className="auto-gallery-buttons">
          <button
            type="button"
            className="auto-gallery-ctrl-btn"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? "Resume auto scroll" : "Pause auto scroll"}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
            <span>{isPaused ? "Resume Marquee" : "Pause Marquee"}</span>
          </button>

          <Link href="/photos" className="auto-gallery-ctrl-btn" style={{ textDecoration: "none" }}>
            <span>Explore All {galleryItems.length} Frames</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
