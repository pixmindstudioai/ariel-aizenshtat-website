"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import AssetImage from "@/components/AssetImage";
import { adminAssets } from "@/data/adminAssets";
import { icons, type AssetDef } from "@/data/assets";
import type { Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: AssetDef;
  adminOnly?: boolean;
  badge?: number;
}

interface AdminSidebarProps {
  role: Role;
  newMessagesCount: number;
  /** סגירת התפריט במובייל אחרי ניווט */
  onNavigate?: () => void;
}

export default function AdminSidebar({ role, newMessagesCount, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/admin", label: "דאשבורד", icon: icons.dashboard },
    { href: "/admin/pages", label: "עמודים", icon: icons.browserPages },
    { href: "/admin/projects", label: "פרויקטים", icon: icons.briefcase },
    { href: "/admin/guides", label: "מדריכים כתובים", icon: icons.notepad },
    { href: "/admin/video-guides", label: "מדריכי וידאו", icon: icons.videoEdit },
    { href: "/admin/categories", label: "קטגוריות", icon: icons.dashboardFolder },
    { href: "/admin/media", label: "מדיה", icon: icons.gallery },
    { href: "/admin/messages", label: "הודעות ופניות", icon: icons.inbox, badge: newMessagesCount },
    { href: "/admin/newsletter", label: "ניוזלטר", icon: icons.chat },
    { href: "/admin/analytics", label: "סטטיסטיקות", icon: icons.analytics },
    { href: "/admin/settings", label: "הגדרות האתר", icon: icons.settings, adminOnly: true },
    { href: "/admin/users", label: "משתמשים", icon: icons.users, adminOnly: true },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="flex h-full w-64 flex-col gap-4 overflow-y-auto border-l border-slate-100 bg-white px-4 py-6 shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
      {/* לוגו ממשק הניהול */}
      <Link href="/admin" onClick={onNavigate} className="block px-2">
        <span className="sr-only-visual">ממשק הניהול של האתר</span>
        <AdminAssetImage
          asset={adminAssets.dashboardTitle}
          decorative
          className="w-full h-auto"
          sizes="220px"
        />
      </Link>

      <nav aria-label="ניווט ממשק הניהול" className="flex-1">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            if (item.adminOnly && role !== "admin") return null;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 font-bold transition-colors ${
                    active
                      ? "bg-gradient-to-l from-blue/10 to-purple/10 text-blue"
                      : "text-ink hover:bg-slate-50"
                  }`}
                >
                  <span className="inline-block w-6 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={item.icon} decorative variant="flat" className="w-full h-auto" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {!!item.badge && item.badge > 0 && (
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-gradient-to-l from-blue to-purple px-1.5 text-xs font-black text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* צפייה באתר */}
      <Link
        href="/"
        target="_blank"
        onClick={onNavigate}
        className="btn-admin-secondary w-full !py-2.5 text-sm"
      >
        <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
          <AssetImage asset={icons.browserPages} decorative variant="flat" className="w-full h-auto" />
        </span>
        צפייה באתר
      </Link>
    </aside>
  );
}
