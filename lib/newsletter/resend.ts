/**
 * חיבור ל-Resend — שליחת מיילים דרך ה-API הרשמי (בלי SDK).
 * צד שרת בלבד! המפתח נקרא מ-.env.local (resend_api_key / RESEND_API_KEY).
 */

const RESEND_API = "https://api.resend.com";

export function resendApiKey(): string | null {
  return process.env.RESEND_API_KEY ?? process.env.resend_api_key ?? null;
}

export function resendConfigured(): boolean {
  return !!resendApiKey();
}

/**
 * כתובת השולח. עד שמאמתים דומיין ב-Resend משתמשים בכתובת ה-sandbox —
 * שם אפשר לשלוח רק לכתובת המייל של בעל חשבון ה-Resend.
 * אחרי אימות דומיין: להגדיר resend_from ב-.env.local, למשל
 * resend_from="Ariel AI <newsletter@arielai.co.il>"
 */
export function resendFrom(): string {
  return (
    process.env.RESEND_FROM ??
    process.env.resend_from ??
    "Ariel AI <onboarding@resend.dev>"
  );
}

export function usingSandboxSender(): boolean {
  return resendFrom().includes("resend.dev");
}

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

interface SendResult {
  ok: boolean;
  error?: string;
}

/** שליחת מייל בודד */
export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const key = resendApiKey();
  if (!key) return { ok: false, error: "מפתח Resend לא מוגדר ב-.env.local (resend_api_key)" };

  try {
    const response = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom(),
        to: [email.to],
        subject: email.subject,
        html: email.html,
        headers: email.headers,
      }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      return { ok: false, error: body?.message ?? `Resend החזיר שגיאה ${response.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "החיבור ל-Resend נכשל — בדקו את חיבור האינטרנט" };
  }
}

export interface BatchOutcome {
  sent: number;
  failed: number;
  /** השגיאה הראשונה שהתקבלה — להצגה למשתמש */
  firstError?: string;
}

/**
 * שליחה מרובה דרך endpoint ה-batch של Resend (עד 100 מיילים לקריאה).
 * כל נמען מקבל HTML משלו (קישור הסרה אישי).
 */
export async function sendBatch(emails: OutgoingEmail[]): Promise<BatchOutcome> {
  const key = resendApiKey();
  if (!key) {
    return { sent: 0, failed: emails.length, firstError: "מפתח Resend לא מוגדר" };
  }

  const outcome: BatchOutcome = { sent: 0, failed: 0 };
  const from = resendFrom();

  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100);
    try {
      const response = await fetch(`${RESEND_API}/emails/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          chunk.map((email) => ({
            from,
            to: [email.to],
            subject: email.subject,
            html: email.html,
            headers: email.headers,
          }))
        ),
      });
      if (response.ok) {
        outcome.sent += chunk.length;
      } else {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        outcome.failed += chunk.length;
        outcome.firstError ??= body?.message ?? `Resend החזיר שגיאה ${response.status}`;
      }
    } catch {
      outcome.failed += chunk.length;
      outcome.firstError ??= "החיבור ל-Resend נכשל";
    }
    // הגבלת קצב עדינה בין צ'אנקים
    if (i + 100 < emails.length) await new Promise((r) => setTimeout(r, 600));
  }

  return outcome;
}
