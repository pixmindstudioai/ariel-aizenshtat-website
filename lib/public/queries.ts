import { createPublicClient } from "@/lib/supabase/public";
import { createServerClient } from "@/lib/supabase/server";
import type {
  GuideRow,
  PageRow,
  ProjectRow,
  SiteSettingsRow,
  VideoGuideRow,
} from "@/lib/types";
import type { Project, ProjectCategory } from "@/data/projects";
import type { Guide } from "@/data/guides";
import type { VideoGuide } from "@/data/videoGuides";

/**
 * שאילתות האתר הציבורי.
 * מחזירות null כשהדאטהבייס לא זמין (למשל לפני הרצת schema.sql) —
 * ואז העמודים נופלים חזרה לנתונים הסטטיים ב-data/*.ts בצורה אלגנטית.
 */

async function safe<T>(fn: () => Promise<T | null>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

/* ===== הגדרות אתר ===== */

export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  return safe(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
    if (error) return null;
    return data as SiteSettingsRow;
  });
}

/* ===== עמודים ===== */

export async function getPageBySlug(slug: string): Promise<PageRow | null> {
  return safe(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return null;
    return data as PageRow;
  });
}

/** ערך טקסטואלי מתוך content_json של עמוד, עם ברירת מחדל */
export function pageText(
  page: PageRow | null,
  key: string,
  fallback: string
): string {
  const value = page?.content_json?.[key];
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

/* ===== פרויקטים ===== */

const GRADIENTS = [
  "from-[#4f7bff] to-[#7c5cff]",
  "from-[#ff7ac8] to-[#7c5cff]",
  "from-[#e77455] to-[#ff7ac8]",
  "from-[#22c55e] to-[#0ea5e9]",
  "from-[#f59e0b] to-[#e77455]",
  "from-[#0ea5e9] to-[#22d3ee]",
];

function defaultGradient(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

const KNOWN_CATEGORIES: ProjectCategory[] = ["video", "websites", "automation"];

function projectCategorySlug(row: ProjectRow): ProjectCategory {
  const slug = row.category?.slug;
  if (slug && (KNOWN_CATEGORIES as string[]).includes(slug)) return slug as ProjectCategory;
  if (row.project_type === "video") return "video";
  if (row.project_type === "automation") return "automation";
  return "websites";
}

export function mapProjectRow(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    description: row.excerpt || row.description,
    category: projectCategorySlug(row),
    categoryLabel: row.category?.name ?? undefined,
    tags: row.tags ?? [],
    year: row.year ?? new Date(row.created_at).getFullYear(),
    client: row.client_name ?? undefined,
    gradient: row.gradient || defaultGradient(row.slug),
    featured: row.featured,
    isNew: row.is_new,
    result: row.result ?? undefined,
    coverImage: row.cover_image ?? undefined,
  };
}

export async function getPublishedProjects(
  categorySlug?: ProjectCategory
): Promise<Project[] | null> {
  return safe(async () => {
    const supabase = createPublicClient();
    const query = supabase
      .from("projects")
      .select("*, category:categories(*)")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) return null;
    const projects = (data as ProjectRow[]).map(mapProjectRow);
    return categorySlug ? projects.filter((p) => p.category === categorySlug) : projects;
  });
}

/** שמות קטגוריות הפרויקטים כפי שהוגדרו בממשק הניהול (טבלת categories) */
export async function getProjectCategoryNames(): Promise<Partial<
  Record<ProjectCategory, string>
> | null> {
  return safe(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("type", "project");
    if (error) return null;
    const labels: Partial<Record<ProjectCategory, string>> = {};
    for (const row of (data as { name: string; slug: string }[]) ?? []) {
      if ((KNOWN_CATEGORIES as string[]).includes(row.slug)) {
        labels[row.slug as ProjectCategory] = row.name;
      }
    }
    return Object.keys(labels).length ? labels : null;
  });
}

export async function getFeaturedProjects(): Promise<Project[] | null> {
  return safe(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, category:categories(*)")
      .eq("status", "published")
      .eq("featured", true)
      .order("sort_order", { ascending: true });
    if (error) return null;
    return (data as ProjectRow[]).map(mapProjectRow);
  });
}

/**
 * שורת פרויקט מלאה לעמוד פרויקט בודד.
 * preview=true — קורא עם הרשאות המשתמש המחובר (טיוטות זמינות ל-admin/editor בלבד).
 */
export async function getProjectRowBySlug(
  slug: string,
  preview = false
): Promise<ProjectRow | null> {
  return safe(async () => {
    if (preview) {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("projects")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .maybeSingle();
      return (data as ProjectRow) ?? null;
    }
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return null;
    return (data as ProjectRow) ?? null;
  });
}

/* ===== מדריכים כתובים ===== */

export function mapGuideRow(row: GuideRow): Guide {
  return {
    slug: row.slug,
    title: row.title,
    description: row.excerpt,
    tag: row.tags?.[0] ?? row.category?.name ?? "מדריך",
    readingTime: row.read_time,
    date: row.created_at,
    isNew: row.is_new,
    level: row.level,
  };
}

export async function getPublishedGuides(): Promise<Guide[] | null> {
  return safe(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*, category:categories(*)")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return null;
    return (data as GuideRow[]).map(mapGuideRow);
  });
}

export async function getFeaturedGuides(): Promise<Guide[] | null> {
  return safe(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*, category:categories(*)")
      .eq("status", "published")
      .eq("featured", true)
      .order("sort_order", { ascending: true });
    if (error) return null;
    return (data as GuideRow[]).map(mapGuideRow);
  });
}

export async function getGuideRowBySlug(slug: string, preview = false): Promise<GuideRow | null> {
  return safe(async () => {
    if (preview) {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("guides")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .maybeSingle();
      return (data as GuideRow) ?? null;
    }
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("guides")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return null;
    return (data as GuideRow) ?? null;
  });
}

/* ===== מדריכי וידאו ===== */

export function mapVideoGuideRow(row: VideoGuideRow): VideoGuide {
  return {
    slug: row.slug,
    title: row.title,
    description: row.excerpt || row.description,
    duration: row.duration,
    tag: row.tags?.[0] ?? row.category?.name ?? "וידאו",
    isNew: row.is_new,
    level: row.level,
    gradient: row.gradient || defaultGradient(row.slug),
    thumbnail: row.thumbnail ?? undefined,
  };
}

export async function getPublishedVideoGuides(): Promise<VideoGuide[] | null> {
  return safe(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("video_guides")
      .select("*, category:categories(*)")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return null;
    return (data as VideoGuideRow[]).map(mapVideoGuideRow);
  });
}

export async function getVideoGuideRowBySlug(
  slug: string,
  preview = false
): Promise<VideoGuideRow | null> {
  return safe(async () => {
    if (preview) {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("video_guides")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .maybeSingle();
      return (data as VideoGuideRow) ?? null;
    }
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("video_guides")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return null;
    return (data as VideoGuideRow) ?? null;
  });
}
