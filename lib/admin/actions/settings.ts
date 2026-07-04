"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/admin/validation";
import { revalidateSiteWide } from "@/lib/revalidate";
import type { ActionResult } from "@/lib/types";
import { firstZodError, friendlyDbError, logActivity, orNull } from "./helpers";

export async function updateSiteSettings(input: SiteSettingsInput): Promise<ActionResult> {
  const auth = await assertRole(["admin"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const data = parsed.data;

  const supabase = await createServerClient();
  const row = {
    site_name: data.site_name,
    site_description: data.site_description,
    logo_url: orNull(data.logo_url),
    favicon_url: orNull(data.favicon_url),
    default_og_image: orNull(data.default_og_image),
    primary_cta_text: data.primary_cta_text,
    primary_cta_url: data.primary_cta_url,
    whatsapp_url: orNull(data.whatsapp_url),
    instagram_url: orNull(data.instagram_url),
    youtube_url: orNull(data.youtube_url),
    tiktok_url: orNull(data.tiktok_url),
    linkedin_url: orNull(data.linkedin_url),
    email: orNull(data.email),
    phone: orNull(data.phone),
    footer_text: orNull(data.footer_text),
    seo_title: orNull(data.seo_title),
    seo_description: orNull(data.seo_description),
    seo_keywords: orNull(data.seo_keywords),
  };

  // שורת ההגדרות היא singleton — עדכון אם קיימת, יצירה אם לא
  const { data: existing } = await supabase.from("site_settings").select("id").maybeSingle();
  const { error } = existing
    ? await supabase.from("site_settings").update(row).eq("id", existing.id)
    : await supabase.from("site_settings").insert(row);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "updated_settings",
    "site_settings",
    null,
    "עודכנו הגדרות האתר"
  );
  revalidateSiteWide();
  return { ok: true, message: "ההגדרות נשמרו וכל האתר עודכן" };
}
