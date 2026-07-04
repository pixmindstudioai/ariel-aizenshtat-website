import type { ReactNode } from "react";
import AssetImage from "@/components/AssetImage";
import DecorativeAsset from "@/components/DecorativeAsset";
import Reveal from "@/components/Reveal";
import { decorations } from "@/data/assets";
import type { AssetDef } from "@/data/assets";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  /** אסט כותרת/תגית גרפית מרכזית לעמוד */
  badgeAsset?: AssetDef;
  /** אם האסט מכיל את אותו טקסט של הכותרת — הטקסט מוסתר ויזואלית ונשאר ל-SEO */
  hideTextWhenBadge?: boolean;
  /** קישוטים בפינות (ברירת מחדל: ברקיות) */
  showSparkles?: boolean;
  children?: ReactNode;
}

/** Hero פנימי אחיד לעמודי המשנה */
export default function PageHero({
  title,
  subtitle,
  badgeAsset,
  hideTextWhenBadge = true,
  showSparkles = true,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-14 pb-10 md:pt-20 md:pb-14">
      {/* רקע רך */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_50%_at_50%_0%,rgba(79,123,255,0.09),transparent)]"
      />
      {showSparkles && (
        <>
          <DecorativeAsset
            asset={decorations.sparklesSet}
            size={72}
            className="absolute right-[8%] top-10 hidden md:block opacity-90"
          />
          <DecorativeAsset
            asset={decorations.sparklesAlt}
            size={56}
            delay={1.2}
            className="absolute left-[10%] top-24 hidden md:block opacity-90"
          />
        </>
      )}
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 text-center sm:px-6">
        {badgeAsset && (
          <Reveal>
            <div className="w-72 max-w-[85vw] md:w-96">
              <AssetImage
                asset={badgeAsset}
                priority
                decorative={!hideTextWhenBadge}
                className="w-full h-auto"
              />
            </div>
          </Reveal>
        )}
        <h1
          className={
            hideTextWhenBadge && badgeAsset
              ? "sr-only-visual"
              : "text-4xl md:text-6xl font-black tracking-tight"
          }
        >
          {title}
        </h1>
        {subtitle && (
          <Reveal delay={0.1}>
            <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-muted">
              {subtitle}
            </p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
