import { row, rows, run, sql, database } from "./db";
import { entitlement, type Plan, getPlans } from "./entitlements";
import { emailReady, safelySendTransactionalEmail } from "./email";

export interface ReferralMilestone {
  milestone: number;
  required: number;
  tierLevel: number;
  planId: string;
  planName: string;
  days: number;
  achieved: boolean;
  unlocked: boolean;
  grantedAt?: number;
}

export interface UserReferralData {
  referralCode: string;
  referralUrl: string;
  totalReferred: number;
  validReferred: number;
  subscribedReferred: number;
  totalSubscribed: number;
  firstReferralAt: number | null;
  windowExpiresAt: number | null;
  isWindowActive: boolean;
  windowDaysRemaining: number;
  milestones: ReferralMilestone[];
  rewards: Array<{
    milestone: number;
    planId: string;
    tierLevel: number;
    days: number;
    grantedAt: number;
    expiresAt: number;
  }>;
}

/**
 * Initializes table schema for referrals and referral rewards safely in Cloudflare D1.
 */
export async function initializeReferrals(): Promise<void> {
  const statements = [
    "ALTER TABLE users ADD COLUMN referral_code text",
    `CREATE TABLE IF NOT EXISTS referrals (
      id text PRIMARY KEY,
      referrer_id text NOT NULL,
      referred_user_id text NOT NULL UNIQUE,
      referral_code text NOT NULL,
      status text NOT NULL DEFAULT 'registered',
      created_at integer NOT NULL,
      converted_at integer
    )`,
    "CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON referrals(referrer_id, status)",
    `CREATE TABLE IF NOT EXISTS referral_rewards (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      milestone integer NOT NULL,
      tier_level integer NOT NULL,
      plan_id text NOT NULL,
      days integer NOT NULL DEFAULT 7,
      granted_at integer NOT NULL,
      expires_at integer NOT NULL,
      subscription_id text,
      UNIQUE(user_id, milestone)
    )`
  ];

  for (const st of statements) {
    try {
      await run(st);
    } catch (_) {
      // Ignore if table/column already exists
    }
  }
}

/**
 * Generate a random, human-friendly referral code (e.g. NINA-7K9M2P)
 */
function randomReferralCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Removed ambiguous: 0, 1, I, O
  let code = "";
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < 6; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return `NINA-${code}`;
}

/**
 * Get an existing referral code for a user, or generate and assign a new unique one.
 */
