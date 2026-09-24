"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ExternalLink } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export interface AdConfig {
  enabled: boolean;
  client?: string;
  inFeedSlot?: string;
  bannerSlot?: string;
  hideForPaid?: boolean;
  customHtml?: string;
}

interface AdSlotProps {
  placement: "in-feed" | "banner" | "sidebar";
  adsConfig?: AdConfig;
  userLevel?: number;
  className?: string;
}

export function AdSlot({
  placement,
  adsConfig,
  userLevel = 0,
  className = "",
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Compute conditions without returning early before hooks
  const isEnabled = Boolean(adsConfig && adsConfig.enabled);
  const hideForPaid = adsConfig?.hideForPaid !== false;
  const isHidden = !isEnabled || (hideForPaid && userLevel > 0);

  const slotId =
    placement === "in-feed"
      ? adsConfig?.inFeedSlot || adsConfig?.bannerSlot || ""
      : adsConfig?.bannerSlot || adsConfig?.inFeedSlot || "";

  useEffect(() => {
    if (isHidden || !adsConfig?.client) return;

    // Load Google AdSense script dynamically if not already present
    try {
      const existingScript = document.getElementById("google-adsense-script");
      if (!existingScript && adsConfig.client) {
        const script = document.createElement("script");
        script.id = "google-adsense-script";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
          adsConfig.client
        )}`;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onerror = () => {
          // Blocked by client (ad blocker) - handle silently without crash
          setAdError(true);
        };
        document.head.appendChild(script);
      }
    } catch (_) {
      setAdError(true);
    }

    // Push ad request safely
    try {
      if (typeof window !== "undefined" && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (e) {
      setAdError(true);
    }
  }, [isHidden, adsConfig?.client, slotId]);

  // Safe early exit AFTER all hooks have run
  if (isHidden || !adsConfig) {
    return null;
  }

  // Case 1: Custom Sponsor / HTML Banner code provided
  if (adsConfig.customHtml && !adsConfig.client) {
    return (
      <div className={`ad-slot-wrap placement-${placement} ${className}`}>
        <div className="ad-sponsor-label">
          <span>SPONSORED</span>
        </div>
        <div
          className="ad-custom-html-container"
          dangerouslySetInnerHTML={{ __html: adsConfig.customHtml }}
        />
      </div>
    );
  }

  // Case 2: Google AdSense Unit Configured
  if (adsConfig.client) {
    return (
      <div className={`ad-slot-wrap placement-${placement} ${className}`}>
        <div className="ad-sponsor-label">
          <span>ADVERTISEMENT</span>
        </div>
        <div className="ad-google-container">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={adsConfig.client}
            data-ad-slot={slotId || undefined}
            data-ad-format={placement === "in-feed" ? "fluid" : "auto"}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Case 3: Dedicated Ad Slot Ready (Waiting for Publisher ID / Ad Setup)
  return (
    <div className={`ad-slot-wrap placement-${placement} ad-preview-slot ${className}`}>
      <div className="ad-preview-inner">
        <div className="ad-preview-badge">
          <Sparkles size={13} />
          <span>DEDICATED SPONSOR SPACE</span>
        </div>
        <h4>Monetize Your Audience Cleanly</h4>
        <p>
          Dedicated ad space configured. Add your <strong>Google AdSense Publisher ID</strong> in Studio Settings to start earning.
        </p>
      </div>
    </div>
  );
}
