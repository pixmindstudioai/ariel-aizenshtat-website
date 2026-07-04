"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

export async function signIn(email: string, password: string): Promise<ActionResult> {
  if (!email || !password) return { ok: false, error: "יש למלא אימייל וסיסמה" };

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "אימייל או סיסמה שגויים" };
  }

  // בדיקת פרופיל פעיל — משתמש מושבת לא נכנס
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    return { ok: false, error: "המשתמש הזה הושבת — פנו למנהל האתר" };
  }

  return { ok: true };
}

export async function signOut(): Promise<never> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
