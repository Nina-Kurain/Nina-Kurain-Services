"use client";

import { useState } from "react";
import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Mail, Clock, RefreshCw, CheckCircle2, AlertTriangle, LogOut } from "lucide-react";
import { ThemeQuickToggle } from "../theme-controls";

export function VerifyEmailPendingClient({
  email,
  displayName,
  hasPhone,
}: {
  email: string;
  displayName: string;
  hasPhone: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [resendStatus, setResendStatus] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleResend() {
    setBusy(true);
    setResendStatus("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend verification email.");
      }
      setResendStatus("A fresh verification link has been sent to your email! Please check your inbox and spam folder.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error sending email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="topbar">
        <Link href="/" className="wordmark" aria-label="Nina Kurain home">
          <BrandLogo height={50} width={75} priority />
        </Link>
        <div className="header-actions">
          <ThemeQuickToggle />
          <Link href="/logout" className="text-link" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <LogOut size={14} /> Log out
          </Link>
        </div>
      </header>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 84px)",
          padding: "clamp(24px, 4vh, 48px) 16px",
          width: "100%",
        }}
      >
        <section
          style={{
            maxWidth: 480,
            width: "100%",
            background: "linear-gradient(180deg, rgba(26, 12, 24, 0.96) 0%, rgba(14, 7, 13, 0.98) 100%)",
            border: "1px solid rgba(229, 107, 131, 0.35)",
            borderRadius: 20,
            padding: "clamp(28px, 4vw, 40px) clamp(22px, 4vw, 36px)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(229, 107, 131, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "#f6edf2",
            margin: "auto",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(229, 107, 131, 0.16)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
              color: "#f595b2",
              border: "1px solid rgba(229, 107, 131, 0.4)",
              boxShadow: "0 0 20px rgba(229, 107, 131, 0.25)",
            }}
          >
            <Mail size={26} />
          </div>

          <span className="section-kicker" style={{ textAlign: "center", display: "block" }}>
            EMAIL VERIFICATION REQUIRED
          </span>

          <h1 style={{ textAlign: "center", fontSize: 26, margin: "8px 0 12px" }}>
            Verify your email address.
          </h1>

          <p style={{ textAlign: "center", fontSize: 13.5, color: "#cbb3c0", lineHeight: 1.6, marginBottom: 20 }}>
            We sent an activation link to <strong style={{ color: "#fff" }}>{email}</strong>. Please click the link in your email to confirm your account and unlock access to Nina Kurain&apos;s private feed.
          </p>

          {/* 24-Hour Expiration Warning Banner */}
          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              margin: "12px 0 24px",
            }}
          >
            <Clock size={20} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: "#fef3c7", fontSize: 13, display: "block", marginBottom: 3 }}>
                24-Hour Account Activation Window
              </strong>
              <span style={{ color: "#fde68a", fontSize: 12, lineHeight: 1.5 }}>
                For data hygiene, member privacy, and safety, unverified accounts are automatically deleted after 24 hours if not confirmed.
              </span>
            </div>
          </div>

          {resendStatus && (
            <div
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: "#86efac",
                fontSize: 12.5,
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{resendStatus}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: "#fca5a5",
                fontSize: 12.5,
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Button
              className="live-button"
              type="button"
              disabled={busy}
              onClick={handleResend}
              style={{ width: "100%", minHeight: 46 }}
            >
              <RefreshCw size={15} className={busy ? "animate-spin" : ""} />
              {busy ? "Sending link..." : "Resend Verification Email"}
            </Button>

            <Button
              variant="outline"
              type="button"
              onClick={() => location.reload()}
              style={{ width: "100%", minHeight: 42, background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.15)" }}
            >
              I have verified my email — Continue
            </Button>
          </div>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", marginTop: 24, paddingTop: 16, textAlign: "center" }}>
            <Link href="/logout" className="creator-login-link" style={{ fontSize: 12.5, color: "#8a6d7c" }}>
              Log out or sign in with another email
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
