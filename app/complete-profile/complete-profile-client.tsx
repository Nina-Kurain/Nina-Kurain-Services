"use client";

import { useState } from "react";
import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ShieldCheck, ArrowRight, Lock, LogOut } from "lucide-react";
import { ThemeQuickToggle } from "../theme-controls";

export function CompleteProfileClient({
  email,
  displayName,
  isVerified,
}: {
  email: string;
  displayName: string;
  isVerified: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const clean = phone.trim();
    if (!clean || clean.length < 8) {
      setMessage("Please enter a valid mobile number with your country code (e.g. +91 98765 43210).");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean }),
      });
      const data = (await res.json()) as { message?: string; redirect?: string };
      if (!res.ok) {
        throw new Error(data.message || "Failed to update mobile number.");
      }
      if (data.redirect) {
        location.assign(data.redirect);
      } else {
        location.assign(isVerified ? "/feed" : "/verify-email-pending");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Connection failed. Please retry.");
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
            <Phone size={24} />
          </div>

          <span
            className="section-kicker"
            style={{
              textAlign: "center",
              display: "block",
              color: "var(--nk-rose-light, #f595b2)",
              fontSize: 11,
              letterSpacing: "0.18em",
              fontWeight: 700,
            }}
          >
            MANDATORY MEMBER AUTHENTICITY
          </span>

          <h1
            style={{
              textAlign: "center",
              fontSize: "clamp(22px, 3vw, 26px)",
              fontFamily: "Georgia, serif",
              color: "#ffffff",
              margin: "8px 0 12px",
            }}
          >
            Add your mobile number.
          </h1>

          <p
            style={{
              textAlign: "center",
              fontSize: 13.5,
              color: "#cbb3c0",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Hi <strong>{displayName || email}</strong>. To ensure complete discretion, prevent fake profiles, and protect our private vault, Nina Kurain mandates a verified mobile number for all members before continuing.
          </p>

          <form onSubmit={handleSubmit}>
            <fieldset disabled={busy} className="live-form">
              <div>
                <Label
                  htmlFor="phone"
                  style={{
                    color: "#f6edf2",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Mobile phone number
                </Label>
                <div style={{ position: "relative" }}>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    minLength={8}
                    maxLength={25}
                    style={{
                      fontSize: 15,
                      paddingLeft: 14,
                      height: 48,
                      background: "rgba(10, 5, 10, 0.8)",
                      border: "1px solid rgba(229, 107, 131, 0.4)",
                      borderRadius: 10,
                      color: "#ffffff",
                    }}
                  />
                </div>
                <small style={{ color: "#a88e9c", fontSize: 11.5, marginTop: 6, display: "block" }}>
                  Include country code (e.g. +91 for India, +1 for US/Canada, +44 for UK).
                </small>
              </div>

              <div
                style={{
                  background: "rgba(229, 107, 131, 0.08)",
                  border: "1px solid rgba(229, 107, 131, 0.25)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 12,
                  color: "#d8c0cc",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  margin: "12px 0 18px",
                  lineHeight: 1.5,
                }}
              >
                <ShieldCheck size={18} style={{ color: "#f595b2", flexShrink: 0, marginTop: 1 }} />
                <span>
                  Your number is strictly private and never shared. It is kept in an encrypted vault for identity integrity and priority account assistance.
                </span>
              </div>

              <Button
                type="submit"
                disabled={busy}
                style={{
                  width: "100%",
                  minHeight: 48,
                  borderRadius: 999,
                  background: "linear-gradient(115deg, #a92f49, #e06086)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "none",
                  boxShadow: "0 8px 24px rgba(224, 96, 134, 0.35)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {busy ? "Saving verification..." : "Save Mobile & Continue"}
                <ArrowRight size={16} />
              </Button>

              {message && (
                <p className="live-message" role="status" style={{ textAlign: "center", marginTop: 12 }}>
                  {message}
                </p>
              )}
            </fieldset>
          </form>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", marginTop: 24, paddingTop: 16, textAlign: "center" }}>
            <Link href="/logout" className="creator-login-link" style={{ fontSize: 12.5, color: "#a88e9c" }}>
              Log out or switch account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
