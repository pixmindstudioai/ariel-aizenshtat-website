import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import StickerCard from "@/components/StickerCard";
import AssetImage from "@/components/AssetImage";
import AssetButton from "@/components/AssetButton";
import DecorativeAsset from "@/components/DecorativeAsset";
import FloatingSticker from "@/components/FloatingSticker";
import Reveal from "@/components/Reveal";
import {
  sectionCards,
  badges,
  buttons,
  mascots,
  decorations,
} from "@/data/assets";
import { fetchWorkshops } from "@/lib/cms";
import type { Workshop } from "@/data/workshops";

export const metadata: Metadata = {
  title: "סדנאות לחברות וארגונים",
  description:
    "סדנאות AI מעשיות לחברות וארגונים: עבודה יומיומית עם כלי AI, יצירת וידאו, בניית מוצרים עם Vibe Coding ואוטומציות. תרגול חי, תוצרים אמיתיים וידע שנשאר בצוות.",
};

export const revalidate = 300;

const accentStyles: Record<
  Workshop["accent"],
  { chip: string; bar: string; check: string }
> = {
  blue: { chip: "bg-blue/10 text-blue", bar: "from-[#4f7bff] to-[#7c5cff]", check: "text-blue" },
  purple: { chip: "bg-purple/10 text-purple", bar: "from-[#7c5cff] to-[#ff7ac8]", check: "text-purple" },
  pink: { chip: "bg-pink/15 text-pink", bar: "from-[#ff7ac8] to-[#e77455]", check: "text-pink" },
  coral: { chip: "bg-coral/15 text-coral", bar: "from-[#e77455] to-[#f59e0b]", check: "text-coral" },
};

/** למה סדנה אצלי — ההבטחות שכל ארגון מקבל */
const promises = [
  {
    title: "מעשי, לא תיאורטי",
    text: "עובדים על המשימות האמיתיות של הצוות שלכם — לא על דוגמאות גנריות מהאינטרנט.",
  },
  {
    title: "מותאם לארגון",
    text: "שיחת אפיון לפני כל סדנה: התוכן, הדוגמאות והתרגול נבנים סביב התחום שלכם.",
  },
  {
    title: "תוצר ביד",
    text: "יוצאים עם משהו עובד: ספריית פרומפטים, סרטון, אוטומציה או אב-טיפוס — לא רק מצגת.",
  },
  {
    title: "ליווי אחרי",
    text: "חודש של זמינות לשאלות אחרי הסדנה, כדי שהידע באמת ייכנס לשגרה.",
  },
];

/** איך זה עובד — משיחה ועד סדנה */
const steps = [
  {
    title: "שיחת אפיון",
    description: "20 דקות להבין את הצוות, הכלים והמטרות — ולבחור את הסדנה הנכונה.",
  },
  {
    title: "התאמת תוכן",
    description: "אני בונה גרסה של הסדנה סביב דוגמאות אמיתיות מהעולם שלכם.",
  },
  {
    title: "הסדנה עצמה",
    description: "אצלכם במשרד או בזום — תרגול חי, ידיים על המקלדת, אנרגיה גבוהה.",
  },
  {
    title: "חומרים וליווי",
    description: "הקלטה, סיכום כתוב וכל התוצרים — ועוד חודש של מענה לשאלות.",
  },
];

