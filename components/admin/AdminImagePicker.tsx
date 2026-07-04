"use client";

import { useState } from "react";
import Image from "next/image";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminMediaPicker from "@/components/admin/AdminMediaPicker";
import AssetImage from "@/components/AssetImage";
import { icons } from "@/data/assets";

interface AdminImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  hint?: string;
}

/** שדה תמונה: תצוגה מקדימה + בחירה מהספרייה / הדבקת URL / הסרה */
export default function AdminImagePicker({
  label,
  value,
  onChange,
  error,
  hint,
}: AdminImagePickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  return (
    <AdminFormField label={label} error={error} hint={hint}>
      <div className="flex flex-col gap-3">
        {value ? (
          <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50">
            <Image src={value} alt="" fill sizes="384px" className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="grid h-24 w-full max-w-sm place-items-center rounded-2xl border-2 border-dashed border-slate-200 text-sm text-muted">
            אין תמונה עדיין
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-admin-secondary !py-2 text-sm"
            onClick={() => setPickerOpen(true)}
          >
            <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
              <AssetImage asset={icons.imageUpload} decorative variant="flat" className="w-full h-auto" />
            </span>{" "}
            בחירה מהספרייה
          </button>
          <button
            type="button"
            className="btn-admin-secondary !py-2 text-sm"
            onClick={() => setManualMode((v) => !v)}
          >
            <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
              <AssetImage asset={icons.browserPages} decorative variant="flat" className="w-full h-auto" />
            </span>{" "}
            הדבקת קישור
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

        {manualMode && (
          <input
            dir="ltr"
            className="admin-input max-w-sm text-left"
            placeholder="https://... או /path/to/image.png"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>

      <AdminMediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        kinds={["image"]}
      />
    </AdminFormField>
  );
}
