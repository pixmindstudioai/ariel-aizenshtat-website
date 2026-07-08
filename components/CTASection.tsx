import AssetButton from "@/components/AssetButton";
import AssetImage from "@/components/AssetImage";
import DecorativeAsset from "@/components/DecorativeAsset";
import FloatingSticker from "@/components/FloatingSticker";
import Reveal from "@/components/Reveal";
import { buttons, mascots, decorations } from "@/data/assets";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
}

/** אזור CTA גדול לקראת סוף עמוד: מסקוטים + כפתורים גרפיים */
export default function CTASection({
  title = "יש לכם רעיון? בואו נהפוך אותו למשהו חי",
  subtitle = "ספרו לי מה אתם צריכים — אתר, סרטון, אוטומציה או הכל ביחד — ותקבלו תשובה עוד היום.",
}: CTASectionProps) {
  return (
    <section className="overflow-guard relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="card-soft overflow-guard relative px-6 py-14 text-center md:px-16 md:py-20">
          {/* רקע עדין */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(124,92,255,0.10),transparent)]"
          />
          {/* מסקוטים בפינות */}
          <FloatingSticker
            className="pointer-events-none absolute -right-4 bottom-6 hidden w-28 md:block lg:w-36"
            duration={5.5}
          >
            <AssetImage asset={mascots.codexCloud} decorative className="w-full h-auto" />
          </FloatingSticker>
          <FloatingSticker
            className="pointer-events-none absolute -left-3 top-8 hidden w-24 md:block lg:w-32"
            duration={6}
            delay={0.8}
          >
            <AssetImage asset={mascots.openclawCloud} decorative className="w-full h-auto" />
          </FloatingSticker>
          <DecorativeAsset
            asset={decorations.heartSticker}
            size={52}
            delay={1.5}
            className="absolute left-[18%] bottom-8 hidden lg:block"
            rotate={-10}
          />

          <div className="relative flex flex-col items-center gap-5">
            <h2 className="max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
              {title}
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted">{subtitle}</p>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
              <AssetButton
                asset={buttons.ctaBuildButton}
                ariaLabel="בואו נבנה משהו מגניב — מעבר לעמוד צור קשר"
                href="/contact"
                displayWidth={300}
              />
              <AssetButton
                asset={buttons.ctaPortfolioButton}
                ariaLabel="צפו בתיק העבודות"
                href="/portfolio"
                displayWidth={260}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
