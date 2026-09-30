import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "cloudflare:workers";
import { digest, token } from "./password";
import { row, rows, run, database, sql, HttpError } from "./db";
import { CURRENT_REQUIRED_APP_VERSION, MIN_REQUIRED_VERSION_FLOAT } from "../app-version";

export type Account = {
  id: string;
  email: string;
  display_name: string;
  phone?: string | null;
  role: string;
  verified: number;
  active: number;
  comments_blocked: number;
  created_at: number;
  session_hash: string;
};

export const COOKIE = "afterglow_session";
export const ADMIN_COOKIE = "afterglow_admin";

/**
 * Permanently deletes a user and purges all related relational data
 * across all tables to save DB storage and prevent orphaned records.
 */
export async function purgeUserData(userId: string): Promise<void> {
  await database().batch([
    // Unparent any replies to comments made by this user so foreign keys don't break
    sql("UPDATE comments SET parent_id = NULL WHERE parent_id IN (SELECT id FROM comments WHERE user_id = ?)", userId),
    // Remove likes on this user's comments
    sql("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE user_id = ?)", userId),
    // Remove likes made by this user
    sql("DELETE FROM comment_likes WHERE user_id = ?", userId),
    // Remove comments made by this user
    sql("DELETE FROM comments WHERE user_id = ?", userId),
    // Remove bookmarks/saved posts and post likes
    sql("DELETE FROM saved_posts WHERE user_id = ?", userId),
    sql("DELETE FROM likes WHERE user_id = ?", userId),
    // Remove notifications, feedback, email deliveries
    sql("DELETE FROM notifications WHERE user_id = ?", userId),
    sql("DELETE FROM feedback WHERE user_id = ?", userId),
    sql("DELETE FROM email_deliveries WHERE user_id = ?", userId),
    // Remove media projects (exports, items, projects)
    sql("DELETE FROM media_exports WHERE project_id IN (SELECT id FROM media_projects WHERE owner_id = ?)", userId),
    sql("DELETE FROM media_project_items WHERE project_id IN (SELECT id FROM media_projects WHERE owner_id = ?)", userId),
    sql("DELETE FROM media_projects WHERE owner_id = ?", userId),
    // Remove auth sessions and tokens
    sql("DELETE FROM auth_sessions WHERE user_id = ?", userId),
    sql("DELETE FROM auth_tokens WHERE user_id = ?", userId),
    // Remove memberships and subscriptions
    sql("DELETE FROM memberships WHERE user_id = ?", userId),
    sql("DELETE FROM subscriptions WHERE user_id = ?", userId),
    // NOTE: Payment transactions are NEVER deleted. They remain tamper-proof and permanent.
    // Remove referrals and referral rewards
    sql("DELETE FROM referrals WHERE referrer_id = ? OR referred_user_id = ?", userId, userId),
    sql("DELETE FROM referral_rewards WHERE user_id = ?", userId),
    // Remove profile
    sql("DELETE FROM profiles WHERE user_id = ?", userId),
    // Finally delete the user record itself
    sql("DELETE FROM users WHERE id = ?", userId),
  ]);
}

/**
 * Purges:
 * 1. Any soft-deleted accounts (email ends in @deleted.invalid or active=0 and role='member')
 * 2. Unverified accounts older than 24 hours
 * 3. Expired sessions, tokens, and oauth states
 * NOTE: Payment records are permanently preserved and never deleted.
 */
export async function purgeAllDeletedAndExpiredUsers(): Promise<{
  purgedUsers: number;
  expiredSessions: number;
  expiredTokens: number;
}> {
  const now = Date.now();
  const unverifiedCutoff = now - 24 * 3600 * 1000;
  let purgedCount = 0;

  try {
    // Find soft-deleted accounts or inactive member accounts
    const deletedOrInactive = await rows<{ id: string }>(
      "SELECT id FROM users WHERE email LIKE '%@deleted.invalid' OR (active = 0 AND role = 'member')"
    );
    for (const u of deletedOrInactive) {
      await purgeUserData(u.id);
      purgedCount++;
    }

    // Find unverified member accounts older than 24 hours (including legacy accounts without verification)
    const expiredUnverified = await rows<{ id: string }>(
      "SELECT id FROM users WHERE (verified = 0 OR verified IS NULL) AND role = 'member' AND (created_at IS NULL OR created_at <= ?)",
      unverifiedCutoff
    );
    for (const u of expiredUnverified) {
      await purgeUserData(u.id);
      purgedCount++;
    }

    // Clean up expired sessions, tokens, and oauth states
    const sessionsRes = await run("DELETE FROM auth_sessions WHERE expires_at <= ?", now);
    const tokensRes = await run("DELETE FROM auth_tokens WHERE expires_at <= ?", now);
    await run("DELETE FROM oauth_states WHERE expires_at <= ?", now);

    return {
      purgedUsers: purgedCount,
      expiredSessions: sessionsRes?.meta?.changes ?? 0,
      expiredTokens: tokensRes?.meta?.changes ?? 0,
    };
  } catch (e) {
    console.error("Purge all deleted and expired users error:", e);
    return { purgedUsers: purgedCount, expiredSessions: 0, expiredTokens: 0 };
  }
}

