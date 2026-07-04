import type { Metadata } from "next";
import Link from "next/link";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import { adminAssets } from "@/data/adminAssets";
import { signOut } from "@/lib/admin/actions/auth";

export const metadata: Metadata = {
  title: "אין הרשאה",
  robots: { index: false },
};

/** משתמש מחובר בלי הרשאת גישה לממשק הניהול */
export default function NoAccessPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#F8FAFF] px-4">
      <div className="admin-card flex w-full max-w-md flex-col items-center gap-4 p-10 text-center">
        <div className="w-40">
          <AdminAssetImage
            asset={adminAssets.sparklesArrowLeft}
            decorative
            className="w-full h-auto"
          />
        </div>
        <h1 className="text-2xl font-black">אין לך הרשאה</h1>
        <p className="leading-relaxed text-muted">
          המשתמש שלך מחובר, אבל אין לו הרשאת גישה לממשק הניהול. אם זו טעות — בקשו
          ממנהל האתר לשדרג את ההרשאה שלכם בעמוד המשתמשים.
        </p>
        <div className="mt-2 flex gap-3">
          <Link href="/" className="btn-admin-secondary">
            חזרה לאתר
          </Link>
          <form action={signOut}>
            <button type="submit" className="btn-admin-primary">
              התחברות עם משתמש אחר
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
