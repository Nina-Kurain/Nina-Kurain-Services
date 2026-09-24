import type { Metadata } from "next";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { PublicPhotosClient } from "@/components/public-photos-client";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { NINA_ENTITY, getBreadcrumbListSchema } from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain — High-Resolution Official Photo Gallery (58 Frames)",
  description:
    "Explore the complete 58-frame official photography gallery of Nina Kurain, Digital Creator. High-resolution studio portraiture, editorial fashion, and fine-art studies.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/gallery`,
  },
  openGraph: {
    title: "Nina Kurain — High-Resolution Official Photo Gallery",
    description: "Explore the complete 58-frame official photography gallery of Nina Kurain, Digital Creator.",
    url: `${NINA_ENTITY.canonicalBase}/gallery`,
    siteName: NINA_ENTITY.name,
    images: [{ url: "/nina-gallery/nina-kurain-01.jpeg", width: 1200, height: 1600, alt: "Nina Kurain Gallery" }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function GalleryPage() {
  const { photos, settings } = await getPublicCreatorData();
  const creatorName = settings?.name || NINA_ENTITY.name;
  const pageUrl = `${NINA_ENTITY.canonicalBase}/gallery`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: `${creatorName} Complete Photo Gallery`,
        description: `Official archive of 58 studio and editorial photographs of ${creatorName}.`,
        about: { "@id": NINA_ENTITY.id },
      },
      getBreadcrumbListSchema([
        { name: NINA_ENTITY.name, url: `${NINA_ENTITY.canonicalBase}/` },
        { name: "Photo Gallery", url: pageUrl },
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
              <span className="section-kicker">OFFICIAL ARCHIVE • 58 FRAMES</span>
              <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "0 0 14px", fontFamily: "var(--nk-font-serif)" }}>
                Nina Kurain — Gallery Archive
              </h1>
              <p>
                The complete authentic collection of photographic studies, studio portraits, and editorial styling sessions by {creatorName}.
              </p>
            </div>
          </div>

          <PublicPhotosClient photos={photos} creatorName={creatorName} />
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
