import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import GuideCard from "@/components/GuideCard";
import Reveal from "@/components/Reveal";
import DecorativeAsset from "@/components/DecorativeAsset";
import CTASection from "@/components/CTASection";
import EmptyState from "@/components/EmptyState";
import { sectionCards, decorations } from "@/data/assets";
import { fetchGuides } from "@/lib/cms";

export const metadata: Metadata = {
  title: "מדריכים כתובים",
  description:
    "מדריכים כתובים בעברית פשוטה על AI, קוד ואוטומציות — צעד אחרי צעד, בלי מילים גבוהות ובלי להניח שאתם מתכנתים.",
};

export const revalidate = 300;

export default async function GuidesPage() {
  const guides = await fetchGuides();
  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      <PageHero
        badgeAsset={sectionCards.writtenGuidesCard}
        hideTextWhenBadge
        title="מדריכים כתובים"
        subtitle="כל מה שלמדתי על AI, קוד ואוטומציות — כתוב בעברית פשוטה, צעד אחרי צעד. פותחים, עוקבים, ומגיעים לתוצאה."
      />

      {/* גריד המדריכים */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="guides-grid-title"
      >
        <h2 id="guides-grid-title" className="sr-only-visual">
          כל המדריכים
        </h2>
        <DecorativeAsset
          asset={decorations.sparklesAlt}
          size={56}
          delay={0.6}
          className="absolute -top-12 left-[5%] hidden md:block opacity-90"
        />
        {guides.length > 0 ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide, i) => (
              <Reveal key={guide.slug} delay={i * 0.07} className="h-full">
                <GuideCard guide={guide} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="המדריכים הראשונים כבר בכתיבה"
              subtitle="בקרוב יופיעו כאן מדריכים כתובים בעברית פשוטה — צעד אחרי צעד."
            />
          </div>
        )}
      </section>

      {/* הצעת נושא חדש */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="suggest-guide-title"
      >
        <Reveal>
          <div className="card-soft relative overflow-hidden px-6 py-12 text-center md:px-14 md:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(79,123,255,0.08),transparent)]"
            />
            <DecorativeAsset
              asset={decorations.heartSticker}
              size={56}
              delay={1}
              rotate={-8}
              className="absolute right-[6%] top-8 hidden md:block"
            />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
              <h2
                id="suggest-guide-title"
                className="text-3xl font-black tracking-tight md:text-4xl"
              >
                רוצים מדריך שעוד אין?
              </h2>
              <p className="text-lg leading-relaxed text-muted">
                יש נושא שמסקרן אתכם ולא מצאתם עליו מדריך? ספרו לי מה חסר —
                המדריכים הבאים נכתבים לפי מה שאתם באמת צריכים.
              </p>
              <Link href="/contact" className="btn-secondary mt-2 text-lg">
                להציע נושא למדריך ←
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA סוגר */}
      <CTASection
        title="מעדיפים ללמוד עם ליווי אישי?"
        subtitle="מעבר למדריכים — אפשר לשבת יחד אחד-על-אחד, לבנות את הפרויקט שלכם צעד-צעד, ולצאת עם ידע שנשאר."
      />
    </div>
  );
}
