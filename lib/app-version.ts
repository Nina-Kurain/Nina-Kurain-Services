/**
 * Centralized Application Version Management & Forced Update Engine
 * 
 * Every time a new update is released, incrementing CURRENT_REQUIRED_APP_VERSION
 * will automatically and unconditionally block all older versions from accessing
 * both the Member VIP app and the Creator Studio Admin app.
 */

export const CURRENT_REQUIRED_APP_VERSION = "2.1.0";
export const CURRENT_REQUIRED_VERSION_CODE = 3;
export const CURRENT_APP_RELEASE_DATE = "2026-09-26";

/**
 * Display-friendly short version label used across the website UI.
 * Derived from CURRENT_REQUIRED_APP_VERSION — change the version above
 * and every badge, button, and label on the site updates automatically.
 */
export const APP_VERSION_DISPLAY = `v${CURRENT_REQUIRED_APP_VERSION.split(".").slice(0, 2).join(".")}`;

/**
 * Minimum version as a float for the server-side API guard.
 */
export const MIN_REQUIRED_VERSION_FLOAT = parseFloat(CURRENT_REQUIRED_APP_VERSION);

export const APP_DOWNLOADS = {
  memberAndroid: "/downloads/NinaKurain.apk",
  adminAndroid: "/downloads/NinaKurainStudio.apk",
  iosProfile: "/downloads/NinaKurain.mobileconfig",
  iosIpa: "/downloads/NinaKurain.ipa",
  adminIosProfile: "/downloads/NinaKurainStudio.mobileconfig",
  adminIosIpa: "/downloads/NinaKurainStudio.ipa",
};

/**
 * Compare two semantic version strings (e.g. "2.1.0" vs "2.0.0").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const p1 = (v1 || "").replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const p2 = (v2 || "").replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const max = Math.max(p1.length, p2.length, 3);

  for (let i = 0; i < max; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Extract version number from NinaKurainApp User-Agent string.
 * Example User-Agent:
 *   "Mozilla/5.0 ... NinaKurainApp/2.1.0 (Android; SecureNative; v=2.1.0)" -> "2.1.0"
 *   "Mozilla/5.0 NinaKurainApp/2.0 (iOS; SecureNative)" -> "2.0"
 */
export function parseAppVersionFromUserAgent(ua: string): string | null {
  if (!ua) return null;
  const match = ua.match(/NinaKurainApp\/([0-9]+(?:\.[0-9]+)*)/i);
  return match ? match[1] : null;
}

/**
 * Check if a client User-Agent or version string is outdated.
 * If running inside NinaKurainApp, it must have version >= requiredVersion.
 */
export function isAppVersionOutdated(
  clientVersionOrUserAgent: string | null | undefined,
  requiredVersion: string = CURRENT_REQUIRED_APP_VERSION
): boolean {
  if (!clientVersionOrUserAgent) return false;

  const isNativeApp = /NinaKurainApp/i.test(clientVersionOrUserAgent);
  if (!isNativeApp) {
    // If not a native app UA, check if raw semver was passed
    if (/^[0-9]+(?:\.[0-9]+)*$/.test(clientVersionOrUserAgent.trim())) {
      return compareSemver(clientVersionOrUserAgent.trim(), requiredVersion) < 0;
    }
    return false;
  }

  const clientVersion = parseAppVersionFromUserAgent(clientVersionOrUserAgent);
  if (!clientVersion) {
    // Native app with missing version string is legacy v1.x -> strictly outdated
    return true;
  }

  return compareSemver(clientVersion, requiredVersion) < 0;
}
