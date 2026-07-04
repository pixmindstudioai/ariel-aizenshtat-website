/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AssetImage from "@/components/AssetImage";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import SimpleContent from "@/components/SimpleContent";
import VideoEmbed from "@/components/VideoEmbed";
import { icons } from "@/data/assets";
import { categoryLabels, type ProjectCategory } from "@/data/projects";
import { getCurrentProfile } from "@/lib/auth";
import { fetchProjectRow } from "@/lib/cms";

export const revalidate = 300;

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectRow(slug);
  if (!project) return { title: "פרויקט" };
  return {
    title: project.seo_title || project.title,
    description: project.seo_description || project.excerpt,
    ...(project.cover_image ? { openGraph: { images: [project.cover_image] } } : {}),
  };
}

/** מצב תצוגה מקדימה — זמין רק לבעלי תפקיד בממשק הניהול */
async function resolvePreview(searchParams: ProjectPageProps["searchParams"]): Promise<boolean> {
  const { preview } = await searchParams;
  if (preview !== "true") return false;
  const profile = await getCurrentProfile();
  return !!profile;
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { slug } = await params;
  const isPreview = await resolvePreview(searchParams);
  const project = await fetchProjectRow(slug, isPreview);
  if (!project || (!isPreview && project.status !== "published")) notFound();

  const categorySlug = (project.category?.slug ?? "websites") as ProjectCategory;
  const categoryLabel =
    project.category?.name ?? categoryLabels[categorySlug] ?? "פרויקט";
  const gradient = project.gradient || "from-[#4f7bff] to-[#7c5cff]";
  const gallery: string[] = Array.isArray(project.gallery) ? project.gallery : [];

  return (
    <div className="flex flex-col gap-16 pb-8 md:gap-24">
      {isPreview && project.status !== "published" && (
        <div className="bg-amber-100 px-4 py-2.5 text-center text-sm font-bold text-amber-800">
          <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
            <AssetImage asset={icons.eye} decorative variant="flat" className="w-full h-auto" />
          </span>{" "}
          תצוגה מקדימה — הפרויקט הזה עדיין {project.status === "draft" ? "טיוטה" : "בארכיון"} ולא מוצג לגולשים
        </div>
      )}

      <article className="mx-auto w-full max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* פירורי לחם */}
        <nav aria-label="פירורי לחם" className="mb-6 text-sm font-semibold text-muted">
          <Link href="/portfolio" className="hover:text-blue">
            תיק עבודות
          </Link>
          <span aria-hidden> ‹ </span>
          <span className="text-ink">{project.title}</span>
        </nav>

        <Reveal>
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-blue/10 px-4 py-1.5 font-bold text-blue">
                {categoryLabel}
              </span>
              {project.year && <span className="font-semibold text-muted">{project.year}</span>}
              {project.client_name && (
                <span className="font-semibold text-muted">· {project.client_name}</span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">{project.title}</h1>
            {(project.description || project.excerpt) && (
              <p className="max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
                {project.description || project.excerpt}
              </p>
            )}
            {project.result && (
              <p className="self-start rounded-2xl bg-blue/5 px-5 py-3 font-bold text-ink">
                <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                  <AssetImage asset={icons.analytics} decorative variant="flat" className="w-full h-auto" />
                </span>{" "}
                {project.result}
              </p>
            )}
          </header>
        </Reveal>

        {/* ויזואל ראשי: וידאו > קאבר > גרדיאנט */}
        <Reveal className="mt-10">
          {project.video_url ? (
            <VideoEmbed url={project.video_url} title={project.title} />
          ) : project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.15)]"
            />
          ) : (
            <div
              aria-hidden
              className={`grid aspect-[2/1] w-full place-items-center rounded-[2rem] bg-gradient-to-br ${gradient}`}
            >
              <span className="grid h-20 w-20 place-items-center rounded-full bg-white/90 shadow-lg">
                <span className="inline-block w-14" aria-hidden>
                  <AssetImage
                    asset={
                      categorySlug === "video"
                        ? icons.videoEdit
                        : categorySlug === "automation"
                          ? icons.settings
                          : icons.browserPages
                    }
                    decorative
                    variant="flat"
                    className="w-full h-auto"
                  />
                </span>
              </span>
            </div>
          )}
        </Reveal>

        {/* תוכן עשיר */}
        {project.content && (
          <Reveal className="mt-12">
            <SimpleContent content={project.content} />
          </Reveal>
        )}

        {/* גלריה */}
        {gallery.length > 0 && (
          <Reveal className="mt-12">
            <h2 className="mb-5 text-2xl font-black">הצצה לפרויקט</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.map((image, i) => (
                <img
                  key={image + i}
                  src={image}
                  alt={`${project.title} — תמונה ${i + 1}`}
                  loading="lazy"
                  className="w-full rounded-3xl shadow-[0_14px_35px_rgba(15,23,42,0.12)]"
                />
              ))}
            </div>
          </Reveal>
        )}

        {/* כלים ותגיות */}
        {(project.tools.length > 0 || project.tags.length > 0) && (
          <Reveal className="mt-12 flex flex-col gap-5">
            {project.tools.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-extrabold">
                  <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
                    <AssetImage asset={icons.settings} decorative variant="flat" className="w-full h-auto" />
                  </span>{" "}
                  כלים בפרויקט
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <li key={tool} className="rounded-full bg-purple/10 px-4 py-1.5 text-sm font-bold text-purple">
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-muted">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        )}

        {project.external_url && (
          <Reveal className="mt-10">
            <a
              href={project.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg"
            >
              לצפייה בפרויקט החי ←
            </a>
          </Reveal>
        )}
      </article>

      <CTASection
        title="רוצים פרויקט כזה משלכם?"
        subtitle="ספרו לי מה אתם צריכים — ונבנה יחד את הפרויקט הבא בתיק."
      />
    </div>
  );
}
