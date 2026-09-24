import { currentUser } from "@/lib/server/auth";
import { getPublicCreatorData } from "@/lib/server/public-data";
import { PublicHomepage } from "@/components/public-homepage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nina Kurain | Official Website & Digital Creator",
  description:
    "Discover Nina Kurain, Digital Creator, through official photography, videos, creator updates, collaborations and social profiles.",
  alternates: {
    canonical: "https://ninakurainservices.in/",
  },
  openGraph: {
    title: "Nina Kurain | Official Website & Digital Creator",
    description:
      "Discover Nina Kurain, Digital Creator, through official photography, videos, creator updates, collaborations and social profiles.",
    url: "https://ninakurainservices.in/",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Nina Kurain — Digital Creator",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain | Official Website & Digital Creator",
    description:
      "Discover Nina Kurain, Digital Creator, through official photography, videos, creator updates, collaborations and social profiles.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

export default async function Home() {
  const [user, data] = await Promise.all([
    currentUser(),
    getPublicCreatorData(),
  ]);

  return (
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
      }}
      photos={data.photos}
      videos={data.videos}
      updates={data.updates}
    />
  );
}
