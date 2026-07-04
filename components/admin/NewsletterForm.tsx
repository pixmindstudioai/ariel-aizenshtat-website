"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterInput } from "@/lib/admin/validation";
import {
  createNewsletter,
  sendNewsletter,
  sendTestNewsletter,
  updateNewsletter,
} from "@/lib/admin/actions/newsletter";
import { renderNewsletterEmail } from "@/lib/newsletter/render";
import type { AssetDef } from "@/data/assets";
import type { NewsletterRow } from "@/lib/types";
import AdminCard from "@/components/admin/AdminCard";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminRichTextEditor from "@/components/admin/AdminRichTextEditor";
import AssetImage from "@/components/AssetImage";
import { useToast } from "@/components/admin/AdminToast";
import { newsletterAssets } from "@/data/newsletterAssets";

interface NewsletterFormProps {
  newsletter?: NewsletterRow;
  /** מספר הנרשמים הפעילים — לאישור לפני שליחה */
  subscriberCount: number;
  /** כתובת ברירת המחדל למייל בדיקה (המייל של המשתמש המחובר) */
  defaultTestEmail: string;
  siteName: string;
  siteUrl: string;
}

/** אייקון מדבקה קטן בתוך כפתור — במקום אימוג'י */
function BtnIcon({ asset }: { asset: AssetDef }) {
  return (
    <span className="inline-block w-5 shrink-0" aria-hidden>
      <AssetImage asset={asset} decorative variant="flat" className="w-full h-auto" />
    </span>
  );
}

