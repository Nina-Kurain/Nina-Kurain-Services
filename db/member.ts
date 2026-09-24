import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "./index";
import { subscriptions, users } from "./schema";

export async function ensureUser(user: { userId: string; email: string; displayName: string }) {
  const db = getDb();
  const now = new Date();
  await db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: now } });
}

export async function getCurrentSubscription(userId: string) {
  const db = getDb();
  const [subscription] = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), inArray(subscriptions.status, ["active", "grace_period", "past_due", "cancel_at_period_end", "pending"])))
    .orderBy(desc(subscriptions.updatedAt)).limit(1);
  return subscription ?? null;
}

export function hasPaidAccess(status: string | null | undefined, graceEndsAt?: Date | null) {
  if (status === "active" || status === "cancel_at_period_end") return true;
  return status === "grace_period" && Boolean(graceEndsAt && graceEndsAt.getTime() > Date.now());
}
