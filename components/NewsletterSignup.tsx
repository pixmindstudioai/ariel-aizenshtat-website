"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AssetImage from "@/components/AssetImage";
import FloatingSticker from "@/components/FloatingSticker";
import Reveal from "@/components/Reveal";
import { subscribeToNewsletter } from "@/lib/admin/actions/newsletter";
import { newsletterAssets } from "@/data/newsletterAssets";

type Status = "idle" | "sending" | "done";

/** אזור ההרשמה לניוזלטר באתר הציבורי — באנר ממוקד, צר וממורכז */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const result = await subscribeToNewsletter(email, name);
    if (result.ok) {
      setStatus("done");
    } else {
      setError(result.error);
      setStatus("idle");
    }
  };

  return (
    <section
      className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="newsletter-title"
    >
      <Reveal>
        <div className="card-soft relative mx-auto max-w-2xl overflow-hidden px-6 py-10 md:px-12 md:py-12">
          {/* רקע עדין בתחתית הכרטיס */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_100%,rgba(79,123,255,0.08),transparent)]"
          />
          {/* קישוט יחיד: המעטפה החמודה בפינה */}
          <FloatingSticker
            className="pointer-events-none absolute -left-5 -bottom-3 hidden w-24 md:block lg:w-28"
            duration={5.5}
          >
            <AssetImage
              asset={newsletterAssets.envelopeCute}
              decorative
              className="w-full h-auto"
            />
          </FloatingSticker>

          <div className="relative flex flex-col items-center gap-4 text-center">
            <h2 id="newsletter-title" className="sr-only-visual">
              הצטרפו לניוזלטר — עדכונים, כלים ותובנות במקום אחד
            </h2>
            <div className="w-40 md:w-48">
              <AssetImage
                asset={newsletterAssets.titleMain}
                decorative
                className="w-full h-auto"
                sizes="192px"
              />
            </div>

            <AnimatePresence mode="wait">
              {status === "done" ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3 py-2"
                  role="status"
                >
                  <div className="w-28">
                    <AssetImage
                      asset={newsletterAssets.envelopeOpen}
                      decorative
                      className="w-full h-auto"
                    />
                  </div>
                  <h3 className="text-2xl font-black">נרשמתם! 🎉</h3>
                  <p className="max-w-sm text-muted">
                    הגיליון הבא כבר בדרך לתיבה שלכם — שווה להוסיף אותנו לאנשי
                    הקשר כדי שלא ניפול לספאם.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="flex w-full flex-col items-center gap-4"
                >
                  <p className="max-w-md leading-relaxed text-muted">
                    פעם בשבוע, ישר למייל: כלים חדשים ששווה להכיר, פרומפטים
                    מוכנים לעבודה ותובנות מהשטח — בעברית ובלי חפירות.
                  </p>

                  {/* שורת אימייל + כפתור: הלב של הבאנר */}
                  <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
                    <label htmlFor="newsletter-email" className="sr-only-visual">
                      אימייל
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      dir="ltr"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full min-w-0 flex-1 rounded-full border-2 border-slate-100 bg-white px-5 py-3 text-right outline-none transition-colors focus:border-blue"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "sending"}
                    />
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="btn-primary shrink-0 disabled:opacity-60"
                    >
                      {status === "sending" ? "נרשמים..." : "הרשמו עכשיו"}
                    </button>
                  </div>

                  {/* שדה שם קטן ומשני */}
                  <div className="w-full max-w-lg">
                    <label htmlFor="newsletter-name" className="sr-only-visual">
                      שם
                    </label>
                    <input
                      id="newsletter-name"
                      autoComplete="name"
                      placeholder="איך קוראים לך? (לא חובה)"
                      className="mx-auto block w-full max-w-xs rounded-full border-2 border-slate-100 bg-white px-4 py-2 text-center text-sm outline-none transition-colors focus:border-blue"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={status === "sending"}
                    />
                  </div>

                  {error && (
                    <p role="alert" className="text-sm font-bold text-red-600">
                      {error}
                    </p>
                  )}

                  <p className="text-xs text-muted">
                    בלי ספאם. אפשר להסיר את עצמכם בלחיצה אחת מכל מייל.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
