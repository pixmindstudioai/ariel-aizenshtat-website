import type { Metadata } from "next";
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SubscribersManager from "@/components/admin/SubscribersManager";
import { newsletterAssets, newsletterAdminAssets } from "@/data/newsletterAssets";
import { listSubscribers } from "@/lib/admin/newsletter";
import { requireStaff } from "@/lib/auth";
import { can } from "@/lib/admin/permissions";

export const metadata: Metadata = { title: "נרשמים לניוזלטר" };

interface SubscribersPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function SubscribersPage({ searchParams }: SubscribersPageProps) {
  const profile = await requireStaff();
  const params = await searchParams;
  const subscribers = await listSubscribers({ search: params.search, status: params.status });
  const hasFilters = !!(params.search || params.status);

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        asset={newsletterAdminAssets.badgeOnceAWeek}
        title="נרשמים לניוזלטר"
        assetWidth={150}
        description="רשימת התפוצה — מי מקבל את הגיליונות שלך"
        actions={
          <Link href="/admin/newsletter" className="btn-admin-secondary !py-2 text-sm">
            → חזרה לגיליונות
          </Link>
        }
      />

      <form className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="חיפוש לפי אימייל או שם..."
          aria-label="חיפוש נרשמים"
          className="admin-input !w-64 !rounded-full !py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={params.status ?? ""}
          aria-label="סינון לפי סטטוס"
          className="admin-input !w-36 !rounded-full !py-2 text-sm"
        >
          <option value="">כולם</option>
          <option value="subscribed">פעילים</option>
          <option value="unsubscribed">הוסרו</option>
        </select>
        <button type="submit" className="btn-admin-secondary !py-2 text-sm">
          סינון
        </button>
        {hasFilters && (
          <Link
            href="/admin/newsletter/subscribers"
            className="text-sm font-bold text-muted hover:text-ink"
          >
            ניקוי
          </Link>
        )}
      </form>

      {subscribers.length === 0 && !hasFilters ? (
        <AdminCard>
          <AdminEmptyState
            asset={newsletterAdminAssets.envelopeCute}
            title="עדיין אין נרשמים"
            description="טופס ההרשמה באתר כבר חי — כל מי שיירשם יופיע כאן. אפשר גם להוסיף ידנית"
          />
        </AdminCard>
      ) : (
        <SubscribersManager
          subscribers={subscribers}
          canWrite={can(profile.role, "writeContent")}
          canDelete={profile.role === "admin"}
        />
      )}
    </div>
  );
}
