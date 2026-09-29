import { PageHeader } from "@/components/layout/page-header";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { auth } from "@/auth";
import { listCategories } from "@/services/category.service";
import { listTransactions } from "@/services/transaction.service";
import { listTransactionsSchema } from "@/validations/transaction";

export const metadata = { title: "Transactions" };

export default async function TransactionsPage({ searchParams }) {
  const params = await searchParams;
  const session = await auth();
  const userId = session.user.id;

  const query = listTransactionsSchema.parse(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "")));
  const [initial, categories] = await Promise.all([listTransactions(userId, query), listCategories(userId)]);

  return (
    <>
      <PageHeader title="Transactions" description="Search, filter and manage everything you've recorded." />
      <TransactionsView initial={initial} categories={categories} initialFilters={{ q: query.q ?? "", type: query.type ?? "", categoryId: query.categoryId ?? "", from: params.from ?? "", to: params.to ?? "" }} />
    </>
  );
}
