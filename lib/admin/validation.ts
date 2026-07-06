import { z } from "zod";
import { isExternalMediaUrl } from "@/lib/media";
import { SLUG_PATTERN } from "@/lib/slug";

/** סכמות Zod לכל טפסי הניהול — משמשות גם בצד לקוח (react-hook-form) וגם בצד שרת */

const slugSchema = z
  .string()
  .min(1, "חובה למלא slug")
  .max(120, "ה-slug ארוך מדי")
  .regex(SLUG_PATTERN, "slug יכול להכיל רק אותיות אנגליות קטנות, מספרים ומקפים");

/** URL מלא או נתיב יחסי שמתחיל ב-/ — או ריק */
const urlOrPath = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\/.+/.test(v),
    "יש להזין כתובת מלאה (https://...) או נתיב שמתחיל ב-/"
  );

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "כתובת לא תקינה");

/**
 * כתובת קובץ מדיה שחי אצלנו: נתיב יחסי או URL מלא — אבל אף פעם לא
 * שירות אחסון/סטרימינג חיצוני (יוטיוב, וימאו וכו').
 */
const selfHostedMediaUrl = urlOrPath.refine(
  (v) => !isExternalMediaUrl(v),
  "הסרטונים והאודיו נשמרים אצלנו בלבד — העלו את הקובץ לספריית המדיה ובחרו אותו משם (בלי יוטיוב/וימאו)"
);

export const statusSchema = z.enum(["draft", "published", "archived"]);
export const levelSchema = z.enum(["מתחילים", "בינוני", "מתקדמים"]);

const seoFields = {
  seo_title: z.string().max(70, "כותרת SEO — עד 70 תווים").optional().default(""),
  seo_description: z.string().max(170, "תיאור SEO — עד 170 תווים").optional().default(""),
};

/** רשימת תגיות/כלים — מגיעה מהטופס כמחרוזת מופרדת בפסיקים */
const tagList = z
  .string()
  .optional()
  .default("")
  .transform((v) =>
    v
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  );

export const projectSchema = z.object({
  title: z.string().min(2, "חובה למלא שם פרויקט").max(140, "השם ארוך מדי"),
  slug: slugSchema,
  excerpt: z.string().max(500, "התקציר ארוך מדי").optional().default(""),
  description: z.string().optional().default(""),
  content: z.string().optional().default(""),
  category_id: z.string().uuid("קטגוריה לא תקינה").nullable().optional(),
  project_type: z.enum(["video", "website", "landing_page", "automation", "guide", "other"]),
  cover_image: urlOrPath.optional().default(""),
  gallery: z.array(z.string()).optional().default([]),
  video_url: selfHostedMediaUrl.optional().default(""),
  external_url: optionalUrl.optional().default(""),
  tools: tagList,
  tags: tagList,
  client_name: z.string().max(120).optional().default(""),
  year: z.coerce
    .number()
    .int()
    .min(2000, "שנה לא תקינה")
    .max(2100, "שנה לא תקינה")
    .nullable()
    .optional(),
  gradient: z.string().max(120).optional().default(""),
  result: z.string().max(300).optional().default(""),
  is_new: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  status: statusSchema,
  sort_order: z.coerce.number().int().optional().default(0),
  ...seoFields,
});

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectData = z.output<typeof projectSchema>;

export const guideSchema = z.object({
  title: z.string().min(2, "חובה למלא כותרת").max(140, "הכותרת ארוכה מדי"),
  slug: slugSchema,
  excerpt: z.string().max(500, "התקציר ארוך מדי").optional().default(""),
  content: z.string().optional().default(""),
  category_id: z.string().uuid("קטגוריה לא תקינה").nullable().optional(),
  cover_image: urlOrPath.optional().default(""),
  audio_url: selfHostedMediaUrl.optional().default(""),
  show_toc: z.boolean().optional().default(false),
  read_time: z.coerce.number().int().min(1, "זמן קריאה — לפחות דקה").max(240),
  level: levelSchema,
  tags: tagList,
  is_new: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  status: statusSchema,
  sort_order: z.coerce.number().int().optional().default(0),
  ...seoFields,
});

export type GuideInput = z.input<typeof guideSchema>;
export type GuideData = z.output<typeof guideSchema>;

