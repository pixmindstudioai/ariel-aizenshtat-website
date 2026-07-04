import type { createServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createServerClient>>;

/** רישום פעולה ביומן הפעילות — כשל כאן לא מפיל את הפעולה עצמה */
export async function logActivity(
  supabase: ServerClient,
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  description: string
): Promise<void> {
  await supabase.from("activity_log").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
  });
}

/** מחרוזת ריקה → null עבור עמודות nullable בדאטהבייס */
export const orNull = (value: string | null | undefined): string | null =>
  value && value.trim() !== "" ? value : null;

/** תרגום שגיאות Postgres נפוצות להודעה ידידותית בעברית */
export function friendlyDbError(error: { code?: string; message?: string }): string {
  if (error.code === "23505") return "ה-slug הזה כבר תפוס — בחרו slug אחר";
  if (error.code === "42501") return "אין לך הרשאה לבצע את הפעולה הזו";
  if (error.code === "PGRST205" || error.code === "42P01")
    return "טבלאות הדאטהבייס עוד לא הוקמו — יש להריץ את database/schema.sql ב-Supabase";
  return error.message ?? "הייתה שגיאה, נסו שוב";
}

/** ההודעה הראשונה מתוצאת ולידציה של Zod */
export function firstZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "הנתונים שהוזנו אינם תקינים";
}
