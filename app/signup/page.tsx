import { currentUser } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "../auth-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create account" };

export default async function Page() {
  const user = await currentUser();
  if (user) {
    if (user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/feed");
    }
  }
  return <AuthForm mode="signup" />;
}
