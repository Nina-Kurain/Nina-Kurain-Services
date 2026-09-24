import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { ArrowUpRight } from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  FacebookIcon,

  PinterestIcon,
} from "@/components/social-icons";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div className="public-footer-top">
          <div className="public-footer-brand">
            <Link href="/" className="footer-logo-link" aria-label="Nina Kurain Home">
              <BrandLogo height={48} width={74} />
            </Link>
            <div className="footer-entity-tag">
              <strong>NINA KURAIN</strong>
              <span>Digital Creator • Model • Creative Artist</span>
            </div>
            <p className="footer-bio-summary">
              The official and canonical online home of Nina Kurain. Discover editorial photography,
              cinematography, creator updates, official social channels, and creative collaborations.
            </p>
            <div className="footer-social-strip">
              <a
                href="https://www.instagram.com/ninakurain"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Nina Kurain Instagram"
                title="Instagram @ninakurain"
              >
                <InstagramIcon size={17} />
              </a>
              <a
                href="https://www.youtube.com/@ninakurain"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Nina Kurain YouTube"
                title="YouTube @ninakurain"
              >
                <YoutubeIcon size={17} />
              </a>
              <a
                href="https://www.facebook.com/ninakurain"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Nina Kurain Facebook"
                title="Facebook @ninakurain"
              >
                <FacebookIcon size={17} />
              </a>

              <a
                href="https://www.pinterest.com/ninakurain"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Nina Kurain Pinterest"
                title="Pinterest @ninakurain"
              >
                <PinterestIcon size={17} />
              </a>
            </div>
          </div>

          <div className="public-footer-columns">
            <div className="footer-col">
              <h4>EXPLORE</h4>
              <ul>
                <li><Link href="/">Official Home</Link></li>
                <li><Link href="/about">About Nina</Link></li>
                <li><Link href="/photos">Photography Gallery</Link></li>
                <li><Link href="/videos">Videos &amp; Motion</Link></li>
                <li><Link href="/updates">Creator Updates</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>CONNECT</h4>
              <ul>
                <li><Link href="/socials">Official Socials</Link></li>
                <li><Link href="/collaborations">Brand Collaborations</Link></li>
                <li><Link href="/press">Press &amp; Media Kit</Link></li>
                <li><Link href="/contact">Direct Inquiries</Link></li>
                <li><Link href="/faq">Creator FAQ</Link></li>
              </ul>
            </div>

            <div className="footer-col footer-col-highlight">
              <h4>PRIVATE ACCESS</h4>
              <p className="vip-col-desc">
                Exclusive creator archives, original private sets, and member-only updates.
              </p>
              <a
                href="https://vip.ninakurainservices.in/"
                className="vip-footer-cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Private Creator Club (18+)</span>
                <ArrowUpRight size={14} />
              </a>
              <small className="vip-disclaimer">Age-restricted • Secure Membership</small>
            </div>
          </div>
        </div>

        <div className="public-footer-bottom">
          <div className="footer-legal-copy">
            <p>
              © {currentYear} Nina Kurain. All rights reserved. The canonical entity identifier for Nina Kurain is{" "}
              <a href="https://ninakurainservices.in/#nina-kurain" className="entity-link">
                ninakurainservices.in/#nina-kurain
              </a>.
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
