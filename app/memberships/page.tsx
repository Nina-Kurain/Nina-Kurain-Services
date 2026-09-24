import type { Metadata } from "next";
import { currentUser } from "@/lib/server/auth";
import { Memberships } from "../live-client";
import { env } from "cloudflare:workers";
import { getPlans } from "@/lib/server/entitlements";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";
import Link from "@/components/site-link";
import Script from "next/script";
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Lock,
  ArrowRight,
  HelpCircle,
  Star,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain Membership & Patron Tiers | Official Rates",
  description:
    "Official membership pricing, subscription rates, and patron access for Nina Kurain. Join to support independent creative productions, photography, and creator updates.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/memberships`,
  },
  openGraph: {
    title: "Nina Kurain Membership & Patron Tiers | Official Rates",
    description:
      "Explore official membership tiers, pricing rates, and patron access for Nina Kurain.",
    url: `${NINA_ENTITY.canonicalBase}/memberships`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Membership Pricing and Rates",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Membership & Pricing | Official Rates",
    description:
      "Official membership rates and subscription plans for Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

const membershipJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": `${NINA_ENTITY.canonicalBase}/memberships/#product`,
      "name": "Nina Kurain Official Membership",
      "description": "Digital membership providing access to extended 4K editorial photography, behind-the-scenes video reels, and creator updates from Nina Kurain.",
      "brand": {
        "@type": "Person",
        "@id": NINA_ENTITY.id,
        "name": NINA_ENTITY.name,
        "url": NINA_ENTITY.url,
      },
      "image": NINA_ENTITY.primaryImage,
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "lowPrice": "499",
        "highPrice": "2499",
        "offerCount": "3",
        "offers": [
          {
            "@type": "Offer",
            "name": "Supporter Pass Tier",
            "price": "499",
            "priceCurrency": "INR",
            "priceValidUntil": "2027-12-31",
            "availability": "https://schema.org/InStock",
            "url": `${NINA_ENTITY.canonicalBase}/memberships`,
          },
          {
            "@type": "Offer",
            "name": "VIP All-Access Tier",
            "price": "999",
            "priceCurrency": "INR",
            "priceValidUntil": "2027-12-31",
            "availability": "https://schema.org/InStock",
            "url": `${NINA_ENTITY.canonicalBase}/memberships`,
          },
          {
            "@type": "Offer",
            "name": "Inner Circle Patron Tier",
            "price": "2499",
            "priceCurrency": "INR",
            "priceValidUntil": "2027-12-31",
            "availability": "https://schema.org/InStock",
            "url": `${NINA_ENTITY.canonicalBase}/memberships`,
          },
        ],
      },
    },
    getBreadcrumbListSchema([
      { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
      { name: "Memberships & Pricing", url: `${NINA_ENTITY.canonicalBase}/memberships` },
    ]),
  ],
};

