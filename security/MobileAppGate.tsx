"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Apple, Flame, Sparkles, LockKeyhole, Heart, AlertTriangle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import {
  CURRENT_REQUIRED_APP_VERSION,
  APP_VERSION_DISPLAY,
  isAppVersionOutdated,
  parseAppVersionFromUserAgent,
  APP_DOWNLOADS,
} from "@/lib/app-version";

/**
 * Trigger a file download that works reliably inside Android/iOS WebView.
 * 1. Tries Android JS bridge (AndroidSecurity.downloadFile) — direct DownloadManager
 * 2. Tries Android JS bridge (AndroidSecurity.openInBrowser) — opens Chrome
 * 3. Falls back to window.open() for iOS/other
 * 4. Final fallback: direct navigation
 */
function triggerDownload(url: string, e?: React.MouseEvent) {
  // Build absolute URL if relative
  const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

  try {
    // Android JS bridge — bypasses all WebView restrictions
    const bridge = (window as any).AndroidSecurity;
    if (bridge) {
      if (typeof bridge.downloadFile === "function") {
        e?.preventDefault();
        bridge.downloadFile(absoluteUrl);
        return;
      }
      if (typeof bridge.openInBrowser === "function") {
        e?.preventDefault();
        bridge.openInBrowser(absoluteUrl);
        return;
      }
    }
  } catch (_) {}

  // iOS / fallback: open in system browser
  try {
    e?.preventDefault();
    window.open(absoluteUrl, "_blank");
  } catch (_) {
    // Let the <a> tag navigate normally
  }
}

