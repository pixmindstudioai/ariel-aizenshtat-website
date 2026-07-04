"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics";

/** סוג אירוע נגזר מהנתיב — עמודי פריט מקבלים סוג ייעודי */
function eventTypeForPath(path: string): AnalyticsEventType {
  if (/^\/guides\/[^/]+$/.test(path)) return "guide_view";
  if (/^\/video-guides\/[^/]+$/.test(path)) return "video_view";
  if (/^\/portfolio\/(?!video$|websites$|automation$)[^/]+$/.test(path))
    return "project_view";
  return "page_view";
}

/**
 * עוקב צפיות של האתר הציבורי — נטען פעם אחת ב-layout של (site)
 * ורושם אירוע על כל מעבר עמוד. מרנדר כלום.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const slugMatch = pathname.match(
      /^\/(?:guides|video-guides|portfolio)\/([^/]+)$/
    );
    trackEvent({
      eventType: eventTypeForPath(pathname),
      pagePath: pathname,
      itemSlug: slugMatch?.[1],
    });
  }, [pathname]);

  return null;
}
