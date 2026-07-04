import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * קליטת אירועי אנליטיקס מהאתר הציבורי.
 * ה-RLS על analytics_events מאפשר insert ציבורי בלבד (בלי קריאה חזרה) —
 * ראו database/site-extras.sql.
 */

const ALLOWED_TYPES = new Set([
  "page_view",
  "guide_view",
  "video_view",
  "project_view",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = String(body.eventType ?? "");
    const pagePath = String(body.pagePath ?? "");

    if (!ALLOWED_TYPES.has(eventType) || !pagePath.startsWith("/")) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = createPublicClient();
    const { error } = await supabase.from("analytics_events").insert({
      event_type: eventType,
      page_path: pagePath.slice(0, 300),
      item_slug: body.itemSlug ? String(body.itemSlug).slice(0, 200) : null,
      referrer: body.referrer ? String(body.referrer).slice(0, 500) : null,
      visitor_id: body.visitorId ? String(body.visitorId).slice(0, 64) : null,
    });
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
