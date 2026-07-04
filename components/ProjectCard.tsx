import Image from "next/image";
import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import StickerCard from "@/components/StickerCard";
import { badges, browserCards, codeCards, icons } from "@/data/assets";
import type { Project } from "@/data/projects";
import { categoryLabels } from "@/data/projects";

/** אסט דקורטיבי מייצג לכל קטגוריה — מוצג בתוך אזור התצוגה של הכרטיס */
const categoryAsset: Record<Project["category"], { src: typeof browserCards.browserWindow; width: number }> = {
  websites: { src: browserCards.browserWindow, width: 150 },
  automation: { src: codeCards.codeEditorWindow, width: 150 },
  video: { src: codeCards.codeEditorWindow, width: 0 }, // וידאו: כפתור Play מצויר ב-CSS
};

interface ProjectCardProps {
  project: Project;
}

/** כרטיס פרויקט: תמונת קאבר (מהדאטהבייס) או "מסך" גרדיאנט + פרטי הפרויקט */
export default function ProjectCard({ project }: ProjectCardProps) {
  const catAsset = categoryAsset[project.category];
  return (
    <StickerCard className="group h-full overflow-hidden">
      <Link
        href={`/portfolio/${project.slug}`}
        aria-label={`לעמוד הפרויקט: ${project.title}`}
        className="block h-full rounded-[2rem] focus-visible:outline-3 focus-visible:outline-blue focus-visible:outline-offset-2"
      >
        <article className="flex h-full flex-col">
          {/* אזור תצוגה */}
          <div
            className={`relative grid h-48 place-items-center overflow-hidden rounded-t-[2rem] bg-gradient-to-br ${project.gradient}`}
          >
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt=""
                fill
                sizes="(max-width: 768px) 90vw, 30vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            ) : project.category === "video" ? (
              <span
                aria-hidden
                className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-2xl text-ink shadow-lg transition-transform duration-300 group-hover:scale-110"
              >
                ▶
              </span>
            ) : (
              <div className="w-36 transition-transform duration-300 group-hover:scale-105">
                <AssetImage
                  asset={catAsset.src}
                  decorative
                  variant="flat"
                  className="w-full h-auto drop-shadow-xl"
                />
              </div>
            )}
            {project.isNew && (
              <div className="absolute left-3 top-3 w-20">
                <AssetImage
                  asset={badges.newBadge}
                  alt="חדש"
                  variant="sticker-sm"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* תוכן */}
          <div className="flex flex-1 flex-col gap-3 p-6">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-bold text-blue">
                {project.categoryLabel ?? categoryLabels[project.category]}
              </span>
              <span className="text-muted">{project.year}</span>
            </div>
            <h3 className="text-xl font-extrabold leading-snug">{project.title}</h3>
            <p className="leading-relaxed text-muted">{project.description}</p>
            {project.result && (
              <p className="rounded-2xl bg-blue/5 px-4 py-2.5 text-sm font-semibold text-ink">
                <span className="inline-block w-5 shrink-0 align-middle ms-0 me-1.5" aria-hidden>
                  <AssetImage asset={icons.analytics} decorative variant="flat" className="w-full h-auto" />
                </span>
                {project.result}
              </p>
            )}
            <ul className="mt-auto flex flex-wrap gap-2 pt-1">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </Link>
    </StickerCard>
  );
}
