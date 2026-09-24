import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { Camera, ArrowRight, Sparkles, Filter, Maximize2 } from "lucide-react";
import { PublicPhotosClient } from "@/components/public-photos-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain Photos | Official Gallery & Creator Photography",
  description:
    "Official high-resolution photography gallery of Nina Kurain, Digital Creator and model. Discover signature studio portraits, fashion editorials, and fine-art photographic archives.",
  keywords: [
    "Nina Kurain Photos",
    "Nina Kurain Images",
    "Nina Kurain Gallery",
    "Nina Kurain Official Photos",
    "Nina Kurain Editorial",
    "Nina Kurain Portraits",
    "Nina Kurain Model Photos",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/photos",
  },
  openGraph: {
    title: "Nina Kurain Photos | Official Gallery & Creator Photography",
    description:
      "Official high-resolution photography gallery of Nina Kurain, Digital Creator and model.",
    url: "https://ninakurainservices.in/photos",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 1600,
        alt: "Nina Kurain Official Photography Gallery",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Photos | Official Gallery & Creator Photography",
    description:
      "Official high-resolution photography gallery of Nina Kurain, Digital Creator and model.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

export default async function PhotosPage() {
  const { photos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || "Nina Kurain";

  const jsonLdGallery = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://ninakurainservices.in/photos/#webpage",
        "url": "https://ninakurainservices.in/photos",
        "name": `${creatorName} Photos | Official Gallery`,
        "description": `Official photography collection of ${creatorName}, Digital Creator.`,
        "about": {
          "@id": "https://ninakurainservices.in/#nina-kurain",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/photos/#breadcrumbs",
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
            "name": "Photos",
            "item": "https://ninakurainservices.in/photos",
          },
        ],
      },
      ...photos.map((photo) => ({
        "@type": "ImageObject",
        "@id": `https://ninakurainservices.in/photos/${photo.slug}/#image`,
        "contentUrl": photo.image.startsWith("http") ? photo.image : `https://ninakurainservices.in${photo.image}`,
        "url": `https://ninakurainservices.in/photos/${photo.slug}`,
        "name": photo.title,
        "caption": photo.caption,
        "description": photo.description,
        "width": photo.width || 1200,
        "height": photo.height || 1600,
        "author": {
          "@type": "Person",
          "@id": "https://ninakurainservices.in/#nina-kurain",
          "name": creatorName,
        },
        "creator": {
          "@type": "Person",
          "@id": "https://ninakurainservices.in/#nina-kurain",
          "name": creatorName,
        },
        "datePublished": photo.datePublished || "2026-09-24",
      })),
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGallery) }}
      />
      <PublicHeader />

      <main id="main-content">
        <section className="public-section" style={{ paddingTop: "40px" }}>
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">OFFICIAL PHOTOGRAPHY ARCHIVE</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                {creatorName} Photography
              </h1>
              <p>
                The canonical visual repository of {creatorName}. Explore high-resolution editorial portraiture,
                studio lighting studies, and fine-art fashion photography.
              </p>
            </div>
            <div className="gallery-meta-count">
              <span style={{ fontSize: "12px", color: "var(--nk-rose-light)", fontWeight: 700, letterSpacing: "0.12em" }}>
                {photos.length} WORKS AVAILABLE
              </span>
            </div>
          </div>

          <PublicPhotosClient photos={photos} creatorName={creatorName} />
        </section>

        {/* Informative Context for Google Images / Entity SEO */}
        <section className="public-section" style={{ paddingTop: "0" }}>
          <div className="collab-container" style={{ background: "var(--nk-surface-card)" }}>
            <div className="collab-info">
              <span className="section-kicker">IMAGE USAGE &amp; LICENSING</span>
              <h2>Editorial &amp; Media Licensing</h2>
              <p>
                All images showcased on this domain are original creative assets of Nina Kurain.
                High-resolution WebP and uncompressed source masters are available for accredited press,
                editorial publications, and commercial creative collaborations.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>
              <div className="collab-tag"><span /> Press Kit High-Res Formats (WebP / JPG)</div>
              <div className="collab-tag"><span /> Full Metadata &amp; IPTC Creator Attribution</div>
              <div className="collab-tag"><span /> Commercial &amp; Editorial Synchronization</div>
              <Link href="/collaborations" className="btn-primary" style={{ alignSelf: "flex-start", marginTop: "10px" }}>
                <span>Request Media Licensing</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
