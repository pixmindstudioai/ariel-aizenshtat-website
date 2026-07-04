"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FloatingStickerProps {
  children: ReactNode;
  className?: string;
  /** משך לולאת הריחוף (4–6 שניות מומלץ) */
  duration?: number;
  delay?: number;
  /** טווח התנועה האנכית בפיקסלים */
  distance?: number;
}

/** עטיפת ריחוף אינסופי לדמויות וכרטיסים "מודבקים" */
export default function FloatingSticker({
  children,
  className = "",
  duration = 5,
  delay = 0,
  distance = 10,
}: FloatingStickerProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, ease: "easeInOut", repeat: Infinity, delay }}
    >
      {children}
    </motion.div>
  );
}
