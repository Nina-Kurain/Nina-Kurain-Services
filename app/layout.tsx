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
  metadataBase: new URL(process.env.APP_URL || "https://ninakurainservices.in"),
  title: {
    default: "Nina Kurain | Official Website & Digital Creator",
    template: "%s | Nina Kurain — Digital Creator",
  },
  description:
    "Discover Nina Kurain, Digital Creator, through official photography, videos, creator updates, collaborations and social profiles.",
  keywords: [
    "Nina Kurain",
    "Nina Kurain Digital Creator",
    "Nina Kurain official",
    "Nina Kurain website",
    "Nina Kurain photos",
    "Nina Kurain images",
    "Nina Kurain videos",
    "Nina Kurain creator",
    "Nina Kurain model",
    "Nina Kurain creative artist",
    "Nina Kurain Instagram",
    "Nina Kurain YouTube",
    "Nina Kurain Facebook",
    "Who is Nina Kurain",
  ],
  authors: [{ name: "Nina Kurain", url: "https://ninakurainservices.in" }],
  creator: "Nina Kurain",
  publisher: "Nina Kurain",
  alternates: {
    canonical: "https://ninakurainservices.in/",
  },
  openGraph: {
    title: "Nina Kurain | Official Website & Digital Creator",
    description:
      "Discover Nina Kurain, Digital Creator, through official photography, videos, creator updates, collaborations and social profiles.",
    url: "https://ninakurainservices.in",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "Nina Kurain — Digital Creator",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nina Kurain | Official Website & Digital Creator",
    description:
      "Discover Nina Kurain, Digital Creator, through official photography, videos, creator updates, collaborations and social profiles.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
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

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://ninakurainservices.in/#website",
      "url": "https://ninakurainservices.in/",
      "name": "Nina Kurain",
      "alternateName": "Nina Kurain — Digital Creator",
      "description": "Official website and creative portfolio of Nina Kurain, Digital Creator.",
      "publisher": {
        "@id": "https://ninakurainservices.in/#nina-kurain",
      },
    },
    {
      "@type": "Person",
      "@id": "https://ninakurainservices.in/#nina-kurain",
      "name": "Nina Kurain",
      "alternateName": ["Nina Kurain", "Nina", "@ninakurain"],
      "url": "https://ninakurainservices.in/",
      "jobTitle": "Digital Creator",
      "description": "Nina Kurain is a Digital Creator known for photography, creative content and online media.",
      "image": [
        "https://ninakurainservices.in/nina-kurain-official-portrait.webp",
        "https://ninakurainservices.in/nina-kurain-digital-creator.webp",
        "https://ninakurainservices.in/nina-kurain-editorial-portrait.webp",
        "https://ninakurainservices.in/nina-kurain-fashion-portrait.webp",
        "https://ninakurainservices.in/nina-kurain-creator-photoshoot.webp",
        "https://ninakurainservices.in/nina-kurain-studio-portrait.webp"
      ],
      "sameAs": [
        "https://www.instagram.com/ninakurain",
        "https://www.youtube.com/@ninakurain",
        "https://www.facebook.com/ninakurain",
        "https://www.pinterest.com/ninakurain"
      ],
      "knowsAbout": [
        "Digital Creation",
        "Editorial Photography",
        "Creative Direction",
        "Visual Storytelling",
        "Fashion & Modeling"
      ]
    },
    {
      "@type": "ProfilePage",
      "@id": "https://ninakurainservices.in/about/#profile",
      "url": "https://ninakurainservices.in/about/",
      "name": "About Nina Kurain — Digital Creator Profile",
      "mainEntity": {
        "@id": "https://ninakurainservices.in/#nina-kurain"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://ninakurainservices.in/#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Nina Kurain",
          "item": "https://ninakurainservices.in/",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://ninakurainservices.in/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Who is Nina Kurain?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nina Kurain is a Digital Creator known for photography, creative content, studio films and online media.",
          },
        },
        {
          "@type": "Question",
          "name": "What is the official website of Nina Kurain?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The official and canonical website of Nina Kurain is https://ninakurainservices.in/.",
          },
        },
        {
          "@type": "Question",
          "name": "Where can I view Nina Kurain's photography and creative work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nina Kurain's official photography and creative portfolios are showcased on https://ninakurainservices.in/photos/ and her verified social channels.",
          },
        },
        {
          "@type": "Question",
          "name": "How can brands and creators collaborate with Nina Kurain?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Inquiries for creative collaborations, editorial features, and brand partnerships can be submitted through https://ninakurainservices.in/collaborations/ or https://ninakurainservices.in/contact/.",
          },
        },
      ],
    },
  ],
};

import { ScrollReveal } from "@/components/scroll-reveal";
import { GoogleAdsenseListener } from "@/components/ads/google-adsense-listener";

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
        <link rel="canonical" href="https://ninakurainservices.in/" />
        {/* Pinterest Domain Verification */}
        <meta
          name="p:domain_verify"
          content={process.env.PINTEREST_SITE_VERIFICATION || "9e061a53d532f22c84aa15f8741f1baf"}
        />
        <meta
          name="pinterest-site-verification"
          content={process.env.PINTEREST_SITE_VERIFICATION || "9e061a53d532f22c84aa15f8741f1baf"}
        />

        {/* Schema.org JSON-LD Structured Data for Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
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