/**
 * Purges member accounts that have remained unverified for more than 24 hours
 * and cleans up any deleted member records.
 */
export async function purgeExpiredUnverifiedUsers(): Promise<number> {
  const result = await purgeAllDeletedAndExpiredUsers();
  return result.purgedUsers;
}

import { signJwt, verifyJwt, type JwtPayload } from "./jwt";

export function getCookieDomain(): string | undefined {
  try {
    const appUrl = env.APP_URL || "";
    if (appUrl.includes("ninakurainservices.in")) {
      return "ninakurainservices.in";
    }
  } catch (_) {}
  return undefined;
}

export async function currentUser(admin = false): Promise<Account | null> {
  const jar = await cookies();
  let tokenVal: string | undefined;

  // 1. Try reading from request headers (for mobile apps or SPA with localStorage JWT)
  try {
    const h = await headers();
    const authHeader = h.get("authorization") || h.get("x-auth-token");
    if (authHeader) {
      if (authHeader.toLowerCase().startsWith("bearer ")) {
        tokenVal = authHeader.slice(7).trim();
      } else {
        tokenVal = authHeader.trim();
      }
    }
  } catch (_) {}

  // 2. Try reading from cookies if header wasn't present
  if (!tokenVal) {
    if (admin) {
      tokenVal = jar.get(ADMIN_COOKIE)?.value;
    } else {
      tokenVal = jar.get(COOKIE)?.value || jar.get(ADMIN_COOKIE)?.value;
    }
  }

  if (!tokenVal) return null;

  // 3. If token is a JWT (contains dots), verify cryptographically (guaranteed 90-day validity)
  if (tokenVal.includes(".")) {
    const payload = await verifyJwt(tokenVal);
    if (payload && payload.sub) {
      if (admin && payload.role !== "admin") {
        return null;
      }
      const user = await row<Account>(
        "SELECT u.id,u.email,u.display_name,u.phone,u.role,u.verified,u.active,u.comments_blocked,u.created_at, ? AS session_hash FROM users u WHERE u.id=? AND u.active=1",
        await digest(tokenVal),
        payload.sub
      );
      if (user) {
        if (admin && user.role !== "admin") return null;
        return user;
      }
    }
  }

  // 4. Legacy session token lookup (64-character token in auth_sessions)
  if (tokenVal.length === 64) {
    const hashed = await digest(tokenVal);
    if (admin) {
      return row<Account>(
        "SELECT u.id,u.email,u.display_name,u.phone,u.role,u.verified,u.active,u.comments_blocked,u.created_at,s.token_hash AS session_hash FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.kind='admin' AND s.expires_at>? AND u.active=1 AND u.role='admin'",
        hashed,
        Date.now()
      );
    }
    const member = await row<Account>(
      "SELECT u.id,u.email,u.display_name,u.phone,u.role,u.verified,u.active,u.comments_blocked,u.created_at,s.token_hash AS session_hash FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.kind='member' AND s.expires_at>? AND u.active=1",
      hashed,
      Date.now()
    );
    if (member) return member;

    // Check if admin is browsing as member
    return row<Account>(
      "SELECT u.id,u.email,u.display_name,u.phone,u.role,u.verified,u.active,u.comments_blocked,u.created_at,s.token_hash AS session_hash FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.kind='admin' AND s.expires_at>? AND u.active=1 AND u.role='admin'",
      hashed,
      Date.now()
    );
  }

  return null;
}

/**
 * Basic session presence check without redirecting to onboarding/verification.
 * Used exclusively by /complete-profile and /verify-email-pending.
 */
export async function requireBaseAccount(admin = false) {
  const u = await currentUser(admin);
  if (!u) redirect(admin ? "/admin/login" : "/login");
  return u;
}

/**
 * Strict data access enforcement:
 * 1. Must have an active session.
 * 2. Must have a mandatory mobile number.
 * 3. Must have a verified email address before accessing member content.
 */
