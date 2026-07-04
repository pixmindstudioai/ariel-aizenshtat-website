import type { Metadata } from "next";
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MessagesManager from "@/components/admin/MessagesManager";
import AssetImage from "@/components/AssetImage";
import { icons } from "@/data/assets";
import { adminAssets } from "@/data/adminAssets";
import { listMessages } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth";
import { can } from "@/lib/admin/permissions";

export const metadata: Metadata = { title: "הודעות ופניות" };

interface MessagesPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function AdminMessagesPage({ searchParams }: MessagesPageProps) {
  const profile = await requireStaff();
  const params = await searchParams;
  const messages = await listMessages({ search: params.search, status: params.status });
  const hasFilters = !!(params.search || params.status);

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        asset={adminAssets.newMessages}
        title="הודעות ופניות"
        assetWidth={230}
        description="כל מי שמילא את טופס צור קשר באתר — מגיע לכאן"
      />

      <AdminCard className="!p-0 overflow-hidden">
        <form className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
          <input
            type="search"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="חיפוש לפי שם או אימייל..."
            aria-label="חיפוש פניות"
            className="admin-input !w-60 !rounded-full !py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={params.status ?? ""}
            aria-label="סינון לפי סטטוס"
            className="admin-input !w-36 !rounded-full !py-2 text-sm"
          >
            <option value="">כל הסטטוסים</option>
            <option value="new">חדשות</option>
            <option value="read">נקראו</option>
            <option value="replied">נענו</option>
            <option value="archived">בארכיון</option>
          </select>
          <button type="submit" className="btn-admin-secondary !py-2 text-sm">
            סינון
          </button>
          {hasFilters && (
            <Link href="/admin/messages" className="text-sm font-bold text-muted hover:text-ink">
              ניקוי
            </Link>
          )}
        </form>

        {messages.length === 0 ? (
          <AdminEmptyState
            asset={adminAssets.newMessages}
            title={hasFilters ? "לא נמצאו פניות" : "אין פניות חדשות כרגע"}
            description={
              hasFilters
                ? "נסו לשנות את הסינון"
                : "כשמישהו ימלא את טופס צור קשר באתר — הפנייה תופיע כאן"
            }
          />
        ) : (
          <MessagesManager
            messages={messages}
            canHandle={can(profile.role, "handleMessages")}
            canDelete={profile.role === "admin"}
          />
        )}
      </AdminCard>

      <p className="mt-4 text-sm text-muted">
        <span className="ms-1 me-1.5 inline-block w-5 shrink-0 align-middle" aria-hidden>
          <AssetImage asset={icons.gearFace} decorative variant="flat" className="w-full h-auto" />
        </span>
        רוצים התראה למייל על כל פנייה חדשה? יש נקודת חיבור מוכנה ל-Resend/Nodemailer ב-
        <code dir="ltr">lib/admin/actions/messages.ts</code>
      </p>
    </div>
  );
}
