/**
 * Configuration and Route Manifest for ninakurainservices.in
 * The official public domain for creator showcase, portfolio, and bookings.
 */

export const PUBLIC_SITE_CONFIG = {
  domain: "ninakurainservices.in",
  canonicalUrl: "https://ninakurainservices.in",
  siteName: "Nina Kurain — Digital Creator Official Website",
  description: "Official public showcase of Nina Kurain, Digital Creator. Photography, 4K videos, lookbook, collaborations, and official verified social channels.",
  routes: {
    home: { path: "/", description: "Official landing page, bio, high-fashion hero, teaser marquee" },
    portfolio: { path: "/portfolio", description: "Creator commercial portfolio, client testimonials, booking" },
    photos: { path: "/photos", description: "Public editorial photo collections and gallery" },
    videos: { path: "/videos", description: "Public 4K creator video reels and teasers" },
    lookbook: { path: "/lookbook", description: "Editorial fashion lookbook and styling collections" },
    press: { path: "/press", description: "Interviews, media kit, and press mentions" },
    pricing: { path: "/pricing", description: "Membership pricing overview and plan benefits" },
    contact: { path: "/contact", description: "Business collaborations and brand partnership inquiries" },
    socials: { path: "/socials", description: "Verified social media profiles (Instagram, YouTube, X, Pinterest)" },
    netWorth: { path: "/net-worth", description: "Biography, career milestones, and official entity schema" },
    wiki: { path: "/wiki", description: "Official creator biography and verified encyclopedia entry" },
    creatorTips: { path: "/creator-tips", description: "Creator production insights, tips, and articles" },
    legal: {
      privacy: "/privacy-policy",
      terms: "/terms-and-conditions",
      contentRemoval: "/content-removal",
    },
    downloads: {
      androidApk: "/downloads/NinaKurain.apk",
      iosIpa: "/downloads/NinaKurain.ipa",
      iosManifest: "/downloads/manifest.plist",
    }
  }
} as const;

export default PUBLIC_SITE_CONFIG;