export default async function Page() {
  const [user, plans] = await Promise.all([currentUser(), getPlans()]);

  return (
    <>
      <Script
        id="membership-pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(membershipJsonLd) }}
      />

      {/* Main Interactive Membership & Pricing Portal */}
      <Memberships
        signedIn={Boolean(user)}
        initial={{
          plans,
          checkoutReady: Boolean(
            env.RAZORPAY_KEY_ID &&
              env.RAZORPAY_KEY_SECRET &&
              env.RAZORPAY_WEBHOOK_SECRET
          ),
          testMode: env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ?? false,
        }}
      />

      {/* Crawlable Semantic SEO & Authority Section for Pricing & Rates */}
      <section
        className="membership-seo-guide"
        style={{
          maxWidth: "1080px",
          margin: "48px auto",
          padding: "36px 24px",
          color: "var(--nk-text, #f8f4f6)",
          background: "rgba(18, 9, 18, 0.65)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(224, 96, 134, 0.12)",
              border: "1px solid rgba(224, 96, 134, 0.3)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#f595b2",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            <Sparkles size={14} />
            <span>Official Creator Pricing &amp; Rate Transparency</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 34px)",
              fontFamily: "var(--nk-font-serif, serif)",
              fontWeight: 600,
              margin: "8px 0 12px",
            }}
          >
            Nina Kurain Membership Rates &amp; Exclusive Tiers
          </h2>

          <p
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              fontSize: "15px",
              color: "var(--nk-text-muted, #b8a6b0)",
              lineHeight: 1.6,
            }}
          >
            Direct patronage powers independent creative artistry. Explore verified membership rates,
            unlock private 4K galleries, high-fashion saree archives, and direct community perks.
          </p>
        </div>

        {/* Benefits Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              padding: "20px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <ShieldCheck color="#e06086" size={20} />
              <strong style={{ fontSize: "16px" }}>Transparent Monthly Rates</strong>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted, #b8a6b0)", lineHeight: 1.5 }}>
              Clear pricing in INR with zero surprise fees. Upgrade, downgrade, or cancel your active membership plan at any time with a single click.
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Lock color="#e06086" size={20} />
              <strong style={{ fontSize: "16px" }}>Private 4K Unreleased Archives</strong>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted, #b8a6b0)", lineHeight: 1.5 }}>
              Members receive access to uncompressed studio collections, intimate saree styling portraits, and behind-the-scenes reels never published on public channels.
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Star color="#e06086" size={20} />
              <strong style={{ fontSize: "16px" }}>Direct Creator Sanctuary</strong>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted, #b8a6b0)", lineHeight: 1.5 }}>
              Interact directly with Nina Kurain (@kurain.bae) in private community dispatches, live Q&amp;A sessions, and priority polls for upcoming creative shoots.
            </p>
          </div>
        </div>

        {/* Pricing FAQs for SEO */}
        <div style={{ marginTop: "32px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "28px" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <HelpCircle size={18} color="#e06086" />
            <span>Membership &amp; Pricing Frequently Asked Questions</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>
                What are Nina Kurain&apos;s official membership pricing rates?
              </h4>
              <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted, #b8a6b0)", margin: 0, lineHeight: 1.5 }}>
                Official rates range from accessible entry passes to all-access VIP tiers. The current active plans are displayed above in the interactive checkout system, processed securely in INR.
              </p>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>
                Can I cancel or change my membership plan at any time?
              </h4>
              <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted, #b8a6b0)", margin: 0, lineHeight: 1.5 }}>
                Yes, absolutely. Memberships can be paused, upgraded, or cancelled anytime directly inside your Account settings with no lock-in periods or cancellation fees.
              </p>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>
                Where can I explore free public photos and previews first?
              </h4>
              <p style={{ fontSize: "13.5px", color: "var(--nk-text-muted, #b8a6b0)", margin: 0, lineHeight: 1.5 }}>
                You can explore Nina&apos;s free public work on the{" "}
                <Link href="/photos" style={{ color: "#f595b2", textDecoration: "underline" }}>
                  Photography Gallery
                </Link>
                , browse the{" "}
                <Link href="/lookbook" style={{ color: "#f595b2", textDecoration: "underline" }}>
                  Saree Lookbook
                </Link>
                , or watch trending reels on{" "}
                <a
                  href="https://www.instagram.com/kurain.bae"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#f595b2", textDecoration: "underline" }}
                >
                  Instagram @kurain.bae
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Cross Link Navigation Bar */}
        <div
          style={{
            marginTop: "36px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
          }}
        >
          <span style={{ color: "var(--nk-text-subtle, #806c78)" }}>Explore Nina Kurain:</span>
          <Link href="/biography" style={{ color: "#f595b2", textDecoration: "none" }}>Biography</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          <Link href="/wiki" style={{ color: "#f595b2", textDecoration: "none" }}>Wiki Dossier</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          <Link href="/lookbook" style={{ color: "#f595b2", textDecoration: "none" }}>Saree Lookbook</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          <Link href="/reels" style={{ color: "#f595b2", textDecoration: "none" }}>Viral Reels</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          <Link href="/net-worth" style={{ color: "#f595b2", textDecoration: "none" }}>Net Worth &amp; Career</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          <Link href="/creator-tips" style={{ color: "#f595b2", textDecoration: "none" }}>Creator Masterclass</Link>
        </div>
      </section>
    </>
  );
}
