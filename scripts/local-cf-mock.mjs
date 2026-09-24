import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbDir = path.join(root, ".wrangler", "state");
fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, "local-dev.sqlite");
const sqlite = new DatabaseSync(dbPath);

// Run migrations
try {
  sqlite.exec(`CREATE TABLE IF NOT EXISTS _local_migrations (name TEXT PRIMARY KEY);`);
  const applied = new Set(sqlite.prepare(`SELECT name FROM _local_migrations`).all().map(r => r.name));

  const drizzleDir = path.join(root, "drizzle");
  if (fs.existsSync(drizzleDir)) {
    const files = fs.readdirSync(drizzleDir).filter(f => f.endsWith(".sql")).sort();
    for (const file of files) {
      if (!applied.has(file)) {
        const content = fs.readFileSync(path.join(drizzleDir, file), "utf8");
        const statements = content.split("--> statement-breakpoint");
        for (let stmt of statements) {
          stmt = stmt.trim();
          if (stmt) {
            try {
              sqlite.exec(stmt);
            } catch (err) {
              // Ignore table already exists errors during re-runs
            }
          }
        }
        sqlite.prepare(`INSERT INTO _local_migrations(name) VALUES(?)`).run(file);
      }
    }
  }
} catch (err) {
  console.warn("[local-mock] Migration note:", err.message);
}

// Convert D1 prepare API to node:sqlite
class D1PreparedStatement {
  constructor(db, sql, values = []) {
    this.db = db;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new D1PreparedStatement(this.db, this.sql, values);
  }

  async first(col) {
    try {
      const stmt = this.db.prepare(this.sql);
      const row = stmt.get(...this.values);
      if (!row) return null;
      if (col) return row[col];
      return { ...row };
    } catch (e) {
      console.error("[local-d1 query error]:", this.sql, this.values, e);
      throw e;
    }
  }

  async all() {
    try {
      const stmt = this.db.prepare(this.sql);
      const results = stmt.all(...this.values).map(r => ({ ...r }));
      return { results, success: true };
    } catch (e) {
      console.error("[local-d1 query error]:", this.sql, this.values, e);
      throw e;
    }
  }

  async run() {
    try {
      const stmt = this.db.prepare(this.sql);
      const result = stmt.run(...this.values);
      return { success: true, meta: result };
    } catch (e) {
      console.error("[local-d1 run error]:", this.sql, this.values, e);
      throw e;
    }
  }
}

const mockD1 = {
  prepare(query) {
    return new D1PreparedStatement(sqlite, query);
  },
  async batch(statements) {
    const results = [];
    for (const stmt of statements) {
      results.push(await stmt.all());
    }
    return results;
  }
};

const mockBucket = {
  async get(key) { return null; },
  async put(key, value) { return { key }; },
  async delete(key) { return; }
};

let prodEnv = {};
try {
  const envFile = path.join(root, ".env.production");
  if (fs.existsSync(envFile)) {
    const raw = fs.readFileSync(envFile, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        prodEnv[k] = v;
      }
    }
  }
} catch (e) {}

export const env = {
  DB: mockD1,
  BUCKET: mockBucket,
  APP_URL: prodEnv.APP_URL || "http://localhost:3000",
  APP_ENV: prodEnv.APP_ENV || "development",
  ENABLE_TEST_ACCOUNTS: prodEnv.ENABLE_TEST_ACCOUNTS || "false",
  SESSION_SECRET: prodEnv.SESSION_SECRET || "local-dev-secret-super-safe-key-12345678",
  ADMIN_EMAIL: prodEnv.ADMIN_EMAIL || "insta.ninak12@gmail.com",
  CREATOR_EMAIL: prodEnv.ADMIN_EMAIL || "insta.ninak12@gmail.com",
  PAYMENT_MODE: prodEnv.PAYMENT_MODE || "live",
  RAZORPAY_KEY_ID: prodEnv.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: prodEnv.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: prodEnv.RAZORPAY_WEBHOOK_SECRET || "",
  MAIL_API_KEY: prodEnv.MAIL_API_KEY || "",
  MAIL_FROM: prodEnv.MAIL_FROM || ""
};

export default { env };

