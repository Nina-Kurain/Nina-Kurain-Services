import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { HorizontalScrollGallery } from "@/components/horizontal-scroll-gallery";
import { PHOTOS_DATA } from "@/lib/photos-data";
import { rows } from "@/lib/server/db";
import {
  Camera,
  Film,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Mail,
  CheckCircle2,
  ChevronDown,
  Layers,
  Heart,
  Palette,
  Eye,
  Globe2,
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,

  PinterestIcon,
} from "@/components/social-icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Nina Kurain | Digital Creator",
  description:
    "Official biography and creative profile of Nina Kurain, Digital Creator, model, and creative artist. Explore her photography journey, creative direction, videos, and official social channels.",
  keywords: [
    "Nina Kurain",
    "About Nina Kurain",
    "Nina Kurain Digital Creator",
    "Nina Kurain bio",
    "Nina Kurain model",
    "Nina Kurain creative artist",
    "Nina Kurain photography",
    "Who is Nina Kurain",
  ],
  alternates: {
    canonical: "https://ninakurainservices.in/about",
  },
  openGraph: {
    title: "About Nina Kurain | Digital Creator",
    description:
      "Official biography and creative profile of Nina Kurain, Digital Creator, model, and creative artist.",
    url: "https://ninakurainservices.in/about",
    siteName: "Nina Kurain",
    images: [
      {
        url: "/nina-kurain-official-portrait.webp",
        width: 1200,
        height: 630,
        alt: "About Nina Kurain — Digital Creator",
      },
    ],
    locale: "en_IN",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Nina Kurain | Digital Creator",
    description:
      "Official biography and creative profile of Nina Kurain, Digital Creator, model, and creative artist.",
    images: ["/nina-kurain-official-portrait.webp"],
    creator: "@ninakurain",
  },
};

