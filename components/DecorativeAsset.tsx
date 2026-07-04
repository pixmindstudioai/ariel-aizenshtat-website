"use client";

import { motion } from "framer-motion";
import AssetImage from "@/components/AssetImage";
import type { AssetDef } from "@/data/assets";

interface DecorativeAssetProps {
  asset: AssetDef;
  className?: string;
  /** רוחב תצוגה בפיקסלים */
  size?: number;
  /** אנימציית ריחוף איטית */
  float?: boolean;
  /** השהיית האנימציה כדי שאלמנטים שכנים לא ינועו יחד */
  delay?: number;
  /** סיבוב קבוע במעלות */
  rotate?: number;
}

/**
 * אלמנט קישוט קטן (ברקית, לב, חץ...) — תמיד aria-hidden,
 * עם אנימציית ריחוף עדינה אופציונלית.
 */
export default function DecorativeAsset({
  asset,
  className = "",
  size = 64,
  float = true,
  delay = 0,
  rotate = 0,
}: DecorativeAssetProps) {
  const height = Math.round(size * (asset.height / asset.width));
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{ width: size, rotate }}
      animate={float ? { y: [0, -10, 0] } : undefined}
      transition={
        float
          ? {
              duration: 4.5 + delay,
              ease: "easeInOut",
              repeat: Infinity,
              delay,
            }
          : undefined
      }
    >
      <AssetImage
        asset={asset}
        decorative
        width={size}
        height={height}
        variant="sticker-sm"
        className="w-full h-auto"
      />
    </motion.div>
  );
}
