import SectionTitle from "@/components/SectionTitle";
import Reveal from "@/components/Reveal";
import AssetImage from "@/components/AssetImage";
import { sectionCards, icons } from "@/data/assets";
import type { AssetDef } from "@/data/assets";

interface Benefit {
  icon: AssetDef;
  title: string;
  description: string;
}

const defaultBenefits: Benefit[] = [
  {
    icon: icons.upload,
    title: "מהירות של AI, איכות של מקצוען",
    description:
      "תהליכי עבודה מבוססי בינה מלאכותית שמקצרים שבועות לימים — בלי להתפשר על הפרטים הקטנים.",
  },
  {
    icon: icons.chartMascot,
    title: "תוצר שעובד, לא רק נראה טוב",
    description:
      "כל פרויקט נבנה סביב מטרה עסקית ברורה: לידים, מכירות, חיסכון בזמן או חיזוק המותג.",
  },
  {
    icon: icons.users,
    title: "ליווי בגובה העיניים",
    description:
      "הסברים בעברית פשוטה, מדריך שימוש לכל תוצר, וזמינות אמיתית גם אחרי המסירה.",
  },
  {
    icon: icons.briefcase,
    title: "הכל במקום אחד",
    description:
      "אתר, וידאו, אוטומציה ותוכן — צוות שלם של יכולות אצל יוצר אחד, בלי לתאם בין ספקים.",
  },
];

interface BenefitsProps {
  title?: string;
  subtitle?: string;
  benefits?: Benefit[];
}

/** אזור "מה תקבלו" עם הכרטיס הגרפי ככותרת ואייקוני סטיקר */
export default function Benefits({
  title = "מה תקבלו בעבודה איתי",
  subtitle = "ככה נראה פרויקט כשטכנולוגיה, עיצוב ותוכן חיים באותו ראש",
  benefits = defaultBenefits,
}: BenefitsProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="benefits-title">
      <div id="benefits-title">
        <SectionTitle
          title={title}
          badgeAsset={sectionCards.whatYouGetCard}
          hideTextWhenBadge
          subtitle={subtitle}
        />
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.08} className="h-full">
            <div className="card-soft h-full p-7">
              <div className="w-16">
                <AssetImage
                  asset={b.icon}
                  decorative
                  variant="sticker-sm"
                  className="w-full h-auto"
                />
              </div>
              <h3 className="mt-4 text-lg font-extrabold leading-snug">{b.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{b.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
