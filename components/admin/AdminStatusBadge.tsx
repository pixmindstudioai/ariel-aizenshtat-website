import type { ContentStatus, MessageStatus } from "@/lib/types";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  published: { label: "מפורסם", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  draft: { label: "טיוטה", className: "bg-amber-50 text-amber-700 border-amber-200" },
  archived: { label: "בארכיון", className: "bg-slate-100 text-slate-500 border-slate-200" },
  new: { label: "חדשה", className: "bg-blue/10 text-blue border-blue/20" },
  read: { label: "נקראה", className: "bg-slate-100 text-slate-500 border-slate-200" },
  replied: { label: "נענתה", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

interface AdminStatusBadgeProps {
  status: ContentStatus | MessageStatus | string;
}

export default function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${style.className}`}
    >
      {style.label}
    </span>
  );
}
