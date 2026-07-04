"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TrafficEvent } from "@/lib/admin/traffic";

/**
 * גרפי תנועת גולשים לדשבורד — מבוסס Recharts.
 * מקבל את אירועי 90 הימים האחרונים מהשרת ומסנן תקופה בצד הלקוח.
 */

type Period = "7d" | "30d" | "90d";

const PERIOD_DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90 };
const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 ימים",
  "30d": "30 ימים",
  "90d": "90 ימים",
};

interface DailyPoint {
  date: string;
  label: string;
  views: number;
  unique: number;
}

interface AdminTrafficChartsProps {
  events: TrafficEvent[];
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function extractDomain(referrer: string): string | null {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || host === "localhost" || host.includes("vercel.app")) return null;
    if (typeof window !== "undefined" && host === window.location.hostname)
      return null;
    return host;
  } catch {
    return null;
  }
}

export default function AdminTrafficCharts({ events }: AdminTrafficChartsProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const { daily, summary, topPages, referrers } = useMemo(() => {
    const days = PERIOD_DAYS[period];
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = events.filter(
      (e) => new Date(e.created_at).getTime() >= since
    );

    // נקודות יומיות — כולל ימים בלי תנועה, כדי שהגרף יהיה רציף
    const byDay = new Map<string, { views: number; visitors: Set<string> }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      byDay.set(dayKey(d.toISOString()), { views: 0, visitors: new Set() });
    }
    for (const e of filtered) {
      const bucket = byDay.get(dayKey(e.created_at));
      if (!bucket) continue;
      bucket.views++;
      if (e.visitor_id) bucket.visitors.add(e.visitor_id);
    }
    const daily: DailyPoint[] = [...byDay.entries()].map(([date, b]) => {
      const d = new Date(date);
      return {
        date,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        views: b.views,
        unique: b.visitors.size,
      };
    });

    const visitors = new Set(
      filtered.map((e) => e.visitor_id).filter(Boolean) as string[]
    );

    const pageCounts = new Map<string, number>();
    for (const e of filtered) {
      pageCounts.set(e.page_path, (pageCounts.get(e.page_path) ?? 0) + 1);
    }
    const topPages = [...pageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([path, count]) => ({ path, count }));

    const refCounts = new Map<string, number>();
    for (const e of filtered) {
      const domain = e.referrer ? extractDomain(e.referrer) : null;
      if (domain) refCounts.set(domain, (refCounts.get(domain) ?? 0) + 1);
    }
    const referrers = [...refCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    return {
      daily,
      summary: {
        views: filtered.length,
        unique: visitors.size,
        pages: pageCounts.size,
        perDay: days > 0 ? Math.round(filtered.length / days) : 0,
      },
      topPages,
      referrers,
    };
  }, [events, period]);

  const maxPage = topPages[0]?.count ?? 1;
  const maxRef = referrers[0]?.count ?? 1;

  const summaryCards = [
    { label: "צפיות בתקופה", value: summary.views },
    { label: "מבקרים ייחודיים", value: summary.unique },
    { label: "עמודים שנצפו", value: summary.pages },
    { label: "ממוצע צפיות ליום", value: summary.perDay },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* בחירת תקופה */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">תנועת גולשים באתר</h2>
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
          {(Object.keys(PERIOD_DAYS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                period === p
                  ? "bg-gradient-to-l from-blue to-purple text-white"
                  : "text-muted hover:text-blue"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="admin-card px-5 py-6">
            <div className="text-gradient text-4xl font-black leading-none">
              {card.value.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-semibold text-muted">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* גרף צפיות יומי — Recharts */}
      <div className="admin-card p-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
          צפיות לפי יום
        </h3>
        <div dir="ltr">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={daily} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="trafficViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f7bff" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#4f7bff" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="trafficUnique" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#7c5cff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(15,23,42,0.07)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #eef2ff",
                  borderRadius: 16,
                  boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                  fontFamily: "inherit",
                }}
                labelStyle={{ color: "#111827", fontWeight: 700 }}
                formatter={(value, name) => [
                  String(value ?? 0),
                  name === "views" ? "צפיות" : "מבקרים ייחודיים",
                ]}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#4f7bff"
                strokeWidth={2.5}
                fill="url(#trafficViews)"
              />
              <Area
                type="monotone"
                dataKey="unique"
                stroke="#7c5cff"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="url(#trafficUnique)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-5 text-sm font-semibold text-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-blue" />
            צפיות
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-purple" />
            מבקרים ייחודיים
          </span>
        </div>
      </div>

      {/* עמודים מובילים + מקורות תנועה */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-card p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
            עמודים נצפים
          </h3>
          {topPages.length === 0 ? (
            <p className="py-4 text-sm text-muted">אין עדיין נתוני תנועה בתקופה הזו.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {topPages.map((page) => (
                <li key={page.path}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span dir="ltr" className="truncate font-semibold text-ink">
                      {page.path}
                    </span>
                    <span className="shrink-0 font-bold text-blue">
                      {page.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-blue to-purple transition-[width] duration-500"
                      style={{ width: `${Math.max(6, Math.round((page.count / maxPage) * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-card p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
            מקורות תנועה
          </h3>
          {referrers.length === 0 ? (
            <p className="py-4 text-sm text-muted">
              עוד אין הפניות מאתרים חיצוניים — רוב התנועה ישירה.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {referrers.map((ref) => (
                <li key={ref.domain}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span dir="ltr" className="truncate font-semibold text-ink">
                      {ref.domain}
                    </span>
                    <span className="shrink-0 font-bold text-purple">
                      {ref.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-purple to-pink transition-[width] duration-500"
                      style={{ width: `${Math.max(6, Math.round((ref.count / maxRef) * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
