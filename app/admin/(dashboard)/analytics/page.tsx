import type { Metadata } from "next";
import Link from "next/link";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AssetImage from "@/components/AssetImage";
import { adminAssets } from "@/data/adminAssets";
import { icons } from "@/data/assets";
import AdminTrafficCharts from "@/components/admin/AdminTrafficCharts";
import { getAnalytics } from "@/lib/admin/queries";
import { getTrafficEvents } from "@/lib/admin/traffic";
import { requireStaff } from "@/lib/auth";
import { formatDate, formatMonth } from "@/lib/format";

export const metadata: Metadata = { title: "סטטיסטיקות" };

const STATUS_LABELS: Record<string, string> = {
  published: "מפורסם",
  draft: "טיוטה",
  archived: "בארכיון",
};

export default async function AdminAnalyticsPage() {
  await requireStaff();
  const [
    { stats, messagesByMonth, projectsByCategory, contentByStatus, latestContent },
    trafficEvents,
  ] = await Promise.all([getAnalytics(), getTrafficEvents()]);

  const maxMessages = Math.max(1, ...messagesByMonth.map((m) => m.count));
  const maxCategory = Math.max(1, ...projectsByCategory.map((c) => c.count));

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={adminAssets.analyticsTitle}
        title="סטטיסטיקות"
        assetWidth={230}
        description="מבט-על על התוכן והפניות באתר"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AdminStatCard label="פרויקטים" value={stats.projects} icon={icons.briefcase} />
        <AdminStatCard label="מדריכים" value={stats.guides + stats.videoGuides} icon={icons.notepad} />
        <AdminStatCard label="פניות חדשות" value={stats.newMessages} icon={icons.chat} />
        <AdminStatCard label="טיוטות" value={stats.drafts} icon={icons.notes} />
      </div>

      {/* תנועת גולשים — נאסף ע"י AnalyticsTracker ומוצג עם Recharts */}
      <div className="mt-6">
        {trafficEvents ? (
          <AdminTrafficCharts events={trafficEvents} />
        ) : (
          <AdminCard title="תנועת גולשים" icon={icons.analytics}>
            <p className="text-sm leading-relaxed text-muted">
              מעקב התנועה עוד לא הופעל — מריצים את{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs" dir="ltr">
                database/site-extras.sql
              </code>{" "}
              ב-SQL Editor של Supabase, ומאותו רגע כל צפייה באתר נאספת ותוצג
              כאן בגרפים.
            </p>
          </AdminCard>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* פניות לפי חודש */}
        <AdminCard
          title="פניות לפי חודש"
          action={
            <div className="w-32">
              <AdminAssetImage
                asset={adminAssets.performanceData}
                decorative
                className="w-full h-auto"
                sizes="128px"
              />
            </div>
          }
        >
          <div className="flex h-44 items-end justify-between gap-3 px-2">
            {messagesByMonth.map((month) => (
              <div key={month.month} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-sm font-black text-blue">{month.count}</span>
                <div
                  className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-blue to-purple"
                  style={{ height: `${Math.max(6, (month.count / maxMessages) * 110)}px` }}
                  aria-hidden
                />
                <span className="text-[11px] font-semibold text-muted">
                  {formatMonth(month.month)}
                </span>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* פרויקטים לפי קטגוריה */}
        <AdminCard title="פרויקטים לפי קטגוריה">
          {projectsByCategory.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">אין עדיין קטגוריות פרויקטים</p>
          ) : (
            <ul className="flex flex-col gap-4 py-2">
              {projectsByCategory.map((category) => (
                <li key={category.name} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm font-bold">{category.name}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(category.count / maxCategory) * 100}%`,
                        background: category.color ?? "#4f7bff",
                      }}
                      aria-hidden
                    />
                  </div>
                  <span className="w-8 text-left font-black">{category.count}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        {/* תוכן לפי סטטוס */}
        <AdminCard title="תוכן לפי סטטוס">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black text-muted">
                  <th className="py-2">סטטוס</th>
                  <th className="py-2">פרויקטים</th>
                  <th className="py-2">מדריכים</th>
                  <th className="py-2">וידאו</th>
                </tr>
              </thead>
              <tbody>
                {contentByStatus.map((row) => (
                  <tr key={row.status} className="border-b border-slate-50">
                    <td className="py-2.5 font-bold">{STATUS_LABELS[row.status]}</td>
                    <td className="py-2.5">{row.projects}</td>
                    <td className="py-2.5">{row.guides}</td>
                    <td className="py-2.5">{row.videoGuides}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        {/* תוכן אחרון */}
        <AdminCard title="תוכן אחרון שנוסף">
          {latestContent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">עוד אין תוכן</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-50">
              {latestContent.map((item) => (
                <li key={item.href + item.title}>
                  <Link href={item.href} className="flex items-center gap-3 py-2.5 hover:text-blue">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-muted">
                      {item.type}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{item.title}</span>
                    <span className="text-xs text-muted">{formatDate(item.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <p className="mt-6 text-sm text-muted">
        <span className="me-1.5 inline-block w-5 shrink-0 align-middle" aria-hidden>
          <AssetImage asset={icons.analytics} decorative variant="flat" className="w-full h-auto" />
        </span>
        אלה סטטיסטיקות פנימיות מתוך הדאטהבייס. לחיבור Google Analytics או Vercel Analytics —
        מוסיפים את הסקריפט ב-<code dir="ltr">app/layout.tsx</code> והנתונים יופיעו בדשבורד שלהם.
      </p>
    </div>
  );
}
