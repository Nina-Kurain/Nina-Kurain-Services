import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Sparkles, CheckCircle2, Mail, Layers } from "lucide-react";
import { CollabForm } from "@/components/collab-form";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";

import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brand Collaborations & Creative Inquiries | Nina Kurain",
  description:
    "Partner with Nina Kurain, Digital Creator. Inquiries for creative direction, editorial photography, and brand campaigns.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/collaborations`,
  },
  openGraph: {
    title: "Brand Collaborations & Inquiries | Nina Kurain",
    description: "Partner with Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/collaborations`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Collaborations",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand Collaborations | Nina Kurain",
    description: "Partner with Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function CollaborationsPage() {
  const { settings } = await getPublicCreatorData();
  const jsonLdCollab = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${NINA_ENTITY.canonicalBase}/collaborations/#webpage`,
        url: `${NINA_ENTITY.canonicalBase}/collaborations`,
        name: "Collaborations & Partnerships | Nina Kurain",
        description: "Information on brand partnerships, campaigns, and creative bookings with Nina Kurain.",
        about: {
          "@id": NINA_ENTITY.id,
        },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Collaborations", url: `${NINA_ENTITY.canonicalBase}/collaborations` },
      ]),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollab) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">COMMERCIAL &amp; EDITORIAL PARTNERSHIPS</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Collaborations
              </h1>
              <p>
                Nina Kurain collaborates with brands, designers, and creative teams on select projects
                aligning with thoughtful visual direction and aesthetic integrity.
              </p>
            </div>
          </div>

          <div className="collab-container">
            <div className="collab-info">
              <h2>Partnership Disciplines</h2>
              <p>
                Every collaboration is evaluated to ensure creative alignment and genuine aesthetic value.
                Typical engagements include:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "24px 0" }}>
                <div className="collab-tag"><span /> <strong>Editorial Styling:</strong> Contemporary fashion and handloom textile features</div>
                <div className="collab-tag"><span /> <strong>Studio Visuals:</strong> Original photography and bespoke cinematography</div>
                <div className="collab-tag"><span /> <strong>Digital Showcases:</strong> Product integrations across official channels</div>
                <div className="collab-tag"><span /> <strong>Creative Direction:</strong> Concept development and visual moodboards</div>
              </div>
              <p style={{ fontSize: "14px", color: "var(--nk-text-subtle)", fontStyle: "italic" }}>
                Note: Responses are typically provided within 48 business hours for accredited business inquiries.
              </p>
            </div>

            <div className="collab-form-box">
              <CollabForm />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
