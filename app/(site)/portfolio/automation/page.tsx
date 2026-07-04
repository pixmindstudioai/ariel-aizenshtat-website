import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PortfolioTabs from "@/components/PortfolioTabs";
import ProjectCard from "@/components/ProjectCard";
import SectionTitle from "@/components/SectionTitle";
import StickerCard from "@/components/StickerCard";
import AssetImage from "@/components/AssetImage";
import FloatingSticker from "@/components/FloatingSticker";
import DecorativeAsset from "@/components/DecorativeAsset";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import CTASection from "@/components/CTASection";
import { badges, codeCards, decorations, icons } from "@/data/assets";
import {
  fetchPage,
  fetchPageMetadata,
  fetchProjectCategoryLabels,
  fetchProjectsByCategory,
  pageText,
} from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return fetchPageMetadata("portfolio-automation", {
    title: "אוטומציות וכלים דיגיטליים",
    description:
      "תיק עבודות של אוטומציות וכלים דיגיטליים: בוטים, אינטגרציות וזרימות עבודה חכמות שחוסכות לעסקים שעות של עבודה ידנית.",
  });
}

/** דוגמאות לתהליכים נפוצים שהופכים לאוטומציה */
const automationExamples = [
  {
    icon: icons.inbox,
    title: "ליד נכנס — מענה יוצא",
    description:
      "במקום לרדוף אחרי כל פנייה: הליד מקבל הודעה אישית בוואטסאפ תוך שניות, נרשם ב-CRM ומחכה לכם מתויג ומסודר.",
  },
  {
    icon: icons.dashboard,
    title: "דוחות שנכתבים לבד",
    description:
      "הנתונים נאספים מכל המערכות, מסתדרים לדוח ברור ומעוצב, ונוחתים במייל בדיוק בזמן — בלי לפתוח אקסל אפילו פעם אחת.",
  },
  {
    icon: icons.automation,
    title: "תוכן אחד, שמונה פורמטים",
    description:
      "כותבים פוסט פעם אחת, והמערכת גוזרת ממנו רילס, סטורי, ניוזלטר ופוסט לינקדאין — מוכנים לפרסום בלחיצה.",
  },
];

export const revalidate = 300;

export default async function AutomationPortfolioPage() {
  const [automationProjects, page, tabLabels] = await Promise.all([
    fetchProjectsByCategory("automation"),
    fetchPage("portfolio-automation"),
    fetchProjectCategoryLabels(),
  ]);

  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      {/* Hero + טאבי קטגוריות */}
      <PageHero
        badgeAsset={badges.smartAutomationBadge}
        hideTextWhenBadge
        title={page?.hero_title || "אוטומציות וכלים דיגיטליים"}
        subtitle={
          page?.hero_description ||
          "מערכות קטנות שעובדות בשבילכם 24/7 — בוטים, אינטגרציות וזרימות עבודה שהופכות משימות ידניות לקליק אחד"
        }
      >
        <PortfolioTabs labels={tabLabels} />
      </PageHero>

      {/* פרויקטי אוטומציה */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="automation-projects-title"
      >
        <h2 id="automation-projects-title" className="sr-only-visual">
          פרויקטי אוטומציה נבחרים
        </h2>
        {automationProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {automationProjects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.07} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="פרויקטי האוטומציה הראשונים בדרך לכאן"
            subtitle="דוגמאות לתהליכים אוטומטיים שבניתי יעלו לתיק ממש בקרוב."
          />
        )}
      </section>

      {/* סקשן ביניים — מאחורי הקלעים */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="behind-the-scenes-title"
      >
        <Reveal>
          <div className="card-soft relative overflow-hidden px-6 py-12 md:px-14 md:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(79,123,255,0.08),transparent)]"
            />
            <div className="relative grid items-center gap-10 md:grid-cols-2">
              <div className="flex flex-col gap-4 text-center md:text-right">
                <h2
                  id="behind-the-scenes-title"
                  className="text-3xl font-black tracking-tight md:text-4xl"
                >
                  ככה זה נראה <span className="text-gradient">מאחורי הקלעים</span>
                </h2>
                <p className="max-w-md text-lg leading-relaxed text-muted md:ml-auto">
                  {pageText(
                    page,
                    "behind_description",
                    "קצת קוד, הרבה סדר: כל אוטומציה נבנית כך שהיא רצה בשקט ברקע, מטפלת במקרי קצה, ומדווחת לכם רק כשבאמת צריך. אתם רואים תוצאה — היא עושה את העבודה."
                  )}
                </p>
              </div>
              <div className="relative flex justify-center">
                <DecorativeAsset
                  asset={decorations.curvedArrow}
                  size={72}
                  float={false}
                  rotate={-12}
                  className="absolute -top-8 right-2 hidden md:block opacity-80"
                />
                <FloatingSticker className="w-64 md:w-80" duration={5.5}>
                  <AssetImage
                    asset={codeCards.codeEditorWindow}
                    className="w-full h-auto"
                  />
                </FloatingSticker>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* תהליכים שחוזרים על עצמם */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="repeat-process-title"
      >
        <div id="repeat-process-title" className="relative">
          <SectionTitle
            title={pageText(page, "examples_title", "תהליך שחוזר על עצמו? מכונה תעשה אותו")}
            subtitle={pageText(
              page,
              "examples_subtitle",
              "אם אתם עושים משהו יותר מפעמיים בשבוע — כנראה שאפשר להפסיק. הנה שלוש דוגמאות מהחיים"
            )}
          />
          <DecorativeAsset
            asset={decorations.sparklesSet}
            size={56}
            delay={0.8}
            className="absolute -top-4 left-[10%] hidden lg:block opacity-90"
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {automationExamples.map((example, i) => (
            <Reveal key={example.title} delay={i * 0.08} className="h-full">
              <StickerCard className="flex h-full flex-col gap-3 p-7 text-center">
                <span aria-hidden className="mx-auto w-16">
                  <AssetImage
                    asset={example.icon}
                    decorative
                    variant="sticker-sm"
                    className="w-full h-auto"
                  />
                </span>
                <h3 className="text-xl font-extrabold leading-snug">
                  {example.title}
                </h3>
                <p className="leading-relaxed text-muted">{example.description}</p>
              </StickerCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA סוגר */}
      <CTASection
        title={pageText(page, "cta_title", "יש לכם משימה שנמאס לכם לעשות ידנית?")}
        subtitle={pageText(
          page,
          "cta_subtitle",
          "ספרו לי על התהליך — סביר להניח שאפשר להפוך אותו לאוטומציה שרצה לבד, ולפנות לכם את הזמן לדברים החשובים."
        )}
      />
    </div>
  );
}
