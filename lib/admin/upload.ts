"use client";

/**
 * העלאת קובץ מדיה ישירות מהדפדפן ל-Supabase Storage.
 * למה לא דרך Server Action? כי גוף בקשה שם מוגבל (1MB בברירת מחדל,
 * ו-4.5MB בפריסה על Vercel) — וקבצי וידאו/אודיו גדולים בהרבה.
 * הזרימה: העלאה ישירה ל-bucket ‏media (RLS מרשה רק ל-editor/admin),
 * ואז רישום המטא-דאטה בטבלת media דרך registerMedia בשרת.
 */

import { registerMedia } from "@/lib/admin/actions/media";
import {
  ALLOWED_MEDIA_TYPES,
  MEDIA_LIMITS_LABEL,
  MEDIA_SIZE_LIMITS,
  mediaKind,
  sanitizeFileName,
} from "@/lib/media";
import type { ActionResult, MediaRow } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export async function uploadMediaFile(
  file: File,
  folder = "general"
): Promise<ActionResult<MediaRow>> {
  const ext = ALLOWED_MEDIA_TYPES[file.type];
  if (!ext) {
    return {
      ok: false,
      error: "סוג קובץ לא נתמך — מותר: תמונות, וידאו (mp4/webm/mov), אודיו (mp3/wav/m4a/ogg) ו-PDF",
    };
  }
  if (file.size > MEDIA_SIZE_LIMITS[mediaKind(file.type)]) {
    return { ok: false, error: `הקובץ גדול מדי — ${MEDIA_LIMITS_LABEL}` };
  }

  const safeFolder = folder.replace(/[^a-z0-9-_]/g, "") || "general";
  const path = `${safeFolder}/${Date.now().toString(36)}-${sanitizeFileName(file.name)}.${ext}`;

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    return { ok: false, error: `ההעלאה נכשלה: ${uploadError.message}` };
  }

  const result = await registerMedia({
    path,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    folder: safeFolder,
  });

  // אם הרישום נכשל — מנקים את הקובץ מהאחסון כדי לא להשאיר "יתומים"
  if (!result.ok) {
    await supabase.storage.from("media").remove([path]);
  }
  return result;
}
