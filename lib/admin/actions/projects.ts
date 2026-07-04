"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { projectSchema, type ProjectInput } from "@/lib/admin/validation";
import { revalidateProjects } from "@/lib/revalidate";
import type { ActionResult } from "@/lib/types";
import { firstZodError, friendlyDbError, logActivity, orNull } from "./helpers";

function toDbRow(data: ReturnType<typeof projectSchema.parse>) {
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    description: data.description,
    content: data.content,
    category_id: data.category_id ?? null,
    project_type: data.project_type,
    cover_image: orNull(data.cover_image),
    gallery: data.gallery,
    video_url: orNull(data.video_url),
    external_url: orNull(data.external_url),
    tools: data.tools,
    tags: data.tags,
    client_name: orNull(data.client_name),
    year: data.year ?? null,
    gradient: orNull(data.gradient),
    result: orNull(data.result),
    is_new: data.is_new,
    featured: data.featured,
    status: data.status,
    sort_order: data.sort_order,
    seo_title: orNull(data.seo_title),
    seo_description: orNull(data.seo_description),
  };
}

export async function createProject(input: ProjectInput): Promise<ActionResult<{ id: string }>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(toDbRow(parsed.data))
    .select("id, slug")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "created_project",
    "project",
    data.id,
    `נוצר פרויקט: ${parsed.data.title}`
  );
  revalidateProjects(data.slug);
  return { ok: true, data: { id: data.id }, message: "הפרויקט נוצר בהצלחה" };
}

export async function updateProject(id: string, input: ProjectInput): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { error } = await supabase.from("projects").update(toDbRow(parsed.data)).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "updated_project",
    "project",
    id,
    `עודכן פרויקט: ${parsed.data.title}`
  );
  revalidateProjects(parsed.data.slug);
  return { ok: true, message: "השינויים נשמרו והאתר עודכן" };
}

export async function publishProject(id: string, publish: boolean): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ status: publish ? "published" : "draft" })
    .eq("id", id)
    .select("slug, title")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    publish ? "published_project" : "unpublished_project",
    "project",
    id,
    `${publish ? "פורסם" : "בוטל פרסום"}: ${data.title}`
  );
  revalidateProjects(data.slug);
  return { ok: true, message: publish ? "הפרויקט פורסם באתר" : "הפרסום בוטל" };
}

/** מחיקה רכה (ארכוב) כברירת מחדל; מחיקה סופית — admin בלבד */
export async function deleteProject(
  id: string,
  options: { hard?: boolean } = {}
): Promise<ActionResult> {
  const auth = await assertRole(options.hard ? ["admin"] : ["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("projects")
    .select("slug, title")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "הפרויקט לא נמצא" };

  const { error } = options.hard
    ? await supabase.from("projects").delete().eq("id", id)
    : await supabase.from("projects").update({ status: "archived" }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    options.hard ? "deleted_project" : "archived_project",
    "project",
    id,
    `${options.hard ? "נמחק לצמיתות" : "הועבר לארכיון"}: ${existing.title}`
  );
  revalidateProjects(existing.slug);
  return { ok: true, message: options.hard ? "הפרויקט נמחק לצמיתות" : "הפרויקט הועבר לארכיון" };
}

export async function duplicateProject(id: string): Promise<ActionResult<{ id: string }>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data: source } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!source) return { ok: false, error: "הפרויקט לא נמצא" };

  const copy = { ...source } as Record<string, unknown>;
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;
  delete copy.category;
  copy.title = `${source.title} (עותק)`;
  copy.slug = `${source.slug}-copy-${Date.now().toString(36)}`;
  copy.status = "draft";
  copy.featured = false;

  const { data, error } = await supabase.from("projects").insert(copy).select("id").single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "duplicated_project",
    "project",
    data.id,
    `שוכפל פרויקט: ${source.title}`
  );
  return { ok: true, data: { id: data.id }, message: "הפרויקט שוכפל כטיוטה" };
}

/** עדכון סדר ידני אחרי גרירה — מקבל את כל המזהים בסדר החדש */
export async function reorderProjects(orderedIds: string[]): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("projects").update({ sort_order: index + 1 }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: friendlyDbError(failed.error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "reordered_projects",
    "project",
    null,
    "עודכן סדר הפרויקטים"
  );
  revalidateProjects();
  return { ok: true, message: "הסדר עודכן" };
}
