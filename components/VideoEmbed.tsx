/**
 * עטיפת וידאו לתוכן האתר — מנגנת אך ורק קבצים מהאחסון שלנו,
 * דרך הנגן המותאם אישית. בלי YouTube / Vimeo / שירותי אחסון חיצוניים.
 * אם נשמרה בטעות כתובת חיצונית ישנה — מוצגת הודעה במקום נגן.
 */

import VideoPlayer from "@/components/media/VideoPlayer";
import { isExternalMediaUrl } from "@/lib/media";

interface VideoEmbedProps {
  url: string;
  title?: string;
  poster?: string;
}

export default function VideoEmbed({ url, title, poster }: VideoEmbedProps) {
  if (isExternalMediaUrl(url)) {
    return (
      <div
        className="grid aspect-video w-full place-items-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center"
        role="note"
      >
        <div className="flex max-w-md flex-col items-center gap-2">
          <span aria-hidden className="text-3xl">
            🎬
          </span>
          <p className="font-bold text-ink">הסרטון הזה עדיין לא הועבר לספריית המדיה שלנו</p>
          <p className="text-sm text-muted">
            הסרטונים באתר מנוגנים רק מהאחסון שלנו — העלו את קובץ הווידאו בממשק הניהול ובחרו אותו
            מספריית המדיה.
          </p>
        </div>
      </div>
    );
  }

  return <VideoPlayer src={url} title={title} poster={poster} />;
}
