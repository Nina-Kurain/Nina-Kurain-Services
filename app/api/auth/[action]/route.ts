import { env } from "cloudflare:workers";
import { z } from "zod";
import { apiAccount, clearSession, createSession, rateLimit, purgeExpiredUnverifiedUsers } from "@/lib/server/auth";
import { hashPassword, verifyPassword, digest } from "@/lib/server/password";
import { body, database, endpoint, HttpError, json, row, run, sameOrigin, sql } from "@/lib/server/db";
import { initializePlans } from "@/lib/server/entitlements";
import { sendAccountEmail, emailReady, safelySendTransactionalEmail } from "@/lib/server/email";
import { validateAuthenticEmail } from "@/lib/server/email-validator";
import { trackReferralSignup } from "@/lib/server/referrals";

const credentials = z.object({
  email: z.string().email().max(254).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  remember: z.boolean().optional(),
});

const signup = credentials
  .extend({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    phone: z.string().trim().min(8, "Please enter a valid mobile number with country code").max(25),
    confirmPassword: z.string(),
    password: z.string().min(12, "Use at least 12 characters").max(128),
    referralCode: z.string().trim().max(50).optional().nullable(),
  })
  .refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match" });

export async function GET(request: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action === "logout" || action === "admin-logout") {
    await clearSession(action === "admin-logout");
    return new Response(null, {
      status: 303,
      headers: {
        Location: action === "admin-logout" ? "/admin/login" : "/login",
        "Cache-Control": "no-store",
      },
    });
  }
  return new Response("Not found", { status: 404 });
}

