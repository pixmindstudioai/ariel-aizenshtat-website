"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageSchema, type PageInput } from "@/lib/admin/validation";
import { updatePage } from "@/lib/admin/actions/pages";
import { publicPathForPage } from "@/lib/public-paths";
import type { PageRow } from "@/lib/types";
import { icons } from "@/data/assets";
import AssetImage from "@/components/AssetImage";
import AdminCard from "@/components/admin/AdminCard";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminImagePicker from "@/components/admin/AdminImagePicker";
import AdminSeoFields from "@/components/admin/AdminSeoFields";
import { useToast } from "@/components/admin/AdminToast";

/** תוויות ידידותיות למפתחות content_json מוכרים */
const CONTENT_KEY_LABELS: Record<string, string> = {
  services_title: "כותרת אזור השירותים",
  services_subtitle: "תת-כותרת אזור השירותים",
  projects_title: "כותרת אזור הפרויקטים",
  projects_subtitle: "תת-כותרת אזור הפרויקטים",
  team_title: "כותרת אזור הצוות",
  team_subtitle: "תת-כותרת אזור הצוות",
  cta_title: "כותרת אזור ה-CTA",
  cta_subtitle: "תת-כותרת אזור ה-CTA",
  // תיק עבודות — עמוד ראשי
  process_title: "כותרת אזור 'איך אני עובד'",
  process_subtitle: "תת-כותרת אזור 'איך אני עובד'",
  step1_title: "שלב 1 — כותרת",
  step1_description: "שלב 1 — תיאור",
  step2_title: "שלב 2 — כותרת",
  step2_description: "שלב 2 — תיאור",
  step3_title: "שלב 3 — כותרת",
  step3_description: "שלב 3 — תיאור",
  // עמודי קטגוריות הפורטפוליו
  works_title: "כותרת אזור העבודות",
  works_subtitle: "תת-כותרת אזור העבודות",
  production_title: "כותרת 'מה אפשר להפיק'",
  production_subtitle: "תת-כותרת 'מה אפשר להפיק'",
  principles_title: "כותרת 'מה חשוב באתר שעובד'",
  principles_subtitle: "תת-כותרת 'מה חשוב באתר שעובד'",
  behind_description: "טקסט 'מאחורי הקלעים'",
  examples_title: "כותרת אזור הדוגמאות",
  examples_subtitle: "תת-כותרת אזור הדוגמאות",
};

interface PageFormProps {
  page: PageRow;
}

/** טופס עריכת עמוד: טקסטים, Hero, סקשנים, SEO וסטטוס */
export default function PageForm({ page }: PageFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // הטקסטים הדינמיים של העמוד (רק ערכי מחרוזת מתוך content_json)
  const [contentTexts, setContentTexts] = useState<Record<string, string>>(() => {
    const entries = Object.entries(page.content_json ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    );
    return Object.fromEntries(entries);
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PageInput>({
    resolver: zodResolver(pageSchema) as never,
    defaultValues: {
      title: page.title,
      subtitle: page.subtitle ?? "",
      hero_title: page.hero_title ?? "",
      hero_description: page.hero_description ?? "",
      content_json: page.content_json ?? {},
      og_image: page.og_image ?? "",
      status: page.status,
      sort_order: page.sort_order,
      seo_title: page.seo_title ?? "",
      seo_description: page.seo_description ?? "",
      seo_keywords: page.seo_keywords ?? "",
    },
    mode: "onBlur",
  });

  const ogImage = watch("og_image") ?? "";
  const seoTitle = watch("seo_title") ?? "";
  const seoDescription = watch("seo_description") ?? "";
  const publicPath = publicPathForPage(page.slug);

  const submit = async (statusOverride?: "draft" | "published") => {
    if (statusOverride) setValue("status", statusOverride);
    setValue("content_json", { ...page.content_json, ...contentTexts });
    await handleSubmit(async () => {
      const result = await updatePage(page.slug, getValues());
      if (result.ok) {
        toast(result.message ?? "העמוד נשמר");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    })();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-6">
        <AdminCard title="פרטי העמוד" icon={icons.notepad}>
          <div className="flex flex-col gap-4">
            <AdminFormField label="שם העמוד (בממשק הניהול)" htmlFor="title" error={errors.title?.message} required>
              <input id="title" className="admin-input" {...register("title")} />
            </AdminFormField>
            <AdminFormField label="תת-כותרת" htmlFor="subtitle">
              <input id="subtitle" className="admin-input" {...register("subtitle")} />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="אזור Hero" icon={icons.user}>
          <div className="flex flex-col gap-4">
            <AdminFormField label="כותרת Hero" htmlFor="hero_title" error={errors.hero_title?.message}>
              <input id="hero_title" className="admin-input" {...register("hero_title")} />
            </AdminFormField>
            <AdminFormField
              label="תיאור Hero"
              htmlFor="hero_description"
              error={errors.hero_description?.message}
            >
              <textarea id="hero_description" rows={3} className="admin-input" {...register("hero_description")} />
            </AdminFormField>
          </div>
        </AdminCard>

        {Object.keys(contentTexts).length > 0 && (
          <AdminCard title="טקסטים של סקשנים בעמוד" icon={icons.pencil}>
            <div className="flex flex-col gap-4">
              {Object.entries(contentTexts).map(([key, value]) => (
                <AdminFormField key={key} label={CONTENT_KEY_LABELS[key] ?? key} htmlFor={`content-${key}`}>
                  <textarea
                    id={`content-${key}`}
                    rows={value.length > 60 ? 2 : 1}
                    className="admin-input resize-none"
                    value={value}
                    onChange={(e) =>
                      setContentTexts((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </AdminFormField>
              ))}
            </div>
          </AdminCard>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <AdminCard title="פרסום" icon={icons.growth}>
          <div className="flex flex-col gap-4">
            <AdminFormField label="סטטוס" htmlFor="status" hint="עמוד בטיוטה מציג באתר את תוכן ברירת המחדל">
              <select id="status" className="admin-input" {...register("status")}>
                <option value="draft">טיוטה</option>
                <option value="published">מפורסם</option>
                <option value="archived">בארכיון</option>
              </select>
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
              {publicPath && (
                <Link href={publicPath} target="_blank" className="btn-admin-secondary">
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.eye} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  צפייה בעמוד באתר
                </Link>
              )}
              <Link href="/admin/pages" className="text-center text-sm font-bold text-muted hover:text-ink">
                חזרה לרשימת העמודים
              </Link>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="תמונת שיתוף (OG)" icon={icons.imageUpload}>
          <AdminImagePicker
            label="תמונה לשיתוף ברשתות"
            value={ogImage}
            onChange={(url) => setValue("og_image", url, { shouldValidate: true })}
            error={errors.og_image?.message}
          />
        </AdminCard>

        <AdminSeoFields
          seoTitle={seoTitle}
          seoDescription={seoDescription}
          onTitleChange={(v) => setValue("seo_title", v, { shouldValidate: true })}
          onDescriptionChange={(v) => setValue("seo_description", v, { shouldValidate: true })}
          titleError={errors.seo_title?.message}
          descriptionError={errors.seo_description?.message}
        />

        <AdminCard title="מילות מפתח" icon={icons.notes}>
          <AdminFormField label="מילות מפתח SEO" htmlFor="seo_keywords" hint="מופרדות בפסיק">
            <input id="seo_keywords" className="admin-input" {...register("seo_keywords")} />
          </AdminFormField>
        </AdminCard>
      </div>
    </form>
  );
}
