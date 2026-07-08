"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AssetImage from "@/components/AssetImage";
import AssetButton from "@/components/AssetButton";
import FloatingSticker from "@/components/FloatingSticker";
import DecorativeAsset from "@/components/DecorativeAsset";
import AnimatedBlob from "@/components/AnimatedBlob";
import {
  heroTitles,
  mascots,
  sectionCards,
  buttons,
  badges,
  decorations,
} from "@/data/assets";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

/** כרטיסי הניווט הגרפיים שמתחת ל-Hero */
const navCards = [
  {
    asset: sectionCards.portfolioCard,
    href: "/portfolio",
    label: "תיק עבודות",
    duration: 5,
  },
  {
    asset: sectionCards.writtenGuidesCard,
    href: "/guides",
    label: "מדריכים כתובים",
    duration: 5.6,
  },
  {
    asset: sectionCards.videoGuidesCard,
    href: "/video-guides",
    label: "מדריכי וידאו",
    duration: 6.2,
  },
  {
    asset: sectionCards.aboutCard,
    href: "/about",
    label: "אודות",
    duration: 5.3,
  },
];

const DEFAULT_HERO_TITLE = "יוצר. טכנולוגי. בונה חוויות.";

interface HeroSectionProps {
  /** כותרת Hero מהדאטהבייס — כשהיא שונה מברירת המחדל מוצגת ככותרת טקסט במקום האסט הגרפי */
  heroTitle?: string;
  heroDescription?: string;
}

export default function HeroSection({ heroTitle, heroDescription }: HeroSectionProps = {}) {
  const isCustomTitle = !!heroTitle && heroTitle !== DEFAULT_HERO_TITLE;
  return (
    <section className="relative overflow-hidden">
      {/* רקע: כתמי גרדיאנט רכים */}
      <AnimatedBlob className="-top-24 right-[10%] hidden sm:block" />
      <AnimatedBlob
        className="top-40 -left-40 hidden sm:block"
        from="rgba(255,122,200,0.13)"
        to="rgba(124,92,255,0.10)"
        size={520}
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 md:pt-16 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid items-center gap-10 lg:grid-cols-2 lg:gap-6"
        >
          {/* צד ימין (RTL): כותרת גרפית + טקסט + CTA */}
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-right">
            {/* H1 טקסטואלי ל-SEO ולקוראי מסך — הכותרת הוויזואלית היא האסט */}
            <h1 className={isCustomTitle ? "hidden" : "sr-only-visual"}>
              {heroTitle || DEFAULT_HERO_TITLE}
            </h1>

            <motion.div variants={item} className="w-24 md:w-32">
              <AssetImage
                asset={badges.aiBadge}
                alt="בינה מלאכותית"
                variant="sticker-sm"
                className="w-full h-auto"
                priority
              />
            </motion.div>

            {isCustomTitle ? (
              <motion.h1
                variants={item}
                className="max-w-xl text-4xl font-black leading-tight tracking-tight md:text-6xl"
              >
                {heroTitle}
              </motion.h1>
            ) : (
              <motion.div variants={item} className="w-full max-w-xl">
                <AssetImage
                  asset={heroTitles.titleMain}
                  decorative
                  priority
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="w-full h-auto"
                />
              </motion.div>
            )}

            <motion.p
              variants={item}
              className="max-w-xl text-lg leading-relaxed text-muted md:text-xl"
            >
              {heroDescription ||
                "אני עוזר לעסקים, יוצרים וחברות להפוך רעיונות לפרויקטים דיגיטליים חיים: אתרים, דפי נחיתה, סרטוני AI, מדריכים, אוטומציות וחוויות תוכן שנראות טוב — ועובדות באמת."}
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col items-center gap-4 sm:flex-row"
            >
              <AssetButton
                asset={buttons.ctaBuildButton}
                ariaLabel="בואו נבנה משהו מגניב — מעבר לעמוד צור קשר"
                href="/contact"
                displayWidth={290}
                priority
              />
              <AssetButton
                asset={buttons.ctaLearnMoreButton}
                ariaLabel="למדו עוד — מעבר לעמוד אודות"
                href="/about"
                displayWidth={200}
              />
            </motion.div>
          </div>

          {/* צד שמאל: קומפוזיציית המסקוטים */}
          <motion.div variants={item} className="relative mx-auto w-full max-w-lg">
            <div className="relative flex items-center justify-center py-6">
              {/* קודקס — ענן הטרמינל, הדמות המרכזית */}
              <FloatingSticker duration={5.2} className="relative z-10 w-52 md:w-64">
                <AssetImage
                  asset={mascots.codexCloud}
                  alt="Codex — ענן הטרמינל"
                  priority
                  sizes="(max-width: 768px) 60vw, 20rem"
                  className="w-full h-auto"
                />
              </FloatingSticker>

              {/* קלוד קוד — דמות הפיקסלים */}
              <FloatingSticker
                duration={6}
                delay={0.5}
                className="absolute right-2 bottom-2 z-20 w-32 md:right-6 md:w-40"
              >
                <AssetImage
                  asset={mascots.claudeMain}
                  alt="Claude Code — דמות הפיקסלים"
                  className="w-full h-auto"
                />
              </FloatingSticker>

              {/* OpenClaw */}
              <FloatingSticker
                duration={6.6}
                delay={1}
                className="absolute left-2 top-2 z-20 w-28 md:left-6 md:w-36"
              >
                <AssetImage
                  asset={mascots.openclawCloud}
                  alt="OpenClaw — הלובסטר האדום"
                  className="w-full h-auto"
                />
              </FloatingSticker>

              {/* קישוטים קטנים */}
              <DecorativeAsset
                asset={decorations.sparklesSet}
                size={64}
                className="absolute -top-2 right-[22%] z-0"
                delay={0.3}
              />
              <DecorativeAsset
                asset={decorations.heartSticker}
                size={48}
                rotate={12}
                className="absolute bottom-[14%] left-[16%] z-0 hidden sm:block"
                delay={1.4}
              />
              <DecorativeAsset
                asset={decorations.curvedArrow}
                size={72}
                className="absolute -bottom-6 right-[30%] z-0 hidden md:block"
                float={false}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* כרטיסי ניווט גרפיים — סטיקרים מרחפים */}
        <motion.nav
          aria-label="ניווט מהיר"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}
          className="mt-12 md:mt-16"
        >
          <ul className="grid grid-cols-2 items-center gap-4 sm:gap-6 lg:grid-cols-4">
            {navCards.map((card, i) => (
              <li key={card.href}>
                <FloatingSticker duration={card.duration} delay={i * 0.35} distance={7}>
                  <Link
                    href={card.href}
                    aria-label={card.label}
                    className="group block rounded-3xl focus-visible:outline-3 focus-visible:outline-blue focus-visible:outline-offset-4"
                  >
                    <AssetImage
                      asset={card.asset}
                      decorative
                      sizes="(max-width: 1024px) 45vw, 20vw"
                      className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                  </Link>
                </FloatingSticker>
              </li>
            ))}
          </ul>
        </motion.nav>
      </div>
    </section>
  );
}
