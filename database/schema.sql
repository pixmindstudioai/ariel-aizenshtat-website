-- ============================================================
-- Ariel AI — סכמת דאטהבייס מלאה לממשק הניהול
-- הרצה: Supabase Dashboard → SQL Editor → New query → הדבקה והרצה
-- הקובץ בטוח להרצה חוזרת (idempotent ככל האפשר).
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- פונקציות עזר
-- ============================================================

-- עדכון updated_at אוטומטי
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- profiles — משתמשים והרשאות
-- (הטבלה נוצרת לפני פונקציות ההרשאה — פונקציות sql מאומתות ביצירה)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- התפקיד של המשתמש המחובר (security definer כדי לא ליפול לרקורסיה ב-RLS)
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.my_role() = 'admin', false);
$$;

-- admin או editor — מי שמורשה לכתוב תוכן
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.my_role() in ('admin', 'editor'), false);
$$;

-- כל בעל תפקיד (כולל viewer) — קריאת נתוני אדמין
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.my_role() in ('admin', 'editor', 'viewer'), false);
$$;

-- כל משתמש חדש ב-Auth מקבל פרופיל אוטומטית.
-- מייל מנהל המערכת מקבל admin תמיד; חוץ ממנו — המשתמש הראשון שנרשם הופך
-- ל-admin וכל השאר viewer עד שאדמין משדרג אותם.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.email = 'aa046114609@gmail.com' then 'admin'
      when not exists (select 1 from public.profiles) then 'admin'
      else 'viewer'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- הגנה: רק admin יכול לשנות role או is_active (מונע השתדרגות עצמית).
-- כשאין משתמש מחובר (auth.uid() ריק) — זו הרצה ישירה מה-SQL Editor /
-- service role, ולא בקשה של גולש — ולכן מותרת.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.is_admin() then
    raise exception 'רק מנהל יכול לשנות הרשאות';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ============================================================
-- site_settings — הגדרות האתר (שורה אחת)
-- ============================================================

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  site_name text not null default 'Ariel AI',
  site_description text not null default '',
  logo_url text,
  favicon_url text,
  default_og_image text,
  primary_cta_text text not null default 'בואו נדבר',
  primary_cta_url text not null default '/contact',
  whatsapp_url text,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  linkedin_url text,
  email text,
  phone text,
  footer_text text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================
-- categories — קטגוריות (פרויקטים / מדריכים / וידאו / כללי)
-- ============================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  type text not null default 'global' check (type in ('project', 'guide', 'video_guide', 'global')),
  color text,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, slug)
);

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================
-- pages — עמודי האתר
-- ============================================================

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  hero_title text,
  hero_description text,
  content_json jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_image text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists pages_updated_at on public.pages;
create trigger pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- ============================================================
-- projects — פרויקטים
-- ============================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  description text not null default '',
  content text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  project_type text not null default 'other'
    check (project_type in ('video', 'website', 'landing_page', 'automation', 'guide', 'other')),
  cover_image text,
  gallery jsonb not null default '[]'::jsonb,
  video_url text,
  external_url text,
  tools text[] not null default '{}',
  tags text[] not null default '{}',
  client_name text,
  year int,
  gradient text,
  result text,
  is_new boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_category_idx on public.projects (category_id);
create index if not exists projects_sort_idx on public.projects (sort_order);

-- ============================================================
-- guides — מדריכים כתובים
-- ============================================================

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  cover_image text,
  audio_url text,
  show_toc boolean not null default false,
  read_time int not null default 5,
  level text not null default 'מתחילים' check (level in ('מתחילים', 'בינוני', 'מתקדמים')),
  tags text[] not null default '{}',
  is_new boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists guides_updated_at on public.guides;
create trigger guides_updated_at
  before update on public.guides
  for each row execute function public.set_updated_at();

create index if not exists guides_status_idx on public.guides (status);

-- ============================================================
-- video_guides — מדריכי וידאו
-- ============================================================

create table if not exists public.video_guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  description text not null default '',
  video_url text,
  thumbnail text,
  duration text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  level text not null default 'מתחילים' check (level in ('מתחילים', 'בינוני', 'מתקדמים')),
  tags text[] not null default '{}',
  gradient text,
  is_new boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists video_guides_updated_at on public.video_guides;
create trigger video_guides_updated_at
  before update on public.video_guides
  for each row execute function public.set_updated_at();

create index if not exists video_guides_status_idx on public.video_guides (status);

-- ============================================================
-- media — ספריית מדיה
-- ============================================================

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  file_type text not null default '',
  file_size bigint not null default 0,
  alt_text text not null default '',
  caption text,
  folder text not null default 'general',
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists media_folder_idx on public.media (folder);

-- ============================================================
-- contact_messages — פניות מטופס צור קשר
-- ============================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  project_type text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  source_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists contact_messages_updated_at on public.contact_messages;
create trigger contact_messages_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

create index if not exists contact_messages_status_idx on public.contact_messages (status);

