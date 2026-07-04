import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import VideoGuideForm from "@/components/admin/VideoGuideForm";
import { getVideoGuideById, listCategories } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "עריכת מדריך וידאו" };

interface EditVideoGuidePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVideoGuidePage({ params }: EditVideoGuidePageProps) {
  await requireEditor();
  const { id } = await params;
  const [videoGuide, categories] = await Promise.all([
    getVideoGuideById(id),
    listCategories("video_guide"),
  ]);
  if (!videoGuide) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={`עריכה: ${videoGuide.title}`}
        description="כל שינוי שנשמר מתעדכן מיד באתר הציבורי"
      />
      <VideoGuideForm categories={categories} videoGuide={videoGuide} />
    </div>
  );
}
