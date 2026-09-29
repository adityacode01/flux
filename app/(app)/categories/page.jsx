import { PageHeader } from "@/components/layout/page-header";
import { CategoriesView } from "@/components/categories/categories-view";
import { auth } from "@/auth";
import { listCategories } from "@/services/category.service";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const session = await auth();
  const categories = await listCategories(session.user.id);
  return (
    <>
      <PageHeader title="Categories" description="Organise your money. Add your own alongside the defaults." />
      <CategoriesView initial={categories} />
    </>
  );
}
