"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { pageSchema, type PageInput } from "@/lib/admin/validation";
import { revalidatePage } from "@/lib/revalidate";
import type { ActionResult } from "@/lib/types";
import { firstZodError, friendlyDbError, logActivity, orNull } from "./helpers";

export async function updatePage(slug: string, input: PageInput): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const data = parsed.data;

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("pages")
    .update({
      title: data.title,
      subtitle: orNull(data.subtitle),
      hero_title: orNull(data.hero_title),
      hero_description: orNull(data.hero_description),
      content_json: data.content_json,
      og_image: orNull(data.og_image),
      status: data.status,
      sort_order: data.sort_order,
      seo_title: orNull(data.seo_title),
      seo_description: orNull(data.seo_description),
      seo_keywords: orNull(data.seo_keywords),
    })
    .eq("slug", slug);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "updated_page",
    "page",
    slug,
    `עודכן עמוד: ${data.title}`
  );
  revalidatePage(slug);
  return { ok: true, message: "העמוד נשמר והאתר עודכן" };
}

export async function setPageStatus(
  slug: string,
  status: "draft" | "published" | "archived"
): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("pages")
    .update({ status })
    .eq("slug", slug)
    .select("title")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    status === "published" ? "published_page" : "unpublished_page",
    "page",
    slug,
    `סטטוס העמוד "${data.title}" שונה ל-${status}`
  );
  revalidatePage(slug);
  return { ok: true, message: status === "published" ? "העמוד פורסם" : "סטטוס העמוד עודכן" };
}
