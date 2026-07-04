import SectionTitle from "@/components/SectionTitle";
import StickerCard from "@/components/StickerCard";
import Reveal from "@/components/Reveal";
import { sectionCards } from "@/data/assets";
import { fetchTestimonials } from "@/lib/cms";
import type { Testimonial } from "@/data/testimonials";

const accentBg: Record<Testimonial["accent"], string> = {
  blue: "bg-blue/10 text-blue",
  purple: "bg-purple/10 text-purple",
  pink: "bg-pink/15 text-pink",
  coral: "bg-coral/15 text-coral",
};

/** אזור לקוחות מרוצים עם הכרטיס הגרפי ככותרת — התוכן מהדאטהבייס */
export default async function Testimonials() {
  const testimonials = await fetchTestimonials();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="testimonials-title">
      <div id="testimonials-title">
        <SectionTitle
          title="לקוחות מרוצים"
          badgeAsset={sectionCards.happyClientsCard}
          hideTextWhenBadge
          subtitle="אנשים אמיתיים, פרויקטים אמיתיים, תוצאות אמיתיות"
        />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <StickerCard className="h-full">
              <figure className="flex h-full flex-col gap-4 p-7">
                <span aria-hidden className="text-4xl leading-none text-blue/30">
                  {"“"}
                </span>
                <blockquote className="flex-1 text-lg leading-relaxed">
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <span
                    aria-hidden
                    className={`grid h-11 w-11 place-items-center rounded-full font-black ${accentBg[t.accent]}`}
                  >
                    {t.name[0]}
                  </span>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-muted">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </StickerCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
