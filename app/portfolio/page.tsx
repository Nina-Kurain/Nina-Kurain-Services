import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Camera, ArrowRight, Mail, Sparkles, CheckCircle2, Layers, Palette, Eye } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";
import { PHOTOS_DATA } from "@/lib/photos-data";
import { PortfolioClient } from "@/components/portfolio-client";

export const metadata: Metadata = {
  title: "Nina Kurain Portfolio | Curated Creative & Editorial Works",
  description:
    "Official creative portfolio of Nina Kurain, Digital Creator. Showcasing fine-art studio portraiture, modern fashion editorial styling, and visual direction archives.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/portfolio`,
  },
  openGraph: {
    title: "Nina Kurain Portfolio | Curated Creative & Editorial Works",
    description:
      "Official creative portfolio of Nina Kurain, Digital Creator. Showcasing fine-art studio portraiture, modern fashion editorial styling, and visual direction archives.",
    url: `${NINA_ENTITY.canonicalBase}/portfolio`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Portfolio",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Portfolio | Curated Creative & Editorial Works",
    description:
      "Official creative portfolio of Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default function PortfolioPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${NINA_ENTITY.canonicalBase}/portfolio/#webpage`,
        url: `${NINA_ENTITY.canonicalBase}/portfolio`,
        name: "Nina Kurain Portfolio | Curated Creative & Editorial Works",
        description:
          "Official creative portfolio of Nina Kurain, Digital Creator. Showcasing fine-art studio portraiture, modern fashion editorial styling, and visual direction archives.",
        about: {
          "@id": NINA_ENTITY.id,
        },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Portfolio", url: `${NINA_ENTITY.canonicalBase}/portfolio` },
      ]),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main id="main-content" style={{ padding: "120px 20px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Portfolio Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(224, 96, 134, 0.12)",
              border: "1px solid rgba(224, 96, 134, 0.3)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#f595b2",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            <Camera size={14} />
            <span>Curated Creative &amp; Editorial Archives</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(34px, 5.5vw, 54px)",
              fontFamily: "var(--nk-font-serif, serif)",
              fontWeight: 600,
              margin: "0 0 16px",
              color: "var(--nk-text)",
            }}
          >
            Nina Kurain Portfolio
          </h1>

          <p
            style={{
              maxWidth: "720px",
              margin: "0 auto 24px",
              fontSize: "16.5px",
              color: "var(--nk-text-muted, #b8a6b0)",
              lineHeight: 1.6,
            }}
          >
            The canonical creative body of work by Digital Creator Nina Kurain. Encompassing studio portraiture,
            editorial styling, and visual direction. Discover her signature aesthetics or inquire for bespoke commercial commissions.
          </p>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
              marginTop: "20px",
              padding: "16px 24px",
              background: "var(--nk-surface, #120912)",
              borderRadius: "999px",
              border: "1px solid var(--nk-border)",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div style={{ fontSize: "13px", color: "var(--nk-text)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} style={{ color: "var(--nk-rose-light)" }} />
              <strong>{PHOTOS_DATA.length}</strong> Works Available
            </div>
            <div style={{ fontSize: "13px", color: "var(--nk-text)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Layers size={14} style={{ color: "var(--nk-accent-champagne)" }} />
              <strong>4</strong> Core Series
            </div>
            <div style={{ fontSize: "13px", color: "var(--nk-text)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Palette size={14} style={{ color: "var(--nk-rose)" }} />
              <strong>100%</strong> Original Direction
            </div>
          </div>
        </div>

        {/* Interactive Filterable Works */}
        <PortfolioClient photos={PHOTOS_DATA} />

        {/* Creative Disciplines & Production Standards */}
        <div style={{ margin: "60px 0 50px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "var(--nk-rose-light)",
                textTransform: "uppercase",
              }}
            >
              PRODUCTION CAPABILITIES
            </span>
            <h2 style={{ fontSize: "28px", fontFamily: "var(--nk-font-serif)", margin: "8px 0" }}>
              Commission &amp; Collaborative Capabilities
            </h2>
            <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", maxWidth: "620px", margin: "0 auto" }}>
              High-standard artistic direction tailored for luxury fashion brands, editorial features, and visual media dispatches.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            <div
              style={{
                background: "var(--nk-surface, #140b14)",
                border: "1px solid var(--nk-border)",
                borderRadius: "18px",
                padding: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <Camera size={26} style={{ color: "var(--nk-rose-light)" }} />
              <h3 style={{ fontSize: "18px", margin: 0, fontFamily: "var(--nk-font-serif)" }}>Studio &amp; Location Shoots</h3>
              <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted)", lineHeight: 1.6, margin: 0 }}>
                High-end studio illumination, controlled shadows, and ambient environmental shoots capturing intricate textures and authentic depth.
              </p>
            </div>

            <div
              style={{
                background: "var(--nk-surface, #140b14)",
                border: "1px solid var(--nk-border)",
                borderRadius: "18px",
                padding: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <Palette size={26} style={{ color: "var(--nk-rose-light)" }} />
              <h3 style={{ fontSize: "18px", margin: 0, fontFamily: "var(--nk-font-serif)" }}>Editorial Fashion Styling</h3>
              <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted)", lineHeight: 1.6, margin: 0 }}>
                Contemporary ethnic draping, minimalist silhouettes, and visual concepts aligning with high-fashion and lifestyle aesthetics.
              </p>
            </div>

            <div
              style={{
                background: "var(--nk-surface, #140b14)",
                border: "1px solid var(--nk-border)",
                borderRadius: "18px",
                padding: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <CheckCircle2 size={26} style={{ color: "var(--nk-rose-light)" }} />
              <h3 style={{ fontSize: "18px", margin: 0, fontFamily: "var(--nk-font-serif)" }}>Commercial Deliverables</h3>
              <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted)", lineHeight: 1.6, margin: 0 }}>
                RAW source masters, uncompressed high-resolution WebP files, complete licensing documentation, and multi-channel promotion.
              </p>
            </div>
          </div>
        </div>

        {/* Booking & Collaborations Callout */}
        <div
          style={{
            padding: "44px 32px",
            borderRadius: "22px",
            background: "linear-gradient(135deg, rgba(224, 96, 134, 0.14) 0%, rgba(18, 9, 18, 0.95) 100%)",
            border: "1px solid rgba(224, 96, 134, 0.3)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "var(--nk-rose-light)", textTransform: "uppercase" }}>
            INITIATE A PROJECT
          </span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 12px", fontFamily: "var(--nk-font-serif)" }}>
            Commercial Commissions &amp; Press Bookings
          </h2>
          <p style={{ maxWidth: "620px", margin: "0 auto 26px", fontSize: "15px", color: "var(--nk-text-muted, #b8a6b0)", lineHeight: 1.6 }}>
            Ready to commission Nina Kurain for an editorial campaign, commercial partnership, or creative visual direction?
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/collaborations" className="btn-primary">
              <Mail size={15} />
              <span>Request Campaign Booking</span>
            </Link>
            <Link href="/pricing" className="btn-secondary">
              <span>View Membership &amp; Rates</span>
            </Link>
            <Link href="/photos" className="btn-secondary">
              <Eye size={15} />
              <span>Full Photography Archive</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
