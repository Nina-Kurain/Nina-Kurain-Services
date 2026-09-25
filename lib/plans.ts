export const PLAN_PRICES = { insider: 300, premium: 500, vip: 650 } as const;
export const IOS_SURCHARGE = 50;

/**
 * Returns the plan price for the given platform.
 * iOS is always +₹50 more than Android / APK.
 */
export const getPlatformPlanPrice = (planKey: keyof typeof PLAN_PRICES, isIos = false): number => {
  return PLAN_PRICES[planKey] + (isIos ? IOS_SURCHARGE : 0);
};

export const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
