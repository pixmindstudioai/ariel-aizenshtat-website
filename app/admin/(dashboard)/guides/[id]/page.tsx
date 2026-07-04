import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import GuideForm from "@/components/admin/GuideForm";
import { getGuideById, listCategories } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "עריכת מדריך" };

interface EditGuidePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGuidePage({ params }: EditGuidePageProps) {
  await requireEditor();
  const { id } = await params;
  const [guide, categories] = await Promise.all([getGuideById(id), listCategories("guide")]);
  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={`עריכה: ${guide.title}`}
        description="כל שינוי שנשמר מתעדכן מיד באתר הציבורי"
      />
      <GuideForm categories={categories} guide={guide} />
    </div>
  );
}
