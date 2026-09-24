import { getPublicCreatorData } from "@/lib/server/public-data";
import { NINA_ENTITY } from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = NINA_ENTITY.canonicalBase;
  const { photos } = await getPublicCreatorData();

  const validPhotos = photos.filter(
    (p) => !p.image.startsWith("/seductive") && (p.image.startsWith("/nina-gallery/") || p.image.startsWith("/api/content/"))
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${validPhotos
  .map(
    (img) => `  <url>
    <loc>${baseUrl}/photos/${img.slug}</loc>
    <image:image>
      <image:loc>${img.image.startsWith("http") ? img.image : `${baseUrl}${img.image}`}</image:loc>
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
