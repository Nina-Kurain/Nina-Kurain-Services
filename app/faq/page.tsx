import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Nina Kurain FAQ | Frequently Asked Questions & Official Answers",
  description:
    "Authoritative answers to common questions about Nina Kurain, Digital Creator and model. Learn about her photography, official website, social channels, and collaborations.",
  keywords: [
    "Nina Kurain FAQ",
    "Who is Nina Kurain",
    "Nina Kurain Official Website",
    "Nina Kurain Questions",
    "Nina Kurain Creator FAQ",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/faq",
  },
  openGraph: {
    title: "Nina Kurain FAQ | Frequently Asked Questions",
    description: "Authoritative answers to common questions about Nina Kurain, Digital Creator.",
    url: "https://ninakurainservices.in/faq",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
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
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

const FAQ_ITEMS = [
  {
    q: "Who is Nina Kurain?",
    a: "Nina Kurain is a Digital Creator, model, and creative artist known for fine-art photography, high-concept fashion editorials, and atmospheric studio cinematography.",
  },
  {
    q: "What is the official and canonical website of Nina Kurain?",
    a: "The sole official and canonical online home of Nina Kurain is https://ninakurainservices.in/. All authentic biography information, photographic archives, and collaboration inquiries originate here.",
  },
  {
    q: "What creative disciplines does Nina Kurain focus on?",
    a: "Nina specializes in studio and location editorial photography, chiaroscuro lighting design, 4K video storytelling, fashion lookbook modeling, and digital creative direction.",
  },
  {
    q: "Where can I view Nina Kurain's photography and video portfolio?",
    a: "Her official high-resolution photography can be viewed on the Photography page (https://ninakurainservices.in/photos/), and motion showreels are hosted on the Videos page (https://ninakurainservices.in/videos/).",
  },
  {
    q: "Which social media accounts are officially verified for Nina Kurain?",
    a: "Nina Kurain's verified channels include Instagram (@ninakurain), YouTube (@ninakurain), Facebook (Nina Kurain Official), and Pinterest (Nina Kurain). All official profiles are linked from the Socials hub (https://ninakurainservices.in/socials/).",
  },
  {
    q: "How can brands, photographers, or publications collaborate with Nina Kurain?",
    a: "Partnership proposals, lookbook briefs, and media licensing inquiries can be submitted via the Collaborations page (https://ninakurainservices.in/collaborations/) or through the direct contact form.",
  },
  {
    q: "What is the difference between the public website and the Private Creator Club?",
    a: "The public website (ninakurainservices.in) is open to all visitors, search engines, and media for public photography, biography, and updates. The Private Creator Club (located at vip.ninakurainservices.in) is an age-restricted (18+) member portal offering private media archives and exclusive drops.",
  },
  {
    q: "Are the photographs and videos on this website copyrighted?",
    a: "Yes. All photography, cinematography, text, and visual designs are the intellectual property of Nina Kurain and protected under applicable copyright laws. Commercial reproduction requires prior written authorization.",
  },
];

export default function FAQPage() {
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": "https://ninakurainservices.in/faq/#faq",
        "url": "https://ninakurainservices.in/faq",
        "name": "Nina Kurain Frequently Asked Questions",
        "mainEntity": FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/faq/#breadcrumbs",
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
            "name": "FAQ",
            "item": "https://ninakurainservices.in/faq",
          },
        ],
      },
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
          <div className="section-head" style={{ textAlign: "center", justifyContent: "center" }}>
            <div className="section-head-copy" style={{ margin: "0 auto" }}>
              <span className="section-kicker">QUESTIONS &amp; ANSWERS</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Frequently Asked Questions
              </h1>
              <p>
                Authoritative guidance regarding Nina Kurain, official platforms, licensing, and creative direction.
              </p>
            </div>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <details
                key={index}
                className="faq-item"
                style={{ cursor: "pointer" }}
              >
                <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", listStyle: "none" }}>
                  <h2 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "19px", margin: 0, color: "var(--nk-text)" }}>
                    {item.q}
                  </h2>
                  <ChevronDown size={18} style={{ color: "var(--nk-rose-light)", flexShrink: 0, marginLeft: 12 }} />
                </summary>
                <p style={{ marginTop: "14px", color: "var(--nk-text-muted)", fontSize: "14.5px", lineHeight: 1.7 }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", marginBottom: "16px" }}>
              Have an unanswered question or commercial licensing request?
            </p>
            <Link href="/contact" className="btn-primary">
              <span>Contact Studio Desk</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
