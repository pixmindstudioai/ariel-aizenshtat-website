import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/** קליינט Supabase לצד שרת עם עוגיות המשתמש המחובר (Server Components / Server Actions) */
export async function createServerClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}
