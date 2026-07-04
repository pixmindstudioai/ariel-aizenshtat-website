import Link from "next/link";
import type { ReactNode } from "react";
import AssetImage from "@/components/AssetImage";
import type { AssetDef } from "@/data/assets";

interface AdminStatCardProps {
  label: string;
  value: ReactNode;
  /** אייקון סטיקר מרג'יסטרי האסטים (icons.*) */
  icon?: AssetDef;
  href?: string;
  hint?: string;
}

/** כרטיס נתון בדאשבורד — מספר גדול + תווית */
export default function AdminStatCard({ label, value, icon, href, hint }: AdminStatCardProps) {
  const content = (
    <div className="admin-card flex h-full flex-col gap-1.5 p-5 transition-transform duration-200 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-muted">{label}</span>
        {icon && (
          <span className="inline-block w-8 shrink-0 align-middle" aria-hidden>
            <AssetImage asset={icon} decorative variant="flat" className="w-full h-auto" />
          </span>
        )}
      </div>
      <span className="text-3xl font-black text-ink">{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
