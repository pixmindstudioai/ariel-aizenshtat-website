import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import VideoGuideCard from "@/components/VideoGuideCard";
import CTASection from "@/components/CTASection";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import DecorativeAsset from "@/components/DecorativeAsset";
import { fetchVideoGuides } from "@/lib/cms";
import { sectionCards, mascots, decorations } from "@/data/assets";

export const metadata: Metadata = {
  title: "מדריכי וידאו",
  description:
    "מדריכי וידאו צעד-צעד על AI, אוטומציות ובניית אתרים — צופים, עוצרים, מנסים בעצמכם וממשיכים בקצב שלכם.",
};

/** מסלולי לימוד מסודרים — סדרות של פרקים קצרים */
const learningSeries: {
  slug: string;
  title: string;
  description: string;
  accent: string;
  episodes: string[];
}[] = [
  {
    slug: "beginners",
    title: "מסלול מתחילים",
    description: "מאפס להבנה אמיתית של עולם ה-AI — בלי רקע טכני ובלי מילים גדולות.",
    accent: "bg-blue/10 text-blue",
    episodes: [
      "פרק 1 — מה זה בכלל מודל שפה, בעברית פשוטה",
      "פרק 2 — הפרומפט הראשון שלכם שעובד באמת",
      "פרק 3 — הכלים שכדאי להכיר (וכל השאר שאפשר לדלג)",
    ],
  },
  {
    slug: "ai-video",
    title: "מסלול וידאו AI",
    description: "מרעיון ועד סרטון מוכן לפרסום — כל שרשרת ההפקה עם כלי AI בלבד.",
    accent: "bg-purple/10 text-purple",
    episodes: [
      "פרק 1 — תסריט וסטוריבורד בעשר דקות",
      "פרק 2 — יצירת שוטים: תמונות, תנועה וקריינות",
      "פרק 3 — עריכה, מוזיקה וייצוא לכל פלטפורמה",
    ],
  },
  {
    slug: "automations",
    title: "מסלול אוטומציות",
    description: "מהמשימה הידנית הראשונה שאתם מוחקים מהיומן ועד מערכת שעובדת לבד.",
    accent: "bg-coral/15 text-coral",
    episodes: [
      "פרק 1 — מזהים את המשימות ששוות אוטומציה",
      "פרק 2 — בונים תהליך ראשון: טופס, וואטסאפ ומייל",
      "פרק 3 — מחברים AI באמצע: סינון, ניסוח ותיעדוף",
    ],
  },
];

export const revalidate = 300;

export default async function VideoGuidesPage() {
  const videoGuides = await fetchVideoGuides();
  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      <PageHero
        badgeAsset={sectionCards.videoGuidesCard}
        hideTextWhenBadge
        title="מדריכי וידאו"
        subtitle="לפעמים הכי קל ללמוד כשמישהו פשוט מראה לכם את המסך. כאן צופים בתהליך האמיתי צעד-צעד — עוצרים, מנסים בעצמכם, וממשיכים כשמתאים לכם."
      />

      {/* גריד מדריכי הווידאו */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="video-guides-title"
      >
        <div id="video-guides-title">
          <SectionTitle
            title="כל המדריכים"
            subtitle="הקלטות מלאות ובגובה העיניים — כולל הטעויות בדרך, כי גם מהן לומדים"
          />
        </div>
        {videoGuides.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videoGuides.map((guide, i) => (
              <Reveal key={guide.slug} delay={i * 0.07} className="h-full">
                <VideoGuideCard guide={guide} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              title="מדריכי הווידאו הראשונים כבר בדרך"
              subtitle="אני מקליט אותם ממש בימים אלה — שווה לקפוץ לכאן שוב בקרוב."
            />
          </div>
        )}
      </section>

      {/* סדרות לימוד */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="series-title"
      >
        <div id="series-title" className="relative">
          <SectionTitle
            title="סדרות לימוד"
            subtitle="מעדיפים ללמוד לפי סדר? שלושה מסלולים קצרים שבונים ידע פרק אחרי פרק"
          />
          <DecorativeAsset
            asset={mascots.claudeFlat}
            size={72}
            className="absolute -top-8 right-[14%] hidden md:block"
            rotate={-6}
          />
          <DecorativeAsset
            asset={decorations.sparklesAlt}
            size={44}
            delay={1.1}
            className="absolute top-4 left-[12%] hidden lg:block opacity-90"
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {learningSeries.map((series, i) => (
            <Reveal key={series.slug} delay={i * 0.08} className="h-full">
              <article className="card-soft flex h-full flex-col gap-4 p-6">
                <span
                  className={`self-start rounded-full px-3 py-1 text-xs font-bold ${series.accent}`}
                >
                  {series.episodes.length} פרקים
                </span>
                <h3 className="text-xl font-extrabold leading-snug">
                  {series.title}
                </h3>
                <p className="leading-relaxed text-muted">{series.description}</p>
                <ul className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4">
                  {series.episodes.map((episode) => (
                    <li
                      key={episode}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                    >
                      <span aria-hidden className="mt-0.5 text-blue">
                        ▶
                      </span>
                      <span>{episode}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA סוגר */}
      <CTASection
        title="רוצים שאלמד את הצוות שלכם?"
        subtitle="סדנאות והדרכות חיות בהתאמה לעסק — ספרו לי מה מעניין אתכם ונבנה יחד תוכנית."
      />
    </div>
  );
}
