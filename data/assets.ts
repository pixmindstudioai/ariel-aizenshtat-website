/**
 * Registry מרכזי לכל האסטים הגרפיים של האתר.
 * כל האסטים הם גרסאות שקופות מתוך public/assetss/processed
 * (נוצרות ע"י scripts/remove-background-assets.ts).
 *
 * width/height הם המידות האמיתיות של הקבצים — נדרשות ל-next/image.
 */

export interface AssetDef {
  src: string;
  width: number;
  height: number;
  alt: string;
}

const P = "/assetss/processed";

const asset = (
  file: string,
  width: number,
  height: number,
  alt: string
): AssetDef => ({ src: `${P}/${file}`, width, height, alt });

/* ===== כותרות גרפיות ===== */
export const heroTitles = {
  /** הכותרת הגרפית הראשית: "יוצר. טכנולוגי. בונה חוויות." + דמות ומברקים */
  titleMain: asset(
    "hero-title-main.png",
    1224,
    729,
    "יוצר. טכנולוגי. בונה חוויות. — הכותרת הראשית של Ariel AI"
  ),
};

/* ===== דמויות (מסקוטים) =====
 * Claude Code (Anthropic) — דמות הפיקסלים הכתומה
 * Codex (OpenAI)          — ענן הטרמינל הכחול-סגול
 * OpenClaw                — הלובסטר האדום העגול
 */
export const mascots = {
  /** דמות הפיקסלים הכתומה הראשית — Claude Code */
  claudeMain: asset(
    "mascot-claude.png",
    1012,
    875,
    "Claude Code — דמות הפיקסלים הכתומה"
  ),
  /** וריאציה שטוחה של דמות הפיקסלים של Claude Code */
  claudeFlat: asset(
    "mascot-claude-flat.png",
    1054,
    913,
    "Claude Code — דמות פיקסלים, וריאציה"
  ),
  /** דמות הפיקסלים של Claude Code עם עיניים שמחות */
  claudeHappy: asset(
    "mascot-claude-happy.png",
    999,
    819,
    "Claude Code — דמות פיקסלים מחייכת"
  ),
  /** ענן סגול-כחול עם סמל טרמינל — Codex של OpenAI */
  codexCloud: asset(
    "mascot-codex-cloud.png",
    987,
    1011,
    "Codex — ענן הטרמינל"
  ),
  /** הלובסטר האדום העגול — OpenClaw */
  openclawCloud: asset(
    "mascot-openclaw.png",
    992,
    936,
    "OpenClaw — הלובסטר האדום"
  ),
};

/* ===== כרטיסי ניווט גרפיים ===== */
export const sectionCards = {
  portfolioCard: asset(
    "card-portfolio.png",
    1154,
    595,
    "כרטיס תיק עבודות עם אייקון תיקייה"
  ),
  writtenGuidesCard: asset(
    "card-written-guides.png",
    1170,
    615,
    "כרטיס מדריכים כתובים עם אייקון עיפרון"
  ),
  videoGuidesCard: asset(
    "card-video-guides.png",
    1114,
    665,
    "כרטיס מדריכי וידאו עם מצלמה ופס נגן"
  ),
  aboutCard: asset("card-about.png", 1321, 615, "כרטיס אודות עם אייקון משתמש וחץ"),
  projectsSelectedCard: asset(
    "card-selected-projects.png",
    1180,
    443,
    "כרטיס פרויקטים נבחרים"
  ),
  whatYouGetCard: asset(
    "card-what-you-get.png",
    1344,
    388,
    "כרטיס מה תקבלו בסדנה עם אייקון מתנה"
  ),
  happyClientsCard: asset(
    "card-happy-clients.png",
    1182,
    390,
    "כרטיס לקוחות מרוצים עם לב מחייך"
  ),
};

/* ===== חלונות ממשק ===== */
export const browserCards = {
  browserWindow: asset(
    "card-browser-window.png",
    949,
    841,
    "חלון דפדפן עם ממשק אתר מודרני"
  ),
};

export const codeCards = {
  codeEditorWindow: asset(
    "card-code-editor.png",
    862,
    743,
    "חלון עורך קוד כהה עם שורות קוד צבעוניות"
  ),
};

/* ===== כפתורים גרפיים ===== */
export const buttons = {
  ctaBuildButton: asset(
    "btn-build-something.png",
    1688,
    422,
    "בואו נבנה משהו מגניב"
  ),
  ctaMessageButton: asset("btn-send-message.png", 1230, 337, "שלחו הודעה"),
  ctaPortfolioButton: asset(
    "btn-view-portfolio.png",
    1787,
    456,
    "צפו בתיק העבודות"
  ),
  ctaLearnMoreButton: asset("btn-learn-more.png", 1134, 376, "למדו עוד"),
  ctaTalkButton: asset("btn-lets-talk.png", 1203, 356, "בואו נדבר"),
};

