"use client";

import Image from "next/image";
import Link from "@/components/site-link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { HorizontalScrollGallery } from "@/components/horizontal-scroll-gallery";
import { AutoMarqueeShowcase } from "@/components/auto-marquee-showcase";
import {
  Camera,
  Film,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Mail,
  CheckCircle2,
  ChevronDown,
  Layers,
  Heart,
  Eye,
  Sliders,
  Share2,
  Lock,
  Play,
  X,
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,

  PinterestIcon,
} from "@/components/social-icons";
import { useState } from "react";

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
  };
  photos?: Array<{
    slug: string;
    title: string;
    tag: string;
    caption: string;
    image: string;
    category?: string;
    isPremium?: boolean;
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
    slug: "nina-kurain-official-portrait",
    title: "Official Portraiture",
    tag: "Free Demo",
    caption: "The definitive studio portrait of Nina Kurain, capturing minimalist elegance and editorial depth.",
    image: "/nina-kurain-official-portrait.webp",
    dimensions: "1200 x 1600",
    category: "Portraits",
    isPremium: false,
  },
  {
    slug: "nina-kurain-digital-creator",
    title: "Digital Artistry & Vision",
    tag: "Free Demo",
    caption: "Contemporary visual direction blending haute couture styling with digital creator storytelling.",
    image: "/nina-kurain-digital-creator.webp",
    dimensions: "1200 x 1600",
    category: "Creative Direction",
    isPremium: false,
  },
  {
    slug: "nina-kurain-fashion-editorial",
    title: "Haute Couture Editorial",
    tag: "VIP Locked",
    caption: "Dramatic monochrome and high-fashion silhouettes exploring form, light, and studio composition.",
    image: "/nina-kurain-editorial-portrait.webp",
    dimensions: "1200 x 1600",
    category: "Fashion & Modeling",
    isPremium: true,
  },
  {
    slug: "nina-kurain-studio-portrait",
    title: "Studio Light Study",
    tag: "VIP Locked",
    caption: "An intimate exploration of warm chiaroscuro lighting and timeless portrait aesthetics.",
    image: "/nina-kurain-studio-portrait.webp",
    dimensions: "1080 x 1440",
    category: "Studio Photography",
    isPremium: true,
  },
  {
    slug: "nina-kurain-creator-photoshoot",
    title: "Creator In Motion",
    tag: "VIP Locked",
    caption: "Behind the lens during a concept session exploring kinetic energy and editorial fashion.",
    image: "/nina-kurain-creator-photoshoot.webp",
    dimensions: "1086 x 1448",
    category: "Creative Series",
    isPremium: true,
  },
  {
    slug: "nina-kurain-fashion-portrait",
    title: "Modern Elegance",
    tag: "VIP Locked",
    caption: "Refined aesthetic expression showcasing understated glamour and distinctive personality.",
    image: "/nina-kurain-fashion-portrait.webp",
    dimensions: "1086 x 1448",
    category: "Fashion & Modeling",
    isPremium: true,
  },
];

const VIDEOS = [
  {
    id: "v1",
    title: "Haute Studio Cinematography — Reel 01",
    meta: "4K Motion Story • Studio Film",
    desc: "A rhythmic visual study of light, texture, and cinematic pacing directed and produced by Nina Kurain.",
    src: "/booty.mp4",
    poster: "/nina-kurain-official-portrait.webp",
    isPremium: false,
  },
  {
    id: "v2",
    title: "The Editorial Archive — Teaser",
    meta: "60fps Visual Teaser • Behind The Scenes",
    desc: "Glimpses into the creative process, studio lighting setup, and spontaneous moments during the shoot.",
    src: "/vid-2.mp4",
    poster: "/nina-kurain-editorial-portrait.webp",
    isPremium: true,
  },
  {
    id: "v3",
    title: "Kinetic Expression — Autumn Motion Study",
    meta: "4K Cinema Vault • Member Story",
    desc: "Exploring contemporary fashion movement, chiaroscuro illumination, and atmospheric cinematography.",
    src: "/vid-3.mp4",
    poster: "/nina-kurain-creator-photoshoot.webp",
    isPremium: true,
  },
];