export const videoGuideSchema = z.object({
  title: z.string().min(2, "חובה למלא כותרת").max(140, "הכותרת ארוכה מדי"),
  slug: slugSchema,
  excerpt: z.string().max(500, "התקציר ארוך מדי").optional().default(""),
  description: z.string().optional().default(""),
  video_url: selfHostedMediaUrl.optional().default(""),
  thumbnail: urlOrPath.optional().default(""),
  duration: z
    .string()
    .regex(/^$|^\d{1,2}(:\d{2}){1,2}$/, "משך בפורמט 12:30 או 1:05:00")
    .optional()
    .default(""),
  category_id: z.string().uuid("קטגוריה לא תקינה").nullable().optional(),
  level: levelSchema,
  tags: tagList,
  gradient: z.string().max(120).optional().default(""),
  is_new: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  status: statusSchema,
  sort_order: z.coerce.number().int().optional().default(0),
  ...seoFields,
});

export type VideoGuideInput = z.input<typeof videoGuideSchema>;
export type VideoGuideData = z.output<typeof videoGuideSchema>;

export const pageSchema = z.object({
  title: z.string().min(2, "חובה למלא כותרת").max(140),
  subtitle: z.string().max(300).optional().default(""),
  hero_title: z.string().max(200).optional().default(""),
  hero_description: z.string().max(600).optional().default(""),
  content_json: z.record(z.string(), z.unknown()).optional().default({}),
  og_image: urlOrPath.optional().default(""),
  status: statusSchema,
  sort_order: z.coerce.number().int().optional().default(0),
  seo_keywords: z.string().max(300).optional().default(""),
  ...seoFields,
});

export type PageInput = z.input<typeof pageSchema>;
export type PageData = z.output<typeof pageSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "חובה למלא שם").max(80),
  slug: slugSchema,
  description: z.string().max(300).optional().default(""),
  type: z.enum(["project", "guide", "video_guide", "global"]),
  color: z
    .string()
    .regex(/^$|^#[0-9a-fA-F]{6}$/, "צבע בפורמט hex, למשל ‎#4f7bff")
    .optional()
    .default(""),
  icon: z.string().max(80).optional().default(""),
  sort_order: z.coerce.number().int().optional().default(0),
});

export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryData = z.output<typeof categorySchema>;

export const siteSettingsSchema = z.object({
  site_name: z.string().min(1, "חובה למלא שם אתר").max(100),
  site_description: z.string().max(400).optional().default(""),
  logo_url: urlOrPath.optional().default(""),
  favicon_url: urlOrPath.optional().default(""),
  default_og_image: urlOrPath.optional().default(""),
  primary_cta_text: z.string().min(1, "חובה למלא טקסט לכפתור").max(60),
  primary_cta_url: urlOrPath,
  whatsapp_url: optionalUrl.optional().default(""),
  instagram_url: optionalUrl.optional().default(""),
  youtube_url: optionalUrl.optional().default(""),
  tiktok_url: optionalUrl.optional().default(""),
  linkedin_url: optionalUrl.optional().default(""),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.email().safeParse(v).success, "אימייל לא תקין")
    .optional()
    .default(""),
  phone: z.string().max(30).optional().default(""),
  footer_text: z.string().max(400).optional().default(""),
  seo_title: z.string().max(70, "כותרת SEO — עד 70 תווים").optional().default(""),
  seo_description: z.string().max(170, "תיאור SEO — עד 170 תווים").optional().default(""),
  seo_keywords: z.string().max(300).optional().default(""),
});

export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
export type SiteSettingsData = z.output<typeof siteSettingsSchema>;

export const newsletterSchema = z.object({
  subject: z.string().min(2, "חובה למלא נושא למייל").max(150, "הנושא ארוך מדי"),
  preheader: z
    .string()
    .max(150, "שורת התקציר — עד 150 תווים")
    .optional()
    .default(""),
  content: z.string().min(10, "כתבו קצת תוכן לפני השמירה").max(100_000),
});

export type NewsletterInput = z.input<typeof newsletterSchema>;
export type NewsletterData = z.output<typeof newsletterSchema>;

export const subscriberSchema = z.object({
  email: z.email("אימייל לא תקין"),
  full_name: z.string().max(120).optional().default(""),
});

export type SubscriberInput = z.input<typeof subscriberSchema>;

export const contactMessageSchema = z.object({
  full_name: z.string().min(2, "איך קוראים לכם?").max(120),
  email: z.email("אימייל לא תקין"),
  phone: z.string().max(30).optional().default(""),
  project_type: z.string().max(80).optional().default(""),
  message: z.string().min(5, "ספרו לנו קצת יותר").max(4000),
  source_page: z.string().max(200).optional().default(""),
});

export type ContactMessageInput = z.input<typeof contactMessageSchema>;

export const mediaMetaSchema = z.object({
  alt_text: z.string().max(300).optional().default(""),
  caption: z.string().max(300).optional().default(""),
  folder: z.string().max(80).optional().default("general"),
});

/** סוגי הקבצים ומגבלות הגודל עברו ל-lib/media.ts (משותף לקליינט ולשרת) */
