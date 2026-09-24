"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures Google AdSense Auto Ads refreshes and displays on all pages
 * during Next.js client-side Single Page Application (SPA) route transitions.
 * Any page exclusions configured in Google AdSense console will be honored automatically by Google.
 */
export function GoogleAdsenseListener() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip admin studio and api routes so ads never appear in creator workspace
    if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/api"))) {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // On client-side route change, trigger AdSense Auto-Ads scan for the new page
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (_) {
      // Ignore redundant push warnings
    }
  }, [pathname]);

  return null;
}
