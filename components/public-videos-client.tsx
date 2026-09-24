"use client";

import { Film, Lock, ArrowUpRight } from "lucide-react";
import type { DynamicVideo } from "@/lib/server/public-data";

interface PublicVideosClientProps {
  videos: DynamicVideo[];
  creatorName: string;
  youtubeUrl: string;
}

export function PublicVideosClient({
  videos,
  creatorName,
}: PublicVideosClientProps) {
  return (
    <div className="videos-client-container">
      {/* Featured Header Video Banner */}
      {videos.length > 0 && (
        <div
          className="featured-video-showcase reveal-on-scroll"
          style={{
            position: "relative",
            borderRadius: "var(--nk-radius-lg, 20px)",
            overflow: "hidden",
            border: "1px solid rgba(255, 45, 117, 0.35)",
            background: "#080308",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.7)",
            marginBottom: "48px",
          }}
        >
          <div style={{ position: "relative", width: "100%", maxHeight: "520px", overflow: "hidden" }}>
            <video
              src={videos[0].src}
              poster={videos[0].poster}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                maxHeight: "520px",
                objectFit: "cover",
                display: "block",
                filter: "brightness(0.7)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(8,3,8,0.95) 0%, rgba(8,3,8,0.3) 60%, rgba(8,3,8,0.6) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "clamp(24px, 4vw, 48px)",
              }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span
                  style={{
                    background: "linear-gradient(135deg, #ff2d75, #a92f49)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    boxShadow: "0 4px 14px rgba(255,45,117,0.4)",
                  }}
                >
                  FEATURED CINEMATOGRAPHY
                </span>
                <span
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    color: "#ff8dae",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,45,117,0.3)",
                  }}
                >
                  {videos[0].meta}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--nk-font-serif, Georgia, serif)",
                  fontSize: "clamp(26px, 4vw, 42px)",
                  color: "#ffffff",
                  margin: "0 0 10px",
                  lineHeight: 1.2,
                }}
              >
                {videos[0].title}
              </h2>

              <p
                style={{
                  fontSize: "15px",
                  color: "rgba(255, 255, 255, 0.8)",
                  maxWidth: "680px",
                  margin: "0 0 24px",
                  lineHeight: 1.6,
                }}
              >
                {videos[0].desc}
              </p>

              <div>
                <a
                  href="https://vip.ninakurainservices.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    background: "linear-gradient(135deg, #ff2d75, #a92f49)",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 28px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                    boxShadow: "0 8px 24px rgba(255, 45, 117, 0.4)",
                  }}
                >
                  <Lock size={16} />
                  <span>Unlock Full 4K Film in VIP Sanctuary</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Motion Releases */}
      <div className="section-head reveal-on-scroll" style={{ marginBottom: "20px" }}>
        <div className="section-head-copy">
          <span className="section-kicker">MOTION ARCHIVES</span>
          <h2 style={{ fontSize: "28px" }}>Complete Motion Archive</h2>
          <p>
            Exclusive 4K films, motion reels, and studio stories are locked for active VIP members.
          </p>
        </div>
      </div>

      <div className="video-grid">
        {videos.map((vid) => {
          return (
            <div
              key={vid.id}
              className="video-card reveal-on-scroll is-locked"
              style={{
                borderRadius: "var(--nk-radius-lg, 16px)",
                background: "var(--nk-surface-card, #120912)",
                border: "1px solid rgba(255, 45, 117, 0.25)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.25s ease, border-color 0.25s ease",
              }}
            >
              <div
                className="video-player-wrap"
                style={{ position: "relative", background: "#050205" }}
              >
                <video
                  src={vid.src}
                  poster={vid.poster}
                  playsInline
                  muted
                  loop
                  preload="metadata"
                  style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
                />

                {/* Member Lock Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(10, 4, 10, 0.72)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px 16px",
                    textAlign: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(255, 45, 117, 0.2)",
                      border: "1px solid rgba(255, 45, 117, 0.6)",
                      display: "grid",
                      placeItems: "center",
                      color: "#ff2d75",
                    }}
                  >
                    <Lock size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      color: "#ff8dae",
                      textTransform: "uppercase",
                    }}
                  >
                    {vid.meta}
                  </span>
                  <strong style={{ fontSize: "15px", color: "#ffffff", lineHeight: 1.3 }}>{vid.title}</strong>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.75)", margin: 0 }}>
                    Full Uncut 4K Extended Film
                  </p>
                  <a
                    href="https://vip.ninakurainservices.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="locked-card-cta"
                    style={{
                      margin: "6px 0 0",
                      padding: "8px 18px",
                      fontSize: "12px",
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, #a92f49, #ff2d75)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    <span>Unlock in VIP Sanctuary</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>

              <div className="video-card-body" style={{ padding: "18px 20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div className="video-card-meta" style={{ fontSize: "11.5px", color: "#ff8dae", marginBottom: "6px" }}>
                  {vid.meta}
                </div>
                <h3 style={{ fontSize: "17px", color: "var(--nk-text, #fff)", margin: "0 0 8px" }}>{vid.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--nk-text-muted, #aaa)", margin: "0 0 16px", lineHeight: 1.6, flex: 1 }}>
                  {vid.desc}
                </p>

                <div style={{ marginTop: "auto" }}>
                  <a
                    href="https://vip.ninakurainservices.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "10px 18px",
                      fontSize: "12.5px",
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, #a92f49, #ff2d75)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    <Lock size={14} />
                    <span>Unlock in VIP Sanctuary</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
