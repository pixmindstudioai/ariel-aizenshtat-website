"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guideSchema, type GuideInput } from "@/lib/admin/validation";
import { createGuide, updateGuide } from "@/lib/admin/actions/guides";
import type { CategoryRow, GuideRow } from "@/lib/types";
import { icons } from "@/data/assets";
import AssetImage from "@/components/AssetImage";
import AdminAudioPicker from "@/components/admin/AdminAudioPicker";
import AdminCard from "@/components/admin/AdminCard";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminImagePicker from "@/components/admin/AdminImagePicker";
import AdminRichTextEditor from "@/components/admin/AdminRichTextEditor";
import AdminSeoFields from "@/components/admin/AdminSeoFields";
import AdminSlugField from "@/components/admin/AdminSlugField";
import { useToast } from "@/components/admin/AdminToast";

interface GuideFormProps {
  categories: CategoryRow[];
  guide?: GuideRow;
}

function toDefaults(guide?: GuideRow): GuideInput {
  return {
    title: guide?.title ?? "",
    slug: guide?.slug ?? "",
    excerpt: guide?.excerpt ?? "",
    content: guide?.content ?? "",
    category_id: guide?.category_id ?? null,
    cover_image: guide?.cover_image ?? "",
    audio_url: guide?.audio_url ?? "",
    show_toc: guide?.show_toc ?? false,
    read_time: guide?.read_time ?? 5,
    level: guide?.level ?? "מתחילים",
    tags: guide?.tags?.join(", ") ?? "",
    is_new: guide?.is_new ?? false,
    featured: guide?.featured ?? false,
    status: guide?.status ?? "draft",
    sort_order: guide?.sort_order ?? 0,
    seo_title: guide?.seo_title ?? "",
    seo_description: guide?.seo_description ?? "",
  };
}

/** טופס יצירה/עריכה של מדריך כתוב */
export default function GuideForm({ categories, guide }: GuideFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!guide;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<GuideInput>({
    resolver: zodResolver(guideSchema) as never,
    defaultValues: toDefaults(guide),
    mode: "onBlur",
  });

  const title = watch("title") ?? "";
  const slug = watch("slug") ?? "";
  const coverImage = watch("cover_image") ?? "";
  const audioUrl = watch("audio_url") ?? "";
  const content = watch("content") ?? "";
  const seoTitle = watch("seo_title") ?? "";
  const seoDescription = watch("seo_description") ?? "";

  const submit = async (statusOverride?: "draft" | "published") => {
    if (statusOverride) setValue("status", statusOverride);
    await handleSubmit(async () => {
      const values = getValues();
      const result = isEdit ? await updateGuide(guide.id, values) : await createGuide(values);
      if (result.ok) {
        toast(result.message ?? "נשמר בהצלחה");
        if (!isEdit && result.data?.id) router.push(`/admin/guides/${result.data.id}`);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    })();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <AdminCard title="פרטי המדריך" icon={icons.notepad}>
          <div className="flex flex-col gap-4">
            <AdminFormField label="כותרת" htmlFor="title" error={errors.title?.message} required>
              <input id="title" className="admin-input" aria-invalid={!!errors.title} {...register("title")} />
            </AdminFormField>

            <AdminSlugField
              value={slug}
              onChange={(v) => setValue("slug", v, { shouldValidate: true })}
              sourceTitle={title}
              error={errors.slug?.message}
              pathPrefix="/guides/"
            />

            <AdminFormField label="תקציר" htmlFor="excerpt" error={errors.excerpt?.message}>
              <textarea id="excerpt" rows={2} className="admin-input resize-none" {...register("excerpt")} />
            </AdminFormField>

            <div className="grid gap-4 sm:grid-cols-3">
              <AdminFormField label="קטגוריה" htmlFor="category_id">
                <select
                  id="category_id"
                  className="admin-input"
                  {...register("category_id", { setValueAs: (v: string) => (v === "" ? null : v) })}
                >
                  <option value="">ללא קטגוריה</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </AdminFormField>

              <AdminFormField label="רמה" htmlFor="level">
                <select id="level" className="admin-input" {...register("level")}>
                  <option value="מתחילים">מתחילים</option>
                  <option value="בינוני">בינוני</option>
                  <option value="מתקדמים">מתקדמים</option>
                </select>
              </AdminFormField>

              <AdminFormField label="זמן קריאה (דקות)" htmlFor="read_time" error={errors.read_time?.message}>
                <input
                  id="read_time"
                  type="number"
                  min={1}
                  className="admin-input"
                  {...register("read_time", { setValueAs: (v: string) => Number(v) || 1 })}
                />
              </AdminFormField>
            </div>

            <AdminFormField label="תגיות" htmlFor="tags" hint="מופרדות בפסיק — הראשונה מוצגת על הכרטיס">
              <input id="tags" className="admin-input" {...register("tags")} />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="תוכן המדריך" icon={icons.notes}>
          <div className="flex flex-col gap-4">
            <AdminRichTextEditor
              label="תוכן מלא"
              value={content}
              onChange={(v) => setValue("content", v)}
              rows={16}
            />
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 font-bold">
              <input type="checkbox" className="h-5 w-5 accent-[#4f7bff]" {...register("show_toc")} />
              <span>
                תוכן עניינים אוטומטי
                <span className="block text-xs font-semibold text-muted">
                  נבנה מהכותרות במדריך (## ו-###) ומוצג לקוראים לפני התוכן
                </span>
              </span>
            </label>
          </div>
        </AdminCard>

        <AdminCard title="סקירה קולית" icon={icons.videoPlay}>
          <AdminAudioPicker
            label="הקלטת סקירה של המדריך"
            value={audioUrl}
            onChange={(url) => setValue("audio_url", url, { shouldValidate: true })}
            error={errors.audio_url?.message}
            hint="הקוראים יוכלו להאזין לסקירה בראש המדריך — מעלים קובץ אודיו לספריית המדיה ובוחרים אותו"
          />
        </AdminCard>

        <AdminCard title="תמונה" icon={icons.imageUpload}>
          <AdminImagePicker
            label="תמונת קאבר"
            value={coverImage}
            onChange={(url) => setValue("cover_image", url, { shouldValidate: true })}
            error={errors.cover_image?.message}
          />
        </AdminCard>
      </div>

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
              <button type="button" onClick={() => submit()} disabled={isSubmitting} className="btn-admin-primary">
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
                  href={`/guides/${guide.slug}?preview=true`}
                  target="_blank"
                  className="btn-admin-secondary"
                >
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.eye} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  תצוגה מקדימה
                </Link>
              )}
              <Link href="/admin/guides" className="text-center text-sm font-bold text-muted hover:text-ink">
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
    </form>
  );
}
