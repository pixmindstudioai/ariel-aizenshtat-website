/** יצירת slug נקי באנגלית — כולל תעתיק בסיסי מעברית */

const HEBREW_MAP: Record<string, string> = {
  א: "a",
  ב: "b",
  ג: "g",
  ד: "d",
  ה: "h",
  ו: "v",
  ז: "z",
  ח: "ch",
  ט: "t",
  י: "y",
  כ: "k",
  ך: "k",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  ע: "a",
  פ: "p",
  ף: "f",
  צ: "ts",
  ץ: "ts",
  ק: "k",
  ר: "r",
  ש: "sh",
  ת: "t",
};

export function slugify(input: string): string {
  const transliterated = input
    .split("")
    .map((ch) => HEBREW_MAP[ch] ?? ch)
    .join("");

  return transliterated
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
