"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StickerCardProps {
  children: ReactNode;
  className?: string;
  /** הרמה עדינה ב-hover */
  hover?: boolean;
}

/** כרטיס לבן בסגנון מדבקה: פינות מעוגלות מאוד, צל רך, הרמה ב-hover */
export default function StickerCard({
  children,
  className = "",
  hover = true,
}: StickerCardProps) {
  return (
    <motion.div
      className={`card-soft ${className}`}
      whileHover={hover ? { y: -6, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
