"use client";

import { useEffect, useState, useRef } from "react";
import { ShieldAlert, Lock, EyeOff } from "lucide-react";
import { securityEngine, type SecurityEventDetail } from "./anti-copy";

/**
 * ============================================================================
 * NINA KURAIN PERMANENT SECURITY GUARD COMPONENT
 * PATH: /security/SecurityGuard.tsx
 * 
 * CRITICAL DIRECTIVE:
 * THIS COMPONENT IS MOUNTED IN ROOT LAYOUT.
 * DO NOT REMOVE, OVERRIDE, OR WEAKEN IN ANY FUTURE APPLICATION UPDATE.
 * ============================================================================
 */
export function SecurityGuard() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [curtainVisible, setCurtainVisible] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Initialize permanent security engine
    const cleanup = securityEngine.init();

    // 2. Subscribe to security violation events
    const unsubscribe = securityEngine.subscribe((detail: SecurityEventDetail) => {
      setToastMessage(detail.message);
      setToastVisible(true);

      if (detail.type === "screenshot" || detail.type === "mobile_capture") {
        setCurtainVisible(true);
      }

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = setTimeout(() => {
        setToastVisible(false);
        setCurtainVisible(false);
      }, 3200);
    });

    return () => {
      cleanup();
      unsubscribe();
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Permanent Anti-Screenshot & Screen Capture Security Curtain */}
      <aside
        id="nk-permanent-security-curtain"
        className={`nk-security-curtain ${curtainVisible ? "is-active" : ""}`}
        aria-hidden="true"
        role="presentation"
      >
        <div className="nk-curtain-card">
          <div className="nk-curtain-icon">
            <Lock size={32} strokeWidth={2} />
          </div>
          <span className="nk-curtain-badge">Security Policy Active</span>
          <h2 className="nk-curtain-title">Can&apos;t take screenshot due to security policy</h2>
          <p className="nk-curtain-text">
            Screenshots and screen recordings are restricted on this website.
          </p>
        </div>
      </aside>

      {/* Authentic Android System Toast Pill */}
      <div
        id="nk-android-system-toast"
        className={`nk-security-toast ${toastVisible ? "is-visible" : ""}`}
        role="alert"
        aria-live="assertive"
      >
        <span>{toastMessage || "Can't take screenshot due to security policy"}</span>
      </div>
    </>
  );
}

export default SecurityGuard;
