"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Apple, Flame, Sparkles, LockKeyhole, Heart } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function MobileAppGate() {
  const pathname = usePathname() || "";
  const [shouldShow, setShouldShow] = useState(false);
  const [osType, setOsType] = useState<"android" | "ios" | "other">("other");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const isStandalone =
      (window.navigator as any).standalone === true ||
      (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) ||
      /NinaKurainApp/i.test(ua);
    if (isStandalone) return;

    const path = pathname.toLowerCase();
    // Admin / Creator studio is 100% exempt from the mobile app gate
    if (path.startsWith("/admin")) return;

    const host = window.location.hostname.toLowerCase();
    const isVipHost = host.startsWith("vip.");
    const isVipPath =
      (isVipHost && !path.startsWith("/api")) ||
      path.startsWith("/feed") ||
      path.startsWith("/reels") ||
      path.startsWith("/saved") ||
      path.startsWith("/account") ||
      path.startsWith("/login") ||
      path.startsWith("/signup") ||
      path.startsWith("/complete-profile") ||
      path.startsWith("/welcome") ||
      path.startsWith("/updates") ||
      path.startsWith("/profile") ||
      path.startsWith("/memberships") ||
      path.startsWith("/pricing") ||
      path.startsWith("/vault");

    if (!isVipPath) return;

    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isMobile = window.innerWidth <= 820 || isAndroid || isIOS;

    if (isMobile) {
      if (isAndroid) setOsType("android");
      else if (isIOS) setOsType("ios");
      setShouldShow(true);
    }
  }, [pathname]);

  if (!shouldShow) return null;

  return (
    <div
      id="nk-vip-mobile-gate"
      className="nk-mobile-gate-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(7, 3, 6, 0.96)",
        backdropFilter: "blur(26px) saturate(180%)",
        WebkitBackdropFilter: "blur(26px) saturate(180%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
        overflowY: "auto",
      }}
    >
      <div
        className="nk-vip-gate-card"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(180deg, rgba(28, 12, 24, 0.98) 0%, rgba(14, 7, 12, 0.99) 100%)",
          border: "1px solid rgba(255, 45, 117, 0.38)",
          borderRadius: 24,
          padding: "32px 22px 28px",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.88), 0 0 45px rgba(224, 72, 108, 0.22)",
          textAlign: "center",
          color: "#f6e8ef",
          margin: "auto",
        }}
      >
        <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: 14 }}>
          <a href="https://ninakurainservices.in" className="wordmark" aria-label="Nina Kurain Official Website" title="Nina Kurain Official Website">
            <BrandLogo height={48} width={74} priority />
          </a>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255, 45, 117, 0.16)",
            border: "1px solid rgba(255, 45, 117, 0.4)",
            color: "#ff85a1",
            borderRadius: 999,
            padding: "4px 14px",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          <Flame size={13} /> Come Closer To Me
        </div>

        <h1
          style={{
            fontSize: "clamp(22px, 6vw, 26px)",
            fontWeight: 700,
            lineHeight: 1.18,
            color: "#fff",
            margin: "0 0 10px",
          }}
        >
          Keep Me in Your Pocket
        </h1>

        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#d8c4cd", margin: "0 0 22px" }}>
          I want to be closer to you. Download my private app and take me wherever you go—my unfiltered boudoir moments, late-night confessions, and most intimate tapes are waiting just for you.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            textAlign: "left",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#f2e4eb" }}>
            <Sparkles size={16} style={{ color: "#ff85a1", flexShrink: 0 }} />
            <span>Uncensored Boudoir &amp; Bedroom Tapes</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#f2e4eb" }}>
            <Heart size={16} style={{ color: "#ff85a1", flexShrink: 0 }} />
            <span>Private Bedroom Whispers &amp; Confessions</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#f2e4eb" }}>
            <LockKeyhole size={16} style={{ color: "#ff85a1", flexShrink: 0 }} />
            <span>Always Right There When You Crave Me</span>
          </div>
        </div>

        {/* Dynamic OS-Exclusive Download Options */}
        {osType === "android" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <a
              href="/downloads/NinaKurain.apk"
              download="NinaKurain.apk"
              className="button"
              style={{
                background: "linear-gradient(135deg, #e54b7c, #982f55)",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 14,
                minHeight: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 14,
                boxShadow: "0 8px 24px rgba(229, 75, 124, 0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <Download size={18} />
              <span>Download Nina&apos;s App (.apk)</span>
            </a>
            <span style={{ fontSize: 12, color: "#a5949d" }}>
              1-Tap Direct Download · Come inside with me
            </span>
          </div>
        ) : osType === "ios" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                background: "rgba(229, 75, 124, 0.09)",
                border: "1px solid rgba(229, 75, 124, 0.35)",
                borderRadius: 16,
                padding: "16px 14px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Apple size={18} color="#ff85a1" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  iPhone / iPad Direct Install
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5, color: "#f0dbe5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#e54b7c", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                    1
                  </span>
                  <span>
                    Tap Safari&apos;s <strong>Share</strong> button <span style={{ display: "inline-block", padding: "1px 6px", background: "rgba(255,255,255,0.18)", borderRadius: 5, fontSize: 12 }}>⎋</span> below
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#e54b7c", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> <span style={{ display: "inline-block", padding: "1px 6px", background: "rgba(255,255,255,0.18)", borderRadius: 5, fontSize: 12 }}>➕</span>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#e54b7c", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                    3
                  </span>
                  <span>
                    Tap <strong>Add</strong> — open Nina from your screen!
                  </span>
                </div>
              </div>
            </div>

            <a
              href="/downloads/NinaKurain.mobileconfig"
              download="NinaKurain.mobileconfig"
              className="button"
              style={{
                background: "linear-gradient(135deg, #e54b7c, #982f55)",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 14,
                minHeight: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 13.5,
                boxShadow: "0 8px 24px rgba(229, 75, 124, 0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <Apple size={18} />
              <span>1-Tap Install iOS Profile</span>
            </a>

            <a
              href="/downloads/NinaKurain.ipa"
              download="NinaKurain.ipa"
              className="button quiet-button"
              style={{
                borderRadius: 12,
                minHeight: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 12,
                color: "#ff85a1",
                border: "1px solid rgba(224, 72, 108, 0.35)",
              }}
            >
              <Download size={15} />
              <span>Download .ipa for AltStore / Scarlet</span>
            </a>
            <span style={{ fontSize: 11.5, color: "#a5949d" }}>
              Fast 3-second setup · Come inside with me
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href="/downloads/NinaKurain.apk"
              download="NinaKurain.apk"
              className="button"
              style={{ minHeight: 48, borderRadius: 12 }}
            >
              <Download size={18} /> Download Android App (.apk)
            </a>
            <a
              href="/downloads/NinaKurain.mobileconfig"
              download="NinaKurain.mobileconfig"
              className="button quiet-button"
              style={{ minHeight: 44, borderRadius: 12 }}
            >
              <Apple size={18} /> Install iOS App (iPhone / iPad)
            </a>
          </div>
        )}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 22, paddingTop: 14 }}>
          <p style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.45)", margin: 0 }}>
            Visiting from your computer? You can also explore on desktop.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MobileAppGate;
