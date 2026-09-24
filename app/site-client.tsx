"use client";

import Image from "next/image";
import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { ArrowRight, Check, ChevronDown, ChevronRight, Flame, LockKeyhole, Menu, Play, Sparkles, Globe2, Film, Camera, Eye, Heart } from "lucide-react";
import { useState } from "react";
import type { Plan } from "@/lib/server/entitlements";
import { getPlanPricing } from "@/lib/pricing";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeQuickToggle } from "./theme-controls";

const marqueeMedia: Array<{
  type: "video" | "photo";
  src: string;
  poster?: string;
  title: string;
  alt: string;
  tag: string;
  className: string;
}> = [
  { type: "photo", src: "/nina-gallery/nina-kurain-01.jpeg", title: "Official Portraiture Series", alt: "Nina Kurain Official Portrait", tag: "📸 STUDIO ARCHIVE", className: "tall photo-card" },
  { type: "photo", src: "/nina-gallery/nina-kurain-02.jpeg", title: "Editorial Light Study", alt: "Nina Kurain Editorial Study", tag: "💋 VIP EXCLUSIVE", className: "portrait photo-card" },
  { type: "photo", src: "/nina-gallery/nina-kurain-03.jpeg", title: "Contemporary Styling Series", alt: "Nina Kurain Contemporary Styling", tag: "✨ HIGH RESOLUTION", className: "tall photo-card" },
  { type: "photo", src: "/nina-gallery/nina-kurain-04.jpeg", title: "Chiaroscuro Shadows", alt: "Nina Kurain Chiaroscuro", tag: "🔞 MEMBERS ONLY", className: "tall photo-card" },
  { type: "photo", src: "/nina-gallery/nina-kurain-05.jpeg", title: "Visual Storytelling", alt: "Nina Kurain Visual Storytelling", tag: "🔥 PRIVATE DROP", className: "portrait photo-card" },
  { type: "photo", src: "/nina-gallery/nina-kurain-06.jpeg", title: "Atmospheric Moodboard", alt: "Nina Kurain Atmospheric Moodboard", tag: "📸 PLEASURE VAULT", className: "portrait photo-card" },
];

const vaultItems = [
  { id: "p1", type: "photo", title: "Signature Portraiture Collection", duration: "12 Photos", views: "14.8k", src: "/nina-gallery/nina-kurain-01.jpeg", poster: "/nina-gallery/nina-kurain-01.jpeg", desc: "Minimalist elegance, controlled lighting, and authentic creator aesthetics." },
  { id: "p2", type: "photo", title: "Editorial Styling & Wardrobe", duration: "24 Photos", views: "11.9k", src: "/nina-gallery/nina-kurain-02.jpeg", poster: "/nina-gallery/nina-kurain-02.jpeg", desc: "Contemporary silhouettes and deliberate studio mood." },
  { id: "p3", type: "photo", title: "Chiaroscuro Fine Art Study", duration: "18 Photos", views: "18.2k", src: "/nina-gallery/nina-kurain-03.jpeg", poster: "/nina-gallery/nina-kurain-03.jpeg", desc: "Intimate chiaroscuro exploration of light and shadow." },
  { id: "p4", type: "photo", title: "Private Gallery Release", duration: "36 Photos", views: "16.4k", src: "/nina-gallery/nina-kurain-04.jpeg", poster: "/nina-gallery/nina-kurain-04.jpeg", desc: "Exclusive uncut collection from the studio session." },
  { id: "p5", type: "photo", title: "Autumn Palette Showcase", duration: "20 Photos", views: "22.7k", src: "/nina-gallery/nina-kurain-05.jpeg", poster: "/nina-gallery/nina-kurain-05.jpeg", desc: "Deep amber hues, luxurious textures, and captivating expressions." },
  { id: "p6", type: "photo", title: "Midnight Solitude Archive", duration: "18 Photos", views: "13.5k", src: "/nina-gallery/nina-kurain-06.jpeg", poster: "/nina-gallery/nina-kurain-06.jpeg", desc: "Raw, unedited, and authentic studio photography." },
];

