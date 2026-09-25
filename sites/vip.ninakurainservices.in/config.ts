/**
 * Configuration and Route Manifest for vip.ninakurainservices.in
 * The private VIP member portal and creator studio.
 */

export const VIP_SITE_CONFIG = {
  domain: "vip.ninakurainservices.in",
  canonicalUrl: "https://vip.ninakurainservices.in",
  siteName: "Nina Kurain VIP Membership Sanctuary",
  description: "Private exclusive sanctuary of Nina Kurain. Unfiltered boudoir tapes, erotic archives, confessions, and direct creator studio.",
  routes: {
    portalRoot: { path: "/", description: "Redirects directly into VIP feed (/feed)" },
    feed: { path: "/feed", description: "VIP uncensored posts, drops, audio confessions, stories" },
    reels: { path: "/reels", description: "Vertical full-screen 4K video player with member interaction" },
    saved: { path: "/saved", description: "Personal saved collection & bookmarks" },
    account: { path: "/account", description: "Account management, security, preferences" },
    membership: { path: "/account/membership", description: "Active tier status, renewal, upgrade options" },
    pricing: { path: "/memberships", description: "Full VIP tier catalog & Razorpay/UPI checkout" },
    login: { path: "/login", description: "VIP Member login with seductive mobile app enforcement" },
    signup: { path: "/signup", description: "VIP member registration & invitation acceptance" },
    completeProfile: { path: "/complete-profile", description: "Mandatory mobile phone verification onboarding" },
    verifyEmail: { path: "/verify-email-pending", description: "24-hour mandatory email verification gate" },
    admin: {
      studio: "/admin",
      login: "/admin/login",
      posts: "/admin/posts",
      media: "/admin/media",
      analytics: "/admin/analytics",
      exemptFromMobileGate: true,
    }
  },
  securityPolicies: {
    mobileAppGate: "Active for all VIP member pages on mobile devices",
    adminGateExempt: true,
    screenshotProtection: true,
    tamperProofPayments: "Payments are permanent and never deleted upon account purge",
    unverifiedPurgeHours: 24
  }
} as const;

export default VIP_SITE_CONFIG;
