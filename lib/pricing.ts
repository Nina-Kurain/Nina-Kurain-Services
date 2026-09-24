import type { Plan } from "./server/entitlements";

export interface PlanPricing {
  currentPrice: number;
  originalPrice: number;
  discountAmount: number;
  discountActive: boolean;
  discountLabel: string | null;
  discountBadge: string | null;
  discountEndsAt: number | null;
  savingsText: string;
  endsAtFormatted: string | null;
}

export function getPlanPricing(plan: Plan, now = Date.now()): PlanPricing {
  const amount = plan.discount_amount ?? 0;
  const active =
    Boolean(plan.discount_enabled) &&
    amount > 0 &&
    plan.level > 0 &&
    (!plan.discount_ends_at || plan.discount_ends_at > now);

  return {
    currentPrice: plan.price,
    originalPrice: active ? plan.price + amount : plan.price,
    discountAmount: active ? amount : 0,
    discountActive: active,
    discountLabel: active ? plan.discount_label || null : null,
    discountBadge: active ? plan.discount_badge || null : null,
    discountEndsAt: plan.discount_ends_at || null,
    savingsText: active
      ? `Save ₹${amount.toLocaleString("en-IN")}`
      : "",
    endsAtFormatted: active && plan.discount_ends_at
      ? `Offer ends ${new Date(plan.discount_ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
      : null,
  };
}
