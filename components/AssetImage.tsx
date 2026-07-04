import Image from "next/image";
import type { AssetDef } from "@/data/assets";

interface AssetImageProps {
  asset: AssetDef;
  /** דריסת alt (ברירת מחדל: ה-alt מהרג'יסטרי) */
  alt?: string;
  className?: string;
  /** גודל תצוגה — width נגזר, הגובה נשמר לפי היחס המקורי */
  width?: number;
  height?: number;
  priority?: boolean;
  /** עוצמת צל המדבקה */
  variant?: "sticker" | "sticker-sm" | "flat";
  /** אלמנט דקורטיבי בלבד — מוסתר מקוראי מסך */
  decorative?: boolean;
  sizes?: string;
}

/**
 * קומפוננטת בסיס לכל האסטים הגרפיים:
 * שקוף, object-contain, יחס מקורי, צל מדבקה עדין.
 */
export default function AssetImage({
  asset,
  alt,
  className = "",
  width,
  height,
  priority,
  variant = "sticker",
  decorative = false,
  sizes,
}: AssetImageProps) {
  const shadow =
    variant === "sticker"
      ? "sticker-shadow"
      : variant === "sticker-sm"
        ? "sticker-shadow-sm"
        : "";
  return (
    <Image
      src={asset.src}
      width={width ?? asset.width}
      height={height ?? asset.height}
      alt={decorative ? "" : (alt ?? asset.alt)}
      aria-hidden={decorative || undefined}
      priority={priority}
      sizes={sizes}
      className={`object-contain select-none ${shadow} ${className}`}
      draggable={false}
    />
  );
}
