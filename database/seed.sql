-- ============================================================
-- Ariel AI — נתוני התחלה (Seed)
-- להריץ אחרי schema.sql. בטוח להרצה חוזרת — לא דורס תוכן קיים.
-- כל התוכן כאן ניתן לעריכה מלאה דרך ממשק הניהול.
-- ============================================================

-- ---------- משתמש מנהל המערכת ----------
-- משלים פרופילים למשתמשי Auth שנוצרו לפני הרצת הסכמה,
-- מוודא ש-aa046114609@gmail.com הוא admin, ומאשר את המייל שלו
-- (כדי שלא צריך ללחוץ על קישור האימות שנשלח בהרשמה).

insert into public.profiles (id, email, full_name, role)
select u.id, coalesce(u.email, ''), '', 'viewer'
from auth.users u
on conflict (id) do nothing;

update public.profiles
set role = 'admin', is_active = true
where email = 'aa046114609@gmail.com';

update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'aa046114609@gmail.com';

-- ---------- הגדרות האתר ----------
insert into public.site_settings
  (site_name, site_description, primary_cta_text, primary_cta_url,
   whatsapp_url, email, footer_text, seo_title, seo_description, seo_keywords)
values
  ('Ariel AI',
   'פורטפוליו אישי של Ariel AI: פרויקטי וידאו, אתרים, דפי נחיתה, מדריכים כתובים, מדריכי וידאו ופתרונות AI לעסקים ויוצרים.',
   'בואו נבנה משהו מגניב',
   '/contact',
   'https://wa.me/972534122548',
   'pixmindstudio3316@gmail.com',
   'יוצר. טכנולוגי. בונה חוויות. אתרים, סרטוני AI, אוטומציות ומדריכים — הכל במקום אחד, בעברית ובגובה העיניים.',
   'Ariel AI - יוצר חוויות דיגיטליות עם בינה מלאכותית',
   'פורטפוליו אישי של Ariel AI: פרויקטי וידאו, אתרים, דפי נחיתה, מדריכים כתובים, מדריכי וידאו ופתרונות AI לעסקים ויוצרים.',
   'בינה מלאכותית, AI, יצירת וידאו, פרסומות AI, בניית אתרים, דפי נחיתה, מדריכים, Ariel AI')
on conflict (singleton) do nothing;

-- ---------- קטגוריות ----------
insert into public.categories (name, slug, description, type, color, sort_order) values
  ('פרויקטי וידאו', 'video', 'פרסומות, סרטוני מוצר וסדרות תוכן שנוצרו עם AI', 'project', '#ff7ac8', 1),
  ('אתרים ודפי נחיתה', 'websites', 'אתרי תדמית, דפי נחיתה וחנויות', 'project', '#4f7bff', 2),
  ('אוטומציות וכלים דיגיטליים', 'automation', 'בוטים, אינטגרציות ותהליכים אוטומטיים', 'project', '#22c55e', 3),
  ('Claude Code', 'claude-code', 'בנייה ופיתוח עם Claude Code', 'guide', '#7c5cff', 1),
  ('פרומפטינג', 'prompting', 'כתיבת פרומפטים מדויקים', 'guide', '#4f7bff', 2),
  ('וידאו AI', 'video-ai', 'יצירת וידאו עם בינה מלאכותית', 'guide', '#ff7ac8', 3),
  ('שיווק', 'marketing', 'דפי נחיתה, המרות ותוכן שיווקי', 'guide', '#f59e0b', 4),
  ('אוטומציות', 'automations', 'תהליכים אוטומטיים לעסק', 'guide', '#22c55e', 5),
  ('מתקדם', 'advanced', 'נושאים טכניים מתקדמים', 'guide', '#e77455', 6),
  ('Claude Code', 'claude-code', 'שידורים חיים ובנייה עם Claude Code', 'video_guide', '#7c5cff', 1),
  ('וידאו AI', 'video-ai', 'הפקת וידאו עם AI', 'video_guide', '#ff7ac8', 2),
  ('אוטומציות', 'automations', 'אוטומציות הלכה למעשה', 'video_guide', '#22c55e', 3),
  ('פרומפטינג', 'prompting', 'פרומפטים לעומק', 'video_guide', '#4f7bff', 4),
  ('עיצוב', 'design', 'עיצוב ממיר ו-UI', 'video_guide', '#f59e0b', 5),
  ('תוכן', 'content', 'מערכות תוכן ליוצרים', 'video_guide', '#0ea5e9', 6)
