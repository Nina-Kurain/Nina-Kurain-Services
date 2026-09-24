import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.join(process.cwd(), '.wrangler', 'state', 'local-dev.sqlite');
const db = new DatabaseSync(dbPath);

console.log('Tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t=>t.name));
try {
  const plans = db.prepare('SELECT * FROM membership_plans').all();
  console.log('Plans count:', plans.length);
  console.log('First plan columns:', Object.keys(plans[0] || {}));
} catch (e) {
  console.error('Error selecting plans:', e.message);
}
