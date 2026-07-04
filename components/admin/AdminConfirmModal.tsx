"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AdminConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: ReactNode;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** מודאל אישור — בעיקר למחיקות: "האם אתה בטוח?" */
export default function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  danger = false,
  pending = false,
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="admin-card w-full max-w-md p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black">{title}</h3>
            {description && <p className="mt-2 leading-relaxed text-muted">{description}</p>}
            <div className="mt-6 flex flex-row-reverse gap-3">
              <button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className={danger ? "btn-admin-danger" : "btn-admin-primary"}
              >
                {pending ? "רגע..." : confirmLabel}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={pending}
                className="btn-admin-secondary"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
