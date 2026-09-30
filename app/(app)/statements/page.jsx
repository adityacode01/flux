import { PageHeader } from "@/components/layout/page-header";
import { StatementsView } from "@/components/statements/statements-view";

export const metadata = { title: "Statements" };

export default function StatementsPage() {
  return (
    <>
      <PageHeader title="Statements" description="A summary of your transactions for a chosen period." />
      <StatementsView />
    </>
  );
}