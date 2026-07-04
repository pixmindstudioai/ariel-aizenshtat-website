import type { ReactNode } from "react";
import AssetImage from "@/components/AssetImage";
import Reveal from "@/components/Reveal";
import type { AssetDef } from "@/data/assets";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  /** אסט כותרת גרפית — מוצג מעל/במקום הכותרת, הטקסט נשאר ל-SEO */
  badgeAsset?: AssetDef;
  /** כשיש אסט גרפי עם אותו טקסט — מסתירים את הטקסט ויזואלית */
  hideTextWhenBadge?: boolean;
  align?: "center" | "right";
  children?: ReactNode;
}

/** כותרת סקשן אחידה: תגית גרפית אופציונלית + כותרת + תת-כותרת */
export default function SectionTitle({
  title,
  subtitle,
  badgeAsset,
  hideTextWhenBadge = false,
  align = "center",
  children,
}: SectionTitleProps) {
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-right";
  return (
    <Reveal className={`flex flex-col gap-4 ${alignClass}`}>
      {badgeAsset && (
        <div className="w-64 max-w-[75vw] md:w-80">
          <AssetImage
            asset={badgeAsset}
            decorative={!hideTextWhenBadge}
            variant="sticker-sm"
            className="w-full h-auto"
          />
        </div>
      )}
      <h2 className={hideTextWhenBadge && badgeAsset ? "sr-only-visual" : "text-3xl md:text-5xl font-black tracking-tight"}>
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-lg leading-relaxed text-muted">{subtitle}</p>
      )}
      {children}
    </Reveal>
  );
}
