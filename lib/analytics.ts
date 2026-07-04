/**
 * מעקב תנועה בצד הלקוח — נשמר בטבלת analytics_events ב-Supabase
 * (ראו database/site-extras.sql). אנליטיקס לעולם לא שובר את האתר:
 * כל כשל נבלע בשקט.
 */

const VISITOR_ID_KEY = "aa_visitor_id";

export type AnalyticsEventType =
  | "page_view"
  | "guide_view"
  | "video_view"
  | "project_view";

/** מזהה מבקר אנונימי ויציב (localStorage) — בלי עוגיות ובלי פרטים אישיים */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return "";
  }
}

export async function trackEvent(opts: {
  eventType: AnalyticsEventType;
  pagePath: string;
  itemSlug?: string;
}): Promise<void> {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: opts.eventType,
        pagePath: opts.pagePath,
        itemSlug: opts.itemSlug,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        visitorId: getVisitorId(),
      }),
      keepalive: true,
    });
  } catch {
    // שקט — אנליטיקס אף פעם לא מפריע לגלישה
  }
}
