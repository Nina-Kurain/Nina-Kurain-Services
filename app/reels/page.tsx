import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Clapperboard, Play, Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/social-icons";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";
import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — Video Reels & Motion Highlights | Official Directory",
  description:
    "Official directory of Nina Kurain's video reels, cinematography essays, and YouTube motion studies. Watch verified short-form and high-definition video works.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/reels`,
  },
  openGraph: {
    title: "Nina Kurain — Video Reels & Motion Highlights",
    description: "Official directory of video reels and motion essays by Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/reels`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-kurain-og.jpg", width: 1376, height: 768, alt: "Nina Kurain Video Reels" }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function ReelsPage() {
  const { settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/reels`;

  const instagramUrl = settings.instagram || NINA_ENTITY.instagramUrl;
  const youtubeUrl = settings.youtube || NINA_ENTITY.youtubeUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${creatorName} Video Reels & Motion`,
        description: `Official motion directory and social video archive for ${creatorName}.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Video Reels", url: pageUrl },
      ]),
    ],
  };

  const reelSeries = [
    {
      title: "Atmospheric Ethnic Drapes in Motion",
      category: "Instagram Reels",
      desc: "Slow-motion study of handloom silks catching low-angle amber lighting.",
      platform: "Instagram",
      handle: "@kurain.bae",
      link: instagramUrl,
    },
    {
      title: "Chiaroscuro Studio Lighting Transitions",
      category: "YouTube Shorts",
      desc: "Behind-the-lens breakdown of shadow sculpting and directional tungsten transitions.",
      platform: "YouTube",
      handle: "@ninakurain",
      link: youtubeUrl,
    },
    {
      title: "Editorial Silhouette & Gesture Study",
      category: "Cinematic Shorts",
      desc: "Exploring micro-movement, fabric fluidity, and minimalist character posture.",
      platform: "Instagram",
      handle: "@kurain.bae",
      link: instagramUrl,
    },
    {
      title: "4K Studio Creative Direction Highlights",
      category: "Motion Essays",
      desc: "Extended visual reels produced exclusively for verified digital publishing.",
      platform: "YouTube",
      handle: "@ninakurain",
      link: youtubeUrl,
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
              <span className="section-kicker">CINEMATOGRAPHY &amp; SHORTS</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain — Video Reels
              </h1>
              <p>
                Visual motion essays and cinematic short-form studies published across {creatorName}&apos;s verified digital video channels.
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
              {reelSeries.map((reel, idx) => (
                <div key={idx} style={{ background: "var(--nk-surface-card)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-radius-md)", padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em", color: "var(--nk-rose-light)", textTransform: "uppercase" }}>
                        {reel.category}
                      </span>
                      {reel.platform === "Instagram" ? <InstagramIcon size={16} /> : <YoutubeIcon size={16} />}
                    </div>
                    <h2 style={{ fontSize: "18px", margin: "0 0 8px", fontFamily: "var(--nk-font-serif)" }}>
                      {reel.title}
                    </h2>
                    <p style={{ fontSize: "14px", color: "var(--nk-text-muted)", lineHeight: 1.6, margin: 0 }}>
                      {reel.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--nk-border-subtle)" }}>
                    <a
                      href={reel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 6, fontSize: "13px" }}
                    >
                      <span>Watch on {reel.platform}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", padding: "32px", background: "var(--nk-surface)", borderRadius: "var(--nk-radius-lg)", border: "1px solid var(--nk-border)" }}>
              <h2 style={{ fontSize: "22px", margin: "0 0 8px" }}>Explore Still Photography</h2>
              <p style={{ maxWidth: 540, margin: "0 auto 20px", color: "var(--nk-text-muted)", fontSize: "14px" }}>
                Prefer still portraiture? Discover the full 58-frame authentic photographic collection in high resolution.
              </p>
              <Link href="/photos" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span>View 58-Frame Photo Gallery</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
