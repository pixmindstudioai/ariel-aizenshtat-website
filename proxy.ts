import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// In Next.js 16, Middleware is called Proxy and lives in proxy.ts.
export async function proxy(request: NextRequest) {
  const { response, claims } = await createClient(request);
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginPage = pathname.startsWith("/admin/login");

  // הגנה אופטימית על אזור הניהול: בלי סשן — לעמוד ההתחברות.
  // בדיקת ה-role המחייבת נעשית בצד השרת ב-layout של האדמין.
  if (isAdminArea && !isLoginPage && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // משתמש מחובר שמגיע לעמוד ההתחברות — ישר לדאשבורד
  if (isLoginPage && claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
