"use client";

import Link from "@/components/site-link";
import Image from "next/image";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
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
    a: "The public gallery showcases Nina's curated fine-art and editorial portfolio freely. The VIP patron membership provides exclusive access to uncompressed 4K master archives, intimate boudoir drops, private behind-the-scenes cinema clips, and direct creator updates.",
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
  const creatorSubheading = settings?.subheading || "Visual Storyteller • Contemporary Photography & Direction";
  const creatorBio =
    settings?.bio ||
    "Nina Kurain is an independent Digital Creator exploring the intersections of editorial portraiture, contemporary fashion styling, and cinematic motion.";

  const instagramUrl = socials?.instagram || NINA_ENTITY.instagramUrl;
  const youtubeUrl = socials?.youtube || NINA_ENTITY.youtubeUrl;
  const facebookUrl = socials?.facebook || NINA_ENTITY.facebookUrl;
  const pinterestUrl = socials?.pinterest || NINA_ENTITY.pinterestUrl;

  return (
    <div className="public-page-wrapper">
      <PublicHeader />

      <main id="main-content">
        {/* =================================================================
            1. HERO SECTION: Focused Entity Identity
            ================================================================= */}
        <section className="creator-hero" aria-label={`${creatorName} Introduction`}>
          <div className="creator-hero-copy">
            <div className="creator-eyebrow">
              <span className="eyebrow-line" />
              <span>OFFICIAL CREATOR WEBSITE</span>
            </div>

            <h1>
              {creatorName}
              <em>{creatorTitle}</em>
            </h1>

            <p className="creator-subtitle">
              {creatorSubheading}
            </p>

            <p className="creator-bio-p">
              {creatorBio}
            </p>

            <div className="creator-hero-actions">
              <Link href="/photos" className="btn-primary">
                <Camera size={15} />
                <span>View Photography</span>
              </Link>

              <Link href="/about" className="btn-secondary">
                <User size={15} />
                <span>About Nina Kurain</span>
              </Link>

              <Link href="/videos" className="btn-secondary">
                <Film size={15} />
                <span>Watch Videos</span>
              </Link>
            </div>

            <div className="creator-social-pills">
              <span>Official Profiles:</span>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="social-pill">
                <InstagramIcon size={13} />
                <span>Instagram</span>
              </a>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-pill">
                <YoutubeIcon size={13} />
                <span>YouTube</span>
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="social-pill">
                <FacebookIcon size={13} />
                <span>Facebook</span>
              </a>
              <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="social-pill">
                <PinterestIcon size={13} />
                <span>Pinterest</span>
              </a>
            </div>
          </div>

          <div className="creator-hero-media" aria-label={`${creatorName} Official Opening Portrait`}>
            <div className="hero-portrait-frame">
              <Image
                src="/nina-landing-hero.png"
                alt={`${creatorName} — Digital Creator Official Opening`}
                width={720}
                height={900}
                priority
                className="hero-portrait-img"
              />
              <div className="hero-portrait-overlay" />
            </div>
            <div className="hero-floating-badge badge-top">
              <span className="badge-pulse-dot" />
              <div className="badge-text">
                <strong>OFFICIAL OPENING</strong>
                <small>{creatorTitle.toUpperCase()} · 2026</small>
              </div>
            </div>
            <div className="hero-floating-badge badge-bottom">
              <Sparkles size={14} style={{ color: "var(--nk-rose-light)" }} />
              <div className="badge-text">
                <strong>AUTHENTIC CREATOR ARCHIVE</strong>
                <small>NINAKURAINSERVICES.IN</small>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            2. ABOUT NINA KURAIN PREVIEW
            ================================================================= */}
        <section className="public-section" id="about-preview">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CREATOR FOCUS</span>
              <h2>About Nina Kurain</h2>
              <p>
                Nina Kurain is a digital creator combining cinematic lighting, fine-art portraiture,
                and contemporary visual storytelling.
              </p>
            </div>
            <Link href="/about" className="section-action-link">
              <span>Read Full Profile</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="about-preview-showcase">
            <div className="about-preview-portrait">
              <div className="about-portrait-card">
                <Image
                  src="/nina-gallery/nina-kurain-30.jpeg"
                  alt="Nina Kurain — Digital Creator Portrait Frame 30"
                  width={600}
                  height={750}
                  className="about-portrait-img"
                  loading="lazy"
                />
                <div className="about-portrait-scrim" />
                <div className="about-portrait-badge">
                  <Sparkles size={13} style={{ color: "var(--nk-rose-light)", flexShrink: 0 }} />
                  <div>
                    <strong>Nina Kurain</strong>
                    <span>Studio Archive · Frame 30</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-preview-content">
              <div className="about-statement-box">
                <p className="about-quote">
                  &ldquo;Every photograph is conceived as a visual narrative — disciplined in shadow, natural in tone, and unapologetically authentic in aesthetic direction.&rdquo;
                </p>
                <span className="about-byline">— Nina Kurain, Digital Creator</span>
              </div>

              <div className="about-pillars-stack">
                <article className="about-pillar-item">
                  <div className="about-pillar-icon"><Camera size={20} /></div>
                  <div>
                    <h3>Editorial Photography</h3>
                    <p>
                      Meticulous studio illumination, natural skin tones, and texture depth captured across 51 archival frames.
                    </p>
                  </div>
                </article>

                <article className="about-pillar-item">
                  <div className="about-pillar-icon"><Film size={20} /></div>
                  <div>
                    <h3>Visual Cinematography</h3>
                    <p>
                      Motion studies, reels, and visual essays focusing on movement, fabric flow, and atmospheric pacing.
                    </p>
                  </div>
                </article>

                <article className="about-pillar-item">
                  <div className="about-pillar-icon"><Palette size={20} /></div>
                  <div>
                    <h3>Creative Direction</h3>
                    <p>
                      Bespoke styling concepts blending modern minimalism with classic ethnic elegance for editorial and brand features.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            2B. STUDIO METHODOLOGY & OPTICAL ARCHITECTURE
            ================================================================= */}
        <section className="public-section" id="methodology">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">OPTICAL PRECISION &amp; CRAFT</span>
              <h2>Studio Methodology &amp; Visual Architecture</h2>
              <p>
                Behind every frame lies a disciplined commitment to high-transmission prime optics, controlled chiaroscuro illumination, and authentic human presence.
              </p>
            </div>
            <Link href="/creator-tips" className="section-action-link">
              <span>Explore Studio Guide</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="info-highlight-grid">
            <article className="info-feature-card">
              <div className="info-card-icon"><Camera size={22} /></div>
              <h3>Prime Optical Separation</h3>
              <p>
                Captured primarily on 85mm f/1.4 and 50mm f/1.2 prime glass, ensuring microscopic fabric detail, gentle focus falloff, and true-to-life spatial compression.
              </p>
            </article>

            <article className="info-feature-card">
              <div className="info-card-icon"><Sliders size={22} /></div>
              <h3>Directional Chiaroscuro</h3>
              <p>
                Sculpted using single-point directional softboxes and obsidian negative fill flags, intentionally embracing deep shadows to reveal sculptural bone structure.
              </p>
            </article>

            <article className="info-feature-card">
              <div className="info-card-icon"><Palette size={22} /></div>
              <h3>Organic Filmic Grading</h3>
              <p>
                Custom color science calibrated specifically for warm South Asian skin tones, highlighting jewel-toned handloom weaves with antique copper and plum undertones.
              </p>
            </article>

            <article className="info-feature-card">
              <div className="info-card-icon"><Film size={22} /></div>
              <h3>Kinetic Pacing &amp; Stillness</h3>
              <p>
                Motion studies shot at 4K 60fps honoring slow-cinema rhythm, fluid fabric drape, and subtle micro-expressions rather than frantic fast-paced cuts.
              </p>
            </article>
          </div>
        </section>

        {/* =================================================================
            3. FEATURED PHOTOGRAPHY (Auto Horizontal Scrolling Showcase)
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
            3B. CURATED VISUAL SUITES & THEMES
            ================================================================= */}
        <section className="public-section" id="suites">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CURATED SERIES CATALOG</span>
              <h2>Archival Themes &amp; Aesthetic Suites</h2>
              <p>
                An overview of the four signature creative motifs defining Nina Kurain&apos;s photographic archive.
              </p>
            </div>
            <Link href="/lookbook" className="section-action-link">
              <span>View Full Lookbook</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="info-highlight-grid">
            <Link href="/photos" className="info-feature-card" style={{ textDecoration: "none" }}>
              <div className="info-card-icon"><Layers size={22} /></div>
              <h3>I. Chiaroscuro Sarees</h3>
              <p>
                Traditional South Asian handlooms and Kanchipuram silks rendered in dramatic low-key studio lighting with deep obsidian backgrounds.
              </p>
              <span style={{ fontSize: "12px", color: "var(--nk-rose)", fontWeight: 700, marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
                Explore 16 Frames <ArrowRight size={12} />
              </span>
            </Link>

            <Link href="/photos" className="info-feature-card" style={{ textDecoration: "none" }}>
              <div className="info-card-icon"><Sparkles size={22} /></div>
              <h3>II. Minimalist Monochromes</h3>
              <p>
                High-contrast black-and-white studies focusing on pure silhouette, tactile cotton textures, and intimate emotional tension.
              </p>
              <span style={{ fontSize: "12px", color: "var(--nk-rose)", fontWeight: 700, marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
                Explore 12 Frames <ArrowRight size={12} />
              </span>
            </Link>

            <Link href="/photos" className="info-feature-card" style={{ textDecoration: "none" }}>
              <div className="info-card-icon"><Camera size={22} /></div>
              <h3>III. Golden Hour Ambient</h3>
              <p>
                Warm, sun-drenched natural illumination capturing organic skin glow, sheer organza fabrics, and effortless candid pauses.
              </p>
              <span style={{ fontSize: "12px", color: "var(--nk-rose)", fontWeight: 700, marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
                Explore 14 Frames <ArrowRight size={12} />
              </span>
            </Link>

            <Link href="/photos" className="info-feature-card" style={{ textDecoration: "none" }}>
              <div className="info-card-icon"><Award size={22} /></div>
              <h3>IV. Contemporary High-Fashion</h3>
              <p>
                Avant-garde ethnic fusions, tailored velvet blazers with heritage drapes, and modern editorial styling concepts.
              </p>
              <span style={{ fontSize: "12px", color: "var(--nk-rose)", fontWeight: 700, marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
                Explore 9 Frames <ArrowRight size={12} />
              </span>
            </Link>
          </div>
        </section>

        {/* =================================================================
            4. VIDEOS & CINEMATOGRAPHY (Media-Free Motion Directory)
            ================================================================= */}
        <section className="public-section" id="videos">
          <div className="section-head reveal-on-scroll">
            <div className="section-head-copy">
              <span className="section-kicker">MOTION &amp; CINEMA DIRECTORY</span>
              <h2>Creator Videos &amp; Cinematography</h2>
              <p>
                Visual essays, studio cinematography vignettes, and motion series. View the complete visual cinema archive on the dedicated video hub or YouTube.
              </p>
            </div>
            <Link href="/videos" className="section-action-link">
              <span>Watch All Videos</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="video-directory-grid">
            {displayVideos.slice(0, 3).map((video) => (
              <div key={video.id} className="video-directory-card">
                <div className="video-directory-badge">
                  <Film size={14} />
                  <span>{video.meta}</span>
                </div>
                <h3>{video.title}</h3>
                <p>{video.desc}</p>
                <div className="video-directory-actions">
                  <Link href="/videos" className="btn-secondary" style={{ fontSize: "12.5px", padding: "7px 16px" }}>
                    <Play size={13} />
                    <span>Watch Video</span>
                  </Link>
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-sub-link"
                  >
                    <YoutubeIcon size={13} />
                    <span>YouTube</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
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
            9. PATRON & MEMBERS ACCESS (Subtle Neutral Callout)
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
