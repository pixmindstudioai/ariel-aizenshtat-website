import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { ProfileRow, Role } from "@/lib/types";

/** הפרופיל של המשתמש המחובר, או null אם אין התחברות / אין פרופיל פעיל */
export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;
  return profile as ProfileRow;
}

/**
 * הגנת עמודי אדמין (Server Components):
 * לא מחובר → /admin/login, מחובר בלי הרשאה מתאימה → /admin/no-access
 */
export async function requireRole(roles: Role[]): Promise<ProfileRow> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  if (!roles.includes(profile.role)) redirect("/admin/no-access");
  return profile;
}

export const requireStaff = () => requireRole(["admin", "editor", "viewer"]);
export const requireEditor = () => requireRole(["admin", "editor"]);
export const requireAdmin = () => requireRole(["admin"]);

/**
 * אימות הרשאה בתוך Server Actions — מחזיר שגיאה במקום redirect,
 * כדי שהטופס יוכל להציג הודעה ברורה.
 */
export async function assertRole(
  roles: Role[]
): Promise<{ profile: ProfileRow } | { error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "צריך להתחבר מחדש כדי לבצע את הפעולה" };
  if (!roles.includes(profile.role)) return { error: "אין לך הרשאה לבצע את הפעולה הזו" };
  return { profile };
}
