"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { categorySchema, type CategoryInput } from "@/lib/admin/validation";
import { revalidateGuides, revalidateProjects, revalidateVideoGuides } from "@/lib/revalidate";
import type { ActionResult } from "@/lib/types";
import { firstZodError, friendlyDbError, logActivity, orNull } from "./helpers";

function revalidateForType(type: string) {
  if (type === "project") revalidateProjects();
  else if (type === "guide") revalidateGuides();
  else if (type === "video_guide") revalidateVideoGuides();
  else {
    revalidateProjects();
    revalidateGuides();
    revalidateVideoGuides();
  }
}

export async function createCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const data = parsed.data;

  const supabase = await createServerClient();
  const { data: created, error } = await supabase
    .from("categories")
    .insert({
      name: data.name,
      slug: data.slug,
      description: orNull(data.description),
      type: data.type,
      color: orNull(data.color),
      icon: orNull(data.icon),
      sort_order: data.sort_order,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "created_category",
    "category",
    created.id,
    `נוצרה קטגוריה: ${data.name}`
  );
  revalidateForType(data.type);
  return { ok: true, data: { id: created.id }, message: "הקטגוריה נוצרה" };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const data = parsed.data;

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: data.name,
      slug: data.slug,
      description: orNull(data.description),
      type: data.type,
      color: orNull(data.color),
      icon: orNull(data.icon),
      sort_order: data.sort_order,
    })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "updated_category",
    "category",
    id,
    `עודכנה קטגוריה: ${data.name}`
  );
  revalidateForType(data.type);
  return { ok: true, message: "הקטגוריה עודכנה" };
}

/**
 * מחיקת קטגוריה. אם יש תוכן משויך — חובה לבחור קטגוריה חלופית (reassignTo)
 * או להעביר את התוכן ללא קטגוריה (reassignTo: null במפורש עם allowUnassign).
 */
export async function deleteCategory(
  id: string,
  options: { reassignTo?: string | null; allowUnassign?: boolean } = {}
): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, type")
    .eq("id", id)
    .maybeSingle();
  if (!category) return { ok: false, error: "הקטגוריה לא נמצאה" };

  // בדיקת שימוש
  const tables = ["projects", "guides", "video_guides"] as const;
  let usage = 0;
  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);
    usage += count ?? 0;
  }

  if (usage > 0) {
    if (options.reassignTo === undefined && !options.allowUnassign) {
      return {
        ok: false,
        error: `יש ${usage} פריטי תוכן בקטגוריה הזו — בחרו קטגוריה חלופית לפני המחיקה`,
      };
    }
    const newCategoryId = options.reassignTo ?? null;
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .update({ category_id: newCategoryId })
        .eq("category_id", id);
      if (error) return { ok: false, error: friendlyDbError(error) };
    }
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "deleted_category",
    "category",
    id,
    `נמחקה קטגוריה: ${category.name}`
  );
  revalidateForType(category.type);
  return { ok: true, message: "הקטגוריה נמחקה" };
}
