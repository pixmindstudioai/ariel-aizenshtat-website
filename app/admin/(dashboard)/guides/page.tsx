import type { Metadata } from "next";
import Link from "next/link";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import ContentRowActions from "@/components/admin/ContentRowActions";
import { adminAssets } from "@/data/adminAssets";
import { deleteGuide, publishGuide } from "@/lib/admin/actions/guides";
import { listCategories, listGuides } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { ContentStatus } from "@/lib/types";

export const metadata: Metadata = { title: "מדריכים כתובים" };

interface GuidesPageProps {
  searchParams: Promise<{ search?: string; status?: string; category?: string }>;
}

export default async function AdminGuidesPage({ searchParams }: GuidesPageProps) {
  const profile = await requireStaff();
  const params = await searchParams;

  const [guides, categories] = await Promise.all([
    listGuides({
      search: params.search,
      status: (["draft", "published", "archived"] as const).includes(
        params.status as ContentStatus
      )
        ? (params.status as ContentStatus)
        : undefined,
      categoryId: params.category,
    }),
    listCategories("guide"),
  ]);

  const hasFilters = !!(params.search || params.status || params.category);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        asset={adminAssets.writtenGuidesTitle}
        title="מדריכים כתובים"
        assetWidth={250}
        description="הידע שלך — כתוב, מסודר ומפורסם"
        actions={
          <Link href="/admin/guides/new" aria-label="הוספת מדריך חדש" className="group block w-40">
            <AdminAssetImage
              asset={adminAssets.addGuideButton}
              alt="הוסף מדריך"
              className="w-full h-auto transition-transform duration-200 group-hover:scale-[1.04]"
              sizes="160px"
            />
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
            aria-label="חיפוש מדריכים"
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
            <Link href="/admin/guides" className="text-sm font-bold text-muted hover:text-ink">
              ניקוי
            </Link>
          )}
        </form>

        {guides.length === 0 ? (
          <AdminEmptyState
            asset={adminAssets.writtenGuidesChat}
            title={hasFilters ? "לא נמצאו מדריכים" : "עדיין אין מדריכים כתובים"}
            description={
              hasFilters
                ? "נסו לשנות את הסינון"
                : "שתפו את הידע שלכם — המדריך הראשון במרחק לחיצה"
            }
            action={
              !hasFilters && (
                <Link href="/admin/guides/new" className="btn-admin-primary">
                  + הוסף מדריך ראשון
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-right">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black text-muted">
                  <th className="px-5 py-3">מדריך</th>
                  <th className="px-3 py-3">קטגוריה</th>
                  <th className="px-3 py-3">רמה</th>
                  <th className="px-3 py-3">זמן קריאה</th>
                  <th className="px-3 py-3">תאריך</th>
                  <th className="px-3 py-3">סטטוס</th>
                  <th className="px-3 py-3">בית?</th>
                  <th className="px-5 py-3 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((guide) => (
                  <tr key={guide.id} className="border-b border-slate-50 transition-colors hover:bg-blue/[0.03]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/guides/${guide.id}`}
                        className="block max-w-72 truncate font-bold hover:text-blue"
                      >
                        {guide.title}
                      </Link>
                      <span dir="ltr" className="block truncate text-xs text-muted">
                        /{guide.slug}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-muted">
                      {guide.category?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-muted">{guide.level}</td>
                    <td className="px-3 py-3 text-sm text-muted">{guide.read_time} דק׳</td>
                    <td className="px-3 py-3 text-sm text-muted">{formatDate(guide.created_at)}</td>
                    <td className="px-3 py-3">
                      <AdminStatusBadge status={guide.status} />
                    </td>
                    <td className="px-3 py-3">
                      {guide.featured ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="inline-block h-4 w-4 fill-amber-400"
                          aria-hidden
                        >
                          <path d="M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 16.8 6.1 20l1.3-6.5L2.5 8.9l6.6-.8L12 2z" />
                        </svg>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ContentRowActions
                        id={guide.id}
                        title={guide.title}
                        status={guide.status}
                        editHref={`/admin/guides/${guide.id}`}
                        viewHref={`/guides/${guide.slug}`}
                        canHardDelete={profile.role === "admin"}
                        publishAction={publishGuide}
                        deleteAction={deleteGuide}
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
