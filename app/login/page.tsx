import { currentUser } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "../auth-form";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Log in",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  const user = await currentUser();
  if (user) {
    if (user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/feed");
    }
  }
  return <AuthForm mode="login" />;
}