export async function getOrCreateUserReferralCode(userId: string): Promise<string> {
  await initializeReferrals();
  const existing = await row<{ referral_code: string | null }>(
    "SELECT referral_code FROM users WHERE id = ?",
    userId
  );
  if (existing?.referral_code) {
    return existing.referral_code;
  }

  // Generate unique code with collision retry
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = randomReferralCode();
    const collision = await row<{ id: string }>(
      "SELECT id FROM users WHERE referral_code = ?",
      candidate
    );
    if (!collision) {
      await run(
        "UPDATE users SET referral_code = ?, updated_at = ? WHERE id = ?",
        candidate,
        Date.now(),
        userId
      );
      return candidate;
    }
  }

  // Fallback with timestamp suffix
  const fallback = `NINA-${userId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  await run(
    "UPDATE users SET referral_code = ?, updated_at = ? WHERE id = ?",
    fallback,
    Date.now(),
    userId
  );
  return fallback;
}

/**
 * Track a referral when a new user signs up using a referral code.
 */
export async function trackReferralSignup(
  newUserId: string,
  rawReferralCode: string | null | undefined
): Promise<boolean> {
  if (!rawReferralCode) return false;
  const code = rawReferralCode.trim().toUpperCase();
  if (!code) return false;

  await initializeReferrals();

  const referrer = await row<{ id: string }>(
    "SELECT id FROM users WHERE UPPER(referral_code) = ?",
    code
  );

  // Avoid self-referral or non-existent referrer
  if (!referrer || referrer.id === newUserId) {
    return false;
  }

  const now = Date.now();
  try {
    await run(
      "INSERT OR IGNORE INTO referrals(id, referrer_id, referred_user_id, referral_code, status, created_at) VALUES(?, ?, ?, ?, 'registered', ?)",
      crypto.randomUUID(),
      referrer.id,
      newUserId,
      code,
      now
    );
    return true;
  } catch (err) {
    console.error("Failed to track referral signup:", err);
    return false;
  }
}

/**
 * Triggered when a user completes their subscription payment.
 * Converts the referral and unlocks milestone trial rewards for the referrer:
 * - 1 referral subscription -> 7 days Tier 1 ("Private Access") trial
 * - 3 referral subscriptions -> 7 days Tier 2 ("Closer Access") trial
 * - 5 referral subscriptions -> 7 days Tier 3 ("Inner Circle") trial
 */
export async function processReferralConversion(purchaserUserId: string): Promise<void> {
  await initializeReferrals();

  const ref = await row<{ id: string; referrer_id: string; status: string; created_at: number }>(
    "SELECT id, referrer_id, status, created_at FROM referrals WHERE referred_user_id = ? AND status != 'converted'",
    purchaserUserId
  );

  if (!ref) {
    return;
  }

  const now = Date.now();

  // Mark this referral as converted
  await run(
    "UPDATE referrals SET status = 'converted', converted_at = ? WHERE id = ?",
    now,
    ref.id
  );

  const referrerId = ref.referrer_id;

  // Determine the 7-day qualification window from the referrer's FIRST referral
  const firstRef = await row<{ first_created_at: number }>(
    "SELECT MIN(created_at) AS first_created_at FROM referrals WHERE referrer_id = ?",
    referrerId
  );

  const firstReferralTime = Number(firstRef?.first_created_at ?? ref.created_at);
  const windowEnd = firstReferralTime + 7 * 86400000; // 7 days from first referral

  // If this referral registered after the 7-day window from the first referral, it does not count for milestone rewards
  if (ref.created_at > windowEnd) {
    return;
  }

  // Count only converted referrals who registered within 7 days of the first referral
  const convertedCountRow = await row<{ count: number }>(
    "SELECT COUNT(*) AS count FROM referrals WHERE referrer_id = ? AND status = 'converted' AND created_at <= ?",
    referrerId,
    windowEnd
  );
  const convertedCount = Number(convertedCountRow?.count ?? 0);

  // Milestones: 1 => Tier 1 (tier_299), 3 => Tier 2 (tier_499), 5 => Tier 3 (tier_649)
  const milestoneRules = [
    { milestone: 1, required: 1, tierLevel: 1, planId: "tier_299", planName: "Private Access" },
    { milestone: 3, required: 3, tierLevel: 2, planId: "tier_499", planName: "Closer Access" },
    { milestone: 5, required: 5, tierLevel: 3, planId: "tier_649", planName: "Inner Circle" }
  ];

  for (const rule of milestoneRules) {
    if (convertedCount >= rule.required) {
      // Check if already granted
      const alreadyGranted = await row<{ id: string }>(
        "SELECT id FROM referral_rewards WHERE user_id = ? AND milestone = ?",
        referrerId,
        rule.milestone
      );

      if (!alreadyGranted) {
        await grantReferralReward(referrerId, rule);
      }
    }
  }
}

/**
 * Grant a 7-day trial reward to the referrer.
 */
async function grantReferralReward(
  referrerId: string,
  rule: { milestone: number; tierLevel: number; planId: string; planName: string }
): Promise<void> {
  const now = Date.now();
  const trialDurationMs = 7 * 86400000; // 7 days
  const expiresAt = now + trialDurationMs;
  const rewardId = crypto.randomUUID();

  // Check referrer's current entitlement and subscription
  const currentEntitlement = await entitlement(referrerId);
  const currentSub = currentEntitlement.subscription;

  let newSubId: string | null = null;
  const ops = [];

  // If user has no active subscription or current plan level is lower than the reward tier:
  if (currentEntitlement.level < rule.tierLevel || !currentSub || !["active", "grace_period"].includes(currentSub.status)) {
    newSubId = crypto.randomUUID();
    ops.push(
      sql(
        "INSERT INTO subscriptions(id, user_id, plan_id, provider, status, current_period_start, current_period_end, created_at, updated_at) VALUES(?, ?, ?, 'complimentary', 'active', ?, ?, ?, ?)",
        newSubId,
        referrerId,
        rule.planId,
        now,
        expiresAt,
        now,
        now
      )
    );
    ops.push(
      sql(
        "INSERT INTO memberships(user_id, subscription_id, updated_at) VALUES(?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET subscription_id = excluded.subscription_id, updated_at = excluded.updated_at",
        referrerId,
        newSubId,
        now
      )
    );
  } else if (currentSub.provider === "complimentary" && currentSub.plan_id === rule.planId) {
    // Extend complimentary access by 7 days
    const baseEnd = Math.max(now, currentSub.current_period_end ?? now);
    const extendedEnd = baseEnd + trialDurationMs;
    ops.push(
      sql(
        "UPDATE subscriptions SET current_period_end = ?, updated_at = ? WHERE id = ?",
        extendedEnd,
        now,
        currentSub.id
      )
    );
    newSubId = currentSub.id;
  }

  // Record reward in referral_rewards
  ops.push(
    sql(
      "INSERT OR IGNORE INTO referral_rewards(id, user_id, milestone, tier_level, plan_id, days, granted_at, expires_at, subscription_id) VALUES(?, ?, ?, ?, ?, 7, ?, ?, ?)",
      rewardId,
      referrerId,
      rule.milestone,
      rule.tierLevel,
      rule.planId,
      now,
      expiresAt,
      newSubId
    )
  );

  // Send in-app notification
  ops.push(
    sql(
      "INSERT INTO notifications(id, user_id, title, body, created_at) VALUES(?, ?, ?, ?, ?)",
      crypto.randomUUID(),
      referrerId,
      `🎉 Referral Reward: 7 Days ${rule.planName} Trial!`,
      `You've reached ${rule.milestone} active subscriber ${rule.milestone === 1 ? "referral" : "referrals"}! Enjoy your complimentary 7 days of ${rule.planName} access. Thank you for supporting Nina!`,
      now
    )
  );

  await database().batch(ops);

  // Send celebratory email if configured
  if (emailReady()) {
    try {
      const user = await row<{ email: string; display_name: string }>(
        "SELECT email, display_name FROM users WHERE id = ?",
        referrerId
      );
      if (user) {
        await safelySendTransactionalEmail({
          userId: referrerId,
          email: user.email,
          kind: "membership_active",
          idempotencyKey: `referral-reward:${referrerId}:${rule.milestone}`,
          subject: `🎉 Reward Unlocked: 7 Days of ${rule.planName} Access!`,
          text: `Hi ${user.display_name},\n\nGreat news! One of your invited members just subscribed to Nina Kurain's VIP membership.\n\nYou've unlocked your 7-day complimentary trial of ${rule.planName} (Tier ${rule.tierLevel})!\n\nLog in now to experience your new VIP privileges:\nhttps://ninakurain.com/feed\n\nKeep sharing your referral code to unlock even higher tiers!`
        });
      }
    } catch (emailErr) {
      console.error("Referral reward email failed:", emailErr);
    }
  }
}

