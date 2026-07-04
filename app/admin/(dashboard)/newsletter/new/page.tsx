import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import NewsletterForm from "@/components/admin/NewsletterForm";
import { newsletterAssets, newsletterAdminAssets } from "@/data/newsletterAssets";
import { getNewsletterStats } from "@/lib/admin/newsletter";
import { getSiteSettingsAdmin } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "גיליון חדש" };

export default async function NewNewsletterPage() {
  const profile = await requireEditor();
  const [stats, settings] = await Promise.all([getNewsletterStats(), getSiteSettingsAdmin()]);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        asset={newsletterAdminAssets.titleNewsTools}
        title="גיליון חדש — חדשות, כלים ועדכונים"
        assetWidth={170}
        description="כותבים פעם אחת, בודקים במייל — ושולחים לכל הרשימה"
      />
      <NewsletterForm
        subscriberCount={stats.subscribed}
        defaultTestEmail={profile.email}
        siteName={settings?.site_name ?? "Ariel AI"}
        siteUrl={(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}
      />
    </div>
  );
}
