"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addSubscriber,
  deleteSubscriber,
  setSubscriberStatus,
} from "@/lib/admin/actions/newsletter";
import type { SubscriberRow } from "@/lib/types";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { useToast } from "@/components/admin/AdminToast";
import { formatDate } from "@/lib/format";

interface SubscribersManagerProps {
  subscribers: SubscriberRow[];
  canWrite: boolean;
  canDelete: boolean;
}

/** ניהול רשימת התפוצה: הוספה ידנית, השבתה/חידוש, מחיקה וייצוא CSV */
export default function SubscribersManager({
  subscribers,
  canWrite,
  canDelete,
}: SubscribersManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<SubscriberRow | null>(null);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      const result = await addSubscriber(email.trim(), name.trim());
      if (result.ok) {
        toast(result.message ?? "נוסף");
        setEmail("");
        setName("");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const toggle = (subscriber: SubscriberRow) => {
    startTransition(async () => {
      const result = await setSubscriberStatus(
        subscriber.id,
        subscriber.status === "subscribed" ? "unsubscribed" : "subscribed"
      );
      if (result.ok) {
        toast(result.message ?? "עודכן");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const remove = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const result = await deleteSubscriber(confirmDelete.id);
      if (result.ok) {
        toast(result.message ?? "נמחק");
        setConfirmDelete(null);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const exportCsv = () => {
    const rows = [
      ["email", "full_name", "status", "created_at"],
      ...subscribers.map((s) => [s.email, s.full_name, s.status, s.created_at]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "newsletter-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast("קובץ ה-CSV ירד למחשב 📥");
  };

  return (
    <div className="flex flex-col gap-6">
      {canWrite && (
        <div className="admin-card p-6">
          <h2 className="mb-1 text-lg font-extrabold">➕ הוספת נרשם ידנית</h2>
          <p className="mb-4 text-sm text-muted">
            למשל מישהו שביקש להצטרף בהודעה פרטית — נרשמים מהאתר מתווספים לבד
          </p>
          <form onSubmit={add} className="flex flex-wrap items-center gap-3">
            <input
              type="email"
              dir="ltr"
              required
              className="admin-input !w-64 text-left"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="אימייל הנרשם"
            />
            <input
              className="admin-input !w-44"
              placeholder="שם (לא חובה)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="שם הנרשם"
            />
            <button type="submit" disabled={pending || !email.trim()} className="btn-admin-primary">
              {pending ? "מוסיף..." : "הוספה לרשימה"}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={subscribers.length === 0}
              className="btn-admin-secondary mr-auto text-sm"
            >
              📥 ייצוא CSV
            </button>
          </form>
        </div>
      )}

      <div className="admin-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-right">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black text-muted">
                <th className="px-5 py-3">אימייל</th>
                <th className="px-3 py-3">שם</th>
                <th className="px-3 py-3">מקור</th>
                <th className="px-3 py-3">סטטוס</th>
                <th className="px-3 py-3">הצטרפו</th>
                {canWrite && <th className="px-5 py-3 text-left">פעולות</th>}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-slate-50">
                  <td className="px-5 py-3 font-bold" dir="ltr">
                    {subscriber.email}
                  </td>
                  <td className="px-3 py-3 text-sm text-muted">{subscriber.full_name || "—"}</td>
                  <td className="px-3 py-3 text-sm text-muted">
                    {subscriber.source === "admin" ? "הוספה ידנית" : "האתר"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                        subscriber.status === "subscribed"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {subscriber.status === "subscribed" ? "פעיל" : "הוסר"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-muted">{formatDate(subscriber.created_at)}</td>
                  {canWrite && (
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => toggle(subscriber)}
                          className="rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-slate-100"
                        >
                          {subscriber.status === "subscribed" ? "הסרה מהתפוצה" : "חידוש מנוי"}
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setConfirmDelete(subscriber)}
                            className="rounded-full px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50"
                            title="מחיקה לצמיתות"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminConfirmModal
        open={!!confirmDelete}
        title="למחוק את הנרשם לצמיתות?"
        description={`${confirmDelete?.email} יימחק כליל מהרשימה. עדיף בדרך כלל "הסרה מהתפוצה" — כך נשמר תיעוד.`}
        confirmLabel="מחיקה לצמיתות"
        danger
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
