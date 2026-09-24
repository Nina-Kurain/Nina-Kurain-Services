"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Sparkles, Film, ArrowUpRight } from "lucide-react";

interface FeaturedVideoReelProps {
  src: string;
  poster: string;
  title: string;
  subtitle: string;
  creatorName: string;
}

export function FeaturedVideoReel({
  src,
  poster,
  title,
  subtitle,
  creatorName,
}: FeaturedVideoReelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="featured-video-reel reveal-on-scroll">
      <div style={{ position: "relative", width: "100%", background: "#050205" }}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          muted={isMuted}
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{ width: "100%", maxHeight: "560px", objectFit: "cover", display: "block" }}
        />

        {/* Video Controls Bar Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 4,
          }}
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause Video" : "Play Video"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "var(--nk-radius-full)",
              background: "rgba(9, 5, 9, 0.78)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause" : "Play Reel"}</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(9, 5, 9, 0.78)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* Top Floating Badge */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "var(--nk-radius-full)",
            background: "rgba(9, 5, 9, 0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "var(--nk-accent-champagne)",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            zIndex: 4,
          }}
        >
          <Film size={12} style={{ color: "var(--nk-rose-light)" }} />
          <span>Official 4K Showreel</span>
        </div>
      </div>

      <div className="video-reel-meta">
        <div className="video-reel-info">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <a
            href="https://vip.ninakurainservices.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: "12px" }}
          >
            <span>Access Uncut Vault (18+)</span>
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
