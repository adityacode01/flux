import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }) {
  // Middleware already blocks signed-out visitors; this is a second line of defence.
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { name, email } = session.user;
  return <AppShell user={{ name: name ?? email, email }}>{children}</AppShell>;
}
