import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArrowRight, Mail, Sparkles, Camera, Film, Layers, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Media Kit | Nina Kurain — Digital Creator",
  description:
    "Official media kit for Nina Kurain, Digital Creator and model. Overview of creative focus, photographic portfolio, collaboration categories, and business contact.",
  keywords: [
    "Nina Kurain Media Kit",
    "Nina Kurain Brand Kit",
    "Nina Kurain Digital Creator Portfolio",
    "Nina Kurain Bookings",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/media-kit",
  },
  openGraph: {
    title: "Media Kit | Nina Kurain — Digital Creator",
    description: "Official media kit for Nina Kurain, Digital Creator and model.",
    url: "https://ninakurainservices.in/media-kit",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Nina Kurain Media Kit",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media Kit | Nina Kurain",
    description: "Official creator portfolio and brand kit.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

export default function MediaKitPage() {
  return (
    <div className="public-page-wrapper">
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CREATOR DOSSIER</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain Media Kit
              </h1>
              <p>
                An overview of creative disciplines, visual aesthetics, audience alignment,
                and collaboration opportunities with Nina Kurain, Digital Creator.
              </p>
            </div>
            <div>
              <Link href="/contact" className="btn-primary">
                <span>Direct Contact</span>
                <Mail size={14} />
              </Link>
            </div>
          </div>

          <div className="media-kit-intro-grid">
            <div>
              <span className="section-kicker">ABOUT THE CREATOR</span>
              <h2 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "32px", margin: "10px 0 16px" }}>
                Nina Kurain
              </h2>
              <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", lineHeight: 1.75, margin: "0 0 16px" }}>
                Nina Kurain is an established digital creator, fashion model, and visual artist.
                Her online presence is distinguished by refined aesthetic discipline, meticulous studio
                production quality, and a focus on enduring artistic value.
              </p>
              <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", lineHeight: 1.75, margin: 0 }}>
                Nina works directly with international luxury brands, fashion publications, and digital
                production teams to create impactful visual campaigns that elevate brand narrative.
              </p>
            </div>

            <div style={{ position: "relative", borderRadius: "var(--nk-radius-lg)", overflow: "hidden", border: "1px solid var(--nk-border)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <Image
                src="/nina-kurain-official-portrait.webp"
                alt="Nina Kurain Media Kit Portrait"
                width={600}
                height={780}
                unoptimized
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>

          {/* Core Collaboration Categories */}
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">PARTNERSHIP CATEGORIES</span>
              <h2>Areas of Creative Engagement</h2>
              <p>Structured brand partnerships crafted for maximum aesthetic resonance.</p>
            </div>
          </div>

          <div className="benefit-grid" style={{ marginBottom: "60px" }}>
            <article>
              <Camera size={26} />
              <h3>Haute Couture &amp; Editorial</h3>
              <p>
                Studio and on-location editorial shoots for print publications, high-fashion brands,
                and capsule collections.
              </p>
            </article>

            <article>
              <Film size={26} />
              <h3>Short-Form Cinema &amp; Reels</h3>
              <p>
                Dynamic 4K motion productions for Instagram Reels, YouTube Shorts, and brand visual campaigns.
              </p>
            </article>

            <article>
              <Sparkles size={26} />
              <h3>Brand Ambassadorship</h3>
              <p>
                Long-term creative alignment with luxury lifestyle, beauty, and fashion labels.
              </p>
            </article>
          </div>

          {/* Direct CTA */}
          <div className="collab-container" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span className="section-kicker">GET IN TOUCH</span>
            <h2>Initiate a Creative Brief</h2>
            <p style={{ maxWidth: "600px", margin: "0 auto 24px" }}>
              To receive customized rate cards, availability schedules, or discuss tailored creative concepts,
              please reach out directly through our contact portal.
            </p>
            <Link href="/contact" className="btn-primary">
              <span>Send Inquiries to Studio</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
