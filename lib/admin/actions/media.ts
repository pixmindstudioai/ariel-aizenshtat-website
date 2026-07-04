"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { ALLOWED_MEDIA_TYPES, MEDIA_SIZE_LIMITS, mediaKind } from "@/lib/media";
import type { ActionResult, MediaRow } from "@/lib/types";
import { friendlyDbError, logActivity, orNull } from "./helpers";

/** רשימת ספריית המדיה — לשימוש בוחר המדיה בטפסים */
export async function getMediaLibrary(): Promise<ActionResult<MediaRow[]>> {
  const auth = await assertRole(["admin", "editor", "viewer"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, data: (data ?? []) as MediaRow[] };
}

interface RegisterMediaInput {
  path: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  altText?: string;
  caption?: string;
  folder?: string;
}

/**
 * רישום קובץ בטבלת media אחרי העלאה ישירה מהדפדפן ל-Storage.
 * ההעלאה עצמה קורית בקליינט (lib/admin/upload.ts) — קבצי וידאו/אודיו גדולים
 * לא יכולים לעבור דרך Server Action (מגבלת גוף בקשה), ולכן רק המטא-דאטה מגיע לכאן.
 */
export async function registerMedia(input: RegisterMediaInput): Promise<ActionResult<MediaRow>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  if (!ALLOWED_MEDIA_TYPES[input.fileType]) {
    return { ok: false, error: "סוג קובץ לא נתמך" };
  }
  if (input.fileSize > MEDIA_SIZE_LIMITS[mediaKind(input.fileType)]) {
    return { ok: false, error: "הקובץ חורג ממגבלת הגודל" };
  }
  // נתיב בתוך ה-bucket בלבד — בלי טיפוס בין תיקיות
  if (!/^[a-z0-9-_]+\/[a-z0-9-_.]+$/i.test(input.path)) {
    return { ok: false, error: "נתיב קובץ לא תקין" };
  }

  const supabase = await createServerClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(input.path);

  const folder = (input.folder || "general").replace(/[^a-z0-9-_]/g, "") || "general";

  const { data: row, error: dbError } = await supabase
    .from("media")
    .insert({
      file_name: input.fileName,
      file_url: publicUrl,
      file_type: input.fileType,
      file_size: input.fileSize,
      alt_text: input.altText ?? "",
      caption: orNull(input.caption ?? ""),
      folder,
      uploaded_by: auth.profile.id,
    })
    .select("*")
    .single();
  if (dbError) return { ok: false, error: friendlyDbError(dbError) };

  await logActivity(
    supabase,
    auth.profile.id,
    "uploaded_media",
    "media",
    row.id,
    `הועלה קובץ: ${input.fileName}`
  );
  return { ok: true, data: row as MediaRow, message: "הקובץ הועלה בהצלחה" };
}

export async function updateMediaMeta(
  id: string,
  meta: { alt_text?: string; caption?: string; folder?: string }
): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("media")
    .update({
      alt_text: meta.alt_text ?? "",
      caption: orNull(meta.caption ?? ""),
      folder: meta.folder || "general",
    })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, message: "פרטי הקובץ עודכנו" };
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data: row } = await supabase
    .from("media")
    .select("file_url, file_name")
    .eq("id", id)
    .maybeSingle();
  if (!row) return { ok: false, error: "הקובץ לא נמצא" };

  // חילוץ הנתיב בתוך ה-bucket מתוך ה-URL הציבורי
  const marker = "/storage/v1/object/public/media/";
  const idx = row.file_url.indexOf(marker);
  if (idx !== -1) {
    const path = decodeURIComponent(row.file_url.slice(idx + marker.length));
    await supabase.storage.from("media").remove([path]);
  }

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "deleted_media",
    "media",
    id,
    `נמחק קובץ: ${row.file_name}`
  );
  return { ok: true, message: "הקובץ נמחק" };
}
