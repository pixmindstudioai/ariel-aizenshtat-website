"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/admin/validation";
import { updateSiteSettings } from "@/lib/admin/actions/settings";
import type { SiteSettingsRow } from "@/lib/types";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import AdminCard from "@/components/admin/AdminCard";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminImagePicker from "@/components/admin/AdminImagePicker";
import { useToast } from "@/components/admin/AdminToast";
import { adminAssets } from "@/data/adminAssets";
import { icons } from "@/data/assets";

interface SettingsFormProps {
  settings: SiteSettingsRow | null;
}

/** טופס הגדרות האתר — שם, לוגו, CTA, קישורים חברתיים ו-SEO כללי */
export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema) as never,
    defaultValues: {
      site_name: settings?.site_name ?? "Ariel AI",
      site_description: settings?.site_description ?? "",
      logo_url: settings?.logo_url ?? "",
      favicon_url: settings?.favicon_url ?? "",
      default_og_image: settings?.default_og_image ?? "",
      primary_cta_text: settings?.primary_cta_text ?? "בואו נבנה משהו מגניב",
      primary_cta_url: settings?.primary_cta_url ?? "/contact",
      whatsapp_url: settings?.whatsapp_url ?? "",
      instagram_url: settings?.instagram_url ?? "",
      youtube_url: settings?.youtube_url ?? "",
      tiktok_url: settings?.tiktok_url ?? "",
      linkedin_url: settings?.linkedin_url ?? "",
      email: settings?.email ?? "",
      phone: settings?.phone ?? "",
      footer_text: settings?.footer_text ?? "",
      seo_title: settings?.seo_title ?? "",
      seo_description: settings?.seo_description ?? "",
      seo_keywords: settings?.seo_keywords ?? "",
    },
    mode: "onBlur",
  });

  const logoUrl = watch("logo_url") ?? "";
  const ogImage = watch("default_og_image") ?? "";

  const submit = handleSubmit(async () => {
    const result = await updateSiteSettings(getValues());
    if (result.ok) {
      toast(result.message ?? "ההגדרות נשמרו");
      router.refresh();
    } else {
      toast(result.error, "error");
    }
  });

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-2">
      <AdminCard title="זהות האתר" icon={icons.user}>
        <div className="flex flex-col gap-4">
          <AdminFormField label="שם האתר" htmlFor="site_name" error={errors.site_name?.message} required>
            <input id="site_name" className="admin-input" {...register("site_name")} />
          </AdminFormField>
          <AdminFormField label="תיאור האתר" htmlFor="site_description">
            <textarea id="site_description" rows={3} className="admin-input" {...register("site_description")} />
          </AdminFormField>
          <AdminImagePicker
            label="לוגו"
            value={logoUrl}
            onChange={(url) => setValue("logo_url", url, { shouldValidate: true })}
            error={errors.logo_url?.message}
          />
          <AdminImagePicker
            label="תמונת שיתוף ברירת מחדל (OG)"
            value={ogImage}
            onChange={(url) => setValue("default_og_image", url, { shouldValidate: true })}
            error={errors.default_og_image?.message}
          />
        </div>
      </AdminCard>

      <div className="flex flex-col gap-6">
        <AdminCard title="כפתור CTA ראשי" icon={icons.pencil}>
          <div className="flex flex-col gap-4">
            <AdminFormField
              label="טקסט הכפתור"
              htmlFor="primary_cta_text"
              error={errors.primary_cta_text?.message}
              required
            >
              <input id="primary_cta_text" className="admin-input" {...register("primary_cta_text")} />
            </AdminFormField>
            <AdminFormField
              label="קישור הכפתור"
              htmlFor="primary_cta_url"
              error={errors.primary_cta_url?.message}
              required
            >
              <input id="primary_cta_url" dir="ltr" className="admin-input text-left" {...register("primary_cta_url")} />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="פרטי קשר" icon={icons.inbox}>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminFormField label="אימייל" htmlFor="email" error={errors.email?.message}>
              <input id="email" dir="ltr" className="admin-input text-left" {...register("email")} />
            </AdminFormField>
            <AdminFormField label="טלפון" htmlFor="phone">
              <input id="phone" dir="ltr" className="admin-input text-left" {...register("phone")} />
            </AdminFormField>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="קישורים חברתיים" icon={icons.browserPages}>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["whatsapp_url", "וואטסאפ"],
              ["instagram_url", "אינסטגרם"],
              ["youtube_url", "יוטיוב"],
              ["tiktok_url", "טיקטוק"],
              ["linkedin_url", "לינקדאין"],
            ] as const
          ).map(([field, label]) => (
            <AdminFormField key={field} label={label} htmlFor={field} error={errors[field]?.message}>
              <input
                id={field}
                dir="ltr"
                className="admin-input text-left"
                placeholder="https://..."
                {...register(field)}
              />
            </AdminFormField>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="SEO כללי + פוטר" icon={icons.eye}>
        <div className="flex flex-col gap-4">
          <AdminFormField label="כותרת SEO ראשית" htmlFor="seo_title" error={errors.seo_title?.message}>
            <input id="seo_title" className="admin-input" {...register("seo_title")} />
          </AdminFormField>
          <AdminFormField
            label="תיאור SEO ראשי"
            htmlFor="seo_description"
            error={errors.seo_description?.message}
          >
            <textarea id="seo_description" rows={2} className="admin-input" {...register("seo_description")} />
          </AdminFormField>
          <AdminFormField label="מילות מפתח" htmlFor="seo_keywords" hint="מופרדות בפסיק">
            <input id="seo_keywords" className="admin-input" {...register("seo_keywords")} />
          </AdminFormField>
          <AdminFormField label="טקסט פוטר" htmlFor="footer_text">
            <textarea id="footer_text" rows={2} className="admin-input" {...register("footer_text")} />
          </AdminFormField>
        </div>
      </AdminCard>

      <div className="lg:col-span-2">
        <button
          type="button"
          onClick={() => submit()}
          disabled={isSubmitting}
          className="group inline-flex items-center"
          aria-label="שמירת השינויים"
        >
          <span className="w-52">
            <AdminAssetImage
              asset={adminAssets.saveChangesPill}
              alt="שמור שינויים"
              className={`w-full h-auto transition-transform duration-200 group-hover:scale-[1.04] ${isSubmitting ? "opacity-60" : ""}`}
              sizes="208px"
            />
          </span>
          {isSubmitting && <span className="mr-3 font-bold text-muted">שומר...</span>}
        </button>
        <p className="mt-2 text-sm text-muted">שמירה מעדכנת את כל עמודי האתר</p>
      </div>
    </form>
  );
}
