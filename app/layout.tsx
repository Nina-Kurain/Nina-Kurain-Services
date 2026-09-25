import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./live.css";
import "./premium.css";
import "./mobile.css";
import "../components/media-editor/media-editor.css";
import "./creator-responsive.css";
import "./legal.css";
import "./public-creator.css";
import "@/security/security.css";
import { AgeGate } from "./age-gate";
import { ScrollReveal } from "@/components/scroll-reveal";
import { GoogleAdsenseListener } from "@/components/ads/google-adsense-listener";
import { SecurityGuard, MobileAppGate } from "@/security";
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

const mediaProtectionScript = `(function(){
  try{
    function block(e){
      var t=e.target;
      if(t&&(t.tagName==='IMG'||t.tagName==='VIDEO'||t.tagName==='CANVAS'||(t.closest&&t.closest('[data-protected-media],.protected-media-frame,.photo-card-media,.hero-photo,.marquee-item,.post-media,.gallery-item')))){
        e.preventDefault();
        if(e.stopPropagation)e.stopPropagation();
        return false;
      }
    }
    function engageShield(){
      document.documentElement.classList.add('nk-screenshot-shield');
      var toast = document.getElementById('nk-android-system-toast');
      if (toast) { toast.classList.add('is-visible'); }
      var curtain = document.getElementById('nk-permanent-security-curtain');
      if (curtain) { curtain.classList.add('is-active'); }
    }
    function releaseShield(){
      setTimeout(function(){
        if(document.hasFocus && document.hasFocus()){
          document.documentElement.classList.remove('nk-screenshot-shield');
          var toast = document.getElementById('nk-android-system-toast');
          if (toast) { toast.classList.remove('is-visible'); }
          var curtain = document.getElementById('nk-permanent-security-curtain');
          if (curtain) { curtain.classList.remove('is-active'); }
        }
      },2400);
    }
    window.addEventListener('contextmenu',function(e){
      var tag=(e.target&&e.target.tagName)||'';
      if(tag!=='INPUT'&&tag!=='TEXTAREA'){
        e.preventDefault();
        if(e.stopPropagation)e.stopPropagation();
        return false;
      }
    },true);
    window.addEventListener('dragstart',block,true);
    window.addEventListener('keydown',function(e){
      var k=e.key,c=e.keyCode||e.which;
      var ctrl=e.ctrlKey||e.metaKey;
      if(k==='PrintScreen'||c===44){
        e.preventDefault();
        engageShield();
        setTimeout(releaseShield,2500);
        return false;
      }
      // Mobile Volume Down (Android screenshot) & Volume Up button attempt
      if(k==='VolumeDown'||k==='AudioVolumeDown'||e.code==='VolumeDown'||c===174||c===25||k==='VolumeUp'||k==='AudioVolumeUp'||e.code==='VolumeUp'||c===175||c===24){
        engageShield();
        setTimeout(releaseShield,3000);
      }
      if(k==='F12'||c===123){e.preventDefault();engageShield();setTimeout(releaseShield,2000);return false;}
      if((ctrl||e.metaKey)&&e.shiftKey&&(k==='S'||k==='s'||k==='3'||k==='4'||k==='5')){
        e.preventDefault();
        engageShield();
        setTimeout(releaseShield,2500);
        return false;
      }
      if(ctrl&&(k==='u'||k==='U'||k==='s'||k==='S'||k==='p'||k==='P')){e.preventDefault();return false;}
      if(ctrl&&e.shiftKey&&(k==='I'||k==='i'||k==='J'||k==='j'||k==='C'||k==='c')){e.preventDefault();return false;}
    },true);
    window.addEventListener('keyup',function(e){
      var k=e.key,c=e.keyCode||e.which;
      if(k==='PrintScreen'||c===44||k==='VolumeDown'||e.code==='VolumeDown'||k==='VolumeUp'||e.code==='VolumeUp'||c===174||c===175||c===24||c===25){
        engageShield();
        setTimeout(releaseShield,2800);
      }
    },true);
    window.addEventListener('blur',function(){
      engageShield();
      setTimeout(releaseShield,2600);
    });
    window.addEventListener('focus',releaseShield);
    window.addEventListener('pagehide',engageShield);
    window.addEventListener('touchstart',function(e){
      if(e.touches && e.touches.length >= 3){
        e.preventDefault();
        engageShield();
        setTimeout(releaseShield,2500);
      }
    },{passive:false});
    document.addEventListener('visibilitychange',function(){
      if(document.visibilityState==='hidden'){engageShield();}
      else{setTimeout(releaseShield,2000);}
    });
  }catch(_){}
})();`;

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
        <MobileAppGate />
        <SecurityGuard />
        <GoogleAdsenseListener />
        <ScrollReveal />
        <AgeGate />
        {children}
      </body>
    </html>
  );
}
