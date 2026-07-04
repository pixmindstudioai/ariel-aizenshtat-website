-- ============================================================
-- Ariel AI — מערכת ניוזלטר (נרשמים + גיליונות + שליחה)
-- להריץ אחרי schema.sql. בטוח להרצה חוזרת.
-- ============================================================

-- ---------- נרשמים ----------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null default '',
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  unsubscribe_token uuid not null default gen_random_uuid(),
  source text not null default 'site',
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger newsletter_subscribers_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status);

-- ---------- גיליונות ----------
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preheader text not null default '',
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent')),
  sent_at timestamptz,
  sent_count int not null default 0,
  fail_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists newsletters_updated_at on public.newsletters;
create trigger newsletters_updated_at
  before update on public.newsletters
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletters enable row level security;

-- רשימת הנרשמים חסויה — קריאה לצוות בלבד, כתיבה לעורכים.
-- הציבור נרשם/מוסר רק דרך פונקציות ה-RPC למטה (security definer).
drop policy if exists "subscribers: staff read" on public.newsletter_subscribers;
create policy "subscribers: staff read" on public.newsletter_subscribers
  for select using (public.is_staff());

drop policy if exists "subscribers: editor write" on public.newsletter_subscribers;
create policy "subscribers: editor write" on public.newsletter_subscribers
  for all using (public.is_editor()) with check (public.is_editor());

drop policy if exists "newsletters: staff read" on public.newsletters;
create policy "newsletters: staff read" on public.newsletters
  for select using (public.is_staff());

drop policy if exists "newsletters: editor write" on public.newsletters;
create policy "newsletters: editor write" on public.newsletters
  for all using (public.is_editor()) with check (public.is_editor());

-- ---------- RPC ציבורי: הרשמה ----------
-- נקרא מטופס ההרשמה באתר. לא חושף את הטבלה — רק מוסיף/מחדש מנוי.
create or replace function public.newsletter_subscribe(p_email text, p_name text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_email text := lower(trim(p_email));
begin
  if clean_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid_email';
  end if;

  insert into public.newsletter_subscribers (email, full_name, source)
  values (clean_email, left(trim(coalesce(p_name, '')), 120), 'site')
  on conflict (email) do update
    set status = 'subscribed',
        unsubscribed_at = null,
        full_name = case
          when trim(coalesce(excluded.full_name, '')) <> '' then excluded.full_name
          else newsletter_subscribers.full_name
        end;
end;
$$;

revoke all on function public.newsletter_subscribe(text, text) from public;
grant execute on function public.newsletter_subscribe(text, text) to anon, authenticated;

-- ---------- RPC ציבורי: הסרה מרשימת התפוצה ----------
-- הקישור במייל מכיל טוקן ייחודי לכל נרשם.
create or replace function public.newsletter_unsubscribe(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated int;
begin
  update public.newsletter_subscribers
  set status = 'unsubscribed', unsubscribed_at = now()
  where unsubscribe_token = p_token and status = 'subscribed';
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;

revoke all on function public.newsletter_unsubscribe(uuid) from public;
grant execute on function public.newsletter_unsubscribe(uuid) to anon, authenticated;
