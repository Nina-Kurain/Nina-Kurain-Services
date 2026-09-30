"use client";
import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight, Flame, Sparkles, LockKeyhole, Camera, Download, Apple, ShieldCheck, Smartphone } from "lucide-react";
import { ThemeQuickToggle } from "./theme-controls";
import { APP_VERSION_DISPLAY } from "@/lib/app-version";

export function AuthForm({mode, linkToken=""}: {linkToken?: string; mode: "login"|"signup"|"admin-login"|"forgot-password"|"reset-password"|"verify-email"}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isMobileClient, setIsMobileClient] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [osType, setOsType] = useState<"android" | "ios" | "other">("other");
  const [adminOtpRequired, setAdminOtpRequired] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminOtp, setAdminOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) setMessage(err);
      const ref = params.get("ref");
      if (ref) {
        setReferralCode(ref.trim().toUpperCase());
        try {
          document.cookie = `afterglow_ref=${encodeURIComponent(ref.trim().toUpperCase())}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (_) {}
      } else {
        const match = document.cookie.match(/afterglow_ref=([^;]+)/);
        if (match && match[1]) {
          setReferralCode(decodeURIComponent(match[1]));
        }
      }

      const ua = navigator.userAgent || "";
      const isApp =
        /NinaKurainApp/i.test(ua) ||
        (window.navigator as any).standalone === true ||
        (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches);
      setIsNativeApp(isApp);

      const isAndroid = /android/i.test(ua);
      const isIOS = /iphone|ipad|ipod/i.test(ua);
      if (isAndroid) setOsType("android");
      else if (isIOS) setOsType("ios");

      const isMobile = window.innerWidth <= 820 || isAndroid || isIOS;
      setIsMobileClient(isMobile);

      // If user is already authenticated, DO NOT show login page no matter what
      if (mode === "login" || mode === "admin-login" || mode === "signup") {
        const token = localStorage.getItem("nk_jwt_token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        fetch("/api/auth/status", { headers, cache: "no-store" })
          .then((res) => res.json())
          .then((status: any) => {
            if (status?.authenticated) {
              if (status.isAdmin && (mode === "admin-login" || window.location.pathname.startsWith("/admin"))) {
                window.location.replace("/admin");
              } else {
                window.location.replace(status.isAdmin ? "/admin" : "/feed");
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [mode]);

  const titles = {
    login: "Welcome back, lover.",
    signup: "Come closer. Strip the distance.",
    "admin-login": "Creator Studio Sign In.",
    "forgot-password": "A fresh start.",
    "reset-password": "Choose a new password.",
    "verify-email": "Verify your email."
  };

  const isLogin = mode === "login" || mode === "admin-login";
  const password = isLogin || mode === "signup" || mode === "reset-password";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const form = new FormData(e.currentTarget);
    if (["signup", "reset-password"].includes(mode) && form.get("password") !== form.get("confirmPassword")) {
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    const data = {...Object.fromEntries(form), remember, token: new URLSearchParams(location.search).get("token")};
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(20000)
      });
      const result = await r.json() as {message: string; redirect?: string; requireOtp?: boolean; email?: string; token?: string};
      if (!r.ok) throw new Error(result.message);
      if (result.token) {
        try { localStorage.setItem("nk_jwt_token", result.token); } catch (_) {}
      }
      if (result.requireOtp) {
        setAdminOtpRequired(true);
        setAdminEmail(result.email || String(form.get("email") || ""));
        setAdminPassword(String(form.get("password") || ""));
        setResendCooldown(60);
        setMessage(result.message || "A 6-digit security code has been sent to your admin email.");
      } else if (result.redirect) {
        location.assign(result.redirect);
      } else {
        setMessage(result.message);
      }
    } catch (e) {
      setMessage(e instanceof Error && e.name === "TimeoutError" ? "The request took too long. Please retry or log in if your account was already created." : e instanceof Error ? e.message : "Connection failed. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyAdminOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const cleanOtp = adminOtp.trim();
    if (cleanOtp.length !== 6) {
      setMessage("Please enter the complete 6-digit security code.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/auth/admin-verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          otp: cleanOtp,
          remember
        }),
        signal: AbortSignal.timeout(20000)
      });
      const result = await r.json() as { message: string; redirect?: string; token?: string };
      if (!r.ok) throw new Error(result.message);
      if (result.token) {
        try { localStorage.setItem("nk_jwt_token", result.token); } catch (_) {}
      }
      if (result.redirect) {
        location.assign(result.redirect);
      } else {
        setMessage(result.message || "Verified successfully.");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Verification failed. Please check the code and retry.");
    } finally {
      setBusy(false);
    }
  }

  async function resendAdminOtp() {
    if (resendCooldown > 0 || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/auth/admin-resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword
        }),
        signal: AbortSignal.timeout(20000)
      });
      const result = await r.json() as { message: string };
      if (!r.ok) throw new Error(result.message);
      setMessage(result.message || "A fresh 6-digit security code was sent to your admin email.");
      setResendCooldown(60);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to resend code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="topbar">
        <Link href="/" className="wordmark" aria-label="Nina Kurain home"><BrandLogo height={50} width={75} priority /></Link>
        <div className="header-actions">
          <ThemeQuickToggle/>
          <a href="https://ninakurainservices.in/" className="text-link">Back to website</a>
        </div>
      </header>

      <div className="auth-layout">
        <div className="auth-photo" style={{ margin: 0, padding: 0, position: "relative" }}>
          <div
            className="auth-video-container"
            style={{
              position: "absolute",
              inset: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              margin: 0,
              padding: 0,
              overflow: "hidden"
            }}
          >
            <img
              src="/nina-login-card.jpg"
              alt="Nina Kurain VIP Member Access"
              className="auth-video-element"
              style={{
                position: "absolute",
                inset: 0,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                maxWidth: "none",
                maxHeight: "none",
                objectFit: "cover",
                objectPosition: "center 25%",
                display: "block",
                margin: 0,
                padding: 0,
                border: "none"
              }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <div className="auth-video-overlay" />
            <div className="auth-video-top-bar">
              <span className="sultry-badge hot">
                 <Flame size={13} /> COMMUNITY MEMBERSHIP
              </span>
              <span className="auth-mini-pill" style={{ background: "rgba(10,5,10,0.7)", border: "1px solid rgba(255,45,117,0.3)" }}>
                 <Camera size={13} /> EVERYDAY HANGOUTS
              </span>
            </div>

            <div className="auth-photo-content">
               <span className="section-kicker">COMMUNITY · RESPECTFUL ACCESS</span>
               <h2>Share the moments<br/><em>that feel real.</em></h2>
               <p>Everyday hangout photos, travel memories, creator stories, and clearly labelled creative work shared with members.</p>
              <div className="auth-photo-badges">
                 <span className="auth-mini-pill"><Sparkles size={12} /> High-quality photo &amp; video</span>
                <span className="auth-mini-pill"><LockKeyhole size={12} /> 100% Private & Discreet</span>
                 <span className="auth-mini-pill"><Flame size={12} /> New creator drops</span>
              </div>
            </div>
          </div>
        </div>

        <section className="auth-card">
          {adminOtpRequired ? (
            <div className="admin-otp-card" style={{ maxWidth: 480, margin: "0 auto" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 999,
                background: "rgba(224, 72, 108, 0.15)",
                border: "1px solid rgba(224, 72, 108, 0.4)",
                color: "#ff85a1",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 16
              }}>
                <ShieldCheck size={14} /> Two-Factor Security Check
              </div>

              <h1 style={{ fontSize: "clamp(28px, 3.2vw, 42px)", marginBottom: 12 }}>
                Verify Creator Identity
              </h1>

              <p style={{ color: "#d8c4cd", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                A 6-digit one-time security code has been sent to <strong style={{ color: "#fff", wordBreak: "break-all" }}>{adminEmail}</strong>. Enter it below to unlock Creator Studio.
              </p>

              {message && (
                <div className="live-message" role="alert" style={{ marginBottom: 20 }}>
                  {message}
                </div>
              )}

              <form onSubmit={verifyAdminOtp} className="live-form">
                <div>
                  <Label htmlFor="adminOtp" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: "#e5bfd2" }}>
                    6-Digit Security Code (OTP)
                  </Label>
                  <Input
                    id="adminOtp"
                    name="adminOtp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={adminOtp}
                    onChange={(e) => setAdminOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    autoFocus
                    required
                    style={{
                      fontSize: 28,
                      letterSpacing: "0.35em",
                      textAlign: "center",
                      fontFamily: "monospace",
                      minHeight: 56,
                      background: "#120a12",
                      borderColor: "rgba(224, 72, 108, 0.45)",
                      color: "#fff",
                      fontWeight: 700,
                      marginTop: 8
                    }}
                  />
                  <small style={{ color: "#a88e9c", fontSize: 12, marginTop: 6, display: "block", textAlign: "center" }}>
                    Valid for 10 minutes · One-time access code
                  </small>
                </div>

                <Button className="live-button" type="submit" disabled={busy || adminOtp.trim().length !== 6} style={{ marginTop: 12 }}>
                  {busy ? "Verifying Security Code…" : "Confirm & Enter Studio"}
                </Button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, fontSize: 13 }}>
                  <button
                    type="button"
                    onClick={resendAdminOtp}
                    disabled={busy || resendCooldown > 0}
                    style={{
                      background: "none",
                      border: 0,
                      color: resendCooldown > 0 ? "#7a6773" : "#e79db9",
                      cursor: resendCooldown > 0 ? "default" : "pointer",
                      padding: 0,
                      textDecoration: resendCooldown > 0 ? "none" : "underline"
                    }}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend security code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminOtpRequired(false);
                      setAdminOtp("");
                      setMessage("");
                    }}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#a88e9c",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    Change credentials
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <span className="section-kicker">{mode === "admin-login" ? "NINA'S CREATOR STUDIO" : "NINA KURAIN VIP MEMBERSHIP"}</span>
              <h1>{titles[mode]}</h1>
          <p>
            {mode === "signup"
               ? "Create an account for a respectful community of everyday hangouts, photos, and creator-led experiences."
              : mode === "forgot-password"
              ? "Enter your account email to request a secure password-reset link."
              : mode === "admin-login"
              ? "Use your creator credentials. Member accounts cannot access this area."
              : mode === "verify-email"
              ? "Confirm your email using the link you received."
               : "Sign in to enjoy community photos, videos, subscriptions, and creator tools."}
          </p>

          {isLogin && mode === "login" && isMobileClient && !isNativeApp ? (
            <div className="mobile-login-app-gate" style={{ textAlign: "center", padding: "10px 0 16px" }}>
              <div style={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: "rgba(224, 72, 108, 0.15)",
                border: "1px solid rgba(224, 72, 108, 0.4)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
                color: "#ff85a1"
              }}>
                <Flame size={30} />
              </div>
              <h2 style={{ fontSize: 21, color: "#fff", marginBottom: 8, fontWeight: 700 }}>
                Keep Me in Your Pocket
              </h2>
              <p style={{ fontSize: 13.5, color: "#d8c4cd", lineHeight: 1.55, marginBottom: 20 }}>
                I want to be closer to you. Download my private app and take me wherever you go—my unfiltered boudoir moments, late-night confessions, and most intimate tapes are waiting just for you.
              </p>

              {osType === "android" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                  <a
                    href="/downloads/NinaKurain.apk"
                    download="NinaKurain.apk"
                    className="button"
                    style={{
                      background: "linear-gradient(135deg, #e54b7c, #982f55)",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 12,
                      minHeight: 52,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 14,
                      boxShadow: "0 8px 24px rgba(229, 75, 124, 0.35)",
                      textTransform: "uppercase"
                    }}
                  >
                    <Download size={18} />
                    <span>Download Nina&apos;s App (.apk)</span>
                  </a>
                  <p style={{ fontSize: 11.5, color: "#9a8b94", margin: 0 }}>
                    1-Tap Direct Download · Come inside with me
                  </p>
                </div>
              ) : osType === "ios" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                  <div
                    style={{
                      background: "rgba(229, 75, 124, 0.09)",
                      border: "1px solid rgba(229, 75, 124, 0.35)",
                      borderRadius: 14,
                      padding: "14px 12px",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Apple size={17} color="#ff85a1" />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        iPhone / iPad Direct Install
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#f0dbe5" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#e54b7c", color: "#fff", display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>
                          1
                        </span>
                        <span>
                          Tap Safari&apos;s <strong>Share</strong> button <span style={{ display: "inline-block", padding: "1px 5px", background: "rgba(255,255,255,0.18)", borderRadius: 4, fontSize: 11 }}>⎋</span> below
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#e54b7c", color: "#fff", display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>
                          2
                        </span>
                        <span>
                          Scroll and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> <span style={{ display: "inline-block", padding: "1px 5px", background: "rgba(255,255,255,0.18)", borderRadius: 4, fontSize: 11 }}>➕</span>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#e54b7c", color: "#fff", display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>
                          3
                        </span>
                        <span>
                          Tap <strong>Add</strong> — open Nina from your screen!
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="/downloads/NinaKurain.mobileconfig"
                    download="NinaKurain.mobileconfig"
                    className="button"
                    style={{
                      background: "linear-gradient(135deg, #e54b7c, #982f55)",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 12,
                      minHeight: 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 13,
                      boxShadow: "0 8px 24px rgba(229, 75, 124, 0.35)",
                      textTransform: "uppercase",
                    }}
                  >
                    <Apple size={17} />
                    <span>1-Tap Install iOS Profile</span>
                  </a>

                  <a
                    href="/downloads/NinaKurain.ipa"
                    download="NinaKurain.ipa"
                    className="button quiet-button"
                    style={{
                      borderRadius: 12,
                      minHeight: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#ff85a1",
                      border: "1px solid rgba(224, 72, 108, 0.35)",
                    }}
                  >
                    <Download size={15} />
                    <span>Download .ipa for AltStore / Scarlet</span>
                  </a>
                  <p style={{ fontSize: 11.5, color: "#9a8b94", margin: 0 }}>
                    Fast 3-second setup · Come inside with me
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  <a
                    href="/downloads/NinaKurain.apk"
                    download="NinaKurain.apk"
                    className="button"
                    style={{ minHeight: 48, borderRadius: 12 }}
                  >
                    <Download size={18} /> Download Android App (.apk)
                  </a>
                  <a
                    href="/downloads/NinaKurain.mobileconfig"
                    download="NinaKurain.mobileconfig"
                    className="button quiet-button"
                    style={{ minHeight: 44, borderRadius: 12 }}
                  >
                    <Apple size={18} /> Install iOS App (iPhone / iPad)
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Google Sign In Option */}
              {(mode === "login" || mode === "signup") && (
                <>
                  <a href="/api/auth/google/start" className="btn-google-auth">
                    <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{mode === "signup" ? "Sign up with Google" : "Continue with Google"}</span>
                  </a>

                  <div className="auth-divider">
                    <span>OR WITH EMAIL & PASSWORD</span>
                  </div>
                </>
              )}

          <form
            action={`/api/auth/${mode}`}
            method="post"
            onSubmit={submit}
            onInvalidCapture={() => setMessage("Please complete all required fields. Use a valid email, mobile phone number, and a password of at least " + (isLogin ? "8" : "12") + " characters.")}
          >
            <input type="hidden" name="token" value={linkToken}/>
            <fieldset disabled={busy} className="live-form">
              {mode === "signup" && (
                <>
                  <div>
                    <Label htmlFor="name">Full name or preferred alias</Label>
                    <Input id="name" name="name" autoComplete="name" placeholder="What should Nina call you?" required minLength={2} maxLength={100}/>
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile phone number <span style={{ color: "#e56b83" }}>*</span></Label>
                    <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" required minLength={8} maxLength={25}/>
                    <small style={{ color: "#a88e9c", fontSize: 11, marginTop: 4, display: "block" }}>
                      Mandatory for member identity verification. Include country code (e.g. +91).
                    </small>
                  </div>
                  <div>
                    <Label htmlFor="referralCode">Referral code <span style={{ color: "#a88e9c", fontWeight: "normal" }}>(Optional)</span></Label>
                    <Input
                      id="referralCode"
                      name="referralCode"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. NINA-7K9M2P"
                      maxLength={50}
                    />
                    <small style={{ color: "#a88e9c", fontSize: 11, marginTop: 4, display: "block" }}>
                      Referred by a member? Enter their code to link your VIP invitation.
                    </small>
                  </div>
                </>
              )}
              {!["reset-password", "verify-email"].includes(mode) && (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/>
                </div>
              )}
              {password && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="password-field">
                    <Input id="password" name="password" type={show ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} required minLength={isLogin ? 8 : 12} maxLength={128}/>
                    <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
                      {show ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {!isLogin && <small>Use at least 12 characters for discretion and security.</small>}
                </div>
              )}
              {["signup", "reset-password"].includes(mode) && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type={show ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={128}/>
                </div>
              )}
              {mode === "login" && (
                <div className="auth-options">
                  <label>
                    <Checkbox name="remember" checked={remember} onCheckedChange={value => setRemember(value === true)}/>
                    Keep me signed in
                  </label>
                  <Link href="/forgot-password">Forgot password?</Link>
                </div>
              )}
              {mode === "signup" && (
                <div style={{display:"grid",gap:10,marginTop:4,fontSize:12,color:"#cdb8c2",lineHeight:1.45}}>
                  <label style={{display:"flex",gap:8,alignItems:"flex-start"}}><Checkbox name="adultConfirmed" required/><span>I confirm that I am 18 or older and will not upload or request sexual, exploitative, non-consensual, or minor-related content.</span></label>
                  <label style={{display:"flex",gap:8,alignItems:"flex-start"}}><Checkbox name="termsAccepted" required/><span>I agree to the <Link href="/terms-and-conditions" target="_blank">Terms and Conditions</Link>.</span></label>
                  <label style={{display:"flex",gap:8,alignItems:"flex-start"}}><Checkbox name="privacyAccepted" required/><span>I have read the <Link href="/privacy-policy" target="_blank">Privacy Policy</Link> and consent to the described processing.</span></label>
                </div>
              )}

              <Button className="live-button" type="submit">
                {busy
                  ? "Unlocking VIP Vault…"
                  : mode === "signup"
                   ? "Create my account"
                  : mode === "forgot-password"
                  ? "Send reset link"
                  : mode === "reset-password"
                  ? "Save new password"
                  : mode === "verify-email"
                  ? "Verify email"
                   : "Sign in"}
                <ArrowRight size={16}/>
              </Button>
              {message && <p className="live-message" role="status">{message}</p>}
            </fieldset>
          </form>

          {mode === "signup" ? (
            <p className="auth-switch">Already a member? <Link href="/login">Enter Nina&apos;s Club</Link></p>
          ) : mode === "login" ? (
            <p className="auth-switch">First time here? <Link href="/signup">Claim your free VIP access</Link></p>
          ) : (
            <p className="auth-switch"><Link href="/login">Return to login</Link></p>
          )}

          {!isNativeApp && mode === "admin-login" && (
            <div className="auth-app-download-box" style={{
              marginTop: 22,
              padding: "16px 14px",
              background: "rgba(255, 45, 117, 0.06)",
              border: "1px solid rgba(255, 45, 117, 0.28)",
              borderRadius: 16,
              textAlign: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8, color: "#ff85a1", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <Smartphone size={14} /> Creator Studio Mobile App
              </div>
              <p style={{ fontSize: 12, color: "var(--muted, #c4b5bd)", margin: "0 0 12px", lineHeight: 1.4 }}>
                Manage content, view live subscriber stats, and upload drops directly from Android.
              </p>
              <a
                href="/downloads/NinaKurainStudio.apk"
                download="NinaKurainStudio.apk"
                className="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  minHeight: 44,
                  background: "linear-gradient(135deg, #e54b7c, #982f55)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 12,
                  textDecoration: "none"
                }}
              >
                <Download size={15} /> Download Studio App (.apk {APP_VERSION_DISPLAY})
              </a>
            </div>
          )}

          {!isNativeApp && (mode === "login" || mode === "signup") && (
            <div className="auth-app-download-box" style={{
              marginTop: 22,
              padding: "16px 14px",
              background: "rgba(255, 45, 117, 0.06)",
              border: "1px solid rgba(255, 45, 117, 0.28)",
              borderRadius: 16,
              textAlign: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8, color: "#ff85a1", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <Smartphone size={14} /> Keep Nina In Your Pocket
              </div>
              <p style={{ fontSize: 12, color: "var(--muted, #c4b5bd)", margin: "0 0 12px", lineHeight: 1.4 }}>
                Install the official private app for screenshot-proof streaming, offline caching, and 90-day persistence.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a
                  href="/downloads/NinaKurain.apk"
                  download="NinaKurain.apk"
                  className="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                    minHeight: 44,
                    background: "linear-gradient(135deg, #e54b7c, #982f55)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    borderRadius: 12,
                    textDecoration: "none"
                  }}
                >
                  <Download size={15} /> Download VIP App (Android .apk {APP_VERSION_DISPLAY})
                </a>
                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href="/downloads/NinaKurain.mobileconfig"
                    download="NinaKurain.mobileconfig"
                    className="button quiet-button"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      minHeight: 38,
                      fontSize: 11.5,
                      borderRadius: 10,
                      textDecoration: "none",
                      border: "1px solid rgba(255, 45, 117, 0.3)"
                    }}
                  >
                    <Apple size={14} /> iOS Profile
                  </a>
                  <a
                    href="/downloads/NinaKurain.ipa"
                    download="NinaKurain.ipa"
                    className="button quiet-button"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      minHeight: 38,
                      fontSize: 11.5,
                      borderRadius: 10,
                      textDecoration: "none",
                      border: "1px solid rgba(255, 45, 117, 0.3)"
                    }}
                  >
                    <Download size={14} /> iOS .ipa ({APP_VERSION_DISPLAY})
                  </a>
                </div>
              </div>
            </div>
          )}
            </>
          )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
