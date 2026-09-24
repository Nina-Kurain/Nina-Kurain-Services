import { requireAccount } from "@/lib/server/auth";
import { Studio } from "./live-studio";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAccount(true);
  return <Studio />;
}
