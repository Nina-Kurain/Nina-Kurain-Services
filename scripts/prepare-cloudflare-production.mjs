import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function loadEnvFiles() {
  const initialEnv = { ...process.env };
  const envFiles = [".env", ".env.local", ".env.production", ".env.production.local"];

  for (const file of envFiles) {
    const fullPath = path.join(root, file);
    if (!existsSync(fullPath)) continue;

    // Use native loadEnvFile when available
    try {
      if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(fullPath);
      }
    } catch {
      // Fallback below
    }

    // Manual parser ensures line-by-line fallback and handles quotes
    try {
      const content = readFileSync(fullPath, "utf8");
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    } catch {
      // ignore
    }
  }

  // Preserve any explicit process.env overrides from the caller
  for (const [key, value] of Object.entries(initialEnv)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

export async function prepareCloudflareProduction() {
  loadEnvFiles();

  const configPath = path.join(root, "dist", "server", "wrangler.json");
  let rawConfig = "";
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      rawConfig = await readFile(configPath, "utf8");
      if (rawConfig) break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  const config = JSON.parse(rawConfig || "{}");

  config.name =
    process.env.CLOUDFLARE_WORKER_NAME ||
    process.env.CLOUDFLARE_PROJECT_NAME ||
    config.name ||
    "site-creator-vinext-starter";

  config.account_id =
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    config.account_id ||
    "f1099441759c455eba9318b083112257";

  config.d1_databases = [
    {
      binding: "DB",
      database_name:
        process.env.CLOUDFLARE_D1_DATABASE_NAME ||
        process.env.D1_DATABASE_NAME ||
        config.d1_databases?.[0]?.database_name ||
        "site-creator-d1",
      database_id:
        process.env.CLOUDFLARE_D1_DATABASE_ID ||
        process.env.D1_DATABASE_ID ||
        config.d1_databases?.[0]?.database_id ||
        "65df4e58-5eef-459d-9540-8131a5f5cf9f",
      migrations_dir: "../../drizzle",
    },
  ];

  // Google Drive is the only permanent media store for this deployment.
  config.r2_buckets = [];

  const googleDriveClientId =
    process.env.GOOGLE_DRIVE_CLIENT_ID ||
    config.vars?.GOOGLE_DRIVE_CLIENT_ID ||
    "";

  config.vars = {
    ...config.vars,
    APP_ENV: process.env.APP_ENV || config.vars?.APP_ENV || "production",
    APP_URL: process.env.APP_URL || config.vars?.APP_URL || "https://ninakurainservices.in",
    ENABLE_TEST_ACCOUNTS: process.env.ENABLE_TEST_ACCOUNTS ?? config.vars?.ENABLE_TEST_ACCOUNTS ?? "false",
    PAYMENT_MODE: process.env.PAYMENT_MODE || config.vars?.PAYMENT_MODE || "live",
    MAIL_FROM: process.env.MAIL_FROM || config.vars?.MAIL_FROM || "Nina Kurain Services <members@ninakurainservices.in>",
    GOOGLE_DRIVE_CLIENT_ID: googleDriveClientId,
    PINTEREST_SITE_VERIFICATION: process.env.PINTEREST_SITE_VERIFICATION || config.vars?.PINTEREST_SITE_VERIFICATION || "",
    GOOGLE_ADSENSE_CLIENT: process.env.GOOGLE_ADSENSE_CLIENT || config.vars?.GOOGLE_ADSENSE_CLIENT || "",
  };

  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Prepared Cloudflare production config: ${configPath}`);
  console.log(`- Worker Name: ${config.name}`);
  console.log(`- Account ID: ${config.account_id}`);
  console.log(`- D1 Database: ${config.d1_databases[0].database_name} (${config.d1_databases[0].database_id})`);
  console.log(`- APP_URL: ${config.vars.APP_URL}`);
  console.log(`- GOOGLE_DRIVE_CLIENT_ID: ${config.vars.GOOGLE_DRIVE_CLIENT_ID || "(not set)"}`);
  console.log(`- PINTEREST_SITE_VERIFICATION: ${config.vars.PINTEREST_SITE_VERIFICATION ? "configured" : "(not set)"}`);


  if (!config.vars.GOOGLE_DRIVE_CLIENT_ID) {
    console.warn("⚠️  Warning: GOOGLE_DRIVE_CLIENT_ID was not found in environment or .env.production");
  }

  return config;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await prepareCloudflareProduction();
}
