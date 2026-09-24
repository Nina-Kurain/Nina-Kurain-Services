import { currentUser } from "@/lib/server/auth";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { PublicHomepage } from "@/components/public-homepage";
import type { Metadata } from "next";
import { NINA_ENTITY, getWebSiteSchema, getPersonSchema } from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain | Digital Creator — Official Website",
  description:
    "Official website of Nina Kurain, Digital Creator. Showcasing photography, videos, creator updates, collaborations and official social channels.",
  alternates: {
    canonical: `${NINA_ENTITY.canonicalBase}/`,
  },
  openGraph: {
    title: "Nina Kurain | Digital Creator — Official Website",
    description:
      "Official website of Nina Kurain, Digital Creator. Showcasing photography, videos, creator updates, and official social channels.",
    url: `${NINA_ENTITY.canonicalBase}/`,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain — Digital Creator",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain | Digital Creator — Official Website",
    description:
      "Official website of Nina Kurain, Digital Creator.",
    images: ["/nina-kurain-og.jpg"],
  },
};

export default async function Home() {
  const [user, data] = await Promise.all([
    currentUser(),
    getPublicCreatorData(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      getWebSiteSchema(),
      getPersonSchema(),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHomepage
        signedIn={Boolean(user)}
        displayName={user?.display_name ?? null}
        settings={data.settings}
        socials={{
          instagram: data.settings.instagram,
          youtube: data.settings.youtube,
          facebook: data.settings.facebook,
          website: data.settings.website,
          pinterest: data.settings.pinterest,
          x: data.settings.x,
          whatsapp: data.settings.whatsapp,
          vipUrl: data.settings.vipUrl,
        }}
        photos={data.photos}
        videos={data.videos}
        updates={data.updates}
      />
    </>
  );
}
