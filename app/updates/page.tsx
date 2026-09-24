import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";

export const metadata: Metadata = {
  title: "Nina Kurain Updates | Official Creator Journal",
  description:
    "Official updates, creative releases, and behind-the-scenes journal entries from Nina Kurain, Digital Creator.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/updates`,
  },
  openGraph: {
    title: "Nina Kurain Updates | Official Creator Journal",
    description: "Official updates, creative releases, and journal entries from Nina Kurain.",
    url: `${NINA_ENTITY.canonicalBase}/updates`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Creator Updates",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Updates | Official Creator Journal",
    description: "Official updates and creative releases from Nina Kurain.",
    images: ["/nina-kurain-og.jpg"],
  },
};

const UPDATES_DATA = [
  {
    slug: "autumn-editorial-collection-2026",
    title: "Autumn Editorial Collection Premieres",
    date: "September 18, 2026",
    category: "Portfolio Release",
    excerpt: "New fine-art portrait collection exploring tonal harmonies, studio shadows, and seasonal aesthetics. Discover the creative philosophy behind the frames.",
    body: "The Autumn 2026 editorial collection marks a focused return to tactile studio portraiture. Over three dedicated studio sessions, we explored the interaction between heavy textures, sheer fabrics, and low-angle lighting. The primary aim was to achieve an atmosphere of quiet reflection while retaining bold graphic presence across digital displays.",
    link: "/photos",
    linkText: "View Collection",
  },
  {
    slug: "cinematography-motion-series",
    title: "Motion Cinematography Series",
    date: "August 28, 2026",
    category: "Video Works",
    excerpt: "Transitioning still photographic frames into kinetic motion stories. Explore the latest 4K visual studies on YouTube.",
    body: "Cinematography offers a fresh dimension to editorial styling. By introducing subtle camera tracks, atmospheric pacing, and original scores, our video essays expand the visual universe established through static portraits.",
    link: "/videos",
    linkText: "Watch Video Essays",
  },
  {
    slug: "canonical-digital-platform-launch",
    title: "Official Digital Hub Established",
    date: "August 15, 2026",
    category: "Platform News",
    excerpt: "Launching the canonical web presence at ninakurainservices.in to host original high-resolution photography, video archives, and direct partnerships.",
    body: "Establishing an independent canonical hub ensures that our visual work is presented in uncompressed quality, with complete IPTC attribution, direct client communications, and verified social touchpoints.",
    link: "/about",
    linkText: "Read Creator Profile",
  },
];

export default function UpdatesPage() {
  const jsonLdUpdates = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${NINA_ENTITY.canonicalBase}/updates/#blog`,
        url: `${NINA_ENTITY.canonicalBase}/updates`,
        name: "Nina Kurain Updates | Creator Journal",
        description: "Official journal and updates from Nina Kurain, Digital Creator.",
        publisher: {
          "@id": NINA_ENTITY.id,
        },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Updates", url: `${NINA_ENTITY.canonicalBase}/updates` },
      ]),
      ...UPDATES_DATA.map((item) => ({
        "@type": "BlogPosting",
        "@id": `${NINA_ENTITY.canonicalBase}/updates/#${item.slug}`,
        headline: item.title,
        description: item.excerpt,
        articleBody: item.body,
        datePublished: "2026-08-15T00:00:00Z",
        author: {
          "@id": NINA_ENTITY.id,
        },
        publisher: {
          "@id": NINA_ENTITY.id,
        },
      })),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdUpdates) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CREATOR JOURNAL &amp; DISPATCHES</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Latest Updates
              </h1>
              <p>
                Behind-the-scenes insights, creative releases, and official announcements directly from Nina Kurain.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
            {UPDATES_DATA.map((post) => (
              <article
                key={post.slug}
                style={{
                  padding: "clamp(24px, 4vw, 36px)",
                  borderRadius: "var(--nk-radius-lg)",
                  background: "var(--nk-surface)",
                  border: "1px solid var(--nk-border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--nk-rose-light)",
                    background: "rgba(224, 96, 134, 0.1)",
                    padding: "4px 10px",
                    borderRadius: 999,
                    textTransform: "uppercase"
                  }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--nk-text-subtle)", display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar size={13} />
                    {post.date}
                  </span>
                </div>

                <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", margin: "0 0 12px", fontFamily: "var(--nk-font-serif)" }}>
                  {post.title}
                </h2>

                <p style={{ color: "var(--nk-text-muted)", fontSize: "15px", lineHeight: 1.7, margin: "0 0 20px" }}>
                  {post.body}
                </p>

                <Link
                  href={post.link}
                  className="section-action-link"
                  style={{ alignSelf: "flex-start" }}
                >
                  <span>{post.linkText}</span>
                  <ArrowRight size={13} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
