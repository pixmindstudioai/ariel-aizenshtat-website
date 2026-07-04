"use server";

import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/admin/validation";
import type { ActionResult, MessageStatus } from "@/lib/types";
import { firstZodError, friendlyDbError, logActivity, orNull } from "./helpers";

/**
 * שליחת פנייה מטופס צור קשר — פעולה ציבורית, לא דורשת התחברות.
 * RLS מאפשר insert בלבד לציבור.
 */
export async function createContactMessage(input: ContactMessageInput): Promise<ActionResult> {
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const data = parsed.data;

  const supabase = createPublicClient();
  const { error } = await supabase.from("contact_messages").insert({
    full_name: data.full_name,
    email: data.email,
    phone: orNull(data.phone),
    project_type: orNull(data.project_type),
    message: data.message,
    source_page: orNull(data.source_page),
  });
  if (error) return { ok: false, error: "השליחה נכשלה, נסו שוב או כתבו לנו בוואטסאפ" };

  // TODO: התראת מייל על פנייה חדשה — לחבר Resend/Nodemailer כאן
  return { ok: true, message: "ההודעה נשלחה!" };
}

export async function updateMessageStatus(
  id: string,
  status: MessageStatus
): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, message: "סטטוס הפנייה עודכן" };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const auth = await assertRole(["admin"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(supabase, auth.profile.id, "deleted_message", "contact_message", id, "נמחקה פנייה");
  return { ok: true, message: "הפנייה נמחקה" };
}
