import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { TrendingUp, DollarSign, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — Career Valuation & Creator Economics | Official Insights",
  description:
    "Official overview of Nina Kurain's independent creator economics, rate card guidelines, brand partnership valuation, and direct patron ecosystem.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/net-worth`,
  },
  openGraph: {
    title: "Nina Kurain — Career Valuation & Creator Economics",
    description: "Official overview of Nina Kurain's independent creator economics and brand partnerships.",
    url: `${NINA_ENTITY.canonicalBase}/net-worth`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-kurain-og.jpg", width: 1376, height: 768, alt: "Nina Kurain Career Valuation" }],
    locale: "en_IN",
    type: "article",
  },
};

export default async function NetWorthPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/net-worth`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${creatorName} Career Valuation & Economics`,
        description: `Official analysis of creator valuation, revenue streams, and rate card guidelines for ${creatorName}.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Career Valuation", url: pageUrl },
      ]),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">ECONOMIC INSIGHTS &amp; RATE CARD</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain — Creator Economics &amp; Valuation
              </h1>
              <p>
                Transparent, grounded insights into Nina Kurain&apos;s independent creator model, direct patron equity, and commercial booking standards.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div className="editorial-prose" style={{ background: "var(--nk-surface-card)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-lg)", padding: "32px", marginBottom: "32px" }}>
              <h2>Emerging Independent Creator Phase</h2>
              <p>
                Unlike corporate influencer management schemes with speculative, inflated valuations, <strong>{creatorName}</strong> operates as an emerging independent digital creator. Rather than relying on algorithmic mass-volume metrics or vanity subscriber numbers, Nina&apos;s digital valuation is rooted in high-fidelity visual assets, dedicated patron engagement, and bespoke brand commissions.
              </p>

              <h2>Primary Revenue Streams</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, margin: "24px 0" }}>
                <div style={{ padding: "20px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-md)", border: "1px solid var(--nk-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "var(--nk-rose-light)" }}>
                    <Sparkles size={18} />
                    <strong>Direct Patron Memberships</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--nk-text-muted)" }}>
                    Subscribers on <code>vip.ninakurainservices.in</code> supporting independent photoshoots and cinematic video essays.
                  </p>
                </div>

                <div style={{ padding: "20px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-md)", border: "1px solid var(--nk-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "var(--nk-rose-light)" }}>
                    <TrendingUp size={18} />
                    <strong>Editorial &amp; Brand Collaborations</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--nk-text-muted)" }}>
                    Selected partnerships with handloom, jewelry, and luxury apparel brands valuing authentic visual storytelling.
                  </p>
                </div>

                <div style={{ padding: "20px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-md)", border: "1px solid var(--nk-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "var(--nk-rose-light)" }}>
                    <DollarSign size={18} />
                    <strong>Fine-Art Image Licensing</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--nk-text-muted)" }}>
                    High-resolution commercial and editorial photographic rights for digital campaigns and publishing.
                  </p>
                </div>
              </div>

              <h2>Rate Card &amp; Commercial Booking Guidelines</h2>
              <p>
                All commercial engagements require creative alignment with Nina&apos;s artistic identity. Deliverables are produced in full 4K UHD with professional lighting and tonal mastering.
              </p>
              <ul>
                <li><strong>Dedicated Carousel or Editorial Feature:</strong> Custom creative direction, styling, and cross-channel publication.</li>
                <li><strong>Cinematic 4K Reel / Short Form:</strong> Visual essay focusing on fabric motion, atmosphere, and brand integration.</li>
                <li><strong>Full Campaign Ambassadorship:</strong> Multi-session editorial production, exclusive category rights, and canonical hosting.</li>
              </ul>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--nk-border)" }}>
                <Link href="/pricing" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span>View Membership Pricing</span>
                  <ArrowRight size={14} />
                </Link>
                <Link href="/collaborations" className="btn-secondary">
                  <span>Inquire for Brand Partnership</span>
                </Link>
                <Link href="/biography" className="btn-secondary">
                  <span>Read Biography</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
