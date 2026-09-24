import { NINA_ENTITY } from "@/lib/seo/nina-entity";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = NINA_ENTITY.canonicalBase;

  // Only canonical 200-status indexable URLs. No redirects, no auth pages, no demo media.
  const staticRoutes = [
    { path: "" },
    { path: "/about" },
    { path: "/biography" },
    { path: "/wiki" },
    { path: "/entity" },
    { path: "/photos" },
    { path: "/gallery" },
    { path: "/lookbook" },
    { path: "/videos" },
    { path: "/reels" },
    { path: "/portfolio" },
    { path: "/updates" },
    { path: "/socials" },
    { path: "/pricing" },
    { path: "/net-worth" },
    { path: "/creator-tips" },
    { path: "/collaborations" },
    { path: "/press" },
    { path: "/contact" },
    { path: "/faq" },
    { path: "/terms-and-conditions" },
    { path: "/privacy-policy" },
    { path: "/content-removal" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
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
