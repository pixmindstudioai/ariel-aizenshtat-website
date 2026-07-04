"use server";

import { cookies } from "next/headers";
import { assertRole } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import {
  NEWSLETTER_COOKIE,
  NEWSLETTER_COOKIE_MAX_AGE,
  NEWSLETTER_COOKIE_VALUE,
} from "@/lib/newsletter/subscription";
import {
  newsletterSchema,
  subscriberSchema,
  type NewsletterInput,
} from "@/lib/admin/validation";
import { renderNewsletterEmail } from "@/lib/newsletter/render";
import { resendConfigured, sendBatch, sendEmail } from "@/lib/newsletter/resend";
import type { ActionResult, SubscriberRow } from "@/lib/types";
import { firstZodError, friendlyDbError, logActivity } from "./helpers";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const NO_RESEND_ERROR =
  "מפתח Resend לא מוגדר — הוסיפו resend_api_key לקובץ ‎.env.local והפעילו מחדש את השרת";

/* ===== ניהול גיליונות ===== */

export async function createNewsletter(
  input: NewsletterInput
): Promise<ActionResult<{ id: string }>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("newsletters")
    .insert({
      subject: parsed.data.subject,
      preheader: parsed.data.preheader,
      content: parsed.data.content,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "created_newsletter",
    "newsletter",
    data.id,
    `נוצר ניוזלטר: ${parsed.data.subject}`
  );
  return { ok: true, data: { id: data.id }, message: "הניוזלטר נשמר כטיוטה" };
}

export async function updateNewsletter(
  id: string,
  input: NewsletterInput
): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("newsletters")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "הניוזלטר לא נמצא" };
  if (existing.status === "sent") {
    return { ok: false, error: "הניוזלטר הזה כבר נשלח — אי אפשר לערוך אותו. שכפלו אותו לגיליון חדש" };
  }

  const { error } = await supabase
    .from("newsletters")
    .update({
      subject: parsed.data.subject,
      preheader: parsed.data.preheader,
      content: parsed.data.content,
    })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "updated_newsletter",
    "newsletter",
    id,
    `עודכן ניוזלטר: ${parsed.data.subject}`
  );
  return { ok: true, message: "הניוזלטר נשמר" };
}

export async function duplicateNewsletter(id: string): Promise<ActionResult<{ id: string }>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data: source } = await supabase
    .from("newsletters")
    .select("subject, preheader, content")
    .eq("id", id)
    .maybeSingle();
  if (!source) return { ok: false, error: "הניוזלטר לא נמצא" };

  const { data, error } = await supabase
    .from("newsletters")
    .insert({
      subject: `${source.subject} (עותק)`,
      preheader: source.preheader,
      content: source.content,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, data: { id: data.id }, message: "נוצר עותק חדש כטיוטה" };
}

export async function deleteNewsletter(id: string): Promise<ActionResult> {
  const auth = await assertRole(["admin"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("newsletters")
    .select("subject")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "הניוזלטר לא נמצא" };

  const { error } = await supabase.from("newsletters").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };

  await logActivity(
    supabase,
    auth.profile.id,
    "deleted_newsletter",
    "newsletter",
    id,
    `נמחק ניוזלטר: ${existing.subject}`
  );
  return { ok: true, message: "הניוזלטר נמחק" };
}

/* ===== שליחה ===== */

/** שליחת מייל בדיקה — לכתובת שתבחרו, בלי לגעת ברשימת התפוצה */
export async function sendTestNewsletter(id: string, toEmail: string): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!resendConfigured()) return { ok: false, error: NO_RESEND_ERROR };

  const target = subscriberSchema.safeParse({ email: toEmail });
  if (!target.success) return { ok: false, error: "כתובת המייל לבדיקה לא תקינה" };

  const supabase = await createServerClient();
  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!newsletter) return { ok: false, error: "הניוזלטר לא נמצא" };

  const { data: settings } = await supabase.from("site_settings").select("site_name").maybeSingle();

  const html = renderNewsletterEmail({
    subject: newsletter.subject,
    preheader: newsletter.preheader,
    content: newsletter.content,
    siteName: settings?.site_name ?? "Ariel AI",
    siteUrl: siteUrl(),
    unsubscribeUrl: null,
  });

  const result = await sendEmail({
    to: target.data.email,
    subject: `[בדיקה] ${newsletter.subject}`,
    html,
  });
  if (!result.ok) return { ok: false, error: result.error ?? "השליחה נכשלה" };
  return { ok: true, message: `מייל בדיקה נשלח ל-${target.data.email}` };
}

