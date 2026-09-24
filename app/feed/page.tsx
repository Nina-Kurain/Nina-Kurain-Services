import { requireAccount } from "@/lib/server/auth";
import { Feed } from "../live-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Feed",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  await requireAccount();
  return <Feed />;
}
