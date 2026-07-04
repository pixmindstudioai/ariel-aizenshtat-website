import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export interface ProxySession {
  response: NextResponse;
  /** claims של המשתמש המחובר, או null אם אין סשן */
  claims: Record<string, unknown> | null;
}

export const createClient = async (request: NextRequest): Promise<ProxySession> => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // Touching auth here is what actually refreshes an expired session
  // and re-issues the cookies via setAll above.
  const { data } = await supabase.auth.getClaims();

  return { response: supabaseResponse, claims: data?.claims ?? null };
};
