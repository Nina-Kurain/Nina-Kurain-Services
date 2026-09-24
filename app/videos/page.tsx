import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArrowRight } from "lucide-react";
import { PublicVideosClient } from "@/components/public-videos-client";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain Videos & Reels | Digital Creator",
  description:
    "Official studio cinematography, reels, and video essays directed by Nina Kurain, Digital Creator.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/videos`,
  },
  openGraph: {
    title: "Nina Kurain Videos & Reels | Digital Creator",
    description:
      "Official studio cinematography, reels, and video essays directed by Nina Kurain.",
    url: `${NINA_ENTITY.canonicalBase}/videos`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Official Videos",
      },
    ],
    locale: "en_IN",
    type: "video.other",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Videos & Reels | Digital Creator",
    description:
      "Official studio cinematography and motion essays directed by Nina Kurain.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function VideosPage() {
  const { videos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const youtubeUrl = settings?.youtube || NINA_ENTITY.youtubeUrl;

  const jsonLdVideos = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${NINA_ENTITY.canonicalBase}/videos/#webpage`,
        url: `${NINA_ENTITY.canonicalBase}/videos`,
        name: `${creatorName} Videos | Official Cinematography`,
        description: `Official video archives and motion stories of ${creatorName}, Digital Creator.`,
        about: {
          "@id": NINA_ENTITY.id,
        },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Videos", url: `${NINA_ENTITY.canonicalBase}/videos` },
      ]),
      ...videos.map((vid) => ({
        "@type": "VideoObject",
        "@id": `${NINA_ENTITY.canonicalBase}/videos/#${vid.id}`,
        name: vid.title,
        description: vid.desc,
        thumbnailUrl: [
          vid.poster.startsWith("http")
            ? vid.poster
            : `${NINA_ENTITY.canonicalBase}${vid.poster}`,
        ],
        uploadDate: "2026-08-15T12:00:00Z",
        contentUrl: vid.src.startsWith("http")
          ? vid.src
          : `${NINA_ENTITY.canonicalBase}${vid.src}`,
        creator: {
          "@id": NINA_ENTITY.id,
        },
      })),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdVideos) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CINEMATOGRAPHY &amp; MOTION</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                {creatorName} Videos
              </h1>
              <p>
                Visual essays, studio cinematography, and motion teasers exploring modern aesthetics,
                movement, and atmosphere.
              </p>
            </div>
            <div>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="section-action-link"
              >
                <span>Watch on YouTube</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <PublicVideosClient
            videos={videos}
            creatorName={creatorName}
            youtubeUrl={youtubeUrl}
          />
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
