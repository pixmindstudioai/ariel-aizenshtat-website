import type { ReactNode } from "react";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import type { AdminAsset } from "@/data/adminAssets";

interface AdminPageHeaderProps {
  /** אסט כותרת גרפי — מחליף את הטקסט הוויזואלי (הטקסט נשאר לקוראי מסך) */
  asset?: AdminAsset;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** רוחב תצוגת האסט בפיקסלים */
  assetWidth?: number;
}

/** כותרת עמוד אדמין: אסט גרפי או טקסט + כפתורי פעולה */
export default function AdminPageHeader({
  asset,
  title,
  description,
  actions,
  assetWidth = 250,
}: AdminPageHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {asset ? (
          <>
            <h1 className="sr-only-visual">{title}</h1>
            <div style={{ width: assetWidth }} className="max-w-full">
              <AdminAssetImage asset={asset} decorative className="w-full h-auto" />
            </div>
          </>
        ) : (
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
        )}
        {description && <p className="text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