/** עורך ניוזלטר: נושא, תקציר, תוכן — עם תצוגה מקדימה חיה של המייל */
export default function NewsletterForm({
  newsletter,
  subscriberCount,
  defaultTestEmail,
  siteName,
  siteUrl,
}: NewsletterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!newsletter;
  const isSent = newsletter?.status === "sent";

  const [testEmail, setTestEmail] = useState(defaultTestEmail);
  const [confirmSend, setConfirmSend] = useState(false);
  const [busy, setBusy] = useState<"test" | "send" | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema) as never,
    defaultValues: {
      subject: newsletter?.subject ?? "",
      preheader: newsletter?.preheader ?? "",
      content: newsletter?.content ?? "",
    },
    mode: "onBlur",
  });

  const subject = watch("subject") ?? "";
  const preheader = watch("preheader") ?? "";
  const content = watch("content") ?? "";

  // תצוגה מקדימה חיה — אותו רנדור בדיוק כמו המייל שיישלח
  const previewHtml = useMemo(
    () =>
      renderNewsletterEmail({
        subject: subject || "נושא המייל",
        preheader,
        content: content || "כאן יופיע תוכן הניוזלטר...",
        siteName,
        siteUrl,
        unsubscribeUrl: `${siteUrl}/newsletter/unsubscribe?token=preview`,
      }),
    [subject, preheader, content, siteName, siteUrl]
  );

  const save = async (): Promise<string | null> => {
    let savedId: string | null = newsletter?.id ?? null;
    await handleSubmit(async () => {
      const values = getValues();
      if (isEdit) {
        const result = await updateNewsletter(newsletter.id, values);
        if (!result.ok) {
          toast(result.error, "error");
          savedId = null;
          return;
        }
        toast(result.message ?? "נשמר");
      } else {
        const result = await createNewsletter(values);
        if (!result.ok || !result.data) {
          toast(!result.ok ? result.error : "השמירה נכשלה", "error");
          savedId = null;
          return;
        }
        savedId = result.data.id;
        toast(result.message ?? "נשמר");
        router.push(`/admin/newsletter/${result.data.id}`);
      }
      router.refresh();
    })();
    return savedId;
  };

  const handleTest = async () => {
    setBusy("test");
    const id = await save();
    if (id) {
      const result = await sendTestNewsletter(id, testEmail);
      toast(result.ok ? (result.message ?? "נשלח") : result.error, result.ok ? "success" : "error");
    }
    setBusy(null);
  };

  const handleSendAll = async () => {
    setBusy("send");
    const id = await save();
    if (!id) {
      setBusy(null);
      setConfirmSend(false);
      return;
    }
    const result = await sendNewsletter(id);
    if (result.ok) {
      toast(result.message ?? "נשלח לכל הנרשמים");
      setConfirmSend(false);
      router.refresh();
    } else {
      toast(result.error, "error");
      setConfirmSend(false);
    }
    setBusy(null);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 xl:grid-cols-2">
      {/* עמודת עריכה */}
      <div className="flex flex-col gap-6">
        <AdminCard title="פרטי הגיליון" icon={newsletterAssets.envelopeCute}>
          <div className="flex flex-col gap-4">
            <AdminFormField label="נושא המייל" htmlFor="subject" error={errors.subject?.message} required>
              <input
                id="subject"
                className="admin-input"
                aria-invalid={!!errors.subject}
                disabled={isSent}
                {...register("subject")}
                placeholder="למשל: 5 כלים חדשים ששווה להכיר השבוע"
              />
            </AdminFormField>
            <AdminFormField
              label="שורת תקציר (Preheader)"
              htmlFor="preheader"
              error={errors.preheader?.message}
              hint="הטקסט שמופיע ליד הנושא בתיבת הדואר — עד 150 תווים"
            >
              <input
                id="preheader"
                className="admin-input"
                disabled={isSent}
                {...register("preheader")}
              />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="תוכן הגיליון" icon={newsletterAssets.decoSet}>
          <AdminRichTextEditor
            label="מה מספרים החודש?"
            value={content}
            onChange={(v) => setValue("content", v, { shouldValidate: true })}
            error={errors.content?.message}
            rows={14}
          />
        </AdminCard>

        {!isSent && (
          <AdminCard title="שמירה ושליחה" icon={newsletterAssets.decoFlow}>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => save()}
                disabled={isSubmitting || busy !== null}
                className="btn-admin-primary"
              >
                {isSubmitting && busy === null ? (
                  "שומר..."
                ) : (
                  <>
                    <BtnIcon asset={newsletterAssets.envelopeCute} />
                    שמירת טיוטה
                  </>
                )}
              </button>

              <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4">
                <label htmlFor="test-email" className="text-sm font-bold">
                  מייל בדיקה — רואים איך זה נראה לפני שכולם רואים
                </label>
                <div className="flex gap-2">
                  <input
                    id="test-email"
                    type="email"
                    dir="ltr"
                    className="admin-input text-left"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={busy !== null || !testEmail}
                    className="btn-admin-secondary shrink-0 !px-4 text-sm"
                  >
                    {busy === "test" ? (
                      "שולח..."
                    ) : (
                      <>
                        <BtnIcon asset={newsletterAssets.decoFlow} />
                        שלח בדיקה
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setConfirmSend(true)}
                  disabled={busy !== null || subscriberCount === 0}
                  className="btn-admin-primary !py-3 text-base"
                >
                  {busy === "send" ? (
                    "שולח לכולם..."
                  ) : (
                    <>
                      <BtnIcon asset={newsletterAssets.decoFlow} />
                      שליחה לכל הנרשמים
                    </>
                  )}
                </button>
                <span className="text-center text-sm font-bold text-muted">
                  {subscriberCount === 0
                    ? "אין עדיין נרשמים לשליחה"
                    : `${subscriberCount} נרשמים פעילים ברשימת התפוצה`}
                </span>
              </div>

              <Link
                href="/admin/newsletter"
                className="text-center text-sm font-bold text-muted hover:text-ink"
              >
                חזרה לרשימת הגיליונות
              </Link>
            </div>
          </AdminCard>
        )}

        {isSent && (
          <AdminCard className="!p-5">
            <div className="flex items-center gap-4">
              <div className="w-24 shrink-0">
                <AssetImage
                  asset={newsletterAssets.envelopeOpen}
                  decorative
                  variant="sticker-sm"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm leading-relaxed text-muted">
                הגיליון הזה כבר נשלח ל-<b>{newsletter?.sent_count}</b> נרשמים
                {newsletter?.fail_count ? ` (${newsletter.fail_count} נכשלו)` : ""} — ולכן הוא
                נעול לעריכה. רוצים לשלוח גרסה חדשה? שכפלו אותו מרשימת הגיליונות.
              </p>
            </div>
          </AdminCard>
        )}
      </div>

      {/* עמודת תצוגה מקדימה */}
      <div className="flex flex-col gap-3">
        <AdminCard
          title="ככה זה ייראה בתיבת המייל"
          icon={newsletterAssets.envelopeOpen}
          className="!p-4"
        >
          <iframe
            srcDoc={previewHtml}
            title="תצוגה מקדימה של הניוזלטר"
            sandbox=""
            className="h-[720px] w-full rounded-2xl border border-slate-100 bg-[#f8faff]"
          />
        </AdminCard>
      </div>

      <AdminConfirmModal
        open={confirmSend}
        title={`לשלוח ל-${subscriberCount} נרשמים?`}
        description={`"${subject || "הניוזלטר"}" יישלח עכשיו לכל רשימת התפוצה. אי אפשר לבטל שליחה אחרי שהיא יוצאת.`}
        confirmLabel={
          busy === "send" ? (
            "שולח..."
          ) : (
            <>
              <BtnIcon asset={newsletterAssets.decoFlow} />
              שליחה לכולם
            </>
          )
        }
        pending={busy === "send"}
        onConfirm={handleSendAll}
        onCancel={() => setConfirmSend(false)}
      />
    </form>
  );
}
