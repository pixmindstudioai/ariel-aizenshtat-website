import { createServerClient } from "@/lib/supabase/server";

/**
 * שליפת אירועי תנועה לדשבורד האנליטיקס — רץ עם session של צוות
 * (RLS: staff read בלבד). מחזיר null כשהטבלה עוד לא קיימת
 * (לפני הרצת database/site-extras.sql) — והעמוד מציג הנחיה במקום גרפים.
 */

export interface TrafficEvent {
  created_at: string;
  event_type: string;
  page_path: string;
  referrer: string | null;
  visitor_id: string | null;
}

const MAX_EVENTS = 50000;
const WINDOW_DAYS = 90;

export async function getTrafficEvents(): Promise<TrafficEvent[] | null> {
  try {
    const supabase = await createServerClient();
    const since = new Date(
      Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data, error } = await supabase
      .from("analytics_events")
      .select("created_at,event_type,page_path,referrer,visitor_id")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(MAX_EVENTS);
    if (error) return null;
    return (data as TrafficEvent[]) ?? [];
  } catch {
    return null;
  }
}
