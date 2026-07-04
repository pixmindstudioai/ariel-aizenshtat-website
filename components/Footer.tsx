import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { mascots, decorations } from "@/data/assets";
import { navLinks } from "@/data/nav";
import type { SiteSettingsRow } from "@/lib/types";

interface FooterProps {
  /** הגדרות האתר מהדאטהבייס — טקסט פוטר, אימייל וקישורים חברתיים */
  settings?: SiteSettingsRow | null;
}

const DEFAULT_FOOTER_TEXT =
  "יוצר. טכנולוגי. בונה חוויות. אתרים, סרטוני AI, אוטומציות ומדריכים — הכל במקום אחד, בעברית ובגובה העיניים.";

export default function Footer({ settings }: FooterProps) {
  const socials = [
    { label: "וואטסאפ", href: settings?.whatsapp_url },
    { label: "אינסטגרם", href: settings?.instagram_url },
    { label: "יוטיוב", href: settings?.youtube_url },
    { label: "טיקטוק", href: settings?.tiktok_url },
    { label: "לינקדאין", href: settings?.linkedin_url },
  ].filter((s): s is { label: string; href: string } => !!s.href);

  return (
    <footer className="relative mt-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card-soft relative overflow-hidden px-8 py-12 md:px-14">
          {/* קישוט פינתי עדין */}
          <div className="pointer-events-none absolute -left-6 -bottom-8 w-28 opacity-70 rotate-12">
            <AssetImage asset={decorations.sparklesSet} decorative variant="flat" className="w-full h-auto" />
          </div>

          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
            {/* מותג */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2" aria-label={`${settings?.site_name || "Ariel AI"} — עמוד הבית`}>
                <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue to-purple text-white font-black text-lg">
                  A
                </span>
                <span className="text-xl font-extrabold">
                  Ariel <span className="text-gradient">AI</span>
                </span>
              </Link>
              <p className="mt-4 max-w-sm leading-relaxed text-muted">
                {settings?.footer_text || DEFAULT_FOOTER_TEXT}
              </p>
              {(settings?.email || socials.length > 0) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {settings?.email && (
                    <a
                      href={`mailto:${settings.email}`}
                      dir="ltr"
                      className="font-semibold text-blue underline-offset-4 hover:underline"
                    >
                      {settings.email}
                    </a>
                  )}
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-muted transition-colors hover:text-blue"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-5 flex w-16">
                <AssetImage
                  asset={mascots.claudeHappy}
                  decorative
                  variant="sticker-sm"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* ניווט */}
            <nav aria-label="ניווט תחתון">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
                ניווט
              </h2>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-medium text-ink transition-colors hover:text-blue"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* תיק עבודות מפורט */}
            <nav aria-label="קטגוריות תיק עבודות">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
                תיק עבודות
              </h2>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/portfolio/video" className="font-medium text-ink transition-colors hover:text-blue">
                    פרויקטי וידאו
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio/websites" className="font-medium text-ink transition-colors hover:text-blue">
                    אתרים ודפי נחיתה
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio/automation" className="font-medium text-ink transition-colors hover:text-blue">
                    אוטומציות וכלים דיגיטליים
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-sm text-muted md:flex-row">
            <p>
              © {new Date().getFullYear()} {settings?.site_name || "Ariel AI"}. כל הזכויות שמורות.
            </p>
            <p>
              נבנה באהבה עם Next.js + בינה מלאכותית
            </p>
          </div>
        </div>
      </div>
      <div className="h-8" />
    </footer>
  );
}
