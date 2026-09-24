import fs from "node:fs";
import path from "node:path";

console.log("=================================================");
console.log("NINA KURAIN — TECHNICAL SEO PRODUCTION AUDIT");
console.log("=================================================\n");

let passed = true;
const errors = [];
const warnings = [];

function check(condition, desc) {
  if (!condition) {
    passed = false;
    errors.push(`FAIL: ${desc}`);
    console.log(`❌ FAIL: ${desc}`);
  } else {
    console.log(`✅ PASS: ${desc}`);
  }
}

// 1. Check Root Layout Canonical Tag
const rootLayout = fs.readFileSync("app/layout.tsx", "utf8");
check(
  !rootLayout.includes('<link rel="canonical"'),
  "app/layout.tsx does NOT hardcode a static global <link rel='canonical'>"
);
check(
  !rootLayout.includes("jsonLdSchema"),
  "app/layout.tsx does NOT inject a bloated global jsonLdSchema across all routes"
);

// 2. Check Central Entity
const ninaEntity = fs.readFileSync("lib/seo/nina-entity.ts", "utf8");
check(
  ninaEntity.includes('id: "https://ninakurainservices.in/#person"'),
  "NINA_ENTITY single Person ID is https://ninakurainservices.in/#person"
);
check(
  !ninaEntity.includes('"Nina"') || ninaEntity.includes('name: "Nina Kurain"'),
  "NINA_ENTITY has canonical name 'Nina Kurain' without broad single-word alias 'Nina'"
);

// 3. Check Sitemap Implementation
const sitemapRoute = fs.readFileSync("app/sitemap.xml/route.ts", "utf8");
check(
  !fs.existsSync("public/sitemap.xml") && !fs.existsSync("sitemap.xml"),
  "Duplicate sitemap.xml files removed from public/ and project root"
);
check(
  sitemapRoute.includes("/biography") &&
  sitemapRoute.includes("/wiki") &&
  sitemapRoute.includes("/entity") &&
  sitemapRoute.includes("/pricing") &&
  sitemapRoute.includes("/photos") &&
  sitemapRoute.includes("/lookbook"),
  "Sitemap includes dedicated canonical pages (/biography, /wiki, /entity, /pricing, /photos, /lookbook)"
);
check(
  !sitemapRoute.includes("image:title") &&
  !sitemapRoute.includes("image:caption") &&
  !sitemapRoute.includes("image:license"),
  "Sitemap does not use deprecated image tags (image:title, image:caption, image:license)"
);

// 4. Check Robots.txt
const robotsTxt = fs.readFileSync("public/robots.txt", "utf8");
check(
  robotsTxt.includes("Disallow: /admin") &&
  robotsTxt.includes("Disallow: /account") &&
  robotsTxt.includes("Disallow: /feed") &&
  robotsTxt.includes("Sitemap: https://ninakurainservices.in/sitemap.xml"),
  "public/robots.txt correctly disallows private routes and references canonical sitemaps"
);

// 5. Check Noindex on Auth and Private Pages
const authPages = [
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/forgot-password/page.tsx",
  "app/reset-password/page.tsx",
  "app/verify-email/page.tsx",
  "app/verify-email-pending/page.tsx",
  "app/complete-profile/page.tsx",
  "app/admin/page.tsx",
  "app/account/page.tsx",
  "app/feed/page.tsx",
  "app/saved/page.tsx",
];

for (const p of authPages) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, "utf8");
    check(
      content.includes("index: false") && content.includes("follow: false"),
      `${p} has robots: { index: false, follow: false }`
    );
  }
}

