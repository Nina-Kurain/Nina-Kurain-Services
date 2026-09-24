import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPlanPricing } from '../lib/pricing.ts';

const basePlan = (overrides = {}) => ({
  id: 'tier_299', name: 'Private Access', slug: 'tier_299', price: 300, currency: 'INR',
  description: '', benefits: '[]', level: 1, badge: '', active: 1, display_order: 1,
  provider_plan_id: null, discount_enabled: 1, discount_amount: 100,
  discount_label: 'MEMBER ACCESS PRICE', discount_badge: 'SAVE ₹100', discount_ends_at: null,
  ...overrides,
});

test('active discount computes correct original and current prices', () => {
  const p = getPlanPricing(basePlan());
  assert.equal(p.currentPrice, 300);
  assert.equal(p.originalPrice, 400);
  assert.equal(p.discountAmount, 100);
  assert.equal(p.discountActive, true);
  assert.equal(p.savingsText, 'Save ₹100');
  assert.equal(p.discountBadge, 'SAVE ₹100');
  assert.equal(p.discountLabel, 'MEMBER ACCESS PRICE');
});

test('tier 2 discount: ₹500 price + ₹150 = ₹650 original', () => {
  const p = getPlanPricing(basePlan({ id: 'tier_499', price: 500, discount_amount: 150, discount_badge: 'SAVE ₹150' }));
  assert.equal(p.currentPrice, 500);
  assert.equal(p.originalPrice, 650);
  assert.equal(p.discountAmount, 150);
  assert.equal(p.discountActive, true);
});

test('tier 3 discount: ₹650 price + ₹100 = ₹750 original', () => {
  const p = getPlanPricing(basePlan({ id: 'tier_649', price: 650, level: 3, discount_amount: 100, discount_badge: 'SAVE ₹100' }));
  assert.equal(p.currentPrice, 650);
  assert.equal(p.originalPrice, 750);
  assert.equal(p.discountAmount, 100);
  assert.equal(p.discountActive, true);
});

test('free plan never shows a discount', () => {
  const p = getPlanPricing(basePlan({ id: 'free', price: 0, level: 0, discount_enabled: 0, discount_amount: 0, discount_badge: null, discount_label: null }));
  assert.equal(p.discountActive, false);
  assert.equal(p.originalPrice, 0);
  assert.equal(p.discountAmount, 0);
  assert.equal(p.savingsText, '');
  assert.equal(p.discountBadge, null);
});

test('disabled discount toggle hides discount', () => {
  const p = getPlanPricing(basePlan({ discount_enabled: 0 }));
  assert.equal(p.discountActive, false);
  assert.equal(p.originalPrice, 300);
  assert.equal(p.discountAmount, 0);
  assert.equal(p.savingsText, '');
});

test('zero discount amount hides discount', () => {
  const p = getPlanPricing(basePlan({ discount_amount: 0 }));
  assert.equal(p.discountActive, false);
  assert.equal(p.originalPrice, 300);
});

test('expired discount date hides discount', () => {
  const past = Date.now() - 86400000;
  const p = getPlanPricing(basePlan({ discount_ends_at: past }));
  assert.equal(p.discountActive, false);
  assert.equal(p.originalPrice, 300);
  assert.equal(p.discountAmount, 0);
  assert.equal(p.endsAtFormatted, null);
});

test('future expiry date shows discount and formatted end date', () => {
  const future = Date.now() + 86400000 * 30;
  const p = getPlanPricing(basePlan({ discount_ends_at: future }));
  assert.equal(p.discountActive, true);
  assert.equal(p.originalPrice, 400);
  assert.ok(p.endsAtFormatted?.startsWith('Offer ends'));
});

test('price change recalculates correctly', () => {
  const p = getPlanPricing(basePlan({ price: 450, discount_amount: 100 }));
  assert.equal(p.currentPrice, 450);
  assert.equal(p.originalPrice, 550);
  assert.equal(p.discountAmount, 100);
});
