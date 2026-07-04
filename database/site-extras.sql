-- ============================================================
-- Ariel AI — טבלאות תוכן משלימות לאתר הציבורי
-- workshops (עמוד הסדנאות) + faq_items + testimonials (עמוד הבית)
--
-- סדר הרצה: schema.sql → seed.sql → site-extras.sql
-- Supabase Dashboard → SQL Editor → New query → הדבקה והרצה
-- בטוח להרצה חוזרת.
-- ============================================================

-- ============================================================
-- workshops — סדנאות לחברות וארגונים (עמוד /workshops)
-- ============================================================

create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  audience text not null default '',
  duration text not null default '',
  description text not null default '',
  outline text[] not null default '{}',
  deliverables text[] not null default '{}',
  accent text not null default 'blue' check (accent in ('blue', 'purple', 'pink', 'coral')),
  is_new boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists workshops_updated_at on public.workshops;
create trigger workshops_updated_at
  before update on public.workshops
  for each row execute function public.set_updated_at();

alter table public.workshops enable row level security;

drop policy if exists "workshops: public read published" on public.workshops;
create policy "workshops: public read published" on public.workshops
  for select using (status = 'published' or public.is_staff());

drop policy if exists "workshops: editor write" on public.workshops;
create policy "workshops: editor write" on public.workshops
  for all using (public.is_editor()) with check (public.is_editor());

-- ============================================================
-- faq_items — שאלות נפוצות (עמוד הבית)
-- ============================================================

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists faq_items_updated_at on public.faq_items;
create trigger faq_items_updated_at
  before update on public.faq_items
  for each row execute function public.set_updated_at();

alter table public.faq_items enable row level security;

drop policy if exists "faq: public read published" on public.faq_items;
create policy "faq: public read published" on public.faq_items
  for select using (status = 'published' or public.is_staff());

drop policy if exists "faq: editor write" on public.faq_items;
create policy "faq: editor write" on public.faq_items
  for all using (public.is_editor()) with check (public.is_editor());

-- ============================================================
-- testimonials — לקוחות מרוצים (עמוד הבית)
-- ============================================================

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  quote text not null,
  accent text not null default 'blue' check (accent in ('blue', 'purple', 'pink', 'coral')),
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists testimonials_updated_at on public.testimonials;
create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

drop policy if exists "testimonials: public read published" on public.testimonials;
create policy "testimonials: public read published" on public.testimonials
  for select using (status = 'published' or public.is_staff());

drop policy if exists "testimonials: editor write" on public.testimonials;
create policy "testimonials: editor write" on public.testimonials
  for all using (public.is_editor()) with check (public.is_editor());

-- ============================================================
-- analytics_events — תנועת גולשים (הדשבורד "תנועת גולשים" באדמין)
-- הציבור רק מכניס אירועים; רק צוות קורא אותם.
-- ============================================================

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'guide_view', 'video_view', 'project_view')),
  page_path text not null,
  item_slug text,
  referrer text,
  visitor_id text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_path_idx
  on public.analytics_events (page_path);

alter table public.analytics_events enable row level security;

drop policy if exists "analytics: public insert" on public.analytics_events;
create policy "analytics: public insert" on public.analytics_events
  for insert with check (true);

drop policy if exists "analytics: staff read" on public.analytics_events;
create policy "analytics: staff read" on public.analytics_events
  for select using (public.is_staff());

drop policy if exists "analytics: admin delete" on public.analytics_events;
create policy "analytics: admin delete" on public.analytics_events
  for delete using (public.is_admin());

-- ============================================================
-- תוכן התחלתי — סדנאות
-- ============================================================

insert into public.workshops
  (slug, title, audience, duration, description, outline, deliverables, accent, is_new, status, sort_order)
