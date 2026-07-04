"use client";

import { motion } from "framer-motion";

interface AnimatedBlobProps {
  className?: string;
  /** צבעי הגרדיאנט */
  from?: string;
  to?: string;
  size?: number;
}

/** כתם גרדיאנט רך ומרחף לרקע סקשנים */
export default function AnimatedBlob({
  className = "",
  from = "rgba(79,123,255,0.18)",
  to = "rgba(124,92,255,0.12)",
  size = 480,
}: AnimatedBlobProps) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${from}, ${to} 70%, transparent)`,
      }}
      animate={{ scale: [1, 1.08, 1], rotate: [0, 12, 0] }}
      transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
    />
  );
}
