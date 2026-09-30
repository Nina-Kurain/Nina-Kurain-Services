"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Sparkles, X } from "lucide-react";
import "./cinematic-intro.css";

export interface CinematicIntroProps {
  /**
   * If true, forces the intro to play even if not requested.
   */
  forcePlay?: boolean;
  /**
   * If true, automatically plays on first visit (defaults to true).
   */
  autoPlay?: boolean;
  /**
   * Callback fired when the intro sequence completes and the page is fully revealed.
   */
  onComplete?: () => void;
  /**
   * Creator name to display in the intro.
   */
  creatorName?: string;
  /**
   * Creator bio / introduction statement to display in the intro.
   */
  creatorBio?: string;
  /**
   * Subtitle or artistic disciplines.
   */
  creatorSubheading?: string;
  /**
   * Portrait or hero image preview.
   */
  heroImage?: string;
}

type IntroPhase = "welcome" | "creator" | "exiting" | "finished";

export function CinematicIntro({
  forcePlay = false,
  autoPlay = true,
  onComplete,
  creatorName = "Nina Kurain",
  creatorBio = "Intimate fine-art portraiture, sculpted chiaroscuro, and unhurried visual cinema. Enter the definitive private archives and contemporary visual world of Nina Kurain.",
  creatorSubheading = "Digital Creator · Visual Storyteller · Chiaroscuro & Motion",
  heroImage = "/nina-landing-hero.png",
}: CinematicIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>("finished");
  const [isMounted, setIsMounted] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const lockScroll = useCallback(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const unlockScroll = useCallback(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const finishIntro = useCallback(() => {
    clearAllTimers();
    setPhase("exiting");
    try {
      sessionStorage.setItem("nina_cinematic_intro_seen", "true");
    } catch (_) {}

    const tExit = setTimeout(() => {
      setPhase("finished");
      unlockScroll();
      onComplete?.();
    }, 300);
    timersRef.current.push(tExit);
  }, [clearAllTimers, unlockScroll, onComplete]);

  const scheduleTimers = useCallback(
    (startFrom: "welcome" | "creator" = "welcome") => {
      clearAllTimers();

      if (startFrom === "welcome") {
        const t1 = setTimeout(() => {
          setPhase("creator");
        }, 3200);
        const t2 = setTimeout(() => {
          finishIntro();
        }, 6500);
        timersRef.current.push(t1, t2);
      } else if (startFrom === "creator") {
        const t2 = setTimeout(() => {
          finishIntro();
        }, 3500);
        timersRef.current.push(t2);
      }
    },
    [clearAllTimers, finishIntro]
  );

  const handleTapToAdvance = useCallback(() => {
    if (phase === "welcome") {
      setPhase("creator");
      scheduleTimers("creator");
    } else {
      finishIntro();
    }
  }, [phase, scheduleTimers, finishIntro]);

  useEffect(() => {
    setIsMounted(true);

    const hasIntroParam =
      typeof window !== "undefined" &&
      (window.location.search.includes("intro") || window.location.hash.includes("intro"));

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem("nina_cinematic_intro_seen") === "true";
    } catch (_) {}

    const shouldPlay = forcePlay || hasIntroParam || (autoPlay && !alreadySeen);

    if (shouldPlay) {
      lockScroll();
      setPhase("welcome");
      scheduleTimers("welcome");

      const safeTimer = setTimeout(() => {
        finishIntro();
      }, 7000);
      timersRef.current.push(safeTimer);
    } else {
      setPhase("finished");
    }

    const handleReplayEvent = () => {
      lockScroll();
      setPhase("welcome");
      scheduleTimers("welcome");
    };

    window.addEventListener("replay-cinematic-intro", handleReplayEvent);

    return () => {
      clearAllTimers();
      unlockScroll();
      window.removeEventListener("replay-cinematic-intro", handleReplayEvent);
    };
  }, [forcePlay, autoPlay, scheduleTimers, clearAllTimers, finishIntro, lockScroll, unlockScroll]);

  if (!isMounted || phase === "finished" || typeof document === "undefined") {
    return null;
  }

  const stage = (
    <div
      className={`cinematic-intro-stage ${phase === "exiting" ? "is-exiting" : ""}`}
      onClick={handleTapToAdvance}
      role="dialog"
      aria-label="Welcome Introduction"
    >
      <div className="cinematic-ambient-veil" />
      <div className="cinematic-intro-glow orb-center" />
      <div className="cinematic-intro-glow orb-bottom" />

      {/* Top Close / Skip Button */}
      <button
        type="button"
        className="cinematic-skip-pill"
        onClick={(e) => {
          e.stopPropagation();
          finishIntro();
        }}
        aria-label="Skip intro and enter site"
      >
        <span>Skip Intro</span>
        <X size={15} className="skip-arrow" />
      </button>

      {/* Main Content Container */}
      <div className="cinematic-text-canvas">
        {phase === "welcome" ? (
          <div className="cinematic-frame frame-welcome" key="welcome">
            <div className="cinematic-portrait-badge">
              <div className="cinematic-badge-ring" />
              <img
                src={heroImage || "/nina-landing-hero.png"}
                alt={creatorName}
                className="cinematic-badge-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/nina-gallery/nina-kurain-01.jpeg";
                }}
              />
            </div>

            <div className="cinematic-kicker">
              <Sparkles size={14} className="sparkle-icon" />
              <span>THE CANONICAL DIGITAL ATELIER</span>
            </div>

            <p className="cinematic-greeting-sub">WELCOME TO THE WORLD OF</p>

            <h1 className="cinematic-text nina-title">
              {creatorName}
            </h1>

            <p className="cinematic-tag">{creatorSubheading}</p>

            <button
              type="button"
              className="cinematic-enter-btn"
              onClick={(e) => {
                e.stopPropagation();
                finishIntro();
              }}
            >
              <span>Explore Archive Directly</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="cinematic-frame frame-creator" key="creator">
            <div className="cinematic-kicker gold-shimmer">
              <Sparkles size={14} className="sparkle-icon" />
              <span>CREATOR INTRODUCTION & VISION</span>
            </div>

            <blockquote className="cinematic-intro-quote">
              &ldquo;{creatorBio}&rdquo;
            </blockquote>

            <div className="cinematic-disciplines-row">
              <span className="cinematic-pill-tag">Sculpted Chiaroscuro</span>
              <span className="cinematic-pill-dot" />
              <span className="cinematic-pill-tag">Authentic Handloom Silks</span>
              <span className="cinematic-pill-dot" />
              <span className="cinematic-pill-tag">Slow Sensory Motion</span>
            </div>

            <p className="cinematic-tag">CANONICAL ARCHIVES ONLINE · 2026</p>

            <button
              type="button"
              className="cinematic-enter-btn"
              onClick={(e) => {
                e.stopPropagation();
                finishIntro();
              }}
            >
              <span>Enter Gallery</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Step dots navigation */}
      <div className="cinematic-step-dots" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`cinematic-dot ${phase === "welcome" ? "is-active" : ""}`}
          onClick={() => {
            setPhase("welcome");
            scheduleTimers("welcome");
          }}
          aria-label="Slide 1: Welcome"
        />
        <button
          type="button"
          className={`cinematic-dot ${phase === "creator" ? "is-active" : ""}`}
          onClick={() => {
            setPhase("creator");
            scheduleTimers("creator");
          }}
          aria-label="Slide 2: Introduction"
        />
      </div>

      <div className="cinematic-tap-hint">
        <span>Tap anywhere to continue</span>
      </div>
    </div>
  );

  return createPortal(stage, document.body);
}

/**
 * Helper to programmatically replay the cinematic intro on demand.
 */
export function replayCinematicIntro() {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("nina_cinematic_intro_seen");
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("replay-cinematic-intro"));
  }
}
