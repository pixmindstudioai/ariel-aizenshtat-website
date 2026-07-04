"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { categorySchema, type CategoryInput } from "@/lib/admin/validation";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/admin/actions/categories";
import type { CategoryRow, CategoryType } from "@/lib/types";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminSlugField from "@/components/admin/AdminSlugField";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { useToast } from "@/components/admin/AdminToast";

const TYPE_LABELS: Record<CategoryType, string> = {
  project: "פרויקטים",
  guide: "מדריכים כתובים",
  video_guide: "מדריכי וידאו",
  global: "כללי",
};

interface CategoryManagerProps {
  categories: CategoryRow[];
  /** מספר פריטי תוכן לכל קטגוריה — לאזהרת מחיקה */
  usage: Record<string, number>;
}

/** ניהול קטגוריות: רשימה לפי סוג, יצירה, עריכה ומחיקה עם העברת תוכן */
export default function CategoryManager({ categories, usage }: CategoryManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CategoryRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [reassignTo, setReassignTo] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema) as never,
    defaultValues: { name: "", slug: "", description: "", type: "project", color: "", icon: "", sort_order: 0 },
  });

  const name = watch("name") ?? "";
  const slug = watch("slug") ?? "";

  const openEditor = (category: CategoryRow | "new") => {
    setEditing(category);
    if (category === "new") {
      reset({ name: "", slug: "", description: "", type: "project", color: "", icon: "", sort_order: 0 });
    } else {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        type: category.type,
        color: category.color ?? "",
        icon: category.icon ?? "",
        sort_order: category.sort_order,
      });
    }
  };

  const save = () =>
    handleSubmit(async () => {
      const values = getValues();
      const result =
        editing === "new"
          ? await createCategory(values)
          : await updateCategory((editing as CategoryRow).id, values);
      if (result.ok) {
        toast(result.message ?? "נשמר");
        setEditing(null);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    })();

  const confirmDelete = () => {
    if (!deleting) return;
    const count = usage[deleting.id] ?? 0;
    startTransition(async () => {
      const result = await deleteCategory(deleting.id, {
        reassignTo: count > 0 ? (reassignTo || null) : undefined,
        allowUnassign: count > 0 && !reassignTo,
      });
      if (result.ok) {
        toast(result.message ?? "הקטגוריה נמחקה");
        setDeleting(null);
        setReassignTo("");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const groups = (Object.keys(TYPE_LABELS) as CategoryType[])
    .map((type) => ({ type, items: categories.filter((c) => c.type === type) }))
    .filter((g) => g.items.length > 0 || g.type !== "global");

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.type} className="admin-card p-6">
          <h2 className="mb-4 text-lg font-extrabold">קטגוריות {TYPE_LABELS[group.type]}</h2>
          {group.items.length === 0 ? (
            <p className="text-sm text-muted">אין עדיין קטגוריות בסוג הזה</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-50">
              {group.items.map((category) => (
                <li key={category.id} className="flex items-center gap-3 py-3">
                  <span
                    aria-hidden
                    className="h-4 w-4 shrink-0 rounded-full border border-slate-200"
                    style={{ background: category.color ?? "#e2e8f0" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {category.icon ? `${category.icon} ` : ""}
                      {category.name}
                    </p>
                    <p className="text-xs text-muted" dir="ltr">
                      {category.slug} · {usage[category.id] ?? 0} פריטים
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditor(category)}
                    className="rounded-full px-3 py-1.5 text-sm font-bold text-blue hover:bg-blue/10"
                  >
                    עריכה
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleting(category);
                      setReassignTo("");
                    }}
                    className="rounded-full px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    מחיקה
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <div>
        <button type="button" onClick={() => openEditor("new")} className="btn-admin-primary">
          + הוספת קטגוריה
        </button>
      </div>

      {/* מודאל יצירה/עריכה */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4"
            onClick={() => setEditing(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="admin-card w-full max-w-lg p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-5 text-xl font-black">
                {editing === "new" ? "קטגוריה חדשה" : `עריכת קטגוריה: ${(editing as CategoryRow).name}`}
              </h3>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminFormField label="שם" htmlFor="cat-name" error={errors.name?.message} required>
                    <input id="cat-name" className="admin-input" {...register("name")} />
                  </AdminFormField>
                  <AdminFormField label="סוג" htmlFor="cat-type">
                    <select id="cat-type" className="admin-input" {...register("type")}>
                      <option value="project">פרויקטים</option>
                      <option value="guide">מדריכים כתובים</option>
                      <option value="video_guide">מדריכי וידאו</option>
                      <option value="global">כללי</option>
                    </select>
                  </AdminFormField>
                </div>

                <AdminSlugField
                  value={slug}
                  onChange={(v) => setValue("slug", v, { shouldValidate: true })}
                  sourceTitle={name}
                  error={errors.slug?.message}
                />

                <AdminFormField label="תיאור" htmlFor="cat-description">
                  <input id="cat-description" className="admin-input" {...register("description")} />
                </AdminFormField>

                <div className="grid gap-4 sm:grid-cols-3">
                  <AdminFormField label="צבע" htmlFor="cat-color" error={errors.color?.message}>
                    <input
                      id="cat-color"
                      type="color"
                      className="h-11 w-full cursor-pointer rounded-2xl border-2 border-slate-100"
                      value={watch("color") || "#4f7bff"}
                      onChange={(e) => setValue("color", e.target.value)}
                    />
                  </AdminFormField>
                  <AdminFormField label="אייקון (אימוג׳י)" htmlFor="cat-icon">
                    <input id="cat-icon" className="admin-input" {...register("icon")} />
                  </AdminFormField>
                  <AdminFormField label="סדר" htmlFor="cat-sort">
                    <input
                      id="cat-sort"
                      type="number"
                      className="admin-input"
                      {...register("sort_order", { setValueAs: (v: string) => Number(v) || 0 })}
                    />
                  </AdminFormField>
                </div>

                <div className="flex flex-row-reverse gap-3 pt-2">
                  <button type="button" onClick={save} disabled={isSubmitting} className="btn-admin-primary">
                    {isSubmitting ? "שומר..." : "שמירה"}
                  </button>
                  <button type="button" onClick={() => setEditing(null)} className="btn-admin-secondary">
                    ביטול
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* מחיקה עם העברת תוכן */}
      <AdminConfirmModal
        open={!!deleting && (usage[deleting.id] ?? 0) === 0}
        title="למחוק את הקטגוריה?"
        description={`"${deleting?.name}" תימחק. אין תוכן שמשויך אליה.`}
        confirmLabel="מחיקה"
        danger
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <AnimatePresence>
        {deleting && (usage[deleting.id] ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4"
            onClick={() => setDeleting(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="admin-card w-full max-w-md p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black">רגע! יש תוכן בקטגוריה הזו</h3>
              <p className="mt-2 leading-relaxed text-muted">
                {`יש ${usage[deleting.id]} פריטי תוכן שמשויכים ל"${deleting.name}". לאן להעביר אותם?`}
              </p>
              <select
                className="admin-input mt-4"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                aria-label="קטגוריה חלופית"
              >
                <option value="">ללא קטגוריה</option>
                {categories
                  .filter((c) => c.id !== deleting.id && c.type === deleting.type)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <div className="mt-6 flex flex-row-reverse gap-3">
                <button type="button" onClick={confirmDelete} disabled={pending} className="btn-admin-danger">
                  {pending ? "מוחק..." : "העברה ומחיקה"}
                </button>
                <button type="button" onClick={() => setDeleting(null)} className="btn-admin-secondary">
                  ביטול
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
