/**
 * Registry מרכזי לאסטים הגרפיים של ממשק הניהול.
 * כל הקבצים נמצאים ב-public/admin assetss (הועתקו כמו-שהם מהתיקייה המקורית,
 * ללא עיבוד וללא שינוי). ה-src מקודד URL בגלל הרווח בשם התיקייה.
 *
 * width/height הם המידות האמיתיות של הקבצים — נדרשות ל-next/image.
 */

export type AdminAssetCategory =
  | "dashboard"
  | "content"
  | "projects"
  | "pages"
  | "guides"
  | "videoGuides"
  | "media"
  | "users"
  | "settings"
  | "analytics"
  | "messages"
  | "buttons"
  | "badges"
  | "decorations"
  | "emptyStates"
  | "successStates"
  | "warnings";

export interface AdminAsset {
  id: string;
  name: string;
  src: string;
  alt: string;
  category: AdminAssetCategory;
  usage: string;
  decorative: boolean;
  priority: boolean;
  width: number;
  height: number;
}

/** התיקייה המקורית נקראת "admin assetss" (עם רווח) — לא משנים את השם, רק מקודדים לנתיב תקין */
const P = "/admin%20assetss";

const a = (
  id: string,
  file: string,
  name: string,
  alt: string,
  category: AdminAssetCategory,
  usage: string,
  width: number,
  height: number,
  opts: { decorative?: boolean; priority?: boolean } = {}
): AdminAsset => ({
  id,
  name,
  src: `${P}/${file}`,
  alt,
  category,
  usage,
  decorative: opts.decorative ?? false,
  priority: opts.priority ?? false,
  width,
  height,
});

