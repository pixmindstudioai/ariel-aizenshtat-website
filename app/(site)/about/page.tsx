import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import AssetImage from "@/components/AssetImage";
import DecorativeAsset from "@/components/DecorativeAsset";
import FloatingSticker from "@/components/FloatingSticker";
import MascotStrip from "@/components/MascotStrip";
import StickerCard from "@/components/StickerCard";
import Reveal from "@/components/Reveal";
import CTASection from "@/components/CTASection";
import { sectionCards, mascots, decorations, profile, icons } from "@/data/assets";
import { fetchPage } from "@/lib/cms";

export const metadata: Metadata = {
  title: "אודות",
  description:
    "נעים להכיר, אני אריאל — יוצר תוכן, מרצה AI ובונה מוצרים דיגיטליים. טכנולוגיה בגובה העיניים, בלי מילים גבוהות ועם הרבה תוצאות.",
};

/** נתוני "במספרים" */
const stats = [
  { value: "8+", label: "שנות ניסיון" },
  { value: "120+", label: "פרויקטים שיצאו לאוויר" },
  { value: "2,000+", label: "תלמידים ומשתתפי סדנאות" },
  { value: "∞", label: "כוסות קפה" },
];

/** שלושת הערכים שמנחים כל פרויקט */
const values = [
  {
    icon: icons.gearFace,
    title: "פשטות",
    text: "הטכנולוגיה הכי טובה היא זו שלא מרגישים. אני חותך את המורכב עד שנשאר רק מה שבאמת עובד — וכל אחד מבין איך.",
  },
  {
    icon: icons.eye,
    title: "שקיפות",
    text: "בלי קופסאות שחורות. תמיד תדעו מה אני בונה, למה בחרתי ככה, וכמה זה עולה — לפני שמתחילים, לא אחרי.",
  },
  {
    icon: icons.growth,
    title: "תוצאות",
    text: "מצגות יפות זה נחמד, אבל אני נמדד במה שקורה אחרי: מוצר באוויר, תהליך שחוסך שעות, וידע שנשאר אצלכם.",
  },
];

export const revalidate = 300;

