import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Sparkles, ArrowRight, CheckCircle2, Mail, Layers, ShieldCheck } from "lucide-react";
import { CollabForm } from "@/components/collab-form";

export const metadata: Metadata = {
  title: "Brand Collaborations & Creative Inquiries | Nina Kurain",
  description:
    "Partner with Nina Kurain, Digital Creator and model. Explore collaboration opportunities across fashion editorials, brand campaigns, and creative direction.",
  keywords: [
    "Nina Kurain Collaborations",
    "Nina Kurain Brand Partnerships",
    "Nina Kurain Creative Inquiries",
    "Nina Kurain Model Bookings",
    "Digital Creator Collaborations",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/collaborations",
  },
  openGraph: {
    title: "Brand Collaborations & Inquiries | Nina Kurain",
    description: "Partner with Nina Kurain, Digital Creator and model.",
    url: "https://ninakurainservices.in/collaborations",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Nina Kurain Collaborations",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand Collaborations | Nina Kurain",
    description: "Partner with Nina Kurain, Digital Creator and model.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

export default function CollaborationsPage() {
  const jsonLdCollab = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://ninakurainservices.in/collaborations/#webpage",
        "url": "https://ninakurainservices.in/collaborations",
        "name": "Collaborations & Partnerships | Nina Kurain",
        "description": "Information on brand partnerships, campaigns, and creative bookings with Nina Kurain.",
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/collaborations/#breadcrumbs",
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
            "name": "Collaborations",
            "item": "https://ninakurainservices.in/collaborations",
          },
        ],
      },
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
              <span className="section-kicker">CREATIVE PARTNERSHIPS</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Collaborations &amp; Bookings
              </h1>
              <p>
                Nina Kurain collaborates with discerning fashion houses, design publications, luxury labels,
                and fellow creators seeking singular visual impact.
              </p>
            </div>
          </div>

          <div className="benefit-grid" style={{ marginBottom: "50px" }}>
            <article>
              <Sparkles size={28} />
              <h3>Haute Couture &amp; Lookbooks</h3>
              <p>
                Tailored photographic lookbooks and visual campaigns designed to communicate brand luxury,
                craftsmanship, and distinctive elegance.
              </p>
            </article>

            <article>
              <Layers size={28} />
              <h3>Visual Creative Direction</h3>
              <p>
                Full-spectrum concept development: location sourcing, chiaroscuro lighting design, styling consultation,
                and digital publishing assets.
              </p>
            </article>

            <article>
              <ShieldCheck size={28} />
              <h3>Licensing &amp; Editorial Rights</h3>
              <p>
                Direct licensing for high-resolution masters, digital marketing syndication, and magazine
                editorial publishing worldwide.
              </p>
            </article>
          </div>

          {/* Form Section */}
          <div className="collab-container">
            <div className="collab-info">
              <span className="section-kicker">DIRECT SUBMISSION</span>
              <h2>Start a Partnership Conversation</h2>
              <p>
                Please include relevant project details such as creative scope, proposed timeline,
                deliverable expectations, and licensing requirements.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <div style={{ fontSize: "14px", color: "var(--nk-text)" }}>
                  <strong>Official Representation:</strong> Inquiries directly managed by Nina Kurain Studio.
                </div>
                <div style={{ fontSize: "14px", color: "var(--nk-text)" }}>
                  <strong>Response Window:</strong> 24–48 business hours.
                </div>
              </div>
            </div>

            <CollabForm />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
