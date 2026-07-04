import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PageForm from "@/components/admin/PageForm";
import { adminAssets } from "@/data/adminAssets";
import { getPageBySlugAdmin } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "עריכת עמוד" };

interface EditPagePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPagePage({ params }: EditPagePageProps) {
  await requireEditor();
  const { slug } = await params;
  const page = await getPageBySlugAdmin(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={adminAssets.contentEditing}
        title={`עריכת עמוד: ${page.title}`}
        assetWidth={190}
        description="שמירה מעדכנת מיד את העמוד באתר הציבורי"
      />
      <PageForm page={page} />
    </div>
  );
}
