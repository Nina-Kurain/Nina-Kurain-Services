"use client";

import { useEffect } from "react";
import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error?.digest?.startsWith("NEXT_REDIRECT;")) {
      const parts = error.digest.split(";");
      const targetUrl = parts[2] || "/admin/login";
      window.location.replace(targetUrl);
      return;
    }
    console.error("Nina Kurain App error:", error);
    if (error?.digest) console.error("Error digest:", error.digest);
    if (error?.message) console.error("Error message:", error.message);
  }, [error]);

  const handleRetry = () => {
    try {
      if (typeof reset === "function") {
        reset();
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  return (
    <main className="app-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
      <div style={{ maxWidth: 460, width: "100%", background: "rgba(22, 12, 24, 0.85)", border: "1px solid rgba(255, 45, 117, 0.25)", borderRadius: 16, padding: "40px 32px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <BrandLogo height={48} width={72} priority />
        </div>
        
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255, 45, 117, 0.12)", color: "#ff2d75", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>
          <ShieldAlert size={15} />
          <span>VIP SESSION NOTICE</span>
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Momentarily Unavailable
        </h1>

        <p style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.6, marginBottom: 28 }}>
          Your private connection encountered a brief delay while preparing Nina Kurain&apos;s exclusive content. Tap retry to reconnect immediately.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            type="button"
            onClick={handleRetry}
            className="button"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 20px", fontSize: "0.95rem" }}
          >
            <RefreshCw size={16} />
            <span>RETRY NOW</span>
          </button>

          <Link
            href="/admin/login"
            className="button quiet-button"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 20px", fontSize: "0.95rem" }}
          >
            <Home size={16} />
            <span>SIGN IN TO CREATOR STUDIO</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
