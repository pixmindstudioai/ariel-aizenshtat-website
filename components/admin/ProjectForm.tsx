"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectInput } from "@/lib/admin/validation";
import { createProject, updateProject } from "@/lib/admin/actions/projects";
import type { CategoryRow, ProjectRow } from "@/lib/types";
import AdminCard from "@/components/admin/AdminCard";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminImagePicker from "@/components/admin/AdminImagePicker";
import AdminMediaPicker from "@/components/admin/AdminMediaPicker";
import AdminVideoPicker from "@/components/admin/AdminVideoPicker";
import AdminRichTextEditor from "@/components/admin/AdminRichTextEditor";
import AdminSeoFields from "@/components/admin/AdminSeoFields";
import AdminSlugField from "@/components/admin/AdminSlugField";
import { useToast } from "@/components/admin/AdminToast";
import Image from "next/image";
import { icons } from "@/data/assets";
import AssetImage from "@/components/AssetImage";

const PROJECT_TYPES = [
  { value: "video", label: "וידאו" },
  { value: "website", label: "אתר" },
  { value: "landing_page", label: "דף נחיתה" },
  { value: "automation", label: "אוטומציה" },
  { value: "guide", label: "מדריך" },
  { value: "other", label: "אחר" },
] as const;

const GRADIENT_OPTIONS = [
  { value: "", label: "אוטומטי לפי הפרויקט" },
  { value: "from-[#4f7bff] to-[#7c5cff]", label: "כחול → סגול" },
  { value: "from-[#ff7ac8] to-[#7c5cff]", label: "ורוד → סגול" },
  { value: "from-[#e77455] to-[#ff7ac8]", label: "אלמוגי → ורוד" },
  { value: "from-[#22c55e] to-[#0ea5e9]", label: "ירוק → תכלת" },
  { value: "from-[#f59e0b] to-[#e77455]", label: "צהוב → אלמוגי" },
  { value: "from-[#0ea5e9] to-[#22d3ee]", label: "תכלת → טורקיז" },
];

interface ProjectFormProps {
  categories: CategoryRow[];
  project?: ProjectRow;
}

function toDefaults(project?: ProjectRow): ProjectInput {
  return {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    excerpt: project?.excerpt ?? "",
    description: project?.description ?? "",
    content: project?.content ?? "",
    category_id: project?.category_id ?? null,
    project_type: project?.project_type ?? "other",
    cover_image: project?.cover_image ?? "",
    gallery: project?.gallery ?? [],
    video_url: project?.video_url ?? "",
    external_url: project?.external_url ?? "",
    tools: project?.tools?.join(", ") ?? "",
    tags: project?.tags?.join(", ") ?? "",
    client_name: project?.client_name ?? "",
    year: project?.year ?? new Date().getFullYear(),
    gradient: project?.gradient ?? "",
    result: project?.result ?? "",
    is_new: project?.is_new ?? false,
    featured: project?.featured ?? false,
    status: project?.status ?? "draft",
    sort_order: project?.sort_order ?? 0,
    seo_title: project?.seo_title ?? "",
    seo_description: project?.seo_description ?? "",
  };
}

