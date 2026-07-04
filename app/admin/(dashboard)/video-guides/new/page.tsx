import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import VideoGuideForm from "@/components/admin/VideoGuideForm";
import { adminAssets } from "@/data/adminAssets";
import { listCategories } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "מדריך וידאו חדש" };

export default async function NewVideoGuidePage() {
  await requireEditor();
  const categories = await listCategories("video_guide");

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={adminAssets.videoGuidesTitle}
        title="הוספת מדריך וידאו"
        assetWidth={220}
        description="מדביקים קישור, ממלאים פרטים — והשיעור באתר"
      />
      <VideoGuideForm categories={categories} />
    </div>
  );
}
