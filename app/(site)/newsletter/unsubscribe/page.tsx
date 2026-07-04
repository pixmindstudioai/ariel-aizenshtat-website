import type { Metadata } from "next";
import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { newsletterAssets } from "@/data/newsletterAssets";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "הסרה מרשימת התפוצה",
  robots: { index: false },
};

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** עמוד ההסרה שהקישור במייל מוביל אליו — מסיר לפי טוקן אישי */
export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = await searchParams;

  let outcome: "removed" | "invalid" = "invalid";
  if (token && UUID_RE.test(token)) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("newsletter_unsubscribe", { p_token: token });
      // גם אם הטוקן כבר שומש (data=false) — מבחינת הגולש ההסרה הצליחה
      if (!error) outcome = "removed";
    } catch {
      outcome = "invalid";
    }
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center">
      <div className="w-36">
        <AssetImage
          asset={newsletterAssets.envelopeCute}
          decorative
          className="w-full h-auto"
        />
      </div>

      {outcome === "removed" ? (
        <>
          <h1 className="text-3xl font-black md:text-4xl">הוסרתם מרשימת התפוצה</h1>
          <p className="max-w-md text-lg leading-relaxed text-muted">
            לא תקבלו יותר מיילים מאיתנו. מצטערים לראות אתכם הולכים — ואם תתגעגעו,
            אפשר להירשם מחדש בכל רגע מעמוד הבית.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-black md:text-4xl">הקישור לא תקין</h1>
          <p className="max-w-md text-lg leading-relaxed text-muted">
            נראה שקישור ההסרה חלקי או ישן. אפשר לפתוח שוב את הקישור מהמייל האחרון
            שקיבלתם, או לכתוב לנו ונסיר אתכם ידנית.
          </p>
        </>
      )}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          חזרה לעמוד הבית
        </Link>
        {outcome === "invalid" && (
          <Link href="/contact" className="btn-secondary">
            צרו קשר
          </Link>
        )}
      </div>
    </section>
  );
}
