"use client";

import Link from "@/components/site-link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeQuickToggle } from "@/app/theme-controls";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/photos", label: "Photography" },
  { href: "/videos", label: "Videos" },
  { href: "/updates", label: "Updates" },
  { href: "/socials", label: "Socials" },
  { href: "/collaborations", label: "Collaborate" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className={`public-header ${scrolled ? "scrolled" : ""}`}>
      <div className="public-header-inner">
        <Link href="/" className="public-brand" aria-label="Nina Kurain — Digital Creator Homepage">
          <BrandLogo height={40} width={62} priority />
          <span className="brand-identity-text">
            <strong>NINA KURAIN</strong>
            <small>DIGITAL CREATOR</small>
          </span>
        </Link>

        <nav className="public-desktop-nav" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`public-nav-link ${isActive ? "active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="public-header-actions">
          <ThemeQuickToggle />

          <a
            href="https://vip.ninakurainservices.in/"
            className="vip-club-cta"
            title="Nina Kurain Private Creator Club (18+)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="vip-cta-full">Private Club</span>
            <span className="vip-cta-short">VIP</span>
            <span className="age-tag">18+</span>
            <ArrowUpRight size={13} className="cta-arrow" />
          </a>

          <button
            type="button"
            className="public-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="public-mobile-drawer">
          <div className="drawer-nav">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`drawer-link ${isActive ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="active-dot" />}
                </Link>
              );
            })}
            <div className="drawer-extra-links">
              <Link href="/press" className="drawer-sublink" onClick={() => setMobileOpen(false)}>
                Press &amp; Media Kit
              </Link>
              <Link href="/faq" className="drawer-sublink" onClick={() => setMobileOpen(false)}>
                Creator FAQ
              </Link>
            </div>
            <div className="drawer-vip-card">
              <div className="drawer-vip-info">
                <strong>Private Creator Club</strong>
                <span>Age-restricted members archive &amp; exclusive vault</span>
              </div>
              <a
                href="https://vip.ninakurainservices.in/"
                className="drawer-vip-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Enter VIP Archive (18+)</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
