import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Camera, Lightbulb, Palette, Sparkles, ArrowRight, Eye, Layers } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — Creator Studio Insights, Photography & Styling Guide",
  description:
    "Official photography, lighting, and styling guide by Nina Kurain. Learn about chiaroscuro studio lighting, ethnic wardrobe curation, and creative direction.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/creator-tips`,
  },
  openGraph: {
    title: "Nina Kurain — Creator Studio Insights & Styling Guide",
    description: "Official photography, lighting, and styling guide by Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/creator-tips`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-kurain-og.jpg", width: 1376, height: 768, alt: "Nina Kurain Creator Tips" }],
    locale: "en_IN",
    type: "article",
  },
};

export default async function CreatorTipsPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/creator-tips`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}/#article`,
        url: pageUrl,
        headline: `${creatorName} Creator Studio Insights & Styling Guide`,
        description: `Practical guides on lighting, portraiture composition, and contemporary ethnic styling by ${creatorName}.`,
        author: { "@id": NINA_ENTITY.id },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Creator Tips", url: pageUrl },
      ]),
    ],
  };

  const tips = [
    {
      icon: Lightbulb,
      title: "1. Sculpting with Low-Angle Directional Light",
      summary: "Avoid flat multi-light setups. Use a single directional tungsten or warm LED key light at a 45-degree angle to create deep chiaroscuro shadows and sculptural bone structure.",
    },
    {
      icon: Palette,
      title: "2. Color Harmony in Contemporary Ethnic Wear",
      summary: "Pair deep obsidian, burgundy, or forest green backgrounds with rich handloom silks. Allow the textile's natural sheen to catch the light rather than over-saturating in post.",
    },
    {
      icon: Eye,
      title: "3. Intentional Restraint Over Exaggerated Expression",
      summary: "The most compelling portraits embody quiet tension. Relax facial muscles, maintain steady eye contact with the lens, and let subtle micro-expressions convey emotion.",
    },
    {
      icon: Layers,
      title: "4. Texture Separation in Monochrome & Low-Key",
      summary: "In dark compositions, separate subject from background through rim lighting or contrasting matte skin with glistening jewelry or silk threads.",
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
              <span className="section-kicker">STUDIO WORKSHOP &amp; CRAFT</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain — Creator Guide
              </h1>
              <p>
                Studio notes, lighting philosophies, and styling insights from Digital Creator {creatorName}.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
              {tips.map((t, idx) => {
                const Icon = t.icon;
                return (
                  <div key={idx} style={{ background: "var(--nk-surface-card)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-md)", padding: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(224, 96, 134, 0.12)", display: "grid", placeItems: "center", color: "var(--nk-rose-light)", marginBottom: 16 }}>
                      <Icon size={20} />
                    </div>
                    <h3 style={{ fontSize: "18px", margin: "0 0 8px" }}>{t.title}</h3>
                    <p style={{ margin: 0, fontSize: "14px", color: "var(--nk-text-muted)", lineHeight: 1.6 }}>{t.summary}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "var(--nk-surface-card)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-lg)", padding: 32, textAlign: "center" }}>
              <h2 style={{ fontSize: "24px", margin: "0 0 10px" }}>Explore These Techniques in the Official Gallery</h2>
              <p style={{ maxWidth: 600, margin: "0 auto 20px", color: "var(--nk-text-muted)" }}>
                See how these lighting design rules and styling principles come alive across the 58 authentic frames in Nina Kurain&apos;s photo collection.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <Link href="/photos" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Camera size={16} />
                  <span>View Photo Gallery</span>
                </Link>
                <Link href="/lookbook" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span>View Visual Lookbook</span>
                  <ArrowRight size={14} />
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
