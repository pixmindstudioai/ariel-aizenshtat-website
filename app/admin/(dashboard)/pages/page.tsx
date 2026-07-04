import type { Metadata } from "next";
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AssetImage from "@/components/AssetImage";
import { adminAssets } from "@/data/adminAssets";
import { icons } from "@/data/assets";
import { listPages } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/auth";
import { publicPathForPage } from "@/lib/public-paths";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "עמודים" };

export default async function AdminPagesPage() {
  await requireStaff();
  const pages = await listPages();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        asset={adminAssets.pagesManagement}
        title="ניהול עמודים"
        assetWidth={220}
        description="כל עמודי האתר — כותרות, טקסטים, SEO וסטטוס פרסום"
      />

      <AdminCard className="!p-0 overflow-hidden">
        {pages.length === 0 ? (
          <AdminEmptyState
            asset={adminAssets.pagesManagement}
            title="אין עמודים בדאטהבייס"
            description="הריצו את database/seed.sql ב-Supabase כדי ליצור את עמודי הבסיס"
          />
        ) : (
          <ul className="divide-y divide-slate-50">
            {pages.map((page) => {
              const publicPath = publicPathForPage(page.slug);
              return (
                <li key={page.id}>
                  <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-blue/[0.03]">
                    <span aria-hidden className="inline-block w-6 shrink-0">
                      <AssetImage
                        asset={icons.notepad}
                        decorative
                        variant="flat"
                        className="w-full h-auto"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/pages/${page.slug}`}
                        className="font-bold hover:text-blue"
                      >
                        {page.title}
                      </Link>
                      <p className="text-xs text-muted">
                        <span dir="ltr">{publicPath ?? `/${page.slug}`}</span> · עודכן{" "}
                        {timeAgo(page.updated_at)}
                      </p>
                    </div>
                    <AdminStatusBadge status={page.status} />
                    {publicPath && (
                      <Link
                        href={publicPath}
                        target="_blank"
                        className="rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-slate-100"
                        title="צפייה באתר"
                      >
                        <span
                          className="inline-block w-5 shrink-0 align-middle"
                          aria-hidden
                        >
                          <AssetImage
                            asset={icons.eye}
                            decorative
                            variant="flat"
                            className="w-full h-auto"
                          />
                        </span>
                      </Link>
                    )}
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="rounded-full px-3 py-1.5 text-sm font-bold text-blue hover:bg-blue/10"
                    >
                      עריכה
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