/** שליחת הניוזלטר לכל הנרשמים הפעילים */
export async function sendNewsletter(id: string): Promise<ActionResult<{ sent: number; failed: number }>> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!resendConfigured()) return { ok: false, error: NO_RESEND_ERROR };

  const supabase = await createServerClient();
  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!newsletter) return { ok: false, error: "הניוזלטר לא נמצא" };
  if (newsletter.status === "sent") return { ok: false, error: "הניוזלטר הזה כבר נשלח" };
  if (newsletter.status === "sending")
    return { ok: false, error: "הניוזלטר כבר בתהליך שליחה — רגע של סבלנות" };

  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .eq("status", "subscribed");
  const list = (subscribers ?? []) as SubscriberRow[];
  if (list.length === 0) {
    return { ok: false, error: "אין עדיין נרשמים פעילים — הוסיפו נרשמים או חכו להרשמות מהאתר" };
  }

  // נעילה נגד שליחה כפולה
  const { error: lockError } = await supabase
    .from("newsletters")
    .update({ status: "sending" })
    .eq("id", id)
    .eq("status", "draft");
  if (lockError) return { ok: false, error: friendlyDbError(lockError) };

  const { data: settings } = await supabase.from("site_settings").select("site_name").maybeSingle();
  const siteName = settings?.site_name ?? "Ariel AI";
  const base = siteUrl();

  const emails = list.map((subscriber) => {
    const unsubscribeUrl = `${base}/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;
    return {
      to: subscriber.email,
      subject: newsletter.subject,
      html: renderNewsletterEmail({
        subject: newsletter.subject,
        preheader: newsletter.preheader,
        content: newsletter.content,
        siteName,
        siteUrl: base,
        unsubscribeUrl,
      }),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  });

  const outcome = await sendBatch(emails);

  const allFailed = outcome.sent === 0;
  await supabase
    .from("newsletters")
    .update(
      allFailed
        ? { status: "draft", sent_count: 0, fail_count: outcome.failed }
        : {
            status: "sent",
            sent_at: new Date().toISOString(),
            sent_count: outcome.sent,
            fail_count: outcome.failed,
          }
    )
    .eq("id", id);

  if (allFailed) {
    return {
      ok: false,
      error: `השליחה נכשלה: ${outcome.firstError ?? "שגיאה לא ידועה"}. הניוזלטר חזר לטיוטה`,
    };
  }

  await logActivity(
    supabase,
    auth.profile.id,
    "sent_newsletter",
    "newsletter",
    id,
    `נשלח ניוזלטר "${newsletter.subject}" ל-${outcome.sent} נרשמים`
  );

  return {
    ok: true,
    data: { sent: outcome.sent, failed: outcome.failed },
    message:
      outcome.failed > 0
        ? `נשלח ל-${outcome.sent} נרשמים (${outcome.failed} נכשלו: ${outcome.firstError ?? ""})`
        : `הניוזלטר נשלח ל-${outcome.sent} נרשמים`,
  };
}

/* ===== ניהול נרשמים ===== */

export async function addSubscriber(email: string, fullName: string): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = subscriberSchema.safeParse({ email, full_name: fullName });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const supabase = await createServerClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email: parsed.data.email.toLowerCase().trim(),
      full_name: parsed.data.full_name,
      status: "subscribed",
      unsubscribed_at: null,
      source: "admin",
    },
    { onConflict: "email" }
  );
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, message: "הנרשם נוסף לרשימת התפוצה" };
}

export async function setSubscriberStatus(
  id: string,
  status: "subscribed" | "unsubscribed"
): Promise<ActionResult> {
  const auth = await assertRole(["admin", "editor"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({
      status,
      unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, message: status === "subscribed" ? "המנוי חודש" : "הנרשם הוסר מהתפוצה" };
}

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  const auth = await assertRole(["admin"]);
  if ("error" in auth) return { ok: false, error: auth.error };

  const supabase = await createServerClient();
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, message: "הנרשם נמחק לצמיתות" };
}

/* ===== פעולות ציבוריות (טופס ההרשמה באתר) ===== */

/** הרשמה לניוזלטר מהאתר — עוברת דרך RPC מאובטח, בלי גישה ישירה לטבלה */
export async function subscribeToNewsletter(
  email: string,
  fullName?: string
): Promise<ActionResult> {
  const parsed = subscriberSchema.safeParse({ email, full_name: fullName ?? "" });
  if (!parsed.success) return { ok: false, error: "כתובת המייל לא נראית תקינה" };

  const supabase = createPublicClient();
  const { error } = await supabase.rpc("newsletter_subscribe", {
    p_email: parsed.data.email,
    p_name: parsed.data.full_name,
  });
  if (error) {
    return { ok: false, error: "ההרשמה נכשלה — נסו שוב עוד רגע" };
  }
  return { ok: true, message: "נרשמתם! הגיליון הבא כבר בדרך אליכם 🎉" };
}
