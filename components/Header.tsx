"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileMenu from "@/components/MobileMenu";
import AssetButton from "@/components/AssetButton";
import AssetImage from "@/components/AssetImage";
import { buttons, profile } from "@/data/assets";
import { navLinks } from "@/data/nav";

interface HeaderProps {
  /** טקסט ה-CTA מתוך הגדרות האתר — כשהוא שונה מברירת המחדל מוצג כפתור טקסט במקום האסט הגרפי */
  ctaText?: string;
  ctaUrl?: string;
}

const DEFAULT_CTA_TEXT = "בואו נבנה משהו מגניב";

export default function Header({ ctaText, ctaUrl }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const targetUrl = ctaUrl || "/contact";
  const isCustomCta = !!ctaText && ctaText !== DEFAULT_CTA_TEXT;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-lg shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          {/* לוגו — בצד ימין (RTL) */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 rounded-full focus-visible:outline-3 focus-visible:outline-blue focus-visible:outline-offset-4"
            aria-label="Ariel AI — עמוד הבית"
          >
            <AssetImage
              asset={profile.arielPhoto}
              decorative
              variant="flat"
              priority
              sizes="48px"
              className="w-11 h-11 md:w-12 md:h-12"
            />
          </Link>

          {/* ניווט דסקטופ */}
          <nav aria-label="ניווט ראשי" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`px-4 py-2 rounded-full text-[15px] font-semibold transition-colors ${
                        active
                          ? "bg-blue/10 text-blue"
                          : "text-ink hover:bg-blue/5 hover:text-blue"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* CTA בולט — כפתור גרפי מתוך האסטים, או כפתור טקסט אם שונה בהגדרות */}
          <div className="hidden lg:block shrink-0">
            {isCustomCta ? (
              <Link href={targetUrl} className="btn-primary !py-2.5 text-[15px]">
                {ctaText}
              </Link>
            ) : (
              <AssetButton
                asset={buttons.ctaBuildButton}
                ariaLabel={`${DEFAULT_CTA_TEXT} — מעבר לעמוד צור קשר`}
                href={targetUrl}
                displayWidth={196}
                priority
              />
            )}
          </div>

          {/* המבורגר במובייל */}
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}
