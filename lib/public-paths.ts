/**
 * מיפוי slug של עמוד בטבלת pages → הנתיב הציבורי שלו.
 * מודול טהור (בלי next/cache) — בטוח לייבוא גם מקומפוננטות client
 * וגם מ-lib/revalidate.ts בצד השרת.
 */
export const PAGE_PATHS: Record<string, string> = {
  home: "/",
  portfolio: "/portfolio",
  "portfolio-video": "/portfolio/video",
  "portfolio-websites": "/portfolio/websites",
  "portfolio-automation": "/portfolio/automation",
  guides: "/guides",
  "video-guides": "/video-guides",
  workshops: "/workshops",
  about: "/about",
  contact: "/contact",
};

export function publicPathForPage(slug: string): string | null {
  return PAGE_PATHS[slug] ?? null;
}
