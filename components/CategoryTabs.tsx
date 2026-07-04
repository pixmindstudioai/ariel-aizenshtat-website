"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import AssetImage from "@/components/AssetImage";
import type { AssetDef } from "@/data/assets";

export interface CategoryTab {
  href: string;
  label: string;
  icon?: AssetDef;
}

interface CategoryTabsProps {
  tabs: CategoryTab[];
}

/** טאבי ניווט בין קטגוריות תיק העבודות */
export default function CategoryTabs({ tabs }: CategoryTabsProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="קטגוריות" className="flex justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="relative">
              {active && (
                <motion.span
                  layoutId="category-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-l from-blue to-purple"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm md:text-base font-bold transition-colors ${
                  active ? "text-white" : "text-ink hover:text-blue"
                }`}
              >
                {tab.icon && (
                  <span className="inline-block w-6 shrink-0 align-middle" aria-hidden>
                    <AssetImage
                      asset={tab.icon}
                      decorative
                      variant="flat"
                      className="w-full h-auto"
                    />
                  </span>
                )}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