values
  ('ai-for-teams', 'AI בארגון — מאפס לעבודה יומיומית',
   'צוותים ומנהלים בלי רקע טכני', '3-4 שעות',
   'הסדנה שמורידה את ה-AI מהבאזוורד אל השולחן: מה הכלים באמת יודעים לעשות, איפה הם חוסכים זמן כבר מחר בבוקר, ואיך כותבים פרומפט שמחזיר תשובה שאפשר לעבוד איתה.',
   array[
     'מפת הכלים 2026 — מה שווה את הזמן שלכם ומה אפשר לדלג',
     'פרומפטינג מעשי על משימות אמיתיות מהעבודה שלכם',
     'תרגול חי בקבוצות קטנות עם ליווי צמוד',
     'בניית ספריית פרומפטים ארגונית ראשונה'
   ],
   array[
     'ספריית פרומפטים מותאמת לתחום שלכם',
     'צ''קליסט הטמעה לצוות',
     'הקלטת הסדנה וחומרים כתובים'
   ],
   'blue', true, 'published', 1),
  ('ai-video-workshop', 'יוצרים וידאו עם AI',
   'צוותי שיווק, תוכן וקריאייטיב', 'חצי יום',
   'מרעיון לפרסומת מוכנה — בלי סט צילום. עוברים יחד את כל שרשרת ההפקה: תסריט, תמונות, וידאו, קריינות ועריכה, ויוצאים עם סרטון אמיתי שנוצר במהלך הסדנה.',
   array[
     'עקרונות תסריט וסטוריבורד שעובדים ב-AI',
     'הפקת שוטים: תמונה, תנועה וקריינות',
     'עריכה מהירה והתאמה לכל פלטפורמה',
     'הפקת סרטון שלם יחד — מאפס לפרסום'
   ],
   array[
     'סרטון ראשון שהפקתם בעצמכם',
     'תבנית פס ייצור לשימוש חוזר',
     'רשימת כלים והגדרות מומלצות'
   ],
   'pink', true, 'published', 2),
  ('vibe-coding', 'בונים מוצר עם Vibe Coding',
   'יזמים, מנהלי מוצר וצוותי חדשנות', 'יום מלא',
   'איך בונים אתר, כלי פנימי או אב-טיפוס שלם בעזרת סוכני קוד כמו Claude Code ו-Codex — גם בלי להיות מתכנתים. סדנת Hands-on שבסופה יש לכם מוצר עובד באוויר.',
   array[
     'היכרות עם סוכני קוד: Claude Code, Codex ו-OpenClaw',
     'מתארים נכון: איך הופכים רעיון להנחיות שעובדות',
     'בנייה חיה של פרויקט אמיתי מאפס',
     'העלאה לאוויר: דומיין, פריסה ותחזוקה'
   ],
   array[
     'מוצר / אתר עובד שבניתם בעצמכם',
     'סביבת עבודה מוכנה להמשך',
     'מדריך המשך-עבודה מסודר'
   ],
   'purple', false, 'published', 3),
  ('automation-workshop', 'אוטומציות שמחזירות שעות',
   'צוותי תפעול, מכירות ושירות', 'חצי יום',
   'ממפים יחד את התהליכים שגוזלים לכם הכי הרבה זמן — ובונים במקום אוטומציה אמיתית אחת לפחות, מקצה לקצה: מהטופס ועד הוואטסאפ, מהמייל ועד הדוח.',
   array[
     'מיפוי תהליכים: איפה מתחבא הזמן האבוד',
     'עקרונות חיבור מערכות: טפסים, CRM, וואטסאפ ומייל',
     'בנייה חיה של אוטומציה ארגונית ראשונה',
     'שילוב AI באמצע התהליך: סינון, ניסוח ותיעדוף'
   ],
   array[
     'אוטומציה עובדת אחת לפחות',
     'מפת אוטומציות מומלצת לארגון שלכם',
     'תבניות מוכנות לשכפול'
   ],
   'coral', false, 'published', 4)
on conflict (slug) do nothing;

-- ============================================================
-- תוכן התחלתי — שאלות נפוצות
-- ============================================================

