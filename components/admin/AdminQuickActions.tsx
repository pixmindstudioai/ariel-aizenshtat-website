import Link from "next/link";
import AdminAssetImage from "@/components/admin/AdminAssetImage";
import { adminAssets } from "@/data/adminAssets";

/** פעולות מהירות בדאשבורד — כפתורי אסטים גרפיים */
export default function AdminQuickActions() {
  const actions = [
    { asset: adminAssets.addProjectButton, href: "/admin/projects/new", label: "הוספת פרויקט" },
    { asset: adminAssets.addGuideButton, href: "/admin/guides/new", label: "הוספת מדריך" },
    { asset: adminAssets.videoGuidesTitle, href: "/admin/video-guides/new", label: "הוספת מדריך וידאו" },
    { asset: adminAssets.mediaUpload, href: "/admin/media", label: "העלאת מדיה" },
    { asset: adminAssets.contentEditing, href: "/admin/pages/home", label: "עריכת עמוד הבית" },
    { asset: adminAssets.previewBadge, href: "/", label: "צפייה באתר", external: true },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {actions.map((action) => (
        <li key={action.href + action.label}>
          <Link
            href={action.href}
            target={action.external ? "_blank" : undefined}
            className="group flex h-full flex-col items-center gap-2 rounded-3xl border border-[#EEF2FF] bg-white p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(79,123,255,0.14)]"
          >
            <div className="h-14 w-full max-w-36">
              <AdminAssetImage
                asset={action.asset}
                decorative
                className="h-full w-full transition-transform duration-200 group-hover:scale-[1.04]"
                sizes="150px"
              />
            </div>
            <span className="text-sm font-bold">{action.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
