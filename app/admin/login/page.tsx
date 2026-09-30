import { currentUser } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "../../auth-form";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Creator login",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  const user = await currentUser(true);
  if (user) {
    redirect("/admin");
  }
  return <AuthForm mode="admin-login" />;
}
