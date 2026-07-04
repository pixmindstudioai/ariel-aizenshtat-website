"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteMedia, updateMediaMeta } from "@/lib/admin/actions/media";
import { uploadMediaFile } from "@/lib/admin/upload";
import { MEDIA_LIMITS_LABEL, mediaAccept, mediaKind } from "@/lib/media";
import AudioPlayer from "@/components/media/AudioPlayer";
import VideoPlayer from "@/components/media/VideoPlayer";
import type { MediaRow } from "@/lib/types";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import { useToast } from "@/components/admin/AdminToast";
import { adminAssets } from "@/data/adminAssets";
import { icons } from "@/data/assets";
import AssetImage from "@/components/AssetImage";
import { formatFileSize, formatDate } from "@/lib/format";

interface MediaManagerProps {
  items: MediaRow[];
  canWrite: boolean;
}

const isImage = (type: string) => type.startsWith("image/");

/** ניהול ספריית המדיה: העלאה, תצוגה, עריכת alt, העתקת URL ומחיקה */
export default function MediaManager({ items, canWrite }: MediaManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("general");
  const [selected, setSelected] = useState<MediaRow | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      // העלאה ישירה מהדפדפן ל-Storage — ככה גם קבצי וידאו/אודיו גדולים עוברים
      const result = await uploadMediaFile(file, folder);
      if (result.ok) toast(`"${file.name}" הועלה בהצלחה`);
      else toast(result.error, "error");
    }
    setUploading(false);
    router.refresh();
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast("הקישור הועתק");
  };

  const saveAlt = () => {
    if (!selected) return;
    startTransition(async () => {
      const result = await updateMediaMeta(selected.id, {
        alt_text: altDraft,
        folder: selected.folder,
        caption: selected.caption ?? "",
      });
      if (result.ok) {
        toast("טקסט ה-alt נשמר");
        router.refresh();
      } else toast(result.error, "error");
    });
  };

  const removeSelected = () => {
    if (!selected) return;
    startTransition(async () => {
      const result = await deleteMedia(selected.id);
      if (result.ok) {
        toast(result.message ?? "הקובץ נמחק");
        setSelected(null);
        setConfirmDelete(false);
        router.refresh();
      } else toast(result.error, "error");
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {canWrite && (
        <div className="admin-card flex flex-col items-center gap-4 p-8 text-center">
          <div className="w-56">
            <AdminAssetImage asset={adminAssets.mediaUpload} decorative className="w-full h-auto" sizes="224px" />
          </div>
          <p className="text-muted">
            כל המדיה של האתר נשמרת אצלנו בלבד — תמונות, וידאו (mp4/webm/mov), אודיו
            (mp3/wav/m4a/ogg) ו-PDF · {MEDIA_LIMITS_LABEL}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <select
              className="admin-input !w-40 !rounded-full !py-2 text-sm"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              aria-label="תיקיית יעד"
            >
              <option value="general">כללי</option>
              <option value="projects">פרויקטים</option>
              <option value="guides">מדריכים</option>
              <option value="videos">וידאו</option>
              <option value="audio">אודיו</option>
              <option value="pages">עמודים</option>
              <option value="branding">מיתוג</option>
            </select>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept={mediaAccept()}
              className="hidden"
              onChange={(e) => {
                handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              className="btn-admin-primary"
            >
              {uploading ? (
                "מעלה..."
              ) : (
                <>
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.upload} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  העלאת קבצים
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="admin-card">
          <AdminEmptyState
            asset={adminAssets.exportButton}
            title="ספריית המדיה ריקה"
            description="קבצים שתעלו יופיעו כאן ותוכלו לשבץ אותם בפרויקטים, במדריכים ובעמודים"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelected(item);
                setAltDraft(item.alt_text);
              }}
              className="admin-card group overflow-hidden !p-0 text-right transition-transform hover:scale-[1.02]"
            >
              <div className="relative aspect-video bg-slate-50">
                {isImage(item.file_type) ? (
                  <Image
                    src={item.file_url}
                    alt={item.alt_text || item.file_name}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                ) : mediaKind(item.file_type) === "audio" ? (
                  <span className="grid h-full w-full place-items-center bg-gradient-to-br from-[#4f7bff]/10 to-[#7c5cff]/10 text-4xl">
                    🎵
                  </span>
                ) : (
                  <span className="grid h-full w-full place-items-center">
                    <span className="inline-block w-14" aria-hidden>
                      <AssetImage
                        asset={item.file_type === "application/pdf" ? icons.notepad : icons.videoEdit}
                        decorative
                        variant="flat"
                        className="w-full h-auto"
                      />
                    </span>
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold">{item.file_name}</p>
                <p className="text-xs text-muted">
                  {formatFileSize(item.file_size)} · {item.folder}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* פאנל פרטי קובץ */}
      {selected && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`פרטי הקובץ ${selected.file_name}`}
        >
          <div className="admin-card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            {/* תצוגה מקדימה — וידאו ואודיו מתנגנים בנגנים המותאמים של האתר */}
            {mediaKind(selected.file_type) === "video" ? (
              <div className="mb-4">
                <VideoPlayer
                  src={selected.file_url}
                  title={selected.file_name}
                  className="!rounded-2xl"
                />
              </div>
            ) : mediaKind(selected.file_type) === "audio" ? (
              <div className="mb-4">
                <AudioPlayer src={selected.file_url} title={selected.file_name} />
              </div>
            ) : (
              <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-slate-50">
                {isImage(selected.file_type) ? (
                  <Image
                    src={selected.file_url}
                    alt={selected.alt_text || selected.file_name}
                    fill
                    sizes="512px"
                    className="object-contain"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center">
                    <span className="inline-block w-16" aria-hidden>
                      <AssetImage asset={icons.notepad} decorative variant="flat" className="w-full h-auto" />
                    </span>
                  </span>
                )}
              </div>
            )}

            <p className="font-black">{selected.file_name}</p>
            <p className="mt-1 text-xs text-muted">
              {formatFileSize(selected.file_size)} · הועלה {formatDate(selected.created_at)} ·{" "}
              {selected.folder}
            </p>

            {canWrite && (
              <div className="mt-4 flex flex-col gap-2">
                <label htmlFor="alt-edit" className="text-sm font-bold">
                  טקסט חלופי (alt) — חשוב לנגישות ו-SEO
                </label>
                <div className="flex gap-2">
                  <input
                    id="alt-edit"
                    className="admin-input"
                    value={altDraft}
                    onChange={(e) => setAltDraft(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={saveAlt}
                    disabled={pending}
                    className="btn-admin-secondary shrink-0 !px-4 !py-2 text-sm"
                  >
                    שמירה
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => copyUrl(selected.file_url)} className="btn-admin-primary !py-2 text-sm">
                <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                  <AssetImage asset={icons.notepad} decorative variant="flat" className="w-full h-auto" />
                </span>{" "}
                העתקת קישור
              </button>
              <a
                href={selected.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-admin-secondary !py-2 text-sm"
              >
                פתיחה בטאב חדש
              </a>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="btn-admin-danger !py-2 text-sm"
                >
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.trash} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  מחיקה
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mr-auto rounded-full px-4 py-2 text-sm font-bold text-muted hover:bg-slate-100"
              >
                סגירה
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmModal
        open={confirmDelete}
        title="למחוק את הקובץ?"
        description={`"${selected?.file_name}" יימחק מהאחסון לצמיתות. אם הוא משובץ בתוכן — המדיה תיעלם מהאתר.`}
        confirmLabel="מחיקה לצמיתות"
        danger
        pending={pending}
        onConfirm={removeSelected}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
