export interface Guide {
  slug: string;
  title: string;
  description: string;
  tag: string;
  readingTime: number; // דקות
  date: string; // ISO
  isNew?: boolean;
  level: "מתחילים" | "בינוני" | "מתקדמים";
}

export const guides: Guide[] = [
  {
    slug: "claude-code-first-site",
    title: "בונים אתר ראשון עם Claude Code",
    description:
      "מדריך צעד-אחר-צעד: מהתקנה ועד אתר חי באוויר — בלי ניסיון קודם בתכנות, רק עם הנחיות נכונות.",
    tag: "Claude Code",
    readingTime: 12,
    date: "2026-06-20",
    isNew: true,
    level: "מתחילים",
  },
  {
    slug: "prompt-writing-hebrew",
    title: "כתיבת פרומפטים שעובדים — בעברית",
    description:
      "העקרונות שהופכים פרומפט בינוני לפרומפט מדויק: מבנה, הקשר, דוגמאות, ומה לעשות כשהתוצאה לא טובה.",
    tag: "פרומפטינג",
    readingTime: 8,
    date: "2026-05-14",
    isNew: true,
    level: "מתחילים",
  },
  {
    slug: "ai-video-workflow",
    title: "פס ייצור לסרטון AI מקצועי",
    description:
      "מרעיון לתוצר: איך משלבים כלי תמונה, וידאו וסאונד לתהליך אחד שמפיק סרטון שלם ביום עבודה.",
    tag: "וידאו AI",
    readingTime: 15,
    date: "2026-04-02",
    level: "בינוני",
  },
  {
    slug: "landing-page-checklist",
    title: "צ'קליסט דף נחיתה ממיר",
    description:
      "23 בדיקות שכל דף נחיתה חייב לעבור לפני עלייה לאוויר: כותרות, מהירות, טפסים, מובייל ואמון.",
    tag: "שיווק",
    readingTime: 10,
    date: "2026-03-18",
    level: "מתחילים",
  },
  {
    slug: "automation-map",
    title: "ממפים את העסק לאוטומציות",
    description:
      "שיטה פשוטה לזהות אילו תהליכים בעסק שווה להפוך לאוטומטיים קודם — ואיך למדוד שזה באמת חוסך.",
    tag: "אוטומציות",
    readingTime: 9,
    date: "2026-02-09",
    level: "בינוני",
  },
  {
    slug: "mcp-advanced",
    title: "חיבור כלים חיצוניים ל-AI עם MCP",
    description:
      "איך נותנים למודל גישה בטוחה למערכות שלכם: מסדי נתונים, קבצים ו-API — עם דוגמאות קוד מלאות.",
    tag: "מתקדם",
    readingTime: 18,
    date: "2026-01-22",
    level: "מתקדמים",
  },
];
