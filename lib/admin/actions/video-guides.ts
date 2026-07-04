"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { videoGuideSchema, type VideoGuideInput } from "@/lib/admin/validation";
import { revalidateVideoGuides } from "@/lib/revalidate";
import type { ActionResult } from "@/lib/types";
import { firstZodError, friendlyDbError, logActivity, orNull } from "./helpers";

function toDbRow(data: ReturnType<typeof videoGuideSchema.parse>) {
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    description: data.description,
    video_url: orNull(data.video_url),
    thumbnail: orNull(data.thumbnail),
    duration: data.duration,
    category_id: data.category_id ?? null,
    level: data.level,
    tags: data.tags,
    gradient: orNull(data.gradient),
    is_new: data.is_new,
    featured: data.featured,
    status: data.status,
    sort_order: data.sort_order,
    seo_title: orNull(data.seo_title),
    seo_description: orNull(data.seo_description),
  };
}

export async function createVideoGuide(
  input: VideoGuideInput
): Promise<ActionResult<{ id: string }>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = videoGuideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("video_guides")
    .insert(toDbRow(parsed.data))
    .select("id, slug")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "created_video_guide",
    "video_guide",
    data.id,
    `נוצר מדריך וידאו: ${parsed.data.title}`
  );
  revalidateVideoGuides(data.slug);
  return { ok: true, data: { id: data.id }, message: "מדריך הווידאו נוצר בהצלחה" };
}

export async function updateVideoGuide(id: string, input: VideoGuideInput): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = videoGuideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { error } = await supabase.from("video_guides").update(toDbRow(parsed.data)).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "updated_video_guide",
    "video_guide",
    id,
    `עודכן מדריך וידאו: ${parsed.data.title}`
  );
  revalidateVideoGuides(parsed.data.slug);
  return { ok: true, message: "השינויים נשמרו והאתר עודכן" };
}

export async function publishVideoGuide(id: string, publish: boolean): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("video_guides")
    .update({ status: publish ? "published" : "draft" })
    .eq("id", id)
    .select("slug, title")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    publish ? "published_video_guide" : "unpublished_video_guide",
    "video_guide",
    id,
    `${publish ? "פורסם" : "בוטל פרסום"}: ${data.title}`
  );
  revalidateVideoGuides(data.slug);
  return { ok: true, message: publish ? "מדריך הווידאו פורסם באתר" : "הפרסום בוטל" };
}

export async function deleteVideoGuide(
  id: string,
  options: { hard?: boolean } = {}
): Promise<ActionResult> {
  const auth = await assertRole(options.hard ? ["admin"] : ["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("video_guides")
    .select("slug, title")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "מדריך הווידאו לא נמצא" };

  const { error } = options.hard
    ? await supabase.from("video_guides").delete().eq("id", id)
    : await supabase.from("video_guides").update({ status: "archived" }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    options.hard ? "deleted_video_guide" : "archived_video_guide",
    "video_guide",
    id,
    `${options.hard ? "נמחק לצמיתות" : "הועבר לארכיון"}: ${existing.title}`
  );
  revalidateVideoGuides(existing.slug);
  return {
    ok: true,
    message: options.hard ? "מדריך הווידאו נמחק לצמיתות" : "מדריך הווידאו הועבר לארכיון",
  };
}
