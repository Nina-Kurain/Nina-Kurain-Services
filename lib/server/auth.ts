import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "cloudflare:workers";
import { digest, token } from "./password";
import { row, rows, run, database, sql, HttpError } from "./db";

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
    // Remove payment transaction records
    sql("DELETE FROM payments WHERE user_id = ?", userId),
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

    // Find unverified member accounts older than 24 hours
    const expiredUnverified = await rows<{ id: string }>(
      "SELECT id FROM users WHERE verified = 0 AND role = 'member' AND created_at <= ?",
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

export async function currentUser(admin = false): Promise<Account | null> {
  const jar = await cookies();
  if (admin) {
    const value = jar.get(ADMIN_COOKIE)?.value;
    if (!value || value.length !== 64) return null;
    return row<Account>(
      "SELECT u.id,u.email,u.display_name,u.phone,u.role,u.verified,u.active,u.comments_blocked,u.created_at,s.token_hash AS session_hash FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.kind='admin' AND s.expires_at>? AND u.active=1 AND u.role='admin'",
      await digest(value),
      Date.now()
    );
  }
  const memberToken = jar.get(COOKIE)?.value;
  if (memberToken && memberToken.length === 64) {
    const member = await row<Account>(
      "SELECT u.id,u.email,u.display_name,u.phone,u.role,u.verified,u.active,u.comments_blocked,u.created_at,s.token_hash AS session_hash FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.kind='member' AND s.expires_at>? AND u.active=1",
      await digest(memberToken),
      Date.now()
    );
    if (member) return member;
  }
  const adminToken = jar.get(ADMIN_COOKIE)?.value;
  if (adminToken && adminToken.length === 64) {
    return row<Account>(
      "SELECT u.id,u.email,u.display_name,u.phone,u.role,u.verified,u.active,u.comments_blocked,u.created_at,s.token_hash AS session_hash FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.kind='admin' AND s.expires_at>? AND u.active=1 AND u.role='admin'",
      await digest(adminToken),
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

export async function createSession(userId: string, admin: boolean, remember: boolean) {
  const value = token();
  const maxAge = admin ? 8 * 3600 : remember ? 30 * 86400 : 86400;
  await run(
    "INSERT INTO auth_sessions(token_hash,user_id,kind,expires_at,created_at) VALUES(?,?,?,?,?)",
    await digest(value),
    userId,
    admin ? "admin" : "member",
    Date.now() + maxAge * 1000,
    Date.now()
  );
  const jar = await cookies();
  jar.set(admin ? ADMIN_COOKIE : COOKIE, value, {
    httpOnly: true,
    secure: env.APP_ENV !== "local",
    sameSite: "lax",
    path: "/",
    ...(remember || admin ? { maxAge } : {}),
  });
}

export async function clearSession(admin = false) {
  const jar = await cookies();
  const value = jar.get(admin ? ADMIN_COOKIE : COOKIE)?.value;
  if (value) await run("DELETE FROM auth_sessions WHERE token_hash=?", await digest(value));
  jar.set(admin ? ADMIN_COOKIE : COOKIE, "", {
    httpOnly: true,
    secure: env.APP_ENV !== "local",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
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

