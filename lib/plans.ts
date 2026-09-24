export const PLAN_PRICES = { insider: 300, premium: 500, vip: 650 } as const;
export const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
