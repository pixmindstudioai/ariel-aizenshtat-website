"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastKind = "success" | "error";

interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastContextValue {
  toast: (text: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast חייב לרוץ בתוך ToastProvider");
  return ctx;
}

/** ספק טוסטים לממשק הניהול — "נשמר בהצלחה", "הייתה שגיאה" וכו' */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback((text: string, kind: ToastKind = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, kind, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-lg ${
                t.kind === "success"
                  ? "bg-white text-ink border border-emerald-200"
                  : "bg-white text-red-700 border border-red-200"
              }`}
            >
              <span aria-hidden className="inline-flex shrink-0">
                {t.kind === "success" ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="8" cy="8" r="7" className="text-emerald-500" strokeWidth="1.5" />
                    <path
                      d="M5 8.2l2 2 4-4.4"
                      className="text-emerald-500"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="8" cy="8" r="7" strokeWidth="1.5" />
                    <path d="M8 4.5v4.2" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="8" cy="11.6" r="0.9" fill="currentColor" stroke="none" />
                  </svg>
                )}
              </span>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