export function LandingExperience({
  signedIn,
  displayName,
  role = null,
  level = 0,
  signInPath,
  plans,
  socials
}: {
  signedIn: boolean;
  displayName: string | null;
  role?: string | null;
  level?: number;
  signInPath: string;
  plans: Plan[];
  socials: Record<string, string>;
}) {
  const tiers = plans.filter(p => p.level > 0).map(p => {
    const pricing = getPlanPricing(p);
    return {
      name: p.name.toUpperCase(),
      price: `₹${p.price.toLocaleString("en-IN")}`,
      note: p.description,
      popular: Boolean(p.badge),
      badge: p.badge,
      features: JSON.parse(p.benefits) as string[],
      pricing,
    };
  });

  const [joinOpen, setJoinOpen] = useState(false);
  const [vaultTab, setVaultTab] = useState<"all" | "video" | "photo">("all");
  const [activePreview, setActivePreview] = useState<typeof vaultItems[0] | null>(null);

  const isAdmin = role === "admin" || (level !== undefined && level >= 999);
  const isVip = Boolean(level && level > 0 && !isAdmin);

  let destination = "/signup";
  let topButtonLabel = "UNLOCK FREE";
  let heroButtonLabel = "CLAIM YOUR FIRST LOOK FREE";
  let greetingHref = "/login";
  let greetingBadge = "";

  if (isAdmin) {
    destination = "/admin";
    topButtonLabel = "CREATOR STUDIO";
    heroButtonLabel = "ENTER CREATOR STUDIO";
    greetingHref = "/admin";
    greetingBadge = " (Admin)";
  } else if (isVip) {
    destination = "/profile?tab=exclusive";
    topButtonLabel = "OPEN VIP FEED";
    heroButtonLabel = "ENTER YOUR VIP FEED";
    greetingHref = "/profile?tab=exclusive";
    greetingBadge = " (VIP)";
  } else if (signedIn) {
    destination = "/feed";
    topButtonLabel = "OPEN YOUR FEED";
    heroButtonLabel = "ENTER YOUR PRIVATE FEED";
    greetingHref = "/feed";
    greetingBadge = "";
  }

  const filteredVault = vaultItems.filter(item => vaultTab === "all" || item.type === vaultTab);

  return (
    <main className="site-shell">
      {/* Top Navigation */}
      <header className="topbar">
        <Link href="/" className="wordmark" aria-label="Nina Kurain home">
          <BrandLogo height={52} width={78} priority />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#vault">Media Vault</a>
          <a href="#archive">Teasers</a>
          <Link href="/memberships">VIP Access</Link>
          <Link href="/about">About Nina</Link>
        </nav>
        <div className="header-actions">
          <ThemeQuickToggle />
          {signedIn ? (
            <Link className="text-link" href={greetingHref}>
              Hi, {displayName?.split(" ")[0] ?? (isAdmin ? "Nina" : "Member")}{greetingBadge}
            </Link>
          ) : (
            <a className="text-link" href={signInPath}>Sign in</a>
          )}
          <a className="button button-small" href={destination}>
            {topButtonLabel}<ArrowRight size={15} />
          </a>
          <details className="native-mobile-menu">
            <summary className="menu-button" aria-label="Toggle navigation"><Menu /></summary>
            <nav className="mobile-menu" aria-label="Mobile navigation">
              <a href="#vault">Media Vault</a>
              <a href="#archive">Teasers</a>
              <Link href="/memberships">VIP Access</Link>
              <Link href="/about">About Nina</Link>
              {signedIn ? (
                <>
                  <Link href={destination}>{isAdmin ? "Creator Studio" : isVip ? "VIP Feed" : "My Feed"}</Link>
                  <Link href="/account">My Account</Link>
                </>
              ) : (
                <>
                  <Link href="/signup">Claim VIP Access</Link>
                  <Link href="/login">Log in</Link>
                </>
              )}
            </nav>
          </details>
        </div>
      </header>

      {/* Hero Section: Seductive Video & Photo Stage */}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> <Flame size={14} className="text-[#ff2d75]" /> NINA KURAIN · OFFICIAL PRIVATE CREATOR CLUB
          </div>
          <h1>
            Nina Kurain&apos;s most intimate,<br />
            <em>unfiltered private collection.</em>
          </h1>
          <p>
            Step behind closed doors. Uncensored tapes, erotic boudoir sets, private confessions, and sluttery drops you won&apos;t find anywhere else on the internet.
          </p>
          <div className="hero-confession">
            <Flame size={16} />
            <span>&ldquo;I do whatever I want when the cameras turn private…&rdquo;</span>
          </div>
          <div className="hero-actions">
            <a className="button" href={destination}>
              {heroButtonLabel}<ArrowRight size={17} />
            </a>
            <Link className="quiet-link" href="/memberships">
              EXPLORE VIP TIERS <ChevronRight size={15} />
            </Link>
          </div>
          <div className="unlock-note">
            <Sparkles size={15} /> Your first private erotic glimpse is free. Instant access, no card required.
          </div>
          <div className="social-proof">
            <div className="avatar-stack">{[0, 1, 2].map((n) => <span key={n} />)}</div>
            <strong>Over 12,400 VIP members inside.</strong>
            <span>Direct access to Nina.</span>
          </div>
        </div>

        {/* Hero Media Stage: Initial Seductive Image on Top (No Video) */}
        <div className="hero-media" aria-label="Interactive preview of creator archive">
          <div className="hero-media-stage">
            <div className="hero-stage-topbar">
              <div className="live-indicator-pill">
                <span className="live-dot" />
                <span>🔞 EXCLUSIVE VIP BOUDOIR</span>
              </div>
              <span className="hero-photo-tag">
                <Camera size={13} /> UNDRESSED FOR YOU
              </span>
            </div>

            <div className="hero-media-inner">
              <Image
                src="/nina-landing-hero.png"
                alt="Nina Kurain VIP Sanctuary"
                fill
                priority
                sizes="(max-width: 800px) 94vw, 47vw"
              />
              <div className="hero-media-overlay" />
            </div>
          </div>

          <div className="floating-card top">
            <span className="status-dot" /> <b>🔥 NEW DROP: SHEER LACE &amp; RAW DESIRE</b>
          </div>
          <div className="floating-card bottom">
            <LockKeyhole size={16} />
            <div>
              <span>100% UNCENSORED</span>
              <b>Closer than any social feed</b>
            </div>
          </div>
          <a className="hero-scroll" href="#vault" aria-label="See a glimpse inside">
            <span>STEP INSIDE</span><ChevronDown size={15} />
          </a>
        </div>
      </section>

      {/* Marquee Section: Both Videos and Photos Running Concurrently */}
      <section className="marquee-section" id="archive">
        <div className="section-kicker">🔞 RUNNING MEDIA: VIDEOS &amp; PHOTOS IN MOTION</div>
        <div className="marquee-mask">
          {[0, 1].map((row) => (
            <div className={`marquee-row row-${row + 1}`} key={row}>
              {[...marqueeMedia, ...marqueeMedia].map((item, i) => (
                <div
                  className={`marquee-item ${item.className}`}
                  key={`${row}-${i}`}
                  onClick={() => {
                    const match = vaultItems.find(v => (item.title ? v.title.includes(item.title) : false) || v.src === item.src);
                    if (match) setActivePreview(match);
                    else setJoinOpen(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span className="video-badge">
                    {item.type === "video" ? <Play size={10} fill="currentColor" /> : <Camera size={10} />}
                    {item.tag}
                  </span>
                  {item.type === "video" ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={item.poster}
                      className="marquee-media-blur"
                      controlsList="nodownload nofullscreen noremoteplayback"
                      disablePictureInPicture
                      disableRemotePlayback
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <source src={item.src} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={item.src}
                      alt={item.alt || "Private drop"}
                      fill
                      sizes="280px"
                      className="marquee-media-blur"
                    />
                  )}
                  <span className="veil" />
                  <div className="marquee-item-overlay">
                    <span className="marquee-item-lock">
                      <LockKeyhole size={18} />
                    </span>
                    <span className="marquee-item-hint">🔞 VIP ONLY</span>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="marquee-lock">
            <span><LockKeyhole size={20} /></span>
            <b>THE PUBLIC INTERNET ENDS HERE</b>
            <p>Unlock one free private erotic glimpse immediately. The uncensored video vault and photo archive are reserved for members.</p>
            <a href={destination}>
              {isAdmin ? "ENTER CREATOR STUDIO" : isVip ? "ENTER YOUR VIP FEED" : signedIn ? "ENTER YOUR PRIVATE FEED" : "SHOW ME WHAT'S PRIVATE"}
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* NEW: Dedicated Running Media Vault (Videos & Photos Gallery) */}
      <section className="vault-section" id="vault">
        <div className="vault-header">
          <div>
            <span className="section-kicker">🔞 INSIDE MY PRIVATE PLEASURE ARCHIVE</span>
            <h2>Uncensored Tapes &amp;<br /><em>Explicit Photo Drops</em></h2>
          </div>
          <p>
            Preview what Nina releases behind locked doors. Raw bedroom tapes, slow-motion teasing loops, and unfiltered boudoir photography created strictly for members who crave all of me.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="vault-filter-bar">
          <button
            type="button"
            className={`vault-filter-btn ${vaultTab === "all" ? "active" : ""}`}
            onClick={() => setVaultTab("all")}
          >
            <Flame size={14} /> All Pleasures ({vaultItems.length})
          </button>
          <button
            type="button"
            className={`vault-filter-btn ${vaultTab === "video" ? "active" : ""}`}
            onClick={() => setVaultTab("video")}
          >
            <Film size={14} /> 🎬 Seductive Videos &amp; Tapes ({vaultItems.filter(v => v.type === "video").length})
          </button>
          <button
            type="button"
            className={`vault-filter-btn ${vaultTab === "photo" ? "active" : ""}`}
            onClick={() => setVaultTab("photo")}
          >
            <Camera size={14} /> 📸 Intimate Photo Sets ({vaultItems.filter(v => v.type === "photo").length})
          </button>
        </div>

        {/* Media Grid with Blurred Previews */}
        <div className="vault-grid">
          {filteredVault.map((item) => (
            <article
              key={item.id}
              className="vault-card"
              onClick={() => setActivePreview(item)}
            >
              <div className="vault-card-media blurred-preview">
                <span className={`vault-tag ${item.type === "video" ? "running-video" : ""}`}>
                  {item.type === "video" ? <Play size={10} fill="currentColor" /> : <Camera size={10} />}
                  {item.duration}
                </span>

                {item.type === "video" ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={item.poster}
                    className="vault-media-blur"
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    disableRemotePlayback
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  <Image src={item.src} alt={item.title} fill sizes="(max-width: 800px) 100vw, 33vw" className="vault-media-blur" />
                )}

                {/* Seductive Lock Overlay */}
                <div className="vault-lock-overlay">
                  <span className="vault-center-lock"><LockKeyhole size={22} /></span>
                  <strong className="vault-lock-kicker">🔞 VIP LOCKED</strong>
                  <span className="vault-lock-tap">Tap to preview</span>
                </div>

                <div className="media-overlay" />
              </div>

              <div className="vault-card-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="vault-card-footer">
                  <span><Eye size={13} /> {item.views} views</span>
                  <span><Heart size={13} /> VIP Uncensored</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Benefit / About Section */}
      <section className="unlock-section" id="about">
        <div className="section-heading">
          <div>
            <span className="section-kicker">UNCENSORED &amp; SLUTTERY ARCHIVE</span>
            <h2>Less distance.<br />Much more of me.</h2>
          </div>
          <p>
            This is where social media restrictions and modesty vanish. Every private release is warmer, wilder, and made specifically for those who want more than a polite scroll.
          </p>
        </div>
        <div className="benefit-grid">
          <article>
            <span>01</span>
            <Play size={28} />
            <h3>Uncensored 4K Tapes</h3>
            <p>Slow arching, breathless moans, sensual undressing, and explicit bedroom films that could never touch the public internet.</p>
          </article>
          <article>
            <span>02</span>
            <Flame size={28} />
            <h3>Erotic Photo Sets</h3>
            <p>High-resolution boudoir, sheer lace, French maid fantasies, and completely raw nude editorial drops released fresh every week.</p>
          </article>
          <article>
            <span>03</span>
            <LockKeyhole size={28} />
            <h3>Your Private Pleasure Vault</h3>
            <p>Full unrestricted archive access. Stream whenever the craving hits you, discreetly and privately on any device.</p>
          </article>
        </div>
      </section>

      {/* VIP Pricing Section */}
      <section className="pricing-section" id="memberships">
        <div className="pricing-intro">
          <span className="section-kicker">HOW DEEP DO YOU WANT TO GO?</span>
          <h2>Choose how much<br />I reveal.</h2>
          <p>Begin with a free glimpse, upgrade to full uncensored tapes, or enter the inner circle for custom interactions.</p>
        </div>
        <div className="pricing-grid">
          {tiers.map((tier) => (
            <article className={tier.popular ? "price-card featured" : "price-card"} key={tier.name}>
              {tier.popular && <span className="popular">{tier.badge || "MOST POPULAR"}</span>}
              <div className="tier-name">{tier.name}</div>
              <p className="tier-note">{tier.note}</p>
              <div className="price">
                {tier.pricing.discountActive && (
                  <span className="price-original">₹{tier.pricing.originalPrice.toLocaleString("en-IN")}</span>
                )}
                {tier.price}<span>/ month</span>
              </div>
              {tier.pricing.discountActive && (
                <div className="discount-info">
                  {tier.pricing.discountBadge && <span className="savings-badge">{tier.pricing.discountBadge}</span>}
                  {tier.pricing.discountLabel && <span className="discount-label">{tier.pricing.discountLabel}</span>}
                  {tier.pricing.endsAtFormatted && <span className="discount-expiry">{tier.pricing.endsAtFormatted}</span>}
                </div>
              )}
              <ul>
                {tier.features.map((f) => (
                  <li key={f}><Check size={15} />{f}</li>
                ))}
              </ul>
              <a
                className="tier-join"
                href={signedIn ? "/memberships" : "/signup"}
                onClick={(event) => {
                  event.preventDefault();
                  setJoinOpen(true);
                }}
              >
                {`JOIN ${tier.name}`}<ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Final Seductive CTA */}
      <section className="final-cta">
        <div>
          <span className="section-kicker">DON&apos;T JUST STAND AT THE DOOR</span>
          <h2>Stay a little longer.</h2>
          <p>Your first private erotic glimpse is free. What you unlock next is completely between us.</p>
        </div>
        <a className="button light" href={destination}>
          {isAdmin ? "ENTER CREATOR STUDIO" : isVip ? "ENTER YOUR VIP FEED" : signedIn ? "ENTER YOUR FEED" : "CLAIM VIP ACCESS NOW"}<ArrowRight size={17} />
        </a>
      </section>

      {/* Celebrity Profile & Biography Section for Google Knowledge Panel */}
      <section className="about-section" id="about" style={{ padding: "80px 20px", maxWidth: "1120px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="section-kicker" style={{ letterSpacing: "0.18em", color: "#ff2d75", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>
            ✨ OFFICIAL CREATOR &amp; MODEL PROFILE
          </span>
          <h2 style={{ fontSize: "36px", fontWeight: 800, marginTop: "10px", color: "#fff", letterSpacing: "-0.02em" }}>
            About Nina Kurain
          </h2>
          <p style={{ color: "#d9bed0", fontSize: "16px", marginTop: "8px", maxWidth: "680px", margin: "8px auto 0" }}>
            Indian model, muse, and independent creator sharing unfiltered boudoir art, 4K studio films, and private confessions.
          </p>
        </div>

        {/* Celebrity Grid: Photos + Biography & Fast Facts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "center" }}>
          {/* Visual Gallery Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ position: "relative", height: "340px", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(229,107,131,0.25)", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
              <Image src="/nina-kurain-studio-portrait.webp" alt="Nina Kurain Model Portrait" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", background: "rgba(5,2,4,0.75)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, color: "#ff8da9", textAlign: "center" }}>
                NINA KURAIN · 2026
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ position: "relative", height: "162px", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(229,107,131,0.25)" }}>
                <Image src="/nina-kurain-fashion-portrait.webp" alt="Nina Kurain Editorial Portrait" fill style={{ objectFit: "cover" }} />
              </div>
              <div style={{ position: "relative", height: "162px", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(229,107,131,0.25)" }}>
                <Image src="/nina-kurain-creator-photoshoot.webp" alt="Nina Kurain Studio Glamour" fill style={{ objectFit: "cover" }} />
              </div>
            </div>
          </div>

          {/* Biographical Facts Card (Google Knowledge Graph Foundation) */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(229,107,131,0.2)", borderRadius: "20px", padding: "32px 28px", backdropFilter: "blur(12px)" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "16px" }}>
              Biography &amp; Quick Facts
            </h3>
            <p style={{ color: "#cbb3c2", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>
              Nina Kurain is an Indian model, artist, and digital creator. Breaking away from traditional social media censorship, she established her private creator club on <strong>ninakurainservices.in</strong> to share her authentic vision: high-concept boudoir sets, 4K cinema films, personal daily stories, and intimate member conversations.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", padding: "18px", background: "rgba(0,0,0,0.35)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#8d7081", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Full Name</span>
                <strong style={{ fontSize: "15px", color: "#fff" }}>Nina Kurain</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#8d7081", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Profession</span>
                <strong style={{ fontSize: "15px", color: "#ff8da9" }}>Model &amp; Digital Creator</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#8d7081", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Born / Age</span>
                <strong style={{ fontSize: "15px", color: "#fff" }}>2001 (Age 25)</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#8d7081", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Nationality</span>
                <strong style={{ fontSize: "15px", color: "#fff" }}>Indian</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#8d7081", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Known For</span>
                <strong style={{ fontSize: "13px", color: "#d9bed0" }}>VIP Private Creator Club</strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#8d7081", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Official Website</span>
                <strong style={{ fontSize: "13px", color: "#ff2d75" }}>ninakurainservices.in</strong>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <a className="button button-small" href={destination} style={{ padding: "10px 20px", fontSize: "13px" }}>
                {isAdmin ? "OPEN CREATOR STUDIO" : "EXPLORE NINA'S ARCHIVE"} <ArrowRight size={14} />
              </a>
              <Link className="quiet-link" href="/memberships" style={{ fontSize: "13px" }}>
                VIEW VIP TIERS <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search-Engine Optimized FAQ Section */}
      <section className="faq-section" id="faq" style={{ padding: "60px 20px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="section-kicker" style={{ letterSpacing: "0.15em", color: "#e56b83", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>FREQUENTLY ASKED QUESTIONS</span>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#fff" }}>Everything you need to know about Nina Kurain Club</h2>
          <p style={{ color: "#d9bed0", fontSize: "14px", marginTop: "6px" }}>Direct answers regarding membership access, private media, and original content.</p>
        </div>

        <div className="faq-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <details className="faq-item" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(229,107,131,0.2)", borderRadius: "10px", padding: "18px 22px", cursor: "pointer" }}>
            <summary style={{ fontWeight: 700, fontSize: "16px", color: "#f7e9f0", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Who is Nina Kurain?</span>
              <ChevronDown size={18} style={{ color: "#e56b83" }} />
            </summary>
            <p style={{ marginTop: "12px", color: "#bda2b2", fontSize: "14px", lineHeight: 1.6 }}>
              Nina Kurain is an independent creator and artist sharing exclusive, unfiltered boudoir photography, 4K studio films, intimate stories, and personal notes directly with verified members.
            </p>
          </details>

          <details className="faq-item" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(229,107,131,0.2)", borderRadius: "10px", padding: "18px 22px", cursor: "pointer" }}>
            <summary style={{ fontWeight: 700, fontSize: "16px", color: "#f7e9f0", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>What is the Nina Kurain Creator Club?</span>
              <ChevronDown size={18} style={{ color: "#e56b83" }} />
            </summary>
            <p style={{ marginTop: "12px", color: "#bda2b2", fontSize: "14px", lineHeight: 1.6 }}>
              It is Nina Kurain&apos;s private VIP membership space. Unlike public social media, members enjoy full uncensored 4K videos, high-resolution photo drops, 24-hour stories, permanent highlights, and direct interaction.
            </p>
          </details>

          <details className="faq-item" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(229,107,131,0.2)", borderRadius: "10px", padding: "18px 22px", cursor: "pointer" }}>
            <summary style={{ fontWeight: 700, fontSize: "16px", color: "#f7e9f0", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>How do I unlock free preview content?</span>
              <ChevronDown size={18} style={{ color: "#e56b83" }} />
            </summary>
            <p style={{ marginTop: "12px", color: "#bda2b2", fontSize: "14px", lineHeight: 1.6 }}>
              You can register an account for free at <Link href="/signup" style={{ color: "#e56b83", textDecoration: "underline" }}>ninakurainservices.in/signup</Link>. No payment or credit card is required to enjoy free preview photos, teaser clips, and community posts.
            </p>
          </details>

          <details className="faq-item" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(229,107,131,0.2)", borderRadius: "10px", padding: "18px 22px", cursor: "pointer" }}>
            <summary style={{ fontWeight: 700, fontSize: "16px", color: "#f7e9f0", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Is billing discreet and secure?</span>
              <ChevronDown size={18} style={{ color: "#e56b83" }} />
            </summary>
            <p style={{ marginTop: "12px", color: "#bda2b2", fontSize: "14px", lineHeight: 1.6 }}>
              Yes. All transactions are securely processed through industry-standard payment gateways with 100% discreet billing. You can cancel your membership anytime with one click from your account dashboard.
            </p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <Link href="/" className="wordmark" aria-label="Nina Kurain home">
          <BrandLogo height={44} width={66} />
        </Link>
        <p>18+ Explicit Original Work by Nina Kurain. Shared strictly with consenting adults.</p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/about">About Nina</Link>
          <Link href="/memberships">Memberships</Link>
          <Link href="/account">My account</Link>
          <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/content-removal">Report / Removal</Link>
          <Link href="/logout">Logout</Link>
          {Object.entries(socials).filter(([, url]) => Boolean(url)).map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} — opens in a new tab`}>
              <Globe2 size={17} />
            </a>
          ))}
          <span>© 2026 Nina Kurain</span>
        </div>
      </footer>

      {/* Join Invitation Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="join-dialog">
          <DialogHeader>
            <DialogTitle>Your Private VIP Invitation</DialogTitle>
            <DialogDescription>
              Unlock your first explicit glimpse free. Choose your access level anytime to experience the full uncensored 4K video archive and private boudoir photo collections.
            </DialogDescription>
          </DialogHeader>
          <a className="button dialog-button" href={signedIn ? "/memberships" : "/signup"}>
            {signedIn ? "CHOOSE YOUR ACCESS LEVEL" : "CLAIM FREE VIP ACCESS"}
            <ArrowRight size={16} />
          </a>
          <small>Discreet billing · Instant activation · Cancel anytime with one click.</small>
        </DialogContent>
      </Dialog>

      {/* Media Preview Dialog */}
      <Dialog open={Boolean(activePreview)} onOpenChange={(open) => !open && setActivePreview(null)}>
        <DialogContent className="join-dialog" style={{ maxWidth: "560px" }}>
          <DialogHeader>
            <span className="sultry-badge hot" style={{ width: "fit-content", marginBottom: "8px" }}>
              <Flame size={12} /> {activePreview?.type === "video" ? "4K EXPLICIT VIDEO" : "INTIMATE PHOTO SET"}
            </span>
            <DialogTitle>{activePreview?.title}</DialogTitle>
            <DialogDescription>{activePreview?.desc}</DialogDescription>
          </DialogHeader>

          <div style={{ position: "relative", width: "100%", height: "260px", borderRadius: "14px", overflow: "hidden", margin: "12px 0", background: "#050204" }}>
            {activePreview?.type === "video" ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                poster={activePreview?.poster}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(8px)" }}
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                disableRemotePlayback
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src={activePreview?.src} type="video/mp4" />
              </video>
            ) : (
              <Image src={activePreview?.src || "/nina-gallery/nina-kurain-01.jpeg"} alt={activePreview?.title || "Teaser"} fill style={{ objectFit: "cover", filter: "blur(8px)" }} />
            )}
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(5,2,4,0.65)", color: "#fff", textAlign: "center", padding: "20px" }}>
              <div>
                <span style={{ display: "inline-grid", placeItems: "center", width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #a92455, #ff2d75)", margin: "0 auto 10px" }}>
                  <LockKeyhole size={22} />
                </span>
                <strong style={{ display: "block", fontSize: "14px", letterSpacing: "0.1em" }}>VIP MEMBER EXCLUSIVE</strong>
                <p style={{ fontSize: "12px", color: "#d9bed0", margin: "4px 0 0" }}>Uncensored 4K playback unlocked for members.</p>
              </div>
            </div>
          </div>

          <a className="button dialog-button" href={isAdmin ? "/admin" : isVip ? "/profile?tab=exclusive" : destination}>
            {isAdmin ? "OPEN IN CREATOR STUDIO" : isVip ? "WATCH IN VIP FEED" : signedIn ? "UPGRADE ACCESS TO PLAY" : "UNLOCK FULL UNCENSORED MEDIA"}
            <ArrowRight size={16} />
          </a>
          <small>Instant access · 100% discreet &amp; secure · No spam.</small>
        </DialogContent>
      </Dialog>
    </main>
  );
}

