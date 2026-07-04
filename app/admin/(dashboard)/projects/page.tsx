import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import ProjectRowActions from "@/components/admin/ProjectRowActions";
import ProjectsReorder from "@/components/admin/ProjectsReorder";
import { adminAssets } from "@/data/adminAssets";
import { listCategories, listProjects, type ProjectFilters } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth";
import type { ContentStatus } from "@/lib/types";

export const metadata: Metadata = { title: "פרויקטים" };

interface ProjectsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
    type?: string;
    sort?: string;
    reorder?: string;
  }>;
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  video: "וידאו",
  website: "אתר",
  landing_page: "דף נחיתה",
  automation: "אוטומציה",
  guide: "מדריך",
  other: "אחר",
};

export default async function AdminProjectsPage({ searchParams }: ProjectsPageProps) {
  const profile = await requireStaff();
  const params = await searchParams;

  const filters: ProjectFilters = {
    search: params.search,
    status: (["draft", "published", "archived"] as const).includes(
      params.status as ContentStatus
    )
      ? (params.status as ContentStatus)
      : undefined,
    categoryId: params.category,
    projectType: params.type,
    sort: params.sort === "newest" ? "newest" : params.sort === "oldest" ? "oldest" : "manual",
  };

  const [projects, categories] = await Promise.all([
    listProjects(filters),
    listCategories("project"),
  ]);

  const hasFilters = !!(params.search || params.status || params.category || params.type);
  const reorderMode = params.reorder === "1";

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="פרויקטים"
        description="כל העבודות בתיק — יצירה, עריכה, פרסום וסידור"
        actions={
          <>
            <Link
              href="/admin/projects?reorder=1"
              className={`btn-admin-secondary !py-2 text-sm ${reorderMode ? "hidden" : ""}`}
            >
              סידור ידני
            </Link>
            <Link href="/admin/projects/new" aria-label="הוספת פרויקט חדש" className="group block w-44">
              <AdminAssetImage
                asset={adminAssets.addProjectButton}
                alt="הוספת פרויקט"
                className="w-full h-auto transition-transform duration-200 group-hover:scale-[1.04]"
                sizes="176px"
              />
            </Link>
          </>
        }
      />

      <AdminCard className="!p-0 overflow-hidden">
        {reorderMode ? (
          <div className="p-6">
            <ProjectsReorder projects={projects} />
          </div>
        ) : (
          <>
            {/* פילטרים */}
            <form className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
              <input
                type="search"
                name="search"
                defaultValue={params.search ?? ""}
                placeholder="חיפוש לפי שם..."
                aria-label="חיפוש פרויקטים"
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
              <select
                name="type"
                defaultValue={params.type ?? ""}
                aria-label="סינון לפי סוג"
                className="admin-input !w-36 !rounded-full !py-2 text-sm"
              >
                <option value="">כל הסוגים</option>
                {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                name="sort"
                defaultValue={params.sort ?? ""}
                aria-label="מיון"
                className="admin-input !w-36 !rounded-full !py-2 text-sm"
              >
                <option value="">סדר ידני</option>
                <option value="newest">חדש → ישן</option>
                <option value="oldest">ישן → חדש</option>
              </select>
              <button type="submit" className="btn-admin-secondary !py-2 text-sm">
                סינון
              </button>
              {hasFilters && (
                <Link href="/admin/projects" className="text-sm font-bold text-muted hover:text-ink">
                  ניקוי
                </Link>
              )}
            </form>

            {projects.length === 0 ? (
              <AdminEmptyState
                asset={adminAssets.recentProjects}
                title={hasFilters ? "לא נמצאו פרויקטים" : "עדיין אין כאן פרויקטים"}
                description={
                  hasFilters
                    ? "נסו לשנות את הסינון או לנקות אותו"
                    : "הפרויקט הראשון שלך מחכה — לחצו על הכפתור ותוך דקה הוא באוויר"
                }
                action={
                  !hasFilters && (
                    <Link href="/admin/projects/new" className="btn-admin-primary">
                      + הוסף פרויקט ראשון
                    </Link>
                  )
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-right">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-black text-muted">
                      <th className="px-5 py-3">פרויקט</th>
                      <th className="px-3 py-3">קטגוריה</th>
                      <th className="px-3 py-3">סוג</th>
                      <th className="px-3 py-3">שנה</th>
                      <th className="px-3 py-3">סטטוס</th>
                      <th className="px-3 py-3">בית?</th>
                      <th className="px-5 py-3 text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b border-slate-50 transition-colors hover:bg-blue/[0.03]"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {project.cover_image ? (
                              <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100">
                                <Image
                                  src={project.cover_image}
                                  alt=""
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </span>
                            ) : (
                              <span
                                aria-hidden
                                className={`h-10 w-14 shrink-0 rounded-lg bg-gradient-to-br ${project.gradient ?? "from-[#4f7bff] to-[#7c5cff]"}`}
                              />
                            )}
                            <div className="min-w-0">
                              <Link
                                href={`/admin/projects/${project.id}`}
                                className="block truncate font-bold hover:text-blue"
                              >
                                {project.title}
                              </Link>
                              <span dir="ltr" className="block truncate text-xs text-muted">
                                /{project.slug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-muted">
                          {project.category?.name ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-muted">
                          {PROJECT_TYPE_LABELS[project.project_type] ?? project.project_type}
                        </td>
                        <td className="px-3 py-3 text-sm text-muted">{project.year ?? "—"}</td>
                        <td className="px-3 py-3">
                          <AdminStatusBadge status={project.status} />
                        </td>
                        <td className="px-3 py-3">
                          {project.featured ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-4 w-4 text-amber-400"
                              role="img"
                              aria-label="מוצג בבית"
                            >
                              <path d="M12 2l2.9 6.26 6.6.72-4.9 4.53 1.32 6.49L12 16.77 6.08 20l1.32-6.49L2.5 8.98l6.6-.72L12 2z" />
                            </svg>
                          ) : null}
                        </td>
                        <td className="px-5 py-3">
                          <ProjectRowActions
                            project={project}
                            canHardDelete={profile.role === "admin"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}
