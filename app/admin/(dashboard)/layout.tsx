import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/AdminToast";

export const metadata: Metadata = {
  title: {
    default: "ממשק ניהול",
    template: "%s | ממשק ניהול",
  },
  robots: { index: false },
};

/** ה-layout המוגן של ממשק הניהול — בדיקת הרשאה אמיתית בצד שרת בכל בקשה */
export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireStaff();

  const supabase = await createServerClient();
  const { count } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <ToastProvider>
      <AdminShell profile={profile} newMessagesCount={count ?? 0}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
