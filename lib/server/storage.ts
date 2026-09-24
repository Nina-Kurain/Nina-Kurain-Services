import { row, rows, run, sql, database } from "./db";

export interface DatabaseStorageStats {
  totalBytes: number;
  freeBytes: number;
  pageCount: number;
  pageSize: number;
  freelistCount: number;
  d1LimitBytes: number;
  availableBytes: number;
  usagePercent: number;
  tables: {
    users: number;
    subscriptions: number;
    payments: number;
    media_assets: number;
    media_bytes: number;
    posts: number;
    comments: number;
    referrals: number;
    referral_rewards: number;
    admin_activity: number;
    auth_sessions: number;
    rate_limits: number;
    oauth_states: number;
    notifications: number;
  };
}

/**
 * Calculates current database storage usage and table row breakdown.
 * Uses SQLite PRAGMA page_count and page_size for exact byte allocation.
 */
export async function getDatabaseStorageStats(): Promise<DatabaseStorageStats> {
  let pageCount = 0;
  let pageSize = 4096;
  let freelistCount = 0;

  try {
    const pc = await row<Record<string, number>>("PRAGMA page_count;");
    if (pc && typeof pc.page_count === "number") pageCount = pc.page_count;
  } catch (_) {}

  try {
    const ps = await row<Record<string, number>>("PRAGMA page_size;");
    if (ps && typeof ps.page_size === "number") pageSize = ps.page_size;
  } catch (_) {}

  try {
    const fc = await row<Record<string, number>>("PRAGMA freelist_count;");
    if (fc && typeof fc.freelist_count === "number") freelistCount = fc.freelist_count;
  } catch (_) {}

  const totalBytes = pageCount > 0 ? pageCount * pageSize : 1024 * 1024; // Fallback estimate if PRAGMA is restricted
  const freeBytes = freelistCount * pageSize;
  const d1LimitBytes = 500 * 1024 * 1024; // 500 MB base Cloudflare D1 quota
  const availableBytes = Math.max(0, d1LimitBytes - totalBytes);
  const usagePercent = Math.min(100, Math.max(0.1, Math.round((totalBytes / d1LimitBytes) * 1000) / 10));

  const [
    usersRow,
    subsRow,
    paymentsRow,
    mediaRow,
    mediaBytesRow,
    postsRow,
    commentsRow,
    referralsRow,
    rewardsRow,
    activityRow,
    sessionsRow,
    rateLimitsRow,
    oauthRow,
    notificationsRow
  ] = await Promise.all([
    row<{ count: number }>("SELECT COUNT(*) AS count FROM users").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM subscriptions").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM payments").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM media_assets").catch(() => ({ count: 0 })),
    row<{ total: number }>("SELECT SUM(bytes) AS total FROM media_assets").catch(() => ({ total: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM posts").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM comments").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM referrals").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM referral_rewards").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM admin_activity").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM auth_sessions").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM rate_limits").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM oauth_states").catch(() => ({ count: 0 })),
    row<{ count: number }>("SELECT COUNT(*) AS count FROM notifications").catch(() => ({ count: 0 }))
  ]);

  return {
    totalBytes,
    freeBytes,
    pageCount,
    pageSize,
    freelistCount,
    d1LimitBytes,
    availableBytes,
    usagePercent,
    tables: {
      users: Number(usersRow?.count ?? 0),
      subscriptions: Number(subsRow?.count ?? 0),
      payments: Number(paymentsRow?.count ?? 0),
      media_assets: Number(mediaRow?.count ?? 0),
      media_bytes: Number(mediaBytesRow?.total ?? 0),
      posts: Number(postsRow?.count ?? 0),
      comments: Number(commentsRow?.count ?? 0),
      referrals: Number(referralsRow?.count ?? 0),
      referral_rewards: Number(rewardsRow?.count ?? 0),
      admin_activity: Number(activityRow?.count ?? 0),
      auth_sessions: Number(sessionsRow?.count ?? 0),
      rate_limits: Number(rateLimitsRow?.count ?? 0),
      oauth_states: Number(oauthRow?.count ?? 0),
      notifications: Number(notificationsRow?.count ?? 0)
    }
  };
}

export interface CleanupResult {
  message: string;
  itemsCleared: number;
  stats: DatabaseStorageStats;
}

/**
 * Safely clears unnecessary/stale database storage without deleting member data or posts.
 */
export async function cleanDatabaseStorage(
  mode: "temp" | "activity" | "notifications" | "all" = "all"
): Promise<CleanupResult> {
  const now = Date.now();
  let clearedCount = 0;
  const actions: string[] = [];

  // 1. Temporary Data (OAuth states, expired sessions, stale rate limits)
  if (mode === "temp" || mode === "all") {
    try {
      const oauthRes = await run("DELETE FROM oauth_states WHERE expires_at <= ?", now);
      clearedCount += oauthRes.meta?.changes ?? 0;
    } catch (_) {}

    try {
      const sessionRes = await run("DELETE FROM auth_sessions WHERE expires_at <= ?", now);
      clearedCount += sessionRes.meta?.changes ?? 0;
    } catch (_) {}

    try {
      const rateRes = await run("DELETE FROM rate_limits WHERE reset_at <= ?", now);
      clearedCount += rateRes.meta?.changes ?? 0;
    } catch (_) {}

    actions.push("expired sessions & auth tokens");
  }

  // 2. Activity Logs (Keep only recent 150 items)
  if (mode === "activity" || mode === "all") {
    try {
      const keepThreshold = await row<{ id: string; created_at: number }>(
        "SELECT id, created_at FROM admin_activity ORDER BY created_at DESC LIMIT 1 OFFSET 150"
      );
      if (keepThreshold?.created_at) {
        const actRes = await run(
          "DELETE FROM admin_activity WHERE created_at < ?",
          keepThreshold.created_at
        );
        clearedCount += actRes.meta?.changes ?? 0;
        actions.push("old activity logs");
      }
    } catch (_) {}
  }

  // 3. Notifications older than 30 days
  if (mode === "notifications" || mode === "all") {
    try {
      const thirtyDaysAgo = now - 30 * 86400000;
      const notifRes = await run("DELETE FROM notifications WHERE created_at < ?", thirtyDaysAgo);
      clearedCount += notifRes.meta?.changes ?? 0;
      actions.push("notifications older than 30 days");
    } catch (_) {}
  }

  // Run SQLite optimize
  try {
    await run("PRAGMA optimize;");
  } catch (_) {}

  const stats = await getDatabaseStorageStats();
  const summary = actions.length > 0 ? actions.join(", ") : "temporary data";
  const message = clearedCount > 0
    ? `Successfully cleared ${clearedCount.toLocaleString()} stale records (${summary}).`
    : "Database is already clean. No expired or stale records found.";

  return {
    message,
    itemsCleared: clearedCount,
    stats
  };
}