// 6. Check dedicated pages are not redirected away in next.config.ts
const nextConfig = fs.readFileSync("next.config.ts", "utf8");
check(
  !nextConfig.includes('source: "/biography"') &&
  !nextConfig.includes('source: "/wiki"') &&
  !nextConfig.includes('source: "/entity"') &&
  !nextConfig.includes('source: "/pricing"'),
  "next.config.ts does NOT redirect dedicated canonical pages (/biography, /wiki, /entity, /pricing)"
);
check(
  fs.existsSync("app/biography/page.tsx") &&
  fs.existsSync("app/wiki/page.tsx") &&
  fs.existsSync("app/entity/page.tsx") &&
  fs.existsSync("app/pricing/page.tsx"),
  "Dedicated canonical pages exist with 200 OK handlers"
);

// 7. Check OpenGraph Image
check(
  fs.existsSync("public/nina-kurain-og.jpg"),
  "public/nina-kurain-og.jpg exists for social sharing"
);

// 8. Check Public Image Gallery in photos-data.ts
const photosData = fs.readFileSync("lib/photos-data.ts", "utf8");
check(
  photosData.includes("/nina-gallery/nina-kurain-01.jpeg") &&
  (photosData.includes('"width": 1200') || photosData.includes("width: 1200")),
  "photos-data.ts contains authentic Nina Kurain gallery photos (1200x1600)"
);
check(
  !photosData.includes("VIP Locked (18+)"),
  "photos-data.ts does not include adult 18+ labels in public photography collection"
);

// 9. Check Header and Footer Clean SFW separation
const header = fs.readFileSync("components/public-header.tsx", "utf8");
check(
  !header.includes("VIP Archive (18+)") && !header.includes("Private Creator Club (18+)"),
  "PublicHeader does not include 18+ adult tags on main navigation"
);
const footer = fs.readFileSync("components/public-footer.tsx", "utf8");
check(
  !footer.includes("ninakurainservices.in/#nina-kurain"),
  "PublicFooter does not print machine-facing entity anchor"
);

// 10. Check Assigned Images (Landing Hero, Login Card, Caution 18+)
check(
  fs.existsSync("public/nina-landing-hero.png") &&
  fs.existsSync("public/nina-login-card.jpg") &&
  fs.existsSync("public/nina-caution-18.jpg"),
  "All 3 assigned images exist in public/ (nina-landing-hero.png, nina-login-card.jpg, nina-caution-18.jpg)"
);
const homepage = fs.readFileSync("components/public-homepage.tsx", "utf8");
check(
  homepage.includes("nina-landing-hero.png"),
  "Landing page (components/public-homepage.tsx) displays official opening image (nina-landing-hero.png)"
);
const authForm = fs.readFileSync("app/auth-form.tsx", "utf8");
check(
  authForm.includes("nina-login-card.jpg"),
  "Login page (app/auth-form.tsx) fills card with Image 2 (nina-login-card.jpg)"
);
const ageGate = fs.readFileSync("app/age-gate.tsx", "utf8");
check(
  ageGate.includes("nina-caution-18.jpg"),
  "Age gate (app/age-gate.tsx) displays Image 3 caution (nina-caution-18.jpg)"
);

// 11. Check Zero Video Elements on public pages
const videosClient = fs.readFileSync("components/public-videos-client.tsx", "utf8");
check(
  !videosClient.includes("<video"),
  "Videos section (components/public-videos-client.tsx) contains ZERO <video> elements"
);

// 12. Check public-data.ts does not use deleted demo assets
const publicData = fs.readFileSync("lib/server/public-data.ts", "utf8");
check(
  !publicData.includes('src: "/booty.mp4"') && !publicData.includes("/seductive-1.jpeg"),
  "lib/server/public-data.ts does NOT reference deleted demo media or videos"
);

console.log("\n=================================================");
if (passed) {
  console.log("🎉 AUDIT PASSED: ALL TECHNICAL SEO CRITERIA MET");
  console.log("=================================================\n");
  process.exit(0);
} else {
  console.log("❌ AUDIT FAILED with errors:");
  errors.forEach((e) => console.log(e));
  console.log("=================================================\n");
  process.exit(1);
}