on conflict (type, slug) do nothing;

-- ---------- עמודים ----------
insert into public.pages (slug, title, subtitle, hero_title, hero_description, content_json, seo_title, seo_description, status, sort_order) values
  ('home', 'עמוד הבית', null,
   'יוצר. טכנולוגי. בונה חוויות.',
   'אני עוזר לעסקים, יוצרים וחברות להפוך רעיונות לפרויקטים דיגיטליים חיים: אתרים, דפי נחיתה, סרטוני AI, מדריכים, אוטומציות וחוויות תוכן שנראות טוב — ועובדות באמת.',
   jsonb_build_object(
     'services_title', 'מה אני עושה',
     'services_subtitle', 'ארבעה עולמות, ראש אחד: קוד, וידאו, ידע ואוטומציה — כל מה שעסק צריך כדי לזוז מהר',
     'projects_title', 'פרויקטים אחרונים',
     'projects_subtitle', 'הצצה לעבודות שיצאו לאוויר לאחרונה — מוידאו ועד אוטומציה',
     'team_title', 'הצוות הקטן שלי',
     'team_subtitle', 'שלושה עוזרים דיגיטליים שעובדים איתי מסביב לשעון — בלי הפסקות קפה',
     'cta_title', 'יש לכם רעיון? בואו נהפוך אותו למשהו חי',
     'cta_subtitle', 'ספרו לי מה אתם צריכים — אתר, סרטון, אוטומציה או הכל ביחד — ותקבלו תשובה עוד היום.'
   ),
   'Ariel AI - יוצר חוויות דיגיטליות עם בינה מלאכותית',
   'פורטפוליו אישי של Ariel AI: פרויקטי וידאו, אתרים, דפי נחיתה, מדריכים ופתרונות AI.',
   'published', 1),
  ('portfolio', 'תיק עבודות', null,
   'תיק העבודות שלי',
   'וידאו, אתרים ואוטומציות — כל הפרויקטים במקום אחד. בחרו קטגוריה או פשוט תגללו.',
   jsonb_build_object(
     'process_title', 'איך אני עובד',
     'process_subtitle', 'שלושה שלבים פשוטים בין הרעיון שלכם לפרויקט הבא בתיק',
     'step1_title', 'שיחת היכרות',
     'step1_description', 'מספרים לי על העסק ועל המטרה, ואני חוזר אליכם עם כיוון ברור — בלי ז''רגון ובלי התחייבות.',
     'step2_title', 'הצעה ותכנון',
     'step2_description', 'מקבלים הצעה מסודרת: לוח זמנים, מחיר ותוצרים מוגדרים. יודעים בדיוק מה מקבלים ומתי.',
     'step3_title', 'בנייה ומסירה',
     'step3_description', 'אני בונה, מעדכן אתכם לאורך הדרך, ומוסר תוצר מוכן לעבודה — כולל הסבר קצר איך הכל פועל.',
     'cta_title', 'אהבתם את מה שראיתם?',
     'cta_subtitle', 'הפרויקט הבא בתיק יכול להיות שלכם — ספרו לי מה אתם צריכים ונצא לדרך.'
   ),
   'תיק עבודות',
   'כל הפרויקטים במקום אחד — סרטוני AI, אתרים ודפי נחיתה, אוטומציות וכלים דיגיטליים.',
   'published', 2),
  ('portfolio-video', 'פרויקטי וידאו', null,
   'פרויקטי וידאו',
   'פרסומות, סרטוני מוצר וסדרות תוכן — הכל נוצר עם AI ובקצב של טרנדים.',
   jsonb_build_object(
     'works_title', 'העבודות',
     'works_subtitle', 'כל פרויקט התחיל מרעיון של לקוח — ונגמר בסרטון שעושה בדיוק את העבודה',
     'production_title', 'מה אפשר להפיק',
     'production_subtitle', 'ארבעה פורמטים שעובדים הכי טוב לעסקים — ואם יש לכם רעיון אחר, נמציא פורמט חמישי',
     'cta_title', 'יש לכם סיפור? בואו נהפוך אותו לסרטון',
     'cta_subtitle', 'ספרו לי מה אתם רוצים להראות לעולם — פרסומת, סרטון מוצר או סדרה שלמה — ותקבלו כיוון ראשוני עוד היום.'
   ),
   'פרויקטי וידאו',
   'פרסומות AI, סרטוני מוצר וסדרות תוכן שנוצרו בבינה מלאכותית.',
   'published', 3),
  ('portfolio-websites', 'אתרים ודפי נחיתה', null,
   'אתרים ודפי נחיתה',
   'אתרי תדמית, דפי נחיתה ממירים וחנויות — מהירים, יפים ובנויים נכון.',
   jsonb_build_object(
     'works_title', 'פרויקטים נבחרים',
     'works_subtitle', 'מדף נחיתה ממיר ועד חנות מלאה — הצצה לאתרים שכבר באוויר',
     'principles_title', 'מה חשוב באתר שעובד',
     'principles_subtitle', 'ארבעה דברים שאני לא מתפשר עליהם באף פרויקט — כי הם ההבדל בין אתר יפה לאתר שמכניס כסף',
     'cta_title', 'רוצים אתר שעובד בשבילכם?',
     'cta_subtitle', 'ספרו לי על העסק ועל המטרה — ותקבלו הצעה ברורה לאתר או דף נחיתה שמביא תוצאות.'
   ),
   'אתרים ודפי נחיתה',
   'אתרי תדמית, דפי נחיתה ממירים וחנויות אונליין.',
   'published', 4),
  ('portfolio-automation', 'אוטומציות וכלים', null,
   'אוטומציות וכלים דיגיטליים',
   'בוטים, אינטגרציות ותהליכים אוטומטיים שחוסכים שעות עבודה בכל שבוע.',
   jsonb_build_object(
     'behind_description', 'קצת קוד, הרבה סדר: כל אוטומציה נבנית כך שהיא רצה בשקט ברקע, מטפלת במקרי קצה, ומדווחת לכם רק כשבאמת צריך. אתם רואים תוצאה — היא עושה את העבודה.',
     'examples_title', 'תהליך שחוזר על עצמו? מכונה תעשה אותו',
     'examples_subtitle', 'אם אתם עושים משהו יותר מפעמיים בשבוע — כנראה שאפשר להפסיק. הנה שלוש דוגמאות מהחיים',
     'cta_title', 'יש לכם משימה שנמאס לכם לעשות ידנית?',
     'cta_subtitle', 'ספרו לי על התהליך — סביר להניח שאפשר להפוך אותו לאוטומציה שרצה לבד, ולפנות לכם את הזמן לדברים החשובים.'
   ),
   'אוטומציות וכלים דיגיטליים',
   'בוטים, אינטגרציות ותהליכים אוטומטיים לעסקים.',
   'published', 5),
  ('guides', 'מדריכים כתובים', null,
   'מדריכים כתובים',
   'ידע מעשי בעברית — צעד אחר צעד, בלי ז''רגון מיותר. בוחרים מדריך ומתחילים לבנות.',
   '{}'::jsonb,
   'מדריכים כתובים',
   'מדריכים מעשיים בעברית על AI, בניית אתרים, פרומפטינג ואוטומציות.',
   'published', 6),
  ('video-guides', 'מדריכי וידאו', null,
   'מדריכי וידאו',
   'לצפות, לעצור, לנסות בעצמכם — מדריכים מוקלטים שמראים הכל מהמסך שלי.',
   '{}'::jsonb,
   'מדריכי וידאו',
   'מדריכי וידאו בעברית: בנייה חיה, פרסומות AI, אוטומציות ועוד.',
   'published', 7),
  ('about', 'אודות', null,
   'נעים להכיר, אני אריאל',
   'יוצר, מרצה ובונה חוויות דיגיטליות. אני מחבר בין עולם הקוד לעולם התוכן — ועוזר לאנשים לבנות דברים אמיתיים עם AI.',
   '{}'::jsonb,
   'אודות',
   'מי אני, מה אני עושה, ולמה AI הוא הכלי הכי מרגש שיש היום לבנות איתו.',
   'published', 8),
  ('contact', 'צור קשר', null,
   'בואו נדבר',
   'ספרו לי מה אתם צריכים — אתר, סרטון, אוטומציה או סתם רעיון שמסתובב לכם בראש. אני עונה לכל הודעה תוך יום עבודה.',
   '{}'::jsonb,
   'צור קשר',
   'רוצים אתר, סרטון AI או אוטומציה לעסק? השאירו הודעה — מענה תוך יום עבודה.',
   'published', 9)
