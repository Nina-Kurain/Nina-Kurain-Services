import { AuthForm } from "../auth-form";

export const metadata = {
  title: "Reset your password",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AuthForm mode="forgot-password" />;
}
