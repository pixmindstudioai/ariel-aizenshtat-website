export type ProjectCategory = "video" | "websites" | "automation";

export interface Project {
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  /** שם הקטגוריה מהדאטהבייס — מחליף את התווית הסטטית כשקיים */
  categoryLabel?: string;
  tags: string[];
  year: number;
  client?: string;
  /** גרדיאנט רקע לכרטיס (מחליף תמונת פרויקט עד שיהיו צילומי מסך אמיתיים) */
  gradient: string;
  featured?: boolean;
  isNew?: boolean;
  result?: string;
  /** תמונת קאבר מהדאטהבייס — מחליפה את הגרדיאנט כשקיימת */
  coverImage?: string;
}

export const categoryLabels: Record<ProjectCategory, string> = {
  video: "פרויקטי וידאו",
  websites: "אתרים ודפי נחיתה",
  automation: "אוטומציות וכלים דיגיטליים",
};

export const projects: Project[] = [
  /* ===== פרויקטי וידאו ===== */
  {
    slug: "ai-ad-fashion",
    title: "פרסומת AI למותג אופנה",
    description:
      "פרסומת מלאה שנוצרה בבינה מלאכותית — מקונספט ותסריט ועד עריכה וסאונד. 30 שניות של וואו לקמפיין השקה.",
    category: "video",
    tags: ["פרסומת AI", "Seedance", "עריכה"],
    year: 2026,
    client: "מותג אופנה ישראלי",
    gradient: "from-[#ff7ac8] to-[#7c5cff]",
    featured: true,
    isNew: true,
    result: "פי 3 יותר קליקים מהפרסומת הקודמת של המותג",
  },
  {
    slug: "product-launch-video",
    title: "סרטון השקה למוצר טכנולוגי",
    description:
      "סרטון מוצר תלת-ממדי עם מושן גרפיקס, שהפך מסמך אפיון יבש לסיפור ויזואלי שמוכר את החזון.",
    category: "video",
    tags: ["מושן גרפיקס", "3D", "השקה"],
    year: 2026,
    client: "סטארטאפ SaaS",
    gradient: "from-[#4f7bff] to-[#7c5cff]",
    featured: true,
    result: "הוצג בכנס ההשקה מול 2,000 משתתפים",
  },
  {
    slug: "social-series",
    title: "סדרת סרטוני רשת חודשית",
    description:
      "ליווי חודשי של יוצר תוכן: 12 סרטונים קצרים בחודש, כולל תסריט, קריינות AI ועריכה בקצב של טרנדים.",
    category: "video",
    tags: ["רילס", "תוכן שוטף", "קריינות AI"],
    year: 2025,
    gradient: "from-[#e77455] to-[#ff7ac8]",
    result: "צמיחה של 40K עוקבים בחצי שנה",
  },
  {
    slug: "explainer-fintech",
    title: "סרטון הסבר לאפליקציית פינטק",
    description:
      "אנימציית הסבר של 60 שניות שמפשטת מוצר פיננסי מורכב לשפה שכל משתמש מבין.",
    category: "video",
    tags: ["אנימציה", "Explainer", "UX"],
    year: 2025,
    client: "חברת פינטק",
    gradient: "from-[#7c5cff] to-[#4f7bff]",
  },

  /* ===== אתרים ודפי נחיתה ===== */
  {
    slug: "landing-workshop",
    title: "דף נחיתה לסדנת AI",
    description:
      "דף נחיתה ממיר לסדנה בתשלום: כתיבה שיווקית, עיצוב, טופס הרשמה ואינטגרציה מלאה לתשלומים.",
    category: "websites",
    tags: ["דף נחיתה", "המרות", "Next.js"],
    year: 2026,
    gradient: "from-[#4f7bff] to-[#22d3ee]",
    featured: true,
    isNew: true,
    result: "18% יחס המרה בקמפיין הראשון",
  },
  {
    slug: "studio-site",
    title: "אתר תדמית לסטודיו קריאייטיב",
    description:
      "אתר תדמית מלא עם גלריית עבודות, אנימציות עדינות וטעינה מהירה — בנוי להרשים ולהישאר קליל.",
    category: "websites",
    tags: ["אתר תדמית", "אנימציות", "SEO"],
    year: 2026,
    client: "סטודיו לעיצוב",
    gradient: "from-[#7c5cff] to-[#ff7ac8]",
    featured: true,
  },
  {
    slug: "ecommerce-brand",
    title: "חנות אונליין למותג מקומי",
    description:
      "חנות מלאה עם ניהול מלאי, עמודי מוצר ממירים וחוויית קנייה מהירה במובייל.",
    category: "websites",
    tags: ["איקומרס", "מובייל", "תשלומים"],
    year: 2025,
    gradient: "from-[#22c55e] to-[#4f7bff]",
    result: "זמן טעינה מתחת לשנייה בכל עמוד",
  },
  {
    slug: "lecturer-site",
    title: "אתר אישי למרצה ויועץ",
    description:
      "כרטיס ביקור דיגיטלי חכם: אודות, הרצאות, טופס לידים ובלוג — הכל מתעדכן בקלות.",
    category: "websites",
    tags: ["אתר אישי", "בלוג", "לידים"],
    year: 2025,
    client: "מרצה לחדשנות",
    gradient: "from-[#f59e0b] to-[#e77455]",
  },

  /* ===== אוטומציות וכלים דיגיטליים ===== */
  {
    slug: "leads-automation",
    title: "אוטומציית לידים לוואטסאפ",
    description:
      "כל ליד שנכנס מהאתר מקבל מענה אוטומטי בוואטסאפ תוך שניות, נרשם ב-CRM ומתויג לפי תחום עניין.",
    category: "automation",
    tags: ["וואטסאפ", "CRM", "Make"],
    year: 2026,
    gradient: "from-[#22c55e] to-[#16a34a]",
    featured: true,
    isNew: true,
    result: "זמן מענה ירד מ-4 שעות ל-10 שניות",
  },
  {
    slug: "content-pipeline",
    title: "פס ייצור תוכן אוטומטי",
    description:
      "מערכת שהופכת פוסט אחד ל-8 פורמטים: רילס, סטורי, ניוזלטר, לינקדאין ועוד — בלחיצת כפתור אחת.",
    category: "automation",
    tags: ["תוכן", "GPT", "Zapier"],
    year: 2026,
    gradient: "from-[#7c5cff] to-[#4f7bff]",
    featured: true,
  },
  {
    slug: "report-bot",
    title: "בוט דוחות שבועי להנהלה",
    description:
      "בוט שאוסף נתונים מחמש מערכות שונות ושולח דוח מעוצב וברור למייל ההנהלה כל יום ראשון בבוקר.",
    category: "automation",
    tags: ["דוחות", "API", "אינטגרציות"],
    year: 2025,
    client: "חברת לוגיסטיקה",
    gradient: "from-[#0ea5e9] to-[#22d3ee]",
    result: "חוסך 6 שעות עבודה ידנית בשבוע",
  },
  {
    slug: "ai-support-agent",
    title: "סוכן AI לשירות לקוחות",
    description:
      "צ'אטבוט חכם שמחובר למאגר הידע של העסק ועונה על 80% מהפניות — ומעביר לאנוש בדיוק כשצריך.",
    category: "automation",
    tags: ["צ'אטבוט", "Claude", "ידע ארגוני"],
    year: 2025,
    gradient: "from-[#e77455] to-[#f59e0b]",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const projectsByCategory = (category: ProjectCategory) =>
  projects.filter((p) => p.category === category);
