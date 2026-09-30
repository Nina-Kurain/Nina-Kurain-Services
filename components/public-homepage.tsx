"use client";

import Link from "@/components/site-link";
import Image from "next/image";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { APP_VERSION_DISPLAY, CURRENT_REQUIRED_APP_VERSION } from "@/lib/app-version";
import {
  Camera,
  Film,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  User,
  Palette,
  Play,
  Sliders,
  Layers,
  Award,
  Smartphone,
  Download,
  Apple,
  LockKeyhole,
  Flame,
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,
  PinterestIcon,
} from "@/components/social-icons";
import { useState } from "react";
import { NINA_ENTITY } from "@/lib/seo/nina-entity";
import { AutoHorizontalGallery } from "@/components/auto-horizontal-gallery";
import { CinematicIntro, replayCinematicIntro } from "@/components/cinematic-intro";

export interface PublicHomepageProps {
  signedIn?: boolean;
  displayName?: string | null;
  settings?: {
    name?: string;
    title?: string;
    subheading?: string;
    bio?: string;
    heroImage?: string;
  };
  socials?: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    website?: string;
    pinterest?: string;
    x?: string;
    whatsapp?: string;
    vipUrl?: string;
  };
  photos?: Array<{
    slug: string;
    title: string;
    tag: string;
    caption: string;
    image: string;
    category?: string;
    isPremium?: boolean;
    width?: number;
    height?: number;
  }>;
  videos?: Array<{
    id: string;
    title: string;
    meta: string;
    desc: string;
    src: string;
    poster: string;
    isPremium?: boolean;
  }>;
  updates?: Array<{
    slug: string;
    date: string;
    title: string;
    excerpt: string;
    category: string;
    href: string;
  }>;
}

const FEATURED_PHOTOS = [
  {
    slug: "studio-portraiture",
    title: "Official Portraiture",
    tag: "Primary Portrait",
    caption: "The definitive studio portraiture of Nina Kurain, capturing minimalist elegance and editorial depth.",
    category: "Portraits",
  },
  {
    slug: "digital-artistry",
    title: "Digital Artistry & Vision",
    tag: "Editorial Series",
    caption: "Contemporary visual direction blending modern styling with digital creator storytelling.",
    category: "Editorial",
  },
  {
    slug: "fashion-editorial",
    title: "Fashion Editorial",
    tag: "Fashion Series",
    caption: "Dramatic monochrome and studio composition exploring form, light, and modern silhouettes.",
    category: "Fashion",
  },
  {
    slug: "studio-light-study",
    title: "Studio Light Study",
    tag: "Studio Series",
    caption: "An intimate exploration of warm studio lighting and timeless portrait aesthetics.",
    category: "Studio",
  },
];

const VIDEOS = [
  {
    id: "v1",
    title: "Studio Light & Rhythm: Cinematic Showreel",
    meta: "4K Motion Story • Studio Film",
    desc: "A rhythmic visual study of light, texture, and cinematic pacing directed and produced by Nina Kurain.",
  },
  {
    id: "v2",
    title: "The Editorial Archive: Studio Vignette",
    meta: "60fps Visual Teaser • Behind The Scenes",
    desc: "Glimpses into the creative process, studio lighting setup, and spontaneous movement during editorial shoots.",
  },
  {
    id: "v3",
    title: "Kinetic Expression: Motion Study",
    meta: "Visual Essay • Creative Direction",
    desc: "Exploring contemporary fashion movement, high-contrast illumination, and atmospheric cinematography.",
  },
];

const UPDATES = [
  {
    slug: "autumn-editorial-collection-2026",
    date: "September 18, 2026",
    title: "Autumn Editorial Collection Premieres",
    excerpt: "New fine-art portrait collection exploring tonal harmonies, studio shadows, and seasonal aesthetics.",
    category: "Portfolio Release",
    href: "/photos",
  },
  {
    slug: "cinematography-motion-series",
    date: "August 28, 2026",
    title: "Motion Cinematography Series",
    excerpt: "Transitioning still photographic frames into kinetic motion stories. Explore the latest 4K visual studies on YouTube.",
    category: "Video Works",
    href: "/videos",
  },
  {
    slug: "canonical-digital-platform-launch",
    date: "August 15, 2026",
    title: "Official Digital Hub Established",
    excerpt: "Launching the canonical web presence at ninakurainservices.in to host original high-resolution photography and video archives.",
    category: "Platform News",
    href: "/about",
  },
];

