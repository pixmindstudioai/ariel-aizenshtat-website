"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { useToast } from "@/components/admin/AdminToast";
import AssetImage from "@/components/AssetImage";
import { icons } from "@/data/assets";
import type { ActionResult } from "@/lib/types";

interface ContentRowActionsProps {
  id: string;
  title: string;
  status: string;
  editHref: string;
  viewHref: string;
  canHardDelete: boolean;
  publishAction: (id: string, publish: boolean) => Promise<ActionResult>;
  deleteAction: (id: string, options?: { hard?: boolean }) => Promise<ActionResult>;
}

/** פעולות שורה גנריות למדריכים ומדריכי וידאו */
export default function ContentRowActions({
  id,
  title,
  status,
  editHref,
  viewHref,
  canHardDelete,
  publishAction,
  deleteAction,
}: ContentRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);

  const run = (fn: () => Promise<ActionResult>) => {
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        toast(result.message ?? "בוצע");
        setConfirm(null);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const isPublished = status === "published";

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={editHref} className="rounded-full px-3 py-1.5 text-sm font-bold text-blue hover:bg-blue/10">
        עריכה
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => publishAction(id, !isPublished))}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-slate-100"
        title={isPublished ? "ביטול פרסום" : "פרסום באתר"}
      >
        <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
          <AssetImage
            asset={isPublished ? icons.inbox : icons.growth}
            decorative
            variant="flat"
            className="w-full h-auto"
          />
        </span>
        {isPublished ? "לטיוטה" : "פרסום"}
      </button>
      <Link
        href={`${viewHref}${isPublished ? "" : "?preview=true"}`}
        target="_blank"
        className="rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-slate-100"
        title="צפייה באתר"
      >
        <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
          <AssetImage asset={icons.eye} decorative variant="flat" className="w-full h-auto" />
        </span>
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirm("archive")}
        className="rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-slate-100"
        title="העברה לארכיון"
      >
        <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
          <AssetImage asset={icons.dashboardFolder} decorative variant="flat" className="w-full h-auto" />
        </span>
      </button>
      {canHardDelete && (
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirm("delete")}
          className="rounded-full px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50"
          title="מחיקה לצמיתות"
        >
          <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
            <AssetImage asset={icons.trash} decorative variant="flat" className="w-full h-auto" />
          </span>
        </button>
      )}

      <AdminConfirmModal
        open={confirm === "archive"}
        title="להעביר לארכיון?"
        description={`"${title}" יוסר מהאתר הציבורי אבל יישאר שמור כאן.`}
        confirmLabel="העברה לארכיון"
        pending={pending}
        onConfirm={() => run(() => deleteAction(id))}
        onCancel={() => setConfirm(null)}
      />
      <AdminConfirmModal
        open={confirm === "delete"}
        title="למחוק לצמיתות?"
        description={`האם אתה בטוח שאתה רוצה למחוק את "${title}" לצמיתות? אי אפשר לבטל את הפעולה הזו.`}
        confirmLabel="מחיקה לצמיתות"
        danger
        pending={pending}
        onConfirm={() => run(() => deleteAction(id, { hard: true }))}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
