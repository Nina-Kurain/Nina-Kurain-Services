/**
 * Central Single Source of Truth for Nina Kurain Entity Data
 * Adheres strictly to Schema.org standards and confirmed entity facts.
 * NO fabricated claims, NO fake press, NO fake external citations.
 */

export const NINA_ENTITY = {
  id: "https://ninakurainservices.in/#person",
  name: "Nina Kurain",
  jobTitle: "Digital Creator",
  url: "https://ninakurainservices.in/",
  canonicalBase: "https://ninakurainservices.in",
  instagramHandle: "@kurain.bae",
  instagramUrl: "https://www.instagram.com/kurain.bae",
  facebookUrl: "https://www.facebook.com/p/Nina-Kurain-61591094695387/",
  pinterestUrl: "https://www.pinterest.com/NinaKurain/",
  youtubeUrl: "https://www.youtube.com/@ninakurain",
  primaryImage: "https://ninakurainservices.in/nina-kurain-og.jpg",
  primaryImageWidth: 1200,
  primaryImageHeight: 630,
  defaultOgImage: "https://ninakurainservices.in/nina-kurain-og.jpg",
  defaultOgWidth: 1200,
  defaultOgHeight: 630,
  description:
    "Official website of Nina Kurain, Digital Creator. Showcasing photography, videos, creator updates, and official social channels.",
  sameAs: [
    "https://www.instagram.com/kurain.bae",
    "https://www.facebook.com/p/Nina-Kurain-61591094695387/",
    "https://www.pinterest.com/NinaKurain/",
    "https://www.youtube.com/@ninakurain",
  ],
} as const;

export function getPersonSchema() {
  return {
    "@type": "Person",
    "@id": NINA_ENTITY.id,
    name: NINA_ENTITY.name,
    jobTitle: NINA_ENTITY.jobTitle,
    url: NINA_ENTITY.url,
    image: NINA_ENTITY.primaryImage,
    description: NINA_ENTITY.description,
    sameAs: [...NINA_ENTITY.sameAs],
  };
}

export function getWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": "https://ninakurainservices.in/#website",
    url: NINA_ENTITY.canonicalBase,
    name: NINA_ENTITY.name,
    description: NINA_ENTITY.description,
    publisher: {
      "@id": NINA_ENTITY.id,
    },
  };
}

export function getProfilePageSchema(pageUrl: string, pageName: string) {
  return {
    "@type": "ProfilePage",
    "@id": `${pageUrl}#profile`,
    url: pageUrl,
    name: pageName,
    mainEntity: {
      "@id": NINA_ENTITY.id,
    },
  };
}

export function getBreadcrumbListSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getImageObjectSchema(params: {
  url: string;
  name: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  datePublished?: string;
}) {
  const mimeType = params.url.endsWith(".webp")
    ? "image/webp"
    : params.url.endsWith(".png")
    ? "image/png"
    : "image/jpeg";

  return {
    "@type": "ImageObject",
    contentUrl: params.url.startsWith("http")
      ? params.url
      : `${NINA_ENTITY.canonicalBase}${params.url.startsWith("/") ? "" : "/"}${params.url}`,
    name: params.name,
    ...(params.caption ? { caption: params.caption } : {}),
    ...(params.description ? { description: params.description } : {}),
    ...(params.width ? { width: params.width } : {}),
    ...(params.height ? { height: params.height } : {}),
    encodingFormat: mimeType,
    ...(params.datePublished ? { datePublished: params.datePublished } : {}),
    creator: {
      "@id": NINA_ENTITY.id,
    },
    copyrightHolder: {
      "@id": NINA_ENTITY.id,
    },
  };
}

export function getVideoObjectSchema(params: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
}) {
  return {
    "@type": "VideoObject",
    name: params.name,
    description: params.description,
    thumbnailUrl: params.thumbnailUrl,
    uploadDate: params.uploadDate,
    ...(params.contentUrl ? { contentUrl: params.contentUrl } : {}),
    creator: {
      "@id": NINA_ENTITY.id,
    },
  };
}