const FAQS = [
  {
    q: "Who is Nina Kurain?",
    a: "Nina Kurain is an independent Digital Creator known for fine-art photography, contemporary fashion styling, and atmospheric studio cinematography.",
  },
  {
    q: "What is the official website of Nina Kurain?",
    a: "The sole official and canonical online home of Nina Kurain is https://ninakurainservices.in/. All verified profile information, photographic series, and official channels are published here.",
  },
  {
    q: "What creative disciplines does Nina Kurain focus on?",
    a: "Nina specializes in studio portraiture, chiaroscuro lighting design, 4K motion stories, contemporary fashion styling, and visual creative direction.",
  },
  {
    q: "What camera gear and optical systems are utilized in Nina Kurain's studio?",
    a: "Productions utilize high-resolution full-frame mirrorless camera bodies paired primarily with 85mm f/1.4 and 50mm f/1.2 prime optics. Directional lighting setups combine parabolic softboxes with negative obsidian fill flags for disciplined contrast and natural skin texture.",
  },
  {
    q: "Are the photographs in the archive real human photography or AI generated?",
    a: "100% authentic human photography. Every frame across the 51 studio collections captures real human subjects, authentic handloom textiles, and genuine studio illumination without synthetic AI imagery or face replacement.",
  },
  {
    q: "Where can I view Nina Kurain's photography and video portfolio?",
    a: "Her official photographic portfolio is accessible at https://ninakurainservices.in/photos/ and her video motion essays at https://ninakurainservices.in/videos/.",
  },
  {
    q: "What is the difference between the public gallery and the VIP patron membership?",
    a: "The public gallery showcases Nina's curated fine-art and editorial portfolio freely. Membership provides exclusive access to high-quality photo and video archives, behind-the-scenes clips, and direct creator updates.",
  },
  {
    q: "How can brands and media outlets submit collaboration inquiries?",
    a: "Partnership, editorial licensing, and booking inquiries can be submitted directly via https://ninakurainservices.in/collaborations/ or https://ninakurainservices.in/contact/.",
  },
];

