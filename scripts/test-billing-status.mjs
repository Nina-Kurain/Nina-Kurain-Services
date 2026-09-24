import fs from 'node:fs';
import path from 'node:path';

const envFile = path.join(process.cwd(), '.env.production');
const raw = fs.readFileSync(envFile, 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

function billingStatus() {
  const mode = env.PAYMENT_MODE === "live" ? "live" : "test";
  const keyMode = env.RAZORPAY_KEY_ID?.startsWith("rzp_live_") ? "live" : env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ? "test" : "unknown";
  const issues = [];
  if (!env.RAZORPAY_KEY_ID) issues.push("Razorpay Key ID is missing.");
  if (!env.RAZORPAY_KEY_SECRET) issues.push("Razorpay Key Secret is missing.");
  if (!env.RAZORPAY_WEBHOOK_SECRET) issues.push("Razorpay Webhook Secret is missing.");
  if (env.RAZORPAY_KEY_ID && keyMode !== mode) issues.push(`PAYMENT_MODE is ${mode}, but the configured Razorpay key is ${keyMode}.`);
  if (!env.APP_URL || (!env.APP_URL.startsWith("https://") && !env.APP_URL.includes("localhost") && !env.APP_URL.includes("127.0.0.1"))) issues.push("APP_URL must be the production HTTPS origin.");
  return { ready: issues.length === 0, mode, keyMode, issues, webhookUrl: env.APP_URL ? `${env.APP_URL.replace(/\/$/, "")}/api/webhooks/razorpay` : null, keyId: env.RAZORPAY_KEY_ID || null };
}

console.log('Status result:', billingStatus());
