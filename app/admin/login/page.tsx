import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import LoginForm from "@/components/admin/LoginForm";
import { adminAssets } from "@/data/adminAssets";

export const metadata: Metadata = {
  title: "התחברות לממשק הניהול",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center bg-[#F8FAFF] px-4 py-10">
      {/* קישוטים עדינים */}
      <div className="pointer-events-none absolute right-[12%] top-[12%] hidden w-24 opacity-80 md:block">
        <AdminAssetImage asset={adminAssets.sparklesArrowUp} className="w-full h-auto" />
      </div>
      <div className="pointer-events-none absolute bottom-[14%] left-[10%] hidden w-20 opacity-70 md:block">
        <AdminAssetImage asset={adminAssets.sparklesArrowLeft} className="w-full h-auto" />
      </div>

      <div className="w-full max-w-md">
        <div className="admin-card p-8 md:p-10">
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <div className="w-64 max-w-full">
              <AdminAssetImage
                asset={adminAssets.dashboardTitle}
                decorative
                priority
                className="w-full h-auto"
              />
            </div>
            <h1 className="sr-only-visual">התחברות לממשק הניהול של האתר</h1>
            <p className="text-muted">מתחברים עם המייל והסיסמה שהוגדרו ב-Supabase</p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/" className="font-bold text-blue hover:underline">
            → חזרה לאתר
          </Link>
        </p>
      </div>
    </div>
  );
}
