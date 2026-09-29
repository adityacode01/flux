import { PageHeader } from "@/components/layout/page-header";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="See how your income, spending and savings change over time." />
      <AnalyticsView />
    </>
  );
}
