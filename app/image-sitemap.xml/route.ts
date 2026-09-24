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
    },
    {
      loc: `${baseUrl}/biography`,
      imageLoc: `${baseUrl}/nina-gallery/nina-kurain-01.jpeg`,
    },
    {
      loc: `${baseUrl}/wiki`,
      imageLoc: `${baseUrl}/nina-kurain-og.jpg`,
    },
    {
      loc: `${baseUrl}/lookbook`,
      imageLoc: `${baseUrl}/nina-gallery/nina-kurain-02.jpeg`,
    },
    {
      loc: `${baseUrl}/media-kit`,
      imageLoc: `${baseUrl}/nina-gallery/nina-kurain-01.jpeg`,
    },
  ];

  // All 51 photography portfolio images
  const photoImages = PHOTOS_DATA.map((img) => ({
    loc: `${baseUrl}/photos/${img.slug}`,
    imageLoc: img.src.startsWith("http") ? img.src : `${baseUrl}${img.src}`,
  }));

  const allItems = [...hubImages, ...photoImages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allItems
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <image:image>
      <image:loc>${item.imageLoc}</image:loc>
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

