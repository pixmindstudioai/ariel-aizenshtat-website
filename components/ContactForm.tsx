"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AssetImage from "@/components/AssetImage";
import { icons, mascots } from "@/data/assets";
import { createContactMessage } from "@/lib/admin/actions/messages";

type Status = "idle" | "sending" | "sent" | "error";

const interests = [
  "אתר או דף נחיתה",
  "סרטון / פרסומת AI",
  "אוטומציה לעסק",
  "הרצאה או סדנה",
  "משהו אחר",
];

interface ContactFormProps {
  /** קישור וואטסאפ לגיבוי אם השליחה נכשלת */
  whatsappUrl?: string;
}

/** טופס יצירת קשר — שולח לטבלת contact_messages ב-Supabase */
export default function ContactForm({
  whatsappUrl = "https://wa.me/972534122548",
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [interest, setInterest] = useState(interests[0]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    const result = await createContactMessage({
      full_name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      project_type: interest,
      message: String(data.get("message") ?? ""),
      source_page: "/contact",
    });
    if (result.ok) {
      form.reset();
      setStatus("sent");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="card-soft relative overflow-hidden p-7 md:p-10">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-10 text-center"
            role="status"
          >
            <div className="w-28">
              <AssetImage asset={mascots.claudeHappy} decorative className="w-full h-auto" />
            </div>
            <h3 className="text-2xl font-black">ההודעה נשלחה!</h3>
            <p className="max-w-sm text-muted">
              תודה שכתבתם — אחזור אליכם תוך יום עבודה. בינתיים, אפשר להציץ בתיק
              העבודות או במדריכים.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="btn-secondary mt-2"
            >
              שליחת הודעה נוספת
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-bold">
                  שם מלא
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="ישראל ישראלי"
                  className="rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 outline-none transition-colors focus:border-blue"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="font-bold">
                  טלפון
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="050-0000000"
                  className="rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-right outline-none transition-colors focus:border-blue"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-bold">
                אימייל
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                dir="ltr"
                placeholder="you@example.com"
                className="rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-right outline-none transition-colors focus:border-blue"
              />
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 font-bold">מה מעניין אתכם?</legend>
              <div className="flex flex-wrap gap-2">
                {interests.map((item) => (
                  <label
                    key={item}
                    className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                      interest === item
                        ? "border-blue bg-blue/10 text-blue"
                        : "border-slate-100 bg-white text-muted hover:border-blue/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="interest"
                      value={item}
                      checked={interest === item}
                      onChange={() => setInterest(item)}
                      className="sr-only"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="font-bold">
                ספרו לי על הפרויקט
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="מה אתם רוצים לבנות? מה המטרה? כל פרט עוזר..."
                className="resize-none rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 outline-none transition-colors focus:border-blue"
              />
            </div>

            {status === "error" && (
              <p
                role="alert"
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                אופס — השליחה נכשלה. נסו שוב עוד רגע, או{" "}
                <a href={whatsappUrl} className="underline underline-offset-2">
                  כתבו לי ישירות בוואטסאפ
                </a>
                .
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary text-lg disabled:opacity-70"
            >
              {status === "sending" ? (
                "שולח..."
              ) : (
                <>
                  שליחת הודעה{" "}
                  <span
                    className="inline-block w-5 shrink-0 align-middle"
                    aria-hidden
                  >
                    <AssetImage
                      asset={icons.growth}
                      decorative
                      variant="flat"
                      className="w-full h-auto"
                    />
                  </span>
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