-- עמוד קיים: מוסיפים רק מפתחות תוכן חדשים ל-content_json; ערכים שנערכו באדמין נשמרים
on conflict (slug) do update
  set content_json = excluded.content_json || pages.content_json;

-- ---------- פרויקטים ----------
insert into public.projects
  (title, slug, excerpt, description, category_id, project_type, tags, client_name, year, gradient, result, is_new, featured, status, sort_order)
values
  ('פרסומת AI למותג אופנה', 'ai-ad-fashion',
   'פרסומת מלאה שנוצרה בבינה מלאכותית — מקונספט ותסריט ועד עריכה וסאונד. 30 שניות של וואו לקמפיין השקה.',
   'פרסומת מלאה שנוצרה בבינה מלאכותית — מקונספט ותסריט ועד עריכה וסאונד. 30 שניות של וואו לקמפיין השקה.',
   (select id from public.categories where type = 'project' and slug = 'video'), 'video',
   array['פרסומת AI', 'Seedance', 'עריכה'], 'מותג אופנה ישראלי', 2026,
   'from-[#ff7ac8] to-[#7c5cff]', 'פי 3 יותר קליקים מהפרסומת הקודמת של המותג', true, true, 'published', 1),
  ('סרטון השקה למוצר טכנולוגי', 'product-launch-video',
   'סרטון מוצר תלת-ממדי עם מושן גרפיקס, שהפך מסמך אפיון יבש לסיפור ויזואלי שמוכר את החזון.',
   'סרטון מוצר תלת-ממדי עם מושן גרפיקס, שהפך מסמך אפיון יבש לסיפור ויזואלי שמוכר את החזון.',
   (select id from public.categories where type = 'project' and slug = 'video'), 'video',
   array['מושן גרפיקס', '3D', 'השקה'], 'סטארטאפ SaaS', 2026,
   'from-[#4f7bff] to-[#7c5cff]', 'הוצג בכנס ההשקה מול 2,000 משתתפים', false, true, 'published', 2),
  ('סדרת סרטוני רשת חודשית', 'social-series',
   'ליווי חודשי של יוצר תוכן: 12 סרטונים קצרים בחודש, כולל תסריט, קריינות AI ועריכה בקצב של טרנדים.',
   'ליווי חודשי של יוצר תוכן: 12 סרטונים קצרים בחודש, כולל תסריט, קריינות AI ועריכה בקצב של טרנדים.',
   (select id from public.categories where type = 'project' and slug = 'video'), 'video',
   array['רילס', 'תוכן שוטף', 'קריינות AI'], null, 2025,
   'from-[#e77455] to-[#ff7ac8]', 'צמיחה של 40K עוקבים בחצי שנה', false, false, 'published', 3),
  ('סרטון הסבר לאפליקציית פינטק', 'explainer-fintech',
   'אנימציית הסבר של 60 שניות שמפשטת מוצר פיננסי מורכב לשפה שכל משתמש מבין.',
   'אנימציית הסבר של 60 שניות שמפשטת מוצר פיננסי מורכב לשפה שכל משתמש מבין.',
   (select id from public.categories where type = 'project' and slug = 'video'), 'video',
   array['אנימציה', 'Explainer', 'UX'], 'חברת פינטק', 2025,
   'from-[#7c5cff] to-[#4f7bff]', null, false, false, 'published', 4),
  ('דף נחיתה לסדנת AI', 'landing-workshop',
   'דף נחיתה ממיר לסדנה בתשלום: כתיבה שיווקית, עיצוב, טופס הרשמה ואינטגרציה מלאה לתשלומים.',
   'דף נחיתה ממיר לסדנה בתשלום: כתיבה שיווקית, עיצוב, טופס הרשמה ואינטגרציה מלאה לתשלומים.',
   (select id from public.categories where type = 'project' and slug = 'websites'), 'landing_page',
   array['דף נחיתה', 'המרות', 'Next.js'], null, 2026,
   'from-[#4f7bff] to-[#22d3ee]', '18% יחס המרה בקמפיין הראשון', true, true, 'published', 5),
  ('אתר תדמית לסטודיו קריאייטיב', 'studio-site',
   'אתר תדמית מלא עם גלריית עבודות, אנימציות עדינות וטעינה מהירה — בנוי להרשים ולהישאר קליל.',
   'אתר תדמית מלא עם גלריית עבודות, אנימציות עדינות וטעינה מהירה — בנוי להרשים ולהישאר קליל.',
   (select id from public.categories where type = 'project' and slug = 'websites'), 'website',
   array['אתר תדמית', 'אנימציות', 'SEO'], 'סטודיו לעיצוב', 2026,
   'from-[#7c5cff] to-[#ff7ac8]', null, false, true, 'published', 6),
  ('חנות אונליין למותג מקומי', 'ecommerce-brand',
   'חנות מלאה עם ניהול מלאי, עמודי מוצר ממירים וחוויית קנייה מהירה במובייל.',
   'חנות מלאה עם ניהול מלאי, עמודי מוצר ממירים וחוויית קנייה מהירה במובייל.',
   (select id from public.categories where type = 'project' and slug = 'websites'), 'website',
   array['איקומרס', 'מובייל', 'תשלומים'], null, 2025,
   'from-[#22c55e] to-[#4f7bff]', 'זמן טעינה מתחת לשנייה בכל עמוד', false, false, 'published', 7),
  ('אתר אישי למרצה ויועץ', 'lecturer-site',
   'כרטיס ביקור דיגיטלי חכם: אודות, הרצאות, טופס לידים ובלוג — הכל מתעדכן בקלות.',
   'כרטיס ביקור דיגיטלי חכם: אודות, הרצאות, טופס לידים ובלוג — הכל מתעדכן בקלות.',
   (select id from public.categories where type = 'project' and slug = 'websites'), 'website',
   array['אתר אישי', 'בלוג', 'לידים'], 'מרצה לחדשנות', 2025,
   'from-[#f59e0b] to-[#e77455]', null, false, false, 'published', 8),
  ('אוטומציית לידים לוואטסאפ', 'leads-automation',
   'כל ליד שנכנס מהאתר מקבל מענה אוטומטי בוואטסאפ תוך שניות, נרשם ב-CRM ומתויג לפי תחום עניין.',
   'כל ליד שנכנס מהאתר מקבל מענה אוטומטי בוואטסאפ תוך שניות, נרשם ב-CRM ומתויג לפי תחום עניין.',
   (select id from public.categories where type = 'project' and slug = 'automation'), 'automation',
   array['וואטסאפ', 'CRM', 'Make'], null, 2026,
   'from-[#22c55e] to-[#16a34a]', 'זמן מענה ירד מ-4 שעות ל-10 שניות', true, true, 'published', 9),
  ('פס ייצור תוכן אוטומטי', 'content-pipeline',
   'מערכת שהופכת פוסט אחד ל-8 פורמטים: רילס, סטורי, ניוזלטר, לינקדאין ועוד — בלחיצת כפתור אחת.',
   'מערכת שהופכת פוסט אחד ל-8 פורמטים: רילס, סטורי, ניוזלטר, לינקדאין ועוד — בלחיצת כפתור אחת.',
   (select id from public.categories where type = 'project' and slug = 'automation'), 'automation',
   array['תוכן', 'GPT', 'Zapier'], null, 2026,
   'from-[#7c5cff] to-[#4f7bff]', null, false, true, 'published', 10),
  ('בוט דוחות שבועי להנהלה', 'report-bot',
   'בוט שאוסף נתונים מחמש מערכות שונות ושולח דוח מעוצב וברור למייל ההנהלה כל יום ראשון בבוקר.',
   'בוט שאוסף נתונים מחמש מערכות שונות ושולח דוח מעוצב וברור למייל ההנהלה כל יום ראשון בבוקר.',
   (select id from public.categories where type = 'project' and slug = 'automation'), 'automation',
   array['דוחות', 'API', 'אינטגרציות'], 'חברת לוגיסטיקה', 2025,
   'from-[#0ea5e9] to-[#22d3ee]', 'חוסך 6 שעות עבודה ידנית בשבוע', false, false, 'published', 11),
  ('סוכן AI לשירות לקוחות', 'ai-support-agent',
   'צ''אטבוט חכם שמחובר למאגר הידע של העסק ועונה על 80% מהפניות — ומעביר לאנוש בדיוק כשצריך.',
   'צ''אטבוט חכם שמחובר למאגר הידע של העסק ועונה על 80% מהפניות — ומעביר לאנוש בדיוק כשצריך.',
   (select id from public.categories where type = 'project' and slug = 'automation'), 'automation',
   array['צ''אטבוט', 'Claude', 'ידע ארגוני'], null, 2025,
   'from-[#e77455] to-[#f59e0b]', null, false, false, 'published', 12)