export function PublicHomepage({
  signedIn,
  settings,
  socials,
  photos,
  videos,
  updates,
}: PublicHomepageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [inquirySent, setInquirySent] = useState(false);

  const displayPhotos = photos && photos.length > 0 ? photos : FEATURED_PHOTOS;
  const displayVideos = videos && videos.length > 0 ? videos : VIDEOS;
  const displayUpdates = updates && updates.length > 0 ? updates : UPDATES;

  const creatorName = settings?.name || NINA_ENTITY.name;
  const creatorTitle = settings?.title || NINA_ENTITY.jobTitle;
  const creatorSubheading = settings?.subheading || "Where light surrenders to shadow.";
  const creatorBio =
    settings?.bio ||
    "Intimate fine-art portraiture, sculpted chiaroscuro, and unhurried visual cinema. Enter the definitive private archives and contemporary visual world of Nina Kurain.";
  const heroImage = settings?.heroImage || "/nina-landing-hero.png";

  const instagramUrl = socials?.instagram || NINA_ENTITY.instagramUrl;
  const youtubeUrl = socials?.youtube || NINA_ENTITY.youtubeUrl;
  const facebookUrl = socials?.facebook || NINA_ENTITY.facebookUrl;
  const pinterestUrl = socials?.pinterest || NINA_ENTITY.pinterestUrl;

  return (
    <div className="public-page-wrapper sensual-ambient-theme">
      {/* Haute-Couture Cinematic Welcome Reveal */}
      <CinematicIntro
        autoPlay={true}
        creatorName={creatorName}
        creatorBio={creatorBio}
        creatorSubheading={creatorSubheading}
        heroImage={heroImage}
      />

      {/* Seductive Ambient Light Blooms (Mobile-First CSS GPU-accelerated) */}
      <div className="seductive-ambient-glow orb-1" aria-hidden="true" />
      <div className="seductive-ambient-glow orb-2" aria-hidden="true" />
      <div className="seductive-ambient-glow orb-3" aria-hidden="true" />
      <PublicHeader />

      <main id="main-content">
        {/* =================================================================
            1. SEDUCTIVE HAUTE-COUTURE HERO (Mobile-First Editorial)
            ================================================================= */}
        <section className="seductive-hero-container" aria-label={`${creatorName} Introduction`}>
          <div className="seductive-hero-grid">
            <div className="seductive-hero-content">
              <div className="seductive-beacon">
                <span className="seductive-beacon-dot" />
                <span>PRIVATE ARCHIVES ONLINE · 2026 COLLECTION</span>
              </div>

              <h1 className="seductive-title">
                {creatorName}
                <em>{creatorSubheading}</em>
              </h1>

              <p className="seductive-subtitle">
                {creatorBio}
              </p>

              <div className="seductive-cta-cluster">
                <a
                  href="https://vip.ninakurainservices.in/signup"
                  className="seductive-btn-primary"
                >
                  <Sparkles size={16} />
                  <span>Enter Private Sanctuary</span>
                </a>

                <Link
                  href="/lookbook"
                  className="seductive-btn-glass"
                >
                  <Camera size={15} />
                  <span>Explore Lookbook</span>
                </Link>

                <button
                  type="button"
                  onClick={() => replayCinematicIntro()}
                  className="seductive-btn-glass"
                  title="Watch Introduction Presentation"
                >
                  <Play size={14} />
                  <span>Watch Intro</span>
                </button>

                <a
                  href="https://vip.ninakurainservices.in/login"
                  className="seductive-link-discrete"
                  title="Existing VIP Sign In"
                >
                  <LockKeyhole size={13} />
                  <span>VIP Member Sign In</span>
                </a>
              </div>

              <div className="seductive-social-row">
                <span className="seductive-social-label">Connect:</span>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="seductive-social-link">
                  <InstagramIcon size={12} />
                  <span>Instagram</span>
                </a>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="seductive-social-link">
                  <YoutubeIcon size={12} />
                  <span>YouTube</span>
                </a>
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="seductive-social-link">
                  <FacebookIcon size={12} />
                  <span>Facebook</span>
                </a>
                <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="seductive-social-link">
                  <PinterestIcon size={12} />
                  <span>Pinterest</span>
                </a>
              </div>
            </div>

            <div className="seductive-hero-media" aria-label={`${creatorName} Official Opening Portrait`}>
              <div className="seductive-portrait-wrap">
                <Image
                  src="/nina-landing-hero.png"
                  alt={`${creatorName} — Digital Creator Official Opening`}
                  width={720}
                  height={900}
                  priority
                />
                <div className="seductive-portrait-fade" />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            2. THE LOOKBOOK — VISUAL HAUTE-COUTURE SPREAD
            ================================================================= */}
        <section className="editorial-lookbook-section" id="lookbook-suites">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CURATED ARCHIVAL LOOKBOOK</span>
              <h2>Atmospheres of Desire</h2>
              <p>
                Four signature visual studies defining Nina Kurain&apos;s aesthetic world: handloom textures, monochromatic portraiture, natural light, and everyday creative moments.
              </p>
            </div>
            <Link href="/lookbook" className="section-action-link">
              <span>View Full Lookbook</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="editorial-lookbook-grid">
            <Link href="/photos?look=chiaroscuro-silk" className="editorial-lookbook-card">
              <div className="editorial-card-bg">
                <Image
                  src="/nina-gallery/nina-kurain-22.jpeg"
                  alt="Nina Kurain — Chiaroscuro & Silk"
                  width={480}
                  height={640}
                  loading="lazy"
                />
              </div>
              <div className="editorial-card-scrim" />
              <div className="editorial-card-content">
                <span className="editorial-card-num">Look 01</span>
                <h3 className="editorial-card-title">Chiaroscuro &amp; Silk</h3>
                <p className="editorial-card-desc">
                  Traditional South Asian handlooms sculpted in solitary directional studio darkness.
                </p>
                <span className="editorial-card-cta">
                  Explore 16 Frames <ArrowRight size={12} />
                </span>
              </div>
            </Link>

            <Link href="/photos?look=monochrome-reverie" className="editorial-lookbook-card">
              <div className="editorial-card-bg">
                <Image
                  src="/nina-gallery/nina-kurain-21.jpeg"
                  alt="Nina Kurain — Monochrome Reverie"
                  width={480}
                  height={640}
                  loading="lazy"
                />
              </div>
              <div className="editorial-card-scrim" />
              <div className="editorial-card-content">
                <span className="editorial-card-num">Look 02</span>
                <h3 className="editorial-card-title">Monochrome Reverie</h3>
                <p className="editorial-card-desc">
                  High-contrast black-and-white studies exploring pure silhouette and tactile tension.
                </p>
                <span className="editorial-card-cta">
                  Explore 12 Frames <ArrowRight size={12} />
                </span>
              </div>
            </Link>

            <Link href="/photos?look=boudoir-whisper" className="editorial-lookbook-card">
              <div className="editorial-card-bg">
                <Image
                  src="/nina-gallery/nina-kurain-36.jpeg"
                  alt="Nina Kurain — The Boudoir Whisper"
                  width={480}
                  height={640}
                  loading="lazy"
                />
              </div>
              <div className="editorial-card-scrim" />
              <div className="editorial-card-content">
                <span className="editorial-card-num">Look 03</span>
                <h3 className="editorial-card-title">The Boudoir Whisper</h3>
                <p className="editorial-card-desc">
                  Sun-drenched natural illumination capturing organic skin glow and candid pauses.
                </p>
                <span className="editorial-card-cta">
                  Explore 14 Frames <ArrowRight size={12} />
                </span>
              </div>
            </Link>

            <Link href="/photos?look=avant-garde-velvet" className="editorial-lookbook-card">
              <div className="editorial-card-bg">
                <Image
                  src="/nina-gallery/nina-kurain-39.jpeg"
                  alt="Nina Kurain — Avant-Garde Velvet"
                  width={480}
                  height={640}
                  loading="lazy"
                />
              </div>
              <div className="editorial-card-scrim" />
              <div className="editorial-card-content">
                <span className="editorial-card-num">Look 04</span>
                <h3 className="editorial-card-title">Avant-Garde Velvet</h3>
                <p className="editorial-card-desc">
                  Modern tailored velvet meeting heritage drapes in high-fashion editorial styling.
                </p>
                <span className="editorial-card-cta">
                  Explore 9 Frames <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* =================================================================
            3. BEHIND CLOSED DOORS — THE PRIVATE SANCTUARY
            ================================================================= */}
        <section className="seductive-sanctuary-wrap" id="vip-hub">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CONFIDENTIAL ACCESS</span>
              <h2>Behind Closed Doors</h2>
              <p>
                Where the public exhibition ends, membership begins. An invitation to behind-the-scenes stories, new hangout drops, and direct creator updates.
              </p>
            </div>
            <a
              href="https://vip.ninakurainservices.in"
              className="section-action-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Explore VIP Portal</span>
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="sanctuary-feature-card">
            <div className="sanctuary-visual-pane">
              <Image
                src="/nina-gallery/nina-kurain-30.jpeg"
                alt="Nina Kurain — Confidential Sanctuary Teaser"
                width={700}
                height={875}
                loading="lazy"
              />
              <div className="sanctuary-visual-veil">
                <div className="sanctuary-lock-beacon">
                  <LockKeyhole size={28} />
                </div>
                <div className="sanctuary-veil-text">
                  <strong>Behind Closed Doors</strong>
                  <span>Confidential Sanctuary Archives</span>
                </div>
              </div>
            </div>

            <div className="sanctuary-content-pane">
              <span className="sanctuary-kicker">MEMBERS-ONLY SANCTUARY</span>
              <h2>Enter Nina&apos;s Private Circle</h2>
              <p>
                Verified members unlock high-resolution photography, behind-the-scenes cinema, creator notes, and private community updates delivered discreetly.
              </p>

              <div className="sanctuary-action-row">
                <a
                  href="https://vip.ninakurainservices.in/signup"
                  className="seductive-btn-primary"
                >
                  <Sparkles size={16} />
                  <span>Claim Complimentary VIP Pass</span>
                </a>

                <a
                  href="https://vip.ninakurainservices.in/login"
                  className="seductive-btn-glass"
                >
                  <LockKeyhole size={14} />
                  <span>VIP Member Sign In</span>
                </a>
              </div>

              <div className="sanctuary-app-chips">
                <span style={{ fontSize: "11px", color: "var(--nk-text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                  Native App:
                </span>
                <a
                  href="/downloads/NinaKurain.apk"
                  download="NinaKurain.apk"
                  className="sanctuary-app-chip"
                  title="Download Member Android APK"
                >
                  <Smartphone size={13} style={{ color: "var(--nk-rose-light)" }} />
                  <span>VIP Android APK ({APP_VERSION_DISPLAY})</span>
                </a>
                <a
                  href="/downloads/NinaKurain.mobileconfig"
                  download="NinaKurain.mobileconfig"
                  className="sanctuary-app-chip"
                  title="Install VIP iOS Profile"
                >
                  <Apple size={13} style={{ color: "var(--nk-rose-light)" }} />
                  <span>iOS VIP Profile</span>
                </a>
                <a
                  href="/downloads/NinaKurain.ipa"
                  download="NinaKurain.ipa"
                  className="sanctuary-app-chip"
                  title="Download Member iOS IPA"
                >
                  <Download size={13} />
                  <span>Member .IPA</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            4. THE ART OF ALLURE — EDITORIAL DOUBLE-SPREAD
            ================================================================= */}
        <section className="seductive-allure-wrap" id="methodology">
          <div className="allure-editorial-split">
            <div className="allure-quote-box">
              <blockquote className="allure-quote-text">
                &ldquo;Sensuality is not loud. It is the lingering silence between two breaths, the curve of a shadow across bare silk.&rdquo;
              </blockquote>
              <span className="allure-quote-author">— Nina Kurain, Digital Creator</span>
            </div>

            <div className="allure-pillars-stack">
              <article className="allure-pillar-item">
                <span className="allure-pillar-num">01</span>
                <div>
                  <h3>Sculpted Chiaroscuro</h3>
                  <p>
                    Directional single-source studio illumination designed to caress collarbones, bare silhouettes, and microscopic silk textures.
                  </p>
                </div>
              </article>

              <article className="allure-pillar-item">
                <span className="allure-pillar-num">02</span>
                <div>
                  <h3>Tactile Authenticity</h3>
                  <p>
                    100% authentic human photography. Uncompressed raw textures, natural skin tones, and rich South Asian handloom textiles with zero synthetic smoothing.
                  </p>
                </div>
              </article>

              <article className="allure-pillar-item">
                <span className="allure-pillar-num">03</span>
                <div>
                  <h3>Slow Sensory Cinema</h3>
                  <p>
                    Hypnotic 4K motion studies honoring breath, lingering movement, and unhurried visual sensuality without frantic modern distractions.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =================================================================
            5. CONTINUOUS PHOTOGRAPHIC ARCHIVE STREAM
            ================================================================= */}
        <section className="public-section" id="photography">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">AUTHENTIC PHOTOGRAPHY ARCHIVE</span>
              <h2>Photographic Collections</h2>
              <p>
                Explore Nina Kurain&apos;s photographic series and fine-art portraiture archives in high resolution. Archival frames stream continuously.
              </p>
            </div>
            <Link href="/photos" className="section-action-link">
              <span>Enter Photography Gallery</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <AutoHorizontalGallery photos={displayPhotos} />
        </section>

        {/* =================================================================
            5. CREATOR UPDATES & DISPATCHES
            ================================================================= */}
        <section className="public-section" id="updates">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">DISPATCHES &amp; JOURNAL</span>
              <h2>Creator Updates</h2>
              <p>
                Recent portfolio releases, creative notes, and project dispatches from Nina Kurain.
              </p>
            </div>
            <Link href="/updates" className="section-action-link">
              <span>View All Updates</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="updates-grid">
            {displayUpdates.slice(0, 3).map((update, i) => (
              <Link key={update.slug || i} href={update.href} className="update-card">
                <span className="update-date">{update.date} • {update.category}</span>
                <h3>{update.title}</h3>
                <p>{update.excerpt}</p>
                <span className="update-arrow">
                  <span>Read update</span>
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* =================================================================
            6. OFFICIAL SOCIAL PROFILES
            ================================================================= */}
        <section className="public-section" id="socials">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CONNECTED PROFILES</span>
              <h2>Official Social Channels</h2>
              <p>
                Follow daily stories, visual reels, and creative photography across verified profiles.
              </p>
            </div>
            <Link href="/socials" className="section-action-link">
              <span>View All Profiles</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="social-platforms-grid">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
            >
              <div className="social-icon-wrapper">
                <InstagramIcon size={24} />
              </div>
              <strong>Instagram</strong>
              <span>@kurain.bae</span>
              <span className="social-badge">Daily Stories &amp; Visuals</span>
            </a>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
            >
              <div className="social-icon-wrapper">
                <YoutubeIcon size={24} />
              </div>
              <strong>YouTube</strong>
              <span>Official Channel</span>
              <span className="social-badge">Motion &amp; 4K Films</span>
            </a>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
            >
              <div className="social-icon-wrapper">
                <FacebookIcon size={24} />
              </div>
              <strong>Facebook</strong>
              <span>Nina Kurain Official</span>
              <span className="social-badge">Community &amp; Updates</span>
            </a>

            <a
              href={pinterestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
            >
              <div className="social-icon-wrapper">
                <PinterestIcon size={24} />
              </div>
              <strong>Pinterest</strong>
              <span>@NinaKurain</span>
              <span className="social-badge">Visual Moodboards</span>
            </a>
          </div>
        </section>

        {/* =================================================================
            7. COLLABORATIONS & INQUIRIES
            ================================================================= */}
        <section className="public-section" id="collaborations">
          <div className="collab-container">
            <div className="collab-info">
              <span className="section-kicker">CREATIVE PARTNERSHIPS</span>
              <h2>Collaborate With Nina Kurain</h2>
              <p>
                Nina collaborates with brands, designers, and creative teams on select projects
                aligning with thoughtful visual direction and aesthetic integrity.
              </p>

              <div className="collab-categories">
                <div className="collab-tag"><span /> Fashion &amp; Editorial</div>
                <div className="collab-tag"><span /> Visual Direction</div>
                <div className="collab-tag"><span /> Brand Collaborations</div>
                <div className="collab-tag"><span /> Photography Licensing</div>
              </div>

              <div className="workflow-grid" style={{ marginTop: 24 }}>
                <div className="workflow-card">
                  <div className="workflow-num">01</div>
                  <h3>Brief &amp; Scope</h3>
                  <p>Alignment on brand aesthetic, color palette, moodboards, and usage rights.</p>
                </div>
                <div className="workflow-card">
                  <div className="workflow-num">02</div>
                  <h3>Styling Direction</h3>
                  <p>Handloom textile curation and accessory pairing directed by Nina.</p>
                </div>
                <div className="workflow-card">
                  <div className="workflow-num">03</div>
                  <h3>Studio Production</h3>
                  <p>High-resolution stills and 4K cinema capture under tailored chiaroscuro lighting.</p>
                </div>
                <div className="workflow-card">
                  <div className="workflow-num">04</div>
                  <h3>Master Delivery</h3>
                  <p>Color-graded deliverables, uncompressed RAW/ProRes outputs, and full licensing.</p>
                </div>
              </div>
            </div>

            <div className="collab-form">
              {inquirySent ? (
                <div className="collab-success">
                  <CheckCircle2 size={32} style={{ color: "#34d399", margin: "0 auto 12px" }} />
                  <h3>Inquiry Received</h3>
                  <p>Thank you for reaching out. We will review your proposal and respond promptly.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setInquirySent(true);
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="collab-name">Your Name / Organization</label>
                    <input
                      id="collab-name"
                      type="text"
                      required
                      placeholder="e.g. Studio Director / Brand Lead"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label htmlFor="collab-email">Business Email</label>
                    <input
                      id="collab-email"
                      type="email"
                      required
                      placeholder="contact@brand.com"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label htmlFor="collab-msg">Collaboration Proposal</label>
                    <textarea
                      id="collab-msg"
                      required
                      placeholder="Tell us about the project, creative vision, and timeline..."
                      className="form-textarea"
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: 16, width: "100%" }}>
                    <span>Submit Collaboration Inquiry</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* =================================================================
            7B. OFFICIAL FACTSHEET & ENTITY METRICS
            ================================================================= */}
        <section className="public-section" id="factsheet">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">VERIFIED CREATOR METRICS</span>
              <h2>Official Factsheet &amp; Credentials</h2>
              <p>
                Key documentation, canonical web identity, and archival statistics for Nina Kurain.
              </p>
            </div>
            <Link href="/wiki" className="section-action-link">
              <span>View Wiki Dossier</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="factsheet-box">
            <div className="factsheet-grid">
              <div className="factsheet-item">
                <small>Creator &amp; Entity</small>
                <strong>Nina Kurain</strong>
              </div>
              <div className="factsheet-item">
                <small>Official Occupation</small>
                <strong>Digital Creator • Visual Artist</strong>
              </div>
              <div className="factsheet-item">
                <small>Canonical Home</small>
                <strong style={{ wordBreak: "break-all" }}>ninakurainservices.in</strong>
              </div>
              <div className="factsheet-item">
                <small>Active Studio Archive</small>
                <strong>51 High-Resolution Frames</strong>
              </div>
              <div className="factsheet-item">
                <small>Core Aesthetic</small>
                <strong>Chiaroscuro &amp; Ethnic Styling</strong>
              </div>
              <div className="factsheet-item">
                <small>Primary Camera Optics</small>
                <strong>85mm f/1.4 &amp; 50mm f/1.2 Primes</strong>
              </div>
              <div className="factsheet-item">
                <small>Artistic Authenticity</small>
                <strong>100% Real Human Photography</strong>
              </div>
              <div className="factsheet-item">
                <small>Licensing &amp; Inquiries</small>
                <strong>contact@ninakurainservices.in</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            8. CREATOR FAQ
            ================================================================= */}
        <section className="public-section" id="faq">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
            <div className="section-head-copy" style={{ margin: "0 auto" }}>
              <span className="section-kicker">QUESTIONS &amp; ANSWERS</span>
              <h2>Frequently Asked Questions</h2>
              <p>Key information regarding Nina Kurain, photographic licensing, and collaborations.</p>
            </div>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="faq-item"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  style={{ cursor: "pointer" }}
                >
                  <h3>
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                        color: "var(--nk-rose)",
                      }}
                    />
                  </h3>
                  {isOpen && <p>{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================
            10. PATRON & MEMBERS ACCESS (Subtle Neutral Callout)
            ================================================================= */}
        <div className="vip-banner-wrap">
          <div className="vip-banner">
            <div className="vip-banner-content">
              <h3>Patron &amp; Member Access</h3>
              <p>
                Interested in supporting independent creative productions and viewing extended private archives?
              </p>
            </div>
            <div className="vip-banner-action">
              <a
                href={socials?.vipUrl || "https://vip.ninakurainservices.in/"}
                className="vip-banner-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Member Portal</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter settings={{ ...settings, ...socials }} />
    </div>
  );
}
