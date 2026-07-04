"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { videoGuideSchema, type VideoGuideInput } from "@/lib/admin/validation";
import { createVideoGuide, updateVideoGuide } from "@/lib/admin/actions/video-guides";
import type { CategoryRow, VideoGuideRow } from "@/lib/types";
import AdminCard from "@/components/admin/AdminCard";
import AssetImage from "@/components/AssetImage";
import { icons } from "@/data/assets";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminImagePicker from "@/components/admin/AdminImagePicker";
import AdminVideoPicker from "@/components/admin/AdminVideoPicker";
import AdminSeoFields from "@/components/admin/AdminSeoFields";
import AdminSlugField from "@/components/admin/AdminSlugField";
import { useToast } from "@/components/admin/AdminToast";

const GRADIENT_OPTIONS = [
  { value: "", label: "אוטומטי" },
  { value: "from-[#4f7bff] to-[#7c5cff]", label: "כחול → סגול" },
  { value: "from-[#ff7ac8] to-[#e77455]", label: "ורוד → אלמוגי" },
  { value: "from-[#22c55e] to-[#0ea5e9]", label: "ירוק → תכלת" },
  { value: "from-[#7c5cff] to-[#ff7ac8]", label: "סגול → ורוד" },
  { value: "from-[#f59e0b] to-[#e77455]", label: "צהוב → אלמוגי" },
  { value: "from-[#0ea5e9] to-[#22d3ee]", label: "תכלת → טורקיז" },
];

interface VideoGuideFormProps {
  categories: CategoryRow[];
  videoGuide?: VideoGuideRow;
}

function toDefaults(v?: VideoGuideRow): VideoGuideInput {
  return {
    title: v?.title ?? "",
    slug: v?.slug ?? "",
    excerpt: v?.excerpt ?? "",
    description: v?.description ?? "",
    video_url: v?.video_url ?? "",
    thumbnail: v?.thumbnail ?? "",
    duration: v?.duration ?? "",
    category_id: v?.category_id ?? null,
    level: v?.level ?? "מתחילים",
    tags: v?.tags?.join(", ") ?? "",
    gradient: v?.gradient ?? "",
    is_new: v?.is_new ?? false,
    featured: v?.featured ?? false,
    status: v?.status ?? "draft",
    sort_order: v?.sort_order ?? 0,
    seo_title: v?.seo_title ?? "",
    seo_description: v?.seo_description ?? "",
  };
}

/** טופס יצירה/עריכה של מדריך וידאו */
export default function VideoGuideForm({ categories, videoGuide }: VideoGuideFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!videoGuide;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VideoGuideInput>({
    resolver: zodResolver(videoGuideSchema) as never,
    defaultValues: toDefaults(videoGuide),
    mode: "onBlur",
  });

  const title = watch("title") ?? "";
  const slug = watch("slug") ?? "";
  const thumbnail = watch("thumbnail") ?? "";
  const videoUrl = watch("video_url") ?? "";
  const seoTitle = watch("seo_title") ?? "";
  const seoDescription = watch("seo_description") ?? "";

  const submit = async (statusOverride?: "draft" | "published") => {
    if (statusOverride) setValue("status", statusOverride);
    await handleSubmit(async () => {
      const values = getValues();
      const result = isEdit
        ? await updateVideoGuide(videoGuide.id, values)
        : await createVideoGuide(values);
      if (result.ok) {
        toast(result.message ?? "נשמר בהצלחה");
        if (!isEdit && result.data?.id) router.push(`/admin/video-guides/${result.data.id}`);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    })();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <AdminCard title="פרטי מדריך הווידאו" icon={icons.notepad}>
          <div className="flex flex-col gap-4">
            <AdminFormField label="כותרת" htmlFor="title" error={errors.title?.message} required>
              <input id="title" className="admin-input" aria-invalid={!!errors.title} {...register("title")} />
            </AdminFormField>

            <AdminSlugField
              value={slug}
              onChange={(v) => setValue("slug", v, { shouldValidate: true })}
              sourceTitle={title}
              error={errors.slug?.message}
              pathPrefix="/video-guides/"
            />

            <AdminFormField label="תקציר" htmlFor="excerpt" error={errors.excerpt?.message}>
              <textarea id="excerpt" rows={2} className="admin-input resize-none" {...register("excerpt")} />
            </AdminFormField>

            <AdminFormField label="תיאור מלא" htmlFor="description" hint="מוצג בעמוד הצפייה">
              <textarea id="description" rows={4} className="admin-input" {...register("description")} />
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

              <AdminFormField
                label="משך"
                htmlFor="duration"
                error={errors.duration?.message}
                hint="למשל 12:30"
              >
                <input id="duration" dir="ltr" className="admin-input text-left" {...register("duration")} />
              </AdminFormField>
            </div>

            <AdminFormField label="תגיות" htmlFor="tags" hint="מופרדות בפסיק">
              <input id="tags" className="admin-input" {...register("tags")} />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="וידאו ותצוגה" icon={icons.videoEdit}>
          <div className="flex flex-col gap-4">
            <AdminVideoPicker
              label="קובץ הווידאו"
              value={videoUrl}
              onChange={(url) => setValue("video_url", url, { shouldValidate: true })}
              error={errors.video_url?.message}
              hint="הסרטונים נשמרים אצלנו בלבד — מעלים לספריית המדיה ובוחרים משם"
            />

            <AdminImagePicker
              label="תמונת Thumbnail"
              value={thumbnail}
              onChange={(url) => setValue("thumbnail", url, { shouldValidate: true })}
              error={errors.thumbnail?.message}
              hint="בלי תמונה — הכרטיס יוצג עם גרדיאנט"
            />

            <AdminFormField label="גרדיאנט רקע" htmlFor="gradient">
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
                  href={`/video-guides/${videoGuide.slug}?preview=true`}
                  target="_blank"
                  className="btn-admin-secondary"
                >
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.eye} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  תצוגה מקדימה
                </Link>
              )}
              <Link
                href="/admin/video-guides"
                className="text-center text-sm font-bold text-muted hover:text-ink"
              >
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
