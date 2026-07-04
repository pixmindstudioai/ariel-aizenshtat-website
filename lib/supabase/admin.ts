import { createClient } from "@supabase/supabase-js";

/**
 * קליינט service-role — צד שרת בלבד! נדרש רק לפעולות Auth אדמיניסטרטיביות
 * (הזמנת משתמשים חדשים). מחזיר null אם המפתח לא הוגדר — שאר המערכת לא תלויה בו.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