export async function POST(request: Request, ctx: { params: Promise<{ action: string }> }) {
  const isForm = request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded");
  const response = await endpoint(async () => {
    sameOrigin(request);
    const { action } = await ctx.params;
    let input: Record<string, unknown>;
    if (isForm) {
      const raw = await request.text();
      if (raw.length > 65536) throw new HttpError(413, "Request too large");
      input = Object.fromEntries(new URLSearchParams(raw));
      input.remember = input.remember === "on" || input.remember === "true";
    } else {
      input = await body(request);
    }
    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    await rateLimit(`auth-ip:${ip}`, 80, 900);

    if (action === "logout" || action === "admin-logout") {
      await clearSession(action === "admin-logout");
      return json({ redirect: "/login" });
    }

    if (action === "signup") {
      const result = signup.safeParse(input);
      if (!result.success) {
        throw new HttpError(400, result.error.issues[0]?.message ?? "Check your details.");
      }
      const v = result.data;

      // Validate email authenticity and block disposable/temporary email domains
      validateAuthenticEmail(v.email);

      await rateLimit(`signup:${ip}`, 15, 3600);
      await initializePlans();
      if (v.email === env.ADMIN_EMAIL?.toLowerCase()) {
        throw new HttpError(400, "This email cannot be registered here.");
      }

      // Check if existing user is expired unverified (> 24 hours) - if so, clean it up
      const existingUser = await row<{ id: string; verified: number; created_at: number }>(
        "SELECT id, verified, created_at FROM users WHERE email = ?",
        v.email
      );
      if (existingUser) {
        if (!existingUser.verified && existingUser.created_at <= Date.now() - 24 * 3600 * 1000) {
          await database().batch([
            sql("DELETE FROM auth_tokens WHERE user_id=?", existingUser.id),
            sql("DELETE FROM auth_sessions WHERE user_id=?", existingUser.id),
            sql("DELETE FROM profiles WHERE user_id=?", existingUser.id),
            sql("DELETE FROM memberships WHERE user_id=?", existingUser.id),
            sql("DELETE FROM users WHERE id=?", existingUser.id),
          ]);
        } else {
          throw new HttpError(409, "Email already registered. Please log in or reset your password.");
        }
      }

      const id = crypto.randomUUID();
      const now = Date.now();
      const hash = await hashPassword(v.password);

      try {
        await database().batch([
          sql(
            "INSERT INTO users(id, email, display_name, phone, role, password_hash, created_at, updated_at) VALUES(?, ?, ?, ?, 'member', ?, ?, ?)",
            id,
            v.email,
            v.name,
            v.phone,
            hash,
            now,
            now
          ),
          sql("INSERT INTO profiles(user_id, updated_at) VALUES(?, ?)", id, now),
          sql("INSERT INTO memberships(user_id, updated_at) VALUES(?, ?)", id, now),
        ]);
      } catch (e) {
        if (String(e).includes("UNIQUE")) throw new HttpError(409, "Email already registered.");
        throw e;
      }

      await createSession(id, false, Boolean(v.remember));

      const cookieHeader = request.headers.get("cookie") || "";
      const cookieRefMatch = cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith("afterglow_ref="));
      const cookieRef = cookieRefMatch ? decodeURIComponent(cookieRefMatch.split("=")[1] || "") : null;
      const refCode = v.referralCode || cookieRef || null;
      if (refCode) {
        try {
          await trackReferralSignup(id, refCode);
        } catch (refErr) {
          console.error("Referral tracking error on signup:", refErr);
        }
      }
      let verificationSent = false;
      if (emailReady()) {
        try {
          await sendAccountEmail(id, v.email, "verify");
          verificationSent = true;
        } catch (e) {
          console.error("Signup verification delivery failed", e);
        }
      }

      // Redirect to verification pending page
      return json({ redirect: "/verify-email-pending", verificationSent }, 201);
    }

    if (action === "login" || action === "admin-login") {
      const v = credentials.parse(input);
      await rateLimit(`login:${action}:${v.email}`, 10, 900);

      if (action === "admin-login") {
        if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
          throw new HttpError(503, "Admin credentials have not been configured.");
        }
        const matches = await verifyPassword(v.password, env.ADMIN_PASSWORD_HASH);
        if (!matches || v.email !== env.ADMIN_EMAIL.toLowerCase()) {
          throw new HttpError(401, "Email or password is incorrect.");
        }
        await initializePlans();
        const now = Date.now();
        await run(
          "INSERT INTO users(id,email,display_name,role,verified,created_at,updated_at) VALUES(?,?,?,'admin',1,?,?) ON CONFLICT(email) DO UPDATE SET role='admin',active=1,updated_at=excluded.updated_at",
          crypto.randomUUID(),
          v.email,
          "Nina Kurain",
          now,
          now
        );
        const admin = await row<{ id: string }>("SELECT id FROM users WHERE email=?", v.email);
        await createSession(admin!.id, true, false);
        return json({ redirect: "/admin" });
      }

      // Member login
      const user = await row<{
        id: string;
        password_hash: string | null;
        active: number;
        role: string;
        verified: number;
        phone: string | null;
        created_at: number;
      }>("SELECT id, password_hash, active, role, verified, phone, created_at FROM users WHERE email=?", v.email);

      // Check if unverified user is older than 24 hours -> delete expired account
      if (user && !user.verified && user.created_at <= Date.now() - 24 * 3600 * 1000) {
        await database().batch([
          sql("DELETE FROM auth_tokens WHERE user_id=?", user.id),
          sql("DELETE FROM auth_sessions WHERE user_id=?", user.id),
          sql("DELETE FROM profiles WHERE user_id=?", user.id),
          sql("DELETE FROM memberships WHERE user_id=?", user.id),
          sql("DELETE FROM users WHERE id=?", user.id),
        ]);
        throw new HttpError(401, "This unverified account expired after 24 hours. Please create a new account.");
      }

      const dummy = "scrypt$32768$8$3$00000000000000000000000000000000$" + "0".repeat(128);
      const matches = await verifyPassword(v.password, user?.password_hash ?? dummy);
      if (!user || !matches || !user.active || user.role === "admin") {
        throw new HttpError(401, "Email or password is incorrect.");
      }

      await clearSession();
      await createSession(user.id, false, Boolean(v.remember));

      // Mandate mobile number if missing
      if (!user.phone) {
        return json({ redirect: "/complete-profile", requirePhone: true });
      }

      // Mandate email verification if unverified
      if (!user.verified) {
        return json({ redirect: "/verify-email-pending", requireVerification: true });
      }

      return json({ redirect: "/feed" });
    }

    if (action === "update-phone") {
      const u = await apiAccount(false, false);
      const phoneSchema = z
        .string()
        .trim()
        .min(8, "Please enter a valid mobile number with country code")
        .max(25);
      const parsed = phoneSchema.safeParse(input.phone);
      if (!parsed.success) {
        throw new HttpError(400, parsed.error.issues[0]?.message ?? "Please enter a valid mobile number.");
      }
      const phone = parsed.data;
      await run("UPDATE users SET phone = ?, updated_at = ? WHERE id = ?", phone, Date.now(), u.id);

      if (!u.verified) {
        return json({
          message: "Mobile number saved. Please verify your email to unlock access.",
          redirect: "/verify-email-pending",
        });
      }
      return json({ message: "Profile updated.", redirect: "/feed" });
    }

    if (action === "forgot-password") {
      const email = z
        .string()
        .email()
        .transform((s) => s.toLowerCase().trim())
        .parse(input.email);
      await rateLimit(`reset:${email}`, 3, 3600);
      if (!emailReady()) {
        throw new HttpError(503, "Password-reset emails are not configured yet. Please contact the creator.");
      }
      const user = await row<{ id: string }>(
        "SELECT id FROM users WHERE email=? AND role='member' AND active=1",
        email
      );
      if (user) await sendAccountEmail(user.id, email, "reset");
      return json({ message: "If this email belongs to an active account, a reset link has been sent." });
    }

    if (action === "send-verification") {
      const u = await apiAccount(false, false);
      await rateLimit(`verify:${u.id}`, 3, 3600);
      await sendAccountEmail(u.id, u.email, "verify");
      return json({ message: "Verification email sent. Please check your inbox and spam folder." });
    }

    if (action === "reset-password" || action === "verify-email") {
      const value = z.string().regex(/^[a-f0-9]{64}$/).parse(input.token);
      const kind = action === "reset-password" ? "reset" : "verify";
      const hashed = await digest(value);
      const t = await row<{ user_id: string }>(
        "SELECT user_id FROM auth_tokens WHERE token_hash=? AND kind=? AND expires_at>?",
        hashed,
        kind,
        Date.now()
      );
      if (!t) throw new HttpError(400, "This link is invalid or expired. Request a new one.");

      if (kind === "reset") {
        const password = z.string().min(12).max(128).parse(input.password);
        if (password !== input.confirmPassword) throw new HttpError(400, "Passwords do not match.");
        const hash = await hashPassword(password);
        const results = await database().batch([
          sql(
            "UPDATE users SET password_hash=?,updated_at=? WHERE id=? AND EXISTS(SELECT 1 FROM auth_tokens WHERE token_hash=? AND expires_at>?)",
            hash,
            Date.now(),
            t.user_id,
            hashed,
            Date.now()
          ),
          sql("DELETE FROM auth_sessions WHERE user_id=?", t.user_id),
          sql("DELETE FROM auth_tokens WHERE user_id=? AND kind='reset'", t.user_id),
        ]);
        if (!results[0].meta.changes) throw new HttpError(400, "Link already used.");
        await clearSession();
        return json({ message: "Password changed. Log in with your new password.", redirect: "/login" });
      }

      // Verify Email
      await database().batch([
        sql(
          "UPDATE users SET verified=1,updated_at=? WHERE id=? AND EXISTS(SELECT 1 FROM auth_tokens WHERE token_hash=? AND expires_at>?)",
          Date.now(),
          t.user_id,
          hashed,
          Date.now()
        ),
        sql("DELETE FROM auth_tokens WHERE token_hash=?", hashed),
      ]);

      const verified = await row<{ email: string; display_name: string; phone: string | null }>(
        "SELECT email, display_name, phone FROM users WHERE id=?",
        t.user_id
      );
      if (verified && emailReady()) {
        await safelySendTransactionalEmail({
          userId: t.user_id,
          email: verified.email,
          kind: "welcome",
          idempotencyKey: `welcome:${t.user_id}`,
          subject: "Welcome inside Nina Kurain's private club",
          text: `Hi ${verified.display_name.split(/\s+/)[0] || "there"},\n\nYour email is verified and your free private access is ready. You can now view the creator's selected previews and choose a membership whenever you want to come closer.\n\nOpen your private feed: ${env.APP_URL}/feed`,
        });
      }

      // Ensure session is set if not already
      await createSession(t.user_id, false, true);

      // If user lacks mobile number, mandate completion
      if (!verified?.phone) {
        return json({ message: "Email verified. Please complete your mobile number.", redirect: "/complete-profile" });
      }

      return json({ message: "Email verified. Access unlocked.", redirect: "/feed" });
    }

    throw new HttpError(404, "Unknown action");
  });

  if (!isForm) return response;
  const result = (await response.json()) as { redirect?: string; message?: string };
  if (response.ok && result.redirect) {
    return new Response(null, {
      status: 303,
      headers: { Location: result.redirect, "Cache-Control": "no-store" },
    });
  }
  const { action } = await ctx.params;
  const back =
    action === "admin-login"
      ? "/admin/login"
      : ["signup", "login", "forgot-password", "reset-password", "verify-email"].includes(action)
      ? `/${action}`
      : "/login";
  const escape = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nina Kurain account</title><body style="background:#160d14;color:#fff;font:18px/1.6 system-ui;padding:24px"><main style="max-width:540px;margin:10vh auto"><h1>${
      response.ok ? "Account update" : "Please check your details"
    }</h1><p role="alert">${escape(result.message ?? "Please try again.")}</p><a style="color:#ffa9cc" href="${back}">Return to the form</a> · <a style="color:#ffa9cc" href="/">Back to website</a></main></body></html>`,
    {
      status: response.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    }
  );
}