export default async function AboutPage() {
  const settingsRows = await rows<{ key: string; value: string }>(
    "SELECT key,value FROM site_settings WHERE key IN ('creator_name','creator_bio','creator_instagram','creator_youtube','creator_facebook','creator_pinterest','creator_website')"
  );
  const config = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  const instagramUrl = config.creator_instagram || "https://www.instagram.com/ninakurain";
  const youtubeUrl = config.creator_youtube || "https://www.youtube.com/@ninakurain";
  const facebookUrl = config.creator_facebook || "https://www.facebook.com/ninakurain";
  const pinterestUrl = config.creator_pinterest || "https://www.pinterest.com/ninakurain";

  const jsonLdPerson = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": "https://ninakurainservices.in/about/#profile",
        "url": "https://ninakurainservices.in/about",
        "name": "About Nina Kurain | Digital Creator",
        "description":
          "Official biography and creative profile of Nina Kurain, Digital Creator.",
        "mainEntity": {
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
        "description":
          "Nina Kurain is a Digital Creator known for photography, creative content, studio films and online media.",
        "image": [
          "https://ninakurainservices.in/nina-kurain-official-portrait.webp",
          "https://ninakurainservices.in/nina-kurain-digital-creator.webp",
          "https://ninakurainservices.in/nina-kurain-editorial-portrait.webp",
          "https://ninakurainservices.in/nina-kurain-fashion-portrait.webp",
          "https://ninakurainservices.in/nina-kurain-creator-photoshoot.webp",
          "https://ninakurainservices.in/nina-kurain-studio-portrait.webp"
        ],
        "sameAs": [
          instagramUrl,
          youtubeUrl,
          facebookUrl,
          pinterestUrl
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
        "@type": "BreadcrumbList",
        "@id": "https://ninakurainservices.in/about/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Nina Kurain",
            "item": "https://ninakurainservices.in/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About Nina Kurain",
            "item": "https://ninakurainservices.in/about",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://ninakurainservices.in/about/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Who is Nina Kurain?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Nina Kurain is a Digital Creator, model, and creative artist known for fine-art photography, cinematography, and online media.",
            },
          },
          {
            "@type": "Question",
            "name": "What are Nina Kurain's primary creative disciplines?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Nina Kurain's work spans editorial photography, studio lighting design, 4K visual films, fashion modeling, and digital creative direction.",
            },
          },
          {
            "@type": "Question",
            "name": "Where are Nina Kurain's official public updates published?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Official updates are published on https://ninakurainservices.in/ and through her verified social channels on Instagram, YouTube, Facebook, and X.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="public-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
      />
      <PublicHeader />

      <main id="main-content">
        {/* Entity Hero */}
        <section className="creator-hero" aria-label="Nina Kurain Biography">
          <div className="creator-hero-copy">
            <div className="creator-eyebrow">
              <span className="eyebrow-line" />
              <span>OFFICIAL ENTITY BIOGRAPHY</span>
            </div>

            <h1 style={{ fontSize: "clamp(32px, 6vw, 76px)" }}>
              Nina Kurain
              <em>Digital Creator</em>
            </h1>

            <p className="creator-subtitle">
              Creative Artist • Model • Digital Storyteller
            </p>

            <p className="creator-bio-p">
              Nina Kurain is a Digital Creator dedicated to exploring the intersections of editorial
              fashion, fine-art portraiture, and cinematic motion. Through meticulous composition
              and authentic expression, she crafts a modern visual language that resonates across digital platforms.
            </p>

            <div className="creator-hero-actions">
              <Link href="/photos" className="btn-primary">
                <span>View Official Photography</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/collaborations" className="btn-secondary">
                <span>Collaborate</span>
              </Link>
            </div>
          </div>

          <div className="creator-hero-media">
            <div className="hero-portrait-frame">
              <Image
                src="/nina-kurain-official-portrait.webp"
                alt="Nina Kurain — Digital Creator official portrait"
                width={700}
                height={920}
                priority
                className="hero-portrait-img"
              />
              <div className="hero-portrait-overlay" />
            </div>

            <div className="hero-floating-badge badge-bottom">
              <Globe2 size={18} style={{ color: "#e06086" }} />
              <div className="badge-text">
                <strong>ninakurainservices.in</strong>
                <small>CANONICAL ENTITY HOME</small>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative Biography */}
        <section className="public-section">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">THE CREATIVE JOURNEY</span>
              <h2>Vision, Craft &amp; Direction</h2>
              <p>
                A deliberate synthesis of traditional fine-art aesthetics and forward-looking digital media.
              </p>
            </div>
          </div>

          <div className="benefit-grid">
            <article>
              <Palette size={26} />
              <h3>Aesthetic Philosophy</h3>
              <p>
                Rooted in chiaroscuro lighting, tactile textures, and refined minimalism. Every photograph
                is approached as a singular narrative frame rather than a transient social post.
              </p>
            </article>

            <article>
              <Camera size={26} />
              <h3>Photographic Dispatches</h3>
              <p>
                From dramatic studio lighting setups to candid outdoor portraits, Nina works across digital
                medium format and 35mm aesthetics to produce commanding imagery for digital and print media.
              </p>
            </article>

            <article>
              <Film size={26} />
              <h3>Cinematic Motion</h3>
              <p>
                Extending still photography into immersive 4K video essays and reels. Movement, atmosphere,
                and pacing combine to create evocative visual stories.
              </p>
            </article>
          </div>
        </section>

        {/* Selected Images Gallery */}
        <section className="public-section">
          <HorizontalScrollGallery
            photos={PHOTOS_DATA}
            creatorName="Nina Kurain"
            title="Signature Portfolio Archive"
            subtitle="Explore high-resolution editorial portraiture and lighting studies. Free demo works are visible; exclusive VIP frames are locked."
            showViewAllLink={true}
          />
        </section>

        {/* Connected Ecosystem Strip */}
        <section className="public-section">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CANONICAL ECOSYSTEM</span>
              <h2>Official Channels</h2>
              <p>Reinforcing Nina Kurain&apos;s digital creator presence across major authoritative networks.</p>
            </div>
          </div>

          <div className="social-platforms-grid">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-icon-wrapper"><InstagramIcon size={22} /></div>
              <strong>Instagram</strong>
              <span>@ninakurain</span>
            </a>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-icon-wrapper"><YoutubeIcon size={22} /></div>
              <strong>YouTube</strong>
              <span>@ninakurain</span>
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-icon-wrapper"><FacebookIcon size={22} /></div>
              <strong>Facebook</strong>
              <span>Nina Kurain</span>
            </a>
            <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="social-card">
              <div className="social-icon-wrapper"><PinterestIcon size={22} /></div>
              <strong>Pinterest</strong>
              <span>Nina Kurain</span>
            </a>
          </div>
        </section>

        {/* Private Club Callout */}
        <div className="vip-banner-wrap">
          <div className="vip-banner">
            <div className="vip-banner-content">
              <h3>Private Creator Club (18+)</h3>
              <p>
                For patrons seeking private studio archives, unreleased sets, and direct member interactions,
                visit the VIP sanctuary.
              </p>
            </div>
            <div className="vip-banner-action">
              <a
                href="https://vip.ninakurainservices.in/"
                className="vip-banner-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>VIP Access (18+)</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
