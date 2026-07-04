"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionTitle from "@/components/SectionTitle";
import { faqAssets } from "@/data/assets";
import { faq as localFaq, type FaqItem } from "@/data/faq";

interface FAQProps {
  /** שאלות מהדאטהבייס — ברירת מחדל: תוכן הדמו המקומי */
  items?: FaqItem[];
}

/** אקורדיון שאלות נפוצות עם הכרטיס הגרפי "שאלות נפוצות" ככותרת */
export default function FAQ({ items }: FAQProps) {
  const faq = items?.length ? items : localFaq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6" aria-labelledby="faq-title">
      <div id="faq-title">
        <SectionTitle
          title="שאלות נפוצות"
          badgeAsset={faqAssets.faqBadge}
          hideTextWhenBadge
          subtitle="כל מה ששואלים אותי לפני שמתחילים לעבוד יחד"
        />
      </div>
      <div className="mt-10 space-y-4">
        {faq.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.question} className="card-soft overflow-hidden !rounded-3xl">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right focus-visible:outline-3 focus-visible:outline-blue"
              >
                <span className="text-lg font-bold">{item.question}</span>
                <motion.span
                  aria-hidden
                  animate={{ rotate: open ? 45 : 0 }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue/10 text-xl font-bold text-blue"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="px-6 pb-6 leading-relaxed text-muted">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
