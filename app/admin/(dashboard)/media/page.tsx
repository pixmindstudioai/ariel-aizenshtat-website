import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MediaManager from "@/components/admin/MediaManager";
import { adminAssets } from "@/data/adminAssets";
import { listMedia } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth";
import { can } from "@/lib/admin/permissions";

export const metadata: Metadata = { title: "מדיה" };

interface MediaPageProps {
  searchParams: Promise<{ search?: string; folder?: string }>;
}

export default async function AdminMediaPage({ searchParams }: MediaPageProps) {
  const profile = await requireStaff();
  const params = await searchParams;
  const items = await listMedia({ search: params.search, folder: params.folder });

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={adminAssets.mediaUpload}
        title="ספריית המדיה"
        assetWidth={200}
        description="כל התמונות והקבצים של האתר — מאוחסנים ב-Supabase Storage"
      />
      <MediaManager items={items} canWrite={can(profile.role, "manageMedia")} />
    </div>
  );
}
