"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteUser, toggleUserActive, updateUserRole } from "@/lib/admin/actions/users";
import { roleLabels } from "@/lib/admin/permissions";
import type { ProfileRow, Role } from "@/lib/types";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { useToast } from "@/components/admin/AdminToast";
import { formatDate } from "@/lib/format";
import { icons } from "@/data/assets";
import AssetImage from "@/components/AssetImage";

interface UsersManagerProps {
  profiles: ProfileRow[];
  currentUserId: string;
}

/** ניהול משתמשים: שינוי הרשאות, השבתה והזמנת משתמש חדש */
export default function UsersManager({ profiles, currentUserId }: UsersManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("editor");
  const [confirmDeactivate, setConfirmDeactivate] = useState<ProfileRow | null>(null);

  const changeRole = (userId: string, role: Role) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (result.ok) {
        toast(result.message ?? "ההרשאה עודכנה");
        router.refresh();
      } else toast(result.error, "error");
    });
  };

  const toggleActive = (user: ProfileRow) => {
    startTransition(async () => {
      const result = await toggleUserActive(user.id, !user.is_active);
      if (result.ok) {
        toast(result.message ?? "עודכן");
        setConfirmDeactivate(null);
        router.refresh();
      } else toast(result.error, "error");
    });
  };

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    startTransition(async () => {
      const result = await inviteUser(inviteEmail.trim(), inviteRole);
      if (result.ok) {
        toast(result.message ?? "ההזמנה נשלחה");
        setInviteEmail("");
        router.refresh();
      } else toast(result.error, "error");
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="admin-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-right">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black text-muted">
                <th className="px-5 py-3">משתמש</th>
                <th className="px-3 py-3">אימייל</th>
                <th className="px-3 py-3">הרשאה</th>
                <th className="px-3 py-3">סטטוס</th>
                <th className="px-3 py-3">נוצר</th>
                <th className="px-5 py-3 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id} className="border-b border-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-blue to-purple font-black text-white"
                        >
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                        <span className="font-bold">
                          {user.full_name || "—"}
                          {isSelf && <span className="mr-2 text-xs font-semibold text-muted">(את/ה)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted" dir="ltr">
                      {user.email}
                    </td>
                    <td className="px-3 py-3">
                      {isSelf ? (
                        <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-bold text-blue">
                          {roleLabels[user.role]}
                        </span>
                      ) : (
                        <select
                          className="admin-input !w-28 !rounded-full !py-1.5 text-sm"
                          value={user.role}
                          disabled={pending}
                          onChange={(e) => changeRole(user.id, e.target.value as Role)}
                          aria-label={`הרשאה של ${user.email}`}
                        >
                          <option value="admin">מנהל</option>
                          <option value="editor">עורך</option>
                          <option value="viewer">צופה</option>
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          user.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.is_active ? "פעיל" : "מושבת"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-3 text-left">
                      {!isSelf &&
                        (user.is_active ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setConfirmDeactivate(user)}
                            className="rounded-full px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50"
                          >
                            השבתה
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => toggleActive(user)}
                            className="rounded-full px-3 py-1.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50"
                          >
                            הפעלה
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card p-6">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold">
          <span className="inline-block w-6 shrink-0 align-middle" aria-hidden>
            <AssetImage asset={icons.inbox} decorative variant="flat" className="w-full h-auto" />
          </span>
          הזמנת משתמש חדש
        </h2>
        <p className="mb-4 text-sm text-muted">
          נשלחת הזמנה במייל (דורש SUPABASE_SERVICE_ROLE_KEY). לחלופין — מוסיפים משתמש ידנית
          ב-Supabase Dashboard → Authentication → Add user.
        </p>
        <form onSubmit={sendInvite} className="flex flex-wrap items-center gap-3">
          <input
            type="email"
            dir="ltr"
            className="admin-input !w-64 text-left"
            placeholder="email@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            aria-label="אימייל להזמנה"
          />
          <select
            className="admin-input !w-32"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            aria-label="הרשאה למשתמש החדש"
          >
            <option value="editor">עורך</option>
            <option value="viewer">צופה</option>
            <option value="admin">מנהל</option>
          </select>
          <button type="submit" disabled={pending || !inviteEmail.trim()} className="btn-admin-primary">
            {pending ? "שולח..." : "שליחת הזמנה"}
          </button>
        </form>
      </div>

      <AdminConfirmModal
        open={!!confirmDeactivate}
        title="להשבית את המשתמש?"
        description={`${confirmDeactivate?.full_name || confirmDeactivate?.email} לא יוכל להתחבר יותר לממשק הניהול עד שיופעל מחדש.`}
        confirmLabel="השבתה"
        danger
        pending={pending}
        onConfirm={() => confirmDeactivate && toggleActive(confirmDeactivate)}
        onCancel={() => setConfirmDeactivate(null)}
      />
    </div>
  );
}
