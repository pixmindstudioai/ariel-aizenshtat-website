import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoryManager from "@/components/admin/CategoryManager";
import { adminAssets } from "@/data/adminAssets";
import { getCategoryUsage, listCategories } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "קטגוריות" };

export default async function AdminCategoriesPage() {
  await requireStaff();
  const categories = await listCategories();
  const usageEntries = await Promise.all(
    categories.map(async (c) => [c.id, await getCategoryUsage(c.id)] as const)
  );
  const usage = Object.fromEntries(usageEntries);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        asset={adminAssets.addCategoryButton}
        title="קטגוריות"
        assetWidth={190}
        description="הקטגוריות מופיעות בפילטרים באתר — פרויקטים, מדריכים ווידאו"
      />
      <CategoryManager categories={categories} usage={usage} />
    </div>
  );
}
