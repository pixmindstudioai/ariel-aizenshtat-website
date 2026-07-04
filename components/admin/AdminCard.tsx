import type { ReactNode } from "react";
import type { AssetDef } from "@/data/assets";
import AssetImage from "@/components/AssetImage";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  icon?: AssetDef;
}

/** כרטיס לבן בסיסי של ממשק הניהול */
export default function AdminCard({ children, className = "", title, action, icon }: AdminCardProps) {
  return (
    <section className={`admin-card p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <div className="flex items-center gap-2">
              {icon && (
                <span className="inline-block w-6 shrink-0" aria-hidden>
                  <AssetImage asset={icon} decorative variant="flat" className="w-full h-auto" />
                </span>
              )}
              <h2 className="text-lg font-extrabold">{title}</h2>
            </div>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
