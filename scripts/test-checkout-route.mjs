import './register-cf-loader.mjs';
import { POST } from '../app/api/billing/checkout/route.ts';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.join(process.cwd(), '.wrangler', 'state', 'local-dev.sqlite');
const db = new DatabaseSync(dbPath);
const user = db.prepare("SELECT * FROM users WHERE email='insta.ninak12@gmail.com'").get();
const session = db.prepare("SELECT * FROM auth_sessions WHERE user_id=?").get(user.id);

console.log('Testing checkout endpoint directly for plan tier_299...');

const req = new Request('http://localhost:3000/api/billing/checkout', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'origin': 'http://localhost:3000',
    'cookie': `session=${session.token_hash}`
  },
  body: JSON.stringify({ plan: 'tier_299' })
});

try {
  const res = await POST(req);
  console.log('Response status:', res.status);
  const data = await res.json();
  console.log('Response data:', data);
} catch (e) {
  console.error('Checkout error:', e);
}
