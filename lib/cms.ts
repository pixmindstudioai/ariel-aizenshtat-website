/**
 * שכבת התוכן של האתר הציבורי — עטיפות עם fallback מקומי.
 *
 * שאילתות הבסיס (projects / guides / video_guides / site_settings)
 * מגיעות מ-lib/public/queries.ts. הקובץ הזה:
 * 1. עוטף אותן כך שכשאין דאטהבייס (השאילתה נכשלת / הטבלה חסרה) — חוזר תוכן הדמו מ-data/*.ts.
 *    רשימה ריקה מה-DB היא מצב לגיטימי ומוצגת כפי שהיא, כדי שהאתר תמיד ישקף את ממשק הניהול
 *    (אחרת מחיקה/ארכוב של כל הפריטים באדמין "מחייה" את תוכן הדמו באתר).
 * 2. מוסיף את הטבלאות שאינן בסכמת האדמין: workshops, faq_items, testimonials.
 *
 * להקמת הדאטהבייס: database/schema.sql ואז database/seed.sql
 * (Supabase Dashboard → SQL Editor).
 */
import { cache } from "react";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import {
  getPublishedProjects,
  getFeaturedProjects,
  getProjectCategoryNames,
  getPublishedGuides,
  getPublishedVideoGuides,
  getSiteSettings,
  getPageBySlug,
  getProjectRowBySlug,
  getGuideRowBySlug,
  getVideoGuideRowBySlug,
  pageText,
} from "@/lib/public/queries";
import type { GuideRow, PageRow, ProjectRow, VideoGuideRow } from "@/lib/types";
import { categoryLabels } from "@/data/projects";
import {
  projects as localProjects,
  type Project,
  type ProjectCategory,
} from "@/data/projects";
import { guides as localGuides, type Guide } from "@/data/guides";
import {
  videoGuides as localVideoGuides,
  type VideoGuide,
} from "@/data/videoGuides";
import { workshops as localWorkshops, type Workshop } from "@/data/workshops";
import { faq as localFaq, type FaqItem } from "@/data/faq";
import {
  testimonials as localTestimonials,
  type Testimonial,
} from "@/data/testimonials";

/* ===== תוכן עמודים (טבלת pages) ===== */

/**
 * תוכן עמוד מהדאטהבייס לפי slug — null כשאין DB, והעמוד משתמש בטקסטים המקוריים.
 * עטוף ב-cache כדי ש-generateMetadata וגוף העמוד יחלקו שאילתה אחת לרינדור.
 */
export const fetchPage = cache(
  async (slug: string): Promise<PageRow | null> => getPageBySlug(slug)
);

export { pageText };

/** Metadata של עמוד מתוך טבלת pages (SEO מממשק הניהול), עם fallback לטקסטים הקבועים */
export async function fetchPageMetadata(
  slug: string,
  fallback: { title: string; description: string }
): Promise<Metadata> {
  const page = await fetchPage(slug);
  return {
    title: page?.seo_title || fallback.title,
    description: page?.seo_description || fallback.description,
    ...(page?.seo_keywords ? { keywords: page.seo_keywords } : {}),
    ...(page?.og_image ? { openGraph: { images: [page.og_image] } } : {}),
  };
}

/* ===== תוכן ליבה — DB עם fallback לדמו ===== */

export async function fetchProjects(): Promise<Project[]> {
  const rows = await getPublishedProjects();
  return rows ?? localProjects;
}

export async function fetchProjectsByCategory(
  category: ProjectCategory
): Promise<Project[]> {
  const rows = await getPublishedProjects(category);
  return rows ?? localProjects.filter((p) => p.category === category);
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  const rows = await getFeaturedProjects();
  return rows ?? localProjects.filter((p) => p.featured);
}

/** שמות קטגוריות הפורטפוליו — מנוהלים במסך הקטגוריות באדמין, עם fallback לתוויות הסטטיות */
export async function fetchProjectCategoryLabels(): Promise<
  Record<ProjectCategory, string>
> {
  const dbLabels = await getProjectCategoryNames();
  return { ...categoryLabels, ...(dbLabels ?? {}) };
}

export async function fetchGuides(): Promise<Guide[]> {
  const rows = await getPublishedGuides();
  return rows ?? localGuides;
}

export async function fetchVideoGuides(): Promise<VideoGuide[]> {
  const rows = await getPublishedVideoGuides();
  return rows ?? localVideoGuides;
}

/* ===== עמודי פריט בודד — DB עם fallback לדמו המקומי ===== */

const nowIso = () => new Date().toISOString();

