import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  loadEnvFiles,
  prepareCloudflareProduction,
  root,
} from "./prepare-cloudflare-production.mjs";

const SECRET_KEYS = [
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "MEDIA_SIGNING_SECRET",
  "GOOGLE_DRIVE_CLIENT_SECRET",
  "GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY",
  "MAIL_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "CRON_SECRET",
];

async function main() {
  const args = process.argv.slice(2);
  const varsOnly = args.includes("--vars-only");
  const dryRun = args.includes("--dry-run");

  console.log("=== Step 1: Syncing Cloudflare environment variables to wrangler.json ===");
  loadEnvFiles();
  await prepareCloudflareProduction();

  if (varsOnly) {
    console.log("\n(--vars-only specified; skipping remote secret synchronization)");
    return;
  }

  console.log("\n=== Step 2: Syncing secrets to Cloudflare Worker ===");
  const wranglerBin = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
  const relativeConfigPath = "dist/server/wrangler.json";
  const secretsToSync = SECRET_KEYS.filter((key) => Boolean(process.env[key]));

  if (secretsToSync.length === 0) {
    console.log("No secrets found in environment to sync.");
    return;
  }

  console.log(`Found ${secretsToSync.length} secret(s) to sync: ${secretsToSync.join(", ")}`);

  if (dryRun) {
    console.log("(--dry-run active; skipping remote secret upload)");
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  for (const key of secretsToSync) {
    const value = process.env[key];
    process.stdout.write(`Syncing secret ${key}... `);

    try {
      const result = spawnSync(
        process.execPath,
        [wranglerBin, "secret", "put", key, "--config", relativeConfigPath],
        {
          cwd: root,
          input: `${value}\n`,
          encoding: "utf8",
        }
      );

      if (result.status === 0) {
        console.log("✓ Done");
        successCount++;
      } else {
        console.log("✗ Failed");
        const errMsg = (result.stderr || result.stdout || "").trim();
        const firstLine = errMsg.split("\n").find((l) => l.includes("[ERROR]") || l.includes("Error")) || errMsg.split("\n")[0];
        console.warn(`  ${firstLine || "Command exited with status " + result.status}`);
        failureCount++;
      }
    } catch (err) {
      console.log("✗ Error");
      console.warn(`  ${err.message}`);
      failureCount++;
    }
  }

  console.log(`\nSecret sync completed: ${successCount} succeeded, ${failureCount} failed.`);
  if (failureCount > 0) {
    console.log("Note: If secrets failed to upload, make sure you are logged in with:");
    console.log("  pnpm exec wrangler login");
  } else {
    console.log("All secrets successfully synced to Cloudflare Worker!");
  }
}

await main();