/**
 * Fetch referral dashboard data for a user
 */
export async function getUserReferralData(userId: string, origin?: string): Promise<UserReferralData> {
  await initializeReferrals();
  const code = await getOrCreateUserReferralCode(userId);

  const [referralRows, rewardsRows, plans] = await Promise.all([
    rows<{ status: string; created_at: number }>(
      "SELECT status, created_at FROM referrals WHERE referrer_id = ? ORDER BY created_at ASC",
      userId
    ),
    rows<{
      milestone: number;
      tier_level: number;
      plan_id: string;
      days: number;
      granted_at: number;
      expires_at: number;
    }>("SELECT * FROM referral_rewards WHERE user_id = ? ORDER BY milestone ASC", userId),
    getPlans()
  ]);

  const totalReferred = referralRows.length;
  const totalSubscribed = referralRows.filter(r => r.status === "converted").length;

  const firstReferralAt = referralRows.length > 0 ? referralRows[0].created_at : null;
  const windowExpiresAt = firstReferralAt ? firstReferralAt + 7 * 86400000 : null;
  const now = Date.now();
  const isWindowActive = windowExpiresAt ? now <= windowExpiresAt : false;
  const windowDaysRemaining = (windowExpiresAt && isWindowActive)
    ? Math.max(0, Math.ceil((windowExpiresAt - now) / 86400000))
    : 0;

  // Referrals valid for rewards must have signed up within 7 days of the first referral
  const validReferralRows = windowExpiresAt
    ? referralRows.filter(r => r.created_at <= windowExpiresAt)
    : referralRows;

  const validReferred = validReferralRows.length;
  const subscribedReferred = validReferralRows.filter(r => r.status === "converted").length;

  const grantedMap = new Map(rewardsRows.map(r => [r.milestone, r]));

  const milestoneConfigs = [
    { milestone: 1, required: 1, tierLevel: 1, planId: "tier_299", defaultName: "Private Access", days: 7 },
    { milestone: 3, required: 3, tierLevel: 2, planId: "tier_499", defaultName: "Closer Access", days: 7 },
    { milestone: 5, required: 5, tierLevel: 3, planId: "tier_649", defaultName: "Inner Circle", days: 7 }
  ];

  const milestones: ReferralMilestone[] = milestoneConfigs.map(config => {
    const plan = plans.find(p => p.id === config.planId || p.level === config.tierLevel);
    const reward = grantedMap.get(config.milestone);
    return {
      milestone: config.milestone,
      required: config.required,
      tierLevel: config.tierLevel,
      planId: config.planId,
      planName: plan?.name ?? config.defaultName,
      days: config.days,
      achieved: subscribedReferred >= config.required,
      unlocked: Boolean(reward),
      grantedAt: reward?.granted_at
    };
  });

  const baseUrl = origin ? origin.replace(/\/$/, "") : "";
  const referralUrl = baseUrl ? `${baseUrl}/signup?ref=${code}` : `/signup?ref=${code}`;

  return {
    referralCode: code,
    referralUrl,
    totalReferred,
    validReferred,
    subscribedReferred,
    totalSubscribed,
    firstReferralAt,
    windowExpiresAt,
    isWindowActive,
    windowDaysRemaining,
    milestones,
    rewards: rewardsRows.map(r => ({
      milestone: r.milestone,
      planId: r.plan_id,
      tierLevel: r.tier_level,
      days: r.days,
      grantedAt: r.granted_at,
      expiresAt: r.expires_at
    }))
  };
}
