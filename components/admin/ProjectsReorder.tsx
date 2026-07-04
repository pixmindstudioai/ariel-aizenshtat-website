"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reorderProjects } from "@/lib/admin/actions/projects";
import { useToast } from "@/components/admin/AdminToast";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AssetImage from "@/components/AssetImage";
import { icons } from "@/data/assets";
import type { ProjectRow } from "@/lib/types";

interface ProjectsReorderProps {
  projects: ProjectRow[];
}

/** מצב סידור פרויקטים בגרירה (Drag & Drop) — שומר סדר ידני חדש */
export default function ProjectsReorder({ projects: initial }: ProjectsReorderProps) {
  const [items, setItems] = useState(initial);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const moveTo = (from: number, to: number) => {
    if (from === to) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDirty(true);
  };

  const save = () => {
    startTransition(async () => {
      const result = await reorderProjects(items.map((p) => p.id));
      if (result.ok) {
        toast("הסדר עודכן באתר");
        setDirty(false);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">גררו פרויקטים כדי לשנות את סדר ההופעה באתר</p>
        <div className="flex gap-2">
          <Link href="/admin/projects" className="btn-admin-secondary !py-2 text-sm">
            סיום
          </Link>
          <button
            type="button"
            className="btn-admin-primary !py-2 text-sm"
            disabled={!dirty || pending}
            onClick={save}
          >
            {pending ? (
              "שומר..."
            ) : (
              <>
                <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                  <AssetImage asset={icons.save} decorative variant="flat" className="w-full h-auto" />
                </span>{" "}
                שמירת הסדר
              </>
            )}
          </button>
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {items.map((project, index) => (
          <li
            key={project.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== index) {
                moveTo(dragIndex, index);
                setDragIndex(index);
              }
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`flex cursor-grab items-center gap-4 rounded-2xl border-2 bg-white px-4 py-3 transition-shadow active:cursor-grabbing ${
              dragIndex === index
                ? "border-blue shadow-[0_10px_30px_rgba(79,123,255,0.2)]"
                : "border-slate-100"
            }`}
          >
            <span aria-hidden className="text-muted">
              <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true">
                <circle cx="4" cy="3" r="1.6" />
                <circle cx="10" cy="3" r="1.6" />
                <circle cx="4" cy="9" r="1.6" />
                <circle cx="10" cy="9" r="1.6" />
                <circle cx="4" cy="15" r="1.6" />
                <circle cx="10" cy="15" r="1.6" />
              </svg>
            </span>
            <span className="w-8 text-center font-black text-muted">{index + 1}</span>
            <span className="flex-1 truncate font-bold">{project.title}</span>
            <AdminStatusBadge status={project.status} />
          </li>
        ))}
      </ol>
    </div>
  );
}