export const adminAssets = {
  /* ===== דאשבורד ===== */
  dashboardTitle: a(
    "dashboard-title",
    "7d6f4f78-af77-4a6b-9d09-65b93de9bfac.png",
    "ממשק הניהול של האתר",
    "ממשק הניהול של האתר — כותרת ראשית עם דמות פיקסלים",
    "dashboard",
    "כותרת ראשית בדאשבורד",
    2172,
    724,
    { priority: true }
  ),
  dashboardBadge: a(
    "dashboard-badge",
    "9c6f1af7-a8a8-4611-94d2-09e5824eea6c.png",
    "דשבורד",
    "תגית דשבורד עם ענן טרמינל",
    "dashboard",
    "תווית דשבורד בסיידבר ובכותרות משנה",
    2172,
    724
  ),
  recentProjects: a(
    "recent-projects",
    "65acbffd-af24-49ad-a70c-e00562cc7d2e.png",
    "פרויקטים אחרונים",
    "תגית פרויקטים אחרונים עם גרף ודמות אדומה",
    "dashboard",
    "כותרת אזור פעילות אחרונה בדאשבורד",
    1672,
    941
  ),
  scheduling: a(
    "scheduling",
    "607db870-90f0-48a4-9d51-90e827e5f7cd.png",
    "תזמון פרסומים",
    "תגית תזמון פרסומים עם אייקון לוח שנה",
    "dashboard",
    "אזור תזמון ופרסומים מתוכננים",
    1672,
    941
  ),

  /* ===== תוכן ===== */
  contentManagement: a(
    "content-management",
    "81ce6202-28d3-4d16-80a2-dee7ee1d075a.png",
    "ניהול תכנים",
    "תגית ניהול תכנים עם תיקייה ודמות פיקסלים",
    "content",
    "כותרת עמודי ניהול תוכן",
    2172,
    724
  ),
  contentEditing: a(
    "content-editing",
    "23d02e48-e34e-43cb-808a-c8c108306f47.png",
    "עריכת תוכן",
    "תגית עריכת תוכן עם מסמך ועיפרון",
    "content",
    "כותרת טפסי עריכה",
    1672,
    941
  ),
  postsList: a(
    "posts-list",
    "9bcb392c-5d1b-41f9-aceb-c60ddbe9baa1.png",
    "רשימת פוסטים",
    "תגית רשימת פוסטים עם מסמך רשימה",
    "content",
    "כותרת רשימות תוכן",
    1672,
    941
  ),

  /* ===== פרויקטים ===== */
  addProjectButton: a(
    "add-project-button",
    "a088fa96-0321-4cd6-81af-d34c88a554c6.png",
    "הוספת פרויקט",
    "כפתור הוספת פרויקט עם סימן פלוס",
    "projects",
    "כפתור יצירת פרויקט חדש",
    2172,
    724
  ),

  /* ===== עמודים ===== */
  pagesManagement: a(
    "pages-management",
    "5178ad85-b68b-48ab-991f-e15e91d380d1.png",
    "ניהול עמודים",
    "תגית ניהול עמודים עם תיקייה ודמות פיקסלים",
    "pages",
    "כותרת עמוד ניהול עמודים",
    1672,
    941
  ),
  newPageButton: a(
    "new-page-button",
    "d62f4009-76b8-4cbc-b535-9ae173ef3a1c.png",
    "צור דף חדש",
    "כפתור צור דף חדש עם סימן פלוס",
    "pages",
    "כפתור יצירת עמוד",
    1672,
    941
  ),

  /* ===== מדריכים כתובים ===== */
  writtenGuidesTitle: a(
    "written-guides-title",
    "13c8e998-1f8e-4a19-9606-dd7babf4fe79.png",
    "מדריכים כתובים",
    "תגית מדריכים כתובים עם מסמך ועיפרון",
    "guides",
    "כותרת עמוד ניהול מדריכים",
    2172,
    724
  ),
  writtenGuidesChat: a(
    "written-guides-chat",
    "d23c5f66-99b1-48bd-84bb-8ee45e20fd44.png",
    "מדריכים כתובים",
    "תגית מדריכים כתובים עם בועת צ'אט ודמות אדומה",
    "guides",
    "וריאציה לכרטיסים ומצבי ריק של מדריכים",
    1672,
    941
  ),
  addGuideButton: a(
    "add-guide-button",
    "fb2e19c5-5e29-4b00-ac58-9957fa03b823.png",
    "הוסף מדריך",
    "כפתור הוסף מדריך עם סימן פלוס",
    "guides",
    "כפתור יצירת מדריך חדש",
    1672,
    941
  ),

  /* ===== מדריכי וידאו ===== */
  videoGuidesTitle: a(
    "video-guides-title",
    "e3203023-4235-47a0-a6ea-234ae4fd6182.png",
    "מדריכי וידאו",
    "תגית מדריכי וידאו עם מצלמת וידאו אדומה",
    "videoGuides",
    "כותרת עמוד ניהול מדריכי וידאו",
    2172,
    724
  ),

  /* ===== מדיה ===== */
  mediaUpload: a(
    "media-upload",
    "18ce7bca-481a-4dda-8839-0e809c8690ec.png",
    "העלאת מדיה",
    "תגית העלאת מדיה עם אייקון תמונה וחץ",
    "media",
    "כותרת עמוד המדיה ואזור ההעלאה",
    1672,
    941
  ),
  exportButton: a(
    "export-button",
    "1d6e1312-ce42-4cb7-b35b-0636e9a397a1.png",
    "ייצוא נתונים",
    "כפתור ייצוא נתונים עם אייקון הורדה",
    "media",
    "כפתור ייצוא נתונים",
    1672,
    941
  ),

  /* ===== משתמשים ===== */
  usersManagement: a(
    "users-management",
    "6cadb7d9-6c8e-4820-b6e9-4e1e7d748d16.png",
    "ניהול משתמשים",
    "תגית ניהול משתמשים עם אייקון משתמש ודמות פיקסלים",
    "users",
    "כותרת עמוד ניהול משתמשים",
    1672,
    941
  ),

  /* ===== הגדרות ===== */
  siteSettings: a(
    "site-settings",
    "55d4bbb9-56e8-486f-83a3-aaecd2c3ff71.png",
    "הגדרות האתר",
    "תגית הגדרות האתר עם גלגל שיניים ודמות פיקסלים",
    "settings",
    "כותרת עמוד הגדרות האתר",
    1672,
    941
  ),

  /* ===== סטטיסטיקות ===== */
  analyticsTitle: a(
    "analytics-title",
    "f43d99e9-50d4-4efc-9583-390ee4bf9471.png",
    "סטטיסטיקות",
    "תגית סטטיסטיקות עם גרף ודמות אדומה",
    "analytics",
    "כותרת עמוד הסטטיסטיקות",
    2172,
    724
  ),
  performanceData: a(
    "performance-data",
    "b87a8ce5-a30d-4a69-a695-ebfb673e5f93.png",
    "ביצועים ונתונים",
    "תגית ביצועים ונתונים עם דמות אדומה וגרף",
    "analytics",
    "כרטיסי נתונים וביצועים",
    1672,
    941
  ),

  /* ===== הודעות ===== */
  newMessages: a(
    "new-messages",
    "a8d03185-d9ef-4b6b-af0e-8f351004567a.png",
    "הודעות חדשות",
    "תגית הודעות חדשות עם בועת צ'אט ודמות אדומה",
    "messages",
    "כותרת עמוד ההודעות והתראות בדאשבורד",
    2172,
    724
  ),

  /* ===== כפתורים ===== */
  addCategoryButton: a(
    "add-category-button",
    "e99abd7f-79a8-4e03-927f-dba98ba2b43e.png",
    "הוספת קטגוריה",
    "כפתור הוספת קטגוריה עם סימן פלוס",
    "buttons",
    "כפתור יצירת קטגוריה",
    1672,
    941
  ),
  saveChangesPill: a(
    "save-changes-pill",
    "46bcec2f-4e32-4079-a509-3d78cccccf95.png",
    "שמור שינויים",
    "כפתור שמור שינויים עם וי כחול",
    "buttons",
    "כפתור שמירה בטפסים",
    1672,
    941
  ),
  previewBadge: a(
    "preview-badge",
    "d1babcab-b840-4a6e-bf23-d1af6ff18794.png",
    "תצוגה מקדימה",
    "תגית תצוגה מקדימה עם אייקון עין",
    "buttons",
    "כפתור/תווית תצוגה מקדימה",
    1672,
    941
  ),

  /* ===== תגיות ===== */
  savedDrafts: a(
    "saved-drafts",
    "47531c78-954f-4f00-ad7a-f5b8392cc8d3.png",
    "טיוטות שמורות",
    "תגית טיוטות שמורות עם וי",
    "badges",
    "תווית טיוטות בדאשבורד וברשימות",
    1672,
    941
  ),
  recommendedBadge: a(
    "recommended-badge",
    "6b23ec7a-4e56-4e25-9fe0-5c17c96d6f3e.png",
    "מומלץ",
    "תגית מומלץ קטנה עם נצנוץ",
    "badges",
    "תווית לפריטים מומלצים/מוצגים בדף הבית",
    1672,
    941
  ),

  /* ===== מצבי הצלחה ===== */
  savedSuccess: a(
    "saved-success",
    "07590dc8-d805-4e0a-8662-325e0a82bd3b.png",
    "שמור שינויים",
    "תגית שמור שינויים רחבה עם וי כחול",
    "successStates",
    "אישור שמירה מוצלחת והודעות הצלחה",
    2172,
    724
  ),

  /* ===== קישוטים ===== */
  sparklesArrowDown: a(
    "sparkles-arrow-down",
    "18b6eb7c-6591-470f-9fcd-2b03703ed04a.png",
    "ניצוצות וחץ",
    "",
    "decorations",
    "קישוט לפינות הדאשבורד",
    1254,
    1254,
    { decorative: true }
  ),
  sparklesArrowUp: a(
    "sparkles-arrow-up",
    "3b282b12-5d80-4650-99ec-b96d0d76e02e.png",
    "ניצוצות וחץ עולה",
    "",
    "decorations",
    "קישוט לכותרות ומצבי הצלחה",
    1254,
    1254,
    { decorative: true }
  ),
  sparklesArrowLeft: a(
    "sparkles-arrow-left",
    "46e928f6-4581-467d-acdc-b50966ea8814.png",
    "ניצוצות וחץ שמאלה",
    "",
    "decorations",
    "קישוט למצבי ריק",
    1254,
    1254,
    { decorative: true }
  ),
} as const;

export type AdminAssetKey = keyof typeof adminAssets;

/** כל האסטים כרשימה — נוח לסינון לפי קטגוריה */
export const adminAssetsList: AdminAsset[] = Object.values(adminAssets);

export const adminAssetsByCategory = (category: AdminAssetCategory) =>
  adminAssetsList.filter((asset) => asset.category === category);
