"use client";

import { useState } from "react";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminMediaPicker from "@/components/admin/AdminMediaPicker";
import AssetImage from "@/components/AssetImage";
import VideoPlayer from "@/components/media/VideoPlayer";
import { icons } from "@/data/assets";

interface AdminVideoPickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  hint?: string;
}

/**
 * שדה וידאו: בחירת קובץ מספריית המדיה שלנו בלבד (בלי יוטיוב/וימאו),
 * עם תצוגה מקדימה בנגן המותאם של האתר.
 */
export default function AdminVideoPicker({
  label,
  value,
  onChange,
  error,
  hint,
}: AdminVideoPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <AdminFormField label={label} error={error} hint={hint}>
      <div className="flex flex-col gap-3">
        {value ? (
          <div className="w-full max-w-md">
            <VideoPlayer src={value} className="!rounded-2xl" />
          </div>
        ) : (
          <div className="grid h-24 w-full max-w-md place-items-center rounded-2xl border-2 border-dashed border-slate-200 text-sm text-muted">
            אין וידאו עדיין — בוחרים קובץ מספריית המדיה
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-admin-secondary !py-2 text-sm"
            onClick={() => setPickerOpen(true)}
          >
            <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
              <AssetImage
                asset={icons.videoEdit}
                decorative
                variant="flat"
                className="w-full h-auto"
              />
            </span>{" "}
            בחירה מהספרייה
          </button>
          {value && (
            <button
              type="button"
              className="btn-admin-danger !py-2 text-sm"
              onClick={() => onChange("")}
            >
              הסרה
            </button>
          )}
        </div>
      </div>

      <AdminMediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        kinds={["video"]}
      />
    </AdminFormField>
  );
}
