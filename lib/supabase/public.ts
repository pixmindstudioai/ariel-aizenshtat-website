import { createClient } from "@supabase/supabase-js";

/**
 * קליינט אנונימי ללא עוגיות — לקריאת תוכן ציבורי מפורסם בלבד.
 * לא תלוי ב-cookies() ולכן לא הופך עמודים סטטיים לדינמיים.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