insert into public.faq_items (question, answer, status, sort_order)
select * from (values
  ('כמה זמן לוקח לבנות אתר או דף נחיתה?',
   'דף נחיתה ממוקד — בין 3 ל-7 ימי עבודה. אתר תדמית מלא — שבועיים עד שלושה, תלוי בהיקף התוכן והעמודים. בזכות כלי AI, חלק גדול מהתהליך קורה מהר בהרבה ממה שהתרגלתם.',
   'published', 1),
  ('סרטון AI באמת יכול להיראות מקצועי?',
   'כן — כשמשלבים נכון בין הכלים. הסוד הוא לא ללחוץ על כפתור ולקוות לטוב, אלא תהליך מסודר: קונספט, תסריט, הפקת שוטים, עריכה וסאונד. התוצאה נראית כמו הפקה, בעלות של אחוזים ממנה.',
   'published', 2),
  ('אני לא טכנולוגי בכלל. זה מתאים לי?',
   'בדיוק בשבילכם. כל פרויקט מגיע עם הסבר ברור, מדריך שימוש בעברית פשוטה, וליווי עד שאתם מרגישים בנוח. המטרה היא שתוכלו לתפעל את מה שבניתי לכם — בלי תלות בי.',
   'published', 3),
  ('מה ההבדל בין אוטומציה לבוט?',
   'אוטומציה היא תהליך שרץ לבד ברקע (למשל: ליד חדש נכנס ל-CRM ומקבל מייל). בוט הוא ממשק שמדבר עם אנשים (למשל: צ''אט באתר). בדרך כלל הפתרון הכי טוב משלב את שניהם.',
   'published', 4),
  ('כמה עולה פרויקט?',
   'תלוי בהיקף — דף נחיתה, סרטון או אוטומציה מתחילים ברמות מחיר שונות. שלחו הודעה עם מה שאתם צריכים ותקבלו הצעה מסודרת תוך יום עבודה, בלי הפתעות ובלי אותיות קטנות.',
   'published', 5),
  ('אפשר להזמין הרצאה או סדנה לארגון?',
   'בהחלט. אני מעביר הרצאות וסדנאות מעשיות על AI לעסקים וצוותים — מהיכרות בסיסית ועד עבודה מעשית עם הכלים. ההרצאות מותאמות לקהל ולתחום של הארגון.',
   'published', 6)
) as v(question, answer, status, sort_order)
where not exists (select 1 from public.faq_items);

-- ============================================================
-- תוכן התחלתי — לקוחות מרוצים
-- ============================================================

insert into public.testimonials (name, role, quote, accent, status, sort_order)
select * from (values
  ('מיכל לוי', 'מנהלת שיווק, חברת הייטק',
   'אריאל לקח בריף מבולגן והחזיר דף נחיתה שהכפיל לנו את הלידים. התהליך היה מהיר, מקצועי, וכל שינוי שביקשנו קרה באותו יום.',
   'blue', 'published', 1),
  ('יוסי כהן', 'בעל עסק, סטודיו לכושר',
   'הפרסומת שעשה לנו ב-AI נראתה כמו הפקה של עשרות אלפי שקלים. הלקוחות שאלו איפה צילמנו — והכל נוצר במחשב.',
   'coral', 'published', 2),
  ('דנה אברהם', 'יוצרת תוכן',
   'האוטומציה שהוא בנה חוסכת לי יומיים בחודש. אני מעלה סרטון אחד — והמערכת מפזרת אותו לכל הפלטפורמות מעוצב ומותאם.',
   'pink', 'published', 3),
  ('אורי שמעוני', 'מנכ"ל סטארטאפ',
   'הזמנו הרצאת AI לצוות וקיבלנו הרבה יותר: תוך שבוע הצוות כבר עבד עם הכלים בעצמו. ממליץ לכל ארגון שרוצה להתקדם באמת.',
   'purple', 'published', 4)
) as v(name, role, quote, accent, status, sort_order)
where not exists (select 1 from public.testimonials);
