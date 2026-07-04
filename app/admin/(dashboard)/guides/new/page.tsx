import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import GuideForm from "@/components/admin/GuideForm";
import { adminAssets } from "@/data/adminAssets";
import { listCategories } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "מדריך חדש" };

export default async function NewGuidePage() {
  await requireEditor();
  const categories = await listCategories("guide");

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={adminAssets.addGuideButton}
        title="הוספת מדריך"
        assetWidth={190}
        description="כותבים, שומרים — והמדריך באתר"
      />
      <GuideForm categories={categories} />
    </div>
  );
}