export default async function AboutPage() {
  const page = await fetchPage("about");
  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      <PageHero
        badgeAsset={sectionCards.aboutCard}
        hideTextWhenBadge
        title={page?.hero_title || "אודות"}
        subtitle={
          page?.hero_description ||
          "יוצר, מרצה ובונה חוויות דיגיטליות — נעים מאוד, אני אריאל."
        }
      />

      {/* הסיפור שלי */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="story-title"
      >
        <DecorativeAsset
          asset={decorations.curvedArrow}
          size={72}
          float={false}
          rotate={-12}
          className="absolute -top-10 left-[8%] hidden xl:block opacity-80"
        />
        <Reveal>
          <div className="card-soft relative overflow-hidden px-6 py-10 md:px-14 md:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_0%,rgba(124,92,255,0.08),transparent)]"
            />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-5">
                <h2
                  id="story-title"
                  className="text-3xl font-black tracking-tight md:text-4xl"
                >
                  הסיפור <span className="text-gradient">שלי</span>
                </h2>
                <p className="text-lg leading-relaxed text-muted">
                  היי, אני אריאל — יוצר תוכן, מרצה AI ובונה מוצרים דיגיטליים.
                  ביום-יום אני מלהטט בין קוד, מצלמה וכיתה: בונה אתרים
                  ואוטומציות, מצלם ועורך סרטונים, ומלמד אנשים איך להפוך את
                  הבינה המלאכותית לכלי עבודה אמיתי.
                </p>
                <p className="text-lg leading-relaxed text-muted">
                  הכל התחיל מסקרנות שלא ידעה לעצור: פירקתי כלים, שברתי דברים,
                  תיקנתי אותם, ובדרך גיליתי שהחלק שאני הכי אוהב הוא הרגע שבו
                  משהו מסובך נהיה פתאום פשוט. מאז זה מה שאני עושה — לוקח
                  טכנולוגיה שנראית מאיימת והופך אותה למשהו שכיף להשתמש בו.
                </p>
                <p className="text-lg leading-relaxed text-muted">
                  אני מאמין בטכנולוגיה בגובה העיניים. בלי באזוורדס, בלי
                  להסתתר מאחורי מונחים — הסבר טוב הוא כזה שגם סבתא שלכם הייתה
                  מבינה, וכלי טוב הוא כזה שעובד בשבילכם ולא להפך.
                </p>
                <p className="text-lg leading-relaxed text-muted">
                  אני עוזר לעסקים קטנים, ליוצרים ולאנשים סקרנים שרוצים לזוז
                  מהר: מי שצריך אתר, סרטון או אוטומציה — ומי שרוצה ללמוד לעשות
                  את זה בעצמו. אם זה נשמע כמו אתם, אנחנו כנראה נסתדר מצוין.
                </p>
              </div>
              <div className="relative mx-auto">
                {/* התמונה האישית — להחלפה שמרו קובץ חדש ב-public/assetss/profile/ariel.png */}
                <FloatingSticker className="w-52 md:w-64 lg:w-72" duration={5.5}>
                  <AssetImage
                    asset={profile.arielPhoto}
                    priority
                    className="w-full h-auto rounded-full"
                  />
                </FloatingSticker>
                {/* קלוד קוד מציץ ליד התמונה */}
                <FloatingSticker
                  className="absolute -bottom-4 -left-6 w-20 md:w-24"
                  duration={6.2}
                  delay={0.7}
                >
                  <AssetImage
                    asset={mascots.claudeHappy}
                    decorative
                    className="w-full h-auto"
                  />
                </FloatingSticker>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* במספרים */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stats-title"
      >
        <div id="stats-title" className="relative">
          <SectionTitle
            title="במספרים"
            subtitle="כי מאחורי כל סיפור טוב מסתתרים גם קצת נתונים"
          />
          <DecorativeAsset
            asset={decorations.sparklesAlt}
            size={52}
            delay={0.8}
            className="absolute -top-6 right-[10%] hidden md:block opacity-90"
          />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="h-full">
              <StickerCard className="flex h-full flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="text-gradient text-5xl font-black tracking-tight md:text-6xl">
                  {stat.value}
                </span>
                <span className="text-lg font-semibold text-muted">
                  {stat.label}
                </span>
              </StickerCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* הערכים שלי */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="values-title"
      >
        <div id="values-title" className="relative">
          <SectionTitle
            title="הערכים שלי"
            subtitle="שלושה עקרונות שמלווים כל פרויקט — מהשיחה הראשונה ועד ההשקה"
          />
          <DecorativeAsset
            asset={decorations.heartSticker}
            size={56}
            delay={1.2}
            rotate={-8}
            className="absolute -top-8 left-[12%] hidden lg:block"
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 0.08} className="h-full">
              <StickerCard className="flex h-full flex-col items-center gap-4 px-6 py-10 text-center">
                <span aria-hidden className="w-20">
                  <AssetImage
                    asset={value.icon}
                    decorative
                    variant="sticker-sm"
                    className="w-full h-auto"
                  />
                </span>
                <h3 className="text-2xl font-black tracking-tight">
                  {value.title}
                </h3>
                <p className="leading-relaxed text-muted">{value.text}</p>
              </StickerCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* הצוות */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="team-title"
      >
        <div id="team-title">
          <SectionTitle
            title="הצוות"
            subtitle="העוזרים הדיגיטליים שאיתי בכל פרויקט — עובדים מסביב לשעון ואף פעם לא מתלוננים"
          />
        </div>
        <Reveal className="mt-12">
          <MascotStrip />
        </Reveal>
      </section>

      {/* CTA סוגר */}
      <CTASection
        title="רוצים לעבוד יחד?"
        subtitle="ספרו לי על הרעיון, הפרויקט או הבעיה — ונמצא יחד את הדרך הכי פשוטה להפוך אותם למשהו אמיתי."
      />
    </div>
  );
}
