# הקמת ממשק הניהול — מדריך מהיר

האתר עובד גם בלי דאטהבייס (תוכן דמו מ-`data/*.ts`), אבל כדי שממשק הניהול
יעבוד באמת — צריך להקים את Supabase פעם אחת. חמש דקות עבודה.

## 1. הרצת ה-SQL

נכנסים ל-[Supabase Dashboard](https://supabase.com/dashboard) → הפרויקט שלך →
**SQL Editor** → New query, ומריצים לפי הסדר:

1. `database/schema.sql` — כל הטבלאות, ההרשאות (RLS) וה-bucket למדיה
2. `database/seed.sql` — תוכן התחלתי: הגדרות אתר, עמודים, קטגוריות, פרויקטים ומדריכים
3. `database/site-extras.sql` — טבלאות משלימות: סדנאות, שאלות נפוצות והמלצות
4. `database/newsletter.sql` — מערכת הניוזלטר: נרשמים, גיליונות ופונקציות הרשמה/הסרה

כל הקבצים בטוחים להרצה חוזרת.

## הניוזלטר (Resend)

- המפתח כבר ב-`.env.local` (`resend_api_key`). ניהול: **‎/admin/newsletter** —
  כותבים גיליון, שולחים מייל בדיקה לעצמכם, ואז "שליחה לכל הנרשמים".
- נרשמים מגיעים מטופס ההרשמה בעמוד הבית, ואפשר גם להוסיף ידנית.
- **חשוב:** עד שמאמתים דומיין ב-Resend, השליחה היא מ-`onboarding@resend.dev`
  ומגיעה רק למייל של בעל חשבון ה-Resend (מצב sandbox). לשליחה אמיתית:
  Resend → Domains → Add Domain, ואז ב-`.env.local`:
  `resend_from="Ariel AI <newsletter@your-domain.com>"`

## 2. משתמש מנהל המערכת

**כבר מוכן.** המשתמש `aa046114609@gmail.com` נוצר ב-Supabase Auth, ו-`seed.sql`
דואג לשלושה דברים: יוצר לו פרופיל, נותן לו הרשאת **admin**, ומאשר את המייל —
כך שאפשר להתחבר ב-`/admin/login` מיד אחרי הרצת ה-SQL, בלי ללחוץ על קישור האימות.

משתמשים נוספים: **Authentication → Users → Add user** (עם Auto confirm), או
הזמנה מתוך עמוד המשתמשים באדמין. משתמש חדש נוצר כ-viewer עד שאדמין משדרג אותו.

## 3. משתני סביבה

`.env.local` (יש `.env.example` לדוגמה):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
# אופציונלי — רק להזמנת משתמשים במייל מתוך ממשק הניהול:
# SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. הרצה

```bash
npm run dev
```

- האתר: http://localhost:3000
- ממשק הניהול: http://localhost:3000/admin (מפנה להתחברות)

## הרשאות

| תפקיד | מה מותר |
|---|---|
| **admin** | הכל — כולל הגדרות, משתמשים ומחיקה לצמיתות |
| **editor** | יצירה, עריכה ופרסום של תוכן ומדיה |
| **viewer** | צפייה בלבד בממשק הניהול |

## איך שינוי באדמין מגיע לאתר

כל פעולת שמירה/פרסום/מחיקה מריצה `revalidatePath` על העמודים הרלוונטיים —
השינוי מופיע באתר הציבורי מיד. בנוסף, כל עמוד ציבורי מתרענן אוטומטית כל 5 דקות.
רק תוכן בסטטוס **מפורסם** מוצג לגולשים; טיוטות זמינות בתצוגה מקדימה
(`?preview=true`) למשתמשים מחוברים בלבד.
