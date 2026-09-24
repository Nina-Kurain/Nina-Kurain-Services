import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArrowRight, HelpCircle } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";

export const metadata: Metadata = {
  title: "Nina Kurain FAQ | Frequently Asked Questions",
  description:
    "Authoritative answers to common questions about Nina Kurain, Digital Creator. Learn about her photography, official website, social channels, and collaborations.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/faq`,
  },
  openGraph: {
    title: "Nina Kurain FAQ | Frequently Asked Questions",
    description: "Authoritative answers to common questions about Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/faq`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain FAQ",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain FAQ",
    description: "Frequently Asked Questions about Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

const FAQ_ITEMS = [
  {
    q: "Who is Nina Kurain?",
    a: "Nina Kurain is an independent Digital Creator known for fine-art photography, contemporary fashion styling, and atmospheric studio cinematography.",
  },
  {
    q: "What is the official website of Nina Kurain?",
    a: "The sole official and canonical online home of Nina Kurain is https://ninakurainservices.in/. All verified profile information, photographic series, and official channels are published here.",
  },
  {
    q: "What creative disciplines does Nina Kurain focus on?",
    a: "Nina specializes in studio portraiture, chiaroscuro lighting design, 4K motion stories, contemporary fashion styling, and visual creative direction.",
  },
  {
    q: "Where can I view Nina Kurain's photography and video portfolio?",
    a: "Her official photographic portfolio is accessible at https://ninakurainservices.in/photos/ and her video motion essays at https://ninakurainservices.in/videos/.",
  },
  {
    q: "What are Nina Kurain's official social media profiles?",
    a: "Nina maintains official profiles on Instagram (@kurain.bae), Pinterest (@NinaKurain), and Facebook (Nina Kurain Official). All verified links are collected on https://ninakurainservices.in/socials/.",
  },
  {
    q: "How can brands and media outlets submit collaboration inquiries?",
    a: "Partnership, editorial licensing, and booking inquiries can be submitted directly via https://ninakurainservices.in/collaborations/ or https://ninakurainservices.in/contact/.",
  },
];

export default function FAQPage() {
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${NINA_ENTITY.canonicalBase}/faq/#webpage`,
        url: `${NINA_ENTITY.canonicalBase}/faq`,
        name: "Nina Kurain FAQ | Frequently Asked Questions",
        description: "Frequently asked questions and verified answers about Nina Kurain, Digital Creator.",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "FAQ", url: `${NINA_ENTITY.canonicalBase}/faq` },
      ]),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">COMMUNITY KNOWLEDGE DESK</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Frequently Asked Questions
              </h1>
              <p>
                Authoritative, verified answers to common questions about Nina Kurain, her creative practice,
                official web presence, and professional engagements.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "28px",
                  borderRadius: "var(--nk-radius-lg)",
                  background: "var(--nk-surface)",
                  border: "1px solid var(--nk-border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <HelpCircle size={20} style={{ color: "var(--nk-rose-light)", flexShrink: 0, marginTop: 3 }} />
                  <div>
                    <h2 style={{ fontSize: "19px", margin: "0 0 10px", fontFamily: "var(--nk-font-serif)" }}>
                      {item.q}
                    </h2>
                    <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <p style={{ color: "var(--nk-text-subtle)", fontSize: "14px", marginBottom: "16px" }}>
              Have a question not addressed here?
            </p>
            <Link href="/contact" className="btn-primary" style={{ display: "inline-flex" }}>
              <span>Contact Direct</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