const CREATOR_UPDATES = [
  {
    slug: "autumn-editorial-collection-2026",
    date: "September 2026",
    title: "Autumn Editorial Collection Premieres",
    excerpt: "New fine-art portrait collection exploring tonal harmonies, studio shadows, and seasonal aesthetics.",
    category: "Portfolio Release",
    href: "/photos",
  },
  {
    slug: "official-youtube-cinematography-series",
    date: "August 2026",
    title: "Official YouTube Cinematography Series",
    excerpt: "Launching weekly behind-the-scenes visual essays and creative direction breakdowns for fellow artists.",
    category: "Platform Expansion",
    href: "/videos",
  },
  {
    slug: "collaborations-autumn-2026",
    date: "July 2026",
    title: "Creator Collaborations Open for Autumn",
    excerpt: "Accepting select brand partnerships, luxury fashion lookbooks, and high-concept creative direction briefs.",
    category: "Partnerships",
    href: "/collaborations",
  },
];

const FAQS = [
  {
    q: "Who is Nina Kurain?",
    a: "Nina Kurain is a Digital Creator, model, and creative artist known for original photography, cinematic motion, editorial fashion, and creative direction.",
  },
  {
    q: "What is Nina Kurain's primary creative focus?",
    a: "Nina focuses on high-concept visual storytelling, fashion editorial photography, studio cinematography, and building an authentic digital creator ecosystem across social and web platforms.",
  },
  {
    q: "Is this the official website of Nina Kurain?",
    a: "Yes. https://ninakurainservices.in/ is the official, canonical online home of Nina Kurain. All verified creator updates, photography galleries, and collaboration inquiries originate here.",
  },
  {
    q: "How can brands or creators collaborate with Nina Kurain?",
    a: "Brands and creators can submit partnership proposals, editorial briefs, or licensing requests via the Collaborations page or direct contact form.",
  },
  {
    q: "What is the Private Creator Club?",
    a: "The Private Creator Club is an age-restricted (18+) member sanctuary located at vip.ninakurainservices.in, featuring private creator archives, exclusive sets, and direct patron access.",
  },
];

