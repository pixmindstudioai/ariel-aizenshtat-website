"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { getMediaLibrary } from "@/lib/admin/actions/media";
import { uploadMediaFile } from "@/lib/admin/upload";
import { mediaAccept, mediaKind, type MediaKind } from "@/lib/media";
import type { MediaRow } from "@/lib/types";
import { adminAssets } from "@/data/adminAssets";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import { icons } from "@/data/assets";
import AssetImage from "@/components/AssetImage";
import { useToast } from "@/components/admin/AdminToast";

interface AdminMediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, alt: string) => void;
  /** הגבלת הבוחר לסוגי מדיה מסוימים (למשל וידאו בלבד) */
  kinds?: MediaKind[];
}

const isImage = (type: string) => type.startsWith("image/");

/** בוחר מדיה: ספריית הקבצים מ-Supabase Storage + העלאה ישירה מהדפדפן */
export default function AdminMediaPicker({ open, onClose, onSelect, kinds }: AdminMediaPickerProps) {
  const [items, setItems] = useState<MediaRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // רענון הספרייה בכל פתיחה — בלי setState סינכרוני בתוך ה-effect
  const fetchGeneration = useRef(0);
  useEffect(() => {
    if (!open) return;
    const generation = ++fetchGeneration.current;
    getMediaLibrary().then((result) => {
      if (fetchGeneration.current !== generation) return;
      if (result.ok) {
        setItems(result.data ?? []);
        setError(null);
      } else {
        setError(result.error);
      }
    });
  }, [open]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const result = await uploadMediaFile(file, "general");
    setUploading(false);
    if (result.ok && result.data) {
      toast("הקובץ הועלה בהצלחה");
      setItems((prev) => [result.data!, ...(prev ?? [])]);
    } else if (!result.ok) {
      toast(result.error, "error");
    }
  };

  const visibleItems =
    items && kinds && kinds.length > 0
      ? items.filter((item) => kinds.includes(mediaKind(item.file_type)))
      : items;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="בחירת מדיה"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="admin-card flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden !p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-black">בחירת מדיה</h3>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept={mediaAccept(kinds)}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="btn-admin-primary !py-2"
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}
                >
                  {uploading ? (
                    "מעלה..."
                  ) : (
                    <>
                      <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                        <AssetImage
                          asset={icons.upload}
                          decorative
                          variant="flat"
                          className="w-full h-auto"
                        />
                      </span>{" "}
                      העלאת קובץ
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 font-bold hover:bg-slate-200"
                  aria-label="סגירה"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {error ? (
                <p className="py-10 text-center font-semibold text-red-600">{error}</p>
              ) : visibleItems === null ? (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : visibleItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-40">
                    <AdminAssetImage
                      asset={adminAssets.mediaUpload}
                      decorative
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="font-bold">הספרייה עדיין ריקה</p>
                  <p className="text-sm text-muted">העלו קובץ ראשון עם הכפתור למעלה</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                  {visibleItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.file_url, item.alt_text || item.file_name);
                        onClose();
                      }}
                      className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 transition-colors hover:border-blue"
                      title={item.file_name}
                    >
                      {isImage(item.file_type) ? (
                        <Image
                          src={item.file_url}
                          alt={item.alt_text || item.file_name}
                          fill
                          sizes="180px"
                          className="object-cover"
                        />
                      ) : mediaKind(item.file_type) === "audio" ? (
                        <span className="grid h-full w-full place-items-center bg-gradient-to-br from-[#4f7bff]/10 to-[#7c5cff]/10 text-4xl">
                          🎵
                        </span>
                      ) : (
                        <span className="grid h-full w-full place-items-center">
                          <span className="w-14" aria-hidden>
                            <AssetImage
                              asset={
                                item.file_type === "application/pdf"
                                  ? icons.notepad
                                  : icons.videoEdit
                              }
                              decorative
                              variant="flat"
                              className="w-full h-auto"
                            />
                          </span>
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 truncate bg-white/85 px-2 py-1 text-right text-[11px] font-semibold">
                        {item.file_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