export default async function WorkshopsPage() {
  const workshops = await fetchWorkshops();

  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      {/* Hero */}
      <div className="relative">
        <PageHero
          badgeAsset={badges.aiBadge}
          hideTextWhenBadge={false}
          title="סדנאות לחברות וארגונים"
          subtitle="הצוות שלכם שומע על AI מכל כיוון — הגיע הזמן שהוא גם ידע לעבוד איתו. סדנאות מעשיות בתחומים שאני חי בהם כל יום: כלי AI, וידאו, בניית מוצרים ואוטומציות."
        >
          <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
            <AssetButton
              asset={buttons.ctaTalkButton}
              ariaLabel="בואו נדבר — תיאום סדנה לארגון"
              href="/contact"
              displayWidth={220}
            />
            <span className="text-sm font-semibold text-muted">
              כל הסדנאות מותאמות לגודל הצוות ולתחום הארגון
            </span>
          </div>
        </PageHero>
        <DecorativeAsset
          asset={decorations.curvedArrow}
          size={80}
          float={false}
          className="absolute left-[8%] top-24 hidden xl:block opacity-80"
        />
      </div>

      {/* הסדנאות */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="workshops-list-title"
      >
        <div id="workshops-list-title">
          <SectionTitle
            title="הסדנאות"
            subtitle="ארבעה מסלולים — מהיכרות ראשונה עם AI ועד בניית מוצר שלם בצוות"
          />
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {workshops.map((workshop, i) => {
            const accent = accentStyles[workshop.accent];
            return (
              <Reveal key={workshop.slug} delay={i * 0.08} className="h-full">
                <StickerCard className="h-full overflow-hidden">
                  <article className="flex h-full flex-col">
                    <div className={`h-2.5 w-full bg-gradient-to-l ${accent.bar}`} />
                    <div className="relative flex flex-1 flex-col gap-4 p-7 md:p-8">
                      {workshop.isNew && (
                        <div className="absolute left-4 top-4 w-20">
                          <AssetImage
                            asset={badges.newBadge}
                            alt="חדש"
                            variant="sticker-sm"
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${accent.chip}`}>
                          {workshop.duration}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-muted">
                          {workshop.audience}
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold leading-snug">
                        {workshop.title}
                      </h3>
                      <p className="leading-relaxed text-muted">
                        {workshop.description}
                      </p>

                      <div className="grid gap-5 pt-2 sm:grid-cols-2">
                        <div>
                          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
                            מה עוברים
                          </h4>
                          <ul className="space-y-2">
                            {workshop.outline.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed">
                                <span aria-hidden className={`mt-0.5 font-bold ${accent.check}`}>
                                  ●
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
                            מה לוקחים הביתה
                          </h4>
                          <ul className="space-y-2">
                            {workshop.deliverables.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed">
                                <span aria-hidden className={`mt-0.5 shrink-0 ${accent.check}`}>
                                  <svg
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3.5 w-3.5"
                                  >
                                    <path d="M2.5 8.5l3.5 3.5 7-8" />
                                  </svg>
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Link
                        href="/contact"
                        className="mt-auto inline-flex items-center gap-1.5 pt-3 font-bold text-blue"
                      >
                        לתיאום הסדנה הזו ←
                      </Link>
                    </div>
                  </article>
                </StickerCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* מה תקבלו בסדנה */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="workshop-promises-title"
      >
        <div id="workshop-promises-title" className="relative">
          <SectionTitle
            title="מה תקבלו בסדנה"
            badgeAsset={sectionCards.whatYouGetCard}
            hideTextWhenBadge
            subtitle="ארבע הבטחות שמלוות כל סדנה — בלי קשר לנושא ולגודל הקבוצה"
          />
          <DecorativeAsset
            asset={decorations.sparklesSet}
            size={56}
            delay={0.6}
            className="absolute -top-6 right-[10%] hidden lg:block opacity-90"
          />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((promise, i) => (
            <Reveal key={promise.title} delay={i * 0.08} className="h-full">
              <div className="card-soft h-full p-7">
                <span aria-hidden className="text-gradient text-4xl font-black leading-none">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-lg font-extrabold leading-snug">
                  {promise.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{promise.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* איך זה עובד */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="workshop-process-title"
      >
        <Reveal>
          <div className="card-soft relative overflow-hidden px-6 py-12 md:px-14 md:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(79,123,255,0.08),transparent)]"
            />
            <FloatingSticker
              className="pointer-events-none absolute -left-4 bottom-6 hidden w-24 md:block lg:w-28"
              duration={6}
            >
              <AssetImage asset={mascots.claudeHappy} decorative className="w-full h-auto" />
            </FloatingSticker>
            <div className="relative">
              <h2
                id="workshop-process-title"
                className="text-center text-3xl font-black tracking-tight md:text-4xl"
              >
                איך זה <span className="text-gradient">עובד</span>
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step, i) => (
                  <div key={step.title} className="flex flex-col gap-2">
                    <span
                      aria-hidden
                      className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/10 text-lg font-black text-blue"
                    >
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-extrabold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA סוגר */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="card-soft relative overflow-hidden px-6 py-14 text-center md:px-16 md:py-16">
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
                רוצים צוות שעובד עם AI באמת?
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                ספרו לי על הארגון ועל האתגר — ונבנה יחד את הסדנה שתזיז את הצוות
                שלכם קדימה. הצעת מחיר מסודרת תוך יום עבודה.
              </p>
              <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
                <AssetButton
                  asset={buttons.ctaBuildButton}
                  ariaLabel="בואו נבנה משהו מגניב — תיאום סדנה"
                  href="/contact"
                  displayWidth={290}
                />
                <AssetButton
                  asset={buttons.ctaMessageButton}
                  ariaLabel="שלחו הודעה"
                  href="/contact"
                  displayWidth={210}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
