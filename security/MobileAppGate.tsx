"use client";

import { useEffect, useState } from "react";
import { Shield, Smartphone, Download, Lock, CheckCircle, Apple, AlertTriangle, Monitor } from "lucide-react";

/**
 * ============================================================================
 * NINA KURAIN MOBILE APP ENFORCEMENT GATE
 * PATH: /security/MobileAppGate.tsx
 * 
 * DIRECTIVE:
 * Standard mobile browsers (Chrome / Safari) cannot block physical hardware
 * screenshots (Power + Volume). To maintain 100% confidential protection,
 * mobile browsing is blocked, prompting visitors to use the official secure app.
 * ============================================================================
 */
export function MobileAppGate() {
  const [isMobileBrowser, setIsMobileBrowser] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || "").toLowerCase();

    // 1. Check if already inside the official Nina Kurain native apps
    const isOfficialApp = 
      ua.includes("ninakurainapp") || 
      window.location.search.includes("isApp=1") ||
      window.location.search.includes("native=true") ||
      document.cookie.includes("nk_app_authenticated=1");

    if (isOfficialApp) {
      setIsMobileBrowser(false);
      return;
    }

    // 2. Detect mobile operating systems or small touchscreens
    const isMobileDevice =
      /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua) ||
      (window.innerWidth <= 820 && ("ontouchstart" in window || navigator.maxTouchPoints > 0));

    if (isMobileDevice) {
      setIsMobileBrowser(true);
      // Freeze body scrolling so mobile users cannot bypass
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
  }, []);

  if (!isMobileBrowser) {
    return null;
  }

  return (
    <div
      id="nk-mobile-app-gate"
      className="nk-mobile-gate-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nk-gate-title"
    >
      <div className="nk-mobile-gate-card">
        {/* Security Shield Header */}
        <div className="nk-gate-header">
          <div className="nk-gate-icon-pulse">
            <div className="nk-gate-icon">
              <Lock size={32} strokeWidth={2.2} />
            </div>
          </div>
          <span className="nk-gate-badge">
            <Shield size={12} className="inline mr-1" /> Hardware Security Policy
          </span>
          <h1 id="nk-gate-title" className="nk-gate-title">
            Official Mobile App Required
          </h1>
          <p className="nk-gate-description">
            To ensure complete intellectual property protection and <strong>zero-leak hardware screenshot blocking</strong>, direct browsing on standard mobile browsers is restricted.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="nk-gate-features">
          <div className="nk-gate-feature-item">
            <CheckCircle size={16} className="nk-feature-check" />
            <span>Hardware Screenshot & Recording Block (FLAG_SECURE)</span>
          </div>
          <div className="nk-gate-feature-item">
            <CheckCircle size={16} className="nk-feature-check" />
            <span>High-Speed 4K Private Video & Photo Streaming</span>
          </div>
          <div className="nk-gate-feature-item">
            <CheckCircle size={16} className="nk-feature-check" />
            <span>Encrypted Member Vault & Instant Feed Notifications</span>
          </div>
        </div>

        {/* Actions: Download Android APK / iOS Guide */}
        <div className="nk-gate-actions">
          <a
            href="/downloads/Nina-Kurain-Signature-Edition.apk"
            download="Nina-Kurain-Signature-Edition.apk"
            className="nk-gate-btn nk-gate-btn-primary"
            onClick={() => {
              // Trigger direct download
            }}
          >
            <Download size={18} />
            <span>Download Nina Kurain · Signature Edition (.apk)</span>
          </a>

          <a
            href="itms-services://?action=download-manifest&url=https://ninakurainservices.in/downloads/manifest.plist"
            className="nk-gate-btn nk-gate-btn-secondary"
            onClick={(e) => {
              // If not on iOS, show the modal instead of failing itms-services
              const ua = navigator.userAgent.toLowerCase();
              if (!/iphone|ipad|ipod/.test(ua)) {
                e.preventDefault();
                setShowIosModal(true);
              }
            }}
          >
            <Apple size={18} />
            <span>Install for iPhone / iOS (Direct)</span>
          </a>

          <button
            type="button"
            className="text-[11.5px] text-[#ff85a1] underline opacity-80 hover:opacity-100 transition-opacity mt-1 cursor-pointer bg-transparent border-0"
            onClick={() => setShowIosModal(true)}
          >
            iOS Setup & Sideloading Instructions
          </button>
        </div>

        {/* Desktop Note */}
        <div className="nk-gate-footer">
          <p className="nk-gate-desktop-hint">
            <Monitor size={14} className="inline mr-1.5 opacity-70" />
            Using a desktop or laptop? Nina Kurain is available without restriction on PC, Mac, and Linux browsers.
          </p>
        </div>
      </div>

      {/* iOS Modal */}
      {showIosModal && (
        <div className="nk-ios-modal-overlay" onClick={() => setShowIosModal(false)}>
          <div className="nk-ios-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nk-ios-modal-header">
              <Apple size={28} className="text-[#ff7593]" />
              <h3>Nina Kurain for iOS (iPhone/iPad)</h3>
            </div>
            <p className="nk-ios-modal-text">
              Hardware screenshot protection with official streaming for iPhone &amp; iPad.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0" }}>
              <a
                href="itms-services://?action=download-manifest&url=https://ninakurainservices.in/downloads/manifest.plist"
                className="nk-gate-btn nk-gate-btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Apple size={18} />
                <span>1. Install Direct (Safari on iOS)</span>
              </a>

              <a
                href="/downloads/NinaKurain.ipa"
                download="NinaKurain.ipa"
                className="nk-gate-btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  color: "#fff",
                }}
              >
                <Download size={18} />
                <span>2. Download NinaKurain.ipa (Direct File)</span>
              </a>
            </div>

            <div className="nk-ios-instructions">
              <div className="nk-ios-step">
                <span className="nk-step-num">1</span>
                <span><strong>Over-The-Air:</strong> Tap <em>Install Direct</em> in Safari on your iPhone, or install the downloaded <code>.ipa</code> package using AltStore, Sideloadly, or Scarlet.</span>
              </div>
              <div className="nk-ios-step">
                <span className="nk-step-num">2</span>
                <span><strong>Trust Profile:</strong> On your iPhone, open <em>Settings &gt; General &gt; VPN &amp; Device Management</em> and tap <em>Trust</em> to start streaming.</span>
              </div>
            </div>
            <button
              type="button"
              className="nk-ios-close-btn"
              onClick={() => setShowIosModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileAppGate;
