import type { Metadata } from "next";
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import ContentRowActions from "@/components/admin/ContentRowActions";
import { adminAssets } from "@/data/adminAssets";
import { deleteVideoGuide, publishVideoGuide } from "@/lib/admin/actions/video-guides";
import { listCategories, listVideoGuides } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth";
import type { ContentStatus } from "@/lib/types";

export const metadata: Metadata = { title: "מדריכי וידאו" };

interface VideoGuidesPageProps {
  searchParams: Promise<{ search?: string; status?: string; category?: string }>;
}

export default async function AdminVideoGuidesPage({ searchParams }: VideoGuidesPageProps) {
  const profile = await requireStaff();
  const params = await searchParams;

  const [videoGuides, categories] = await Promise.all([
    listVideoGuides({
      search: params.search,
      status: (["draft", "published", "archived"] as const).includes(
        params.status as ContentStatus
      )
        ? (params.status as ContentStatus)
        : undefined,
      categoryId: params.category,
    }),
    listCategories("video_guide"),
  ]);

  const hasFilters = !!(params.search || params.status || params.category);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={adminAssets.videoGuidesTitle}
        title="מדריכי וידאו"
        assetWidth={230}
        description="שיעורים מוקלטים — העלאה, עריכה ופרסום"
        actions={
          <Link href="/admin/video-guides/new" className="btn-admin-primary">
            + מדריך וידאו חדש
          </Link>
        }
      />

      <AdminCard className="!p-0 overflow-hidden">
        <form className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
          <input
            type="search"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="חיפוש לפי כותרת..."
            aria-label="חיפוש מדריכי וידאו"
            className="admin-input !w-52 !rounded-full !py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={params.status ?? ""}
            aria-label="סינון לפי סטטוס"
            className="admin-input !w-36 !rounded-full !py-2 text-sm"
          >
            <option value="">כל הסטטוסים</option>
            <option value="published">מפורסם</option>
            <option value="draft">טיוטה</option>
            <option value="archived">בארכיון</option>
          </select>
          <select
            name="category"
            defaultValue={params.category ?? ""}
            aria-label="סינון לפי קטגוריה"
            className="admin-input !w-44 !rounded-full !py-2 text-sm"
          >
            <option value="">כל הקטגוריות</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-admin-secondary !py-2 text-sm">
            סינון
          </button>
          {hasFilters && (
            <Link href="/admin/video-guides" className="text-sm font-bold text-muted hover:text-ink">
              ניקוי
            </Link>
          )}
        </form>

        {videoGuides.length === 0 ? (
          <AdminEmptyState
            asset={adminAssets.videoGuidesTitle}
            title={hasFilters ? "לא נמצאו מדריכי וידאו" : "עדיין אין מדריכי וידאו"}
            description={
              hasFilters ? "נסו לשנות את הסינון" : "מדביקים קישור יוטיוב — והשיעור באוויר"
            }
            action={
              !hasFilters && (
                <Link href="/admin/video-guides/new" className="btn-admin-primary">
                  + הוסף מדריך וידאו ראשון
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-right">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black text-muted">
                  <th className="px-5 py-3">מדריך וידאו</th>
                  <th className="px-3 py-3">קטגוריה</th>
                  <th className="px-3 py-3">רמה</th>
                  <th className="px-3 py-3">משך</th>
                  <th className="px-3 py-3">סטטוס</th>
                  <th className="px-3 py-3">בית?</th>
                  <th className="px-5 py-3 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {videoGuides.map((video) => (
                  <tr key={video.id} className="border-b border-slate-50 transition-colors hover:bg-blue/[0.03]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`grid h-10 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-sm text-white ${video.gradient ?? "from-[#4f7bff] to-[#7c5cff]"}`}
                        >
                          ▶
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/video-guides/${video.id}`}
                            className="block max-w-64 truncate font-bold hover:text-blue"
                          >
                            {video.title}
                          </Link>
                          <span dir="ltr" className="block truncate text-xs text-muted">
                            /{video.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-muted">
                      {video.category?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-muted">{video.level}</td>
                    <td className="px-3 py-3 text-sm text-muted" dir="ltr">
                      {video.duration || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <AdminStatusBadge status={video.status} />
                    </td>
                    <td className="px-3 py-3">
                      {video.featured ? (
                        <svg
                          viewBox="0 0 20 20"
                          fill="#f5b301"
                          role="img"
                          aria-label="מוצג בעמוד הבית"
                          className="h-4 w-4"
                        >
                          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                        </svg>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <ContentRowActions
                        id={video.id}
                        title={video.title}
                        status={video.status}
                        editHref={`/admin/video-guides/${video.id}`}
                        viewHref={`/video-guides/${video.slug}`}
                        canHardDelete={profile.role === "admin"}
                        publishAction={publishVideoGuide}
                        deleteAction={deleteVideoGuide}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
