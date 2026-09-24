import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Mail, MessageSquare, ArrowRight, CheckCircle2, Globe2, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Nina Kurain | Official Creator Inquiries",
  description:
    "Direct contact details and inquiry portal for Nina Kurain, Digital Creator and model. For brand collaborations, media requests, and bookings.",
  keywords: [
    "Contact Nina Kurain",
    "Nina Kurain Email",
    "Nina Kurain Inquiries",
    "Nina Kurain Booking",
    "Nina Kurain Management",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/contact",
  },
  openGraph: {
    title: "Contact Nina Kurain | Official Creator Inquiries",
    description: "Direct contact details and inquiry portal for Nina Kurain, Digital Creator and model.",
    url: "https://ninakurainservices.in/contact",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Contact Nina Kurain",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Nina Kurain",
    description: "Direct creator inquiries and media booking.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

export default function ContactPage() {
  const jsonLdContact = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": "https://ninakurainservices.in/contact/#webpage",
        "url": "https://ninakurainservices.in/contact",
        "name": "Contact Nina Kurain | Official Creator Inquiries",
        "description": "Official contact and communication portal for Nina Kurain, Digital Creator.",
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/contact/#breadcrumbs",
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
            "name": "Contact",
            "item": "https://ninakurainservices.in/contact",
          },
        ],
      },
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdContact) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">COMMUNICATIONS DESK</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Contact Nina Kurain
              </h1>
              <p>
                Direct communication channels for brand partnerships, media requests, editorial bookings,
                and creative inquiries.
              </p>
            </div>
          </div>

          <div className="contact-layout-grid">
            <div className="contact-form-card">
              <ContactForm />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ padding: "26px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                <Mail size={24} style={{ color: "var(--nk-rose-light)", marginBottom: "10px" }} />
                <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "18px", margin: "0 0 6px" }}>Official Inquiry Inbox</h3>
                <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted)", margin: "0 0 10px", lineHeight: 1.6 }}>
                  Direct studio correspondence for commercial and media projects:
                </p>
                <code style={{ fontSize: "13px", color: "var(--nk-rose-light)" }}>contact@ninakurainservices.in</code>
              </div>

              <div style={{ padding: "26px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                <Globe2 size={24} style={{ color: "var(--nk-rose-light)", marginBottom: "10px" }} />
                <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "18px", margin: "0 0 6px" }}>Canonical Domain</h3>
                <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted)", margin: 0, lineHeight: 1.6 }}>
                  Nina Kurain&apos;s sole authoritative domain is <strong>https://ninakurainservices.in/</strong>. All official updates and image releases are published here.
                </p>
              </div>

              <div style={{ padding: "26px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                <Sparkles size={24} style={{ color: "var(--nk-rose-light)", marginBottom: "10px" }} />
                <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "18px", margin: "0 0 6px" }}>Social Messaging</h3>
                <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>
                  You may also send verified direct messages via our official Instagram handle.
                </p>
                <a href="https://www.instagram.com/ninakurain" target="_blank" rel="noopener noreferrer" className="section-action-link">
                  <span>Visit @ninakurain</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
