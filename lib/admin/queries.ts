import { createServerClient } from "@/lib/supabase/server";
import type {
  ActivityLogRow,
  CategoryRow,
  CategoryType,
  ContactMessageRow,
  ContentStatus,
  GuideRow,
  MediaRow,
  PageRow,
  ProfileRow,
  ProjectRow,
  SiteSettingsRow,
  VideoGuideRow,
} from "@/lib/types";

/** שאילתות לצד האדמין — רצות עם עוגיות המשתמש, RLS אוכף הרשאות */

export interface DashboardStats {
  projects: number;
  guides: number;
  videoGuides: number;
  newMessages: number;
  publishedPages: number;
  drafts: number;
  mediaCount: number;
  lastUpdated: string | null;
}

async function countRows(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  table: string,
  filter?: { column: string; value: string }
): Promise<number> {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count } = await query;
  return count ?? 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerClient();

  const [
    projects,
    guides,
    videoGuides,
    newMessages,
    publishedPages,
    draftProjects,
    draftGuides,
    draftVideoGuides,
    mediaCount,
    lastProject,
  ] = await Promise.all([
    countRows(supabase, "projects"),
    countRows(supabase, "guides"),
    countRows(supabase, "video_guides"),
    countRows(supabase, "contact_messages", { column: "status", value: "new" }),
    countRows(supabase, "pages", { column: "status", value: "published" }),
    countRows(supabase, "projects", { column: "status", value: "draft" }),
    countRows(supabase, "guides", { column: "status", value: "draft" }),
    countRows(supabase, "video_guides", { column: "status", value: "draft" }),
    countRows(supabase, "media"),
    supabase
      .from("projects")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    projects,
    guides,
    videoGuides,
    newMessages,
    publishedPages,
    drafts: draftProjects + draftGuides + draftVideoGuides,
    mediaCount,
    lastUpdated: lastProject.data?.updated_at ?? null,
  };
}

export async function getRecentActivity(limit = 8): Promise<ActivityLogRow[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("activity_log")
    .select("*, user:profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityLogRow[];
}

export async function getRecentMessages(limit = 5): Promise<ContactMessageRow[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ContactMessageRow[];
}

export interface Recommendation {
  id: string;
  text: string;
  href: string;
}

/** המלצות חכמות לדאשבורד — נגזרות מהנתונים עצמם */
export async function getRecommendations(): Promise<Recommendation[]> {
  const supabase = await createServerClient();
  const recommendations: Recommendation[] = [];

  const [draftProjects, draftGuides, newMessages, homePage, noCover] = await Promise.all([
    countRows(supabase, "projects", { column: "status", value: "draft" }),
    countRows(supabase, "guides", { column: "status", value: "draft" }),
    countRows(supabase, "contact_messages", { column: "status", value: "new" }),
    supabase.from("pages").select("updated_at").eq("slug", "home").maybeSingle(),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .or("cover_image.is.null,cover_image.eq."),
  ]);

  const totalDrafts = draftProjects + draftGuides;
  if (totalDrafts > 0) {
    recommendations.push({
      id: "drafts",
      text: `יש ${totalDrafts} טיוטות שעדיין לא פורסמו`,
      href: draftProjects > 0 ? "/admin/projects?status=draft" : "/admin/guides?status=draft",
    });
  }
  if (newMessages > 0) {
    recommendations.push({
      id: "messages",
      text: `יש ${newMessages} פניות חדשות שמחכות למענה`,
      href: "/admin/messages",
    });
  }
  if (homePage.data?.updated_at) {
    const days = Math.floor(
      (Date.now() - new Date(homePage.data.updated_at).getTime()) / 86_400_000
    );
    if (days >= 14) {
      recommendations.push({
        id: "home-stale",
        text: `עמוד הבית עודכן לאחרונה לפני ${days} ימים`,
        href: "/admin/pages/home",
      });
    }
  }
  if ((noCover.count ?? 0) > 0) {
    recommendations.push({
      id: "no-cover",
      text: `יש ${noCover.count} פרויקטים מפורסמים בלי תמונת קאבר`,
      href: "/admin/projects",
    });
  }

  return recommendations;
}

/* ===== פרויקטים ===== */

export interface ProjectFilters {
  search?: string;
  status?: ContentStatus;
  categoryId?: string;
  projectType?: string;
  sort?: "manual" | "newest" | "oldest";
}

export async function listProjects(filters: ProjectFilters = {}): Promise<ProjectRow[]> {
  const supabase = await createServerClient();
  let query = supabase.from("projects").select("*, category:categories(*)");

  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.projectType) query = query.eq("project_type", filters.projectType);

  if (filters.sort === "newest") query = query.order("created_at", { ascending: false });
  else if (filters.sort === "oldest") query = query.order("created_at", { ascending: true });
  else query = query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });

  const { data } = await query;
  return (data ?? []) as ProjectRow[];
}

export async function getProjectById(id: string): Promise<ProjectRow | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  return (data as ProjectRow) ?? null;
}

/* ===== מדריכים ===== */

export interface GuideFilters {
  search?: string;
  status?: ContentStatus;
  categoryId?: string;
}

export async function listGuides(filters: GuideFilters = {}): Promise<GuideRow[]> {
  const supabase = await createServerClient();
  let query = supabase.from("guides").select("*, category:categories(*)");
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  const { data } = await query
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as GuideRow[];
}

