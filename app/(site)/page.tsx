import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import SectionTitle from "@/components/SectionTitle";
import FeatureCard from "@/components/FeatureCard";
import ProjectCard from "@/components/ProjectCard";
import CTASection from "@/components/CTASection";
import MascotStrip from "@/components/MascotStrip";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Reveal from "@/components/Reveal";
import DecorativeAsset from "@/components/DecorativeAsset";
import NewsletterSignup from "@/components/NewsletterSignup";
import { services } from "@/data/services";
import { fetchFeaturedProjects, fetchFaq, fetchPage, pageText } from "@/lib/cms";
import {
  sectionCards,
  browserCards,
  badges,
  decorations,
} from "@/data/assets";
import type { AssetDef } from "@/data/assets";

/**
 * אסט מייצג לכל כרטיס שירות בעמוד הבית.
 * כשהטקסט שבאסט זהה לכותרת הכרטיס — hasTitle=true והכותרת מוסתרת ויזואלית
 * (נשארת ב-DOM ל-SEO) כדי שלא תהיה כפילות.
 */
const serviceAssets: Record<string, { asset: AssetDef; hasTitle: boolean }> = {
  video: { asset: badges.aiBadge, hasTitle: false },
  websites: { asset: browserCards.browserWindow, hasTitle: false },
  "written-guides": { asset: sectionCards.writtenGuidesCard, hasTitle: true },
  "video-guides": { asset: sectionCards.videoGuidesCard, hasTitle: true },
};

/** תוכן מהדאטהבייס מתרענן לכל היותר כל 5 דקות (וגם מיידית מפעולות האדמין) */
export const revalidate = 300;

export default async function HomePage() {
  const [featuredProjects, faqItems, page] = await Promise.all([
    fetchFeaturedProjects(),
    fetchFaq(),
    fetchPage("home"),
  ]);
  return (
    <div className="flex flex-col gap-24 md:gap-32 pb-8">
      <HeroSection
        heroTitle={page?.hero_title ?? undefined}
        heroDescription={page?.hero_description ?? undefined}
      />

      {/* מה אני עושה */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="services-title"
      >
        <div id="services-title" className="relative">
          <SectionTitle
            title={pageText(page, "services_title", "מה אני עושה")}
            subtitle={pageText(
              page,
              "services_subtitle",
              "ארבעה עולמות, ראש אחד: קוד, וידאו, ידע ואוטומציה — כל מה שעסק צריך כדי לזוז מהר"
            )}
          />
          <DecorativeAsset
            asset={decorations.sparklesAlt}
            size={56}
            className="absolute -top-6 left-[12%] hidden lg:block"
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.08} className="h-full">
              <FeatureCard
                service={service}
                asset={serviceAssets[service.slug]?.asset}
                assetHasTitle={serviceAssets[service.slug]?.hasTitle}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* פרויקטים אחרונים — הסקשן מוסתר עד שמפורסם פרויקט מודגש ראשון */}
      {featuredProjects.length > 0 && (
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="projects-title"
      >
        <div id="projects-title" className="relative">
          <SectionTitle
            title={pageText(page, "projects_title", "פרויקטים אחרונים")}
            badgeAsset={sectionCards.projectsSelectedCard}
            hideTextWhenBadge
            subtitle={pageText(
              page,
              "projects_subtitle",
              "הצצה לעבודות שיצאו לאוויר לאחרונה — מוידאו ועד אוטומציה"
            )}
          />
          <DecorativeAsset
            asset={decorations.curvedArrowLeft}
            size={80}
            float={false}
            className="absolute top-2 right-[10%] hidden xl:block opacity-80"
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.slice(0, 6).map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.07} className="h-full">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link href="/portfolio" className="btn-secondary text-lg">
            לכל תיק העבודות ←
          </Link>
        </Reveal>
      </section>
      )}

      {/* הצוות — מסקוטים */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="team-title">
        <div id="team-title">
          <SectionTitle
            title={pageText(page, "team_title", "הצוות הקטן שלי")}
            subtitle={pageText(
              page,
              "team_subtitle",
              "שלושה עוזרים דיגיטליים שעובדים איתי מסביב לשעון — בלי הפסקות קפה"
            )}
          />
        </div>
        <Reveal className="mt-12">
          <MascotStrip />
        </Reveal>
      </section>

      {/* מה מקבלים */}
      <Benefits />

      {/* לקוחות מרוצים */}
      <Testimonials />

      {/* שאלות נפוצות */}
      <FAQ items={faqItems} />

      {/* הרשמה לניוזלטר */}
      <NewsletterSignup />

      {/* CTA סוגר */}
      <CTASection
        title={pageText(page, "cta_title", "יש לכם רעיון? בואו נהפוך אותו למשהו חי")}
        subtitle={pageText(
          page,
          "cta_subtitle",
          "ספרו לי מה אתם צריכים — אתר, סרטון, אוטומציה או הכל ביחד — ותקבלו תשובה עוד היום."
        )}
      />
    </div>
  );
}
