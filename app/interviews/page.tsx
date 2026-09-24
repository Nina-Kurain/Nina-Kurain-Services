import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Quote, ArrowRight } from "lucide-react";
import { NINA_ENTITY } from "@/lib/seo/nina-entity";

export const metadata: Metadata = {
  title: "Creator Notes & Q&A | Nina Kurain",
  description:
    "Official reflections and creator Q&A from Nina Kurain, Digital Creator. Perspectives on visual composition, creative direction, and independent media.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/interviews`,
  },
  openGraph: {
    title: "Creator Notes & Q&A | Nina Kurain",
    description:
      "Official reflections and creator Q&A from Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/interviews`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Creator Notes",
      },
    ],
    locale: "en_IN",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Notes & Q&A | Nina Kurain",
    description:
      "Official reflections and creator Q&A from Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default function InterviewsPage() {
  const notes = [
    {
      topic: "On aesthetic composition and light:",
      statement:
        "Every photograph is approached as a deliberate study in light and texture. In a landscape often hurried by quick snapshots, I prioritize thoughtful staging, intentional contrast, and stillness.",
      context: "Official Creator Statement",
    },
    {
      topic: "On independent publishing and direct community connection:",
      statement:
        "Building an independent home allows me to present high-resolution photography and creative projects directly to interested viewers, without the distortions of external feed compressions.",
      context: "Official Creator Statement",
    },
    {
      topic: "On creative growth and visual direction:",
      statement:
        "Consistency comes from refining one's own visual voice over time. Striving for depth in everyday frames is what makes digital storytelling meaningful.",
      context: "Official Creator Statement",
    },
  ];

  return (
    <div className="public-page-wrapper">
      <PublicHeader />

      <main id="main-content" style={{ padding: "120px 20px 80px", maxWidth: "980px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(224, 96, 134, 0.12)",
              border: "1px solid rgba(224, 96, 134, 0.3)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#f595b2",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            <Quote size={14} />
            <span>Official Dispatches</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 44px)",
              fontFamily: "var(--nk-font-serif, serif)",
              fontWeight: 600,
              margin: "0 0 16px",
            }}
          >
            Creator Notes &amp; Q&amp;A
          </h1>

          <p
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              fontSize: "16px",
              color: "var(--nk-text-muted, #b8a6b0)",
              lineHeight: 1.6,
            }}
          >
            Official creator statements, aesthetic philosophies, and reflections directly from Nina Kurain.
          </p>
        </div>

        {/* Statements List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginBottom: "60px" }}>
          {notes.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--nk-surface-card, #180d18)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "32px",
                position: "relative",
              }}
            >
              <div style={{ color: "#e06086", marginBottom: "12px", fontSize: "14px", fontWeight: 600 }}>
                {item.topic}
              </div>
              <blockquote
                style={{
                  margin: "0 0 16px",
                  fontSize: "17px",
                  lineHeight: 1.7,
                  fontFamily: "var(--nk-font-serif, serif)",
                  color: "#fff",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{item.statement}&rdquo;
              </blockquote>
              <div style={{ fontSize: "12.5px", color: "var(--nk-text-subtle, #806c78)" }}>
                — Nina Kurain, {item.context}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/about" className="btn-primary" style={{ display: "inline-flex" }}>
            <span>Learn More About Nina Kurain</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
