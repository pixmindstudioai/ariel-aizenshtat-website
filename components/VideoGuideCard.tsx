import Image from "next/image";
import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import StickerCard from "@/components/StickerCard";
import { badges } from "@/data/assets";
import type { VideoGuide } from "@/data/videoGuides";

const levelColors: Record<VideoGuide["level"], string> = {
  מתחילים: "bg-blue/10 text-blue",
  בינוני: "bg-purple/10 text-purple",
  מתקדמים: "bg-coral/15 text-coral",
};

interface VideoGuideCardProps {
  guide: VideoGuide;
}

/** כרטיס מדריך וידאו: "מסך" עם כפתור נגינה + פרטים — מקשר לעמוד הצפייה */
export default function VideoGuideCard({ guide }: VideoGuideCardProps) {
  return (
    <StickerCard className="group h-full overflow-hidden">
      <Link
        href={`/video-guides/${guide.slug}`}
        aria-label={`לצפייה במדריך: ${guide.title}`}
        className="block h-full rounded-[2rem] focus-visible:outline-3 focus-visible:outline-blue focus-visible:outline-offset-2"
      >
        <article className="flex h-full flex-col">
          <div
            className={`relative grid h-44 place-items-center overflow-hidden rounded-t-[2rem] bg-gradient-to-br ${guide.gradient}`}
          >
            {guide.thumbnail && (
              <Image
                src={guide.thumbnail}
                alt=""
                fill
                sizes="(max-width: 768px) 90vw, 30vw"
                className="object-cover"
                unoptimized
              />
            )}
            <span
              aria-hidden
              className="relative grid h-16 w-16 place-items-center rounded-full bg-white/90 pr-1 text-2xl text-ink shadow-lg transition-transform duration-300 group-hover:scale-110"
            >
              ▶
            </span>
            <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white">
              {guide.duration}
            </span>
            {guide.isNew && (
              <div className="absolute right-3 top-3 w-20">
                <AssetImage
                  asset={badges.newBadge}
                  alt="חדש"
                  variant="sticker-sm"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
                {guide.tag}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${levelColors[guide.level]}`}>
                {guide.level}
              </span>
            </div>
            <h3 className="text-xl font-extrabold leading-snug">{guide.title}</h3>
            <p className="flex-1 leading-relaxed text-muted">{guide.description}</p>
            <span className="font-bold text-blue">לצפייה ←</span>
          </div>
        </article>
      </Link>
    </StickerCard>
  );
}
