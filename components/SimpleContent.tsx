/**
 * מרנדר תוכן טקסטואלי מהאדמין (התחביר של AdminRichTextEditor):
 * ‎## כותרת · ‎### תת-כותרת · ‎- רשימה · שורה ריקה = פסקה ·
 * ‎![alt](url) תמונה · ‎@video(url) וידאו · ‎@audio(url) אודיו ·
 * [טקסט](url) קישור בתוך פסקה.
 * כל המדיה מנוגנת בנגנים המותאמים שלנו — מקבצים באחסון שלנו בלבד.
 */

import VideoEmbed from "@/components/VideoEmbed";
import AudioPlayer from "@/components/media/AudioPlayer";
import ContentImage from "@/components/media/ContentImage";

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const VIDEO_RE = /^@video\(([^)]+)\)$/;
const AUDIO_RE = /^@audio\(([^)]+)\)$/;
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]*)\)/g;

/** קישורים בתוך שורת טקסט */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    nodes.push(
      <a
        key={index}
        href={match[2]}
        target={match[2].startsWith("/") ? undefined : "_blank"}
        rel="noopener noreferrer"
        className="font-semibold text-blue underline-offset-4 hover:underline"
      >
        {match[1]}
      </a>
    );
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/**
 * ניקוי בסיסי ל-HTML מהעורך — התוכן נכתב רק ע"י צוות מורשה (RLS),
 * אבל בכל זאת מסירים סקריפטים, event handlers ו-javascript URLs.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

/** עיצוב תוכן HTML מהעורך העשיר (Tiptap) בשפת האתר */
const richHtmlClasses = [
  "flex flex-col leading-relaxed",
  "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-black",
  "[&_h3]:mt-2 [&_h3]:mb-1.5 [&_h3]:text-xl [&_h3]:font-extrabold",
  "[&_p]:mb-4 [&_p]:text-lg [&_p]:text-ink/90",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pr-6",
  "[&_li]:mb-1.5 [&_li]:text-lg [&_li]:text-ink/90 [&_li::marker]:text-blue",
  "[&_a]:font-semibold [&_a]:text-blue [&_a]:underline-offset-4 hover:[&_a]:underline",
  "[&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-3xl",
  "[&_video]:my-3 [&_video]:w-full [&_video]:rounded-3xl [&_audio]:my-3 [&_audio]:w-full",
  "[&_blockquote]:my-4 [&_blockquote]:border-r-4 [&_blockquote]:border-blue/40 [&_blockquote]:pr-4 [&_blockquote]:italic [&_blockquote]:text-muted",
].join(" ");

interface SimpleContentProps {
  content: string;
  className?: string;
}

export default function SimpleContent({ content, className = "" }: SimpleContentProps) {
  // תוכן חדש מהעורך העשיר נשמר כ-HTML; תוכן ישן נשאר בתחביר הקליל
  if (content.trimStart().startsWith("<")) {
    return (
      <div
        dir="rtl"
        className={`${richHtmlClasses} ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }

  const blocks = content
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) return null;

  return (
    <div className={`flex flex-col gap-5 leading-relaxed ${className}`}>
      {blocks.map((block, i) => {
        if (block.startsWith("### ")) {
          return (
            <h3 key={i} className="mt-2 text-xl font-extrabold">
              {block.slice(4)}
            </h3>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="mt-4 text-2xl font-black">
              {block.slice(3)}
            </h2>
          );
        }

        const imageMatch = block.match(IMAGE_RE);
        if (imageMatch) {
          return <ContentImage key={i} src={imageMatch[2]} alt={imageMatch[1]} />;
        }

        const videoMatch = block.match(VIDEO_RE);
        if (videoMatch) {
          return <VideoEmbed key={i} url={videoMatch[1]} />;
        }

        const audioMatch = block.match(AUDIO_RE);
        if (audioMatch) {
          return <AudioPlayer key={i} src={audioMatch[1]} />;
        }

        const lines = block.split("\n");
        if (lines.every((line) => line.trim().startsWith("- "))) {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1.5 pr-6 marker:text-blue">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="text-lg text-ink/90">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
