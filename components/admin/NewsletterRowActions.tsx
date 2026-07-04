"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteNewsletter, duplicateNewsletter } from "@/lib/admin/actions/newsletter";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { useToast } from "@/components/admin/AdminToast";
import type { NewsletterRow } from "@/lib/types";

interface NewsletterRowActionsProps {
  newsletter: NewsletterRow;
  canDelete: boolean;
}

export default function NewsletterRowActions({ newsletter, canDelete }: NewsletterRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const duplicate = () => {
    startTransition(async () => {
      const result = await duplicateNewsletter(newsletter.id);
      if (result.ok && result.data) {
        toast(result.message ?? "שוכפל");
        router.push(`/admin/newsletter/${result.data.id}`);
      } else if (!result.ok) {
        toast(result.error, "error");
      }
    });
  };

  const remove = () => {
    startTransition(async () => {
      const result = await deleteNewsletter(newsletter.id);
      if (result.ok) {
        toast(result.message ?? "נמחק");
        setConfirmDelete(false);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/newsletter/${newsletter.id}`}
        className="rounded-full px-3 py-1.5 text-sm font-bold text-blue hover:bg-blue/10"
      >
        {newsletter.status === "sent" ? "צפייה" : "עריכה"}
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={duplicate}
        className="rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-slate-100"
        title="שכפול לגיליון חדש"
      >
        📑 שכפול
      </button>
      {canDelete && (
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirmDelete(true)}
          className="rounded-full px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50"
          title="מחיקה"
        >
          🗑️
        </button>
      )}

      <AdminConfirmModal
        open={confirmDelete}
        title="למחוק את הגיליון?"
        description={`"${newsletter.subject}" יימחק לצמיתות${newsletter.status === "sent" ? " (המיילים שכבר נשלחו כמובן יישארו אצל הנמענים)" : ""}.`}
        confirmLabel="מחיקה לצמיתות"
        danger
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
