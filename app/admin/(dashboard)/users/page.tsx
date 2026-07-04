import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UsersManager from "@/components/admin/UsersManager";
import { adminAssets } from "@/data/adminAssets";
import { listProfiles } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "משתמשים" };

export default async function AdminUsersPage() {
  const profile = await requireAdmin();
  const profiles = await listProfiles();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        asset={adminAssets.usersManagement}
        title="ניהול משתמשים"
        assetWidth={210}
        description="מי יכול להיכנס לממשק הניהול ומה מותר לו: מנהל · עורך · צופה"
      />
      <UsersManager profiles={profiles} currentUserId={profile.id} />
    </div>
  );
}