export function MobileAppGate() {
  const pathname = usePathname() || "";
  const [requiredVersion, setRequiredVersion] = useState<string>(CURRENT_REQUIRED_APP_VERSION);
  const [clientAppVersion, setClientAppVersion] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return parseAppVersionFromUserAgent(navigator.userAgent || "");
  });
  const [isOutdatedApp, setIsOutdatedApp] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent || "";
    return isAppVersionOutdated(ua, CURRENT_REQUIRED_APP_VERSION);
  });
  const [shouldShow, setShouldShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent || "";
    return isAppVersionOutdated(ua, CURRENT_REQUIRED_APP_VERSION);
  });
  const [osType, setOsType] = useState<"android" | "ios" | "other">(() => {
    if (typeof window === "undefined") return "other";
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "android";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";
    return "other";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const isNativeApp = /NinaKurainApp/i.test(ua);
    const clientV = parseAppVersionFromUserAgent(ua) || (isNativeApp ? "1.0.0" : null);
    setClientAppVersion(clientV);

    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    if (isAndroid) setOsType("android");
    else if (isIOS) setOsType("ios");

    // 1. Immediate sync check against current bundled required version
    const isOutdated = isAppVersionOutdated(ua, CURRENT_REQUIRED_APP_VERSION);
    if (isOutdated) {
      setIsOutdatedApp(true);
      setShouldShow(true);
      document.body.style.overflow = "hidden";
      return;
    }

    // 2. Dynamic live server check: ping /api/version with no-cache
    if (isNativeApp) {
      fetch(`/api/version?v=${encodeURIComponent(clientV || "")}&t=${Date.now()}`)
        .then((res) => res.json())
        .then((data: any) => {
          if (data?.requiredVersion) {
            setRequiredVersion(data.requiredVersion);
            if (data.isOutdated || isAppVersionOutdated(ua, data.requiredVersion)) {
              setIsOutdatedApp(true);
              setShouldShow(true);
              document.body.style.overflow = "hidden";
            }
          }
        })
        .catch(() => {});
    }

    const isStandalone =
      (window.navigator as any).standalone === true ||
      (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) ||
      (isNativeApp && !isOutdated);
    if (isStandalone) return;

    const path = pathname.toLowerCase();
    const isAdminPath = path.startsWith("/admin");

    const host = window.location.hostname.toLowerCase();
    const isVipHost = host.startsWith("vip.");
    const isVipPath =
      isAdminPath ||
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

    const isMobile = window.innerWidth <= 820 || isAndroid || isIOS;

    if (isMobile) {
      setShouldShow(true);
    }
  }, [pathname]);

  if (!shouldShow) return null;

  if (isOutdatedApp) {
    const isAdminPath = pathname.toLowerCase().startsWith("/admin");
    return (
      <div
        id="nk-vip-update-gate"
        className="nk-mobile-gate-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          background: "rgba(7, 3, 6, 0.98)",
          backdropFilter: "blur(30px) saturate(190%)",
          WebkitBackdropFilter: "blur(30px) saturate(190%)",
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
            maxWidth: 440,
            background: "linear-gradient(180deg, rgba(32, 12, 22, 0.98) 0%, rgba(14, 6, 11, 0.99) 100%)",
            border: "1px solid rgba(255, 68, 120, 0.5)",
            borderRadius: 24,
            padding: "32px 24px 28px",
            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 45, 117, 0.3)",
            textAlign: "center",
            color: "#f6e8ef",
            margin: "auto",
          }}
        >
          <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: 14 }}>
            <BrandLogo height={48} width={74} priority />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(255, 45, 117, 0.2)",
              border: "1px solid rgba(255, 68, 120, 0.6)",
              color: "#ff7096",
              borderRadius: 999,
              padding: "5px 14px",
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <AlertTriangle size={14} /> Mandatory App Update Required
          </div>

          <h1
            style={{
              fontSize: "clamp(22px, 6vw, 26px)",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#fff",
              margin: "0 0 10px",
            }}
          >
            {isAdminPath
              ? `Creator Studio (v${requiredVersion} Required)`
              : `Update to Latest Version (v${requiredVersion})`}
          </h1>

          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#d8c4cd", margin: "0 0 20px" }}>
            You are using an older version of the application. Both member and creator portals require version v{requiredVersion} for security, DRM encryption, and uninterrupted service.
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
              marginBottom: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#f2e4eb" }}>
              <Sparkles size={16} style={{ color: "#ff85a1", flexShrink: 0 }} />
              <span>Full compatibility with current server release</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#f2e4eb" }}>
              <LockKeyhole size={16} style={{ color: "#ff85a1", flexShrink: 0 }} />
              <span>Enhanced session encryption &amp; biometric privacy</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#f2e4eb" }}>
              <Heart size={16} style={{ color: "#ff85a1", flexShrink: 0 }} />
              <span>Your saved account, credentials &amp; VIP perks remain 100% safe</span>
            </div>
          </div>

          {isAdminPath ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href={APP_DOWNLOADS.adminAndroid}
                download="NinaKurainStudio.apk"
                onClick={e => triggerDownload(APP_DOWNLOADS.adminAndroid, e)}
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
                <span>Download Creator Studio v{requiredVersion} (.apk)</span>
              </a>
              <span style={{ fontSize: 12, color: "#a5949d" }}>
                Install over existing app · Settings &amp; credentials preserved
              </span>
            </div>
          ) : osType === "ios" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href="/api/downloads/ios-profile?target=member"
                onClick={e => triggerDownload("/api/downloads/ios-profile?target=member", e)}
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
                <span>Install VIP App iOS Profile (v{requiredVersion})</span>
              </a>
              <a
                href={`itms-services://?action=download-manifest&url=${encodeURIComponent("https://ninakurainservices.in/downloads/manifest.plist")}`}
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
                <span>OTA Install VIP Native App (v{requiredVersion})</span>
              </a>
              <span style={{ fontSize: 11.5, color: "#a5949d" }}>
                Official Nina Kurain VIP iOS · Fast setup
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href={APP_DOWNLOADS.memberAndroid}
                download="NinaKurain.apk"
                onClick={e => triggerDownload(APP_DOWNLOADS.memberAndroid, e)}
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
                <span>Download Latest VIP App (v{requiredVersion} .apk)</span>
              </a>
              <span style={{ fontSize: 12, color: "#a5949d" }}>
                1-Tap Install over old app · Your membership is preserved
              </span>
            </div>
          )}

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 22, paddingTop: 14 }}>
            <p style={{ fontSize: 11.5, color: "#ff85a1", margin: 0, fontWeight: 600 }}>
              Access is locked until the latest version is installed.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

        {pathname.toLowerCase().startsWith("/admin") ? (
          <>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(224, 72, 108, 0.2)",
                border: "1px solid rgba(255, 68, 120, 0.5)",
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
              <Sparkles size={13} /> Official Studio App Required
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
              Creator Studio {APP_VERSION_DISPLAY}
            </h1>

            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#d8c4cd", margin: "0 0 22px" }}>
              Mobile access to Nina Kurain Studio requires the official Creator Studio application for hardware screenshot authorization, direct 4K video reel publishing, and full studio editor controls.
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
                <span>Hardware screenshots permitted for admin</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#f2e4eb" }}>
                <LockKeyhole size={16} style={{ color: "#ff85a1", flexShrink: 0 }} />
                <span>90-Day persistent session — no frequent re-logins</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#f2e4eb" }}>
                <Heart size={16} style={{ color: "#ff85a1", flexShrink: 0 }} />
                <span>Upload media directly from phone gallery &amp; camera</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {osType === "ios" ? (
                <>
                  <a
                    href="/api/downloads/ios-profile?target=studio"
                    onClick={e => triggerDownload("/api/downloads/ios-profile?target=studio", e)}
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
                    <Apple size={18} />
                    <span>Install Creator Studio iOS Profile (v{requiredVersion})</span>
                  </a>
                  <a
                    href={`itms-services://?action=download-manifest&url=${encodeURIComponent("https://ninakurainservices.in/downloads/manifest-studio.plist")}`}
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
                    <span>OTA Install Creator Studio (v{requiredVersion})</span>
                  </a>
                </>
              ) : (
                <a
                  href={APP_DOWNLOADS.adminAndroid}
                  download="NinaKurainStudio.apk"
                  onClick={e => triggerDownload(APP_DOWNLOADS.adminAndroid, e)}
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
                  <span>Download Creator Studio (.apk v{requiredVersion})</span>
                </a>
              )}
              <span style={{ fontSize: 12, color: "#a5949d" }}>
                Official Creator Release · Install over existing app
              </span>
            </div>
          </>
        ) : (
          <>
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
                  href={APP_DOWNLOADS.memberAndroid}
                  download="NinaKurain.apk"
                  onClick={e => triggerDownload(APP_DOWNLOADS.memberAndroid, e)}
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
                  <span>Download Nina&apos;s VIP App (.apk v{requiredVersion})</span>
                </a>
                <span style={{ fontSize: 12, color: "#a5949d" }}>
                  Official v{requiredVersion} Release · Fast 1-tap download
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
                  iPhone / iPad Direct Install ({APP_VERSION_DISPLAY})
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
              href="/api/downloads/ios-profile?target=member"
              onClick={e => triggerDownload("/api/downloads/ios-profile?target=member", e)}
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
              <span>1-Tap Install iOS Profile (v{requiredVersion})</span>
            </a>

            <a
              href={`itms-services://?action=download-manifest&url=${encodeURIComponent("https://ninakurainservices.in/downloads/manifest.plist")}`}
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
              <span>OTA Install .ipa (v{requiredVersion})</span>
            </a>
            <span style={{ fontSize: 11.5, color: "#a5949d" }}>
              Fast 3-second setup · Come inside with me
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href={APP_DOWNLOADS.memberAndroid}
              download="NinaKurain.apk"
              onClick={e => triggerDownload(APP_DOWNLOADS.memberAndroid, e)}
              className="button"
              style={{ minHeight: 48, borderRadius: 12 }}
            >
              <Download size={18} /> Download Android App (.apk v{requiredVersion})
            </a>
            <a
              href="/api/downloads/ios-profile?target=member"
              onClick={e => triggerDownload("/api/downloads/ios-profile?target=member", e)}
              className="button quiet-button"
              style={{ minHeight: 44, borderRadius: 12 }}
            >
              <Apple size={18} /> Install iOS App (v{requiredVersion})
            </a>
          </div>
        )}
          </>
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
