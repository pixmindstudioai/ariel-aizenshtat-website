import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AssetImage from "@/components/AssetImage";
import CTASection from "@/components/CTASection";
import Reveal from "@/components/Reveal";
import SimpleContent from "@/components/SimpleContent";
import VideoEmbed from "@/components/VideoEmbed";
import { icons } from "@/data/assets";
import { getCurrentProfile } from "@/lib/auth";
import { fetchVideoGuideRow } from "@/lib/cms";

export const revalidate = 300;

interface VideoGuidePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: VideoGuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await fetchVideoGuideRow(slug);
  if (!video) return { title: "מדריך וידאו" };
  return {
    title: video.seo_title || video.title,
    description: video.seo_description || video.excerpt,
    ...(video.thumbnail ? { openGraph: { images: [video.thumbnail] } } : {}),
  };
}

const levelColors: Record<string, string> = {
  מתחילים: "bg-blue/10 text-blue",
  בינוני: "bg-purple/10 text-purple",
  מתקדמים: "bg-coral/15 text-coral",
};

export default async function VideoGuidePage({ params, searchParams }: VideoGuidePageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true" && !!(await getCurrentProfile());
  const video = await fetchVideoGuideRow(slug, isPreview);
  if (!video || (!isPreview && video.status !== "published")) notFound();

  const gradient = video.gradient || "from-[#4f7bff] to-[#7c5cff]";

  return (
    <div className="flex flex-col gap-16 pb-8 md:gap-24">
      {isPreview && video.status !== "published" && (
        <div className="bg-amber-100 px-4 py-2.5 text-center text-sm font-bold text-amber-800">
          <span className="me-1.5 inline-block w-5 shrink-0 align-middle" aria-hidden>
            <AssetImage asset={icons.eye} decorative variant="flat" className="w-full h-auto" />
          </span>
          תצוגה מקדימה — מדריך הווידאו הזה עדיין לא פורסם
        </div>
      )}

      <article className="mx-auto w-full max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        <nav aria-label="פירורי לחם" className="mb-6 text-sm font-semibold text-muted">
          <Link href="/video-guides" className="hover:text-blue">
            מדריכי וידאו
          </Link>
          <span aria-hidden> ‹ </span>
          <span className="text-ink">{video.title}</span>
        </nav>

        <Reveal>
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {video.tags[0] && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
                  {video.tags[0]}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${levelColors[video.level] ?? "bg-slate-100 text-muted"}`}
              >
                {video.level}
              </span>
              {video.duration && (
                <span className="text-muted" dir="ltr">
                  {video.duration}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">{video.title}</h1>
            {video.excerpt && (
              <p className="text-lg leading-relaxed text-muted md:text-xl">{video.excerpt}</p>
            )}
          </header>
        </Reveal>

        <Reveal className="mt-10">
          {video.video_url ? (
            <VideoEmbed url={video.video_url} title={video.title} />
          ) : (
            <div
              aria-hidden
              className={`grid aspect-video w-full place-items-center rounded-[2rem] bg-gradient-to-br ${gradient}`}
            >
              <div className="flex flex-col items-center gap-3 text-white">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white/90 pr-1 text-3xl text-ink shadow-lg">
                  ▶
                </span>
                <span className="font-bold">ההקלטה תעלה ממש בקרוב</span>
              </div>
            </div>
          )}
        </Reveal>

        {video.description && (
          <Reveal className="mt-12">
            <h2 className="mb-4 text-2xl font-black">על השיעור</h2>
            <SimpleContent content={video.description} />
          </Reveal>
        )}
      </article>

      <CTASection
        title="רוצים שאלמד את זה אצלכם?"
        subtitle="סדנאות והדרכות חיות בהתאמה אישית — ספרו לי מה מעניין אתכם."
      />
    </div>
  );
}
