import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const localDbPath = path.join(process.cwd(), '.wrangler', 'state', 'local-dev.sqlite');

function purgeUser(db, userId) {
  // Unparent child comment replies
  db.prepare("UPDATE comments SET parent_id = NULL WHERE parent_id IN (SELECT id FROM comments WHERE user_id = ?)").run(userId);
  // Delete comment likes
  db.prepare("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE user_id = ?)").run(userId);
  db.prepare("DELETE FROM comment_likes WHERE user_id = ?").run(userId);
  // Delete comments
  db.prepare("DELETE FROM comments WHERE user_id = ?").run(userId);
  // Delete saved posts and likes
  db.prepare("DELETE FROM saved_posts WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM likes WHERE user_id = ?").run(userId);
  // Delete notifications, feedback, email deliveries
  db.prepare("DELETE FROM notifications WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM feedback WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM email_deliveries WHERE user_id = ?").run(userId);
  // Delete media projects
  db.prepare("DELETE FROM media_exports WHERE project_id IN (SELECT id FROM media_projects WHERE owner_id = ?)").run(userId);
  db.prepare("DELETE FROM media_project_items WHERE project_id IN (SELECT id FROM media_projects WHERE owner_id = ?)").run(userId);
  db.prepare("DELETE FROM media_projects WHERE owner_id = ?").run(userId);
  // Delete sessions and tokens
  db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM auth_tokens WHERE user_id = ?").run(userId);
  // Delete memberships and subscriptions
  db.prepare("DELETE FROM memberships WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM subscriptions WHERE user_id = ?").run(userId);
  // NOTE: Payment transactions are NEVER deleted. They remain permanent and tamper-proof.
  // Delete profile
  db.prepare("DELETE FROM profiles WHERE user_id = ?").run(userId);
  // Delete user record
  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
}

console.log("=== DB Cleanup & Deleted Accounts Purge ===");

if (fs.existsSync(localDbPath)) {
  const db = new DatabaseSync(localDbPath);
  console.log(`Checking local SQLite database: ${localDbPath}`);

  const softDeleted = db.prepare("SELECT id, email, display_name FROM users WHERE email LIKE '%@deleted.invalid' OR (active = 0 AND role = 'member')").all();
  console.log(`Found ${softDeleted.length} soft-deleted/inactive member account(s).`);

  for (const u of softDeleted) {
    console.log(`- Purging user: ${u.id} (${u.email})`);
    purgeUser(db, u.id);
  }

  const unverifiedCutoff = Date.now() - 24 * 3600 * 1000;
  const expiredUnverified = db.prepare("SELECT id, email, display_name FROM users WHERE verified = 0 AND role = 'member' AND created_at <= ?").all(unverifiedCutoff);
  console.log(`Found ${expiredUnverified.length} expired unverified account(s) (>24h).`);

  for (const u of expiredUnverified) {
    console.log(`- Purging unverified user: ${u.id} (${u.email})`);
    purgeUser(db, u.id);
  }

  // Purge expired sessions and tokens
  const now = Date.now();
  const purgedSessions = db.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").run(now);
  const purgedTokens = db.prepare("DELETE FROM auth_tokens WHERE expires_at <= ?").run(now);
  const purgedOauth = db.prepare("DELETE FROM oauth_states WHERE expires_at <= ?").run(now);

  console.log(`Purged expired sessions: ${purgedSessions.changes}, tokens: ${purgedTokens.changes}, oauth states: ${purgedOauth.changes}`);

  // Reclaim disk space
  db.exec("VACUUM");
  console.log("Database VACUUM executed successfully. Space reclaimed.\n");
} else {
  console.log("No local SQLite database found at:", localDbPath);
}

console.log("--- Cloudflare D1 Production Instructions ---");
console.log("To clean up any old soft-deleted users in your remote Cloudflare D1 database, you can run:");
console.log("  npx wrangler d1 execute DB --remote --command=\"DELETE FROM users WHERE email LIKE '%@deleted.invalid' OR (active = 0 AND role = 'member');\"");
console.log("Or trigger the cron endpoint with your CRON_SECRET:");
console.log("  curl -X POST https://<your-domain>/api/cron/cleanup-unverified -H 'Authorization: Bearer <CRON_SECRET>'");
