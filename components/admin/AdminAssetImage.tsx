import Image from "next/image";
import type { AdminAsset } from "@/data/adminAssets";

interface AdminAssetImageProps {
  asset: AdminAsset;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  decorative?: boolean;
  sizes?: string;
}

/**
 * קומפוננטת הבסיס לאסטים של ממשק הניהול:
 * object-contain, ללא חיתוך או מתיחה, צל מדבקה עדין.
 */
export default function AdminAssetImage({
  asset,
  alt,
  className = "",
  width,
  height,
  priority,
  decorative,
  sizes,
}: AdminAssetImageProps) {
  const isDecorative = decorative ?? asset.decorative;
  return (
    <Image
      src={asset.src}
      width={width ?? asset.width}
      height={height ?? asset.height}
      alt={isDecorative ? "" : (alt ?? asset.alt)}
      aria-hidden={isDecorative || undefined}
      priority={priority ?? asset.priority}
      sizes={sizes}
      className={`object-contain select-none sticker-shadow-sm ${className}`}
      draggable={false}
    />
  );
}
