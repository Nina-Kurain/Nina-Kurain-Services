import { initializePlans } from "./entitlements";

export async function seedTestAccounts(_actor?: string): Promise<void> {
  // Production ready: No demo credentials or test accounts are seeded.
  await initializePlans();
}
