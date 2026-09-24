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

const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');

async function testRazorpay() {
  console.log('Testing Razorpay with Key ID:', env.RAZORPAY_KEY_ID);
  
  // 1. Test plans API
  try {
    const plansRes = await fetch('https://api.razorpay.com/v1/plans', {
      headers: { Authorization: `Basic ${auth}` }
    });
    const plansData = await plansRes.json();
    console.log('Plans status:', plansRes.status);
    console.log('Existing plans count:', plansData.count, plansData.items?.map(i => ({ id: i.id, name: i.item?.name, amount: i.item?.amount })));
  } catch (e) {
    console.error('Plans error:', e);
  }

  // 2. Test create test plan if needed
  try {
    const createPlanRes = await fetch('https://api.razorpay.com/v1/plans', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: 'monthly',
        interval: 1,
        item: {
          name: 'Test Private Access',
          amount: 30000,
          currency: 'INR',
          description: 'Test membership'
        }
      })
    });
    const planResult = await createPlanRes.json();
    console.log('Create plan status:', createPlanRes.status, planResult);

    if (planResult.id) {
      // 3. Test creating subscription
      const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planResult.id,
          total_count: 120,
          quantity: 1,
          customer_notify: 1
        })
      });
      const subResult = await subRes.json();
      console.log('Create subscription status:', subRes.status, subResult);
    }
  } catch (e) {
    console.error('Create plan/subscription error:', e);
  }
}

testRazorpay();
