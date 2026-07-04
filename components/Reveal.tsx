"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** כיוון הכניסה */
  direction?: "up" | "down" | "right" | "left" | "none";
  once?: boolean;
}

/** כניסת גלילה עדינה: fade + slide, מופעלת כשנכנסים לviewport */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = true,
}: RevealProps) {
  const offset =
    direction === "up"
      ? { y: 28 }
      : direction === "down"
        ? { y: -28 }
        : direction === "right"
          ? { x: -28 }
          : direction === "left"
            ? { x: 28 }
            : {};
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