/** טופס יצירה/עריכה של פרויקט */
export default function ProjectForm({ categories, project }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const isEdit = !!project;

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema) as never,
    defaultValues: toDefaults(project),
    mode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = form;

  const title = watch("title") ?? "";
  const slug = watch("slug") ?? "";
  const coverImage = watch("cover_image") ?? "";
  const videoUrl = watch("video_url") ?? "";
  const gallery = watch("gallery") ?? [];
  const content = watch("content") ?? "";
  const seoTitle = watch("seo_title") ?? "";
  const seoDescription = watch("seo_description") ?? "";

  const submit = async (statusOverride?: "draft" | "published") => {
    if (statusOverride) setValue("status", statusOverride);
    await handleSubmit(async () => {
      const values = getValues();
      const result = isEdit
        ? await updateProject(project.id, values)
        : await createProject(values);
      if (result.ok) {
        toast(result.message ?? "נשמר בהצלחה");
        if (!isEdit && result.data?.id) {
          router.push(`/admin/projects/${result.data.id}`);
        }
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    })();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* פרטי הפרויקט */}
          <AdminCard title="פרטי הפרויקט" icon={icons.notepad}>
            <div className="flex flex-col gap-4">
              <AdminFormField label="שם הפרויקט" htmlFor="title" error={errors.title?.message} required>
                <input
                  id="title"
                  className="admin-input"
                  aria-invalid={!!errors.title}
                  {...register("title")}
                  placeholder="למשל: דף נחיתה לסדנת AI"
                />
              </AdminFormField>

              <AdminSlugField
                value={slug}
                onChange={(v) => setValue("slug", v, { shouldValidate: true })}
                sourceTitle={title}
                error={errors.slug?.message}
                pathPrefix="/portfolio/"
              />

              <AdminFormField
                label="תקציר"
                htmlFor="excerpt"
                error={errors.excerpt?.message}
                hint="משפט-שניים שמופיעים בכרטיס הפרויקט באתר"
              >
                <textarea
                  id="excerpt"
                  rows={2}
                  className="admin-input resize-none"
                  {...register("excerpt")}
                />
              </AdminFormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminFormField label="קטגוריה" htmlFor="category_id" error={errors.category_id?.message}>
                  <select
                    id="category_id"
                    className="admin-input"
                    {...register("category_id", {
                      setValueAs: (v: string) => (v === "" ? null : v),
                    })}
                  >
                    <option value="">ללא קטגוריה</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </AdminFormField>

                <AdminFormField label="סוג פרויקט" htmlFor="project_type">
                  <select id="project_type" className="admin-input" {...register("project_type")}>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </AdminFormField>

                <AdminFormField label="שם לקוח" htmlFor="client_name">
                  <input id="client_name" className="admin-input" {...register("client_name")} />
                </AdminFormField>

                <AdminFormField label="שנה" htmlFor="year" error={errors.year?.message}>
                  <input
                    id="year"
                    type="number"
                    className="admin-input"
                    {...register("year", {
                      setValueAs: (v: string) => (v === "" ? null : Number(v)),
                    })}
                  />
                </AdminFormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminFormField label="תגיות" htmlFor="tags" hint="מופרדות בפסיק: פרסומת AI, עריכה">
                  <input id="tags" className="admin-input" {...register("tags")} />
                </AdminFormField>
                <AdminFormField label="כלים" htmlFor="tools" hint="מופרדים בפסיק: Next.js, Claude">
                  <input id="tools" className="admin-input" {...register("tools")} />
                </AdminFormField>
              </div>

              <AdminFormField
                label="תוצאה עסקית"
                htmlFor="result"
                hint="למשל: 18% יחס המרה בקמפיין הראשון — מוצג מודגש בכרטיס"
              >
                <input id="result" className="admin-input" {...register("result")} />
              </AdminFormField>
            </div>
          </AdminCard>

          {/* תוכן */}
          <AdminCard title="תוכן" icon={icons.notes}>
            <div className="flex flex-col gap-4">
              <AdminFormField label="תיאור מלא" htmlFor="description" hint="מוצג בראש עמוד הפרויקט">
                <textarea
                  id="description"
                  rows={3}
                  className="admin-input"
                  {...register("description")}
                />
              </AdminFormField>
              <AdminRichTextEditor
                label="תוכן עשיר"
                value={content}
                onChange={(v) => setValue("content", v)}
                rows={10}
              />
            </div>
          </AdminCard>

          {/* מדיה */}
          <AdminCard title="מדיה" icon={icons.imageUpload}>
            <div className="flex flex-col gap-5">
              <AdminImagePicker
                label="תמונת קאבר"
                value={coverImage}
                onChange={(url) => setValue("cover_image", url, { shouldValidate: true })}
                error={errors.cover_image?.message}
                hint="בלי תמונה — הכרטיס יוצג עם גרדיאנט צבעוני"
              />

              <AdminFormField label="גלריית תמונות">
                <div className="flex flex-wrap gap-3">
                  {gallery.map((url, i) => (
                    <div
                      key={url + i}
                      className="relative h-20 w-28 overflow-hidden rounded-xl border-2 border-slate-100"
                    >
                      <Image src={url} alt="" fill sizes="112px" className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            "gallery",
                            gallery.filter((_, j) => j !== i)
                          )
                        }
                        className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs font-black shadow"
                        aria-label="הסרת תמונה מהגלריה"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGalleryPickerOpen(true)}
                    className="grid h-20 w-28 place-items-center rounded-xl border-2 border-dashed border-slate-200 text-2xl text-muted transition-colors hover:border-blue hover:text-blue"
                    aria-label="הוספת תמונה לגלריה"
                  >
                    +
                  </button>
                </div>
              </AdminFormField>

              <AdminVideoPicker
                label="קובץ וידאו"
                value={videoUrl}
                onChange={(url) => setValue("video_url", url, { shouldValidate: true })}
                error={errors.video_url?.message}
                hint="הסרטונים נשמרים אצלנו בלבד — מעלים לספריית המדיה ובוחרים משם"
              />

              <AdminFormField
                label="קישור חיצוני"
                htmlFor="external_url"
                error={errors.external_url?.message}
                hint="לאתר החי / לפרויקט עצמו"
              >
                <input
                  id="external_url"
                  dir="ltr"
                  className="admin-input text-left"
                  {...register("external_url")}
                  placeholder="https://..."
                />
              </AdminFormField>

              <AdminFormField label="גרדיאנט רקע לכרטיס" htmlFor="gradient">
                <select id="gradient" className="admin-input" {...register("gradient")}>
                  {GRADIENT_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>
          </AdminCard>
        </div>

        {/* עמודה צדדית */}
        <div className="flex flex-col gap-6">
          <AdminCard title="פרסום" icon={icons.growth}>
            <div className="flex flex-col gap-4">
              <AdminFormField label="סטטוס" htmlFor="status">
                <select id="status" className="admin-input" {...register("status")}>
                  <option value="draft">טיוטה</option>
                  <option value="published">מפורסם</option>
                  <option value="archived">בארכיון</option>
                </select>
              </AdminFormField>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 font-bold">
                <input type="checkbox" className="h-5 w-5 accent-[#4f7bff]" {...register("featured")} />
                להציג בעמוד הבית
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 font-bold">
                <input type="checkbox" className="h-5 w-5 accent-[#4f7bff]" {...register("is_new")} />
                {'תגית "חדש"'}
              </label>

              <AdminFormField label="סדר הופעה" htmlFor="sort_order" hint="נמוך = ראשון">
                <input
                  id="sort_order"
                  type="number"
                  className="admin-input"
                  {...register("sort_order", { setValueAs: (v: string) => Number(v) || 0 })}
                />
              </AdminFormField>

              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => submit()}
                  disabled={isSubmitting}
                  className="btn-admin-primary"
                >
                  {isSubmitting ? (
                    "שומר..."
                  ) : (
                    <>
                      <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                        <AssetImage asset={icons.save} decorative variant="flat" className="w-full h-auto" />
                      </span>{" "}
                      שמירה
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => submit("published")}
                  disabled={isSubmitting}
                  className="btn-admin-secondary"
                >
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.growth} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  שמירה ופרסום
                </button>
                <button
                  type="button"
                  onClick={() => submit("draft")}
                  disabled={isSubmitting}
                  className="btn-admin-secondary"
                >
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.notes} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  שמירה כטיוטה
                </button>
                {isEdit && (
                  <Link
                    href={`/portfolio/${project.slug}?preview=true`}
                    target="_blank"
                    className="btn-admin-secondary"
                  >
                    <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                      <AssetImage asset={icons.eye} decorative variant="flat" className="w-full h-auto" />
                    </span>{" "}
                    תצוגה מקדימה
                  </Link>
                )}
                <Link href="/admin/projects" className="text-center text-sm font-bold text-muted hover:text-ink">
                  ביטול וחזרה לרשימה
                </Link>
              </div>
            </div>
          </AdminCard>

          <AdminSeoFields
            seoTitle={seoTitle}
            seoDescription={seoDescription}
            onTitleChange={(v) => setValue("seo_title", v, { shouldValidate: true })}
            onDescriptionChange={(v) => setValue("seo_description", v, { shouldValidate: true })}
            titleError={errors.seo_title?.message}
            descriptionError={errors.seo_description?.message}
          />
        </div>
      </div>

      <AdminMediaPicker
        open={galleryPickerOpen}
        onClose={() => setGalleryPickerOpen(false)}
        onSelect={(url) => setValue("gallery", [...gallery, url])}
      />
    </form>
  );
}
