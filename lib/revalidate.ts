import { revalidatePath } from "next/cache";
import { publicPathForPage } from "@/lib/public-paths";

/**
 * רענון האתר הציבורי אחרי שינוי תוכן — כל פעולת אדמין קוראת
 * לפונקציה המתאימה כאן כדי שהשינוי יופיע באתר מיד.
 */

const PORTFOLIO_PATHS = [
  "/portfolio",
  "/portfolio/video",
  "/portfolio/websites",
  "/portfolio/automation",
];

export function revalidateProjects(slug?: string) {
  revalidatePath("/");
  PORTFOLIO_PATHS.forEach((p) => revalidatePath(p));
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

export function revalidateGuides(slug?: string) {
  revalidatePath("/");
  revalidatePath("/guides");
  if (slug) revalidatePath(`/guides/${slug}`);
}

export function revalidateVideoGuides(slug?: string) {
  revalidatePath("/");
  revalidatePath("/video-guides");
  if (slug) revalidatePath(`/video-guides/${slug}`);
}

// publicPathForPage עבר ל-lib/public-paths.ts (מודול טהור, בטוח גם ל-client)

export function revalidatePage(slug: string) {
  const path = publicPathForPage(slug);
  if (path) revalidatePath(path);
  // עמוד הבית מציג תוכן מרוב העמודים — מרעננים תמיד
  revalidatePath("/");
}

/** הגדרות האתר משפיעות על כל עמוד (Header/Footer/SEO) */
export function revalidateSiteWide() {
  revalidatePath("/", "layout");
  ["/", ...PORTFOLIO_PATHS, "/guides", "/video-guides", "/about", "/contact"].forEach(
    (p) => revalidatePath(p)
  );
}
