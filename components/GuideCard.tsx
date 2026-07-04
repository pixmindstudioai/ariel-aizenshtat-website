import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import StickerCard from "@/components/StickerCard";
import { badges, icons } from "@/data/assets";
import type { Guide } from "@/data/guides";

const levelColors: Record<Guide["level"], string> = {
  מתחילים: "bg-blue/10 text-blue",
  בינוני: "bg-purple/10 text-purple",
  מתקדמים: "bg-coral/15 text-coral",
};

interface GuideCardProps {
  guide: Guide;
}

/** כרטיס מדריך כתוב — מקשר לעמוד המדריך המלא */
export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <StickerCard className="relative h-full">
      <Link
        href={`/guides/${guide.slug}`}
        aria-label={`לקריאת המדריך: ${guide.title}`}
        className="block h-full rounded-[2rem] focus-visible:outline-3 focus-visible:outline-blue focus-visible:outline-offset-2"
      >
        <article className="flex h-full flex-col gap-3 p-7">
          {guide.isNew && (
            <div className="absolute -top-4 left-5 w-20 rotate-[-6deg]">
              <AssetImage
                asset={badges.newBadge}
                alt="חדש"
                variant="sticker-sm"
                className="w-full h-auto"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-11 shrink-0" aria-hidden>
              <AssetImage
                asset={icons.pencil}
                decorative
                variant="sticker-sm"
                className="w-full h-auto"
              />
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
              {guide.tag}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${levelColors[guide.level]}`}>
              {guide.level}
            </span>
          </div>
          <h3 className="text-xl font-extrabold leading-snug">{guide.title}</h3>
          <p className="flex-1 leading-relaxed text-muted">{guide.description}</p>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-muted">
            <span>{guide.readingTime} דקות קריאה</span>
            <span className="font-bold text-blue">לקריאה ←</span>
          </div>
        </article>
      </Link>
    </StickerCard>
  );
}
