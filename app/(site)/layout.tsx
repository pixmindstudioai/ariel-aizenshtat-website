import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { getSiteSettings } from "@/lib/public/queries";

/** עטיפת האתר הציבורי: Header + Footer סביב כל עמוד (האדמין נשאר נקי) */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <>
      <AnalyticsTracker />
      <Header
        ctaText={settings?.primary_cta_text}
        ctaUrl={settings?.primary_cta_url}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