-- ============================================================
-- activity_log — יומן פעילות
-- ============================================================

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_idx on public.activity_log (created_at desc);

-- ============================================================
-- RLS — Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.pages enable row level security;
alter table public.projects enable row level security;
alter table public.guides enable row level security;
alter table public.video_guides enable row level security;
alter table public.media enable row level security;
alter table public.contact_messages enable row level security;
alter table public.activity_log enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles: staff read" on public.profiles;
create policy "profiles: staff read" on public.profiles
  for select using (public.is_staff() or id = auth.uid());

drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self update" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: admin delete" on public.profiles;
create policy "profiles: admin delete" on public.profiles
  for delete using (public.is_admin());

-- ---------- site_settings ----------
drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read" on public.site_settings
  for select using (true);

drop policy if exists "settings: admin write" on public.site_settings;
create policy "settings: admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- categories ----------
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories
  for select using (true);

drop policy if exists "categories: editor write" on public.categories;
create policy "categories: editor write" on public.categories
  for all using (public.is_editor()) with check (public.is_editor());

-- ---------- pages ----------
drop policy if exists "pages: public read published" on public.pages;
create policy "pages: public read published" on public.pages
  for select using (status = 'published' or public.is_staff());

drop policy if exists "pages: editor write" on public.pages;
create policy "pages: editor write" on public.pages
  for all using (public.is_editor()) with check (public.is_editor());

-- ---------- projects ----------
drop policy if exists "projects: public read published" on public.projects;
create policy "projects: public read published" on public.projects
  for select using (status = 'published' or public.is_staff());

drop policy if exists "projects: editor write" on public.projects;
create policy "projects: editor write" on public.projects
  for all using (public.is_editor()) with check (public.is_editor());

-- ---------- guides ----------
drop policy if exists "guides: public read published" on public.guides;
create policy "guides: public read published" on public.guides
  for select using (status = 'published' or public.is_staff());

drop policy if exists "guides: editor write" on public.guides;
create policy "guides: editor write" on public.guides
  for all using (public.is_editor()) with check (public.is_editor());

-- ---------- video_guides ----------
drop policy if exists "video_guides: public read published" on public.video_guides;
create policy "video_guides: public read published" on public.video_guides
  for select using (status = 'published' or public.is_staff());

drop policy if exists "video_guides: editor write" on public.video_guides;
create policy "video_guides: editor write" on public.video_guides
  for all using (public.is_editor()) with check (public.is_editor());

-- ---------- media ----------
drop policy if exists "media: staff read" on public.media;
create policy "media: staff read" on public.media
  for select using (public.is_staff());

drop policy if exists "media: editor write" on public.media;
create policy "media: editor write" on public.media
  for all using (public.is_editor()) with check (public.is_editor());

-- ---------- contact_messages ----------
-- הציבור יכול לשלוח פנייה (insert בלבד) — אבל לא לקרוא פניות
drop policy if exists "messages: public insert" on public.contact_messages;
create policy "messages: public insert" on public.contact_messages
  for insert with check (true);

drop policy if exists "messages: staff read" on public.contact_messages;
create policy "messages: staff read" on public.contact_messages
  for select using (public.is_staff());

drop policy if exists "messages: editor update" on public.contact_messages;
create policy "messages: editor update" on public.contact_messages
  for update using (public.is_editor()) with check (public.is_editor());

drop policy if exists "messages: admin delete" on public.contact_messages;
create policy "messages: admin delete" on public.contact_messages
  for delete using (public.is_admin());

-- ---------- activity_log ----------
drop policy if exists "activity: staff read" on public.activity_log;
create policy "activity: staff read" on public.activity_log
  for select using (public.is_staff());

drop policy if exists "activity: editor insert" on public.activity_log;
create policy "activity: editor insert" on public.activity_log
  for insert with check (public.is_editor() and user_id = auth.uid());

-- ============================================================
-- Storage — bucket מדיה ציבורי
-- כל המדיה של האתר (תמונות, וידאו, אודיו, PDF) נשמרת כאן בלבד —
-- בלי שירותי אחסון חיצוניים (יוטיוב/וימאו).
-- מגבלת גודל: 500MB לקובץ (וידאו). שימו לב: בתוכנית Free של Supabase
-- יש גם מגבלה גלובלית לפרויקט (ברירת מחדל 50MB) — מעלים אותה ב:
-- Dashboard → Project Settings → Storage → Upload file size limit.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  524288000, -- 500MB
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav',
    'audio/ogg', 'audio/aac', 'audio/flac',
    'application/pdf'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media bucket: public read" on storage.objects;
create policy "media bucket: public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media bucket: editor insert" on storage.objects;
create policy "media bucket: editor insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_editor());

drop policy if exists "media bucket: editor update" on storage.objects;
create policy "media bucket: editor update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_editor());

drop policy if exists "media bucket: editor delete" on storage.objects;
create policy "media bucket: editor delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_editor());
