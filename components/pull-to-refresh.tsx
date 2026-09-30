"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { RefreshCw, ArrowDown } from "lucide-react";

/**
 * Nina Kurain High-Security Pull-To-Refresh Component
 * 
 * Provides an intuitive, native-app-feeling swipe-down refresh at the top of the page.
 * 
 * SECURITY COMPLIANCE:
 * - Single-touch only (prevents interference with multi-touch / screenshot protection).
 * - Ignores active form inputs, studio editor, modals, and fullscreen video players to prevent accidental data loss.
 * - Enforces vertical directional dominance to preserve horizontal carousel/reel scrubbing.
 * - Does not trigger any selection, drag-and-drop, or right-click events.
 */

const THRESHOLD = 64; // Distance in px to trigger refresh
const MAX_PULL = 90; // Maximum visual travel in px

export function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isTrackingRef = useRef(false);
  const hasVibratedRef = useRef(false);

  // Check if touch target is inside a modal, editor, or media interactive element
  const isExcludedElement = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        '[role="dialog"], .live-dialog, .media-editor-modal, .media-editor-stage, ' +
        'input, textarea, select, [contenteditable="true"], ' +
        '.reel-fullscreen-stage, .fabric-canvas-container'
      )
    );
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isRefreshing) return;

    // Single touch only — avoid multi-touch security triggers
    if (e.touches.length !== 1) {
      isTrackingRef.current = false;
      return;
    }

    // Must be at the very top of the page
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY > 2) {
      isTrackingRef.current = false;
      return;
    }

    // Must not be inside an editor or modal
    if (isExcludedElement(e.target)) {
      isTrackingRef.current = false;
      return;
    }

    startYRef.current = e.touches[0].clientY;
    startXRef.current = e.touches[0].clientX;
    isTrackingRef.current = true;
    hasVibratedRef.current = false;
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTrackingRef.current || isRefreshing) return;
    if (e.touches.length !== 1) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - startYRef.current;
    const deltaX = currentX - startXRef.current;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollY > 2) {
      isTrackingRef.current = false;
      setPullDistance(0);
      setIsReady(false);
      return;
    }

    // Only activate on downward swipe with vertical dominance
    if (deltaY > 8 && deltaY > Math.abs(deltaX) * 1.3) {
      // Elastic resistance curve (diminishing returns as user pulls further)
      const dampedDistance = Math.min(MAX_PULL, deltaY * 0.42);
      setPullDistance(dampedDistance);

      const ready = dampedDistance >= THRESHOLD;
      setIsReady(ready);

      // Light haptic feedback when crossing threshold
      if (ready && !hasVibratedRef.current) {
        hasVibratedRef.current = true;
        try {
          if (navigator.vibrate) {
            navigator.vibrate(12);
          }
        } catch (_) {}
      } else if (!ready) {
        hasVibratedRef.current = false;
      }
    } else if (deltaY <= 0) {
      setPullDistance(0);
      setIsReady(false);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!isTrackingRef.current) return;
    isTrackingRef.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD - 10);

      // Subtle trigger sound/feedback and reload
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } else {
      setPullDistance(0);
      setIsReady(false);
    }
  }, [pullDistance, isRefreshing]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (pullDistance <= 0 && !isRefreshing) return null;

  const progress = Math.min(1, pullDistance / THRESHOLD);
  const rotation = progress * 180;

  return (
    <div
      className="nk-pull-to-refresh"
      style={{
        transform: `translate3d(0, ${pullDistance}px, 0)`,
        transition: isTrackingRef.current ? "none" : "transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
      aria-hidden="true"
    >
      <div className={`nk-pull-indicator ${isReady ? "ready" : ""} ${isRefreshing ? "refreshing" : ""}`}>
        {isRefreshing ? (
          <RefreshCw size={17} className="nk-refresh-spinner" />
        ) : (
          <ArrowDown
            size={16}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.15s ease",
            }}
          />
        )}
        <span className="nk-pull-label">
          {isRefreshing ? "Refreshing…" : isReady ? "Release to reload" : "Swipe to reload"}
        </span>
      </div>
    </div>
  );
}
