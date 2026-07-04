"use client";

import { slugify } from "@/lib/slug";
import AdminFormField from "@/components/admin/AdminFormField";

interface AdminSlugFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** הכותרת שממנה אפשר לגזור slug אוטומטית */
  sourceTitle: string;
  error?: string;
  /** תחילית הנתיב הציבורי לתצוגה, למשל ‎/portfolio/ */
  pathPrefix?: string;
}

/** שדה slug עם יצירה אוטומטית מהכותרת (כולל תעתיק מעברית) ואפשרות עריכה ידנית */
export default function AdminSlugField({
  value,
  onChange,
  sourceTitle,
  error,
  pathPrefix = "/",
}: AdminSlugFieldProps) {
  return (
    <AdminFormField
      label="Slug (כתובת בעברית → אנגלית)"
      htmlFor="slug"
      error={error}
      hint={`הכתובת באתר: ${pathPrefix}${value || "..."}`}
      required
    >
      <div className="flex gap-2">
        <input
          id="slug"
          dir="ltr"
          className="admin-input text-left"
          value={value}
          aria-invalid={!!error}
          onChange={(e) => onChange(slugify(e.target.value) || e.target.value.toLowerCase())}
          placeholder="my-new-project"
        />
        <button
          type="button"
          className="btn-admin-secondary shrink-0 !px-4"
          onClick={() => onChange(slugify(sourceTitle))}
          title="יצירת slug מהכותרת"
        >
          מהכותרת
        </button>
      </div>
    </AdminFormField>
  );
}
