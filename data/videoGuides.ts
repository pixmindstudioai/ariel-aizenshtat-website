export interface VideoGuide {
  slug: string;
  title: string;
  description: string;
  duration: string; // "12:30"
  tag: string;
  isNew?: boolean;
  level: "מתחילים" | "בינוני" | "מתקדמים";
  gradient: string;
  /** תמונת Thumbnail מהדאטהבייס — מוצגת מעל הגרדיאנט כשקיימת */
  thumbnail?: string;
}

export const videoGuides: VideoGuide[] = [
  {
    slug: "claude-code-live-build",
    title: "בנייה חיה: אתר שלם בשעה עם Claude Code",
    description:
      "צפו בתהליך המלא בזמן אמת — מתיקייה ריקה ועד אתר עובד, כולל כל הטעויות והתיקונים בדרך.",
    duration: "58:20",
    tag: "Claude Code",
    isNew: true,
    level: "מתחילים",
    gradient: "from-[#4f7bff] to-[#7c5cff]",
  },
  {
    slug: "ai-ad-30-min",
    title: "פרסומת AI ב-30 דקות",
    description:
      "מבריף של לקוח ועד פרסומת מוכנה לפרסום: תסריט, תמונות, וידאו, קריינות ועריכה — הכל עם AI.",
    duration: "31:45",
    tag: "וידאו AI",
    isNew: true,
    level: "בינוני",
    gradient: "from-[#ff7ac8] to-[#e77455]",
  },
  {
    slug: "automation-whatsapp",
    title: "אוטומציית וואטסאפ ראשונה שלכם",
    description:
      "מקימים יחד בוט מענה אוטומטי לעסק: חיבור למספר, תרחישי שיחה, והעברה חכמה לנציג אנושי.",
    duration: "24:10",
    tag: "אוטומציות",
    level: "מתחילים",
    gradient: "from-[#22c55e] to-[#0ea5e9]",
  },
  {
    slug: "prompt-masterclass",
    title: "מאסטרקלאס פרומפטינג",
    description:
      "שעה וחצי של עומק: איך חושבים מודלים, למה פרומפטים נכשלים, ואיך בונים ספריית פרומפטים לעסק.",
    duration: "1:28:00",
    tag: "פרומפטינג",
    level: "מתקדמים",
    gradient: "from-[#7c5cff] to-[#ff7ac8]",
  },
  {
    slug: "landing-page-design",
    title: "מעצבים דף נחיתה שמוכר",
    description:
      "עקרונות עיצוב להמרות בפועל: היררכיה, צבע, טיפוגרפיה עברית, ומה ההבדל בין יפה לממיר.",
    duration: "42:35",
    tag: "עיצוב",
    level: "בינוני",
    gradient: "from-[#f59e0b] to-[#e77455]",
  },
  {
    slug: "content-system",
    title: "מערכת תוכן אוטומטית ליוצרים",
    description:
      "איך פוסט אחד הופך לשבוע שלם של תוכן: המערכת המלאה שאני משתמש בה, שלב אחרי שלב.",
    duration: "36:50",
    tag: "תוכן",
    level: "בינוני",
    gradient: "from-[#0ea5e9] to-[#22d3ee]",
  },
];
