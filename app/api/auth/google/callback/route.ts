import { finishGoogleAuth } from "@/lib/server/google-auth";
import { createSession } from "@/lib/server/auth";
import { database, row, run, sql } from "@/lib/server/db";
import { initializePlans } from "@/lib/server/entitlements";
import { trackReferralSignup } from "@/lib/server/referrals";
import { env } from "cloudflare:workers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const baseUrl = env.APP_URL || url.origin;

  if (error) {
    return Response.redirect(
      new URL("/login?error=Google authorization was cancelled or denied.", baseUrl),
      303
    );
  }

  if (!code || !state) {
    return Response.redirect(
      new URL("/login?error=Invalid Google sign-in response. Please retry.", baseUrl),
      303
    );
  }

  try {
    const profile = await finishGoogleAuth(state, code);
    await initializePlans();

    // Check if user already exists
    let user = await row<{
      id: string;
      email: string;
      role: string;
      verified: number;
      phone: string | null;
      active: number;
    }>("SELECT id, email, role, verified, phone, active FROM users WHERE email = ?", profile.email);

    const now = Date.now();

    if (user) {
      if (!user.active) {
        return Response.redirect(
          new URL("/login?error=This account is disabled. Please contact support.", baseUrl),
          303
        );
      }
      // Ensure verified is set to 1 since Google has verified this email
      if (!user.verified) {
        await run("UPDATE users SET verified = 1, updated_at = ? WHERE id = ?", now, user.id);
      }
      await createSession(user.id, user.role === "admin", true);

      // If user lacks a phone number, mandate completion
      if (!user.phone) {
        return Response.redirect(new URL("/complete-profile", baseUrl), 303);
      }

      return Response.redirect(
        new URL(user.role === "admin" ? "/admin" : "/feed", baseUrl),
        303
      );
    }

    // Create new member user authenticated via Google
    const newId = crypto.randomUUID();
    await database().batch([
      sql(
        "INSERT INTO users(id, email, display_name, role, verified, active, created_at, updated_at) VALUES(?, ?, ?, 'member', 1, 1, ?, ?)",
        newId,
        profile.email,
        profile.name,
        now,
        now
      ),
      sql("INSERT INTO profiles(user_id, avatar, updated_at) VALUES(?, ?, ?)", newId, profile.picture || null, now),
      sql("INSERT INTO memberships(user_id, updated_at) VALUES(?, ?)", newId, now),
    ]);

    await createSession(newId, false, true);

    const cookieHeader = request.headers.get("cookie") || "";
    const cookieRefMatch = cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith("afterglow_ref="));
    const cookieRef = cookieRefMatch ? decodeURIComponent(cookieRefMatch.split("=")[1] || "") : null;
    if (cookieRef) {
      try {
        await trackReferralSignup(newId, cookieRef);
      } catch (refErr) {
        console.error("Referral tracking error on Google signup:", refErr);
      }
    }

    // New Google user has no phone number yet -> mandate phone entry
    return Response.redirect(new URL("/complete-profile", baseUrl), 303);
  } catch (err) {
    console.error("Google Auth Callback error:", err);
    const message = encodeURIComponent(
      err instanceof Error ? err.message : "Google Sign-In failed. Please try again."
    );
    return Response.redirect(new URL(`/login?error=${message}`, baseUrl), 303);
  }
}
