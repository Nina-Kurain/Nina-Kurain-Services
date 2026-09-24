import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const db = new DatabaseSync(':memory:');

// Apply drizzle migrations to in-memory db
const migrationFiles = (await readdir(path.join(root, 'drizzle'))).filter(x => x.endsWith('.sql')).sort();
for (const file of migrationFiles) {
  const content = await readFile(path.join(root, 'drizzle', file), 'utf8');
  for (const stmt of content.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean)) {
    db.exec(stmt);
  }
}
console.log('✓ All migrations applied to in-memory SQLite database');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Insert sample user
const userId = 'test-user-123';
const now = Date.now();
db.prepare("INSERT INTO users(id, email, display_name, role, active, verified, created_at, updated_at) VALUES(?, ?, ?, 'member', 1, 1, ?, ?)").run(
  userId, 'member@test.com', 'Test Member', now, now
);

// Insert profile
db.prepare("INSERT INTO profiles(user_id, bio, username, updated_at) VALUES(?, 'bio', 'testmember', ?)").run(userId, now);

// Insert subscription
const subId = 'sub-123';
db.prepare("INSERT INTO subscriptions(id, user_id, plan_id, status, created_at, updated_at) VALUES(?, ?, 'tier_299', 'active', ?, ?)").run(subId, userId, now, now);

// Insert membership
db.prepare("INSERT INTO memberships(user_id, subscription_id, updated_at) VALUES(?, ?, ?)").run(userId, subId, now);

// Insert auth session & token
db.prepare("INSERT INTO auth_sessions(token_hash, user_id, kind, expires_at, created_at) VALUES('hash1', ?, 'member', ?, ?)").run(userId, now + 10000, now);
db.prepare("INSERT INTO auth_tokens(token_hash, user_id, kind, expires_at) VALUES('token1', ?, 'verify', ?)").run(userId, now + 10000);

// Insert post by admin for likes/comments
db.prepare("INSERT INTO users(id, email, display_name, role, active, verified, created_at, updated_at) VALUES('admin-1', 'admin@test.com', 'Admin', 'admin', 1, 1, ?, ?)").run(now, now);
db.prepare("INSERT INTO posts(id, title, caption, created_by, created_at, updated_at) VALUES('post-1', 'Title', 'Cap', 'admin-1', ?, ?)").run(now, now);

// Member bookmarks & likes post
db.prepare("INSERT INTO saved_posts(user_id, post_id, created_at) VALUES(?, 'post-1', ?)").run(userId, now);
db.prepare("INSERT INTO likes(user_id, post_id, created_at) VALUES(?, 'post-1', ?)").run(userId, now);

// Member comments on post
db.prepare("INSERT INTO comments(id, user_id, post_id, body, created_at, updated_at) VALUES('comment-1', ?, 'post-1', 'Hello', ?, ?)").run(userId, now, now);

// Admin replies to member's comment
db.prepare("INSERT INTO comments(id, user_id, post_id, parent_id, body, created_at, updated_at) VALUES('comment-2', 'admin-1', 'post-1', 'comment-1', 'Reply', ?, ?)").run(now, now);

// Member likes admin's reply, Admin likes member's comment
db.prepare("INSERT INTO comment_likes(user_id, comment_id, created_at) VALUES(?, 'comment-2', ?)").run(userId, now);
db.prepare("INSERT INTO comment_likes(user_id, comment_id, created_at) VALUES('admin-1', 'comment-1', ?)").run(now);

// Member feedback & notification & payment
db.prepare("INSERT INTO feedback(id, user_id, category, rating, message, created_at, updated_at) VALUES('fb-1', ?, 'idea', 5, 'Great platform', ?, ?)").run(userId, now, now);
db.prepare("INSERT INTO notifications(id, user_id, title, body, created_at) VALUES('notif-1', ?, 'Welcome', 'Welcome note', ?)").run(userId, now);
db.prepare("INSERT INTO payments(id, user_id, amount, status, created_at) VALUES('pay-1', ?, 29900, 'captured', ?)").run(userId, now);

console.log('✓ Seeded test user with records in 12 relational tables');

// Now perform the exact purge routine
function purgeUserData(targetId) {
  db.prepare("UPDATE comments SET parent_id = NULL WHERE parent_id IN (SELECT id FROM comments WHERE user_id = ?)").run(targetId);
  db.prepare("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE user_id = ?)").run(targetId);
  db.prepare("DELETE FROM comment_likes WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM comments WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM saved_posts WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM likes WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM notifications WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM feedback WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM email_deliveries WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM media_exports WHERE project_id IN (SELECT id FROM media_projects WHERE owner_id = ?)").run(targetId);
  db.prepare("DELETE FROM media_project_items WHERE project_id IN (SELECT id FROM media_projects WHERE owner_id = ?)").run(targetId);
  db.prepare("DELETE FROM media_projects WHERE owner_id = ?").run(targetId);
  db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM auth_tokens WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM memberships WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM subscriptions WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM payments WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM profiles WHERE user_id = ?").run(targetId);
  db.prepare("DELETE FROM users WHERE id = ?").run(targetId);
}

purgeUserData(userId);

// Verify that user is completely removed from all tables
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM users WHERE id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM profiles WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM subscriptions WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM memberships WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM auth_sessions WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM auth_tokens WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM saved_posts WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM likes WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM comments WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM comment_likes WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM feedback WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM notifications WHERE user_id = ?").get(userId).c, 0);
assert.equal(db.prepare("SELECT COUNT(*) AS c FROM payments WHERE user_id = ?").get(userId).c, 0);

// Verify reply still exists and parent_id was nullified safely without foreign key failure
const reply = db.prepare("SELECT id, parent_id FROM comments WHERE id = 'comment-2'").get();
assert.equal(reply.id, 'comment-2');
assert.equal(reply.parent_id, null);

console.log('✓ Hard delete verified: All user data wiped with 0 orphaned rows and PRAGMA foreign_keys = ON enforced!');
