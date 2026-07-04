import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProjectForm from "@/components/admin/ProjectForm";
import { adminAssets } from "@/data/adminAssets";
import { listCategories } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "פרויקט חדש" };

export default async function NewProjectPage() {
  await requireEditor();
  const categories = await listCategories("project");

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={adminAssets.addProjectButton}
        title="הוספת פרויקט"
        assetWidth={220}
        description="ממלאים, שומרים — והפרויקט באתר"
      />
      <ProjectForm categories={categories} />
    </div>
  );
}
