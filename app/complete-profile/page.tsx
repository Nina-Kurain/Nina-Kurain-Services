import { requireBaseAccount } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import { CompleteProfileClient } from "./complete-profile-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Complete Your Profile · Nina Kurain Club",
};

export default async function CompleteProfilePage() {
  const user = await requireBaseAccount();

  // If user already has a phone number registered, redirect them to feed or verification
  if (user.phone) {
    if (!user.verified) {
      redirect("/verify-email-pending");
    }
    redirect(user.role === "admin" ? "/admin" : "/feed");
  }

  return (
    <CompleteProfileClient
      email={user.email}
      displayName={user.display_name}
      isVerified={Boolean(user.verified)}
    />
  );
}
