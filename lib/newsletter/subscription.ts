/**
 * קבועים משותפים לזיהוי מנוי ניוזלטר בדפדפן — משמשים גם בצד השרת
 * (הצבת ה-cookie בפעולת ההרשמה) וגם בצד הלקוח (שער המדריכים).
 *
 * ה-cookie בכוונה לא httpOnly: הוא לא סוד — רק דגל "כבר נרשם",
 * והלקוח צריך לקרוא אותו כדי להסתיר את השער עוד לפני ההידרציה.
 */

export const NEWSLETTER_COOKIE = "nl_sub";
export const NEWSLETTER_COOKIE_VALUE = "1";
export const NEWSLETTER_STORAGE_KEY = "nl_sub";
/** שנה — הרשמה לא פגה מעצמה */
export const NEWSLETTER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
