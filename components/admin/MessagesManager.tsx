"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMessage, updateMessageStatus } from "@/lib/admin/actions/messages";
import type { ContactMessageRow, MessageStatus } from "@/lib/types";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AssetImage from "@/components/AssetImage";
import { icons } from "@/data/assets";
import { useToast } from "@/components/admin/AdminToast";
import { formatDateTime } from "@/lib/format";

interface MessagesManagerProps {
  messages: ContactMessageRow[];
  canHandle: boolean;
  canDelete: boolean;
}

/** רשימת פניות: פתיחה, סימון סטטוס, מענה במייל/וואטסאפ, ארכוב ומחיקה */
export default function MessagesManager({ messages, canHandle, canDelete }: MessagesManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const setStatus = (id: string, status: MessageStatus, silent = false) => {
    if (!canHandle) return;
    startTransition(async () => {
      const result = await updateMessageStatus(id, status);
      if (result.ok) {
        if (!silent) toast(result.message ?? "עודכן");
        router.refresh();
      } else if (!silent) {
        toast(result.error, "error");
      }
    });
  };

  const open = (message: ContactMessageRow) => {
    setOpenId(openId === message.id ? null : message.id);
    // פתיחת פנייה חדשה מסמנת אותה כנקראה
    if (message.status === "new") setStatus(message.id, "read", true);
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const result = await deleteMessage(id);
      if (result.ok) {
        toast(result.message ?? "הפנייה נמחקה");
        setConfirmDeleteId(null);
        router.refresh();
      } else toast(result.error, "error");
    });
  };

  const whatsappLink = (phone: string) =>
    `https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "972")}`;

  return (
    <ul className="flex flex-col divide-y divide-slate-50">
      {messages.map((message) => (
        <li key={message.id}>
          <button
            type="button"
            onClick={() => open(message)}
            className="flex w-full items-center gap-4 px-6 py-4 text-right transition-colors hover:bg-blue/[0.03]"
            aria-expanded={openId === message.id}
          >
            <span
              aria-hidden
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue/15 to-purple/15 font-black text-blue"
            >
              {message.full_name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{message.full_name}</span>
              <span className="block truncate text-sm text-muted">{message.message}</span>
            </span>
            {message.project_type && (
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted sm:block">
                {message.project_type}
              </span>
            )}
            <span className="hidden text-xs text-muted md:block">
              {formatDateTime(message.created_at)}
            </span>
            <AdminStatusBadge status={message.status} />
          </button>

          {openId === message.id && (
            <div className="border-t border-slate-50 bg-slate-50/50 px-6 py-5">
              <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                <span dir="ltr">
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.inbox} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  {message.email}
                </span>
                {message.phone && (
                  <span dir="ltr">
                    <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                      <AssetImage asset={icons.chat} decorative variant="flat" className="w-full h-auto" />
                    </span>{" "}
                    {message.phone}
                  </span>
                )}
                {message.source_page && <span>הגיע מ: {message.source_page}</span>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent("תגובה לפנייתך באתר")}`}
                  className="btn-admin-primary !py-2 text-sm"
                  onClick={() => canHandle && setStatus(message.id, "replied", true)}
                >
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.inbox} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  מענה במייל
                </a>
                {message.phone && (
                  <a
                    href={whatsappLink(message.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-admin-secondary !py-2 text-sm"
                    onClick={() => canHandle && setStatus(message.id, "replied", true)}
                  >
                    <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                      <AssetImage asset={icons.chat} decorative variant="flat" className="w-full h-auto" />
                    </span>{" "}
                    פתיחה בוואטסאפ
                  </a>
                )}
                {canHandle && (
                  <>
                    {message.status !== "replied" && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setStatus(message.id, "replied")}
                        className="btn-admin-secondary !py-2 text-sm"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="inline-block w-4 shrink-0 align-middle"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M4 12.5l5 5L20 6.5" />
                        </svg>{" "}
                        סימון כטופל
                      </button>
                    )}
                    {message.status !== "archived" && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setStatus(message.id, "archived")}
                        className="btn-admin-secondary !py-2 text-sm"
                      >
                        <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                          <AssetImage asset={icons.dashboardFolder} decorative variant="flat" className="w-full h-auto" />
                        </span>{" "}
                        ארכוב
                      </button>
                    )}
                  </>
                )}
                {canDelete && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmDeleteId(message.id)}
                    className="btn-admin-danger !py-2 text-sm"
                  >
                    <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                      <AssetImage asset={icons.trash} decorative variant="flat" className="w-full h-auto" />
                    </span>{" "}
                    מחיקה
                  </button>
                )}
              </div>
            </div>
          )}

          <AdminConfirmModal
            open={confirmDeleteId === message.id}
            title="למחוק את הפנייה?"
            description={`הפנייה של ${message.full_name} תימחק לצמיתות.`}
            confirmLabel="מחיקה לצמיתות"
            danger
            pending={pending}
            onConfirm={() => remove(message.id)}
            onCancel={() => setConfirmDeleteId(null)}
          />
        </li>
      ))}
    </ul>
  );
}
