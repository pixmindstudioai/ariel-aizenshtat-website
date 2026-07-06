-- סקירה קולית + תוכן עניינים למדריכים כתובים
-- הרצה: Supabase Dashboard → SQL Editor → הדבקה והרצה (בטוח להריץ שוב)

alter table public.guides add column if not exists audio_url text;
alter table public.guides add column if not exists show_toc boolean not null default false;
