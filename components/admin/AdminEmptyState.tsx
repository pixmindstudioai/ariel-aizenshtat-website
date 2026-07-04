import type { ReactNode } from "react";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import type { AdminAsset } from "@/data/adminAssets";

interface AdminEmptyStateProps {
  asset?: AdminAsset;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** מצב ריק מעוצב — אסט חמוד + טקסט + כפתור פעולה */
export default function AdminEmptyState({
  asset,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      {asset && (
        <div className="w-52">
          <AdminAssetImage asset={asset} decorative className="w-full h-auto" />
        </div>
      )}
      <h3 className="text-xl font-extrabold">{title}</h3>
      {description && <p className="max-w-sm text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
