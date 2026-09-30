import { PHOTOS_DATA } from "@/lib/photos-data";
import { NINA_ENTITY } from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = NINA_ENTITY.canonicalBase;

  // Key hub page images
  const hubImages = [
    {
      loc: `${baseUrl}`,
      imageLoc: `${baseUrl}/nina-landing-hero.png`,
      title: "Nina Kurain — Official Portrait & Digital Creator Hub",
      caption: "Official digital creator homepage of Nina Kurain",
    },
    {
      loc: `${baseUrl}/biography`,
      imageLoc: `${baseUrl}/nina-gallery/nina-kurain-01.jpeg`,
      title: "Nina Kurain — Biography & Career Archive",
      caption: "Biographical portrait of Nina Kurain, Digital Creator",
    },
    {
      loc: `${baseUrl}/wiki`,
      imageLoc: `${baseUrl}/nina-kurain-og.jpg`,
      title: "Nina Kurain — Official Dossier & Factsheet",
      caption: "Official entity dossier and verified credentials of Nina Kurain",
    },
    {
      loc: `${baseUrl}/lookbook`,
      imageLoc: `${baseUrl}/nina-gallery/nina-kurain-02.jpeg`,
      title: "Nina Kurain — Editorial Styling & Lookbook",
      caption: "Contemporary visual styling and editorial portfolio of Nina Kurain",
    },
    {
      loc: `${baseUrl}/media-kit`,
      imageLoc: `${baseUrl}/nina-gallery/nina-kurain-01.jpeg`,
      title: "Nina Kurain — Press & Media Kit",
      caption: "High-resolution press and media kit photography of Nina Kurain",
    },
  ];

  // All 51 photography portfolio images
  const photoImages = PHOTOS_DATA.map((img) => ({
    loc: `${baseUrl}/photos/${img.slug}`,
    imageLoc: img.src.startsWith("http") ? img.src : `${baseUrl}${img.src}`,
    title: img.title,
    caption: img.caption,
  }));

  const licenseUrl = `${baseUrl}/terms-and-conditions`;
  const allItems = [...hubImages, ...photoImages];

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allItems
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <image:image>
      <image:loc>${item.imageLoc}</image:loc>
      <image:title>${escapeXml(item.title)}</image:title>
      <image:caption>${escapeXml(item.caption)}</image:caption>
      <image:license>${licenseUrl}</image:license>
    </image:image>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

