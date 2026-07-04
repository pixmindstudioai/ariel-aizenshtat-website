"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { guideSchema, type GuideInput } from "@/lib/admin/validation";
import { revalidateGuides } from "@/lib/revalidate";
import type { ActionResult } from "@/lib/types";
import { firstZodError, friendlyDbError, logActivity, orNull } from "./helpers";

function toDbRow(data: ReturnType<typeof guideSchema.parse>) {
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    category_id: data.category_id ?? null,
    cover_image: orNull(data.cover_image),
    read_time: data.read_time,
    level: data.level,
    tags: data.tags,
    is_new: data.is_new,
    featured: data.featured,
    status: data.status,
    sort_order: data.sort_order,
    seo_title: orNull(data.seo_title),
    seo_description: orNull(data.seo_description),
  };
}

export async function createGuide(input: GuideInput): Promise<ActionResult<{ id: string }>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = guideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("guides")
    .insert(toDbRow(parsed.data))
    .select("id, slug")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "created_guide",
    "guide",
    data.id,
    `נוצר מדריך: ${parsed.data.title}`
  );
  revalidateGuides(data.slug);
  return { ok: true, data: { id: data.id }, message: "המדריך נוצר בהצלחה" };
}

export async function updateGuide(id: string, input: GuideInput): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = guideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { error } = await supabase.from("guides").update(toDbRow(parsed.data)).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "updated_guide",
    "guide",
    id,
    `עודכן מדריך: ${parsed.data.title}`
  );
  revalidateGuides(parsed.data.slug);
  return { ok: true, message: "השינויים נשמרו והאתר עודכן" };
}

export async function publishGuide(id: string, publish: boolean): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("guides")
    .update({ status: publish ? "published" : "draft" })
    .eq("id", id)
    .select("slug, title")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    publish ? "published_guide" : "unpublished_guide",
    "guide",
    id,
    `${publish ? "פורסם" : "בוטל פרסום"}: ${data.title}`
  );
  revalidateGuides(data.slug);
  return { ok: true, message: publish ? "המדריך פורסם באתר" : "הפרסום בוטל" };
}

export async function deleteGuide(
  id: string,
  options: { hard?: boolean } = {}
): Promise<ActionResult> {
  const auth = await assertRole(options.hard ? ["admin"] : ["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("guides")
    .select("slug, title")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "המדריך לא נמצא" };

  const { error } = options.hard
    ? await supabase.from("guides").delete().eq("id", id)
    : await supabase.from("guides").update({ status: "archived" }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    options.hard ? "deleted_guide" : "archived_guide",
    "guide",
    id,
    `${options.hard ? "נמחק לצמיתות" : "הועבר לארכיון"}: ${existing.title}`
  );
  revalidateGuides(existing.slug);
  return { ok: true, message: options.hard ? "המדריך נמחק לצמיתות" : "המדריך הועבר לארכיון" };
}
