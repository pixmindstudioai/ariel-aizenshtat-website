import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PortfolioTabs from "@/components/PortfolioTabs";
import ProjectCard from "@/components/ProjectCard";
import SectionTitle from "@/components/SectionTitle";
import StickerCard from "@/components/StickerCard";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import FloatingSticker from "@/components/FloatingSticker";
import AssetImage from "@/components/AssetImage";
import DecorativeAsset from "@/components/DecorativeAsset";
import CTASection from "@/components/CTASection";
import { badges, browserCards, decorations, icons } from "@/data/assets";
import {
  fetchPage,
  fetchPageMetadata,
  fetchProjectCategoryLabels,
  fetchProjectsByCategory,
  pageText,
} from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return fetchPageMetadata("portfolio-websites", {
    title: "אתרים ודפי נחיתה",
    description:
      "תיק עבודות של אתרים ודפי נחיתה: אתרי תדמית, חנויות אונליין ודפי נחיתה ממירים — מהירים, מותאמים למובייל ובנויים להביא תוצאות.",
  });
}

/** ארבעת העקרונות של אתר שעובד */
const sitePrinciples = [
  {
    key: "speed",
    icon: icons.upload,
    title: "מהירות",
    description:
      "אתר שנטען לאט מאבד גולשים לפני שראו בכלל מה יש לכם להציע. כל עמוד אצלי נבנה לטעינה של פחות משנייה.",
    iconBg: "bg-blue/10",
  },
  {
    key: "mobile",
    icon: icons.browserPages,
    title: "מובייל קודם",
    description:
      "רוב הגולשים מגיעים מהטלפון — אז העיצוב מתחיל מהמסך הקטן ומתרחב משם, בלי כפתורים קטנטנים ובלי גלילה אופקית.",
    iconBg: "bg-purple/10",
  },
  {
    key: "seo",
    icon: icons.eye,
    title: "SEO מובנה",
    description:
      "מבנה נכון, כותרות חכמות וקוד נקי שגוגל אוהב — כדי שהאתר יעבוד בשבילכם גם כשאתם ישנים.",
    iconBg: "bg-pink/10",
  },
  {
    key: "conversions",
    icon: icons.analytics,
    title: "המרות",
    description:
      "אתר יפה זה נחמד, אתר שמייצר פניות זה העניין. כל עמוד מוביל את הגולש לפעולה אחת ברורה — ומודד אותה.",
    iconBg: "bg-coral/10",
  },
];

export const revalidate = 300;

export default async function WebsitesPortfolioPage() {
  const [websiteProjects, page, tabLabels] = await Promise.all([
    fetchProjectsByCategory("websites"),
    fetchPage("portfolio-websites"),
    fetchProjectCategoryLabels(),
  ]);

  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      {/* Hero + טאבים */}
      <PageHero
        badgeAsset={badges.websitesBadge}
        hideTextWhenBadge
        title={page?.hero_title || "אתרים ודפי נחיתה"}
        subtitle={
          page?.hero_description ||
          "אתרי תדמית, חנויות ודפי נחיתה שנבנו כדי להיראות מעולה — ולעבוד עוד יותר טוב."
        }
      >
        <PortfolioTabs labels={tabLabels} />
      </PageHero>

      {/* פרויקטים בקטגוריה */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="websites-projects-title"
      >
        <div id="websites-projects-title" className="relative">
          <SectionTitle
            title={pageText(page, "works_title", "פרויקטים נבחרים")}
            subtitle={pageText(
              page,
              "works_subtitle",
              "מדף נחיתה ממיר ועד חנות מלאה — הצצה לאתרים שכבר באוויר"
            )}
          />
          <DecorativeAsset
            asset={decorations.sparklesAlt}
            size={52}
            className="absolute -top-4 left-[10%] hidden lg:block"
          />
        </div>
        {websiteProjects.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {websiteProjects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.07} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              title="האתרים הראשונים בדרך לכאן"
              subtitle="פרויקטי האתרים ודפי הנחיתה יעלו לתיק ממש בקרוב."
            />
          </div>
        )}
      </section>

      {/* מה חשוב באתר שעובד */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="site-principles-title"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          {/* חלון הדפדפן המרחף */}
          <Reveal direction="right" className="order-last lg:order-first">
            <div className="relative mx-auto w-64 max-w-full md:w-80">
              <FloatingSticker duration={5.5} distance={12}>
                <AssetImage
                  asset={browserCards.browserWindow}
                  className="w-full h-auto"
                />
              </FloatingSticker>
              <DecorativeAsset
                asset={decorations.curvedArrowLeft}
                size={72}
                float={false}
                rotate={8}
                className="absolute -top-10 -right-14 hidden md:block opacity-80"
              />
              <DecorativeAsset
                asset={decorations.heartSticker}
                size={48}
                delay={1.4}
                rotate={-12}
                className="absolute -bottom-4 -left-6 hidden md:block"
              />
            </div>
          </Reveal>

          {/* הכותרת וארבע הנקודות */}
          <div>
            <div id="site-principles-title">
              <SectionTitle
                align="right"
                title={pageText(page, "principles_title", "מה חשוב באתר שעובד")}
                subtitle={pageText(
                  page,
                  "principles_subtitle",
                  "ארבעה דברים שאני לא מתפשר עליהם באף פרויקט — כי הם ההבדל בין אתר יפה לאתר שמכניס כסף"
                )}
              />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {sitePrinciples.map((point, i) => (
                <Reveal key={point.key} delay={i * 0.08} className="h-full">
                  <StickerCard className="flex h-full flex-col gap-3 p-6">
                    <span aria-hidden className="w-14">
                      <AssetImage
                        asset={point.icon}
                        decorative
                        variant="sticker-sm"
                        className="w-full h-auto"
                      />
                    </span>
                    <h3 className="text-lg font-extrabold">{point.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {point.description}
                    </p>
                  </StickerCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA סוגר */}
      <CTASection
        title={pageText(page, "cta_title", "רוצים אתר שעובד בשבילכם?")}
        subtitle={pageText(
          page,
          "cta_subtitle",
          "ספרו לי על העסק ועל המטרה — ותקבלו הצעה ברורה לאתר או דף נחיתה שמביא תוצאות."
        )}
      />
    </div>
  );
}
