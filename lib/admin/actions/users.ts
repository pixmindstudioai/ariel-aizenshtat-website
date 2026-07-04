"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult, Role } from "@/lib/types";
import { friendlyDbError, logActivity } from "./helpers";

export async function updateUserRole(userId: string, role: Role): Promise<ActionResult> {
  const auth = await assertRole(["admin"]);
  if ("error" in auth) return { ok: false, error: auth.error };
  if (userId === auth.profile.id) {
    return { ok: false, error: "אי אפשר לשנות את ההרשאה של עצמך" };
  }
  if (!["admin", "editor", "viewer"].includes(role)) {
    return { ok: false, error: "הרשאה לא תקינה" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "updated_user_role",
    "profile",
    userId,
    `הרשאת משתמש עודכנה ל-${role}`
  );
  return { ok: true, message: "ההרשאה עודכנה" };
}

export async function toggleUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const auth = await assertRole(["admin"]);
  if ("error" in auth) return { ok: false, error: auth.error };
  if (userId === auth.profile.id) {
    return { ok: false, error: "אי אפשר להשבית את המשתמש של עצמך" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    isActive ? "activated_user" : "deactivated_user",
    "profile",
    userId,
    isActive ? "משתמש הופעל" : "משתמש הושבת"
  );
  return { ok: true, message: isActive ? "המשתמש הופעל" : "המשתמש הושבת" };
}

/** הזמנת משתמש חדש — דורש SUPABASE_SERVICE_ROLE_KEY בצד השרת */
export async function inviteUser(email: string, role: Role): Promise<ActionResult> {
  const auth = await assertRole(["admin"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const adminClient = createAdminClient();
  if (!adminClient) {
    return {
      ok: false,
      error:
        "כדי להזמין משתמשים יש להגדיר SUPABASE_SERVICE_ROLE_KEY בקובץ ‎.env.local — או להוסיף משתמש ידנית ב-Supabase Dashboard → Authentication",
    };
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email);
  if (error) return { ok: false, error: `ההזמנה נכשלה: ${error.message}` };

  // הפרופיל נוצר אוטומטית ע"י הטריגר — נעדכן את ההרשאה המבוקשת
  if (data.user) {
    await adminClient.from("profiles").update({ role }).eq("id", data.user.id);
  }

  const supabase = await createServerClient();
  await logActivity(
    supabase,
    auth.profile.id,
    "invited_user",
    "profile",
    data.user?.id ?? null,
    `נשלחה הזמנה ל-${email}`
  );
  return { ok: true, message: `נשלחה הזמנה במייל ל-${email}` };
}
