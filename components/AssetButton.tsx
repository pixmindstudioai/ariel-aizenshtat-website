"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AssetImage from "@/components/AssetImage";
import type { AssetDef } from "@/data/assets";

interface AssetButtonProps {
  asset: AssetDef;
  /** טקסט נגישות — חובה, כי הטקסט "כתוב" בתוך התמונה */
  ariaLabel: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** רוחב תצוגה בפיקסלים (ברירת מחדל 260) */
  displayWidth?: number;
  priority?: boolean;
}

/**
 * כפתור גרפי מבוסס אסט: עטוף ב-Link/button נגיש,
 * עם hover scale עדין ו-focus ring.
 */
export default function AssetButton({
  asset,
  ariaLabel,
  href,
  onClick,
  className = "",
  displayWidth = 260,
  priority,
}: AssetButtonProps) {
  const displayHeight = Math.round(displayWidth * (asset.height / asset.width));
  const inner = (
    <AssetImage
      asset={asset}
      decorative
      width={displayWidth}
      height={displayHeight}
      variant="sticker-sm"
      priority={priority}
      className="w-full h-auto"
    />
  );
  const sharedClass = `inline-block rounded-full focus-visible:outline-3 focus-visible:outline-blue focus-visible:outline-offset-4 ${className}`;
  const motionProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.97 },
    transition: { type: "spring" as const, stiffness: 350, damping: 20 },
    style: { width: displayWidth, maxWidth: "100%" },
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block max-w-full">
        <Link href={href} aria-label={ariaLabel} className={sharedClass}>
          {inner}
        </Link>
      </motion.div>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={sharedClass}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}
