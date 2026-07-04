export interface Service {
  slug: string;
  title: string;
  description: string;
  href: string;
  /** מפתח האסט הגרפי המרכזי של הכרטיס (מתוך data/assets.ts) */
  accent: "blue" | "purple" | "pink" | "coral";
  bullets: string[];
}

export const services: Service[] = [
  {
    slug: "video",
    title: "פרויקטי וידאו",
    description:
      "פרסומות AI, סרטוני תדמית וקליפים שיווקיים שנוצרים במהירות של רעיון — ובאיכות של הפקה.",
    href: "/portfolio/video",
    accent: "coral",
    bullets: ["פרסומות AI לעסקים", "סרטוני מוצר ותדמית", "תוכן קצר לרשתות"],
  },
  {
    slug: "websites",
    title: "אתרים ודפי נחיתה",
    description:
      "אתרים מהירים, מדויקים וממירים — מדף נחיתה אחד ועד אתר תדמית מלא, בעברית וב-RTL אמיתי.",
    href: "/portfolio/websites",
    accent: "blue",
    bullets: ["דפי נחיתה ממירים", "אתרי תדמית", "חנויות ומערכות"],
  },
  {
    slug: "written-guides",
    title: "מדריכים כתובים",
    description:
      "מדריכים מעשיים בעברית פשוטה: כלים, תהליכים וטריקים של AI שאפשר ליישם עוד היום.",
    href: "/guides",
    accent: "purple",
    bullets: ["מדריכי כלים צעד-אחר-צעד", "תבניות מוכנות לעבודה", "טיפים מהשטח"],
  },
  {
    slug: "video-guides",
    title: "מדריכי וידאו",
    description:
      "סרטוני הדרכה קצרים וממוקדים שמראים בדיוק איך זה נעשה — בלי בלבול ובלי חפירות.",
    href: "/video-guides",
    accent: "pink",
    bullets: ["הדרכות מסך מלאות", "סדנאות מוקלטות", "סדרות לימוד מסודרות"],
  },
];
