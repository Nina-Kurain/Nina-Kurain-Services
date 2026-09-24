"use client";

import { Film, ArrowUpRight, ArrowRight, Play } from "lucide-react";
import { YoutubeIcon } from "@/components/social-icons";
import Link from "@/components/site-link";
import type { DynamicVideo } from "@/lib/server/public-data";

interface PublicVideosClientProps {
  videos?: DynamicVideo[];
  creatorName: string;
  youtubeUrl?: string;
}

export function PublicVideosClient({
  creatorName,
  youtubeUrl = "https://www.youtube.com/@ninakurain",
}: PublicVideosClientProps) {
  const activeYoutubeUrl =
    youtubeUrl && youtubeUrl.trim().length > 0
      ? youtubeUrl.trim()
      : "https://www.youtube.com";

  return (
    <div className="videos-client-container">
      {/* Featured Motion Hub Showcase */}
      <div
        className="featured-video-showcase reveal-on-scroll"
        style={{
          position: "relative",
          borderRadius: "var(--nk-radius-lg, 20px)",
          overflow: "hidden",
          border: "1px solid var(--nk-border)",
          background: "var(--nk-surface-card, #120912)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
          marginBottom: "48px",
          padding: "clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px)",
        }}
      >
        <div style={{ maxWidth: "760px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span
              style={{
                background: "var(--nk-gradient-accent)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: "999px",
                boxShadow: "0 4px 14px var(--nk-rose-glow)",
              }}
            >
              CINEMATOGRAPHY &amp; MOTION STUDIO
            </span>
            <span
              style={{
                background: "rgba(0,0,0,0.6)",
                color: "var(--nk-rose-light)",
                fontSize: "11px",
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid var(--nk-border)",
              }}
            >
              OFFICIAL HUB
            </span>
          </div>

          <h2
            style={{
              fontFamily: "var(--nk-font-serif, Georgia, serif)",
              fontSize: "clamp(26px, 4.5vw, 46px)",
              color: "var(--nk-text)",
              margin: "0 0 14px",
              lineHeight: 1.15,
            }}
          >
            Visual Motion Stories &amp; Studio Cinematography
          </h2>

          <p
            style={{
              fontSize: "15px",
              color: "var(--nk-text-muted)",
              margin: "0 0 28px",
              lineHeight: 1.68,
            }}
          >
            Explore original 4K cinematography, rhythmic motion essays, and behind-the-lens studio vignettes
            directed by {creatorName}. All complete video works are published on the official YouTube channel.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
            <a
              href={activeYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              <YoutubeIcon size={16} />
              <span>Watch on Official YouTube Channel</span>
              <ArrowUpRight size={15} />
            </a>

            <Link
              href="/collaborations"
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 22px",
                fontSize: "13.5px",
              }}
            >
              <span>Commission Video Production</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Motion Works Directory Cards */}
      <div className="section-head reveal-on-scroll" style={{ marginBottom: "20px" }}>
        <div className="section-head-copy">
          <span className="section-kicker">MOTION DISCIPLINES</span>
          <h2 style={{ fontSize: "28px" }}>Cinematography Projects</h2>
          <p>
            Curated visual series exploring atmospheric lighting, pacing, and editorial motion direction.
          </p>
        </div>
      </div>

      <div className="video-directory-grid">
        <div className="video-directory-card">
          <div className="video-directory-badge">
            <Film size={14} />
            <span>4K Motion Story • Studio Vignette</span>
          </div>
          <h3>Studio Light &amp; Rhythm</h3>
          <p>
            A rhythmic visual study of light, texture, and cinematic pacing exploring tonal depth and deliberate stillness.
          </p>
          <div className="video-directory-actions">
            <a
              href={activeYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: "12.5px", padding: "7px 16px", cursor: "pointer" }}
            >
              <Play size={13} />
              <span>Watch on YouTube</span>
            </a>
          </div>
        </div>

        <div className="video-directory-card">
          <div className="video-directory-badge">
            <Film size={14} />
            <span>Behind The Lens • Editorial</span>
          </div>
          <h3>The Editorial Archive</h3>
          <p>
            Glimpses into the creative process, studio lighting setup, and spontaneous movement during editorial shoots.
          </p>
          <div className="video-directory-actions">
            <a
              href={activeYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: "12.5px", padding: "7px 16px", cursor: "pointer" }}
            >
              <Play size={13} />
              <span>Watch on YouTube</span>
            </a>
          </div>
        </div>

        <div className="video-directory-card">
          <div className="video-directory-badge">
            <Film size={14} />
            <span>Visual Direction • Motion Study</span>
          </div>
          <h3>Kinetic Expression</h3>
          <p>
            Contemporary fashion movement, high-contrast illumination, and atmospheric cinematography direction.
          </p>
          <div className="video-directory-actions">
            <a
              href={activeYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: "12.5px", padding: "7px 16px", cursor: "pointer" }}
            >
              <Play size={13} />
              <span>Watch on YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
