import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import NewsletterForm from "@/components/admin/NewsletterForm";
import { getNewsletterById, getNewsletterStats } from "@/lib/admin/newsletter";
import { getSiteSettingsAdmin } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/auth";

export const metadata: Metadata = { title: "עריכת גיליון" };

interface EditNewsletterPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsletterPage({ params }: EditNewsletterPageProps) {
  const profile = await requireEditor();
  const { id } = await params;
  const [newsletter, stats, settings] = await Promise.all([
    getNewsletterById(id),
    getNewsletterStats(),
    getSiteSettingsAdmin(),
  ]);
  if (!newsletter) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title={newsletter.status === "sent" ? `צפייה: ${newsletter.subject}` : `עריכה: ${newsletter.subject}`}
        description={
          newsletter.status === "sent"
            ? "גיליון שכבר נשלח — נעול לעריכה"
            : "שינויים נשמרים לטיוטה עד שלוחצים שליחה"
        }
      />
      <NewsletterForm
        newsletter={newsletter}
        subscriberCount={stats.subscribed}
        defaultTestEmail={profile.email}
        siteName={settings?.site_name ?? "Ariel AI"}
        siteUrl={(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}
      />
    </div>
  );
}
