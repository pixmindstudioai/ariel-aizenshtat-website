import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import AssetButton from "@/components/AssetButton";
import AssetImage from "@/components/AssetImage";
import DecorativeAsset from "@/components/DecorativeAsset";
import FloatingSticker from "@/components/FloatingSticker";
import Reveal from "@/components/Reveal";
import { buttons, mascots, decorations } from "@/data/assets";
import { fetchContactSettings, fetchPage } from "@/lib/cms";

export const metadata: Metadata = {
  title: "צור קשר",
  description:
    "רוצים אתר, סרטון AI או אוטומציה לעסק? השאירו הודעה בטופס, בוואטסאפ או במייל — מענה תוך יום עבודה.",
};

export const revalidate = 300;

export default async function ContactPage() {
  // פרטי הקשר מגיעים מהגדרות האתר בדאטהבייס (עם ברירות מחדל)
  const [{ whatsappUrl: WHATSAPP_URL, email }, page] = await Promise.all([
    fetchContactSettings(),
    fetchPage("contact"),
  ]);
  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      {/* Hero */}
      <div className="relative">
        <DecorativeAsset
          asset={decorations.sparklesAlt}
          size={44}
          delay={0.4}
          className="absolute left-1/2 top-2 -translate-x-1/2 hidden md:block"
        />
        <PageHero
          title={page?.hero_title || "בואו נדבר"}
          subtitle={
            page?.hero_description ||
            "ספרו לי מה אתם צריכים — אתר, סרטון, אוטומציה או סתם רעיון שמסתובב לכם בראש. אני עונה לכל הודעה תוך יום עבודה."
          }
        />
      </div>

      {/* טופס + דרכים נוספות */}
      <section
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="contact-main-title"
      >
        <h2 id="contact-main-title" className="sr-only-visual">
          שליחת הודעה ודרכים נוספות ליצירת קשר
        </h2>
        <DecorativeAsset
          asset={decorations.curvedArrowLeft}
          size={76}
          float={false}
          className="absolute -top-20 right-[9%] hidden lg:block opacity-80"
        />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* הטופס */}
          <Reveal className="h-full">
            <ContactForm whatsappUrl={WHATSAPP_URL} />
          </Reveal>

          {/* דרכים נוספות */}
          <Reveal delay={0.12} className="h-full">
            <div className="card-soft flex h-full flex-col gap-7 p-7 md:p-8">
              <h3 className="text-2xl font-black tracking-tight">
                דרכים נוספות
              </h3>

              {/* וואטסאפ */}
              <div className="flex flex-col gap-3">
                <p className="font-bold">וואטסאפ — הכי מהיר</p>
                <AssetButton
                  asset={buttons.ctaMessageButton}
                  ariaLabel="שלחו הודעה בוואטסאפ"
                  href={WHATSAPP_URL}
                  displayWidth={220}
                />
              </div>

              {/* מייל */}
              <div className="flex flex-col gap-1">
                <p className="font-bold">מייל</p>
                <a
                  href={`mailto:${email}`}
                  dir="ltr"
                  className="self-start font-semibold text-blue underline-offset-4 transition-colors hover:underline"
                >
                  {email}
                </a>
              </div>

              {/* מגיבים מהר */}
              <div className="rounded-2xl bg-blue/5 px-5 py-4">
                <p className="font-bold">מגיבים מהר</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  רוב ההודעות נענות תוך כמה שעות, ותמיד בתוך יום עבודה. אין
                  בוטים בצד השני — רק אני.
                </p>
              </div>

              {/* החיפושית */}
              <div className="mt-auto flex items-center gap-4 pt-2">
                <FloatingSticker className="w-16 shrink-0" duration={5}>
                  <AssetImage
                    asset={mascots.openclawCloud}
                    decorative
                    variant="sticker-sm"
                    className="w-full h-auto"
                  />
                </FloatingSticker>
                <p className="text-sm font-semibold text-muted">
                  החיפושית כבר מחכה להודעה שלכם
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* שיחת היכרות */}
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="quick-call-title"
      >
        <Reveal>
          <div className="card-soft mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-right">
            <div>
              <h2
                id="quick-call-title"
                className="text-xl font-black tracking-tight md:text-2xl"
              >
                מעדיפים לדבר?
              </h2>
              <p className="mt-1 text-muted">
                קבעו שיחת היכרות של 15 דקות — בלי התחייבות, רק להכיר.
              </p>
            </div>
            <a
              href={WHATSAPP_URL}
              className="btn-secondary shrink-0"
              aria-label="קביעת שיחת היכרות של 15 דקות בוואטסאפ"
            >
              לקביעת שיחה ←
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
