import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Sparkles, Check, ArrowRight, ShieldCheck, ArrowUpRight, Crown, Star, Heart } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — Membership Pricing & Tier Access | Official Portal",
  description:
    "Official membership pricing, patron tiers, and commercial licensing rates for Nina Kurain. Discover free access, VIP private sanctuary, and brand partnership packages.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/pricing`,
  },
  openGraph: {
    title: "Nina Kurain — Membership Pricing & Tier Access",
    description: "Official membership pricing and patron tiers for Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/pricing`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-kurain-og.jpg", width: 1376, height: 768, alt: "Nina Kurain Pricing" }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function PricingPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/pricing`;
  const vipUrl = settings.vipUrl || "https://vip.ninakurainservices.in/";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${creatorName} Membership Pricing & Tiers`,
        description: `Official rate card, membership tiers, and commercial licensing options for ${creatorName}.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Pricing & Memberships", url: pageUrl },
      ]),
    ],
  };

  const tiers = [
    {
      name: "Public Explorer",
      badge: "Free Access",
      price: "₹0",
      cadence: "Permanent Free Access",
      desc: "Comprehensive access to all curated public portfolio series and creator dispatches.",
      features: [
        "Full high-res photography gallery (51 frames)",
        "Visual lookbook and aesthetic themes",
        "Public creator updates and studio journals",
        "Official social channels and verified credentials",
      ],
      ctaText: "Explore Public Gallery",
      ctaLink: "/photos",
      isExternal: false,
      highlight: false,
    },
    {
      name: "VIP Member Sanctuary",
      badge: "Most Popular Patron Tier",
      price: "VIP Club",
      cadence: "Monthly Direct Support",
      desc: "Private member sanctuary offering uninhibited studio drops, full uncut galleries, and direct engagement.",
      features: [
        "Uncut 4K high-resolution photographic sets",
        "Private daily stories and behind-the-scenes teasers",
        "Community commenting, direct likes, and discussions",
        "Priority requests for upcoming creative themes",
        "Ad-free uninterrupted viewing sanctuary",
      ],
      ctaText: "Join VIP Sanctuary",
      ctaLink: "/memberships",
      isExternal: false,
      highlight: true,
    },
    {
      name: "Brand Collaboration",
      badge: "Commercial Licensing",
      price: "Custom",
      cadence: "Per Campaign Booking",
      desc: "Bespoke commercial visual direction, sponsored editorial features, and commercial image licensing.",
      features: [
        "Custom editorial photo/video session",
        "Multi-channel promotion (@kurain.bae & website)",
        "Full commercial usage rights & RAW deliverables",
        "Category exclusivity and formal contract invoicing",
      ],
      ctaText: "Inquire for Booking",
      ctaLink: "/collaborations",
      isExternal: false,
      highlight: false,
    },
  ];

  return (
    <div className="public-page-wrapper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">MEMBERSHIP ARCHITECTURE</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Memberships &amp; Pricing
              </h1>
              <p>
                Support independent artistry. Choose your tier to explore {creatorName}&apos;s work or commission bespoke creative campaigns.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 24, alignItems: "stretch" }}>
              {tiers.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: t.highlight ? "linear-gradient(180deg, rgba(224, 96, 134, 0.12) 0%, var(--nk-surface-card) 40%)" : "var(--nk-surface-card)",
                    border: t.highlight ? "2px solid var(--nk-rose)" : "1px solid var(--nk-border)",
                    borderRadius: "var(--nk-radius-lg)",
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  {t.highlight && (
                    <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "var(--nk-rose)", color: "#fff", padding: "4px 14px", borderRadius: 999, fontSize: "11px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Recommended
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em", color: "var(--nk-rose-light)", textTransform: "uppercase" }}>
                      {t.badge}
                    </span>
                    <h2 style={{ fontSize: "24px", margin: "8px 0 4px", fontFamily: "var(--nk-font-serif)" }}>
                      {t.name}
                    </h2>
                    <div style={{ margin: "16px 0 20px" }}>
                      <span style={{ fontSize: "36px", fontWeight: 800, color: "var(--nk-text)" }}>{t.price}</span>
                      <small style={{ color: "var(--nk-text-subtle)", display: "block", fontSize: "12px", marginTop: 4 }}>{t.cadence}</small>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--nk-text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
                      {t.desc}
                    </p>

                    <hr style={{ borderColor: "var(--nk-border-subtle)", margin: "0 0 20px" }} />

                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                      {t.features.map((f, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "13px", color: "var(--nk-text)" }}>
                          <Check size={16} style={{ color: "var(--nk-rose)", flexShrink: 0, marginTop: 2 }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: 32 }}>
                    {t.isExternal ? (
                      <a
                        href={t.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={t.highlight ? "btn-primary" : "btn-secondary"}
                        style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span>{t.ctaText}</span>
                        <ArrowUpRight size={15} />
                      </a>
                    ) : (
                      <Link
                        href={t.ctaLink}
                        className={t.highlight ? "btn-primary" : "btn-secondary"}
                        style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span>{t.ctaText}</span>
                        <ArrowRight size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48, textAlign: "center", padding: "24px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-md)", border: "1px solid var(--nk-border-subtle)" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--nk-text-subtle)" }}>
                Questions regarding payments, custom licensing, or patron account security? Contact our <Link href="/contact" style={{ color: "var(--nk-rose-light)", fontWeight: 600 }}>Communications Desk</Link> or review the <Link href="/faq" style={{ color: "var(--nk-rose-light)", fontWeight: 600 }}>Creator FAQ</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
