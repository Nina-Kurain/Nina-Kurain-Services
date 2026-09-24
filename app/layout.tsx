import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./live.css";
import "./premium.css";
import "./mobile.css";
import "../components/media-editor/media-editor.css";
import "./creator-responsive.css";
import "./legal.css";
import "./public-creator.css";
import { AgeGate } from "./age-gate";
import { ScrollReveal } from "@/components/scroll-reveal";
import { GoogleAdsenseListener } from "@/components/ads/google-adsense-listener";
import { NINA_ENTITY } from "@/lib/seo/nina-entity";

const themeBootScript = `(function(){try{
  var t=localStorage.getItem('afterglow-theme')||'system';
  var e=t==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;
  document.documentElement.dataset.theme=e;
  document.documentElement.dataset.themeChoice=t;
  document.documentElement.style.colorScheme=e;
  var host=(window.location.hostname||'').toLowerCase();
  var isVipHost=host.indexOf('vip.')===0;
  var p=(window.location.pathname||'').toLowerCase();
  var isProtectedPath=isVipHost || p.indexOf('/feed')===0 || p.indexOf('/saved')===0 || p.indexOf('/account')===0;
  var v=false;
  try{
    v=(sessionStorage.getItem('afterglow-age-verified-session')==='true')||(document.cookie.indexOf('afterglow_age_session=1')!==-1)||(document.cookie.indexOf('adult_age_confirmed=true')!==-1);
  }catch(_){}
  document.documentElement.dataset.ageVerified=v?'true':'false';
  document.documentElement.dataset.ageGate=(!isProtectedPath || v)?'closed':'open';
}catch(_){
  document.documentElement.dataset.theme='dark';
  document.documentElement.dataset.themeChoice='system';
  document.documentElement.dataset.ageGate='closed';
  document.documentElement.dataset.ageVerified='false';
}})();`;

const mediaProtectionScript = `(function(){function block(e){var el=e.target;if(el&&el.closest&&el.closest('[data-protected-media],.protected-media-frame')){e.preventDefault();if(e.stopPropagation)e.stopPropagation();return false;}}window.addEventListener('contextmenu',block,true);})();`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || NINA_ENTITY.canonicalBase),
  title: {
    default: "Nina Kurain | Digital Creator — Official Website",
    template: "%s | Nina Kurain",
  },
  description: NINA_ENTITY.description,
  authors: [{ name: NINA_ENTITY.name, url: NINA_ENTITY.url }],
  creator: NINA_ENTITY.name,
  publisher: NINA_ENTITY.name,
  openGraph: {
    title: "Nina Kurain | Digital Creator — Official Website",
    description: NINA_ENTITY.description,
    url: NINA_ENTITY.canonicalBase,
    siteName: NINA_ENTITY.name,
    images: [
      {
        url: "/nina-kurain-og.jpg",
        width: 1376,
        height: 768,
        alt: "Nina Kurain — Digital Creator",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain | Digital Creator — Official Website",
    description: NINA_ENTITY.description,
    images: ["/nina-kurain-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
    other: {
      "p:domain_verify": process.env.PINTEREST_SITE_VERIFICATION || "9e061a53d532f22c84aa15f8741f1baf",
      "pinterest-site-verification": process.env.PINTEREST_SITE_VERIFICATION || "9e061a53d532f22c84aa15f8741f1baf",
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09050a" },
    { media: "(prefers-color-scheme: light)", color: "#fff8f8" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Pinterest Domain Verification */}
        <meta
          name="p:domain_verify"
          content={process.env.PINTEREST_SITE_VERIFICATION || "9e061a53d532f22c84aa15f8741f1baf"}
        />
        <meta
          name="pinterest-site-verification"
          content={process.env.PINTEREST_SITE_VERIFICATION || "9e061a53d532f22c84aa15f8741f1baf"}
        />

        {/* Google AdSense */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.GOOGLE_ADSENSE_CLIENT || "ca-pub-9145564577500381"}`}
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <script dangerouslySetInnerHTML={{ __html: mediaProtectionScript }} />
      </head>
      <body>
        <GoogleAdsenseListener />
        <ScrollReveal />
        <AgeGate />
        {children}
      </body>
    </html>
  );
}
