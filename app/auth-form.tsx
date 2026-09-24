"use client";
import Link from "@/components/site-link";
import { BrandLogo } from "@/components/brand-logo";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight, Flame, Sparkles, LockKeyhole, Camera } from "lucide-react";
import { ThemeQuickToggle } from "./theme-controls";

export function AuthForm({mode, linkToken=""}: {linkToken?: string; mode: "login"|"signup"|"admin-login"|"forgot-password"|"reset-password"|"verify-email"}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [referralCode, setReferralCode] = useState("");

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
    }
  }, []);

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
      const result = await r.json() as {message: string; redirect?: string};
      if (!r.ok) throw new Error(result.message);
      if (result.redirect) location.assign(result.redirect);
      else setMessage(result.message);
    } catch (e) {
      setMessage(e instanceof Error && e.name === "TimeoutError" ? "The request took too long. Please retry or log in if your account was already created." : e instanceof Error ? e.message : "Connection failed. Please retry.");
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
        <div className="auth-photo">
          <div className="auth-video-container">
            <img
              src="/nina-login-card.jpg"
              alt="Nina Kurain VIP Member Access"
              className="auth-video-element"
              style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
            <div className="auth-video-overlay" />
            <div className="auth-video-top-bar">
              <span className="sultry-badge hot">
                <Flame size={13} /> 18+ UNCENSORED VAULT
              </span>
              <span className="auth-mini-pill" style={{ background: "rgba(10,5,10,0.7)", border: "1px solid rgba(255,45,117,0.3)" }}>
                <Camera size={13} /> INTIMATE BOUDOIR DROP
              </span>
            </div>

            <div className="auth-photo-content">
              <span className="section-kicker">🔞 PRIVATE BEDROOM · UNCENSORED ACCESS</span>
              <h2>The public sees enough.<br/><em>You get closer.</em></h2>
              <p>Uncensored tapes, erotic boudoir sets, private confessions, and sluttery drops shared only with VIP members.</p>
              <div className="auth-photo-badges">
                <span className="auth-mini-pill"><Sparkles size={12} /> 4K Ultra HD Tapes</span>
                <span className="auth-mini-pill"><LockKeyhole size={12} /> 100% Private & Discreet</span>
                <span className="auth-mini-pill"><Flame size={12} /> Weekly Erotic Drops</span>
              </div>
            </div>
          </div>
        </div>

        <section className="auth-card">
          <span className="section-kicker">{mode === "admin-login" ? "NINA'S CREATOR STUDIO" : "NINA KURAIN VIP MEMBERSHIP"}</span>
          <h1>{titles[mode]}</h1>
          <p>
            {mode === "signup"
              ? "Accept your free VIP invitation and unlock the first private erotic glimpse. No card required."
              : mode === "forgot-password"
              ? "Enter your account email to request a secure password-reset link."
              : mode === "admin-login"
              ? "Use your creator credentials. Member accounts cannot access this area."
              : mode === "verify-email"
              ? "Confirm your email using the link you received."
              : "Nina's private explicit collection is waiting. Come back inside."}
          </p>

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

              <Button className="live-button" type="submit">
                {busy
                  ? "Unlocking VIP Vault…"
                  : mode === "signup"
                  ? "Claim VIP Access & First Look"
                  : mode === "forgot-password"
                  ? "Send reset link"
                  : mode === "reset-password"
                  ? "Save new password"
                  : mode === "verify-email"
                  ? "Verify email"
                  : "Enter Nina's Pleasure Vault"}
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
          {mode === "login" && <Link href="/admin/login" className="creator-login-link">Creator sign in</Link>}
        </section>
      </div>
    </main>
  );
}
