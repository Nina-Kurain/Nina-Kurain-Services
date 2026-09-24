"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { LogOut, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"confirm" | "logging_out" | "done">("confirm");
  const [error, setError] = useState("");

  const performLogout = async () => {
    setStatus("logging_out");
    setError("");
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Could not log out cleanly.");
      }
      try {
        sessionStorage.removeItem("afterglow-auth-user");
      } catch {
        // ignore
      }
      setStatus("done");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout encountered an issue.");
      setStatus("confirm");
    }
  };

  return (
    <main className="app-page logout-page-container" style={{
      minHeight: "100dvh",
      display: "grid",
      placeItems: "center",
      padding: "24px 16px",
      background: "radial-gradient(ellipse at 50% 30%, rgba(229,107,131,0.08) 0%, rgba(13,9,13,0.98) 70%)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "var(--ag-surface, #180e16)",
        border: "1px solid var(--ag-line-strong, rgba(255,255,255,0.12))",
        borderRadius: 16,
        padding: "36px 28px",
        textAlign: "center",
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Link href="/" aria-label="Home">
            <BrandLogo height={52} width={78} priority />
          </Link>
        </div>

        {status === "confirm" && (
          <>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(229,107,131,0.15)",
              color: "var(--ag-rose, #e56b83)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}>
              <LogOut size={24} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: "var(--ag-text, #fff)" }}>
              Sign out of your account?
            </h1>
            <p style={{ fontSize: 14, color: "var(--ag-muted, #b39ba8)", margin: "0 0 24px", lineHeight: 1.5 }}>
              You will need to sign back in to access your private member feed, drops, and subscriptions.
            </p>

            {error && (
              <p style={{ color: "#ff6b8b", fontSize: 13, marginBottom: 16 }}>{error}</p>
            )}

            <div style={{ display: "grid", gap: 10 }}>
              <Button
                type="button"
                className="button"
                style={{
                  width: "100%",
                  minHeight: 44,
                  background: "var(--ag-rose, #e56b83)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                }}
                onClick={performLogout}
              >
                <LogOut size={16} style={{ marginRight: 6 }} /> Yes, log out
              </Button>
              <Button
                type="button"
                variant="outline"
                style={{ width: "100%", minHeight: 44 }}
                onClick={() => window.history.length > 1 ? router.back() : router.push("/feed")}
              >
                Cancel &amp; return
              </Button>
            </div>
          </>
        )}

        {status === "logging_out" && (
          <div style={{ padding: "20px 0" }}>
            <Loader2 size={36} className="spin" style={{ color: "var(--ag-rose, #e56b83)", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>Signing you out…</h2>
            <p style={{ fontSize: 13, color: "var(--ag-muted, #aaa)" }}>Clearing secure member credentials.</p>
          </div>
        )}

        {status === "done" && (
          <div style={{ padding: "20px 0" }}>
            <CheckCircle2 size={40} style={{ color: "#4ade80", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>You’ve been logged out</h2>
            <p style={{ fontSize: 13, color: "var(--ag-muted, #aaa)", marginBottom: 18 }}>Redirecting you to the sign-in page…</p>
            <Link className="button quiet-button" href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              Go to log in <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
