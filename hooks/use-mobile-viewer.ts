"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const query = "(max-width: 849px)";

function subscribe(notify: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("resize", notify);
  window.addEventListener("orientationchange", notify);
  const media = window.matchMedia(query);
  media.addEventListener?.("change", notify);
  return () => {
    window.removeEventListener("resize", notify);
    window.removeEventListener("orientationchange", notify);
    media.removeEventListener?.("change", notify);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 849 || window.matchMedia(query).matches;
}

export function useMobileViewer() {
  const syncMatches = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (typeof window !== "undefined" && mounted) {
    return window.innerWidth <= 849 || syncMatches;
  }
  return syncMatches;
}
