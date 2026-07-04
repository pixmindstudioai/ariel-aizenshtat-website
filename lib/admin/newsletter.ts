import { createServerClient } from "@/lib/supabase/server";
import type { NewsletterRow, SubscriberRow } from "@/lib/types";

/** שאילתות הניוזלטר לצד האדמין — רצות עם עוגיות המשתמש, RLS אוכף הרשאות */

export async function listNewsletters(): Promise<NewsletterRow[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("newsletters")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as NewsletterRow[];
}

export async function getNewsletterById(id: string): Promise<NewsletterRow | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("newsletters").select("*").eq("id", id).maybeSingle();
  return (data as NewsletterRow) ?? null;
}

export async function listSubscribers(filters: { search?: string; status?: string } = {}): Promise<SubscriberRow[]> {
  const supabase = await createServerClient();
  let query = supabase.from("newsletter_subscribers").select("*");
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.search)
    query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
  const { data } = await query.order("created_at", { ascending: false });
  return (data ?? []) as SubscriberRow[];
}

export interface NewsletterStats {
  subscribed: number;
  unsubscribed: number;
  sentNewsletters: number;
  drafts: number;
}

export async function getNewsletterStats(): Promise<NewsletterStats> {
  const supabase = await createServerClient();
  const [subscribed, unsubscribed, sent, drafts] = await Promise.all([
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "subscribed"),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "unsubscribed"),
    supabase.from("newsletters").select("id", { count: "exact", head: true }).eq("status", "sent"),
    supabase.from("newsletters").select("id", { count: "exact", head: true }).eq("status", "draft"),
  ]);
  return {
    subscribed: subscribed.count ?? 0,
    unsubscribed: unsubscribed.count ?? 0,
    sentNewsletters: sent.count ?? 0,
    drafts: drafts.count ?? 0,
  };
}
