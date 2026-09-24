import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Film, Play, Sparkles, ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { FeaturedVideoReel } from "@/components/featured-video-reel";
import { PublicVideosClient } from "@/components/public-videos-client";

export const metadata: Metadata = {
  title: "Nina Kurain Videos | Official Cinematography & Motion Works",
  description:
    "Official 4K studio films, reels, and video cinematography works directed by Nina Kurain, Digital Creator and model.",
  keywords: [
    "Nina Kurain Videos",
    "Nina Kurain Cinematography",
    "Nina Kurain Reels",
    "Nina Kurain 4K Films",
    "Nina Kurain Motion",
    "Nina Kurain YouTube",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/videos",
  },
  openGraph: {
    title: "Nina Kurain Videos | Official Cinematography & Motion Works",
    description:
      "Official 4K studio films, reels, and video cinematography works directed by Nina Kurain.",
    url: "https://ninakurainservices.in/videos",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Nina Kurain Official Videos",
      },
    ],
    locale: "en_IN",
    type: "video.other",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Videos | Official Cinematography",
    description: "Official 4K studio films and motion essays directed by Nina Kurain.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

const VIDEOS_COLLECTION = [
  {
    id: "v1",
    title: "Studio Light & Rhythm: Cinematic Showreel",
    meta: "4K Motion Story • Studio Film",
    desc: "A rhythmic visual study of light, texture, and cinematic pacing directed and produced by Nina Kurain.",
    src: "/booty.mp4",
    poster: "/nina-kurain-official-portrait.webp",
    uploadDate: "2026-08-15T12:00:00Z",
    duration: "PT1M30S",
  },
  {
    id: "v2",
    title: "The Editorial Archive: Studio Vignette",
    meta: "60fps Visual Teaser • Behind The Scenes",
    desc: "Glimpses into the creative process, studio lighting setup, and spontaneous movement during editorial shoots.",
    src: "/vid-2.mp4",
    poster: "/nina-kurain-editorial-portrait.webp",
    uploadDate: "2026-08-25T14:30:00Z",
    duration: "PT45S",
  },
  {
    id: "v3",
    title: "Kinetic Expression: Autumn Motion Study",
    meta: "Visual Essay • Creative Direction",
    desc: "Exploring contemporary fashion movement, high-contrast illumination, and atmospheric cinematography.",
    src: "/vid-3.mp4",
    poster: "/nina-kurain-creator-photoshoot.webp",
    uploadDate: "2026-09-10T16:00:00Z",
    duration: "PT1M10S",
  },
];

import { getPublicCreatorData } from "@/lib/server/public-data";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const { videos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || "Nina Kurain";
  const youtubeUrl = settings?.youtube || "https://www.youtube.com/@ninakurain";

  const jsonLdVideos = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://ninakurainservices.in/videos/#webpage",
        "url": "https://ninakurainservices.in/videos",
        "name": `${creatorName} Videos | Official Cinematography`,
        "description": `Official video archives and motion stories of ${creatorName}, Digital Creator.`,
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/videos/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": creatorName,
            "item": "https://ninakurainservices.in/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Videos",
            "item": "https://ninakurainservices.in/videos",
          },
        ],
      },
      ...videos.map((vid) => ({
        "@type": "VideoObject",
        "@id": `https://ninakurainservices.in/videos/#${vid.id}`,
        "name": vid.title,
        "description": vid.desc,
        "thumbnailUrl": [vid.poster.startsWith("http") ? vid.poster : `https://ninakurainservices.in${vid.poster}`],
        "uploadDate": "2026-09-24T12:00:00Z",
        "contentUrl": vid.src.startsWith("http") ? vid.src : `https://ninakurainservices.in${vid.src}`,
        "author": {
          "@type": "Person",
          "@id": "https://ninakurainservices.in/#nina-kurain",
          "name": creatorName,
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
                className="btn-secondary"
              >
                <span>YouTube Channel</span>
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

        {/* Private Sanctuary Notice */}
        <div className="vip-banner-wrap">
          <div className="vip-banner">
            <div className="vip-banner-content">
              <h3>Looking for the Full Private Film Vault?</h3>
              <p>
                Extended 4K uncut films, intimate studio stories, and member-only cinema releases
                are archived in the Private Creator Club.
              </p>
            </div>
            <div className="vip-banner-action">
              <a
                href="https://vip.ninakurainservices.in/"
                className="vip-banner-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>VIP Video Vault (18+)</span>
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
