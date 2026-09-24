import { NINA_ENTITY } from "@/lib/seo/nina-entity";
import { PHOTOS_DATA } from "@/lib/photos-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = NINA_ENTITY.canonicalBase;
  const today = new Date().toISOString().split("T")[0];

  // Only canonical 200-status indexable URLs. No redirects, no auth pages, no demo media.
  const staticRoutes = [
    { path: "", priority: "1.0", changefreq: "weekly", lastmod: today },
    { path: "/about", priority: "0.9", changefreq: "monthly", lastmod: today },
    { path: "/biography", priority: "0.95", changefreq: "monthly", lastmod: today },
    { path: "/wiki", priority: "0.95", changefreq: "monthly", lastmod: today },
    { path: "/entity", priority: "0.95", changefreq: "monthly", lastmod: today },
    { path: "/photos", priority: "0.9", changefreq: "weekly", lastmod: today },
    { path: "/gallery", priority: "0.9", changefreq: "weekly", lastmod: today },
    { path: "/lookbook", priority: "0.85", changefreq: "weekly", lastmod: today },
    { path: "/videos", priority: "0.8", changefreq: "weekly", lastmod: today },
    { path: "/reels", priority: "0.85", changefreq: "daily", lastmod: today },
    { path: "/portfolio", priority: "0.85", changefreq: "weekly", lastmod: today },
    { path: "/updates", priority: "0.85", changefreq: "daily", lastmod: today },
    { path: "/socials", priority: "0.8", changefreq: "weekly", lastmod: today },
    { path: "/memberships", priority: "0.85", changefreq: "weekly", lastmod: today },
    { path: "/pricing", priority: "0.85", changefreq: "weekly", lastmod: today },
    { path: "/net-worth", priority: "0.8", changefreq: "monthly", lastmod: today },
    { path: "/creator-tips", priority: "0.8", changefreq: "monthly", lastmod: today },
    { path: "/interviews", priority: "0.8", changefreq: "monthly", lastmod: today },
    { path: "/media-kit", priority: "0.8", changefreq: "monthly", lastmod: today },
    { path: "/collaborations", priority: "0.75", changefreq: "monthly", lastmod: today },
    { path: "/press", priority: "0.75", changefreq: "monthly", lastmod: today },
    { path: "/contact", priority: "0.6", changefreq: "monthly", lastmod: today },
    { path: "/faq", priority: "0.7", changefreq: "monthly", lastmod: today },
    { path: "/terms-and-conditions", priority: "0.4", changefreq: "yearly", lastmod: today },
    { path: "/privacy-policy", priority: "0.4", changefreq: "yearly", lastmod: today },
    { path: "/content-removal", priority: "0.4", changefreq: "yearly", lastmod: today },
  ];

  // Dynamic individual photo URLs (all 51 authentic high-res items)
  const photoRoutes = PHOTOS_DATA.map((p) => ({
    path: `/photos/${p.slug}`,
    priority: "0.75",
    changefreq: "monthly",
    lastmod: p.datePublished || today,
  }));

  const allRoutes = [...staticRoutes, ...photoRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
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
