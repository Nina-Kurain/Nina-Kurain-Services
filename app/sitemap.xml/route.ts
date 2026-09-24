import { PHOTOS_DATA } from "@/lib/photos-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = process.env.APP_URL || `${url.protocol}//${url.host}` || "https://ninakurainservices.in";
  const now = new Date().toISOString().split("T")[0];

  const staticRoutes = [
    {
      path: "",
      priority: "1.0",
      changefreq: "daily",
      images: [
        {
          loc: `${baseUrl}/nina-kurain-official-portrait.webp`,
          title: "Nina Kurain | Official Website & Digital Creator",
          caption: "Nina Kurain — Digital Creator & Model official portrait",
        },
      ],
    },
    {
      path: "/about",
      priority: "1.0",
      changefreq: "weekly",
      images: [
        {
          loc: `${baseUrl}/nina-kurain-official-portrait.webp`,
          title: "Nina Kurain Official Signature Portrait",
          caption: "Nina Kurain — Digital Creator, Model & Creative Artist",
        },
        {
          loc: `${baseUrl}/nina-kurain-digital-creator.webp`,
          title: "Nina Kurain — Digital Artistry & Vision",
          caption: "Contemporary visual direction and editorial storytelling",
        },
      ],
    },
    {
      path: "/photos",
      priority: "0.95",
      changefreq: "daily",
      images: PHOTOS_DATA.map((p) => ({
        loc: `${baseUrl}${p.src}`,
        title: p.heading,
        caption: p.caption,
      })),
    },
    {
      path: "/videos",
      priority: "0.9",
      changefreq: "weekly",
      images: [
        {
          loc: `${baseUrl}/nina-kurain-official-portrait.webp`,
          title: "Nina Kurain Studio Cinematography",
          caption: "4K motion stories and reels",
        },
      ],
    },
    { path: "/updates", priority: "0.85", changefreq: "weekly", images: [] },
    { path: "/collaborations", priority: "0.85", changefreq: "monthly", images: [] },
    { path: "/socials", priority: "0.85", changefreq: "weekly", images: [] },
    { path: "/press", priority: "0.8", changefreq: "monthly", images: [] },
    { path: "/media-kit", priority: "0.8", changefreq: "monthly", images: [] },
    { path: "/contact", priority: "0.8", changefreq: "monthly", images: [] },
    { path: "/faq", priority: "0.8", changefreq: "monthly", images: [] },
    { path: "/terms-and-conditions", priority: "0.3", changefreq: "yearly", images: [] },
    { path: "/privacy-policy", priority: "0.3", changefreq: "yearly", images: [] },
    { path: "/content-removal", priority: "0.3", changefreq: "yearly", images: [] },
  ];

  const photoRoutes = PHOTOS_DATA.map((p) => ({
    path: `/photos/${p.slug}`,
    priority: "0.8",
    changefreq: "monthly",
    images: [
      {
        loc: `${baseUrl}${p.src}`,
        title: p.heading,
        caption: p.caption,
      },
    ],
  }));

  const allRoutes = [...staticRoutes, ...photoRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>${
      r.images.length
        ? "\n" +
          r.images
            .map(
              (img) => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title.replace(/&/g, "&amp;")}</image:title>
      <image:caption>${img.caption.replace(/&/g, "&amp;")}</image:caption>
    </image:image>`
            )
            .join("\n")
        : ""
    }
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
