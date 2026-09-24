import { AuthForm } from "../auth-form";

export const metadata = {
  title: "New password",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <AuthForm mode="reset-password" linkToken={token ?? ""} />;
}
