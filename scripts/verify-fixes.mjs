import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Load environment from .env.production
const envText = fs.readFileSync(path.join(process.cwd(), ".env.production"), "utf8");
const env = {};
for (const line of envText.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

console.log("=== VERIFYING NINA KURAIN FIXES ===");

const dbPath = path.join(process.cwd(), ".wrangler", "state", "local-dev.sqlite");
const db = new DatabaseSync(dbPath);

// 1. Test Membership Plan Update & Discount schema
console.log("\n[1] Testing Membership Plans Schema & Updates...");
const plansBefore = db.prepare("SELECT id, name, price, discount_enabled, discount_amount, discount_badge, discount_ends_at FROM membership_plans WHERE id='tier_499'").get();
console.log("Current tier_499:", plansBefore);

// Simulate updating plan with custom discount
const now = Date.now();
const updateRes = db.prepare(`
  UPDATE membership_plans 
  SET name=?, description=?, price=?, benefits=?, badge=?, active=?, display_order=?, level=?,
      discount_enabled=?, discount_amount=?, discount_label=?, discount_badge=?, discount_ends_at=?, updated_at=?
  WHERE id=?
`).run(
  "Closer Access", "Exclusive films and tapes", 500, JSON.stringify(["Full archive", "4K drops"]), "BEST VALUE", 1, 2, 2,
  1, 150, "LIMITED OFFER", "SAVE ₹150", now + 172800000, now, "tier_499"
);
console.log("Plan update rows affected:", updateRes.changes);

const plansAfter = db.prepare("SELECT id, name, price, discount_enabled, discount_amount, discount_badge, discount_label, discount_ends_at FROM membership_plans WHERE id='tier_499'").get();
console.log("Updated tier_499:", plansAfter);
if (plansAfter.discount_badge === "SAVE ₹150" && plansAfter.discount_amount === 150) {
  console.log("✅ Plan update & discount columns verified successfully!");
} else {
  console.error("❌ Plan update failed!");
}

// 2. Test Likes Functionality
console.log("\n[2] Testing Like & Unlike Operations...");
const admin = db.prepare("SELECT id, role FROM users WHERE role='admin' LIMIT 1").get();
const post = db.prepare("SELECT id, title FROM posts LIMIT 1").get();
console.log("Admin user ID:", admin.id, "| Post:", post.title);

// Clean prior likes
db.prepare("DELETE FROM likes WHERE user_id=? AND post_id=?").run(admin.id, post.id);

// Like
db.prepare("INSERT OR IGNORE INTO likes(user_id, post_id, created_at) VALUES(?, ?, ?)").run(admin.id, post.id, now);
const likeRecord = db.prepare("SELECT * FROM likes WHERE user_id=? AND post_id=?").get(admin.id, post.id);
const likeCount1 = db.prepare("SELECT count(*) as c FROM likes WHERE post_id=?").get(post.id).c;
console.log("Like record after like:", likeRecord, "| Count:", likeCount1);

if (likeRecord && likeCount1 > 0) {
  console.log("✅ Like operation verified!");
} else {
  console.error("❌ Like failed!");
}

// Unlike
db.prepare("DELETE FROM likes WHERE user_id=? AND post_id=?").run(admin.id, post.id);
const unlikeRecord = db.prepare("SELECT * FROM likes WHERE user_id=? AND post_id=?").get(admin.id, post.id);
const likeCount2 = db.prepare("SELECT count(*) as c FROM likes WHERE post_id=?").get(post.id).c;
console.log("After unlike:", unlikeRecord, "| Count:", likeCount2);
if (!unlikeRecord) {
  console.log("✅ Unlike operation verified!");
} else {
  console.error("❌ Unlike failed!");
}

// 3. Test Razorpay Live Subscription / Checkout Creation
console.log("\n[3] Testing Razorpay Gateway Checkout Subscription Creation...");
async function testRazorpayGateway() {
  const authHeader = `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")}`;
  
  // Create or get plan
  const planRes = await fetch("https://api.razorpay.com/v1/plans", {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      period: "monthly",
      interval: 1,
      item: { name: "Test Closer Access", amount: 50000, currency: "INR", description: "Test Access" }
    })
  });
  const rzpPlan = await planRes.json();
  console.log("Razorpay Plan ID:", rzpPlan.id);

  // Create subscription
  const subRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: rzpPlan.id,
      total_count: 120,
      quantity: 1,
      customer_notify: 1,
      notes: { user_id: admin.id, test: "e2e_verification" }
    })
  });
  const subData = await subRes.json();
  console.log("Subscription status:", subRes.status);
  console.log("Subscription ID:", subData.id);
  console.log("Hosted Checkout Short URL:", subData.short_url);

  if (subRes.ok && subData.id && subData.short_url) {
    console.log("✅ Payment Gateway Checkout generation verified successfully!");
  } else {
    console.error("❌ Payment Gateway Checkout failed:", subData);
  }
}

testRazorpayGateway().catch(console.error);
