import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dbPath = path.join(process.cwd(), ".wrangler", "state", "local-dev.sqlite");
const db = new DatabaseSync(dbPath);

const admin = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
if (!admin) {
  console.log("No admin found, aborting seed.");
  process.exit(0);
}

const count = db.prepare("SELECT count(*) as c FROM posts").get().c;
console.log("Current post count:", count);

if (count === 0) {
  console.log("Seeding sample posts and reels for Nina Kurain...");
  const now = Date.now();

  // 1. Assets
  const assets = [
    { id: "asset-1", storage_key: "public:nina-kurain-official-portrait.jpg", name: "nina-kurain-official-portrait.jpg", mime: "image/jpeg", bytes: 66723 },
    { id: "asset-2", storage_key: "public:nina-kurain-editorial-portrait.jpg", name: "nina-kurain-editorial-portrait.jpg", mime: "image/jpeg", bytes: 121555 },
    { id: "asset-3", storage_key: "public:nina-kurain-digital-creator.jpg", name: "nina-kurain-digital-creator.jpg", mime: "image/jpeg", bytes: 219876 },
    { id: "asset-4", storage_key: "public:vid-2.mp4", name: "vid-2.mp4", mime: "video/mp4", bytes: 498855 },
    { id: "asset-5", storage_key: "public:vid-3.mp4", name: "vid-3.mp4", mime: "video/mp4", bytes: 837812 },
    { id: "asset-6", storage_key: "public:booty.mp4", name: "booty.mp4", mime: "video/mp4", bytes: 1474498 }
  ];

  for (const a of assets) {
    db.prepare("INSERT OR IGNORE INTO media_assets(id, storage_key, name, mime, bytes, created_by, created_at) VALUES(?, ?, ?, ?, ?, ?, ?)").run(
      a.id, a.storage_key, a.name, a.mime, a.bytes, admin.id, now
    );
  }

  // 2. Posts
  const samplePosts = [
    {
      id: "post-reel-1",
      title: "Late Night Studio Loop",
      caption: "Unfiltered motion from tonight's private shoot in the studio ✨",
      is_reel: 1,
      access_mode: "free",
      minimum_level: 0,
      comment_level: 0,
      asset_id: "asset-4"
    },
    {
      id: "post-img-1",
      title: "Velvet Hour: Part I",
      caption: "Soft light, shadow play and the quiet moments before dawn.",
      is_reel: 0,
      access_mode: "free",
      minimum_level: 0,
      comment_level: 0,
      asset_id: "asset-1"
    },
    {
      id: "post-reel-2",
      title: "Golden Hour Provocateur",
      caption: "Exclusive slow-motion archive drop for members.",
      is_reel: 1,
      access_mode: "level",
      minimum_level: 1,
      comment_level: 0,
      asset_id: "asset-5"
    },
    {
      id: "post-img-2",
      title: "Silk & Secrets",
      caption: "From the private closer access collection.",
      is_reel: 0,
      access_mode: "level",
      minimum_level: 2,
      comment_level: 1,
      asset_id: "asset-2"
    }
  ];

  for (const p of samplePosts) {
    db.prepare(`
      INSERT INTO posts(
        id, title, caption, visibility, status, access_mode, minimum_level, comment_level,
        published_at, is_story, is_highlight, story_expires_at, created_by, created_at, updated_at
      ) VALUES(?, ?, ?, 'custom', 'published', ?, ?, ?, ?, 0, 0, NULL, ?, ?, ?)
    `).run(p.id, p.title, p.caption, p.access_mode, p.minimum_level, p.comment_level, now - 3600000, admin.id, now, now);

    db.prepare("INSERT INTO post_media(id, post_id, asset_id, display_order, cover) VALUES(?, ?, ?, 0, 1)").run(
      `pm-${p.id}`, p.id, p.asset_id
    );

    if (p.access_mode === "level") {
      db.prepare("INSERT OR IGNORE INTO post_access(post_id, plan_id) VALUES(?, ?)").run(p.id, p.minimum_level === 1 ? "tier_299" : "tier_499");
    }
  }

  // Set avatar in site_settings
  db.prepare("INSERT INTO site_settings(key, value) VALUES('creator_avatar_asset_id', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run("asset-1");

  console.log("Successfully seeded", samplePosts.length, "posts & reels!");
} else {
  console.log("Posts already exist. Count:", count);
}