on conflict (slug) do nothing;

-- ---------- מדריכים כתובים ----------
insert into public.guides
  (title, slug, excerpt, category_id, read_time, level, tags, is_new, featured, status, sort_order, created_at)
values
  ('בונים אתר ראשון עם Claude Code', 'claude-code-first-site',
   'מדריך צעד-אחר-צעד: מהתקנה ועד אתר חי באוויר — בלי ניסיון קודם בתכנות, רק עם הנחיות נכונות.',
   (select id from public.categories where type = 'guide' and slug = 'claude-code'),
   12, 'מתחילים', array['Claude Code'], true, true, 'published', 1, '2026-06-20'),
  ('כתיבת פרומפטים שעובדים — בעברית', 'prompt-writing-hebrew',
   'העקרונות שהופכים פרומפט בינוני לפרומפט מדויק: מבנה, הקשר, דוגמאות, ומה לעשות כשהתוצאה לא טובה.',
   (select id from public.categories where type = 'guide' and slug = 'prompting'),
   8, 'מתחילים', array['פרומפטינג'], true, true, 'published', 2, '2026-05-14'),
  ('פס ייצור לסרטון AI מקצועי', 'ai-video-workflow',
   'מרעיון לתוצר: איך משלבים כלי תמונה, וידאו וסאונד לתהליך אחד שמפיק סרטון שלם ביום עבודה.',
   (select id from public.categories where type = 'guide' and slug = 'video-ai'),
   15, 'בינוני', array['וידאו AI'], false, true, 'published', 3, '2026-04-02'),
  ('צ''קליסט דף נחיתה ממיר', 'landing-page-checklist',
   '23 בדיקות שכל דף נחיתה חייב לעבור לפני עלייה לאוויר: כותרות, מהירות, טפסים, מובייל ואמון.',
   (select id from public.categories where type = 'guide' and slug = 'marketing'),
   10, 'מתחילים', array['שיווק'], false, false, 'published', 4, '2026-03-18'),
  ('ממפים את העסק לאוטומציות', 'automation-map',
   'שיטה פשוטה לזהות אילו תהליכים בעסק שווה להפוך לאוטומטיים קודם — ואיך למדוד שזה באמת חוסך.',
   (select id from public.categories where type = 'guide' and slug = 'automations'),
   9, 'בינוני', array['אוטומציות'], false, false, 'published', 5, '2026-02-09'),
  ('חיבור כלים חיצוניים ל-AI עם MCP', 'mcp-advanced',
   'איך נותנים למודל גישה בטוחה למערכות שלכם: מסדי נתונים, קבצים ו-API — עם דוגמאות קוד מלאות.',
   (select id from public.categories where type = 'guide' and slug = 'advanced'),
   18, 'מתקדמים', array['מתקדם'], false, false, 'published', 6, '2026-01-22')
