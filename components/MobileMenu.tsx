"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AssetButton from "@/components/AssetButton";
import { buttons } from "@/data/assets";

interface MobileMenuProps {
  links: { href: string; label: string }[];
}

export default function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // סגירה אוטומטית במעבר עמוד — דפוס "adjust state during render" של React
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  // נעילת גלילה כשהתפריט פתוח
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
        className="relative z-[60] grid place-items-center w-11 h-11 rounded-2xl bg-white shadow-[0_6px_18px_rgba(15,23,42,0.1)] focus-visible:outline-3 focus-visible:outline-blue"
      >
        <span className="sr-only">{open ? "סגירת תפריט" : "פתיחת תפריט"}</span>
        <div className="flex flex-col gap-[5px]">
          <motion.span
            animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block h-[2.5px] w-6 rounded-full bg-ink"
          />
          <motion.span
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            className="block h-[2.5px] w-6 rounded-full bg-ink"
          />
          <motion.span
            animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="block h-[2.5px] w-6 rounded-full bg-ink"
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl"
          >
            <nav
              aria-label="תפריט נייד"
              className="flex h-full flex-col items-center justify-center gap-2 px-8"
            >
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="w-full max-w-xs"
                >
                  <Link
                    href={link.href}
                    className={`block w-full rounded-2xl px-6 py-4 text-center text-xl font-bold transition-colors ${
                      pathname.startsWith(link.href)
                        ? "bg-blue/10 text-blue"
                        : "text-ink hover:bg-blue/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * links.length }}
                className="mt-4 flex w-full max-w-xs justify-center"
              >
                <AssetButton
                  asset={buttons.ctaBuildButton}
                  ariaLabel="בואו נבנה משהו מגניב — מעבר לעמוד צור קשר"
                  href="/contact"
                  displayWidth={280}
                />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