export async function getGuideById(id: string): Promise<GuideRow | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("guides").select("*").eq("id", id).maybeSingle();
  return (data as GuideRow) ?? null;
}

/* ===== מדריכי וידאו ===== */

export async function listVideoGuides(filters: GuideFilters = {}): Promise<VideoGuideRow[]> {
  const supabase = await createServerClient();
  let query = supabase.from("video_guides").select("*, category:categories(*)");
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  const { data } = await query
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as VideoGuideRow[];
}

export async function getVideoGuideById(id: string): Promise<VideoGuideRow | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("video_guides").select("*").eq("id", id).maybeSingle();
  return (data as VideoGuideRow) ?? null;
}

/* ===== עמודים ===== */

export async function listPages(): Promise<PageRow[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as PageRow[];
}

export async function getPageBySlugAdmin(slug: string): Promise<PageRow | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
  return (data as PageRow) ?? null;
}

/* ===== קטגוריות ===== */

export async function listCategories(type?: CategoryType): Promise<CategoryRow[]> {
  const supabase = await createServerClient();
  let query = supabase.from("categories").select("*");
  if (type) query = query.eq("type", type);
  const { data } = await query
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true });
  return (data ?? []) as CategoryRow[];
}

/** כמה פריטי תוכן משויכים לכל קטגוריה — לאזהרת מחיקה */
export async function getCategoryUsage(categoryId: string): Promise<number> {
  const supabase = await createServerClient();
  const [p, g, v] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("category_id", categoryId),
    supabase.from("guides").select("id", { count: "exact", head: true }).eq("category_id", categoryId),
    supabase.from("video_guides").select("id", { count: "exact", head: true }).eq("category_id", categoryId),
  ]);
  return (p.count ?? 0) + (g.count ?? 0) + (v.count ?? 0);
}

/* ===== מדיה ===== */

export async function listMedia(filters: { search?: string; folder?: string } = {}): Promise<MediaRow[]> {
  const supabase = await createServerClient();
  let query = supabase.from("media").select("*");
  if (filters.search) query = query.ilike("file_name", `%${filters.search}%`);
  if (filters.folder) query = query.eq("folder", filters.folder);
  const { data } = await query.order("created_at", { ascending: false });
  return (data ?? []) as MediaRow[];
}

/* ===== הודעות ===== */

export async function listMessages(filters: { search?: string; status?: string } = {}): Promise<ContactMessageRow[]> {
  const supabase = await createServerClient();
  let query = supabase.from("contact_messages").select("*");
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search)
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  const { data } = await query.order("created_at", { ascending: false });
  return (data ?? []) as ContactMessageRow[];
}

/* ===== משתמשים ===== */

export async function listProfiles(): Promise<ProfileRow[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  return (data ?? []) as ProfileRow[];
}

/* ===== הגדרות ===== */

export async function getSiteSettingsAdmin(): Promise<SiteSettingsRow | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("site_settings").select("*").maybeSingle();
  return (data as SiteSettingsRow) ?? null;
}

/* ===== סטטיסטיקות ===== */

export interface AnalyticsData {
  stats: DashboardStats;
  messagesByMonth: { month: string; count: number }[];
  projectsByCategory: { name: string; count: number; color: string | null }[];
  contentByStatus: { status: ContentStatus; projects: number; guides: number; videoGuides: number }[];
  latestContent: { type: string; title: string; href: string; created_at: string }[];
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const supabase = await createServerClient();
  const stats = await getDashboardStats();

  const [messages, projects, categories, guides, videoGuides] = await Promise.all([
    supabase.from("contact_messages").select("created_at"),
    supabase.from("projects").select("id, title, category_id, status, created_at"),
    supabase.from("categories").select("*").eq("type", "project"),
    supabase.from("guides").select("id, title, status, created_at"),
    supabase.from("video_guides").select("id, title, status, created_at"),
  ]);

  // פניות לפי חודש — 6 חודשים אחרונים
  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const months: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: monthKey(d), count: 0 });
  }
  for (const m of messages.data ?? []) {
    const key = monthKey(new Date(m.created_at));
    const bucket = months.find((b) => b.month === key);
    if (bucket) bucket.count++;
  }

  const projectRows = projects.data ?? [];
  const projectsByCategory = (categories.data ?? []).map((c) => ({
    name: c.name as string,
    color: c.color as string | null,
    count: projectRows.filter((p) => p.category_id === c.id).length,
  }));

  const statuses: ContentStatus[] = ["published", "draft", "archived"];
  const guideRows = guides.data ?? [];
  const videoRows = videoGuides.data ?? [];
  const contentByStatus = statuses.map((status) => ({
    status,
    projects: projectRows.filter((p) => p.status === status).length,
    guides: guideRows.filter((g) => g.status === status).length,
    videoGuides: videoRows.filter((v) => v.status === status).length,
  }));

  const latestContent = [
    ...projectRows.map((p) => ({
      type: "פרויקט",
      title: p.title as string,
      href: `/admin/projects/${p.id}`,
      created_at: p.created_at as string,
    })),
    ...guideRows.map((g) => ({
      type: "מדריך",
      title: g.title as string,
      href: `/admin/guides/${g.id}`,
      created_at: g.created_at as string,
    })),
    ...videoRows.map((v) => ({
      type: "מדריך וידאו",
      title: v.title as string,
      href: `/admin/video-guides/${v.id}`,
      created_at: v.created_at as string,
    })),
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);

  return { stats, messagesByMonth: months, projectsByCategory, contentByStatus, latestContent };
}
