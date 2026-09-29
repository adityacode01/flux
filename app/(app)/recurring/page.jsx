import { PageHeader } from "@/components/layout/page-header";
import { RecurringView } from "@/components/recurring/recurring-view";
import { auth } from "@/auth";
import { listCategories } from "@/services/category.service";
import { listRecurring } from "@/services/recurring.service";

export const metadata = { title: "Recurring" };

export default async function RecurringPage() {
  const session = await auth();
  const userId = session.user.id;
  const [recurring, categories] = await Promise.all([listRecurring(userId), listCategories(userId)]);

  return (
    <>
      <PageHeader title="Recurring" description="Rent, salary and subscriptions that repeat on a schedule." />
      <RecurringView initial={recurring} categories={categories} />
    </>
  );
}
