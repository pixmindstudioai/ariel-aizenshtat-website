import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PortfolioTabs from "@/components/PortfolioTabs";
import ProjectCard from "@/components/ProjectCard";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import DecorativeAsset from "@/components/DecorativeAsset";
import {
  fetchPage,
  fetchPageMetadata,
  fetchProjectCategoryLabels,
  fetchProjects,
  pageText,
} from "@/lib/cms";
import {
  sectionCards,
  browserCards,
  codeCards,
  decorations,
} from "@/data/assets";

export async function generateMetadata(): Promise<Metadata> {
  return fetchPageMetadata("portfolio", {
    title: "תיק עבודות",
    description:
      "כל הפרויקטים במקום אחד — סרטוני AI, אתרים ודפי נחיתה, אוטומציות וכלים דיגיטליים. הצצה למה שקורה כשרעיון טוב פוגש ביצוע מהיר.",
  });
}

export const revalidate = 300;

export default async function PortfolioPage() {
  const [projects, page, tabLabels] = await Promise.all([
    fetchProjects(),
    fetchPage("portfolio"),
    fetchProjectCategoryLabels(),
  ]);

  /** שלושת השלבים בדרך מפרויקט בראש לפרויקט באוויר — ניתנים לעריכה בממשק הניהול */
  const workSteps = [
    {
      title: pageText(page, "step1_title", "שיחת היכרות"),
      description: pageText(
        page,
        "step1_description",
        "מספרים לי על העסק ועל המטרה, ואני חוזר אליכם עם כיוון ברור — בלי ז'רגון ובלי התחייבות."
      ),
    },
    {
      title: pageText(page, "step2_title", "הצעה ותכנון"),
      description: pageText(
        page,
        "step2_description",
        "מקבלים הצעה מסודרת: לוח זמנים, מחיר ותוצרים מוגדרים. יודעים בדיוק מה מקבלים ומתי."
      ),
    },
    {
      title: pageText(page, "step3_title", "בנייה ומסירה"),
      description: pageText(
        page,
        "step3_description",
        "אני בונה, מעדכן אתכם לאורך הדרך, ומוסר תוצר מוכן לעבודה — כולל הסבר קצר איך הכל פועל."
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      {/* Hero + טאבי קטגוריות */}
      <div className="relative">
        <PageHero
          badgeAsset={sectionCards.portfolioCard}
          hideTextWhenBadge
          showSparkles={false}
          title={page?.hero_title || "תיק העבודות שלי"}
          subtitle={
            page?.hero_description ||
            "וידאו, אתרים ואוטומציות — כל הפרויקטים במקום אחד. בחרו קטגוריה או פשוט תגללו."
          }
        >
          <div className="mt-4 w-full">
            <PortfolioTabs labels={tabLabels} />
          </div>
        </PageHero>
        {/* קישוטים עדינים בשולי ה-hero */}
        <DecorativeAsset
          asset={browserCards.browserWindow}
          size={130}
          rotate={-6}
          className="absolute right-[5%] top-20 hidden lg:block opacity-80"
        />
        <DecorativeAsset
          asset={codeCards.codeEditorWindow}
          size={120}
          delay={1.1}
          rotate={6}
          className="absolute left-[5%] top-32 hidden lg:block opacity-80"
        />
        <DecorativeAsset
          asset={decorations.sparklesSet}
          size={60}
          delay={0.5}
          className="absolute left-[20%] top-10 hidden md:block opacity-90"
        />
      </div>

      {/* כל הפרויקטים */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="all-projects-title"
      >
        <h2 id="all-projects-title" className="sr-only-visual">
          כל הפרויקטים
        </h2>
        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.07} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="הפרויקטים הראשונים בדרך לכאן"
            subtitle="אני מעלה אותם לתיק ממש בקרוב — בינתיים אפשר לדבר איתי על הפרויקט שלכם."
          />
        )}
      </section>

      {/* איך אני עובד */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="process-title"
      >
        <div id="process-title" className="relative">
          <SectionTitle
            title={pageText(page, "process_title", "איך אני עובד")}
            subtitle={pageText(
              page,
              "process_subtitle",
              "שלושה שלבים פשוטים בין הרעיון שלכם לפרויקט הבא בתיק"
            )}
          />
          <DecorativeAsset
            asset={decorations.curvedArrowLeft}
            size={72}
            float={false}
            className="absolute top-0 right-[12%] hidden xl:block opacity-80"
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {workSteps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1} className="h-full">
              <div className="card-soft flex h-full flex-col gap-4 p-8">
                <span
                  aria-hidden
                  className="text-gradient text-6xl font-black leading-none"
                >
                  0{i + 1}
                </span>
                <h3 className="text-xl font-extrabold">{step.title}</h3>
                <p className="leading-relaxed text-muted">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA סוגר */}
      <CTASection
        title={pageText(page, "cta_title", "אהבתם את מה שראיתם?")}
        subtitle={pageText(
          page,
          "cta_subtitle",
          "הפרויקט הבא בתיק יכול להיות שלכם — ספרו לי מה אתם צריכים ונצא לדרך."
        )}
      />
    </div>
  );
}
