import { PHOTOS_DATA } from "@/lib/photos-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = process.env.APP_URL || `${url.protocol}//${url.host}` || "https://ninakurainservices.in";
  const now = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${PHOTOS_DATA.map(
  (photo) => `  <url>
    <loc>${baseUrl}/photos/${photo.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>${baseUrl}${photo.src}</image:loc>
      <image:title>${photo.heading.replace(/&/g, "&amp;")}</image:title>
      <image:caption>${photo.caption.replace(/&/g, "&amp;")}</image:caption>
      <image:license>${baseUrl}/collaborations</image:license>
    </image:image>
  </url>`
).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