/** שורת פרויקט לעמוד /portfolio/[slug] — כשאין DB, נבנית שורה מתוכן הדמו */
export async function fetchProjectRow(
  slug: string,
  preview = false
): Promise<ProjectRow | null> {
  const row = await getProjectRowBySlug(slug, preview);
  if (row) return row;

  // ה-DB זמין אך הפריט לא קיים או לא מפורסם — 404 אמיתי, בלי להחיות תוכן דמו
  if ((await getPublishedProjects()) !== null) return null;

  const local = localProjects.find((p) => p.slug === slug);
  if (!local) return null;
  return {
    id: `local-${local.slug}`,
    title: local.title,
    slug: local.slug,
    excerpt: local.description,
    description: local.description,
    content: "",
    category_id: null,
    project_type: "other",
    cover_image: local.coverImage ?? null,
    gallery: [],
    video_url: null,
    external_url: null,
    tools: [],
    tags: local.tags,
    client_name: local.client ?? null,
    year: local.year,
    gradient: local.gradient,
    result: local.result ?? null,
    is_new: !!local.isNew,
    featured: !!local.featured,
    status: "published",
    sort_order: 0,
    seo_title: null,
    seo_description: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    category: {
      id: `local-${local.category}`,
      name: categoryLabels[local.category],
      slug: local.category,
      description: null,
      type: "project",
      color: null,
      icon: null,
      sort_order: 0,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  };
}

/** שורת מדריך לעמוד /guides/[slug] */
export async function fetchGuideRow(slug: string, preview = false): Promise<GuideRow | null> {
  const row = await getGuideRowBySlug(slug, preview);
  if (row) return row;

  // ה-DB זמין אך המדריך לא קיים או לא מפורסם — 404 אמיתי, בלי להחיות תוכן דמו
  if ((await getPublishedGuides()) !== null) return null;

  const local = localGuides.find((g) => g.slug === slug);
  if (!local) return null;
  return {
    id: `local-${local.slug}`,
    title: local.title,
    slug: local.slug,
    excerpt: local.description,
    content: "",
    category_id: null,
    cover_image: null,
    read_time: local.readingTime,
    level: local.level,
    tags: [local.tag],
    is_new: !!local.isNew,
    featured: false,
    status: "published",
    sort_order: 0,
    seo_title: null,
    seo_description: null,
    created_at: local.date,
    updated_at: local.date,
    category: null,
  };
}

/** שורת מדריך וידאו לעמוד /video-guides/[slug] */
export async function fetchVideoGuideRow(
  slug: string,
  preview = false
): Promise<VideoGuideRow | null> {
  const row = await getVideoGuideRowBySlug(slug, preview);
  if (row) return row;

  // ה-DB זמין אך המדריך לא קיים או לא מפורסם — 404 אמיתי, בלי להחיות תוכן דמו
  if ((await getPublishedVideoGuides()) !== null) return null;

  const local = localVideoGuides.find((v) => v.slug === slug);
  if (!local) return null;
  return {
    id: `local-${local.slug}`,
    title: local.title,
    slug: local.slug,
    excerpt: local.description,
    description: local.description,
    video_url: null,
    thumbnail: local.thumbnail ?? null,
    duration: local.duration,
    category_id: null,
    level: local.level,
    tags: [local.tag],
    gradient: local.gradient,
    is_new: !!local.isNew,
    featured: false,
    status: "published",
    sort_order: 0,
    seo_title: null,
    seo_description: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    category: null,
  };
}

/* ===== פרטי יצירת קשר מתוך הגדרות האתר ===== */

export interface ContactSettings {
  whatsappUrl: string;
  email: string;
  phone: string | null;
}

const defaultContact: ContactSettings = {
  whatsappUrl: "https://wa.me/972534122548",
  email: "pixmindstudio3316@gmail.com",
  phone: null,
};

export async function fetchContactSettings(): Promise<ContactSettings> {
  const settings = await getSiteSettings();
  return {
    whatsappUrl: settings?.whatsapp_url || defaultContact.whatsappUrl,
    email: settings?.email || defaultContact.email,
    phone: settings?.phone || null,
  };
}

/* ===== טבלאות תוכן משלימות (database/seed.sql) ===== */

type Accent = "blue" | "purple" | "pink" | "coral";
const accents: Accent[] = ["blue", "purple", "pink", "coral"];

const toAccent = (value: string, i: number): Accent =>
  accents.includes(value as Accent) ? (value as Accent) : accents[i % accents.length];

async function safeRows<T>(
  table: string,
  columns: string
): Promise<T[] | null> {
  try {
    const { data, error } = await createPublicClient()
      .from(table)
      .select(columns)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) return null;
    return (data as T[]) ?? null;
  } catch {
    return null;
  }
}

interface WorkshopRow {
  slug: string;
  title: string;
  audience: string;
  duration: string;
  description: string;
  outline: string[];
  deliverables: string[];
  accent: string;
  is_new: boolean;
}

export async function fetchWorkshops(): Promise<Workshop[]> {
  const rows = await safeRows<WorkshopRow>(
    "workshops",
    "slug,title,audience,duration,description,outline,deliverables,accent,is_new"
  );
  const mapped = rows?.map((row, i) => ({
    slug: row.slug,
    title: row.title,
    audience: row.audience,
    duration: row.duration,
    description: row.description,
    outline: row.outline ?? [],
    deliverables: row.deliverables ?? [],
    accent: toAccent(row.accent, i),
    isNew: row.is_new,
  }));
  return mapped ?? localWorkshops;
}

export async function fetchFaq(): Promise<FaqItem[]> {
  const rows = await safeRows<FaqItem>("faq_items", "question,answer");
  return rows ?? localFaq;
}

interface TestimonialRow {
  name: string;
  role: string;
  quote: string;
  accent: string;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const rows = await safeRows<TestimonialRow>(
    "testimonials",
    "name,role,quote,accent"
  );
  const mapped = rows?.map((row, i) => ({
    ...row,
    accent: toAccent(row.accent, i),
  }));
  return mapped ?? localTestimonials;
}
