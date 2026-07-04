import type { ActivityLogRow } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { icons, type AssetDef } from "@/data/assets";
import AssetImage from "@/components/AssetImage";

const ACTION_ICON: Record<string, AssetDef> = {
  created_project: icons.plus,
  updated_project: icons.pencil,
  published_project: icons.growth,
  unpublished_project: icons.inbox,
  archived_project: icons.dashboardFolder,
  deleted_project: icons.trash,
  duplicated_project: icons.notepad,
  reordered_projects: icons.dashboard,
  created_guide: icons.plus,
  updated_guide: icons.pencil,
  published_guide: icons.growth,
  unpublished_guide: icons.inbox,
  archived_guide: icons.dashboardFolder,
  deleted_guide: icons.trash,
  created_video_guide: icons.videoEdit,
  updated_video_guide: icons.pencil,
  published_video_guide: icons.growth,
  archived_video_guide: icons.dashboardFolder,
  updated_page: icons.browserPages,
  published_page: icons.growth,
  updated_settings: icons.settings,
  uploaded_media: icons.imageUpload,
  deleted_media: icons.trash,
  created_category: icons.notes,
  updated_category: icons.notes,
  deleted_category: icons.trash,
  updated_user_role: icons.usersGear,
  invited_user: icons.inbox,
};

interface AdminActivityFeedProps {
  items: ActivityLogRow[];
}

/** פיד פעילות אחרונה — מי עשה מה ומתי */
export default function AdminActivityFeed({ items }: AdminActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        עוד אין פעילות — ברגע שתתחילו לערוך תוכן, הכל יירשם כאן
      </p>
    );
  }

  return (
    <ol className="flex flex-col divide-y divide-slate-50">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 py-3">
          <span className="mt-0.5 inline-block w-5 shrink-0" aria-hidden>
            <AssetImage
              asset={ACTION_ICON[item.action] ?? icons.notepad}
              decorative
              variant="flat"
              className="w-full h-auto"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{item.description}</p>
            <p className="text-xs text-muted">
              {item.user?.full_name || item.user?.email || "מערכת"} · {timeAgo(item.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