export function PublicHomepage({
  signedIn,
  displayName,
  settings,
  socials,
  photos: propPhotos,
  videos: propVideos,
  updates: propUpdates,
}: PublicHomepageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [inquirySent, setInquirySent] = useState(false);

  const displayPhotos = propPhotos && propPhotos.length > 0 ? propPhotos : FEATURED_PHOTOS;
  const displayVideos = propVideos && propVideos.length > 0 ? propVideos : VIDEOS;
  const displayUpdates = propUpdates && propUpdates.length > 0 ? propUpdates : CREATOR_UPDATES;


  const creatorName = settings?.name || "Nina Kurain";
  const creatorTitle = settings?.title || "Digital Creator";
  const creatorSubheading = settings?.subheading || "Model • Creative Artist • Visual Storyteller";
  const creatorBio = settings?.bio || "Welcome to the official online sanctuary of Nina Kurain. Explore high-resolution editorial photography, 4K cinematography, creator updates, and official social channels.";
  const heroImage = "/seductive-1.jpeg";

  const instagramUrl = socials?.instagram || "https://www.instagram.com/ninakurain";
  const youtubeUrl = socials?.youtube || "https://www.youtube.com/@ninakurain";
  const facebookUrl = socials?.facebook || "https://www.facebook.com/ninakurain";
  const pinterestUrl = socials?.pinterest || "https://www.pinterest.com/ninakurain";

  return (
    <div className="public-page-wrapper">
      <PublicHeader />

      <main id="main-content">
        {/* =================================================================
            1. HERO SECTION
            ================================================================= */}
        <section className="creator-hero" aria-label={`${creatorName} Introduction`}>
          <div className="creator-hero-copy">
            <div className="creator-eyebrow">
              <span className="eyebrow-line" />
              <span>OFFICIAL CREATOR ARCHIVE</span>
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
              <a
                href="https://vip.ninakurainservices.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ textDecoration: "none" }}
              >
                <span>Unlock VIP Sanctuary</span>
                <Lock size={15} />
              </a>

              <a
                href="#archive"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("archive")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-secondary"
              >
                <Film size={15} />
                <span>Running Media Teasers</span>
              </a>

              <a
                href="#photography"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("photography")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-secondary"
              >
                <Camera size={15} />
                <span>Photo Gallery</span>
              </a>
            </div>

            <div className="creator-social-pills">
              <span>Connect:</span>
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

          <div className="creator-hero-media">
            <div className="hero-portrait-frame">
              <Image
                src={heroImage}
                alt={`${creatorName} — ${creatorTitle} official portrait`}
                width={700}
                height={920}
                priority
                unoptimized={heroImage.startsWith("/api/")}
                className="hero-portrait-img"
              />
              <div className="hero-portrait-overlay" />
            </div>

            {/* Floating Live Badge */}
            <div className="hero-floating-badge badge-top">
              <span className="badge-pulse-dot" />
              <div className="badge-text">
                <strong>Active Digital Creator</strong>
                <small>OFFICIAL CANONICAL HUB</small>
              </div>
            </div>

            <div className="hero-floating-badge badge-bottom">
              <Sparkles size={18} style={{ color: "#e06086" }} />
              <div className="badge-text">
                <strong>Original Visuals &amp; Films</strong>
                <small>4K CINEMATOGRAPHY &amp; ART</small>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            AUTO HORIZONTAL SCROLLING MARQUEE: RUNNING VIDEOS & PHOTOS WITH LOCKS
            ================================================================= */}
        <AutoMarqueeShowcase signedIn={Boolean(signedIn)} />

        {/* =================================================================
            2. ABOUT NINA KURAIN PREVIEW
            ================================================================= */}
        <section className="public-section" id="about-preview">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">ENTITY BIOGRAPHY</span>
              <h2>About Nina Kurain</h2>
              <p>
                Nina Kurain is a modern digital creator and creative artist celebrated for combining
                cinematic elegance, fine-art portraiture, and contemporary digital storytelling.
              </p>
            </div>
            <Link href="/about" className="section-action-link">
              <span>Read Full Biography</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="benefit-grid">
            <article>
              <Camera size={28} />
              <h3>Editorial Photography</h3>
              <p>
                From meticulous studio lighting to outdoor natural-light collections, Nina creates
                striking imagery that commands attention across Google Images and editorial publications.
              </p>
            </article>

            <article>
              <Film size={28} />
              <h3>Visual Cinematography</h3>
              <p>
                Original slow-burn 4K studio films, reels, and video vignettes highlighting movement,
                atmosphere, and sophisticated artistic direction.
              </p>
            </article>

            <article>
              <Sparkles size={28} />
              <h3>Digital Artistry &amp; Culture</h3>
              <p>
                Building a unified entity footprint across Instagram, YouTube, Facebook, and Pinterest,
                connecting directly with a worldwide community of visual art enthusiasts.
              </p>
            </article>
          </div>
        </section>

        {/* =================================================================
        {/* =================================================================
            3. FEATURED PHOTOGRAPHY (Google Images & Photo Hub)
            ================================================================= */}
        <section className="public-section" id="photography">
          <HorizontalScrollGallery
            photos={displayPhotos}
            creatorName={creatorName}
            title="Featured Photography Portfolio"
            subtitle="Horizontal interactive showcase of official signature studio and editorial frames. Free demo works are viewable; VIP archive frames are locked for exclusive patrons."
            showViewAllLink={true}
          />
        </section>

        {/* =================================================================
            4. VIDEOS & CINEMATOGRAPHY
            ================================================================= */}
        <section className="public-section" id="videos">
          <div className="section-head reveal-on-scroll">
            <div className="section-head-copy">
              <span className="section-kicker">MOTION &amp; SOUND</span>
              <h2>Creator Videos &amp; Cinematography</h2>
              <p>
                Short-form visual essays, high-fashion motion reels, and studio cinematography vignettes.
              </p>
            </div>
            <Link href="/videos" className="section-action-link">
              <span>Watch All Videos</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {displayVideos.length > 0 ? (
            <div className="video-grid">
              {displayVideos.slice(0, 3).map((video) => {
                const isLocked = Boolean(video.isPremium);

                if (isLocked) {
                  return (
                    <div
                      key={video.id}
                      className="video-card is-locked reveal-on-scroll"
                    >
                      <div className="video-player-wrap">
                        <video
                          src={video.src}
                          poster={video.poster}
                          preload="metadata"
                          playsInline
                          muted
                          loop
                        />
                        <div className="locked-video-overlay">
                          <div className="lock-shield-icon">
                            <Lock size={22} />
                          </div>
                          <span className="locked-card-tag">VIP PATRON MOTION ARCHIVE (18+)</span>
                          <strong className="locked-card-title">{video.title}</strong>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", margin: "0 0 14px" }}>
                            Full Uncut 4K Extended Film
                          </p>
                          <a
                            href="https://vip.ninakurainservices.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="locked-card-cta"
                          >
                            <span>Unlock in VIP Sanctuary</span>
                            <ArrowUpRight size={13} />
                          </a>
                        </div>
                      </div>
                      <div className="video-card-body">
                        <div className="video-card-meta">{video.meta}</div>
                        <h3>{video.title}</h3>
                        <p>{video.desc}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={video.id}
                    className="video-card reveal-on-scroll"
                  >
                    <div className="video-player-wrap">
                      <video
                        src={video.src}
                        poster={video.poster}
                        controls
                        preload="metadata"
                        playsInline
                      />
                    </div>
                    <div className="video-card-body">
                      <div className="video-card-meta">{video.meta}</div>
                      <h3>{video.title}</h3>
                      <p>{video.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: "36px clamp(20px, 4vw, 40px)",
                borderRadius: "var(--nk-radius-lg)",
                background: "var(--nk-surface-card)",
                border: "1px solid var(--nk-border)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "rgba(224, 96, 134, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--nk-rose-light)",
                }}
              >
                <Film size={24} />
              </div>
              <h3 style={{ fontFamily: "var(--nk-font-serif)", fontSize: "20px", margin: 0, color: "var(--nk-text)" }}>
                Cinematography &amp; Motion Studio
              </h3>
              <p style={{ maxWidth: "540px", fontSize: "13.5px", color: "var(--nk-text-muted)", margin: 0, lineHeight: 1.6 }}>
                New original 4K visual films and editorial motion reels are currently in studio production.
                Once published by the creator in Creator Studio, public releases will stream directly here.
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: "13px", padding: "8px 18px" }}
                >
                  <YoutubeIcon size={14} />
                  <span>Official YouTube Channel</span>
                </a>
                <Link
                  href="/videos"
                  className="btn-primary"
                  style={{ fontSize: "13px", padding: "8px 18px" }}
                >
                  <span>Video Hub</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* =================================================================
            5. CREATOR UPDATES & NEWS
            ================================================================= */}
        <section className="public-section" id="updates">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">DISPATCHES &amp; NEWS</span>
              <h2>Creator Updates</h2>
              <p>
                Recent milestones, portfolio additions, and creative announcements from Nina Kurain.
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
            6. OFFICIAL SOCIAL ECOSYSTEM (Social Graph Reinforcement)
            ================================================================= */}
        <section className="public-section" id="socials">
          <div className="section-head">
            <div className="section-head-copy">
              <span className="section-kicker">CONNECTED ECOSYSTEM</span>
              <h2>Official Social Profiles</h2>
              <p>
                Connect across all official Nina Kurain touchpoints to follow daily stories,
                reels, and creative drops.
              </p>
            </div>
            <Link href="/socials" className="section-action-link">
              <span>All Official Channels</span>
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
              <span>@ninakurain</span>
              <span className="social-badge">Portraits &amp; Stories</span>
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
              <span>@ninakurain</span>
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
              href="https://www.pinterest.com/ninakurain"
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
            >
              <div className="social-icon-wrapper">
                <PinterestIcon size={24} />
              </div>
              <strong>Pinterest</strong>
              <span>Nina Kurain</span>
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
              <span className="section-kicker">BRAND PARTNERSHIPS</span>
              <h2>Collaborate With Nina Kurain</h2>
              <p>
                Nina collaborates with luxury lifestyle brands, fashion houses, editorial publications,
                and creative directors seeking authentic visual storytelling and digital artistry.
              </p>

              <div className="collab-categories">
                <div className="collab-tag"><span /> Fashion &amp; Editorial</div>
                <div className="collab-tag"><span /> Brand Ambassadorship</div>
                <div className="collab-tag"><span /> Digital Campaigns</div>
                <div className="collab-tag"><span /> Visual Art Licensing</div>
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
                      placeholder="e.g. Vogue Studio / Brand Director"
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
                      placeholder="Tell us about the project, campaign scope, timeline, and vision..."
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
            8. CREATOR FAQ
            ================================================================= */}
        <section className="public-section" id="faq">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
            <div className="section-head-copy" style={{ margin: "0 auto" }}>
              <span className="section-kicker">QUESTIONS &amp; ANSWERS</span>
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know about Nina Kurain, media licensing, and collaboration.</p>
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
            9. PRIVATE CREATOR CLUB CTA (Subtle, Non-Dominating 18+)
            ================================================================= */}
        <div className="vip-banner-wrap">
          <div className="vip-banner">
            <div className="vip-banner-content">
              <h3>Private Creator Club (18+)</h3>
              <p>
                Looking for exclusive behind-the-scenes sets, unreleased 4K studio films, and private
                membership archives? Access Nina Kurain&apos;s private patron sanctuary.
              </p>
            </div>
            <div className="vip-banner-action">
              <a
                href="https://vip.ninakurainservices.in/"
                className="vip-banner-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Enter VIP Sanctuary</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
