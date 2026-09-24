"use client";

import { useState } from "react";
import Image from "next/image";
import { LockKeyhole, Play, Camera, ArrowRight, Sparkles, Flame, Eye } from "lucide-react";

interface MarqueeMediaItem {
  type: "video" | "photo";
  src: string;
  poster?: string;
  title: string;
  alt: string;
  tag: string;
  tier: string;
  className?: string;
}

const DEFAULT_MARQUEE_MEDIA: MarqueeMediaItem[] = [
  {
    type: "video",
    src: "/booty.mp4",
    poster: "/nina-kurain-official-portrait.webp",
    title: "Arch & Tremble: Bedroom Tape",
    alt: "Arch & Tremble Bedroom Tape",
    tag: "🔞 4K UNCENSORED TAPE",
    tier: "VIP Platinum",
    className: "tall video-card",
  },
  {
    type: "photo",
    src: "/nina-kurain-editorial-portrait.webp",
    title: "Obedient French Maid Fantasy",
    alt: "Obedient French Maid Fantasy",
    tag: "💋 RAW FETISH BOUDOIR",
    tier: "VIP Exclusive",
    className: "portrait photo-card",
  },
  {
    type: "video",
    src: "/vid-2.mp4",
    poster: "/nina-kurain-editorial-portrait.webp",
    title: "Behind Closed Doors: The Tease",
    alt: "Behind Closed Doors Tease",
    tag: "🔥 3s HYPNOTIC LOOP",
    tier: "VIP Gold",
    className: "tall video-card",
  },
  {
    type: "photo",
    src: "/nina-kurain-digital-creator.webp",
    title: "Tangled Sheets & Bare Desires",
    alt: "Tangled Sheets Bare Desires",
    tag: "🔞 UNCENSORED NUDE",
    tier: "VIP Diamond",
    className: "tall photo-card",
  },
  {
    type: "video",
    src: "/vid-3.mp4",
    poster: "/nina-kurain-digital-creator.webp",
    title: "Glistening Silk & Wet Desires",
    alt: "Glistening Silk Wet Desires",
    tag: "🔞 3s SLOW-MO CLIMAX",
    tier: "VIP Patron",
    className: "portrait video-card",
  },
  {
    type: "photo",
    src: "/seductive-1.jpeg",
    title: "Undressed Eyes & Sheer Lace",
    alt: "Undressed Eyes Sheer Lace",
    tag: "📸 PLEASURE VAULT",
    tier: "VIP Member",
    className: "portrait photo-card",
  },
  {
    type: "photo",
    src: "/nina-kurain-studio-portrait.webp",
    title: "Studio Chiaroscuro Desires",
    alt: "Studio Chiaroscuro Desires",
    tag: "💋 PRIVATE DROP",
    tier: "VIP Exclusive",
    className: "portrait photo-card",
  },
  {
    type: "photo",
    src: "/nina-kurain-fashion-portrait.webp",
    title: "Modern Elegance Unfiltered",
    alt: "Modern Elegance Unfiltered",
    tag: "🔞 MEMBERS ONLY",
    tier: "VIP Diamond",
    className: "tall photo-card",
  },
];

interface AutoMarqueeShowcaseProps {
  vipUrl?: string;
  signedIn?: boolean;
}

export function AutoMarqueeShowcase({
  vipUrl = "https://vip.ninakurainservices.in/",
  signedIn = false,
}: AutoMarqueeShowcaseProps) {
  const [activeItem, setActiveItem] = useState<MarqueeMediaItem | null>(null);

  const handleItemClick = (item: MarqueeMediaItem) => {
    setActiveItem(item);
  };

  return (
    <section className="marquee-section" id="archive" aria-label="Auto-scrolling Media Showcase">
      <div className="section-kicker" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <Flame size={14} className="text-[#ff2d75]" />
        <span>🔞 RUNNING MEDIA: VIDEOS &amp; PHOTOS IN CONTINUOUS MOTION</span>
      </div>

      <div className="marquee-mask">
        {[0, 1].map((row) => (
          <div className={`marquee-row row-${row + 1}`} key={row}>
            {[...DEFAULT_MARQUEE_MEDIA, ...DEFAULT_MARQUEE_MEDIA].map((item, i) => (
              <div
                className={`marquee-item ${item.className || ""}`}
                key={`${row}-${i}`}
                onClick={() => handleItemClick(item)}
                style={{ cursor: "pointer" }}
                title={`${item.title} — ${item.tier} Lock`}
              >
                <span className="video-badge">
                  {item.type === "video" ? (
                    <Play size={10} fill="currentColor" />
                  ) : (
                    <Camera size={10} />
                  )}
                  {item.tag}
                </span>

                {item.type === "video" ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={item.poster}
                    className="marquee-media-blur"
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    disableRemotePlayback
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt || "Private Media Drop"}
                    fill
                    sizes="280px"
                    unoptimized
                    className="marquee-media-blur"
                  />
                )}

                <span className="veil" />

                <div className="marquee-item-overlay">
                  <span className="marquee-item-lock">
                    <LockKeyhole size={18} />
                  </span>
                  <span className="marquee-item-hint">🔞 {item.tier.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Central Floating Lock Banner */}
        <div className="marquee-lock">
          <span>
            <LockKeyhole size={20} />
          </span>
          <b>THE PUBLIC INTERNET ENDS HERE</b>
          <p>
            Continuous running video tapes and photos are displayed under membership locks.
            Unlock full access to the uncensored 4K video vault and exclusive photo archives.
          </p>
          <a href={vipUrl} target="_blank" rel="noopener noreferrer">
            <span>{signedIn ? "ENTER YOUR VIP FEED" : "UNLOCK IN VIP SANCTUARY"}</span>
            <ArrowRight size={15} />
          </a>
        </div>
      </div>

      {/* Quick Preview Modal when any item is clicked */}
      {activeItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
          onClick={() => setActiveItem(null)}
        >
          <div
            style={{
              maxWidth: "460px",
              width: "100%",
              background: "#110811",
              border: "1px solid rgba(255, 45, 117, 0.45)",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(255, 45, 117, 0.18)",
                border: "1px solid rgba(255, 45, 117, 0.6)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
                color: "#ff2d75",
              }}
            >
              <LockKeyhole size={26} />
            </div>

            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "#ff8dae",
                textTransform: "uppercase",
              }}
            >
              {activeItem.tier} · MEMBER LOCK
            </span>

            <h3
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "22px",
                color: "#fff",
                margin: "8px 0 10px",
              }}
            >
              {activeItem.title}
            </h3>

            <p style={{ fontSize: "13.5px", color: "#bbb", margin: "0 0 20px", lineHeight: 1.6 }}>
              This {activeItem.type === "video" ? "uncensored 4K tape" : "exclusive photo drop"} is locked for active members. Unlock access in the VIP Sanctuary to view uncompressed and unblurred.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={vipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{
                  background: "linear-gradient(135deg, #a92f49, #ff2d75)",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "12px",
                  textDecoration: "none",
                }}
              >
                <span>Unlock in VIP Sanctuary</span>
                <ArrowRight size={15} />
              </a>

              <button
                type="button"
                onClick={() => setActiveItem(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  fontSize: "12px",
                  cursor: "pointer",
                  marginTop: "6px",
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
