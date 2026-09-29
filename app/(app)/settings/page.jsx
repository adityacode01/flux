import { PageHeader } from "@/components/layout/page-header";
import { SettingsView } from "@/components/settings/settings-view";
import { auth } from "@/auth";
import { getProfile } from "@/services/user.service";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  const user = await getProfile(session.user.id);
  return (
    <>
      <PageHeader title="Settings" description="Your profile and how Flux looks." />
      <SettingsView user={user} />
    </>
  );
}
