import { requireBaseAccount } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import { VerifyEmailPendingClient } from "@/app/verify-email-pending/verify-email-pending-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Verify Your Email · Nina Kurain Club",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VerifyEmailPendingPage() {
  const user = await requireBaseAccount();

  // If user is already verified:
  if (user.verified) {
    if (!user.phone) {
      redirect("/complete-profile");
    }
    redirect(user.role === "admin" ? "/admin" : "/feed");
  }

  return (
    <VerifyEmailPendingClient
      email={user.email}
      displayName={user.display_name}
      hasPhone={Boolean(user.phone)}
    />
  );
}
