import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { ArrowRight } from "lucide-react";
import { PublicPhotosClient } from "@/components/public-photos-client";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain Photos | Official Photography",
  description:
    "Official high-resolution photography gallery of Nina Kurain, Digital Creator. Discover studio portraits, fashion editorials, and fine-art photographic series.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/photos`,
  },
  openGraph: {
    title: "Nina Kurain Photos | Official Photography",
    description:
      "Official high-resolution photography gallery of Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/photos`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain Official Photography Gallery",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain Photos | Official Photography",
    description:
      "Official high-resolution photography gallery of Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function PhotosPage() {
  const { photos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;

  const jsonLdGallery = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${NINA_ENTITY.canonicalBase}/photos/#webpage`,
        url: `${NINA_ENTITY.canonicalBase}/photos`,
        name: `${creatorName} Photos | Official Gallery`,
        description: `Official photography collection of ${creatorName}, Digital Creator.`,
        about: {
          "@id": NINA_ENTITY.id,
        },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Photos", url: `${NINA_ENTITY.canonicalBase}/photos` },
      ]),
      ...photos
        .filter((p) => !p.image.startsWith("/nina-kurain") && !p.image.startsWith("/seductive"))
        .map((photo) => ({
          "@type": "ImageObject",
          "@id": `${NINA_ENTITY.canonicalBase}/photos/${photo.slug}/#image`,
          contentUrl: photo.image.startsWith("http")
            ? photo.image
            : `${NINA_ENTITY.canonicalBase}${photo.image}`,
          url: `${NINA_ENTITY.canonicalBase}/photos/${photo.slug}`,
          name: photo.title,
          caption: photo.caption,
          description: photo.description,
          width: photo.width || 1086,
          height: photo.height || 1448,
          encodingFormat: photo.image.endsWith(".png") ? "image/png" : "image/webp",
          creator: {
            "@id": NINA_ENTITY.id,
          },
          copyrightHolder: {
            "@id": NINA_ENTITY.id,
          },
          datePublished: photo.datePublished || "2026-08-15",
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
                {photos.length > 0 ? `${photos.length} WORKS AVAILABLE` : "STUDIO CURATION"}
              </span>
            </div>
          </div>

          <PublicPhotosClient photos={photos} creatorName={creatorName} />
        </section>

        {/* Informative Context for Image Usage / Licensing */}
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
              <div className="collab-tag"><span /> Commercial &amp; Editorial Inquiries</div>
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
