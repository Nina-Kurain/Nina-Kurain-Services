import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Mail, MessageSquare, Globe2, ExternalLink, ArrowRight } from "lucide-react";
import { InstagramIcon, FacebookIcon, PinterestIcon } from "@/components/social-icons";
import { ContactForm } from "@/components/contact-form";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Nina Kurain | Official Inquiries",
  description:
    "Direct contact details and inquiry portal for Nina Kurain, Digital Creator. For editorial licensing, brand collaborations, and general inquiries.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/contact`,
  },
  openGraph: {
    title: "Contact Nina Kurain | Official Inquiries",
    description: "Direct contact details and inquiry portal for Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/contact`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Contact Nina Kurain",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Nina Kurain | Official Inquiries",
    description: "Direct creator inquiries and communication portal.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function ContactPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;

  const jsonLdContact = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${NINA_ENTITY.canonicalBase}/contact/#webpage`,
        url: `${NINA_ENTITY.canonicalBase}/contact`,
        name: `Contact ${creatorName} | Official Inquiries`,
        description: `Official contact and communication portal for ${creatorName}, Digital Creator.`,
        about: {
          "@id": NINA_ENTITY.id,
        },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Contact", url: `${NINA_ENTITY.canonicalBase}/contact` },
      ]),
    ],
  };

  const whatsappLink = settings.whatsapp
    ? settings.whatsapp.startsWith("http")
      ? settings.whatsapp
      : `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`
    : "";

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
                Contact &amp; Inquiries
              </h1>
              <p>
                Have a proposal, media question, or collaboration opportunity? Use the verified channels
                below to establish direct communication with {creatorName} and her creative studio.
              </p>
            </div>
          </div>

          <div className="collab-container">
            <div className="collab-info">
              <h2>Direct Channels</h2>
              <p style={{ marginBottom: "24px" }}>
                All inquiries are processed directly. Please select the most appropriate channel:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "20px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "var(--nk-rose-light)" }}>
                    <Mail size={18} />
                    <strong>Collaborations &amp; Creative Direction</strong>
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--nk-text-muted)" }}>
                    Inquiries for brand campaigns, editorial styling, and visual projects.
                  </p>
                  <Link href="/collaborations" className="btn-secondary" style={{ fontSize: "12px", padding: "6px 14px", display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <span>Collaboration Portal</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div style={{ padding: "20px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "var(--nk-rose-light)" }}>
                    <InstagramIcon size={18} />
                    <strong>Instagram Direct</strong>
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--nk-text-muted)" }}>
                    Official account @kurain.bae for updates and creative interactions.
                  </p>
                  <a href={settings.instagram || NINA_ENTITY.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: "12px", padding: "6px 14px", display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <span>Message on Instagram</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                {whatsappLink && (
                  <div style={{ padding: "20px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "#34d399" }}>
                      <MessageSquare size={18} />
                      <strong>WhatsApp Direct Desk</strong>
                    </div>
                    <p style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--nk-text-muted)" }}>
                      Direct messaging desk for verified project inquiries.
                    </p>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: "12px", padding: "6px 14px", display: "inline-flex", gap: 6, alignItems: "center" }}>
                      <span>Chat on WhatsApp</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                <div style={{ padding: "20px", borderRadius: "var(--nk-radius-md)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "var(--nk-rose-light)" }}>
                    <Globe2 size={18} />
                    <strong>Official Domain Inquiries</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--nk-text-muted)" }}>
                    <code>ninakurainservices.in</code> — Verified canonical presence.
                  </p>
                </div>
              </div>
            </div>

            <div className="collab-form-box">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
