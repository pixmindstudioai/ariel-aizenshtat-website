import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SettingsForm from "@/components/admin/SettingsForm";
import { adminAssets } from "@/data/adminAssets";
import { getSiteSettingsAdmin } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "הגדרות האתר" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettingsAdmin();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        asset={adminAssets.siteSettings}
        title="הגדרות האתר"
        assetWidth={210}
        description="שם, לוגו, CTA ראשי, קישורים חברתיים ו-SEO כללי — משפיע על כל האתר"
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
