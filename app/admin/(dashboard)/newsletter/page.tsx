import type { Metadata } from "next";
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import NewsletterRowActions from "@/components/admin/NewsletterRowActions";
import AssetImage from "@/components/AssetImage";
import { icons } from "@/data/assets";
import { newsletterAssets, newsletterAdminAssets } from "@/data/newsletterAssets";
import { getNewsletterStats, listNewsletters } from "@/lib/admin/newsletter";
import { requireStaff } from "@/lib/auth";
import { resendConfigured, usingSandboxSender } from "@/lib/newsletter/resend";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "ניוזלטר" };

const STATUS_LABEL: Record<string, string> = {
  draft: "טיוטה",
  sending: "בשליחה",
  sent: "נשלח",
};

export default async function AdminNewsletterPage() {
  const profile = await requireStaff();
  const [newsletters, stats] = await Promise.all([listNewsletters(), getNewsletterStats()]);
  const configured = resendConfigured();
  const sandbox = usingSandboxSender();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={newsletterAdminAssets.titleMain}
        title="ניוזלטר AI — עדכונים, כלים ותובנות במקום אחד"
        assetWidth={210}
        description="כותבים גיליון, בודקים איך הוא נראה — ושולחים לכל רשימת התפוצה בלחיצה"
        actions={
          <>
            <Link href="/admin/newsletter/subscribers" className="btn-admin-secondary !py-2 text-sm">
              👥 ניהול נרשמים
            </Link>
            <Link href="/admin/newsletter/new" className="btn-admin-primary">
              + גיליון חדש
            </Link>
          </>
        }
      />

      {/* התראות תצורה */}
      {!configured && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800">
          ⚠️ מפתח Resend לא מוגדר — שליחת מיילים לא תעבוד עד שמוסיפים{" "}
          <code dir="ltr">resend_api_key</code> ל-<code dir="ltr">.env.local</code>
        </div>
      )}
      {configured && sandbox && (
        <div className="mb-6 rounded-2xl border border-blue/20 bg-blue/5 px-5 py-4 text-sm font-semibold text-ink">
          💡 כרגע השליחה היא מכתובת ה-sandbox של Resend (<span dir="ltr">onboarding@resend.dev</span>) —
          במצב הזה מיילים מגיעים <b>רק לכתובת המייל של חשבון ה-Resend שלך</b>. כדי לשלוח לכל
          הנרשמים: מאמתים דומיין ב-Resend (Domains → Add Domain) ומוסיפים ל-
          <code dir="ltr">.env.local</code> את השורה{" "}
          <code dir="ltr">resend_from=&quot;Ariel AI &lt;newsletter@your-domain.com&gt;&quot;</code>
        </div>
      )}

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AdminStatCard
          label="נרשמים פעילים"
          value={stats.subscribed}
          icon={icons.users}
          href="/admin/newsletter/subscribers"
        />
        <AdminStatCard label="גיליונות שנשלחו" value={stats.sentNewsletters} icon={icons.inbox} />
        <AdminStatCard label="טיוטות" value={stats.drafts} icon={icons.notes} />
        <AdminStatCard label="הוסרו מהרשימה" value={stats.unsubscribed} icon={icons.user} />
      </div>

      {/* רשימת גיליונות */}
      <AdminCard className="mt-6 !p-0 overflow-hidden">
        {newsletters.length === 0 ? (
          <AdminEmptyState
            asset={newsletterAdminAssets.envelopeCute}
            title="עדיין אין גיליונות"
            description="הגיליון הראשון שלך במרחק לחיצה — כותבים, בודקים במייל, ושולחים לכולם"
            action={
              <Link href="/admin/newsletter/new" className="btn-admin-primary">
                + כתיבת הגיליון הראשון
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black text-muted">
                  <th className="px-5 py-3">גיליון</th>
                  <th className="px-3 py-3">סטטוס</th>
                  <th className="px-3 py-3">נשלח אל</th>
                  <th className="px-3 py-3">תאריך</th>
                  <th className="px-5 py-3 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {newsletters.map((newsletter) => (
                  <tr
                    key={newsletter.id}
                    className="border-b border-slate-50 transition-colors hover:bg-blue/[0.03]"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/newsletter/${newsletter.id}`}
                        className="block max-w-md truncate font-bold hover:text-blue"
                      >
                        {newsletter.subject}
                      </Link>
                      {newsletter.preheader && (
                        <span className="block max-w-md truncate text-xs text-muted">
                          {newsletter.preheader}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                          newsletter.status === "sent"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : newsletter.status === "sending"
                              ? "border-blue/20 bg-blue/10 text-blue"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {STATUS_LABEL[newsletter.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted">
                      {newsletter.status === "sent" ? `${newsletter.sent_count} נרשמים` : "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-muted">
                      {formatDateTime(newsletter.sent_at ?? newsletter.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <NewsletterRowActions
                        newsletter={newsletter}
                        canDelete={profile.role === "admin"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* קישוט תחתון */}
      <div className="mt-8 flex items-center justify-center gap-6 opacity-80">
        <div className="w-24">
          <AssetImage asset={newsletterAssets.badgeOnceAWeek} decorative className="w-full h-auto" />
        </div>
        <div className="w-24">
          <AssetImage asset={newsletterAssets.envelopeOpen} decorative className="w-full h-auto" />
        </div>
        <div className="w-24">
          <AssetImage asset={newsletterAssets.badgeAiUpdates} decorative className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
}
