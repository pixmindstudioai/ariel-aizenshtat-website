"use client";

import AdminFormField from "@/components/admin/AdminFormField";
import AdminCard from "@/components/admin/AdminCard";
import { icons } from "@/data/assets";

interface AdminSeoFieldsProps {
  seoTitle: string;
  seoDescription: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  titleError?: string;
  descriptionError?: string;
}

/** שדות SEO אחידים לכל טפסי התוכן */
export default function AdminSeoFields({
  seoTitle,
  seoDescription,
  onTitleChange,
  onDescriptionChange,
  titleError,
  descriptionError,
}: AdminSeoFieldsProps) {
  return (
    <AdminCard title="SEO" icon={icons.eye} className="!p-5">
      <div className="flex flex-col gap-4">
        <AdminFormField
          label="כותרת SEO"
          htmlFor="seo_title"
          error={titleError}
          hint={`${seoTitle.length}/70 תווים — מה שיופיע בגוגל`}
        >
          <input
            id="seo_title"
            className="admin-input"
            value={seoTitle}
            aria-invalid={!!titleError}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="ריק = הכותרת הרגילה"
          />
        </AdminFormField>
        <AdminFormField
          label="תיאור SEO"
          htmlFor="seo_description"
          error={descriptionError}
          hint={`${seoDescription.length}/170 תווים`}
        >
          <textarea
            id="seo_description"
            rows={2}
            className="admin-input resize-none"
            value={seoDescription}
            aria-invalid={!!descriptionError}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="תיאור קצר שמופיע מתחת לכותרת בתוצאות החיפוש"
          />
        </AdminFormField>
      </div>
    </AdminCard>
  );
}
