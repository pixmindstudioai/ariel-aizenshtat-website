/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AssetImage from "@/components/AssetImage";
import CTASection from "@/components/CTASection";
import GuideToc from "@/components/GuideToc";
import Reveal from "@/components/Reveal";
import SimpleContent from "@/components/SimpleContent";
import AudioPlayer from "@/components/media/AudioPlayer";
import { icons } from "@/data/assets";
import { getCurrentProfile } from "@/lib/auth";
import { fetchGuideRow } from "@/lib/cms";
import { formatDate } from "@/lib/format";
import { extractHeadings } from "@/lib/toc";

export const revalidate = 300;

interface GuidePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await fetchGuideRow(slug);
  if (!guide) return { title: "מדריך" };
  return {
    title: guide.seo_title || guide.title,
    description: guide.seo_description || guide.excerpt,
    ...(guide.cover_image ? { openGraph: { images: [guide.cover_image] } } : {}),
  };
}

const levelColors: Record<string, string> = {
  מתחילים: "bg-blue/10 text-blue",
  בינוני: "bg-purple/10 text-purple",
  מתקדמים: "bg-coral/15 text-coral",
};

export default async function GuidePage({ params, searchParams }: GuidePageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true" && !!(await getCurrentProfile());
  const guide = await fetchGuideRow(slug, isPreview);
  if (!guide || (!isPreview && guide.status !== "published")) notFound();

  const tocHeadings = guide.show_toc ? extractHeadings(guide.content) : [];

  return (
    <div className="flex flex-col gap-16 pb-8 md:gap-24">
      {isPreview && guide.status !== "published" && (
        <div className="bg-amber-100 px-4 py-2.5 text-center text-sm font-bold text-amber-800">
          <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
            <AssetImage asset={icons.eye} decorative variant="flat" className="w-full h-auto" />
          </span>{" "}
          תצוגה מקדימה — המדריך הזה עדיין לא פורסם
        </div>
      )}

      <article className="mx-auto w-full max-w-3xl px-4 pt-10 sm:px-6 lg:px-8">
        <nav aria-label="פירורי לחם" className="mb-6 text-sm font-semibold text-muted">
          <Link href="/guides" className="hover:text-blue">
            מדריכים כתובים
          </Link>
          <span aria-hidden> ‹ </span>
          <span className="text-ink">{guide.title}</span>
        </nav>

        <Reveal>
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {guide.tags[0] && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
                  {guide.tags[0]}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${levelColors[guide.level] ?? "bg-slate-100 text-muted"}`}
              >
                {guide.level}
              </span>
              <span className="text-muted">{guide.read_time} דקות קריאה</span>
              <span className="text-muted">· {formatDate(guide.created_at)}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">{guide.title}</h1>
            {guide.excerpt && (
              <p className="text-lg leading-relaxed text-muted md:text-xl">{guide.excerpt}</p>
            )}
          </header>
        </Reveal>

        {guide.cover_image && (
          <Reveal className="mt-10">
            <img
              src={guide.cover_image}
              alt={guide.title}
              className="w-full rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.15)]"
            />
          </Reveal>
        )}

        {guide.audio_url && (
          <Reveal className="mt-10">
            <section aria-label="סקירה קולית" className="flex flex-col gap-3">
              <p className="flex items-center gap-2 font-black">
                <span className="inline-block w-6 shrink-0" aria-hidden>
                  <AssetImage
                    asset={icons.videoPlay}
                    decorative
                    variant="flat"
                    className="w-full h-auto"
                  />
                </span>
                סקירה קולית — מעדיפים להאזין?
              </p>
              <AudioPlayer src={guide.audio_url} title={guide.title} />
            </section>
          </Reveal>
        )}

        {tocHeadings.length >= 2 && (
          <Reveal className="mt-10">
            <GuideToc headings={tocHeadings} />
          </Reveal>
        )}

        <Reveal className="mt-12">
          {guide.content ? (
            <SimpleContent content={guide.content} />
          ) : (
            <div className="card-soft flex flex-col items-center gap-3 p-10 text-center">
              <span className="inline-block w-14 shrink-0" aria-hidden>
                <AssetImage
                  asset={icons.notes}
                  decorative
                  variant="flat"
                  className="w-full h-auto"
                />
              </span>
              <p className="font-bold">המדריך המלא בדרך!</p>
              <p className="text-muted">
                התוכן נכתב ממש בימים אלה — בינתיים אפשר לשלוח לי שאלה ואשמח לעזור אישית.
              </p>
              <Link href="/contact" className="btn-secondary mt-2">
                יש לי שאלה ←
              </Link>
            </div>
          )}
        </Reveal>
      </article>

      <CTASection
        title="רוצים ליישם את זה בעסק שלכם?"
        subtitle="אם בא לכם ליווי אישי במקום ללמוד לבד — ספרו לי על הפרויקט ונצא לדרך."
      />
    </div>
  );
}