export async function requireAccount(admin = false) {
  const u = await currentUser(admin);
  if (!u) redirect(admin ? "/admin/login" : "/login");
  if (!admin) {
    if (!u.phone) {
      redirect("/complete-profile");
    }
    if (!u.verified) {
      redirect("/verify-email-pending");
    }
  }
  return u;
}

export async function apiAccount(admin = false, requireVerified = false) {
  try {
    const h = await headers();
    const ua = h.get("user-agent") || "";
    const isApp = /NinaKurainApp/i.test(ua);
    const match = ua.match(/NinaKurainApp\/(\d+(\.\d+)?)/i);
    const version = match ? parseFloat(match[1]) : (isApp ? 1.0 : null);
    if (isApp && (version === null || version < MIN_REQUIRED_VERSION_FLOAT)) {
      throw new HttpError(426, `Mandatory app update required. Please update Nina Kurain to version ${CURRENT_REQUIRED_APP_VERSION} to access content.`);
    }
  } catch (e) {
    if (e instanceof HttpError) throw e;
  }
  const u = await currentUser(admin);
  if (!u) {
    throw new HttpError(
      admin ? 403 : 401,
      admin ? "Admin authentication is required." : "Please log in to continue."
    );
  }
  if (!admin && requireVerified && !u.verified) {
    throw new HttpError(403, "Please verify your email address to access this content.");
  }
  return u;
}

/**
 * Creates a persistent 90-day JWT session.
 * Does not ask the user to re-login for at least 90 days.
 */
export async function createSession(userId: string, admin: boolean, remember: boolean = true): Promise<string> {
  // Fetch user information for cryptographic JWT payload
  const user = await row<{ id: string; email: string; role: string; display_name: string }>(
    "SELECT id, email, role, display_name FROM users WHERE id=?",
    userId
  );

  const email = user?.email || (admin ? env.ADMIN_EMAIL || "admin@ninakurainservices.in" : "member@ninakurainservices.in");
  const role: "admin" | "member" = admin ? "admin" : "member";
  const name = user?.display_name || (admin ? "Nina Kurain" : "Member");

  // Mandatory 90-day persistence: 90 days * 86400 seconds = 7,776,000 seconds
  const maxAge = 90 * 86400;

  // Sign cryptographic JWT with 90-day expiry
  const jwt = await signJwt(
    {
      sub: userId,
      email,
      role,
      name,
    },
    maxAge
  );

  // Store in auth_sessions table for revocation/audit tracking
  await run(
    "INSERT INTO auth_sessions(token_hash,user_id,kind,expires_at,created_at) VALUES(?,?,?,?,?)",
    await digest(jwt),
    userId,
    role,
    Date.now() + maxAge * 1000,
    Date.now()
  );

  const jar = await cookies();
  const domain = getCookieDomain();

  const cookieOptions = {
    httpOnly: true,
    secure: env.APP_ENV !== "local",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    ...(domain ? { domain } : {}),
  };

  jar.set(admin ? ADMIN_COOKIE : COOKIE, jwt, cookieOptions);

  if (admin) {
    jar.set("nk_admin", "1", {
      httpOnly: false,
      secure: env.APP_ENV !== "local",
      sameSite: "lax" as const,
      path: "/",
      maxAge,
      ...(domain ? { domain } : {}),
    });
  }

  return jwt;
}

export async function clearSession(admin = false) {
  const jar = await cookies();
  const value = jar.get(admin ? ADMIN_COOKIE : COOKIE)?.value;
  if (value) await run("DELETE FROM auth_sessions WHERE token_hash=?", await digest(value));
  const domain = getCookieDomain();

  // Clear cookie both with and without domain
  const clearOptions = {
    httpOnly: true,
    secure: env.APP_ENV !== "local",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  jar.set(admin ? ADMIN_COOKIE : COOKIE, "", clearOptions);
  if (domain) {
    jar.set(admin ? ADMIN_COOKIE : COOKIE, "", { ...clearOptions, domain });
  }

  if (admin) {
    jar.set("nk_admin", "", { ...clearOptions, httpOnly: false });
    if (domain) {
      jar.set("nk_admin", "", { ...clearOptions, httpOnly: false, domain });
    }
  }
}

export async function rateLimit(key: string, limit = 10, seconds = 900) {
  const now = Date.now();
  const hashed = await digest(key);
  const entry = await row<{ count: number }>(
    "INSERT INTO auth_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING count",
    hashed,
    now + seconds * 1000,
    now,
    now
  );
  if ((entry?.count ?? limit + 1) > limit) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }
}

