import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArrowRight, Mail, Sparkles, FileText } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";

export const metadata: Metadata = {
  title: "Nina Kurain Press & Media Kit",
  description:
    "Official press and media kit for Nina Kurain, Digital Creator. Access approved brand assets, creator biography, and media inquiries.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/press`,
  },
  openGraph: {
    title: "Nina Kurain Press & Media Kit",
    description: "Official press and media resources for Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/press`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Press Room",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Press & Media Kit",
    description: "Official media kit and brand resources for Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default function PressPage() {
  const jsonLdPress = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${NINA_ENTITY.canonicalBase}/press/#webpage`,
        url: `${NINA_ENTITY.canonicalBase}/press`,
        name: "Nina Kurain Press & Media Kit",
        description: "Official first-party press resources, media assets, and statements for Nina Kurain.",
        about: {
          "@id": NINA_ENTITY.id,
        },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Press", url: `${NINA_ENTITY.canonicalBase}/press` },
      ]),
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
              <span className="section-kicker">FIRST-PARTY MEDIA ROOM</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Press &amp; Media Kit
              </h1>
              <p>
                Official creator statements, brand identity guidelines, approved photography downloads,
                and contact channels for publications, editors, and partners.
              </p>
            </div>
            <div>
              <Link href="/contact" className="btn-primary">
                <span>Media Inquiry</span>
                <Mail size={14} />
              </Link>
            </div>
          </div>

          {/* Brand Boilerplate */}
          <div style={{
            padding: "clamp(24px, 4vw, 36px)",
            borderRadius: "var(--nk-radius-lg)",
            background: "var(--nk-surface)",
            border: "1px solid var(--nk-border)",
            marginBottom: "40px",
          }}>
            <h2 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "24px", margin: "0 0 16px" }}>
              Official Creator Summary
            </h2>
            <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", lineHeight: 1.75, margin: "0 0 20px" }}>
              <strong>Nina Kurain</strong> is an independent Digital Creator known for fine-art photography,
              contemporary fashion styling, and atmospheric studio cinematography. Operating through her
              official digital hub at <code>ninakurainservices.in</code>, her creative body of work focuses
              on composition, texture depth, and visual storytelling.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div className="collab-tag"><span /> <strong>Name:</strong> Nina Kurain</div>
              <div className="collab-tag"><span /> <strong>Positioning:</strong> Digital Creator</div>
              <div className="collab-tag"><span /> <strong>Official Hub:</strong> ninakurainservices.in</div>
              <div className="collab-tag"><span /> <strong>Instagram:</strong> @kurain.bae</div>
            </div>
          </div>

          {/* Downloadable Media Resources */}
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">APPROVED ASSETS</span>
              <h2>Media Resources</h2>
              <p>Approved visual assets for editorial use with copyright attribution: Photo © Nina Kurain.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            <div style={{ padding: "24px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
              <FileText size={28} style={{ color: "var(--nk-rose-light)", marginBottom: "12px" }} />
              <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "19px", margin: "0 0 8px" }}>Creator Biography</h3>
              <p style={{ fontSize: "13px", color: "var(--nk-text-muted)", margin: "0 0 16px" }}>
                Biographical background, creative disciplines, and official social links.
              </p>
              <Link href="/about" className="section-action-link">
                <span>View Creator Profile</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ padding: "24px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
              <Sparkles size={28} style={{ color: "var(--nk-rose-light)", marginBottom: "12px" }} />
              <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "19px", margin: "0 0 8px" }}>Approved Portraits</h3>
              <p style={{ fontSize: "13px", color: "var(--nk-text-muted)", margin: "0 0 16px" }}>
                Curated high-resolution portraits optimized for editorial and publication features.
              </p>
              <Link href="/photos" className="section-action-link">
                <span>Browse Photo Gallery</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ padding: "24px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
              <Mail size={28} style={{ color: "var(--nk-rose-light)", marginBottom: "12px" }} />
              <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "19px", margin: "0 0 8px" }}>Direct Media Inquiries</h3>
              <p style={{ fontSize: "13px", color: "var(--nk-text-muted)", margin: "0 0 16px" }}>
                For editorial commentary, licensing inquiries, and interview questions.
              </p>
              <Link href="/contact" className="section-action-link">
                <span>Contact Direct</span>
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
