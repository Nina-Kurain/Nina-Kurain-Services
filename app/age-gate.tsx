"use client";

import { AlertTriangle, ArrowRight, Flame, LockKeyhole, ShieldAlert, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "afterglow-age-verified-session";

function isProtectedPath(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  if (host.startsWith("vip.")) return true;
  const p = window.location.pathname.toLowerCase();
  return (
    p.startsWith("/feed") ||
    p.startsWith("/saved") ||
    p.startsWith("/account")
  );
}

function clearLegacyStorage() {
  try {
    localStorage.removeItem("afterglow-age-consent");
    document.cookie = "afterglow_age_verified=; Max-Age=0; Path=/; SameSite=Lax";
  } catch {
    // ignore
  }
}

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const enterRef = useRef<HTMLButtonElement>(null);
  const leaveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    clearLegacyStorage();

    // Only show age gate on private/VIP routes, never on public creator pages
    if (!isProtectedPath()) {
      document.documentElement.dataset.ageGate = "closed";
      return;
    }

    let hasSessionConsent = false;
    try {
      hasSessionConsent =
        sessionStorage.getItem(SESSION_KEY) === "true" ||
        document.cookie.includes("afterglow_age_session=1") ||
        document.cookie.includes("adult_age_confirmed=true");
    } catch {
      // ignore
    }

    if (hasSessionConsent) {
      document.documentElement.dataset.ageVerified = "true";
      document.documentElement.dataset.ageGate = "closed";
      return;
    }

    document.documentElement.dataset.ageVerified = "false";
    document.documentElement.dataset.ageGate = "open";
    const openTimer = window.setTimeout(() => {
      setOpen(true);
    }, 10);

    const focusTimer = window.setTimeout(() => enterRef.current?.focus(), 80);
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key === "Escape") event.preventDefault();
      if (event.key !== "Tab") return;
      const first = enterRef.current;
      const last = leaveRef.current;
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keepFocusInside);

    const checkRoute = () => {
      if (!isProtectedPath()) {
        document.documentElement.dataset.ageGate = "closed";
        setOpen(false);
      }
    };
    window.addEventListener("popstate", checkRoute);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", keepFocusInside);
      window.removeEventListener("popstate", checkRoute);
    };
  }, []);

  function enter() {
    if (isExiting) return;
    clearLegacyStorage();
    setIsExiting(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // ignore
    }
    // Session cookies (no Max-Age/Expires; expires when browser session closes)
    const secureFlag = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `afterglow_age_session=1; Path=/; SameSite=Lax${secureFlag}`;
    document.cookie = `adult_age_confirmed=true; Path=/; SameSite=Lax${secureFlag}`;

    // Smooth cinematic exit transition (400ms duration matching CSS keyframes)
    window.setTimeout(() => {
      document.documentElement.dataset.ageVerified = "true";
      document.documentElement.dataset.ageGate = "closed";
      setOpen(false);
      setIsExiting(false);
    }, 400);
  }

  function leave() {
    if (isExiting) return;
    setIsExiting(true);
    window.setTimeout(() => {
      if (history.length > 1) history.back();
      else location.replace("https://www.google.com/");
    }, 320);
  }

  if (!open) return null;

  return (
    <div
      className={`age-gate${isExiting ? " age-gate-exiting" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-description"
    >
      <div className="age-gate-orbit orbit-one" aria-hidden="true" />
      <div className="age-gate-orbit orbit-two" aria-hidden="true" />
      <section className="age-gate-card">
        <div className="age-gate-art" aria-hidden="true">
          <img
            src="/nina-caution-18.jpg"
            alt="Nina Kurain 18+ Caution Age Verification"
            className="age-gate-art-img"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="age-gate-art-shade" />
          <div className="age-gate-wordmark"><BrandLogo height={64} width={96} priority /></div>
          <div className="age-gate-art-copy">
            <div className="age-gate-mandate-tag">
              <AlertTriangle size={13} />
              <span>18+ MANDATORY CAUTION</span>
            </div>
            <strong>Midnight Desires.<br />For Adults Only.</strong>
            <p className="age-gate-art-sub">Uncensored private archive &amp; raw boudoir media.</p>
          </div>
          <span className="age-gate-watermark">18+</span>
        </div>

        <div className="age-gate-content">
          <div className="age-gate-kicker">
            <span className="caution-pulse-dot" />
            <AlertTriangle size={14} className="caution-warn-icon" /> 18+ CAUTION · MANDATORY AGE VERIFICATION
          </div>
          <div className="age-gate-mark">
            <LockKeyhole size={24} />
          </div>
          <h1 id="age-gate-title">
            18+ Caution Notice:<br /><em>Adults Only Beyond Here.</em>
          </h1>
          <p id="age-gate-description">
            This website contains adult-oriented material, including nudity and sexually explicit content. By entering, you confirm that you are at least 18 years old and have reached the applicable age of majority required to view adult material in your jurisdiction.
          </p>

          <button
            ref={enterRef}
            className={`age-gate-enter${isExiting ? " is-exiting" : ""}`}
            type="button"
            onClick={enter}
            disabled={isExiting}
          >
            {isExiting ? (
              <>
                <Sparkles size={17} className="animate-spin" /> UNLOCKING PRIVATE ARCHIVE...
              </>
            ) : (
              <>
                <Flame size={17} /> ENTER — I AM 18+ <ArrowRight size={17} />
              </>
            )}
          </button>
          <button ref={leaveRef} className="age-gate-leave" type="button" onClick={leave} disabled={isExiting}>
            EXIT
          </button>
          <div className="age-gate-footer-legal">
            <p className="age-gate-legal-text">
              By entering this website, you confirm you are at least 18 years old and agree to our{" "}
              <a href="/terms-and-conditions" className="age-gate-legal-link">Terms &amp; Conditions</a>,{" "}
              <a href="/privacy-policy" className="age-gate-legal-link">Privacy Policy</a>, and{" "}
              <a href="/content-removal" className="age-gate-legal-link">Content Removal &amp; Safety</a>.
            </p>
            <small className="age-gate-legal-note">
              All creator content is copyrighted and watermarked. Recording or redistribution is strictly prohibited.
            </small>
          </div>
        </div>
      </section>
    </div>
  );
}
