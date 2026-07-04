"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signOut } from "@/lib/admin/actions/auth";
import AssetImage from "@/components/AssetImage";
import { profile as profileAssets } from "@/data/assets";
import type { ProfileRow } from "@/lib/types";

const SECTION_LABELS: Record<string, string> = {
  admin: "דאשבורד",
  pages: "עמודים",
  projects: "פרויקטים",
  guides: "מדריכים כתובים",
  "video-guides": "מדריכי וידאו",
  categories: "קטגוריות",
  media: "מדיה",
  messages: "הודעות ופניות",
  analytics: "סטטיסטיקות",
  settings: "הגדרות האתר",
  users: "משתמשים",
  new: "חדש",
};

interface AdminTopbarProps {
  profile: ProfileRow;
  onToggleSidebar: () => void;
}

export default function AdminTopbar({ profile, onToggleSidebar }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [signingOut, startSignOut] = useTransition();

  // פירורי לחם מהנתיב: /admin/projects/new → ממשק ניהול / פרויקטים / חדש
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: SECTION_LABELS[segment] ?? segment,
    last: i === segments.length - 1,
  }));

  // חיפוש מהיר — מנווט לרשימה המתאימה עם פילטר
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    const section = segments[1];
    const searchable = ["projects", "guides", "video-guides", "messages", "media"];
    const target = searchable.includes(section) ? section : "projects";
    router.push(`/admin/${target}?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-slate-100 bg-white/85 px-4 py-3 backdrop-blur md:px-6">
      {/* תפריט מובייל */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="grid h-10 w-10 place-items-center rounded-2xl border-2 border-slate-100 text-lg lg:hidden"
        aria-label="פתיחת תפריט הניהול"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* פירורי לחם */}
      <nav aria-label="פירורי לחם" className="hidden min-w-0 flex-1 sm:block">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb) => (
            <li key={crumb.href} className="flex items-center gap-1.5 truncate">
              {crumb.last ? (
                <span className="font-black text-ink">{crumb.label}</span>
              ) : (
                <>
                  <Link href={crumb.href} className="font-semibold text-muted hover:text-blue">
                    {crumb.label}
                  </Link>
                  <span aria-hidden className="text-muted">
                    ‹
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* חיפוש מהיר */}
      <form onSubmit={handleSearch} className="hidden md:block">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש מהיר..."
          aria-label="חיפוש מהיר"
          className="admin-input !w-52 !rounded-full !py-2 text-sm"
        />
      </form>

      {/* משתמש מחובר */}
      <div className="mr-auto flex items-center gap-3 sm:mr-0">
        <span title={profile.full_name || profile.email}>
          <AssetImage
            asset={profileAssets.arielPhoto}
            decorative
            variant="flat"
            sizes="40px"
            className="h-10 w-10"
          />
        </span>
        <button
          type="button"
          onClick={() => startSignOut(async () => void (await signOut()))}
          disabled={signingOut}
          className="btn-admin-secondary !px-4 !py-2 text-sm"
        >
          {signingOut ? "..." : "יציאה"}
        </button>
      </div>
    </header>
  );
}
