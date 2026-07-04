import Link from "next/link";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import AdminActivityFeed from "@/components/admin/AdminActivityFeed";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import { adminAssets } from "@/data/adminAssets";
import { icons } from "@/data/assets";
import {
  getDashboardStats,
  getRecentActivity,
  getRecentMessages,
  getRecommendations,
} from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth";
import { timeAgo } from "@/lib/format";

/** הדאשבורד הראשי של ממשק הניהול */
export default async function AdminDashboardPage() {
  const profile = await requireStaff();
  const [stats, activity, messages, recommendations] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(8),
    getRecentMessages(4),
    getRecommendations(),
  ]);

  return (
    <div className="relative mx-auto max-w-6xl">
      {/* קישוט עדין */}
      <div className="pointer-events-none absolute -top-2 left-0 hidden w-20 opacity-70 xl:block">
        <AdminAssetImage asset={adminAssets.sparklesArrowDown} className="w-full h-auto" />
      </div>

      <AdminPageHeader
        asset={adminAssets.dashboardBadge}
        title="דאשבורד"
        assetWidth={210}
        description={`ברוך הבא, ${profile.full_name || profile.email} — הנה מה שקורה באתר שלך`}
      />

      {/* כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AdminStatCard label="פרויקטים" value={stats.projects} icon={icons.briefcase} href="/admin/projects" />
        <AdminStatCard label="מדריכים כתובים" value={stats.guides} icon={icons.notepad} href="/admin/guides" />
        <AdminStatCard label="מדריכי וידאו" value={stats.videoGuides} icon={icons.videoEdit} href="/admin/video-guides" />
        <AdminStatCard
          label="פניות חדשות"
          value={stats.newMessages}
          icon={icons.chat}
          href="/admin/messages"
        />
        <AdminStatCard label="עמודים פעילים" value={stats.publishedPages} icon={icons.browserPages} href="/admin/pages" />
        <AdminStatCard label="טיוטות" value={stats.drafts} icon={icons.notes} />
        <AdminStatCard label="קבצי מדיה" value={stats.mediaCount} icon={icons.gallery} href="/admin/media" />
        <AdminStatCard
          label="עדכון אחרון"
          value={stats.lastUpdated ? timeAgo(stats.lastUpdated) : "—"}
          icon={icons.gearFace}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* פעולות מהירות */}
          <AdminCard title="פעולות מהירות" icon={icons.automation}>
            <AdminQuickActions />
          </AdminCard>

          {/* פעילות אחרונה */}
          <AdminCard
            title="פעילות אחרונה"
            action={
              <div className="w-36">
                <AdminAssetImage
                  asset={adminAssets.recentProjects}
                  decorative
                  className="w-full h-auto"
                  sizes="144px"
                />
              </div>
            }
          >
            <AdminActivityFeed items={activity} />
          </AdminCard>
        </div>

        <div className="flex flex-col gap-6">
          {/* המלצות חכמות */}
          <AdminCard title="כדאי לשים לב" icon={icons.gearFace}>
            {recommendations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="w-36">
                  <AdminAssetImage
                    asset={adminAssets.savedSuccess}
                    decorative
                    className="w-full h-auto"
                    sizes="144px"
                  />
                </div>
                <p className="text-sm font-semibold text-muted">הכל מסודר — אין משימות פתוחות</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {recommendations.map((rec) => (
                  <li key={rec.id}>
                    <Link
                      href={rec.href}
                      className="flex items-center gap-2 rounded-2xl bg-blue/5 px-4 py-3 text-sm font-bold transition-colors hover:bg-blue/10"
                    >
                      <span aria-hidden>←</span>
                      {rec.text}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          {/* פניות אחרונות */}
          <AdminCard
            title="פניות אחרונות"
            action={
              <Link href="/admin/messages" className="text-sm font-bold text-blue hover:underline">
                לכל הפניות ←
              </Link>
            }
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="w-40">
                  <AdminAssetImage
                    asset={adminAssets.newMessages}
                    decorative
                    className="w-full h-auto"
                    sizes="160px"
                  />
                </div>
                <p className="text-sm font-semibold text-muted">אין פניות חדשות כרגע</p>
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-slate-50">
                {messages.map((message) => (
                  <li key={message.id} className="py-3">
                    <Link href="/admin/messages" className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{message.full_name}</p>
                        <p className="truncate text-xs text-muted">{message.message}</p>
                      </div>
                      <AdminStatusBadge status={message.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          {/* תזמון — קישוט */}
          <AdminCard className="!p-5">
            <div className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <AdminAssetImage
                  asset={adminAssets.scheduling}
                  decorative
                  className="w-full h-auto"
                  sizes="128px"
                />
              </div>
              <p className="text-sm leading-relaxed text-muted">
                טיפ: פריטים במצב <b>טיוטה</b> לא מופיעים באתר — אפשר להכין תוכן מראש
                ולפרסם בלחיצה אחת בדיוק כשמתאים לך.
              </p>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
