import type { Plan } from "./server/entitlements";

export const IOS_SURCHARGE = 50;

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
  platformSurcharge: number;
  isIos: boolean;
  platformLabel: string;
}

/**
 * Detects whether the visitor is accessing from iOS (iPhone/iPad/iOS app).
 */
export function isIOSClient(): boolean {
  if (typeof window === "undefined") return false;
  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || "").toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ipod") ||
    ua.includes("ninakurainapp/1.0 (ios") ||
    ua.includes("ios; securenative") ||
    search.includes("platform=ios")
  );
}

export function getPlatformSurcharge(isIos?: boolean): number {
  if (typeof isIos === "boolean") return isIos ? IOS_SURCHARGE : 0;
  return isIOSClient() ? IOS_SURCHARGE : 0;
}

export function getPlanPricing(plan: Plan, now = Date.now(), isIos?: boolean): PlanPricing {
  const surcharge = plan.level > 0 ? getPlatformSurcharge(isIos) : 0;
  const rawBase = (plan as any).base_price ?? plan.price;
  const basePrice = plan.level > 0 ? rawBase + surcharge : 0;
  const amount = plan.discount_amount ?? 0;
  const active =
    Boolean(plan.discount_enabled) &&
    amount > 0 &&
    plan.level > 0 &&
    (!plan.discount_ends_at || plan.discount_ends_at > now);

  return {
    currentPrice: basePrice,
    originalPrice: active ? basePrice + amount : basePrice,
    discountAmount: active ? amount : 0,
    discountActive: active,
    discountLabel: active ? plan.discount_label || null : null,
    discountBadge: active ? plan.discount_badge || null : null,
    discountEndsAt: plan.discount_ends_at || null,
    platformSurcharge: surcharge,
    isIos: surcharge > 0,
    platformLabel: surcharge > 0 ? "iOS Edition (+₹50)" : "Android / APK Edition",
    savingsText: active
      ? `Save ₹${amount.toLocaleString("en-IN")}`
      : "",
    endsAtFormatted: active && plan.discount_ends_at
      ? `Offer ends ${new Date(plan.discount_ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
      : null,
  };
}
