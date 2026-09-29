import { AuthForm } from "@/components/auth/auth-form";
import { safeCallbackUrl } from "@/lib/safe-redirect";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  const { callbackUrl } = await searchParams;
  return <AuthForm mode="login" callbackUrl={safeCallbackUrl(callbackUrl)} />;
}
