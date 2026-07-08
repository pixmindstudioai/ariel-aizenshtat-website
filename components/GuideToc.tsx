import { icons } from "@/data/assets";
import AssetImage from "@/components/AssetImage";
import type { TocHeading } from "@/lib/toc";

interface GuideTocProps {
  headings: TocHeading[];
}

/** תוכן עניינים למדריך כתוב — נבנה אוטומטית מכותרות התוכן (## / ###) */
export default function GuideToc({ headings }: GuideTocProps) {
  if (headings.length < 2) return null;

  return (
    <nav aria-label="תוכן עניינים" className="card-soft overflow-guard p-6 md:p-8">
      <p className="mb-4 flex items-center gap-2 text-lg font-black">
        <span className="inline-block w-6 shrink-0" aria-hidden>
          <AssetImage asset={icons.notes} decorative variant="flat" className="w-full h-auto" />
        </span>
        תוכן עניינים
      </p>
      <ol className="flex flex-col gap-2">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pr-5" : ""}>
            <a
              href={`#${heading.id}`}
              className={`inline-flex min-w-0 items-start gap-2 break-words font-bold underline-offset-4 transition-colors hover:text-blue hover:underline ${
                heading.level === 3 ? "text-sm text-muted" : "text-ink"
              }`}
            >
              <span aria-hidden className="mt-0.5 text-blue">
                {heading.level === 3 ? "·" : "←"}
              </span>
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
