import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { ArrowUpRight } from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,
  PinterestIcon,
} from "@/components/social-icons";
import { NINA_ENTITY } from "@/lib/seo/nina-entity";
import type { PublicCreatorSettings } from "@/lib/server/public-data";

export interface PublicFooterProps {
  settings?: Partial<PublicCreatorSettings>;
}

export function PublicFooter({ settings }: PublicFooterProps = {}) {
  const currentYear = new Date().getFullYear();

  const creatorName = settings?.name || NINA_ENTITY.name;
  const creatorTitle = settings?.title || NINA_ENTITY.jobTitle;

  const instagramUrl = settings?.instagram || NINA_ENTITY.instagramUrl;
  const youtubeUrl = settings?.youtube || NINA_ENTITY.youtubeUrl;
  const facebookUrl = settings?.facebook || NINA_ENTITY.facebookUrl;
  const pinterestUrl = settings?.pinterest || NINA_ENTITY.pinterestUrl;
  const vipUrl = settings?.vipUrl || "https://vip.ninakurainservices.in/";

  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div className="public-footer-top">
          <div className="public-footer-brand">
            <Link href="/" className="footer-logo-link" aria-label="Nina Kurain Home">
              <BrandLogo height={48} width={74} />
            </Link>
            <div className="footer-entity-tag">
              <strong>{creatorName.toUpperCase()}</strong>
              <span>{creatorTitle}</span>
            </div>
            <p className="footer-bio-summary">
              The official online home of {creatorName}. Discover authentic editorial photography,
              cinematography, creator updates, and official social channels.
            </p>
            <div className="footer-social-strip">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={`${creatorName} Instagram`}
                title="Instagram Profile"
              >
                <InstagramIcon size={17} />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={`${creatorName} YouTube`}
                title="YouTube Official Channel"
              >
                <YoutubeIcon size={17} />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={`${creatorName} Facebook`}
                title="Facebook Official Page"
              >
                <FacebookIcon size={17} />
              </a>
              <a
                href={pinterestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={`${creatorName} Pinterest`}
                title="Pinterest Moodboards"
              >
                <PinterestIcon size={17} />
              </a>
            </div>
          </div>

          <div className="public-footer-columns">
            <div className="footer-col">
              <h4>EXPLORE</h4>
              <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/about">About {creatorName}</Link></li>
                <li><Link href="/biography">Official Biography</Link></li>
                <li><Link href="/wiki">Wikipedia Archive</Link></li>
                <li><Link href="/photos">Photo Gallery</Link></li>
                <li><Link href="/lookbook">Visual Lookbook</Link></li>
                <li><Link href="/videos">Videos &amp; Motion</Link></li>
                <li><Link href="/portfolio">Portfolio</Link></li>
                <li><Link href="/updates">Creator Updates</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>INFORMATION</h4>
              <ul>
                <li><Link href="/socials">Official Socials</Link></li>
                <li><Link href="/pricing">Memberships &amp; Pricing</Link></li>
                <li><Link href="/entity">Entity Dossier</Link></li>
                <li><Link href="/net-worth">Career &amp; Valuation</Link></li>
                <li><Link href="/creator-tips">Creator Tips &amp; Styling</Link></li>
                <li><Link href="/collaborations">Collaborate</Link></li>
                <li><Link href="/press">Press &amp; Media Kit</Link></li>
                <li><Link href="/interviews">Creator Notes &amp; Q&amp;A</Link></li>
                <li><Link href="/faq">Creator FAQ</Link></li>
                <li><Link href="/contact">Contact Desk</Link></li>
              </ul>
            </div>

            <div className="footer-col footer-col-highlight">
              <h4>PATRON ACCESS</h4>
              <p className="vip-col-desc">
                Exclusive creator archives, extended motion studies, and member-only dispatches.
              </p>
              <a
                href={vipUrl}
                className="vip-footer-cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Member Portal</span>
                <ArrowUpRight size={14} />
              </a>
              <small className="vip-disclaimer">Supporter Portal • Secure Access</small>
            </div>
          </div>
        </div>

        <div className="public-footer-bottom">
          <div className="footer-legal-copy">
            <p>
              © {currentYear} {creatorName}. All rights reserved. Official first-party web presence.
            </p>
          </div>
          <div className="footer-legal-links">
            <Link href="/terms-and-conditions">Terms of Service</Link>
            <span className="dot">•</span>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <span className="dot">•</span>
            <Link href="/content-removal">Content Removal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
