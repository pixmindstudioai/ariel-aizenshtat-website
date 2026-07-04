"use client";

/* eslint-disable @next/next/no-img-element -- תמונות תוכן חופשיות מהאדמין, בממדים לא ידועים */

import { useEffect, useState } from "react";

interface ContentImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * תצוגת תמונה מותאמת לעיצוב האתר: מסגרת מעוגלת עם צל רך,
 * ולחיצה פותחת לייטבוקס (תצוגה מוגדלת) עם כיתוב. Escape / לחיצה — סוגרים.
 */
export default function ContentImage({ src, alt, className = "" }: ContentImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `הגדלת התמונה: ${alt}` : "הגדלת התמונה"}
        className={`group block w-full overflow-hidden rounded-3xl shadow-[0_14px_35px_rgba(15,23,42,0.12)] focus-visible:outline-3 focus-visible:outline-blue focus-visible:outline-offset-2 ${className}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "תצוגת תמונה מוגדלת"}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[95] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm"
        >
          <figure className="flex max-h-full max-w-5xl flex-col items-center gap-3">
            <img
              src={src}
              alt={alt}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl"
            />
            {alt && <figcaption className="text-center text-sm font-semibold text-white/85">{alt}</figcaption>}
          </figure>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="סגירת התצוגה המוגדלת"
            className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl font-black text-white transition-colors hover:bg-white/30"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
