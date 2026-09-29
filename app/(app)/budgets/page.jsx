import { PageHeader } from "@/components/layout/page-header";
import { BudgetsView } from "@/components/budgets/budgets-view";
import { auth } from "@/auth";
import { listBudgets } from "@/services/budget.service";
import { listCategories } from "@/services/category.service";

export const metadata = { title: "Budgets" };

export default async function BudgetsPage() {
  const session = await auth();
  const userId = session.user.id;
  const [budgets, categories] = await Promise.all([listBudgets(userId), listCategories(userId)]);

  return (
    <>
      <PageHeader title="Budgets" description="Monthly limits by category, updated as you spend." />
      <BudgetsView initial={budgets} categories={categories} />
    </>
  );
}
