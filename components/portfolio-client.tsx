"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "@/components/site-link";
import { Sparkles, ArrowRight, Camera, Film, Palette, Layers, CheckCircle2 } from "lucide-react";
import type { PhotoItem } from "@/lib/photos-data";

interface PortfolioClientProps {
  photos: PhotoItem[];
}

type PortfolioCategory = "all" | "Portraits" | "Editorial" | "Fashion" | "Studio";

export function PortfolioClient({ photos }: PortfolioClientProps) {
  const [activeTab, setActiveTab] = useState<PortfolioCategory>("all");

  const categories: { key: PortfolioCategory; label: string }[] = [
    { key: "all", label: `All Works (${photos.length})` },
    { key: "Portraits", label: "Portraits" },
    { key: "Editorial", label: "Editorial" },
    { key: "Fashion", label: "Fashion" },
    { key: "Studio", label: "Studio" },
  ];

  const filteredPhotos = useMemo(() => {
    if (activeTab === "all") return photos;
    return photos.filter((p) => p.category.toLowerCase() === activeTab.toLowerCase());
  }, [photos, activeTab]);

  return (
    <div className="portfolio-client-wrapper">
      {/* Portfolio Filter Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveTab(cat.key)}
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              border: activeTab === cat.key ? "1px solid var(--nk-rose)" : "1px solid var(--nk-border)",
              background: activeTab === cat.key ? "var(--nk-rose)" : "var(--nk-surface)",
              color: activeTab === cat.key ? "#fff" : "var(--nk-text-muted)",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Portfolio Works Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "28px",
          marginBottom: "60px",
        }}
      >
        {filteredPhotos.map((photo, index) => (
          <Link
            key={photo.slug}
            href={`/photos/${photo.slug}`}
            className="portfolio-work-card"
            style={{
              background: "var(--nk-surface-card, #140b14)",
              border: "1px solid var(--nk-border)",
              borderRadius: "18px",
              overflow: "hidden",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              transition: "transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
            }}
          >
            <div
              style={{
                position: "relative",
                aspectRatio: "4 / 5",
                width: "100%",
                overflow: "hidden",
                background: "#0c060d",
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={750}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.6s ease",
                }}
                className="portfolio-img-zoom"
                loading={index < 6 ? "eager" : "lazy"}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 60%, rgba(10,5,10,0.85) 100%)",
                  pointerEvents: "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "14px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "rgba(18, 9, 18, 0.82)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(224, 96, 134, 0.35)",
                  color: "var(--nk-rose-light)",
                }}
              >
                {photo.category}
              </span>
            </div>

            <div
              style={{
                padding: "20px 22px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)", fontWeight: 600 }}>
                  {photo.tag}
                </span>
                <span style={{ fontSize: "11px", color: "var(--nk-accent-champagne)", fontWeight: 600 }}>
                  High-Res 1200×1600
                </span>
              </div>

              <h2
                style={{
                  fontSize: "18px",
                  fontFamily: "var(--nk-font-serif)",
                  color: "var(--nk-text)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {photo.title}
              </h2>

              <p
                style={{
                  fontSize: "13px",
                  color: "var(--nk-text-muted)",
                  lineHeight: 1.5,
                  margin: "0 0 12px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                {photo.caption}
              </p>

              <div
                style={{
                  paddingTop: "12px",
                  borderTop: "1px solid var(--nk-border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--nk-rose-light)",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>Explore Frame</span>
                  <ArrowRight size={13} />
                </span>
                <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)" }}>Archival Asset</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