/* ===== תגיות ===== */
export const badges = {
  aiBadge: asset("badge-ai.png", 1492, 423, "תגית בינה מלאכותית"),
  websitesBadge: asset("badge-websites.png", 1569, 439, "תגית אתרים ודפי נחיתה"),
  smartAutomationBadge: asset(
    "badge-automation.png",
    1475,
    423,
    "תגית אוטומציות חכמות"
  ),
  newBadge: asset("badge-new.png", 571, 300, "תגית חדש"),
};

/* ===== אזורים מיוחדים ===== */
export const faqAssets = {
  faqBadge: asset("card-faq.png", 1153, 503, "כרטיס שאלות נפוצות"),
};

export const contactAssets = {
  sendMessageButton: buttons.ctaMessageButton,
  letsTalkButton: buttons.ctaTalkButton,
};

/* ===== תמונות אישיות =====
 * להחלפת התמונה: שמרו את הקובץ החדש באותו נתיב בדיוק —
 * public/assetss/profile/ariel.png — ואין צורך לגעת בקוד.
 */
export const profile = {
  arielPhoto: {
    src: "/assetss/profile/ariel.png",
    width: 1254,
    height: 1254,
    alt: "אריאל — יוצר, מרצה AI ובונה חוויות דיגיטליות",
  } satisfies AssetDef,
};

/* ===== אייקוני סטיקר (icons assets → processed/icons) =====
 * אייקונים תלת-ממדיים בסגנון האתר — מחליפים אימוג'ים בכרטיסים.
 * כולם רבועים 240x240 עם רקע שקוף.
 */
const iconAsset = (name: string, alt: string): AssetDef => ({
  src: `${P}/icons/icon-${name}.png`,
  width: 240,
  height: 240,
  alt,
});

export const icons = {
  notepad: iconAsset("notepad", "מסמך עם עיפרון"),
  plus: iconAsset("plus", "הוספה"),
  chat: iconAsset("chat", "בועות שיחה"),
  trash: iconAsset("trash", "פח"),
  inbox: iconAsset("inbox", "הודעה נכנסת"),
  save: iconAsset("save", "שמירה"),
  imageUpload: iconAsset("image-upload", "העלאת תמונה"),
  videoEdit: iconAsset("video-edit", "עריכת וידאו"),
  user: iconAsset("user", "משתמש"),
  browserPages: iconAsset("browser-pages", "עמודי דפדפן"),
  settings: iconAsset("settings", "הגדרות"),
  pencil: iconAsset("pencil", "עיפרון"),
  upload: iconAsset("upload", "העלאה"),
  eye: iconAsset("eye", "עין"),
  analytics: iconAsset("analytics", "גרף נתונים"),
  videoPlay: iconAsset("video-play", "חלון וידאו"),
  notes: iconAsset("notes", "רשימות"),
  botChat: iconAsset("bot-chat", "בוט צ'אט"),
  galleryUpload: iconAsset("gallery-upload", "העלאת גלריה"),
  gearFace: iconAsset("gear-face", "גלגל שיניים חמוד"),
  usersGear: iconAsset("users-gear", "משתמשים והגדרות"),
  automation: iconAsset("automation", "אוטומציה"),
  dashboardFolder: iconAsset("dashboard-folder", "תיקיית דוחות"),
  briefcase: iconAsset("briefcase", "תיק עבודות"),
  dashboard: iconAsset("dashboard", "דשבורד"),
  gallery: iconAsset("gallery", "גלריה"),
  users: iconAsset("users", "לקוחות"),
  chartMascot: iconAsset("chart-mascot", "גרף עם דמות"),
  growth: iconAsset("growth", "גרף צמיחה"),
};

/* ===== אלמנטים דקורטיביים ===== */
export const decorations = {
  curvedArrow: asset(
    "deco-curved-arrow.png",
    923,
    832,
    "חץ מסולסל סגול דקורטיבי"
  ),
  curvedArrowLeft: asset(
    "deco-curved-arrow-left.png",
    830,
    915,
    "חץ מסולסל סגול דקורטיבי שמאלה"
  ),
  sparklesSet: asset("deco-sparkles.png", 870, 771, "סט ברקיות כחול-סגול"),
  sparklesAlt: asset("deco-sparkles-alt.png", 678, 843, "סט ברקיות צבעוני"),
  heartSticker: asset("deco-heart.png", 765, 646, "סטיקר לב ורוד"),
};

export const arrows = {
  curvedArrow: decorations.curvedArrow,
  curvedArrowLeft: decorations.curvedArrowLeft,
};

export const sparkles = {
  sparklesSet: decorations.sparklesSet,
  sparklesAlt: decorations.sparklesAlt,
};

export const hearts = {
  heartSticker: decorations.heartSticker,
};

/** כל האסטים בקובץ אחד — נוח לאיטרציה ולבדיקות */
export const allAssets = {
  ...heroTitles,
  ...mascots,
  ...sectionCards,
  ...browserCards,
  ...codeCards,
  ...buttons,
  ...badges,
  ...faqAssets,
  ...decorations,
} as const;

export type AssetKey = keyof typeof allAssets;
