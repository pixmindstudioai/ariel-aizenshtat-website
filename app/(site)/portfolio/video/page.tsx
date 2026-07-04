import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PortfolioTabs from "@/components/PortfolioTabs";
import ProjectCard from "@/components/ProjectCard";
import SectionTitle from "@/components/SectionTitle";
import StickerCard from "@/components/StickerCard";
import AssetImage from "@/components/AssetImage";
import CTASection from "@/components/CTASection";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import DecorativeAsset from "@/components/DecorativeAsset";
import {
  fetchPage,
  fetchPageMetadata,
  fetchProjectCategoryLabels,
  fetchProjectsByCategory,
  pageText,
} from "@/lib/cms";
import { badges, sectionCards, decorations, icons } from "@/data/assets";
import type { AssetDef } from "@/data/assets";

export async function generateMetadata(): Promise<Metadata> {
  return fetchPageMetadata("portfolio-video", {
    title: "פרויקטי וידאו",
    description:
      "פרסומות AI, סרטוני מוצר וסדרות רשת — תיק עבודות הווידאו של Ariel AI: מקונספט ותסריט ועד קאט סופי שמזיז אנשים.",
  });
}

/** מה אפשר להפיק — סוגי הפקות וידאו */
const productionTypes = [
  {
    icon: icons.videoEdit,
    title: "פרסומת AI",
    description:
      "פרסומת מלאה שנוצרת בבינה מלאכותית — מקונספט ותסריט ועד עריכה וסאונד, בזמן ובתקציב שפעם היו בלתי אפשריים.",
  },
  {
    icon: icons.videoPlay,
    title: "סרטון מוצר",
    description:
      "המוצר שלכם בזווית הכי מחמיאה: הדמיה, מושן גרפיקס וסאונד שמוכרים את הערך בשניות הראשונות.",
  },
  {
    icon: icons.gallery,
    title: "סדרת רשת",
    description:
      "רילס ושורטס בקצב קבוע — תסריט, קריינות AI ועריכה שרודפת אחרי הטרנדים במקום לרדוף אחריכם.",
  },
  {
    icon: icons.chat,
    title: "סרטון הסבר",
    description:
      "אנימציה שמפשטת מוצר או תהליך מסובך לסיפור של דקה — כזה שגם סבתא וגם המשקיעים מבינים.",
  },
];

export const revalidate = 300;

export default async function VideoPortfolioPage() {
  const [videoProjects, page, tabLabels] = await Promise.all([
    fetchProjectsByCategory("video"),
    fetchPage("portfolio-video"),
    fetchProjectCategoryLabels(),
  ]);

  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      {/* Hero */}
      <div className="relative">
        <PageHero
          title={page?.hero_title || "פרויקטי וידאו"}
          badgeAsset={badges.aiBadge}
          hideTextWhenBadge={false}
          subtitle={
            page?.hero_description ||
            "פרסומות שנוצרו בבינה מלאכותית, סרטוני מוצר וסדרות רשת — וידאו שנראה כמו הפקה גדולה, בלי סט צילום ובלי חודשים של המתנה."
          }
        >
          <PortfolioTabs labels={tabLabels} />
        </PageHero>
        {/* קישוט: כרטיס מדריכי וידאו — דקורטיבי בלבד */}
        <DecorativeAsset
          asset={sectionCards.videoGuidesCard}
          size={190}
          rotate={-8}
          delay={0.6}
          className="absolute left-[3%] top-28 hidden lg:block opacity-90"
        />
      </div>

      {/* גריד הפרויקטים */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="video-projects-title"
      >
        <div id="video-projects-title">
          <SectionTitle
            title={pageText(page, "works_title", "העבודות")}
            subtitle={pageText(
              page,
              "works_subtitle",
              "כל פרויקט התחיל מרעיון של לקוח — ונגמר בסרטון שעושה בדיוק את העבודה"
            )}
          />
        </div>
        {videoProjects.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {videoProjects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.07} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              title="סרטוני התדמית הראשונים בדרך לכאן"
              subtitle="פרויקטי הווידאו יעלו לתיק ממש בקרוב."
            />
          </div>
        )}
      </section>

      {/* מה אפשר להפיק */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="video-production-title"
      >
        <div id="video-production-title" className="relative">
          <SectionTitle
            title={pageText(page, "production_title", "מה אפשר להפיק")}
            subtitle={pageText(
              page,
              "production_subtitle",
              "ארבעה פורמטים שעובדים הכי טוב לעסקים — ואם יש לכם רעיון אחר, נמציא פורמט חמישי"
            )}
          />
          <DecorativeAsset
            asset={decorations.heartSticker}
            size={52}
            rotate={-10}
            delay={1.1}
            className="absolute -top-4 right-[10%] hidden md:block"
          />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productionTypes.map((type, i) => (
            <Reveal key={type.title} delay={i * 0.08} className="h-full">
              <StickerCard className="h-full p-6">
                <div className="flex h-full flex-col gap-3">
                  <span aria-hidden className="w-14">
                    <AssetImage
                      asset={type.icon}
                      decorative
                      variant="sticker-sm"
                      className="w-full h-auto"
                    />
                  </span>
                  <h3 className="text-xl font-extrabold">{type.title}</h3>
                  <p className="leading-relaxed text-muted">
                    {type.description}
                  </p>
                </div>
              </StickerCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA סוגר */}
      <CTASection
        title={pageText(page, "cta_title", "יש לכם סיפור? בואו נהפוך אותו לסרטון")}
        subtitle={pageText(
          page,
          "cta_subtitle",
          "ספרו לי מה אתם רוצים להראות לעולם — פרסומת, סרטון מוצר או סדרה שלמה — ותקבלו כיוון ראשוני עוד היום."
        )}
      />
    </div>
  );
}
