import { requireAccount } from "@/lib/server/auth";
import { AccountPage } from "../live-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Account",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  await requireAccount();
  return <AccountPage />;
}
