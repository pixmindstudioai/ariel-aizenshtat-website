import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/public/queries";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const FALLBACK = {
  title: "Ariel AI - יוצר חוויות דיגיטליות עם בינה מלאכותית",
  description:
    "פורטפוליו אישי של Ariel AI: פרויקטי וידאו, אתרים, דפי נחיתה, מדריכים כתובים, מדריכי וידאו ופתרונות AI לעסקים ויוצרים.",
  keywords: [
    "בינה מלאכותית",
    "AI",
    "יצירת וידאו",
    "פרסומות AI",
    "בניית אתרים",
    "דפי נחיתה",
    "מדריכים",
    "Ariel AI",
  ],
};

/** מטא-דאטה גלובלית — נטענת מהגדרות האתר בדאטהבייס, עם ברירות מחדל */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.seo_title || FALLBACK.title;
  const description = settings?.seo_description || FALLBACK.description;
  return {
    title: {
      default: title,
      template: `%s | ${settings?.site_name || "Ariel AI"}`,
    },
    description,
    keywords: settings?.seo_keywords
      ? settings.seo_keywords.split(",").map((k) => k.trim())
      : FALLBACK.keywords,
    openGraph: {
      title,
      description,
      locale: "he_IL",
      type: "website",
      ...(settings?.default_og_image ? { images: [settings.default_og_image] } : {}),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
