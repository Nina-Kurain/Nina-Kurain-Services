import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArrowRight, Download, Mail, ExternalLink, Sparkles, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Nina Kurain | Press & Media Room",
  description:
    "Official Press and Media resources for Nina Kurain, Digital Creator and model. Access high-resolution brand assets, official biographies, and media inquiries.",
  keywords: [
    "Nina Kurain Press",
    "Nina Kurain Media Kit",
    "Nina Kurain Press Kit",
    "Nina Kurain Bio PDF",
    "Nina Kurain Official Media",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/press",
  },
  openGraph: {
    title: "Nina Kurain | Press & Media Room",
    description: "Official Press and Media resources for Nina Kurain, Digital Creator.",
    url: "https://ninakurainservices.in/press",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Nina Kurain Press Room",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain | Press & Media Room",
    description: "Official press releases and brand assets for Nina Kurain.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

export default function PressPage() {
  const jsonLdPress = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://ninakurainservices.in/press/#webpage",
        "url": "https://ninakurainservices.in/press",
        "name": "Nina Kurain Press & Media Room",
        "description": "Press resources, media assets, and official statements for Nina Kurain.",
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/press/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Nina Kurain",
            "item": "https://ninakurainservices.in/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Press",
            "item": "https://ninakurainservices.in/press",
          },
        ],
      },
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPress) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">EDITORIAL &amp; MEDIA ROOM</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Press &amp; Media Kit
              </h1>
              <p>
                Resources, brand identity guidelines, high-resolution portrait downloads, and official
                statements for journalists, editors, and conference organizers.
              </p>
            </div>
            <div>
              <Link href="/contact" className="btn-primary">
                <span>Media Inquiry</span>
                <Mail size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Facts / Brand Boilerplate */}
          <div style={{
            padding: "clamp(24px, 4vw, 36px)",
            borderRadius: "var(--nk-radius-lg)",
            background: "var(--nk-surface)",
            border: "1px solid var(--nk-border)",
            marginBottom: "40px",
          }}>
            <h2 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "24px", margin: "0 0 16px" }}>
              Official Brand Boilerplate
            </h2>
            <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", lineHeight: 1.75, margin: "0 0 20px" }}>
              <strong>Nina Kurain</strong> is an Indian Digital Creator, model, and creative artist celebrated
              for original fine-art photography, high-concept fashion editorials, and atmospheric studio
              cinematography. Operating from her official digital hub at <code>ninakurainservices.in</code>,
              her creative body of work explores chiaroscuro aesthetics, modern minimalism, and kinetic motion.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div className="collab-tag"><span /> <strong>Canonical Name:</strong> Nina Kurain</div>
              <div className="collab-tag"><span /> <strong>Positioning:</strong> Digital Creator</div>
              <div className="collab-tag"><span /> <strong>Domain:</strong> ninakurainservices.in</div>
              <div className="collab-tag"><span /> <strong>Entity ID:</strong> #nina-kurain</div>
            </div>
          </div>

          {/* Downloadable Media Resources */}
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">DOWNLOADABLE ASSETS</span>
              <h2>High-Resolution Media Package</h2>
              <p>Approved visual assets for publication with standard copyright attribution: Photo © Nina Kurain.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            <div style={{ padding: "24px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
              <FileText size={28} style={{ color: "var(--nk-rose-light)", marginBottom: "12px" }} />
              <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "19px", margin: "0 0 8px" }}>Official Biography Dossier</h3>
              <p style={{ fontSize: "13px", color: "var(--nk-text-muted)", margin: "0 0 16px" }}>
                Complete biographical background, artistic journey, creative disciplines, and canonical links.
              </p>
              <Link href="/about" className="section-action-link">
                <span>View Full Bio</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ padding: "24px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
              <Sparkles size={28} style={{ color: "var(--nk-rose-light)", marginBottom: "12px" }} />
              <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "19px", margin: "0 0 8px" }}>Signature Press Portraits</h3>
              <p style={{ fontSize: "13px", color: "var(--nk-text-muted)", margin: "0 0 16px" }}>
                Curated high-resolution WebP/JPG portraits optimized for print and online editorial features.
              </p>
              <Link href="/photos" className="section-action-link">
                <span>Browse Press Gallery</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ padding: "24px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
              <Mail size={28} style={{ color: "var(--nk-rose-light)", marginBottom: "12px" }} />
              <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "19px", margin: "0 0 8px" }}>Direct Media Liaison</h3>
              <p style={{ fontSize: "13px", color: "var(--nk-text-muted)", margin: "0 0 16px" }}>
                For interview requests, podcast appearances, and editorial commentary.
              </p>
              <Link href="/contact" className="section-action-link">
                <span>Contact Press Desk</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
