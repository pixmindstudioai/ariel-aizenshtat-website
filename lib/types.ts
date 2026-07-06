/** טיפוסי הדאטהבייס — תואמים 1:1 ל-database/schema.sql */

export type Role = "admin" | "editor" | "viewer";
export type ContentStatus = "draft" | "published" | "archived";
export type MessageStatus = "new" | "read" | "replied" | "archived";
export type CategoryType = "project" | "guide" | "video_guide" | "global";
export type ProjectType =
  | "video"
  | "website"
  | "landing_page"
  | "automation"
  | "guide"
  | "other";
export type ContentLevel = "מתחילים" | "בינוני" | "מתקדמים";

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsRow {
  id: string;
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  default_og_image: string | null;
  primary_cta_text: string;
  primary_cta_url: string;
  whatsapp_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null;
  footer_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PageRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  hero_title: string | null;
  hero_description: string | null;
  content_json: Record<string, unknown>;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image: string | null;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  content: string;
  category_id: string | null;
  project_type: ProjectType;
  cover_image: string | null;
  gallery: string[];
  video_url: string | null;
  external_url: string | null;
  tools: string[];
  tags: string[];
  client_name: string | null;
  year: number | null;
  gradient: string | null;
  result: string | null;
  is_new: boolean;
  featured: boolean;
  status: ContentStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  /** join אופציונלי */
  category?: CategoryRow | null;
}

export interface GuideRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string | null;
  cover_image: string | null;
  audio_url: string | null;
  show_toc: boolean;
  read_time: number;
  level: ContentLevel;
  tags: string[];
  is_new: boolean;
  featured: boolean;
  status: ContentStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  category?: CategoryRow | null;
}

export interface VideoGuideRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  video_url: string | null;
  thumbnail: string | null;
  duration: string;
  category_id: string | null;
  level: ContentLevel;
  tags: string[];
  gradient: string | null;
  is_new: boolean;
  featured: boolean;
  status: ContentStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  category?: CategoryRow | null;
}

export interface MediaRow {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text: string;
  caption: string | null;
  folder: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface ContactMessageRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  message: string;
  status: MessageStatus;
  source_page: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogRow {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  created_at: string;
  user?: Pick<ProfileRow, "full_name" | "email"> | null;
}

/** תוצאת פעולת שרת אחידה לכל הטפסים */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

/* ===== ניוזלטר ===== */

export type NewsletterStatus = "draft" | "sending" | "sent";
export type SubscriberStatus = "subscribed" | "unsubscribed";

export interface NewsletterRow {
  id: string;
  subject: string;
  preheader: string;
  content: string;
  status: NewsletterStatus;
  sent_at: string | null;
  sent_count: number;
  fail_count: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriberRow {
  id: string;
  email: string;
  full_name: string;
  status: SubscriberStatus;
  unsubscribe_token: string;
  source: string;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}