on conflict (slug) do nothing;

-- ---------- מדריכי וידאו ----------
insert into public.video_guides
  (title, slug, excerpt, duration, category_id, level, tags, gradient, is_new, featured, status, sort_order)
values
  ('בנייה חיה: אתר שלם בשעה עם Claude Code', 'claude-code-live-build',
   'צפו בתהליך המלא בזמן אמת — מתיקייה ריקה ועד אתר עובד, כולל כל הטעויות והתיקונים בדרך.',
   '58:20', (select id from public.categories where type = 'video_guide' and slug = 'claude-code'),
   'מתחילים', array['Claude Code'], 'from-[#4f7bff] to-[#7c5cff]', true, true, 'published', 1),
  ('פרסומת AI ב-30 דקות', 'ai-ad-30-min',
   'מבריף של לקוח ועד פרסומת מוכנה לפרסום: תסריט, תמונות, וידאו, קריינות ועריכה — הכל עם AI.',
   '31:45', (select id from public.categories where type = 'video_guide' and slug = 'video-ai'),
   'בינוני', array['וידאו AI'], 'from-[#ff7ac8] to-[#e77455]', true, true, 'published', 2),
  ('אוטומציית וואטסאפ ראשונה שלכם', 'automation-whatsapp',
   'מקימים יחד בוט מענה אוטומטי לעסק: חיבור למספר, תרחישי שיחה, והעברה חכמה לנציג אנושי.',
   '24:10', (select id from public.categories where type = 'video_guide' and slug = 'automations'),
   'מתחילים', array['אוטומציות'], 'from-[#22c55e] to-[#0ea5e9]', false, true, 'published', 3),
  ('מאסטרקלאס פרומפטינג', 'prompt-masterclass',
   'שעה וחצי של עומק: איך חושבים מודלים, למה פרומפטים נכשלים, ואיך בונים ספריית פרומפטים לעסק.',
   '1:28:00', (select id from public.categories where type = 'video_guide' and slug = 'prompting'),
   'מתקדמים', array['פרומפטינג'], 'from-[#7c5cff] to-[#ff7ac8]', false, false, 'published', 4),
  ('מעצבים דף נחיתה שמוכר', 'landing-page-design',
   'עקרונות עיצוב להמרות בפועל: היררכיה, צבע, טיפוגרפיה עברית, ומה ההבדל בין יפה לממיר.',
   '42:35', (select id from public.categories where type = 'video_guide' and slug = 'design'),
   'בינוני', array['עיצוב'], 'from-[#f59e0b] to-[#e77455]', false, false, 'published', 5),
  ('מערכת תוכן אוטומטית ליוצרים', 'content-system',
   'איך פוסט אחד הופך לשבוע שלם של תוכן: המערכת המלאה שאני משתמש בה, שלב אחרי שלב.',
   '36:50', (select id from public.categories where type = 'video_guide' and slug = 'content'),
   'בינוני', array['תוכן'], 'from-[#0ea5e9] to-[#22d3ee]', false, false, 'published', 6)
on conflict (slug) do nothing;
